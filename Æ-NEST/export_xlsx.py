"""
export_xlsx.py

Export in formato Excel (LAYOUT, SHEETS, MACHINE, PACKAGING).
"""

import os
import pandas as pd
from typing import List, Dict
from collections import defaultdict
from geometry import LayoutRow, sort_parts_within_sheet, _safe_num


def _job_xlsx_path(prefix: str, out_dirs: Dict[str, str]) -> str:
    """Percorso del workbook unico."""
    out_dir = out_dirs["root"] if out_dirs else "."
    base = os.path.basename(prefix)
    return os.path.join(out_dir, f"{base}.xlsx")


def _export_xlsx(df: pd.DataFrame, path: str, sheet_name: str = "Sheet1",
                 number_formats: Dict[str, str] = None, widths: Dict[str, int] = None):
    """
    Scrive un XLSX cercando prima XlsxWriter (con formattazioni), altrimenti openpyxl (senza formattazioni).
    number_formats: dict {colname: excel_num_format}, es. {"width_mm": "0", "crate_weight_kg": "0.000"}
    widths: dict {colname: width}
    """
    number_formats = number_formats or {}
    widths = widths or {}

    try:
        # Tentativo con XlsxWriter (formattazioni avanzate)
        with pd.ExcelWriter(path, engine="xlsxwriter") as writer:
            df.to_excel(writer, index=False, sheet_name=sheet_name)
            wb = writer.book
            ws = writer.sheets[sheet_name]

            # Mappa colonne → indice
            col_idx = {col: i for i, col in enumerate(df.columns)}

            # Applica formati numerici
            for col, fmt in number_formats.items():
                if col in col_idx:
                    ws.set_column(col_idx[col], col_idx[col], widths.get(col, 12), wb.add_format({"num_format": fmt}))

            # Applica larghezze default per le altre colonne
            for col in df.columns:
                if col not in number_formats and col in col_idx:
                    ws.set_column(col_idx[col], col_idx[col], widths.get(col, 14))
    except Exception:
        # Fallback semplice con openpyxl (senza formattazione colonna)
        with pd.ExcelWriter(path, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name=sheet_name)


def write_outputs(rows: List[LayoutRow], prefix: str, run_order: List[int] = None,
                  out_dirs: Dict[str, str] = None, writer: pd.ExcelWriter = None):
    """Scrive foglio LAYOUT nel workbook."""
    df = pd.DataFrame([r.__dict__ for r in rows])
    if run_order:
        pos = {s: i+1 for i, s in enumerate(run_order)}
        df["run_order"] = df["sheet"].map(pos)
    else:
        df["run_order"] = df["sheet"]

    df["_pn"] = df["panel_number"].map(_safe_num)
    df = df.sort_values(["run_order", "sheet", "panel_id", "_pn", "y", "x"]).drop(columns=["_pn"])

    assert writer is not None, "writer Excel mancante"
    sheet_name = "LAYOUT"
    df.to_excel(writer, index=False, sheet_name=sheet_name)

    # Formattazioni (se xlsxwriter)
    try:
        wb = writer.book
        ws = writer.sheets[sheet_name]
        idx = {c: i for i, c in enumerate(df.columns)}
        num_fmt = wb.add_format({"num_format": "0"})
        for c in df.columns:
            ws.set_column(idx[c], idx[c], 12)
        for c in ["sheet", "run_order", "x", "y", "width", "height"]:
            if c in idx:
                ws.set_column(idx[c], idx[c], 10, num_fmt)
    except Exception:
        pass

    print(f"XLSX: scritto foglio '{sheet_name}'")


def write_sheet_summary(rows: List[LayoutRow], prefix: str, W: int, H: int,
                        run_order: List[int] = None, out_dirs: Dict[str, str] = None,
                        writer: pd.ExcelWriter = None):
    """Scrive foglio SHEETS nel workbook."""
    by_sheet: Dict[int, List[LayoutRow]] = defaultdict(list)
    for r in rows:
        by_sheet[r.sheet].append(r)

    run_pos = {s: i+1 for i, s in enumerate(run_order)} if run_order else {}
    recs = []
    sheet_area = float(W) * float(H)
    ordered_sheets = run_order if run_order else sorted(by_sheet.keys())
    
    for s in ordered_sheets:
        parts = sort_parts_within_sheet(by_sheet[s])
        used_area = sum(p.width * p.height for p in parts)
        util = 100.0 * used_area / sheet_area if sheet_area > 0 else float("nan")
        panels_str = "; ".join(
            f"{p.panel_id}|{p.panel_number}|{int(round(p.width))}x{int(round(p.height))}"
            for p in parts
        )
        recs.append({
            "sheet": s,
            "run_order": run_pos.get(s, None) if run_order else None,
            "panel_count": len(parts),
            "used_area_mm2": int(round(used_area)),
            "utilization_%": round(util, 2),
            "panels": panels_str
        })
    
    df = pd.DataFrame(recs)
    assert writer is not None, "writer Excel mancante"
    sheet_name = "SHEETS"
    df.to_excel(writer, index=False, sheet_name=sheet_name)

    try:
        wb = writer.book
        ws = writer.sheets[sheet_name]
        idx = {c: i for i, c in enumerate(df.columns)}
        ws.set_column(idx["panels"], idx["panels"], 60)
        f0 = wb.add_format({"num_format": "0"})
        f2 = wb.add_format({"num_format": "0.00"})
        for c in ["sheet", "run_order", "panel_count", "used_area_mm2"]:
            if c in idx:
                ws.set_column(idx[c], idx[c], 12, f0)
        if "utilization_%" in idx:
            ws.set_column(idx["utilization_%"], idx["utilization_%"], 12, f2)
    except Exception:
        pass

    print(f"XLSX: scritto foglio '{sheet_name}'")


def export_machine_xlsx(rows: List[LayoutRow], prefix: str, run_order: List[int] = None,
                        out_dirs: Dict[str, str] = None, writer: pd.ExcelWriter = None):
    """Scrive foglio MACHINE nel workbook."""
    df = pd.DataFrame([r.__dict__ for r in rows])
    if run_order:
        pos = {s: i+1 for i, s in enumerate(run_order)}
        df["run_order"] = df["sheet"].map(pos)
    else:
        df["run_order"] = df["sheet"]
    
    df["_pn"] = df["panel_number"].map(_safe_num)
    df = df.sort_values(["run_order", "sheet", "panel_id", "_pn", "y", "x"]).drop(columns=["_pn"])

    cols = ["sheet", "run_order", "x", "y", "width", "height", "rotated", "panel_id", "panel_number"]
    assert writer is not None, "writer Excel mancante"
    sheet_name = "MACHINE"
    df[cols].to_excel(writer, index=False, sheet_name=sheet_name)

    try:
        wb = writer.book
        ws = writer.sheets[sheet_name]
        idx = {c: i for i, c in enumerate(cols)}
        f0 = wb.add_format({"num_format": "0"})
        for c in ["sheet", "run_order", "x", "y", "width", "height"]:
            if c in idx:
                ws.set_column(idx[c], idx[c], 10, f0)
        ws.set_column(idx["panel_id"], idx["panel_id"], 14)
        ws.set_column(idx["panel_number"], idx["panel_number"], 12)
    except Exception:
        pass

    print(f"XLSX: scritto foglio '{sheet_name}'")


def write_packaging_xlsx(prefix: str, out_dirs: dict, crates: List[dict],
                         writer: pd.ExcelWriter = None):
    """Scrive foglio PACKAGING nel workbook."""
    rows = []
    for c in crates:
        rows.append({
            "crate_id": int(c["crate_id"]),
            "width_mm": int(c["width_mm"]),
            "depth_mm": int(c["depth_mm"]),
            "height_mm": int(c["height_mm"]),
            "levels": int(c["levels"]),
            "content_weight_kg": float(c["content_weight_kg"]),
            "crate_weight_kg": float(c["crate_weight_kg"]),
            "total_weight_kg": float(c["total_weight_kg"]),
            "sheets": ",".join(map(str, c["sheets"])),
            "run_orders": ",".join(map(str, c["run_orders"])),
            "panels": "; ".join(c["panels"]),
        })
    df = pd.DataFrame(rows)

    assert writer is not None, "writer Excel mancante"
    sheet_name = "PACKAGING"
    df.to_excel(writer, index=False, sheet_name=sheet_name)

    try:
        wb = writer.book
        ws = writer.sheets[sheet_name]
        idx = {c: i for i, c in enumerate(df.columns)}
        kg = wb.add_format({"num_format": "0.000"})
        i0 = wb.add_format({"num_format": "0"})
        for c in ["crate_id", "width_mm", "depth_mm", "height_mm", "levels"]:
            if c in idx:
                ws.set_column(idx[c], idx[c], 12, i0)
        for c in ["content_weight_kg", "crate_weight_kg", "total_weight_kg"]:
            if c in idx:
                ws.set_column(idx[c], idx[c], 16, kg)
        if "sheets" in idx:
            ws.set_column(idx["sheets"], idx["sheets"], 20)
        if "run_orders" in idx:
            ws.set_column(idx["run_orders"], idx["run_orders"], 20)
        if "panels" in idx:
            ws.set_column(idx["panels"], idx["panels"], 60)
    except Exception:
        pass

    print(f"XLSX: scritto foglio '{sheet_name}'")