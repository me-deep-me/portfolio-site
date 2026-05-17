"""
data_io.py

Lettura e conversione file Excel/CSV per il sistema di nesting.
"""

import os
import re
import pathlib
import datetime as _dt
import pandas as pd
from typing import List, Tuple
from config import log


def normalize_number_like(text: str) -> str:
    """
    Normalizza una stringa numerica in un formato coerente prima di pd.to_numeric:
    - Gestisce formati IT/EN con . e , come migliaia/decimali
    - Rimuove lettere/simboli non numerici comuni
    """
    if text is None:
        return ""
    s = str(text).strip().lower()

    # Trattini / placeholder non numerici -> vuoto
    if s in {"", "-", "—", "–", "na", "n/a", "none"}:
        return ""

    # qty formati tipo '2x' o 'x2'
    m = re.fullmatch(r"\s*(\d+)\s*x\s*\Z", s)
    if m:
        return m.group(1)
    m = re.fullmatch(r"\s*x\s*(\d+)\s*\Z", s)
    if m:
        return m.group(1)

    # Togli unità/simboli noti
    s = s.replace("\u00a0", " ")  # NBSP
    s = re.sub(r"(mm|cm|m2|m³|m3|°c|°|pcs|pz|nr|n\.|no\.)\b", "", s)
    s = re.sub(r"[~≈±<>≤≥=]+", "", s)
    s = s.replace("ø", "").replace("diam", "").replace("dia", "")

    # Rimuovi spazi separatori tra gruppi di cifre
    s = re.sub(r"(?<=\d)\s+(?=\d{3}\b)", "", s)
    s = s.strip()

    if s == "":
        return s

    # Gestione punto/virgola
    if "." in s and "," in s:
        last_dot = s.rfind(".")
        last_comma = s.rfind(",")
        if last_comma > last_dot:
            s = s.replace(".", "").replace(",", ".")
        else:
            s = s.replace(",", "")
    else:
        if "," in s:
            s = s.replace(",", ".")
        if s.count(".") > 1:
            parts = s.split(".")
            s = "".join(parts[:-1]) + "." + parts[-1]

    # Tieni solo cifre, punto e segno meno
    s = re.sub(r"[^0-9\.\-]", "", s)

    if s.count(".") > 1:
        first = s.find(".")
        s = s[:first+1] + s[first+1:].replace(".", "")

    # Normalizza segno meno
    if s.count("-") > 1:
        s = s.replace("-", "")
    if "-" in s and not s.startswith("-"):
        s = s.replace("-", "")

    return s.strip()


def coerce_numeric_series(series: pd.Series) -> pd.Series:
    """Applica normalize_number_like e converte in numerico (float)."""
    norm = series.astype(str).map(normalize_number_like)
    return pd.to_numeric(norm, errors="coerce")


def convert_excel(input_path, output_path=None, save_to_disk=True):
    """
    Converte un file Excel normalizzando le colonne e gestendo valori problematici.
    Ritorna DataFrame pulito o path del file salvato.
    """
    df = pd.read_excel(input_path)

    # Scarta righe completamente vuote (non fermarsi alla prima vuota nel mezzo)
    df = df.dropna(how='all').reset_index(drop=True)

    # Mappa di rinomina colonne
    rename_map = {
        "lunghezza (mm)": "width",
        "lunghezza": "width",
        "larghezza": "width",
        "widht": "width",
        "altezza (mm)": "height",
        "altezza": "height",
        "quantità": "qty",
        "quantita": "qty",
        "qta": "qty",
        "n°": "number",
        "numero": "number",
    }

    # Normalizza intestazioni
    columns_originali = [str(c).lower().strip() for c in df.columns]
    columns_rinominati = [rename_map.get(c, c) for c in columns_originali]
    df.columns = columns_rinominati
    df = df.rename(columns=rename_map)

    print("👉 Colonne viste da Pandas:", df.columns.tolist())

    # Verifica colonne essenziali
    if "width" not in df.columns or "height" not in df.columns:
        raise ValueError("Il file deve contenere le colonne 'width' e 'height' (obbligatorie)")

    if "qty" not in df.columns:
        df["qty"] = 1

    # Salva raw per diagnostica
    for col in ["width", "height", "qty"]:
        if col in df.columns:
            df[f"{col}__raw"] = df[col]

    # Coercizione numerica
    for col in ["width", "height", "qty"]:
        df[col] = coerce_numeric_series(df[col])

    # id e number come testo
    if "id" in df.columns:
        df["id"] = df["id"].astype(str)
    else:
        raise ValueError("⚠️ Il file deve contenere una colonna 'id' (obbligatoria)")

    if "number" in df.columns:
        df["number"] = df["number"].astype(str)
    else:
        df["number"] = "-"

    # Righe problematiche (width/height mancanti o id vuoto)
    mask_bad = df["width"].isna() | df["height"].isna() | df["id"].isin([None, "", "nan", "NaN", "<NA>"])
    if mask_bad.any():
        issues_df = df.loc[mask_bad, [c for c in ["id", "number", "width__raw", "height__raw", "qty__raw"] if c in df.columns]].copy()
        issues_df.insert(0, "row_in_excel", issues_df.index + 2)
        base, _ = os.path.splitext(input_path)
        issues_path = f"{base}__issues.xlsx"
        issues_df.to_excel(issues_path, index=False)
        print(f"⚠️ Rilevate {len(issues_df)} righe con valori non interpretabili. Dettagli: {issues_path}")

    # Pulisci
    df_clean = df.loc[~mask_bad].copy()
    df_clean["qty"] = df_clean["qty"].fillna(1)

    # Round -> int
    for col in ["width", "height", "qty"]:
        df_clean[col] = df_clean[col].round().astype("Int64").fillna(0).astype(int)

    # Output path di default
    if not output_path:
        base, ext = os.path.splitext(input_path)
        output_path = f"{base}__.xlsx"

    # Colonne finali
    front = [c for c in ["id", "number", "width", "height", "qty"] if c in df_clean.columns]
    rest = [c for c in df_clean.columns if c not in front and not c.endswith("__raw")]
    df_out = df_clean[front + rest].copy()

    # Se non serve salvare su disco
    if not save_to_disk:
        print(f"✅ File convertito in memoria (non salvato su disco)")
        return df_out

    # Scrittura con fallback
    try:
        df_out.to_excel(output_path, index=False)
        written_path = output_path
    except PermissionError:
        ts = _dt.datetime.now().strftime("%Y%m%d_%H%M%S")
        base, _ = os.path.splitext(input_path)
        alt = f"{base}__{ts}.xlsx"
        df_out.to_excel(alt, index=False)
        print(f"⚠️ File di output bloccato: '{output_path}'. Salvato come: {alt}")
        written_path = alt

    print(f"✅ File convertito correttamente: {written_path}")
    return written_path


def read_panels(path: pathlib.Path) -> Tuple[List[Tuple[float, float]], List[str], List[str]]:
    """
    Legge pannelli da file Excel, ritorna (panels, panel_ids, panel_numbers).
    """
    log.info(f"🔄 Conversione preliminare del file: {path}")
    df = convert_excel(str(path), save_to_disk=False)

    log.info(f"🔄 Lettura pannelli da DataFrame in memoria")

    required = ["id", "number", "width", "height", "qty"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"⚠️ Colonne mancanti: {missing}")

    panels, panel_ids, panel_numbers = [], [], []
    for _, r in df.iterrows():
        qty = int(r["qty"])
        w = float(r["width"])
        h = float(r["height"])
        pid = str(r["id"])
        pnum = str(r["number"])
        for _ in range(qty):
            panels.append((w, h))
            panel_ids.append(pid)
            panel_numbers.append(pnum)

    log.info(f"   ➜ Totale pannelli espansi: {len(panels)}")
    return panels, panel_ids, panel_numbers


def _validate_panels_for_rectpack(panels, panel_ids, panel_numbers):
    """
    Valida che i pannelli abbiano dimensioni compatibili con rectpack.
    Questa funzione è stata spostata in packing.py ma mantengo qui per retrocompatibilità.
    """
    from packing import _validate_panels_for_rectpack as validate
    return validate(panels, panel_ids, panel_numbers)