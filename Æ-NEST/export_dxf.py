"""
export_dxf.py

Export in formato DXF (per singola lastra e ALL-in-one).
"""

import os
import datetime as _dt
from typing import List, Dict
from collections import defaultdict, Counter

from config import log
from geometry import LayoutRow, sort_parts_within_sheet, _safe_num


def _build_color_map_for_ids(all_ids):
    """Mappa deterministica panel_id -> colore ACI."""
    aci_palette = [1, 5, 3, 2, 4, 6, 7, 30, 140, 200]
    unique = sorted(set(all_ids), key=str)
    return {pid: aci_palette[i % len(aci_palette)] for i, pid in enumerate(unique)}


def _place_center_label(msp, label_lines, cx, cy, h, layer="LABELS", 
                        color=None, line_spacing=1.15, panel_box=None):
    """Posiziona etichetta centrata nel pannello."""
    if isinstance(label_lines, str):
        label_lines = [label_lines]

    max_len = max(len(s) for s in label_lines) if label_lines else 1
    
    if panel_box:
        x0, y0, x1, y1 = panel_box
        wbox, hbox = (x1 - x0), (y1 - y0)
        max_h_by_width = (wbox / max(1, (0.6 * max_len)))
        needed_h_total = h * (len(label_lines) + (len(label_lines)-1)*(line_spacing-1))
        scale_v = hbox / max(1e-6, needed_h_total)
        h = max(4.0, min(h, max_h_by_width, h * scale_v))

    # Prova MTEXT
    try:
        from ezdxf.lldxf import const as ezconst
        txt = r"\P".join(label_lines)
        dxfattrs = {"char_height": h, "layer": layer}
        if color is not None:
            dxfattrs["color"] = color
        mtx = msp.add_mtext(txt, dxfattribs=dxfattrs)
        mtx.set_location((cx, cy), align=ezconst.MTEXT_MIDDLE_CENTER)
        return
    except Exception:
        pass

    # Fallback: TEXT multipli
    try:
        total_h = h * (len(label_lines) + (len(label_lines)-1)*(line_spacing-1))
        top_y = cy - total_h/2.0 + h/2.0
        for i, line in enumerate(label_lines):
            y = top_y + i * h * line_spacing
            dxfattrs = {"height": h, "layer": layer}
            if color is not None:
                dxfattrs["color"] = color
            t = msp.add_text(line, dxfattribs=dxfattrs)
            t.dxf.halign = 1
            t.dxf.valign = 2
            t.dxf.align_point = (cx, y)
            t.dxf.insert = (cx, y)
    except Exception:
        log.warning("⚠️ Etichetta DXF non posizionata")


def export_dxf_per_sheet(rows: List[LayoutRow], prefix: str, W: int, H: int,
                         run_order: List[int] = None, out_dirs: Dict[str, str] = None):
    """Genera 1 DXF per lastra con etichette centrate."""
    try:
        import ezdxf
    except Exception:
        log.warning("⚠️ ezdxf non installato. Salto export DXF.")
        return

    by_sheet: Dict[int, List[LayoutRow]] = defaultdict(list)
    for r in rows:
        by_sheet[r.sheet].append(r)

    run_pos = {s: i + 1 for i, s in enumerate(run_order)} if run_order else {}
    ordered_sheets = list(reversed(run_order)) if run_order else sorted(by_sheet.keys(), reverse=True)

    dxf_dir = out_dirs["dxf"] if out_dirs else "."
    base = os.path.basename(prefix)

    all_ids = [r.panel_id for r in rows]
    id_colors = _build_color_map_for_ids(all_ids)

    failed = []

    for s in ordered_sheets:
        parts = sort_parts_within_sheet(by_sheet[s])

        doc = ezdxf.new(setup=True)
        doc.header["$INSUNITS"] = 4  # mm
        msp = doc.modelspace()

        if "CUT" not in doc.layers:
            doc.layers.add("CUT", color=1)
        if "LABELS" not in doc.layers:
            doc.layers.add("LABELS", color=7)
        if "lastra" not in doc.layers:
            doc.layers.add("lastra", color=7)

        # Bordo lastra
        msp.add_lwpolyline(
            [(0, 0), (W, 0), (W, H), (0, H), (0, 0)],
            dxfattribs={"layer": "lastra"},
        )

        # Pannelli
        for p in parts:
            x0, y0 = p.x, p.y
            x1, y1 = p.x + p.width, p.y + p.height

            msp.add_lwpolyline(
                [(x0, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0)],
                dxfattribs={"layer": "CUT", "color": id_colors.get(p.panel_id, 1)},
            )

            cx, cy = p.x + p.width / 2.0, p.y + p.height / 2.0
            h = max(10.0, min(p.width, p.height) / 10.0)
            label_lines = [
                f"{p.panel_id}-{p.panel_number}",
                f"{int(round(p.width))}x{int(round(p.height))}" + (" (R)" if p.rotated else ""),
            ]

            _place_center_label(
                msp, label_lines, cx, cy, h,
                layer="LABELS",
                color=id_colors.get(p.panel_id, 1),
                panel_box=(x0, y0, x1, y1),
            )

        # Cleanup testi fuori lastra
        panel_boxes = [(p.x, p.y, p.x + p.width, p.y + p.height) for p in parts]
        
        def _inside_sheet(pt):
            x, y = pt
            return (0 <= x <= W) and (0 <= y <= H)

        def _inside_any_panel(pt):
            x, y = pt
            for (x0, y0, x1, y1) in panel_boxes:
                if x0 <= x <= x1 and y0 <= y <= y1:
                    return True
            return False

        for e in list(msp.query("TEXT MTEXT")):
            try:
                ins = getattr(e.dxf, "insert", None) or getattr(e, "insert", None)
                if ins is None:
                    msp.delete_entity(e)
                    continue
                x_ins, y_ins = float(ins[0]), float(ins[1])
                if (y_ins < 0) or (not _inside_sheet((x_ins, y_ins))) or (not _inside_any_panel((x_ins, y_ins))):
                    msp.delete_entity(e)
            except Exception:
                pass

        # Salvataggio
        rpfx = f"RUN{run_pos.get(s, s):03d}_" if run_order else ""
        name = os.path.join(dxf_dir, f"{rpfx}{base}_sheet{s:03d}.dxf")

        try:
            doc.saveas(name)
        except (PermissionError, OSError) as e:
            try:
                ts = _dt.datetime.now().strftime("%Y%m%d_%H%M%S")
                alt = os.path.join(dxf_dir, f"{rpfx}{base}_sheet{s:03d}_{ts}.dxf")
                doc.saveas(alt)
            except Exception as e2:
                failed.append((s, f"{e} | fallback_failed: {e2}"))

    if failed:
        log.warning("⚠️ Alcuni DXF per lastra NON sono stati creati:")
        for s, msg in failed:
            log.warning(f"  - sheet {s}: {msg}")


def _unique_preserve(seq):
    """Rimuove duplicati preservando l'ordine."""
    seen = set()
    out = []
    for x in seq:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out


def export_dxf_all(rows: List[LayoutRow], prefix: str, W: int, H: int,
                   run_order: List[int], out_dirs: Dict[str, str],
                   sheet_order_from_csv: List[int] = None,
                   right_desc: Dict[int, str] = None,
                   gap: int = 120, show_panel_labels: bool = True):
    """Impagina tutte le lastre UNA SOTTO L'ALTRA (colonna)."""
    try:
        import ezdxf
        from ezdxf.lldxf import const as ezconst
    except Exception:
        log.warning("⚠️ ezdxf non installato. Salto export DXF ALL.")
        return

    by_sheet: Dict[int, List[LayoutRow]] = defaultdict(list)
    for r in rows:
        by_sheet[r.sheet].append(r)

    ordered_raw = (sheet_order_from_csv if sheet_order_from_csv
                   else (run_order if run_order else sorted(by_sheet.keys())))
    ordered = _unique_preserve(ordered_raw)

    dxf_dir = out_dirs["dxf"] if out_dirs else "."
    base = os.path.basename(prefix)
    ts = _dt.datetime.now().strftime("%Y%m%d_%H%M%S")
    name = os.path.join(dxf_dir, f"{base}_ALL_{ts}.dxf")

    doc = ezdxf.new(setup=True)
    doc.header["$INSUNITS"] = 4  # mm
    msp = doc.modelspace()
    
    if "CUT" not in doc.layers:
        doc.layers.add("CUT", color=1)
    if "LABELS" not in doc.layers:
        doc.layers.add("LABELS", color=7)
    if "lastra" not in doc.layers:
        doc.layers.add("lastra", color=7)

    all_ids = [r.panel_id for r in rows]
    id_colors = _build_color_map_for_ids(all_ids)

    gap = max(gap, 80)
    cell_w, cell_h = W + gap, H + gap

    for idx, s in enumerate(ordered):
        tx = 0
        ty = -idx * cell_h

        parts = sort_parts_within_sheet(by_sheet[s]) if s in by_sheet else []

        # Bordo lastra
        msp.add_lwpolyline(
            [(tx, ty), (tx + W, ty), (tx + W, ty + H), (tx, ty + H), (tx, ty)],
            dxfattribs={"layer": "lastra"},
        )

        # Descrizione a destra
        hx, hy = tx + W + 40, ty + H / 2.0

        parts_sorted = sorted(
            parts,
            key=lambda p: (str(p.panel_id), 
                          f"{int(p.panel_number):06d}" if str(p.panel_number).isdigit() 
                          else str(p.panel_number))
        )

        lines = [f"SHEET {s}", "ID | N°"]
        lines += [f"{p.panel_id} | {p.panel_number}" for p in parts_sorted]
        header = "\n".join(lines)

        try:
            mtx = msp.add_mtext(header, dxfattribs={"char_height": 10, "layer": "LABELS"})
            mtx.dxf.insert = (hx, hy)
            mtx.dxf.attachment_point = ezconst.MTEXT_ATTACHMENT_MIDDLE_LEFT
            mtx.dxf.rotation = 0.0
            mtx.dxf.width = 220.0
        except Exception:
            t = msp.add_text(lines[0], dxfattribs={"height": 10, "layer": "LABELS"})
            t.dxf.halign = 0
            t.dxf.valign = 2
            t.dxf.align_point = (hx, hy)
            t.dxf.insert = (hx, hy)

        # Pannelli
        for p in parts:
            x0, y0 = tx + p.x, ty + p.y
            x1, y1 = x0 + p.width, y0 + p.height
            cut_col = id_colors.get(p.panel_id, 1)

            msp.add_lwpolyline(
                [(x0, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0)],
                dxfattribs={"layer": "CUT", "color": cut_col},
            )

            if show_panel_labels:
                label_lines = [
                    f"ID: {p.panel_id}",
                    f"N°: {p.panel_number}",
                    f"{int(round(p.width))}x{int(round(p.height))}" + (" (R)" if p.rotated else ""),
                ]
                cx, cy = x0 + p.width / 2.0, y0 + p.height / 2.0
                h = max(10, min(p.width, p.height) / 10)
                _place_center_label(
                    msp, label_lines, cx, cy, h,
                    layer="LABELS",
                    color=cut_col,
                    panel_box=(x0, y0, x1, y1),
                )

    # Salvataggio
    try:
        doc.saveas(name)
    except (PermissionError, OSError) as e:
        ts2 = _dt.datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        alt = os.path.join(dxf_dir, f"{base}_ALL_{ts2}.dxf")
        try:
            doc.saveas(alt)
            log.warning(f"⚠️ DXF ALL salvato come fallback: {alt}")
        except Exception as e2:
            log.warning(f"⚠️ DXF ALL non creato: {e} | fallback fallito: {e2}")