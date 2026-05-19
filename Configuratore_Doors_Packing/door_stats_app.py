import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from typing import Dict, List, Optional, Tuple
import pandas as pd

# =========================
# COSTANTI PESO (come tuo script)
# =========================
DENSITY = {"HPL": 236.0, "INOX": 8220.0, "VETRO": 2400.0}
RHO_LEAD = 11340.0
RHO_GLASS = 2400.0
TH_PANEL_M = 46.5 / 1000.0
TH_VISION_M = 20.0 / 1000.0

# =========================
# DRIVE CODES (pos6)
# =========================
MANUAL_CODES = {"M1S", "M1D", "M2S", "M2D"}
AUTO_CODES   = {"A1S", "A1D", "A2S", "A2D"}
SEMI_CODES   = {"S1S", "S1D", "S2S", "S2D"}

DRIVE_LABELS = ["MANUALE", "AUTOMATICA", "SEMIAUTOMATICA"]

# =========================
# VISION MAP
# =========================
VISION_MAP = {
    "V00": (0, 0, 0),
    "V01": (350, 700, 0), "V02": (400, 500, 0), "V03": (500, 700, 0),
    "V20": (400, 500, 0), "V21": (400, 500, 0), "V22": (500, 700, 0), "V23": (500, 700, 0),
    "V30": (350, 700, 0), "V31": (400, 500, 0), "V32": (500, 700, 0),
    "V33": (350, 700, 0), "V34": (400, 500, 0), "V35": (500, 700, 0),
    "V04": (240, 300, 0), "V05": (240, 300, 0),
    "V06": (240, 300, 1), "V07": (240, 300, 1),
    "V08": (240, 300, 2), "V09": (240, 300, 2),
    "V10": (240, 300, 3), "V11": (240, 300, 3),
    "V12": (400, 500, 0), "V13": (400, 500, 0),
    "V24": (400, 500, 0), "V25": (400, 500, 0), "V26": (400, 500, 0), "V27": (400, 500, 0),
    "V14": (400, 500, 1), "V15": (400, 500, 1),
    "V16": (400, 500, 2), "V17": (400, 500, 2),
    "V18": (400, 500, 3), "V19": (400, 500, 3),
}

# =========================
# HELPERS
# =========================
def to_float(x) -> float:
    try:
        return float(str(x).strip().replace(",", "."))
    except:
        return 0.0

def to_int(x) -> int:
    try:
        return int(float(str(x).strip().replace(",", ".")))
    except:
        return 0

def minmax(arr: List[float]) -> Tuple[Optional[float], Optional[float]]:
    if not arr:
        return None, None
    return min(arr), max(arr)

def weight_bin_100(peso_kg: float) -> str:
    return ">100" if peso_kg > 100.0 else "<=100"

# =========================
# DECODER (posizioni come da tuo standard)
# =========================
def parse_code_string(s: str) -> Dict[str, object]:
    """
    - pos1: PS/PB
    - pos3: TE/T
    - pos6: DRIVE (M.. / A.. / S..) + anche indicazione ante: *D => 2 ante, altrimenti 1
    - pos7: PBx piombo (rigoroso)
    - pos11: W
    - pos12: H
    - Vxx: primo token che inizia con V
    """
    parts = (s or "").split(".")
    def p(i: int) -> str:
        return parts[i-1].strip() if len(parts) >= i else ""

    pos1 = p(1)
    pos3 = p(3)
    pos6 = p(6)
    pos7 = p(7)
    w_str = p(11)
    h_str = p(12)

    # door type
    door_type = "PS" if pos1 == "PS" else ("PB" if pos1 == "PB" else "")

    # seal
    seal = "TE" if pos3 == "TE" else "T"

    # drive
    drive = ""
    if pos6 in MANUAL_CODES:
        drive = "MANUALE"
    elif pos6 in AUTO_CODES:
        drive = "AUTOMATICA"
    elif pos6 in SEMI_CODES:
        drive = "SEMIAUTOMATICA"

    # depth_units (ante) da pos6: ...D => 2 ante, altrimenti 1
    # (es: A1D / M2D / S1D => 2)
    depth_units = 2 if pos6.endswith("D") else 1

    # lead in pos7 rigoroso
    mm_pb = 0
    if pos7.startswith("PB"):
        try:
            mm_pb = int(pos7.replace("PB", ""))
        except:
            mm_pb = 0

    # vision Vxx
    vcode = ""
    for token in parts:
        t = token.strip()
        if t.startswith("V"):
            vcode = t
            break

    if vcode in VISION_MAP:
        vis_w, vis_h, vis_pb = VISION_MAP[vcode]
    else:
        vis_w, vis_h, vis_pb = (0, 0, 0)

    w_raw = to_float(w_str)
    h = to_float(h_str)

    # larghezza effettiva per il calcolo peso
    eff_w = w_raw / 2.0 if depth_units == 2 and w_raw > 0 else w_raw

    return {
        "door_type": door_type,
        "seal": seal,
        "drive": drive,
        "drive_code": pos6,
        "mm_piombo": mm_pb,
        "piombata": (mm_pb > 0),
        "vcode": vcode,
        "vis_w": int(vis_w),
        "vis_h": int(vis_h),
        "vis_pb": int(vis_pb),
        "w_mm": float(eff_w),
        "h_mm": float(h),
        "depth_units": int(depth_units),
        "w_raw_mm": float(w_raw),
    }

# =========================
# PESO (come tuo script)
# =========================
def compute_weight_kg(materiale: str, w_mm: float, h_mm: float,
                      mm_piombo: float, vis_w: float, vis_h: float, vis_pb: float,
                      depth_units: int) -> float:
    a_door = (h_mm / 1000.0) * (w_mm / 1000.0)
    a_vis = (vis_w / 1000.0) * (vis_h / 1000.0) if (vis_w > 0 and vis_h > 0) else 0.0

    lead_th_m = (mm_piombo / 1000.0)
    w_lead_door = (a_door * lead_th_m) * RHO_LEAD

    vision_lead_th_m = (vis_pb / 1000.0)
    w_vision = (a_vis * TH_VISION_M * RHO_GLASS) + (a_vis * vision_lead_th_m * RHO_LEAD)

    a_panel = ((w_mm + 174.0) * h_mm) / 1_000_000.0
    mat = (materiale or "HPL").upper().strip()
    if mat not in DENSITY:
        mat = "HPL"
    rho_panel = DENSITY[mat]
    w_panel = (a_panel * TH_PANEL_M * rho_panel) + (17.0 if mat == "INOX" else 0.0)

    w_single_leaf = max(0.0, w_vision + w_panel + w_lead_door + 15.0)
    return w_single_leaf * float(max(1, depth_units))

# =========================
# EDITABLE TREEVIEW (doppio click edit)
# =========================
class EditableTree(ttk.Treeview):
    def __init__(self, master, editable_cols: set, combo_map: Dict[str, List[str]], **kwargs):
        super().__init__(master, **kwargs)
        self.editable_cols = editable_cols
        self.combo_map = combo_map
        self._edit_widget = None
        self._edit_item = None
        self._edit_col = None
        self.bind("<Double-1>", self._begin_edit)

    def _begin_edit(self, event):
        region = self.identify("region", event.x, event.y)
        if region != "cell":
            return
        item = self.identify_row(event.y)
        col = self.identify_column(event.x)
        if not item or not col:
            return

        col_idx = int(col.replace("#", "")) - 1
        col_id = self["columns"][col_idx]

        if col_id not in self.editable_cols:
            return

        bbox = self.bbox(item, col)
        if not bbox:
            return
        x, y, w, h = bbox

        value = self.set(item, col_id)
        self._end_edit(commit=False)

        self._edit_item = item
        self._edit_col = col_id

        if col_id in self.combo_map:
            cb = ttk.Combobox(self, values=self.combo_map[col_id], state="readonly")
            cb.place(x=x, y=y, width=w, height=h)
            if value in self.combo_map[col_id]:
                cb.set(value)
            else:
                cb.set(self.combo_map[col_id][0])
            cb.focus()
            cb.bind("<<ComboboxSelected>>", lambda e: self._end_edit(commit=True))
            cb.bind("<Escape>", lambda e: self._end_edit(commit=False))
            cb.bind("<FocusOut>", lambda e: self._end_edit(commit=True))
            self._edit_widget = cb
        else:
            e = ttk.Entry(self)
            e.place(x=x, y=y, width=w, height=h)
            e.insert(0, value)
            e.select_range(0, "end")
            e.focus()
            e.bind("<Return>", lambda e2: self._end_edit(commit=True))
            e.bind("<Escape>", lambda e2: self._end_edit(commit=False))
            e.bind("<FocusOut>", lambda e2: self._end_edit(commit=True))
            self._edit_widget = e

    def _end_edit(self, commit: bool):
        if self._edit_widget is None:
            return
        widget = self._edit_widget
        item = self._edit_item
        col_id = self._edit_col

        try:
            new_val = widget.get()
        except Exception:
            new_val = ""

        widget.destroy()
        self._edit_widget = None

        if commit and item and col_id:
            self.set(item, col_id, new_val)

        self._edit_item = None
        self._edit_col = None

# =========================
# APP
# =========================
class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Door Decoder Stats (Verify grid -> Analyze)")
        self.geometry("1700x900")

        self.df: Optional[pd.DataFrame] = None
        self.results_project_df: Optional[pd.DataFrame] = None
        self.results_detail_df: Optional[pd.DataFrame] = None
        self.results_combo_df: Optional[pd.DataFrame] = None

        self.status = tk.StringVar(value="Pronto.")

        top = ttk.Frame(self)
        top.pack(fill="x", padx=10, pady=8)

        ttk.Button(top, text="Carica Excel", command=self.load_excel).pack(side="left")
        ttk.Button(top, text="Ricalcola pesi (grid)", command=self.recalc_grid_weights).pack(side="left", padx=8)
        ttk.Button(top, text="Esegui Analisi Statistica", command=self.run_analysis).pack(side="left", padx=8)
        ttk.Button(top, text="Export Excel Risultati", command=self.export_excel).pack(side="left", padx=8)

        ttk.Label(top, text="Top progetti:").pack(side="left", padx=(20, 6))
        self.topn_var = tk.IntVar(value=10)
        ttk.Entry(top, textvariable=self.topn_var, width=6).pack(side="left")

        ttk.Label(self, textvariable=self.status).pack(fill="x", padx=10)

        # ---- GRID
        grid_frame = ttk.LabelFrame(self, text="Verifica dati (doppio click: Mat, Seal, Drive, Ante, Pb mm, VisW, VisH)")
        grid_frame.pack(fill="both", expand=True, padx=10, pady=8)

        cols = (
            "project_id", "code",
            "door_type", "seal", "drive", "drive_code",
            "materiale",
            "mm_piombo", "piombata",
            "vcode", "vis_w", "vis_h", "vis_pb",
            "w_raw_mm",
            "w_mm", "h_mm", "depth_units",
            "peso_kg", "peso_bin"
        )

        editable = {"materiale", "mm_piombo", "vis_w", "vis_h", "seal", "drive", "depth_units"}

        combo_map = {
            "materiale": ["HPL", "INOX", "VETRO"],
            "seal": ["T", "TE"],
            "drive": DRIVE_LABELS
        }

        self.tree = EditableTree(
            grid_frame,
            editable_cols=editable,
            combo_map=combo_map,
            columns=cols,
            show="headings",
            height=18
        )

        vsb = ttk.Scrollbar(grid_frame, orient="vertical", command=self.tree.yview)
        hsb = ttk.Scrollbar(grid_frame, orient="horizontal", command=self.tree.xview)
        self.tree.configure(yscrollcommand=vsb.set, xscrollcommand=hsb.set)

        headings = [
            ("project_id", "Project", 120),
            ("code", "Stringa (B)", 520),
            ("door_type", "Tipo", 60),       # PS / PB
            ("seal", "Tenuta", 70),          # TE / T
            ("drive", "Azion.", 120),        # MANUALE / AUTOMATICA / SEMIAUTOMATICA
            ("drive_code", "Cod6", 70),      # M1S...
            ("materiale", "Mat", 70),
            ("mm_piombo", "Pb mm", 70),
            ("piombata", "Piomb", 70),
            ("vcode", "Vxx", 60),
            ("vis_w", "VisW", 70),
            ("vis_h", "VisH", 70),
            ("vis_pb", "VisPb", 70),
            ("w_raw_mm", "W muro", 80),
            ("w_mm", "W eff", 80),
            ("h_mm", "H", 80),
            ("depth_units", "Ante", 60),
            ("peso_kg", "Peso(kg)", 90),
            ("peso_bin", "Bin", 60),
        ]
        for cid, title, w in headings:
            self.tree.heading(cid, text=title)
            self.tree.column(cid, width=w, anchor="w")

        self.tree.grid(row=0, column=0, sticky="nsew")
        vsb.grid(row=0, column=1, sticky="ns")
        hsb.grid(row=1, column=0, sticky="ew")

        grid_frame.grid_rowconfigure(0, weight=1)
        grid_frame.grid_columnconfigure(0, weight=1)

        # ---- OUTPUT
        out = ttk.Notebook(self)
        out.pack(fill="both", expand=False, padx=10, pady=(0, 10))

        self.tab_stats = ttk.Frame(out)
        self.tab_top = ttk.Frame(out)
        self.tab_combo = ttk.Frame(out)

        out.add(self.tab_stats, text="Report")
        out.add(self.tab_top, text="Top Progetti")
        out.add(self.tab_combo, text="Combinazioni (Pivot)")

        self.txt = tk.Text(self.tab_stats, height=20, wrap="word", font=("Consolas", 10))
        self.txt.pack(fill="both", expand=True, padx=8, pady=8)

        # Top projects table
        self.top_tree = ttk.Treeview(
            self.tab_top,
            columns=("project_id", "doors", "sliding", "swing", "manual", "auto", "semi", "herm", "simple", "leaded", "wmin", "wmax"),
            show="headings",
            height=9
        )
        for cid, title, w in [
            ("project_id", "Project", 170),
            ("doors", "N Porte", 80),
            ("sliding", "PS", 50),
            ("swing", "PB", 50),
            ("manual", "MAN", 60),
            ("auto", "AUTO", 60),
            ("semi", "SEMI", 60),
            ("herm", "TE", 60),
            ("simple", "T", 60),
            ("leaded", "Pb", 60),
            ("wmin", "Peso min", 90),
            ("wmax", "Peso max", 90),
        ]:
            self.top_tree.heading(cid, text=title)
            self.top_tree.column(cid, width=w, anchor="w")
        self.top_tree.pack(fill="both", expand=True, padx=8, pady=8)

        # Combinations table
        self.combo_tree = ttk.Treeview(
            self.tab_combo,
            columns=("drive", "door_type", "seal", "piombo", "peso_bin", "count"),
            show="headings",
            height=10
        )
        for cid, title, w in [
            ("drive", "Drive", 140),
            ("door_type", "Tipo", 70),
            ("seal", "Tenuta", 70),
            ("piombo", "Piombo", 80),
            ("peso_bin", "Peso", 70),
            ("count", "Count", 80),
        ]:
            self.combo_tree.heading(cid, text=title)
            self.combo_tree.column(cid, width=w, anchor="w")
        self.combo_tree.pack(fill="both", expand=True, padx=8, pady=8)

    def set_status(self, msg: str):
        self.status.set(msg)
        self.update_idletasks()

    def load_excel(self):
        path = filedialog.askopenfilename(title="Seleziona Excel", filetypes=[("Excel", "*.xlsx *.xls")])
        if not path:
            return
        try:
            df = pd.read_excel(path, header=0)
        except Exception as e:
            messagebox.showerror("Errore", f"Impossibile leggere Excel:\n{e}")
            return

        if df.shape[1] < 2:
            messagebox.showerror("Errore", "Serve: colonna A=Project ID, colonna B=Stringa.")
            return

        df = df.iloc[:, 0:2].copy()
        df.columns = ["project_id", "code"]

        df["project_id"] = df["project_id"].astype(str).str.strip()
        df["code"] = df["code"].astype(str).str.strip()

        df = df[(df["project_id"] != "") & (df["project_id"].str.lower() != "nan")]
        df = df[(df["code"] != "") & (df["code"].str.lower() != "nan")]
        df = df.reset_index(drop=True)

        rows = []
        for _, r in df.iterrows():
            pid = r["project_id"]
            code = r["code"]
            parsed = parse_code_string(code)

            materiale = "HPL"
            peso = compute_weight_kg(
                materiale=materiale,
                w_mm=float(parsed["w_mm"]),
                h_mm=float(parsed["h_mm"]),
                mm_piombo=float(parsed["mm_piombo"]),
                vis_w=float(parsed["vis_w"]),
                vis_h=float(parsed["vis_h"]),
                vis_pb=float(parsed["vis_pb"]),
                depth_units=int(parsed["depth_units"]),
            )

            rows.append({
                "project_id": pid,
                "code": code,
                "door_type": parsed["door_type"],              # PS/PB
                "seal": parsed["seal"],                        # TE/T
                "drive": parsed["drive"],                      # MAN/AUTO/SEMI
                "drive_code": parsed["drive_code"],            # pos6 raw
                "materiale": materiale,
                "mm_piombo": int(parsed["mm_piombo"]),
                "piombata": "SI" if parsed["piombata"] else "",
                "vcode": parsed["vcode"],
                "vis_w": int(parsed["vis_w"]),
                "w_raw_mm": round(float(parsed["w_raw_mm"]), 1),
                "vis_h": int(parsed["vis_h"]),
                "vis_pb": int(parsed["vis_pb"]),
                "w_mm": round(float(parsed["w_mm"]), 1),
                "h_mm": round(float(parsed["h_mm"]), 1),
                "depth_units": int(parsed["depth_units"]),
                "peso_kg": round(float(peso), 2),
                "peso_bin": weight_bin_100(float(peso)),
            })

        self.df = pd.DataFrame(rows)
        self._fill_grid(self.df)

        self.txt.delete("1.0", "end")
        self._clear_tree(self.top_tree)
        self._clear_tree(self.combo_tree)

        self.results_project_df = None
        self.results_detail_df = None
        self.results_combo_df = None

        self.set_status(f"Caricato e decodificato: {len(self.df)} righe. Verifica/modifica in griglia, poi analisi.")

    def _fill_grid(self, df: pd.DataFrame):
        for it in self.tree.get_children():
            self.tree.delete(it)
        for idx, r in df.iterrows():
            self.tree.insert("", "end", iid=str(idx), values=tuple(r[c] for c in self.tree["columns"]))

    def _grid_to_df(self) -> pd.DataFrame:
        cols = list(self.tree["columns"])
        out = []
        for iid in self.tree.get_children():
            values = self.tree.item(iid, "values")
            row = dict(zip(cols, values))
            out.append(row)
        df = pd.DataFrame(out)

        # normalize types
        df["mm_piombo"] = df["mm_piombo"].apply(to_int)
        df["vis_w"] = df["vis_w"].apply(to_int)
        df["vis_h"] = df["vis_h"].apply(to_int)
        df["vis_pb"] = df["vis_pb"].apply(to_int)
        df["w_raw_mm"] = df["w_raw_mm"].apply(to_float)   # ← AGGIUNGI QUESTA
        df["w_mm"] = df["w_mm"].apply(to_float)
        df["h_mm"] = df["h_mm"].apply(to_float)
        df["depth_units"] = df["depth_units"].apply(to_int)
        df["peso_kg"] = df["peso_kg"].apply(to_float)

        df["materiale"] = df["materiale"].astype(str).str.upper().str.strip()
        df["seal"] = df["seal"].astype(str).str.upper().str.strip()
        df["door_type"] = df["door_type"].astype(str).str.upper().str.strip()
        df["drive"] = df["drive"].astype(str).str.upper().str.strip()

        # derived fields
        df["piombata"] = df["mm_piombo"].apply(lambda x: "SI" if x > 0 else "")
        df["peso_bin"] = df["peso_kg"].apply(weight_bin_100)

        # clean invalid values
        df.loc[~df["seal"].isin(["T", "TE"]), "seal"] = "T"
        df.loc[~df["drive"].isin(DRIVE_LABELS), "drive"] = ""
        df.loc[~df["door_type"].isin(["PS", "PB"]), "door_type"] = ""

        df["depth_units"] = df["depth_units"].apply(lambda x: 2 if x == 2 else 1)

        return df

    def recalc_grid_weights(self):
        if self.df is None:
            messagebox.showwarning("Attenzione", "Prima carica un Excel.")
            return

        df = self._grid_to_df()

        new_weights = []
        for _, r in df.iterrows():
            peso = compute_weight_kg(
                materiale=r["materiale"] or "HPL",
                w_mm=float(r["w_mm"]),
                h_mm=float(r["h_mm"]),
                mm_piombo=float(r["mm_piombo"]),
                vis_w=float(r["vis_w"]),
                vis_h=float(r["vis_h"]),
                vis_pb=float(r["vis_pb"]),
                depth_units=int(r["depth_units"]) if int(r["depth_units"]) >= 1 else 1,
            )
            new_weights.append(round(float(peso), 2))

        df["peso_kg"] = new_weights
        df["piombata"] = df["mm_piombo"].apply(lambda x: "SI" if x > 0 else "")
        df["peso_bin"] = df["peso_kg"].apply(weight_bin_100)

        self.df = df
        self._fill_grid(df)
        self.set_status("Pesi ricalcolati sulla base dei valori attuali in griglia.")

    def run_analysis(self):
        if self.df is None:
            messagebox.showwarning("Attenzione", "Prima carica un Excel.")
            return

        topn = int(self.topn_var.get() or 10)
        if topn < 1:
            topn = 10

        df = self._grid_to_df()

        # =========
        # STATISTICA LARGHEZZE VANO MURO
        # =========

        width_df = df.copy()

        # classifica singola anta
        single_widths = (
            width_df[width_df["depth_units"] == 1]
            .groupby("w_raw_mm")
            .size()
            .reset_index(name="count")
            .sort_values("count", ascending=False)
        )

        # classifica doppia anta
        double_widths = (
            width_df[width_df["depth_units"] == 2]
            .groupby("w_raw_mm")
            .size()
            .reset_index(name="count")
            .sort_values("count", ascending=False)
        )

        # =========
        # TOP LARGHEZZE GLOBALI
        # =========

        global_widths = (
            width_df
            .groupby("w_raw_mm")
            .size()
            .reset_index(name="count")
            .sort_values("count", ascending=False)
        )

        global_widths["percent"] = (global_widths["count"] / len(width_df)) * 100

        top3_cov = global_widths.head(3)["percent"].sum()
        top5_cov = global_widths.head(5)["percent"].sum()
        top10_cov = global_widths.head(10)["percent"].sum()

        # =========
        # PIOMBO – ANALISI AVANZATA
        # =========
        lead_df = df[df["mm_piombo"] > 0].copy()

        total_lead_kg = 0.0
        total_lead_m2 = 0.0

        # m2 per spessore
        m2_by_mm = {1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0}
        kg_by_mm = {1: 0.0, 2: 0.0, 3: 0.0, 4: 0.0}

        for _, r in lead_df.iterrows():
            area_single = (r["w_mm"] / 1000.0) * (r["h_mm"] / 1000.0)
            area_total = area_single * int(r["depth_units"])
            th_m = r["mm_piombo"] / 1000.0

            kg = area_total * th_m * RHO_LEAD

            total_lead_kg += kg
            total_lead_m2 += area_total

            mm = int(r["mm_piombo"])
            if mm in m2_by_mm:
                m2_by_mm[mm] += area_total
                kg_by_mm[mm] += kg

        # =========
        # BASE COUNTS
        # =========
        n_total = len(df)
        n_sliding = int((df["door_type"] == "PS").sum())
        n_swing   = int((df["door_type"] == "PB").sum())

        n_simple = int((df["seal"] == "T").sum())
        n_herm   = int((df["seal"] == "TE").sum())

        n_manual = int((df["drive"] == "MANUALE").sum())
        n_auto   = int((df["drive"] == "AUTOMATICA").sum())
        n_semi   = int((df["drive"] == "SEMIAUTOMATICA").sum())

        # =========
        # REQUESTED: TE >100 / <=100
        # =========
        herm_gt_100 = int(((df["seal"] == "TE") & (df["peso_kg"] > 100.0)).sum())
        herm_le_100 = int(((df["seal"] == "TE") & (df["peso_kg"] <= 100.0)).sum())

        # =========
        # REQUESTED: simple leaded range / herm leaded range
        # =========
        simple_leaded_weights = df[(df["seal"] == "T") & (df["mm_piombo"] > 0)]["peso_kg"].tolist()
        herm_leaded_weights   = df[(df["seal"] == "TE") & (df["mm_piombo"] > 0)]["peso_kg"].tolist()
        smin, smax = minmax(simple_leaded_weights)
        hmin, hmax = minmax(herm_leaded_weights)

        # =========
        # Drive × Door type breakdown (manual/auto/semi by PB/PS)
        # =========
        def cnt(mask):
            return int(mask.sum())

        swing_manual   = cnt((df["door_type"]=="PB") & (df["drive"]=="MANUALE"))
        swing_auto     = cnt((df["door_type"]=="PB") & (df["drive"]=="AUTOMATICA"))
        swing_semi     = cnt((df["door_type"]=="PB") & (df["drive"]=="SEMIAUTOMATICA"))
        sliding_manual = cnt((df["door_type"]=="PS") & (df["drive"]=="MANUALE"))
        sliding_auto   = cnt((df["door_type"]=="PS") & (df["drive"]=="AUTOMATICA"))
        sliding_semi   = cnt((df["door_type"]=="PS") & (df["drive"]=="SEMIAUTOMATICA"))

        # =========
        # AUTOMATICHE: richieste + breakdown PB/PS
        # =========
        auto_df = df[df["drive"]=="AUTOMATICA"].copy()

        # =========
        # SCORREVOLI - STATISTICA VANI MURO
        # =========

        sliding_df = df[df["door_type"] == "PS"].copy()

        # =============================
        # CLASSIFICA LUCE NETTA SCORREVOLI
        # =============================

        def sliding_stats(drive, seal, ante):

            subset = sliding_df[
                (sliding_df["drive"] == drive) &
                (sliding_df["seal"] == seal) &
                (sliding_df["depth_units"] == ante)
            ]

            stats = (
                subset
                .groupby("w_raw_mm")
                .size()
                .reset_index(name="porte")
                .sort_values("porte", ascending=False)
            )

            return stats


        stats_manual_single = sliding_stats("MANUALE","T",1)
        stats_manual_double = sliding_stats("MANUALE","T",2)

        stats_t_single = sliding_stats("AUTOMATICA","T",1)
        stats_t_double = sliding_stats("AUTOMATICA","T",2)

        stats_te_single = sliding_stats("AUTOMATICA","TE",1)
        stats_te_double = sliding_stats("AUTOMATICA","TE",2)

        def add_carter(df_stats, tipo):

            if df_stats.empty:
                return df_stats

            df_stats = df_stats.copy()

            if tipo == "T":
                offset = 240
            else:
                offset = 390

            df_stats["carter_mm"] = df_stats["w_raw_mm"]*2 + offset

            return df_stats
        
        stats_manual_single = add_carter(stats_manual_single,"MAN")
        stats_manual_double = add_carter(stats_manual_double,"MAN")

        stats_t_single = add_carter(stats_t_single,"T")
        stats_t_double = add_carter(stats_t_double,"T")

        stats_te_single = add_carter(stats_te_single,"TE")
        stats_te_double = add_carter(stats_te_double,"TE")

        # =============================
        # DATAFRAME EXPORT LUCI + CARTER
        # =============================

        self.sliding_stats_export = (
            pd.concat([
                stats_manual_single.assign(tipo="MANUALE", ante="SINGOLA"),
                stats_manual_double.assign(tipo="MANUALE", ante="DOPPIA"),

                stats_t_single.assign(tipo="T", ante="SINGOLA"),
                stats_t_double.assign(tipo="T", ante="DOPPIA"),

                stats_te_single.assign(tipo="TE", ante="SINGOLA"),
                stats_te_double.assign(tipo="TE", ante="DOPPIA")

            ], ignore_index=True)
            .sort_values(["tipo","ante","porte"], ascending=[True,True,False])
        )

        self.sliding_stats_export = self.sliding_stats_export.rename(columns={
            "w_raw_mm": "luce_netto_mm",
            "porte": "numero_porte"
        })

        sliding_auto_te = cnt((sliding_df["drive"] == "AUTOMATICA") & (sliding_df["seal"] == "TE"))
        sliding_auto_t  = cnt((sliding_df["drive"] == "AUTOMATICA") & (sliding_df["seal"] == "T"))
        sliding_manual  = cnt(sliding_df["drive"] == "MANUALE")

        # =========
        # CLASSIFICA VANI MURO PER SCORREVOLI
        # =========

    

        auto_te   = cnt(auto_df["seal"]=="TE")
        auto_t    = cnt(auto_df["seal"]=="T")
        auto_pb   = cnt(auto_df["mm_piombo"]>0)
        auto_nopb = cnt(auto_df["mm_piombo"]==0)
        auto_gt100 = cnt(auto_df["peso_kg"]>100.0)
        auto_le100 = cnt(auto_df["peso_kg"]<=100.0)
        auto_te_pb = cnt((auto_df["seal"]=="TE") & (auto_df["mm_piombo"]>0))
        auto_t_pb  = cnt((auto_df["seal"]=="T") & (auto_df["mm_piombo"]>0))

        # Breakdown automatiche by type
        auto_pb_swing   = cnt((auto_df["door_type"]=="PB") & (auto_df["mm_piombo"]>0))
        auto_pb_sliding = cnt((auto_df["door_type"]=="PS") & (auto_df["mm_piombo"]>0))
        auto_te_swing   = cnt((auto_df["door_type"]=="PB") & (auto_df["seal"]=="TE"))
        auto_te_sliding = cnt((auto_df["door_type"]=="PS") & (auto_df["seal"]=="TE"))

        # =========
        # TUTTE LE COMBINAZIONI (drive × type × seal × piombo × bin peso)
        # =========
        combo = df.copy()
        combo["piombo_flag"] = combo["mm_piombo"].apply(lambda x: "PIOMBATA" if x > 0 else "NO_PIOMBO")
        combo["peso_bin"] = combo["peso_kg"].apply(weight_bin_100)

        combo_df = (combo
                    .groupby(["drive","door_type","seal","piombo_flag","peso_bin"])
                    .size()
                    .reset_index(name="count")
                    .sort_values(["drive","door_type","seal","piombo_flag","peso_bin"])
                    .reset_index(drop=True))

        self.results_combo_df = combo_df

        

        # =========
        # TOP PROGETTI
        # =========
        proj = df.groupby("project_id").agg(
            doors=("code", "count"),
            sliding=("door_type", lambda x: int((x == "PS").sum())),
            swing=("door_type", lambda x: int((x == "PB").sum())),
            manual=("drive", lambda x: int((x == "MANUALE").sum())),
            auto=("drive", lambda x: int((x == "AUTOMATICA").sum())),
            semi=("drive", lambda x: int((x == "SEMIAUTOMATICA").sum())),
            herm=("seal", lambda x: int((x == "TE").sum())),
            simple=("seal", lambda x: int((x == "T").sum())),
            leaded=("mm_piombo", lambda x: int((x > 0).sum())),
            wmin=("peso_kg", "min"),
            wmax=("peso_kg", "max"),
        ).reset_index()

        proj = proj.sort_values(["doors", "project_id"], ascending=[False, True]).reset_index(drop=True)
        top = proj.head(topn)

        

        self.results_project_df = proj
        self.results_detail_df = df

        # =========
        # REPORT TEXT
        # =========
        self.txt.delete("1.0", "end")
        lines = []
        lines.append("")
        lines.append("=== CLASSIFICA LARGHEZZE VANO MURO ===")

        lines.append("")
        lines.append("Singola anta:")
        for _, r in single_widths.head(15).iterrows():
            lines.append(f"- {int(r['w_raw_mm'])} mm : {int(r['count'])} porte")

        lines.append("")
        lines.append("Doppia anta:")
        for _, r in double_widths.head(15).iterrows():
            lines.append(f"- {int(r['w_raw_mm'])} mm : {int(r['count'])} porte")
            
        lines.append("REPORT STATISTICO (su dati attuali in griglia)")
        lines.append("")

        lines.append("=== TOTALI ===")
        lines.append(f"- Totale porte: {n_total}")
        lines.append(f"- Scorrevoli (PS): {n_sliding}")
        lines.append(f"- Battenti (PB): {n_swing}")
        lines.append("")

        lines.append("=== AZIONAMENTO (pos6) ===")
        lines.append("")
        lines.append("=== SCORREVOLI (STATISTICA VANI MURO) ===")
        lines.append(f"- Scorrevoli automatiche ermetiche (TE): {sliding_auto_te}")
        lines.append(f"- Scorrevoli automatiche semplici (T): {sliding_auto_t}")
        lines.append(f"- Scorrevoli manuali: {sliding_manual}")
        lines.append("")
        
        lines.append(f"- Manuali: {n_manual}")
        lines.append(f"- Automatiche: {n_auto}")
        lines.append(f"- Semiautomatiche: {n_semi}")
        lines.append("")
        lines.append("Split tipo × azionamento:")
        lines.append(f"- Battenti manuali: {swing_manual} | battenti automatiche: {swing_auto} | battenti semiauto: {swing_semi}")
        lines.append(f"- Scorrevoli manuali: {sliding_manual} | scorrevoli automatiche: {sliding_auto} | scorrevoli semiauto: {sliding_semi}")
        lines.append("")

        def print_stats(title, df_stats):

            lines.append("")
            lines.append(title)

            for _, r in df_stats.head(10).iterrows():

                luce = int(r["w_raw_mm"])
                porte = int(r["porte"])
                carter = int(r["carter_mm"])

                lines.append(
                    f"- {luce} mm : {porte} porte | carter {carter} mm"
                )


        print_stats("=== SCORREVOLI MANUALI SINGOLA ANTA ===", stats_manual_single)
        print_stats("=== SCORREVOLI MANUALI DOPPIA ANTA ===", stats_manual_double)

        print_stats("=== SCORREVOLI T SINGOLA ANTA ===", stats_t_single)
        print_stats("=== SCORREVOLI T DOPPIA ANTA ===", stats_t_double)

        print_stats("=== SCORREVOLI TE SINGOLA ANTA ===", stats_te_single)
        print_stats("=== SCORREVOLI TE DOPPIA ANTA ===", stats_te_double)

        lines.append("=== TENUTA ===")
        lines.append(f"- Tenute semplici (T): {n_simple}")
        lines.append(f"- Tenute ermetiche (TE): {n_herm}")
        lines.append(f"- Tenute ermetiche > 100 kg: {herm_gt_100}")
        lines.append(f"- Tenute ermetiche <= 100 kg: {herm_le_100}")
        lines.append("")

        lines.append("=== PIOMBO + RANGE PESO ANTA (solo piombate) ===")
        lines.append(f"- Semplici piombate: {len(simple_leaded_weights)} | range peso anta: {smin} .. {smax}")
        lines.append(f"- Ermetiche piombate: {len(herm_leaded_weights)} | range peso anta: {hmin} .. {hmax}")
        lines.append("")

        lines.append("=== AUTOMATICHE (tutte le combinazioni richieste) ===")
        lines.append(f"- Automatiche TE: {auto_te}")
        lines.append(f"- Automatiche T: {auto_t}")
        lines.append(f"- Automatiche piombate: {auto_pb}")
        lines.append(f"- Automatiche NON piombate: {auto_nopb}")
        lines.append(f"- Automatiche >100 kg: {auto_gt100}")
        lines.append(f"- Automatiche <=100 kg: {auto_le100}")
        lines.append(f"- Automatiche ermetiche piombate: {auto_te_pb}")
        lines.append(f"- Automatiche semplici piombate: {auto_t_pb}")
        lines.append("")
        lines.append("Breakdown automatiche per tipo porta:")
        lines.append(f"- Auto TE battenti: {auto_te_swing} | Auto TE scorrevoli: {auto_te_sliding}")
        lines.append(f"- Auto piombate battenti: {auto_pb_swing} | Auto piombate scorrevoli: {auto_pb_sliding}")
        lines.append("")

        lines.append(f"=== TOP {topn} PROGETTI PER NUMERO PORTE ===")
        for i, r in top.iterrows():
            lines.append(
                f"{i+1:>2}. {r['project_id']} -> {int(r['doors'])} porte "
                f"(PS={int(r['sliding'])}, PB={int(r['swing'])}, "
                f"MAN={int(r['manual'])}, AUTO={int(r['auto'])}, SEMI={int(r['semi'])}, "
                f"TE={int(r['herm'])}, T={int(r['simple'])}, Pb={int(r['leaded'])})"
            )

        lines.append("")
        lines.append("=== COMBINAZIONI COMPLETE (drive × tipo × tenuta × piombo × peso_bin) ===")
        lines.append("Vedi tab 'Combinazioni (Pivot)' e foglio Excel 'COMBINATIONS' in export.")

        lines.append("")
        lines.append("=== TOP LARGHEZZE GLOBALI ===")

        for _, r in global_widths.head(10).iterrows():
            lines.append(
                f"- {int(r['w_raw_mm'])} mm : {int(r['count'])} porte "
                f"({round(r['percent'],2)} %)"
            )

        lines.append("")
        lines.append("Copertura produzione:")
        lines.append(f"- Top 3 larghezze coprono: {round(top3_cov,2)} %")
        lines.append(f"- Top 5 larghezze coprono: {round(top5_cov,2)} %")
        lines.append(f"- Top 10 larghezze coprono: {round(top10_cov,2)} %")

        # =========
        # PIOMBO REPORT (PRIMA di inserire nel widget)
        # =========
        lines.append("")
        lines.append("=== CONSUMO PIOMBO ===")
        lines.append(f"Kg totali piombo utilizzati: {round(total_lead_kg,2)} kg")
        lines.append(f"Superficie totale piombata: {round(total_lead_m2,2)} m²")
        lines.append("")
        lines.append("Dettaglio per spessore:")
        for mm in [1,2,3,4]:
            lines.append(
                f"- {mm} mm -> {round(m2_by_mm[mm],2)} m² | {round(kg_by_mm[mm],2)} kg"
            )

        # ORA inserisci tutto nel Text
        self.txt.delete("1.0", "end")
        self.txt.insert("1.0", "\n".join(lines))

        # =========
        # Fill TOP table
        # =========
        self._clear_tree(self.top_tree)
        for _, r in top.iterrows():
            self.top_tree.insert(
                "", "end",
                values=(
                    r["project_id"],
                    int(r["doors"]),
                    int(r["sliding"]),
                    int(r["swing"]),
                    int(r["manual"]),
                    int(r["auto"]),
                    int(r["semi"]),
                    int(r["herm"]),
                    int(r["simple"]),
                    int(r["leaded"]),
                    round(float(r["wmin"]), 2),
                    round(float(r["wmax"]), 2),
                )
            )

        # =========
        # Fill COMBO table
        # =========
        self._clear_tree(self.combo_tree)
        for _, r in combo_df.iterrows():
            self.combo_tree.insert(
                "", "end",
                values=(r["drive"], r["door_type"], r["seal"], r["piombo_flag"], r["peso_bin"], int(r["count"]))
            )

        self.set_status(f"Analisi completata. Porte: {len(df)} | Progetti: {len(proj)}")
        if len(top):
            messagebox.showinfo("OK", f"Analisi completata.\nTop progetto: {top.iloc[0]['project_id']} ({int(top.iloc[0]['doors'])} porte)")
        else:
            messagebox.showinfo("OK", "Analisi completata.")

    def export_dashboard_report(self, writer):
        """
        Converte il report testuale della dashboard in tabella Excel
        """
        text = self.txt.get("1.0", "end").strip()
        rows = []

        for line in text.split("\n"):
            line = line.strip()

            if not line:
                continue

            if ":" in line:
                left, right = line.split(":", 1)
            elif "->" in line:
                left, right = line.split("->", 1)
            else:
                rows.append({"Voce": line, "Valore": ""})
                continue

            rows.append({
                "Voce": left.replace("-", "").strip(),
                "Valore": right.strip()
            })

        df = pd.DataFrame(rows)
        df.to_excel(writer, index=False, sheet_name="REPORT_DASHBOARD")

    def export_excel(self):
        if self.results_detail_df is None or self.results_project_df is None or self.results_combo_df is None:
            messagebox.showwarning("Attenzione", "Prima esegui l'analisi.")
            return

        path = filedialog.asksaveasfilename(
            title="Salva report Excel",
            defaultextension=".xlsx",
            filetypes=[("Excel", "*.xlsx")]
        )
        if not path:
            return
        try:
            with pd.ExcelWriter(path, engine="openpyxl") as w:
                self.results_detail_df.to_excel(w, index=False, sheet_name="DETAILS_GRID")
                self.results_project_df.to_excel(w, index=False, sheet_name="PROJECTS_SUMMARY")
                self.results_combo_df.to_excel(w, index=False, sheet_name="COMBINATIONS")

                # nuovo foglio con il report della dashboard
                self.export_dashboard_report(w)
                # statistiche luci scorrevoli
                if hasattr(self, "sliding_stats_export"):
                    self.sliding_stats_export.to_excel(
                        w,
                        index=False,
                        sheet_name="SCORREVOLI_LUCI_CARTER"
                    )
        except Exception as e:
            messagebox.showerror("Errore", str(e))
            return
        messagebox.showinfo("OK", "Export completato.")

    def _clear_tree(self, tree: ttk.Treeview):
        for it in tree.get_children():
            tree.delete(it)

# =========================
# MAIN
# =========================
if __name__ == "__main__":
    App().mainloop()
