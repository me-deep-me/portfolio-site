"""
main.py

Entry point principale per CLI e GUI del sistema di nesting.
"""

import sys
import argparse
import pathlib
import pandas as pd

from config import log, CONCISE_FILTER
from data_io import read_panels
from packing import heuristic_pack
from ordering import build_run_order_cnc2
from geometry import prepare_output_dirs
from crate_packing import propose_crates
from export_xlsx import (write_outputs, write_sheet_summary, 
                         export_machine_xlsx, write_packaging_xlsx, _job_xlsx_path)
from export_dxf import export_dxf_per_sheet, export_dxf_all
from export_3d import export_ifc_packing, export_glb_packing, export_png_exploded_3d_min
from visualization import export_png_layouts


def ensure_rectpack_available():
    """Verifica che rectpack sia installato."""
    try:
        import rectpack  # noqa: F401
        return True
    except Exception as e:
        msg = ("Rectpack non è installato.\n\n"
               "Installa con:\n"
               "  python -m pip install rectpack\n\n"
               f"Dettagli: {e}")
        try:
            from tkinter import messagebox
            messagebox.showerror("Dipendenza mancante: rectpack", msg)
        except Exception:
            pass
        log.error(msg)
        return False


def run_with_namespace(args_ns):
    """
    Esegue l'intera pipeline di nesting.
    Questa funzione è condivisa tra CLI e GUI.
    """
    if not ensure_rectpack_available():
        return

    # ====== LETTURA PANNELLI ======
    panels, panel_ids, panel_numbers = read_panels(args_ns.file)
    W, H = map(int, args_ns.sheet)
    kerf = args_ns.kerf
    rotate = not args_ns.no_rotate

    # ====== INOX RULE: incremento dimensioni PRIMA del nesting ======
    if getattr(args_ns, "inox_adjust", False):
        log.info("🧩 Modalità INOX: applico incremento +90mm (width) e +30mm (height) a TUTTI i pannelli.")
        panels = [(w + 90.0, h + 30.0) for (w, h) in panels]
        log.info(f"   ➜ Esempio primo pannello DOPO incremento: {panels[0][0]}x{panels[0][1]} mm")

    # ====== PACKING: scegli il migliore tra rotate on/off ======
    results = []
    for test_rotate in ([True] if rotate else [False]):
        r = heuristic_pack(panels, panel_ids, panel_numbers, W, H, kerf, test_rotate)
        results.append((len(set(rr.sheet for rr in r)), r))
    if rotate:
        r = heuristic_pack(panels, panel_ids, panel_numbers, W, H, kerf, False)
        results.append((len(set(rr.sheet for rr in r)), r))

    rows = min(results, key=lambda x: x[0])[1]
    base_sheets = len({r.sheet for r in rows})
    log.info(f"📦 Packing completato: {len(panels)} pannelli → {base_sheets} lastre")
    log.info(f"🧪 Baseline sheets: {base_sheets}")

    # ====== SETUP OUTPUT ======
    out_dirs = prepare_output_dirs(args_ns.out)
    run_order = build_run_order_cnc2(rows, order=args_ns.id_order)

    # Per compatibilità: niente CSV richiesti
    sheet_order_csv = None
    right_desc = None

    # ====== MATERIALE E SPESSORE ======
    material = getattr(args_ns, "material", "hpl")
    pt_gui = getattr(args_ns, "panel_thickness", None)
    try:
        pt_gui = float(str(pt_gui).replace(",", ".")) if pt_gui not in (None, "") else None
    except Exception:
        pt_gui = None
    
    default_by_mat = {
        "hpl": 12.0,
        "corian": 12.0,
        "inox": 2.0,
        "corian_grecato": 18.0
    }
    thickness_mm = pt_gui if pt_gui is not None else default_by_mat.get(material, 12.0)

    # Sanity check
    assert len({r.sheet for r in rows}) == base_sheets, "Post-processing ha alterato il numero di lastre!"

    # ====== WORKBOOK UNICO XLSX ======
    job_xlsx = _job_xlsx_path(args_ns.out, out_dirs)
    try:
        writer = pd.ExcelWriter(job_xlsx, engine="xlsxwriter")
        _fmt_engine = "xlsxwriter"
    except Exception:
        writer = pd.ExcelWriter(job_xlsx, engine="openpyxl")
        _fmt_engine = "openpyxl"

    with writer:
        # LAYOUT
        write_outputs(rows, args_ns.out, run_order=run_order, out_dirs=out_dirs, writer=writer)
        # SHEETS
        write_sheet_summary(rows, args_ns.out, W=W, H=H, run_order=run_order, 
                           out_dirs=out_dirs, writer=writer)
        # MACHINE
        export_machine_xlsx(rows, args_ns.out, run_order=run_order, 
                           out_dirs=out_dirs, writer=writer)
        # PACKAGING
        max_crate_kg = float(getattr(args_ns, "max_crate_kg", 1200.0))
        crates = propose_crates(rows, run_order, W, H, material, max_crate_kg)
        write_packaging_xlsx(args_ns.out, out_dirs, crates, writer=writer)

    print(f"📒 Workbook unico: {job_xlsx} (engine: {_fmt_engine})")

    # ====== DXF EXPORT ======
    export_dxf_per_sheet(rows, args_ns.out, W=W, H=H, run_order=run_order, out_dirs=out_dirs)
    
    # DXF ALL-in-one (colonna)
    export_dxf_all(
        rows, args_ns.out, W=W, H=H,
        run_order=run_order,
        out_dirs=out_dirs,
        sheet_order_from_csv=sheet_order_csv if sheet_order_csv else None,
        right_desc=right_desc if right_desc else None,
        gap=120,
        show_panel_labels=False
    )

    # ====== PNG VISUALIZZAZIONE (opzionale) ======
    if args_ns.visualise:
        export_png_layouts(rows, args_ns.out, W, H, run_order, out_dirs, dpi=150)

    # ====== EXPORT 3D ======
    already_ifc = False
    already_glb = False

    # IFC (solo se richiesto dalla GUI/CLI)
    if bool(getattr(args_ns, "export_ifc", False)) and not already_ifc:
        try:
            export_ifc_packing(
                rows=rows,
                run_order=run_order,
                W=W, H=H,
                crates=crates,
                out_dirs=out_dirs,
                prefix=args_ns.out,
                thickness_mm=thickness_mm,
                material=material
            )
            already_ifc = True
        except Exception as e:
            log.warning(f"⚠️ Export IFC fallito: {e}")

    # GLB per Blender (sempre, o lascia solo se vuoi forzarlo)
    if not already_glb:
        try:
            export_glb_packing(
                rows=rows, run_order=run_order, W=W, H=H, crates=crates,
                out_dirs=out_dirs, prefix=args_ns.out, thickness_mm=thickness_mm, material=material,
                grid_cols=4,
                crate_gap_mm=800.0,
                level_gap_mm=100.0,
                panel_spread_pct=0.12,
                panel_gap_mm=5.0,
                micro_lift_mm=0.2,
                add_cameras=True
            )
            already_glb = True
        except Exception as e:
            log.warning(f"⚠️ Export GLB fallito: {e}")

    # === PNG ESPLOSI 3D — overview + grid 2×2 per cassa (senza etichette) ===
    try:
        export_png_exploded_3d_min(
            rows=rows,
            crates=crates,
            W=W, H=H,
            out_dirs=out_dirs,
            prefix=args_ns.out,
            thickness_mm=thickness_mm,
            explode_gap_z=100.0,
            sep_in_stack=5.0,
            level_offset_xy=80.0,
            edge_alpha=0.45,
            face_alpha=0.92,
            line_w=0.5,
            draw_sheet_frame=True,
            draw_crate_bbox=False,
            draw_shadows=True,
            draw_level_labels=False,
            draw_connectors=True,
            dpi=300,
            zoom=1.30
        )
    except Exception as e:
        log.warning(f"⚠️ Impossibile generare i PNG esplosi 3D: {e} (il resto del job è completato)")

    # Sempre o come fallback: GLB per Blender (duplicato intenzionale per robustezza)
    if not already_glb:
        try:
            export_glb_packing(
                rows=rows,
                run_order=run_order,
                W=W, H=H,
                crates=crates,
                out_dirs=out_dirs,
                prefix=args_ns.out,
                thickness_mm=thickness_mm,
                material=material
            )
        except Exception as e:
            log.warning(f"⚠️ Export GLB fallito: {e}")


def main():
    """Entry point principale."""
    ap = argparse.ArgumentParser()
    ap.add_argument("--gui", action="store_true", help="Avvia interfaccia grafica.")
    ap.add_argument("file", nargs="?", type=pathlib.Path, help="File input (Excel)")
    ap.add_argument("--mode", choices=["heuristic"], default="heuristic")
    ap.add_argument("--sheet", nargs=2, type=float, default=[930, 3000])
    ap.add_argument("--kerf", type=float, default=4)
    ap.add_argument("--no-rotate", action="store_true")
    ap.add_argument("--visualise", action="store_true")
    ap.add_argument("--out", default="result")
    ap.add_argument("--group-run", action="store_true",
                    help="Crea l'ordine di lavorazione per CNC.")
    ap.add_argument("--id-order", choices=["asc", "desc"], default="asc",
                    help="Ordinamento panel_number (default: asc).")
    ap.add_argument("--timeout", type=int, default=300)
    ap.add_argument("--material", 
                    choices=["hpl","corian","inox","corian_grecato"], 
                    default="hpl",
                    help="Materiale per calcolo pesi (default: hpl).")
    ap.add_argument("--max-crate-kg", type=float, default=1200.0,
                    help="Peso massimo per cassa (kg). Default 1200.")
    ap.add_argument("--export-ifc", action="store_true",
                    help="Esporta modello 3D IFC.")
    ap.add_argument("--panel-thickness", type=float, default=None,
                    help="Spessore pannelli per 3D (mm).")
    ap.add_argument("--verbose-log", action="store_true",
                    help="Mostra log dettagliati.")

    args = ap.parse_args()
    if not hasattr(args, "panel_thickness"):
        args.panel_thickness = None

    # Abilita/disabilita filtro sintetico
    try:
        CONCISE_FILTER.enabled = not bool(args.verbose_log)
    except Exception:
        pass

    # Regole avvio: GUI se --gui o nessun arg
    if args.gui or (args.file is None and len(sys.argv) == 1):
        from gui import gui_main
        gui_main()
        return

    # CLI
    if args.file is None:
        ap.error("manca il file di input")
    
    run_with_namespace(args)


if __name__ == "__main__":
    main()