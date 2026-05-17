"""
packaging.py

Calcolo pesi pannelli e proposta casse per imballaggio.
"""

from typing import List, Dict
from collections import defaultdict
from geometry import LayoutRow, _safe_num


def _panel_weight_kg(w: float, h: float, material: str) -> float:
    """Calcola peso pannello in kg; w,h in mm."""
    w = float(w)
    h = float(h)
    
    if material == "hpl":
        return ((w + h)/1000.0*2.0*0.232 + 1.0) + (w*h*14.0/1_000_000.0)
    elif material == "corian":
        return ((w + h)/1000.0*2.0*0.232 + 1.0) + (w*h*10.6/1_000_000.0)
    elif material == "inox":
        return (w*h*6.4/1_000_000.0) + (w*h*10.0/1_000_000.0)
    elif material == "corian_grecato":
        return (w*h*10.0/1_000_000.0)
    
    # Fallback prudente
    return ((w + h)/1000.0*2.0*0.232 + 1.0) + (w*h*14.0/1_000_000.0)


def _crate_weight_kg(Wc_mm: float, Hc_mm: float, Z_mm: float) -> float:
    """
    Peso cassa stimato:
      - somma superfici delle 6 facce
      - converti mm² -> cm² (÷ 100)
      - moltiplica per 0.0013 kg/cm²
    """
    area_mm2 = 2.0 * ((Wc_mm * Hc_mm) + (Wc_mm * Z_mm) + (Hc_mm * Z_mm))
    area_cm2 = area_mm2 / 100.0
    return area_cm2 * 0.0013


def _compute_sheet_payloads(rows: List[LayoutRow], material: str):
    """Ritorna (sheet_weights_kg, sheet_panels_list)."""
    sheet_weights = defaultdict(float)
    sheet_panels = defaultdict(list)
    
    for r in rows:
        wkg = _panel_weight_kg(r.width, r.height, material)
        sheet_weights[r.sheet] += wkg
        sheet_panels[r.sheet].append((str(r.panel_id), str(r.panel_number)))
    
    # Ordina contenuti
    for s in sheet_panels:
        sheet_panels[s].sort(key=lambda t: (t[0], _safe_num(t[1])))
    
    return dict(sheet_weights), dict(sheet_panels)


def propose_crates(rows: List[LayoutRow], run_order: List[int], 
                   W: float, H: float, material: str, max_crate_kg: float) -> List[dict]:
    """
    Greedy in run_order: accumula sheet in casse finché (contenuti + cassa) <= max.
    Dimensioni cassa: (W+30) x (H+30) x (n*20 + 40) [mm].
    """
    sheet_weights, sheet_panels = _compute_sheet_payloads(rows, material)
    ordered_sheets = run_order if run_order else sorted(set(r.sheet for r in rows))
    
    Wc = float(W) + 30.0
    Hc = float(H) + 30.0

    crates = []
    current = {
        "crate_id": 1, 
        "levels": 0, 
        "content_weight": 0.0, 
        "sheets": [], 
        "run_orders": [], 
        "panels": []
    }
    pos = {s: i+1 for i, s in enumerate(ordered_sheets)}

    def _finalize_and_push(obj):
        if obj["levels"] == 0:
            return
        Z = obj["levels"] * 20.0 + 80.0
        cw = _crate_weight_kg(Wc, Hc, Z)
        total = obj["content_weight"] + cw
        crates.append({
            "crate_id": obj["crate_id"],
            "width_mm": int(round(Wc)),
            "depth_mm": int(round(Hc)),
            "height_mm": int(round(Z)),
            "levels": obj["levels"],
            "content_weight_kg": round(obj["content_weight"], 3),
            "crate_weight_kg": round(cw, 3),
            "total_weight_kg": round(total, 3),
            "sheets": obj["sheets"][:],
            "run_orders": obj["run_orders"][:],
            "panels": obj["panels"][:],
        })

    for s in ordered_sheets:
        sw = sheet_weights.get(s, 0.0)
        levels_try = current["levels"] + 1
        Z_try = levels_try * 20.0 + 40.0
        crate_w_try = _crate_weight_kg(Wc, Hc, Z_try)
        total_try = current["content_weight"] + sw + crate_w_try

        if current["levels"] > 0 and total_try > max_crate_kg:
            _finalize_and_push(current)
            current = {
                "crate_id": current["crate_id"] + 1, 
                "levels": 0, 
                "content_weight": 0.0,
                "sheets": [], 
                "run_orders": [], 
                "panels": []
            }
            levels_try = 1
            Z_try = levels_try * 20.0 + 40.0
            crate_w_try = _crate_weight_kg(Wc, Hc, Z_try)
            total_try = sw + crate_w_try

        current["levels"] = levels_try
        current["content_weight"] += sw
        current["sheets"].append(int(s))
        current["run_orders"].append(int(pos.get(s, s)))
        current["panels"].extend([f"{pid}|{pnum}" for (pid, pnum) in sheet_panels.get(s, [])])

    _finalize_and_push(current)
    return crates