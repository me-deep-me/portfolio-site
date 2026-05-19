# app_gui.py
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import json
import math
import numpy as np

# Matplotlib embed
import matplotlib
matplotlib.use("TkAgg")
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg

# Excel import (facoltativo)
try:
    import pandas as pd
    HAS_PANDAS = True
except Exception:
    HAS_PANDAS = False

import sys, os

from packing_core import (
    Container,
    Crate,
    pack_into_multiple_containers_fast,
)


def _running_frozen() -> bool:
    return getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS")


PY_REQUIRED = (3, 11)
if not _running_frozen():
    if (sys.version_info.major, sys.version_info.minor) != PY_REQUIRED:
        print(f"[WARN] Python ideale {PY_REQUIRED[0]}.{PY_REQUIRED[1]}, "
              f"stai usando {sys.version.split()[0]}. Procedo comunque.")
# <-- come prima: nessun sys.exit()

# ---------------------------- THEMES & THEME MANAGER ----------------------------

THEMES = {
    "light": {
        "bg": "#F3F4F6",
        "bg_frame": "#FFFFFF",
        "fg": "#111827",
        "muted": "#6B7280",
        "accent": "#111827",
        "accent_soft": "#E5E7EB",
        "accent_text": "#FFFFFF",
        "border": "#D1D5DB",
        "grid": "#D1D5DB",
        "tree_bg": "#FFFFFF",
        "tree_header_bg": "#F3F4F6",
        "tree_header_fg": "#111827",
        "tree_sel_bg": "#111827",
        "tree_sel_fg": "#FFFFFF",
    },
    "dark": {
        "bg": "#020617",            # sfondo finestra principale (quasi nero blu)
        "bg_frame": "#020617",      # sfondo frame
        "fg": "#E5E7EB",            # testo principale
        "muted": "#9CA3AF",         # testo secondario
        "accent": "#38BDF8",        # ciano (accent unico)
        "accent_soft": "#111827",   # bottoni/elementi soft
        "accent_text": "#020617",   # testo su accent
        "border": "#1F2933",
        "grid": "#1F2933",
        "tree_bg": "#020617",
        "tree_header_bg": "#0B1120",
        "tree_header_fg": "#E5E7EB",
        "tree_sel_bg": "#38BDF8",
        "tree_sel_fg": "#020617",
    }
}


class ThemeManager:
    def __init__(self, root: tk.Tk, style: ttk.Style, theme_name: str = "light"):
        self.root = root
        self.style = style
        self.current = theme_name

        # font globale "corporate"
        self.root.option_add("*Font", "{Segoe UI} 10")
        self.root.option_add("*TCombobox*Listbox*Font", "{Segoe UI} 10")

        self.apply(theme_name)

    def apply(self, theme_name: str):
        self.current = theme_name
        t = THEMES[theme_name]

        # Sfondo finestra principale
        self.root.configure(bg=t["bg"])

        # Menù di base
        self.root.option_add("*Menu*background", t["bg_frame"])
        self.root.option_add("*Menu*foreground", t["fg"])
        self.root.option_add("*Menu*activeBackground", t["accent_soft"])
        self.root.option_add("*Menu*activeForeground", t["fg"])

        # Base ttk
        self.style.theme_use("clam")

        # Default per tutti i widget ttk
        self.style.configure(
            ".",
            background=t["bg_frame"],
            foreground=t["fg"],
            font=("Segoe UI", 10)
        )

        # Frame & Label
        self.style.configure("TFrame", background=t["bg_frame"])
        self.style.configure("TLabelframe",
                             background=t["bg_frame"],
                             foreground=t["fg"])
        self.style.configure("TLabelframe.Label",
                             background=t["bg_frame"],
                             foreground=t["muted"],
                             font=("Segoe UI", 9, "bold"))
        self.style.configure("TLabel",
                             background=t["bg_frame"],
                             foreground=t["fg"])

        # Bottoni standard
        self.style.configure(
            "TButton",
            background=t["accent_soft"],
            foreground=t["fg"],
            padding=(12, 6),
            borderwidth=0,
            focusthickness=0
        )
        self.style.map(
            "TButton",
            background=[("active", t["border"]), ("pressed", t["border"])],
            foreground=[("active", t["fg"]), ("pressed", t["fg"])]
        )

        # Bottone primario (call-to-action)
        self.style.configure(
            "Primary.TButton",
            background=t["accent"],
            foreground=t["accent_text"],
            padding=(14, 7),
            borderwidth=0,
            focusthickness=0
        )
        self.style.map(
            "Primary.TButton",
            background=[("active", t["accent"]), ("pressed", t["accent_soft"])],
            foreground=[("pressed", t["accent_text"])]
        )

        # Checkbutton, Entry, Combobox (campo)
        self.style.configure("TCheckbutton",
                             background=t["bg_frame"],
                             foreground=t["fg"])
        self.style.configure("TEntry",
                             fieldbackground=t["bg"],
                             foreground=t["fg"],
                             insertcolor=t["fg"],
                             relief="flat")
        self.style.configure("TCombobox",
                             fieldbackground=t["bg"],
                             foreground=t["fg"],
                             background=t["bg_frame"],
                             arrowsize=14)

        # Lista della Combobox (dropdown)
        if theme_name == "dark":
            self.root.option_add("*TCombobox*Listbox.background", t["bg"])
            self.root.option_add("*TCombobox*Listbox.foreground", t["fg"])
            self.root.option_add("*TCombobox*Listbox.selectBackground", t["accent"])
            self.root.option_add("*TCombobox*Listbox.selectForeground", t["accent_text"])
        else:
            self.root.option_add("*TCombobox*Listbox.background", t["bg_frame"])
            self.root.option_add("*TCombobox*Listbox.foreground", t["fg"])
            self.root.option_add("*TCombobox*Listbox.selectBackground", t["accent"])
            self.root.option_add("*TCombobox*Listbox.selectForeground", t["accent_text"])

        # Notebook (tabs)
        self.style.configure("TNotebook", background=t["bg"])
        self.style.configure(
            "TNotebook.Tab",
            background=t["bg_frame"],
            foreground=t["muted"],
            padding=(16, 8),
            borderwidth=0
        )
        self.style.map(
            "TNotebook.Tab",
            background=[("selected", t["accent"])],
            foreground=[("selected", t["accent_text"])]
        )

        # Treeview stile dashboard
        self.style.configure(
            "Custom.Treeview",
            background=t["tree_bg"],
            fieldbackground=t["tree_bg"],
            foreground=t["fg"],
            bordercolor=t["border"],
            borderwidth=0,
            rowheight=26
        )
        self.style.map(
            "Custom.Treeview",
            background=[("selected", t["tree_sel_bg"])],
            foreground=[("selected", t["tree_sel_fg"])]
        )

        # Header della Treeview
        self.style.configure(
            "Custom.Treeview.Heading",
            background=t["tree_header_bg"],
            foreground=t["tree_header_fg"],
            bordercolor=t["border"],
            borderwidth=1,
            relief="flat",
            font=("Segoe UI", 9, "bold")
        )
        self.style.map(
            "Custom.Treeview.Heading",
            background=[
                ("active", t["accent_soft"]),
                ("pressed", t["accent"])
            ],
            foreground=[
                ("pressed", t["accent_text"])
            ]
        )

        # Scrollbar sottili
        self.style.configure(
            "Vertical.TScrollbar",
            background=t["bg_frame"],
            troughcolor=t["bg"],
            bordercolor=t["bg_frame"],
            arrowcolor=t["fg"],
            gripcount=0
        )
        self.style.configure(
            "Horizontal.TScrollbar",
            background=t["bg_frame"],
            troughcolor=t["bg"],
            bordercolor=t["bg_frame"],
            arrowcolor=t["fg"],
            gripcount=0
        )

    def toggle(self):
        self.apply("light" if self.current == "dark" else "dark")



class App:
    def __init__(self, root):
        self.root = root
        self.root.title("Packaging Calculator")
        self.root.geometry("1200x780")

        # STYLE + THEME (parte in white)
        self.style = ttk.Style()
        self.theme_manager = ThemeManager(self.root, self.style, theme_name="light")

        # Preset container
        self.containers_map = {
            "Container 40'":    Container(length=12036, width=2340, height=2280),
            "Container 20'":    Container(length=5900,  width=2342, height=2280),
            "Container 40' HC": Container(length=12036, width=2340, height=2580),
            "Container 20' HC": Container(length=5900,  width=2342, height=2580),
            "TIR":              Container(length=13600, width=2400, height=2400),
        }

        self.container_choice = tk.StringVar(value="Container 40'")

        self.use_custom_var = tk.BooleanVar(value=False)
        self.custom_L_var = tk.StringVar()
        self.custom_W_var = tk.StringVar()
        self.custom_H_var = tk.StringVar()

        # Lista casse inserite
        self.crates = []  # list[Crate]
        
        # Stato drag & drop per la vista panoramica (persistente)
        self.overview_drag_state = {
            "active": False,
            "p": None,
            "patch": None,
            "text": None,
            "container_idx": None,
            "canvas_fig": None,
            "dx": 0,
            "dy": 0,
            "last_valid": None,
            "orig_lw": None,
            "orig_alpha": None,
            "target_container_idx": None
        }

        self._build_ui()

    def _remove_placed_item_by_identity(self, placed_list, target):
        for i, item in enumerate(placed_list):
            if item is target:
                placed_list.pop(i)
                return True
        return False


    def _unbind_global_drag(self):
        try:
            self.root.unbind_all("<B1-Motion>")
        except Exception:
            pass
        try:
            self.root.unbind_all("<ButtonRelease-1>")
        except Exception:
            pass


    def _bind_global_drag(self, motion_cb, release_cb):
        self._unbind_global_drag()
        self.root.bind_all("<B1-Motion>", motion_cb, add="+")
        self.root.bind_all("<ButtonRelease-1>", release_cb, add="+")


    def _widget_contains_root_point(self, widget, root_x, root_y):
        try:
            wx = widget.winfo_rootx()
            wy = widget.winfo_rooty()
            ww = widget.winfo_width()
            wh = widget.winfo_height()
            return wx <= root_x <= wx + ww and wy <= root_y <= wy + wh
        except Exception:
            return False


    def _pixel_to_data_axes(self, canvas_fig, pixel_x, pixel_y):
        """
        pixel_x / pixel_y relativi al widget Tk del canvas.
        Restituisce coordinate dati dell'axes.
        NON chiama draw() per evitare ricorsioni e glitch durante il drag.
        """
        try:
            fig = canvas_fig.figure
            ax = fig.axes[0]
            widget = canvas_fig.get_tk_widget()

            w_px = widget.winfo_width()
            h_px = widget.winfo_height()
            if w_px <= 0 or h_px <= 0:
                return None, None

            # Tk: y cresce verso il basso → invertiamo per matplotlib (origine in basso a sinistra)
            fig_x = float(pixel_x) / w_px
            fig_y = 1.0 - float(pixel_y) / h_px

            # Controlla che il punto sia dentro l'area della figura (0..1)
            if not (0.0 <= fig_x <= 1.0 and 0.0 <= fig_y <= 1.0):
                return None, None

            # figure-fraction → display coords → data coords
            disp_xy = fig.transFigure.transform((fig_x, fig_y))
            data_xy = ax.transData.inverted().transform(disp_xy)

            # Verifica che le coordinate data siano dentro i limiti degli assi
            xlim = ax.get_xlim()
            ylim = ax.get_ylim()
            data_x, data_y = float(data_xy[0]), float(data_xy[1])
            if data_x < xlim[0] or data_x > xlim[1] or data_y < ylim[0] or data_y > ylim[1]:
                return None, None

            return data_x, data_y
        except Exception:
            return None, None

    # ---------- UI ----------
    def _build_ui(self):
        # Menu
        menubar = tk.Menu(self.root, tearoff=0)
        filemenu = tk.Menu(menubar, tearoff=0)
        filemenu.add_command(label="Importa Excel...", command=self.import_excel)
        filemenu.add_separator()
        filemenu.add_command(label="Esci", command=self.root.destroy)
        menubar.add_cascade(label="File", menu=filemenu)
        self.root.config(menu=menubar)

        # Header con titolo + "Designed by ME."
        header = ttk.Frame(self.root)
        header.pack(fill="x", padx=16, pady=12)

        title = ttk.Label(
            header,
            text="Sistema di Calcolo Packaging Ottimizzato",
            font=("Segoe UI Semibold", 16)
        )
        title.pack(side="left")

        brand_home = ttk.Label(
            header,
            text="Designed by ME.",
            font=("Segoe UI", 8, "italic")
        )
        brand_home.pack(side="right")

        

        # Container choice
        cont_frame = ttk.LabelFrame(self.root, text="Tipo di Container", padding=10)
        cont_frame.pack(fill="x", padx=16, pady=(0, 10))

        ttk.Label(cont_frame, text="Seleziona:").grid(row=0, column=0, sticky="w")
        combo = ttk.Combobox(
            cont_frame,
            values=list(self.containers_map.keys()),
            textvariable=self.container_choice,
            state="readonly", width=25
        )
        combo.grid(row=0, column=1, padx=8, sticky="w")

        # Checkbox per usare valori custom
        ttk.Checkbutton(
            cont_frame, text="Usa L/W/H custom", variable=self.use_custom_var
        ).grid(row=0, column=2, padx=12, sticky="w")

        # Campi L/W/H custom
        ttk.Label(cont_frame, text="L (mm):").grid(row=0, column=3, sticky="e")
        eL = ttk.Entry(cont_frame, textvariable=self.custom_L_var, width=8)
        eL.grid(row=0, column=4, padx=4, sticky="w")

        ttk.Label(cont_frame, text="W (mm):").grid(row=0, column=5, sticky="e")
        eW = ttk.Entry(cont_frame, textvariable=self.custom_W_var, width=8)
        eW.grid(row=0, column=6, padx=4, sticky="w")

        ttk.Label(cont_frame, text="H (mm):").grid(row=0, column=7, sticky="e")
        eH = ttk.Entry(cont_frame, textvariable=self.custom_H_var, width=8)
        eH.grid(row=0, column=8, padx=4, sticky="w")

        # Invio rapido
        for w in (eL, eW, eH):
            w.bind("<Return>", lambda _e: self.calculate_packages())

        # Input crate
        input_frame = ttk.LabelFrame(self.root, text="Inserimento Cassa singola", padding=10)
        input_frame.pack(fill="x", padx=16, pady=(0, 10))

        ttk.Label(input_frame, text="Collo #:").grid(row=0, column=0, sticky="e", padx=4, pady=4)
        self.collo_entry = ttk.Entry(input_frame, width=12)
        self.collo_entry.grid(row=0, column=1, sticky="w", padx=4, pady=4)

        ttk.Label(input_frame, text="Testo/Tag:").grid(row=0, column=2, sticky="e", padx=4, pady=4)
        self.txt_entry = ttk.Entry(input_frame, width=28)
        self.txt_entry.grid(row=0, column=3, sticky="w", padx=4, pady=4)

        ttk.Label(input_frame, text="L (mm):").grid(row=0, column=4, sticky="e", padx=4, pady=4)
        self.L_entry = ttk.Entry(input_frame, width=10)
        self.L_entry.grid(row=0, column=5, sticky="w", padx=4, pady=4)

        ttk.Label(input_frame, text="W (mm):").grid(row=0, column=6, sticky="e", padx=4, pady=4)
        self.W_entry = ttk.Entry(input_frame, width=10)
        self.W_entry.grid(row=0, column=7, sticky="w", padx=4, pady=4)

        ttk.Label(input_frame, text="H (mm):").grid(row=0, column=8, sticky="e", padx=4, pady=4)
        self.H_entry = ttk.Entry(input_frame, width=10)
        self.H_entry.grid(row=0, column=9, sticky="w", padx=4, pady=4)

        self.accept_var = tk.BooleanVar(value=False)
        ttk.Checkbutton(input_frame, text="Accetta sopra?", variable=self.accept_var) \
            .grid(row=0, column=10, padx=8, pady=4)

        add_btn = ttk.Button(input_frame, text="Aggiungi", command=self.add_crate)
        add_btn.grid(row=0, column=11, padx=8, pady=4)

        # List of crates
        list_frame = ttk.LabelFrame(self.root, text="Articoli Inseriti", padding=10)
        list_frame.pack(fill="both", expand=True, padx=16, pady=(0, 10))

        cols = ("Check", "Collo", "Testo", "L", "W", "H")
        self.tree = ttk.Treeview(
            list_frame,
            columns=cols,
            show="headings",
            height=14,
            style="Custom.Treeview"
        )
        for c in cols:
            self.tree.heading(c, text=c)
            if c == "Testo":
                self.tree.column(c, anchor="center", width=360)
            elif c == "Check":
                self.tree.column(c, anchor="center", width=80)
            elif c == "Collo":
                self.tree.column(c, anchor="center", width=90)
            else:
                self.tree.column(c, anchor="center", width=100)
        self.tree.pack(fill="both", expand=True)

        self._check_state = {}

        def _toggle_check(event):
            region = self.tree.identify("region", event.x, event.y)
            if region != "cell":
                return
            col = self.tree.identify_column(event.x)
            if col != "#1":
                return
            rowid = self.tree.identify_row(event.y)
            if not rowid:
                return
            cur = self._check_state.get(rowid, False)
            self._check_state[rowid] = not cur
            vals = list(self.tree.item(rowid, "values"))
            vals[0] = "☑" if self._check_state[rowid] else "☐"
            self.tree.item(rowid, values=vals)

            idx = self._row_canstack.get(rowid)
            if idx is not None and 0 <= idx < len(self.crates):
                self.crates[idx].can_stack_top = self._check_state[rowid]

        self.tree.bind("<Button-1>", _toggle_check)

        # mappa iid -> bool (can_stack_top)
        self._row_canstack = {}

        def _prefill_custom(*_):
            if self.use_custom_var.get():
                c = self.containers_map.get(self.container_choice.get())
                if c:
                    self.custom_L_var.set(str(c.length))
                    self.custom_W_var.set(str(c.width))
                    self.custom_H_var.set(str(c.height))

        self.use_custom_var.trace_add("write", _prefill_custom)

        # Control buttons
        control = ttk.Frame(self.root)
        control.pack(fill="x", padx=16, pady=14)

        ttk.Button(
            control,
            text="CALCOLA PACKAGING",
            command=self.calculate_packages,
            style="Primary.TButton"
        ).pack(side="left", padx=8)

        ttk.Button(control, text="Elimina selezionato", command=self.delete_selected) \
            .pack(side="left", padx=8)

        ttk.Button(control, text="Pulisci Lista", command=self.clear_list) \
            .pack(side="left", padx=8)

        ttk.Button(control, text="Salva Risultati", command=self.save_results) \
            .pack(side="left", padx=8)

        ttk.Button(control, text="Importa Excel...", command=self.import_excel) \
            .pack(side="left", padx=8)

        # Toggle tema
        ttk.Button(control, text="Tema Black / White", command=self._toggle_theme) \
            .pack(side="right", padx=8)

        # Enter shortcuts
        self.txt_entry.bind("<Return>", lambda e: self.add_crate())
        self.L_entry.bind("<Return>", lambda e: self.add_crate())
        self.W_entry.bind("<Return>", lambda e: self.add_crate())
        self.H_entry.bind("<Return>", lambda e: self.add_crate())

    # ---------- Theme toggle ----------
    def _toggle_theme(self):
        self.theme_manager.toggle()

    # ---------- Actions ----------
    def add_crate(self):
        label = self.txt_entry.get().strip()
        Ls = self.L_entry.get().strip()
        Ws = self.W_entry.get().strip()
        Hs = self.H_entry.get().strip()

        if not (label and Ls and Ws and Hs):
            messagebox.showwarning("Attenzione", "Inserisci Collo/Testo/L/W/H.")
            return
        try:
            L = int(Ls)
            W = int(Ws)
            H = int(Hs)
            if L <= 0 or W <= 0 or H <= 0:
                raise ValueError
        except ValueError:
            messagebox.showerror("Errore", "Dimensioni non valide. Usa interi positivi (mm).")
            return

        collo_str = self.collo_entry.get().strip()
        if collo_str:
            try:
                collo = int(float(collo_str))
            except Exception:
                messagebox.showerror("Errore", "Collo deve essere un numero.")
                return
        else:
            try:
                existing = [int(self.tree.item(i)['values'][1]) for i in self.tree.get_children()]
                collo = max(existing) + 1 if existing else 1
            except Exception:
                collo = len(self.crates) + 1

        checked = bool(self.accept_var.get())

        crate = Crate(collo=collo, label=label, L=L, W=W, H=H, can_stack_top=checked)
        self.crates.append(crate)

        iid = self.tree.insert("", "end",
                               values=("☑" if checked else "☐", collo, label, L, W, H))
        self._check_state[iid] = checked
        self._row_canstack[iid] = len(self.crates) - 1 

        self.collo_entry.delete(0, tk.END)
        self.txt_entry.delete(0, tk.END)
        self.L_entry.delete(0, tk.END)
        self.W_entry.delete(0, tk.END)
        self.H_entry.delete(0, tk.END)
        self.accept_var.set(False)

    def delete_selected(self):
        sel = self.tree.selection()
        if not sel:
            messagebox.showinfo("Info", "Seleziona una riga da eliminare.")
            return
        for iid in sel:
            vals = self.tree.item(iid)['values']
            _, collo, label, L, W, H = vals
            L, W, H = int(L), int(W), int(H)
            for i, c in enumerate(self.crates):
                if c.collo == collo and c.label == label and c.L == L and c.W == W and c.H == H:
                    self.crates.pop(i)
                    break
            self._row_canstack.pop(iid, None)
            self.tree.delete(iid)

    def clear_list(self):
        self.crates = []
        for iid in self.tree.get_children():
            self.tree.delete(iid)

    def get_selected_container(self) -> Container:
        if self.use_custom_var.get():
            try:
                L = int(self.custom_L_var.get())
                W = int(self.custom_W_var.get())
                H = int(self.custom_H_var.get())
                if L <= 0 or W <= 0 or H <= 0:
                    raise ValueError
                return Container(length=L, width=W, height=H)
            except Exception:
                messagebox.showerror("Errore", "L/W/H custom devono essere interi positivi (mm).")
        return self.containers_map.get(self.container_choice.get(), list(self.containers_map.values())[0])

    def calculate_packages(self):
        if not self.crates:
            messagebox.showwarning("Attenzione", "Nessuna cassa inserita.")
            return

        cont_template = self.get_selected_container()

        containers, not_placed = pack_into_multiple_containers_fast(
            self.crates,
            cont_template
        )

        if not containers and not not_placed:
            messagebox.showerror("Esito", "Nessuna cassa posizionabile nei container selezionati.")
            return

        self._show_results_window(containers, not_placed, cont_template)

    def _try_repack_last_container(self, containers, cont_template: Container):
        """
        Se il tipo selezionato è 40'/40' HC, prova a ricollocare SOLO
        le casse dell’ultimo container in un 20' o 20' HC.
        Se tutte le casse stanno in un singolo 20'/20' HC, restituisce un dict
        con la configurazione alternativa e i container alternativi,
        altrimenti None.
        """
        choice = self.container_choice.get()

        if choice not in ("Container 40'", "Container 40' HC"):
            return None
        if not containers:
            return None

        # Ultimo container (per indice logico)
        last_cont = max(containers, key=lambda c: c.get("index", 0))

        # Raccolgo le casse uniche (anche quelle impilate)
        unique_crates = []
        seen = set()

        for p in last_cont.get("placed", []):
            cr = p.get("crate")
            if cr and id(cr) not in seen:
                seen.add(id(cr))
                unique_crates.append(cr)

            st = p.get("stacked_on")
            if st:
                cr2 = st.get("crate")
                if cr2 and id(cr2) not in seen:
                    seen.add(id(cr2))
                    unique_crates.append(cr2)

        if not unique_crates:
            return None

        # Clono le casse per non sporcare lo stato del primo calcolo
        def clone_crates(crates):
            return [
                Crate(
                    collo=c.collo,
                    label=c.label,
                    L=c.L,
                    W=c.W,
                    H=c.H,
                    can_stack_top=c.can_stack_top
                )
                for c in crates
            ]

        candidate_results = []

        # Provo sia 20' sia 20' HC
        for key in ("Container 20'", "Container 20' HC"):
            small_ct = self.containers_map.get(key)
            if not small_ct:
                continue

            alt_conts, alt_not_placed = pack_into_multiple_containers_fast(
                clone_crates(unique_crates),
                small_ct
            )

            # Valido solo se TUTTE le casse stanno in UN solo container
            if alt_conts and not alt_not_placed and len(alt_conts) == 1:
                candidate_results.append({
                    "small_type": key,
                    "small_template": small_ct,
                    "alt_containers": alt_conts,
                })

        if not candidate_results:
            return None

        # Ordine di preferenza fisso:
        # 1) 20' standard
        # 2) 20' HC
        priority_order = ["Container 20'", "Container 20' HC"]
        best = None
        for small in priority_order:
            for r in candidate_results:
                if r["small_type"] == small:
                    best = r
                    break
            if best:
                break

        if not best:
            return None

        return {
            "base_type": choice,
            "base_count": max(0, len(containers) - 1),
            "small_type": best["small_type"],
            "small_count": 1,
            "alt_containers": best["alt_containers"],
            "alt_template": best["small_template"],
        }


    # ---------- Results UI ----------
    def _show_results_window(self, containers, not_placed, cont_template: Container):
        label_ct = (f"Custom {cont_template.length}×{cont_template.width}×{cont_template.height} mm"
                    if self.use_custom_var.get() else self.container_choice.get())

        win = tk.Toplevel(self.root)
        win.title(f"Risultati OTTIMIZZATI – {label_ct}")
        win.geometry("1400x900")

        # --- RIEPILOGO ALTO ---
        summary = ttk.Frame(win)
        summary.pack(fill="x", padx=10, pady=(10, 0))

        total = len(containers)
        base_txt = f"Risultato: n°{total} {label_ct}"
        base_lbl = ttk.Label(summary, text=base_txt, font=("Segoe UI Semibold", 11))
        base_lbl.pack(side="left")

        # Prova ricollocazione dell’ULTIMO 40'/40' HC in 20'/20' HC
        alt = self._try_repack_last_container(containers, cont_template)
        if alt:
            alt_txt = (
                f" → alternativa possibile: "
                f"n°{alt['base_count']} {alt['base_type']} + "
                f"n°{alt['small_count']} {alt['small_type']}"
            )
            alt_lbl = ttk.Label(summary, text=alt_txt, font=("Segoe UI", 10))
            alt_lbl.pack(side="left", padx=16)

        # Marca in alto a destra
        brand_lbl = ttk.Label(summary, text="Designed by ME.", font=("Segoe UI", 8, "italic"))
        brand_lbl.pack(side="right", padx=8)

        if not_placed:
            np_txt = f"Casse non posizionate: {len(not_placed)}"
            np_lbl = ttk.Label(summary, text=np_txt, font=("Segoe UI", 9))
            np_lbl.pack(side="right", padx=8)

        # --- NOTEBOOK ---
        nb = ttk.Notebook(win)
        nb.pack(fill="both", expand=True, padx=10, pady=10)

        # Vista singolo container (configurazione principale)
        single_tab = ttk.Frame(nb)
        nb.add(single_tab, text="Singolo")
        self._build_single_view(single_tab, containers, cont_template)

        # Panoramica principale
        overview_tab = ttk.Frame(nb)
        nb.add(overview_tab, text="Panoramica")

        subtitle = (f"Custom {cont_template.length}×{cont_template.width}×{cont_template.height} mm"
                    if self.use_custom_var.get() else self.container_choice.get())
        ttk.Label(overview_tab, text=subtitle, font=('Segoe UI', 10, 'italic')) \
            .pack(anchor="w", padx=10, pady=(8, 6))

        self._build_overview_view(overview_tab, containers, cont_template)

        # Tab aggiuntiva: visualizzazione alternativa (solo 20'/20' HC)
        if alt:
            alt_tab = ttk.Frame(nb)
            # Nome tab più chiaro: "Alternativa ultimo container 20' / 20' HC"
            if alt["small_type"] == "Container 20'":
                alt_tab_label = "Alternativa ultimo container 20'"
            elif alt["small_type"] == "Container 20' HC":
                alt_tab_label = "Alternativa ultimo container 20' HC"
            else:
                alt_tab_label = f"Alternativa ultimo container ({alt['small_type']})"

            nb.add(alt_tab, text=alt_tab_label)

            self._build_alt_view(
                alt_tab,
                alt["alt_containers"],
                alt["alt_template"],
                alt["small_type"]
            )

        # Tab casse non posizionate
        if not_placed:
            np_tab = ttk.Frame(nb)
            nb.add(np_tab, text="Non posizionate")
            ttk.Label(
                np_tab,
                text="Casse NON posizionate (troppo alte o nessuno spazio residuo):",
                font=('Segoe UI', 11, 'bold')
            ).pack(pady=10)
            for c in not_placed:
                ttk.Label(np_tab, text=f"• {c.label}: {c.L}×{c.W}×{c.H} mm").pack(anchor="w", padx=12)

    def _style_axes_for_theme(self, fig, ax):
        t = THEMES[self.theme_manager.current]
        fig.patch.set_facecolor(t["bg_frame"])
        ax.set_facecolor(t["bg"])
        ax.grid(True, color=t["grid"], alpha=0.3)

        ax.tick_params(colors=t["fg"])
        for spine in ax.spines.values():
            spine.set_color(t["fg"])
        ax.xaxis.label.set_color(t["fg"])
        ax.yaxis.label.set_color(t["fg"])

    def _build_single_view(self, parent, containers, cont_template: Container):
        if not containers:
            ttk.Label(parent, text="Nessun container utilizzato.").pack(pady=20)
            return

        top = ttk.Frame(parent)
        top.pack(fill="x", pady=6)
        canvas_btn = tk.Canvas(top, height=40, highlightthickness=0)
        hsb = ttk.Scrollbar(top, orient="horizontal", command=canvas_btn.xview)
        canvas_btn.configure(xscrollcommand=hsb.set)
        inner = ttk.Frame(canvas_btn)
        canvas_btn.create_window((0, 0), window=inner, anchor="nw")
        canvas_btn.pack(side="top", fill="x", expand=True)
        hsb.pack(side="bottom", fill="x")

        btns = []

        def populate():
            for i, c in enumerate(containers):
                b = ttk.Button(inner, text=f"#{c['index']}", width=4,
                               command=lambda i=i: draw(i))
                b.pack(side="left", padx=4, pady=4)
                btns.append(b)
            inner.update_idletasks()
            canvas_btn.configure(scrollregion=canvas_btn.bbox("all"))

        populate()

        fig, ax = plt.subplots(1, 1, figsize=(12, 6.2))
        canvas_fig = FigureCanvasTkAgg(fig, master=parent)
        canvas_fig.get_tk_widget().pack(fill="both", expand=True)

        bar = ttk.Frame(parent)
        bar.pack(fill="x", pady=6)
        info_lbl = ttk.Label(bar)
        info_lbl.pack(side="right", padx=8)

        def save_img():
            f = filedialog.asksaveasfilename(
                defaultextension=".png",
                filetypes=[("PNG", "*.png"), ("PDF", "*.pdf")],
                title="Salva visualizzazione"
            )
            if f:
                fig.savefig(f, dpi=300, bbox_inches='tight')
                messagebox.showinfo("Salvato", f"Immagine salvata in:\n{f}")

        ttk.Button(bar, text="Salva immagine", command=save_img).pack(side="left", padx=8)

        # ---------- Drag & Drop (solo livello 0) ----------
        # Nota: la vista e' top-down con Matplotlib. Per permettere drag-and-drop
        # aggiorniamo la posizione (x,y) dei "placed" di livello 0 e ridisegniamo il canvas.
        drag_grid_mm = 5  # Ridotto da 10mm a 5mm per movimenti più precisi
        drag_state = {
            "active": False,
            "p": None,
            "patch": None,
            "text": None,
            "dx": 0.0,
            "dy": 0.0,
            "orig_x": 0.0,
            "orig_y": 0.0,
            "last_valid": None,
            "orig_lw": None,
            "orig_alpha": None,
        }
        current_items = []  # list of {"p","patch","text","level","orig_lw","orig_alpha"}
        active_idx = {"value": 0}  # container idx currently drawn

        def _rects_overlap(a_x, a_y, a_L, a_W, b_x, b_y, b_L, b_W, tolerance=0.5) -> bool:
            # Permette una piccola tolleranza per movimenti più fluidi
            # Non consideriamo overlap se si toccano ai bordi (con tolleranza)
            return not (
                a_x + a_L <= b_x + tolerance or b_x + b_L <= a_x + tolerance or
                a_y + a_W <= b_y + tolerance or b_y + b_W <= a_y + tolerance
            )

        def _snap(v: float) -> float:
            if drag_grid_mm <= 1:
                return v
            return round(v / drag_grid_mm) * drag_grid_mm

        def _restore_drag_style():
            if drag_state["patch"] is not None and drag_state["orig_lw"] is not None:
                drag_state["patch"].set_linewidth(drag_state["orig_lw"])
            if drag_state["patch"] is not None and drag_state["orig_alpha"] is not None:
                drag_state["patch"].set_alpha(drag_state["orig_alpha"])
            if drag_state["patch"] is not None:
                drag_state["patch"].set_edgecolor(THEMES[self.theme_manager.current]["fg"])

        def on_pick(event):
            if not event.mouseevent or event.mouseevent.xdata is None or event.mouseevent.ydata is None:
                return
            artist = event.artist
            picked = None
            for it in current_items:
                if it["patch"] is artist or it["text"] is artist:
                    picked = it
                    break
            if not picked:
                return
            p = picked["p"]
            level = picked["level"]
            if level != 0:
                # Non muovo il livello 1: cambierebbe la relazione di stacking.
                return

            x_click = float(event.mouseevent.xdata)
            y_click = float(event.mouseevent.ydata)
            drag_state["active"] = True
            drag_state["p"] = p
            drag_state["patch"] = picked["patch"]
            drag_state["text"] = picked["text"]
            drag_state["dx"] = x_click - p["x"]
            drag_state["dy"] = y_click - p["y"]
            drag_state["orig_x"] = float(p["x"])
            drag_state["orig_y"] = float(p["y"])
            drag_state["last_valid"] = (float(p["x"]), float(p["y"]))
            drag_state["orig_lw"] = picked.get("orig_lw", None)
            drag_state["orig_alpha"] = picked.get("orig_alpha", None)

            # Highlight del rettangolo trascinato
            if drag_state["patch"] is not None:
                drag_state["patch"].set_linewidth(2.5)
                drag_state["patch"].set_alpha(0.98)
                drag_state["patch"].set_edgecolor("blue")

        def on_motion(event):
            if not drag_state["active"] or drag_state["p"] is None:
                return
            if not event or event.xdata is None or event.ydata is None:
                return
            p = drag_state["p"]

            x_new = float(event.xdata) - float(drag_state["dx"])
            y_new = float(event.ydata) - float(drag_state["dy"])

            # Snap
            x_new = round(x_new / drag_grid_mm) * drag_grid_mm
            y_new = round(y_new / drag_grid_mm) * drag_grid_mm

            # Limiti container
            max_x = float(cont_template.length - p["length"])
            max_y = float(cont_template.width - p["width"])
            x_new = max(0.0, min(x_new, max_x))
            y_new = max(0.0, min(y_new, max_y))

            # Collision detection contro altri elementi livello 0
            overlap = False
            for it in current_items:
                q = it["p"]
                if q is p or it["level"] != 0:
                    continue
                if _rects_overlap(x_new, y_new, float(p["length"]), float(p["width"]),
                                   float(q["x"]), float(q["y"]), float(q["length"]), float(q["width"])):
                    overlap = True
                    break

            # Aggiorna posizione visiva; se c'è overlap bordo rosso, altrimenti blu
            drag_state["patch"].set_xy((x_new, y_new))
            drag_state["patch"].set_edgecolor("red" if overlap else "blue")
            cx = x_new + p["length"] / 2
            cy = y_new + p["width"] / 2
            drag_state["text"].set_position((cx, cy))

            # Salva ultima posizione valida solo se non c'è overlap
            if not overlap:
                drag_state["last_valid"] = (x_new, y_new)

            canvas_fig.draw_idle()

        def on_release(event):
            if not drag_state["active"] or drag_state["p"] is None:
                return
            p = drag_state["p"]

            # Usa last_valid se disponibile (ultima pos senza overlap), altrimenti rollback a orig
            if drag_state["last_valid"] is not None:
                final_x, final_y = drag_state["last_valid"]
            else:
                final_x, final_y = drag_state["orig_x"], drag_state["orig_y"]

            p["x"] = final_x
            p["y"] = final_y
            drag_state["patch"].set_xy((final_x, final_y))
            drag_state["text"].set_position((final_x + p["length"] / 2, final_y + p["width"] / 2))

            _restore_drag_style()
            drag_state["active"] = False
            drag_state["p"] = None
            drag_state["patch"] = None
            drag_state["text"] = None
            drag_state["last_valid"] = None
            canvas_fig.draw_idle()

        def _hit_test_item(xdata: float, ydata: float):
            # Returns first matching level-0 item containing the cursor point.
            for it in current_items:
                if it["level"] != 0:
                    continue
                p = it["p"]
                if float(p["x"]) <= xdata <= float(p["x"]) + float(p["length"]) and \
                   float(p["y"]) <= ydata <= float(p["y"]) + float(p["width"]):
                    return it
            return None

        def on_button_press(event):
            # Double click -> rotate the rectangle (swap length/width).
            # We do it directly (no full redraw) to keep the interaction smooth.
            if not getattr(event, "dblclick", False):
                return
            if drag_state["active"]:
                return
            if not event or event.xdata is None or event.ydata is None:
                return
            if getattr(event, "button", 1) != 1:
                return

            it = _hit_test_item(float(event.xdata), float(event.ydata))
            if not it or it["level"] != 0:
                return

            p = it["p"]
            patch = it["patch"]
            txt = it["text"]

            new_L = float(p["width"])
            new_W = float(p["length"])

            # Check bounds in container
            if float(p["x"]) + new_L > float(cont_template.length) or float(p["y"]) + new_W > float(cont_template.width):
                return

            # Collision check against other level-0 items
            for q_it in current_items:
                q = q_it["p"]
                if q is p or q_it["level"] != 0:
                    continue
                if _rects_overlap(
                    float(p["x"]), float(p["y"]), new_L, new_W,
                    float(q["x"]), float(q["y"]), float(q["length"]), float(q["width"])
                ):
                    return

            # Apply rotation (swap placement dimensions)
            p["length"], p["width"] = new_L, new_W
            p["rotated"] = not bool(p.get("rotated", False))

            # Update graphics (rectangle + label)
            patch.set_width(new_L)
            patch.set_height(new_W)
            patch.set_xy((float(p["x"]), float(p["y"])))

            cx = float(p["x"]) + new_L / 2
            cy = float(p["y"]) + new_W / 2

            crate = p["crate"]
            tag = f"#{crate.collo} – {crate.L}×{crate.W}×{crate.H} mm\n{crate.label}"
            if p.get("rotated"):
                tag += " (R)"
            txt.set_text(tag)
            txt.set_position((cx, cy))
            canvas_fig.draw_idle()

        # Colleghiamo gli handler una sola volta (draw() aggiornera' current_items).
        canvas_fig.mpl_connect("pick_event", on_pick)
        canvas_fig.mpl_connect("motion_notify_event", on_motion)
        canvas_fig.mpl_connect("button_release_event", on_release)
        canvas_fig.mpl_connect("button_press_event", on_button_press)

        def draw(idx: int):
            for i, b in enumerate(btns):
                if i == idx:
                    b.state(["disabled"])
                else:
                    b.state(["!disabled"])

            ax.clear()
            self._style_axes_for_theme(fig, ax)
            active_idx["value"] = idx

            t = THEMES[self.theme_manager.current]

            ax.set_xlim(0, cont_template.length)
            ax.set_ylim(0, cont_template.width)
            ax.set_aspect('equal', adjustable='box')
            ax.add_patch(patches.Rectangle(
                (0, 0), cont_template.length, cont_template.width,
                linewidth=2, edgecolor=t["fg"], facecolor='none'
            ))
            ax.set_xlabel("Lunghezza (mm)")
            ax.set_ylabel("Larghezza (mm)")
            ct = cont_template
            label_ct = (f"Custom {ct.length}×{ct.width}×{ct.height} mm"
                        if self.use_custom_var.get() else f"{self.container_choice.get()}")
            ax.set_title(
                f"Vista dall'alto – {label_ct} – Container #{containers[idx].get('index', idx+1)} (OTTIMIZZATO)",
                color=t["fg"]
            )

            # Reset drag state/artefatti ad ogni ridisegno
            drag_state["active"] = False
            drag_state["p"] = None
            drag_state["patch"] = None
            drag_state["text"] = None
            drag_state["last_valid"] = None
            current_items.clear()

            placed = containers[idx]['placed']

            def base_of(p):
                if p.get('z', 1) == 2 and p.get('stacked_on'):
                    return p['stacked_on']['crate'].label
                return p['crate'].label

            # Ogni collo/base ha un colore distinto (palette elegante)
            base_keys = [base_of(p) for p in placed]
            uniq = {k: j for j, k in enumerate(sorted(set(base_keys)))}

            # Palette multi-colore (tab20) → professionale ma leggibile
            palette = plt.cm.tab20(np.linspace(0, 1, max(1, len(uniq))))


            lvl0 = lvl1 = 0

            for p in placed:
                level = 0 if p.get('z', 1) == 1 else 1
                if level == 0:
                    lvl0 += 1
                else:
                    lvl1 += 1

                ci = palette[uniq[base_of(p)]]
                fc_alpha = 0.85 if level == 0 else 0.45
                ls = '-' if level == 0 else '--'
                lw = 1.2 if level == 0 else 1.0

                rect = patches.Rectangle(
                    (p['x'], p['y']),
                    p['length'], p['width'],
                    facecolor=ci, edgecolor=t["fg"], linestyle=ls, linewidth=lw, alpha=fc_alpha
                )
                rect.set_picker(True)
                ax.add_patch(rect)

                cx = p['x'] + p['length'] / 2
                cy = p['y'] + p['width'] / 2

                crate = p['crate']
                # Prima riga: collo - dimensioni, seconda riga: testo
                tag = f"#{crate.collo} – {crate.L}×{crate.W}×{crate.H} mm\n{crate.label}"
                if p.get('rotated'):
                    tag += " (R)"
                if level == 1 and p.get('stacked_on'):
                    tag += f"\n(L1 sopra {p['stacked_on']['crate'].label})"

                txt = ax.text(
                    cx, cy, tag,
                    ha="center", va="center", fontsize=8,
                    bbox=dict(boxstyle="round,pad=0.25", facecolor=t["bg_frame"], alpha=0.85),
                    color=t["fg"]
                )

                txt.set_picker(True)

                current_items.append({
                    "p": p,
                    "patch": rect,
                    "text": txt,
                    "level": level,
                    "orig_lw": lw,
                    "orig_alpha": fc_alpha,
                })

            from matplotlib.lines import Line2D
            leg = [
                Line2D([0], [0], color=t["fg"], lw=1.2, linestyle='-', label='Livello 0 (a pavimento)'),
                Line2D([0], [0], color=t["fg"], lw=1.0, linestyle='--', label='Livello 1 (sovrapposto)'),
            ]
            legend = ax.legend(handles=leg, loc='upper right', framealpha=0.9)
            legend.get_frame().set_facecolor(t["bg_frame"])
            legend.get_frame().set_edgecolor(t["grid"])
            for txt in legend.get_texts():
                txt.set_color(t["fg"])

            fig.tight_layout()
            canvas_fig.draw()

            info_lbl.config(text=(
                f"Efficienza area: {containers[idx]['eff_area']*100:.1f}%   •   "
                f"Area usata: {containers[idx]['area_used']/1_000_000:.2f} m² / "
                f"{cont_template.floor_area()/1_000_000:.2f} m²   •   "
                f"Livello0: {lvl0}  Livello1: {lvl1}"
            ))

        if containers:
            draw(0)

    def _build_alt_view(self, parent, containers, cont_template: Container, label_ct: str):
        """
        Vista grafica della configurazione alternativa (di solito 1x 20' o 20' HC).
        """
        if not containers:
            ttk.Label(parent, text="Nessun container alternativo valido.").pack(pady=20)
            return

        # Prendo l’unico container alternativo (abbiamo forzato len==1)
        cont = containers[0]

        fig, ax = plt.subplots(1, 1, figsize=(12, 6.2))
        canvas_fig = FigureCanvasTkAgg(fig, master=parent)
        canvas_fig.get_tk_widget().pack(fill="both", expand=True)

        bar = ttk.Frame(parent)
        bar.pack(fill="x", pady=6)
        info_lbl = ttk.Label(bar)
        info_lbl.pack(side="right", padx=8)

        def save_img():
            f = filedialog.asksaveasfilename(
                defaultextension=".png",
                filetypes=[("PNG", "*.png"), ("PDF", "*.pdf")],
                title="Salva visualizzazione alternativa"
            )
            if f:
                fig.savefig(f, dpi=300, bbox_inches='tight')
                messagebox.showinfo("Salvato", f"Immagine salvata in:\n{f}")

        ttk.Button(bar, text="Salva immagine", command=save_img).pack(side="left", padx=8)

        # --- Disegno ---
        ax.clear()
        self._style_axes_for_theme(fig, ax)

        t = THEMES[self.theme_manager.current]

        ax.set_xlim(0, cont_template.length)
        ax.set_ylim(0, cont_template.width)
        ax.set_aspect('equal', adjustable='box')
        ax.add_patch(patches.Rectangle(
            (0, 0), cont_template.length, cont_template.width,
            linewidth=2, edgecolor=t["fg"], facecolor='none'
        ))
        ax.set_xlabel("Lunghezza (mm)")
        ax.set_ylabel("Larghezza (mm)")

        ax.set_title(
            f"Vista dall'alto – {label_ct} – Configurazione alternativa (OTTIMIZZATA)",
            color=t["fg"]
        )

        placed = cont['placed']

        def base_of(p):
            if p.get('z', 1) == 2 and p.get('stacked_on'):
                return p['stacked_on']['crate'].label
            return p['crate'].label

        # Colori per collo/base (come nella vista principale)
        base_keys = [base_of(p) for p in placed]
        uniq = {k: j for j, k in enumerate(sorted(set(base_keys)))}
        palette = plt.cm.tab20(np.linspace(0, 1, max(1, len(uniq))))

        lvl0 = lvl1 = 0

        for p in placed:
            level = 0 if p.get('z', 1) == 1 else 1
            if level == 0:
                lvl0 += 1
            else:
                lvl1 += 1

            ci = palette[uniq[base_of(p)]]
            fc_alpha = 0.85 if level == 0 else 0.45
            ls = '-' if level == 0 else '--'
            lw = 1.2 if level == 0 else 1.0

            ax.add_patch(patches.Rectangle(
                (p['x'], p['y']),
                p['length'], p['width'],
                facecolor=ci, edgecolor=t["fg"], linestyle=ls, linewidth=lw, alpha=fc_alpha
            ))

            cx = p['x'] + p['length'] / 2
            cy = p['y'] + p['width'] / 2

            crate = p['crate']
            # Prima riga: collo - dimensioni, seconda riga: testo
            tag = f"#{crate.collo} – {crate.L}×{crate.W}×{crate.H} mm\n{crate.label}"
            if p.get('rotated'):
                tag += " (R)"
            if level == 1 and p.get('stacked_on'):
                tag += f"\n(L1 sopra {p['stacked_on']['crate'].label})"


            ax.text(
                cx, cy, tag,
                ha="center", va="center", fontsize=8,
                bbox=dict(boxstyle="round,pad=0.25", facecolor=t["bg_frame"], alpha=0.85),
                color=t["fg"]
            )

        from matplotlib.lines import Line2D
        leg = [
            Line2D([0], [0], color=t["fg"], lw=1.2, linestyle='-', label='Livello 0 (a pavimento)'),
            Line2D([0], [0], color=t["fg"], lw=1.0, linestyle='--', label='Livello 1 (sovrapposto)'),
        ]
        legend = ax.legend(handles=leg, loc='upper right', framealpha=0.9)
        legend.get_frame().set_facecolor(t["bg_frame"])
        legend.get_frame().set_edgecolor(t["grid"])
        for txt in legend.get_texts():
            txt.set_color(t["fg"])

        fig.tight_layout()
        canvas_fig.draw()

        info_lbl.config(text=(
            f"Efficienza area: {cont['eff_area']*100:.1f}%   •   "
            f"Area usata: {cont['area_used']/1_000_000:.2f} m² / "
            f"{cont_template.floor_area()/1_000_000:.2f} m²   •   "
            f"Livello0: {lvl0}  Livello1: {lvl1}"
        ))


    def _build_overview_view(self, parent, containers, cont_template, show_labels=True):
        if not containers:
            ttk.Label(parent, text="Nessun container utilizzato.").pack(pady=20)
            return

        # ---- Barra controllo etichette ----
        control_frame = ttk.Frame(parent)
        control_frame.pack(fill="x", padx=10, pady=(5, 5))
        show_labels_var = tk.BooleanVar(value=show_labels)
        ttk.Checkbutton(
            control_frame,
            text="Mostra etichette casse",
            variable=show_labels_var,
            command=lambda: self._refresh_overview_view(
                parent, containers, cont_template, show_labels_var.get()
            )
        ).pack(side="left")

        # ---- Area scrollabile ----
        outer = ttk.Frame(parent)
        outer.pack(fill="both", expand=True)
        cv = tk.Canvas(outer, highlightthickness=0)
        vbar = ttk.Scrollbar(outer, orient="vertical", command=cv.yview)
        cv.configure(yscrollcommand=vbar.set)
        cv.pack(side="left", fill="both", expand=True)
        vbar.pack(side="right", fill="y")
        grid_frame = ttk.Frame(cv)
        win_id = cv.create_window((0, 0), window=grid_frame, anchor="nw")
        grid_frame.bind("<Configure>", lambda _: cv.configure(scrollregion=cv.bbox("all")))
        cv.bind("<Configure>", lambda e: cv.itemconfig(win_id, width=e.width))

        t = THEMES[self.theme_manager.current]
        COLS = 2
        SNAP = 5  # mm

        # ----------------------------------------------------------------
        # Stato drag CONDIVISO tra tutti i canvas della panoramica.
        # Viene creato fresco ad ogni rebuild (non usiamo self.overview_drag_state
        # per evitare stato stantio da sessioni precedenti).
        # ----------------------------------------------------------------
        ds = {
            "active":     False,
            "p":          None,    # placed-dict
            "patch":      None,    # Rectangle matplotlib nel canvas sorgente
            "text":       None,    # Text matplotlib nel canvas sorgente
            "src_idx":    None,    # indice in entries[] del container sorgente
            "canvas_src": None,    # FigureCanvasTkAgg sorgente
            "dx": 0.0, "dy": 0.0, # offset click rispetto a p["x"],p["y"]
            "orig_x": 0.0, "orig_y": 0.0,
            "orig_lw": 1.0, "orig_alpha": 0.85,
            "last_x": 0.0, "last_y": 0.0,  # ultima posizione valida durante il drag
            # Preview nel container target durante drag cross-container
            "prev_patch":  None,  # Rectangle anteprima nel canvas target
            "prev_canvas": None,  # FigureCanvasTkAgg del target durante il drag
            "prev_x": 0.0, "prev_y": 0.0,  # posizione preview corrente
            "prev_valid": False,  # True se la posizione preview è libera
        }

        # entries[i] = {"canvas": FigureCanvasTkAgg, "items": [...], "cont": cont-dict, "idx": i}
        entries = []

        # ---- Funzioni helper ----

        def _snap(v):
            return round(v / SNAP) * SNAP

        def _overlaps(ax_, ay_, al, aw, bx, by, bl, bw):
            """True se due rettangoli si sovrappongono (tolleranza 1 mm)."""
            TOL = 1.0
            return not (
                ax_ + al <= bx + TOL or bx + bl <= ax_ + TOL or
                ay_ + aw <= by + TOL or by + bw <= ay_ + TOL
            )

        def _restore_style():
            if ds["patch"]:
                ds["patch"].set_linewidth(ds["orig_lw"])
                ds["patch"].set_alpha(ds["orig_alpha"])
                ds["patch"].set_edgecolor(t["fg"])

        def _reset_ds():
            if ds["prev_patch"] is not None:
                try:
                    ds["prev_patch"].remove()
                    if ds["prev_canvas"]:
                        ds["prev_canvas"].draw_idle()
                except Exception:
                    pass
            ds.update({
                "active": False, "p": None, "patch": None, "text": None,
                "src_idx": None, "canvas_src": None, "dx": 0.0, "dy": 0.0,
                "last_x": 0.0, "last_y": 0.0,
                "prev_patch": None, "prev_canvas": None,
                "prev_x": 0.0, "prev_y": 0.0, "prev_valid": False,
            })

        def _pixel_to_data(canvas_fig, pixel_x, pixel_y):
            """
            Converte coordinate pixel (relative al widget tk del canvas)
            in coordinate dati matplotlib (mm nel nostro sistema).
            pixel_x cresce verso destra, pixel_y cresce verso il BASSO (tk).
            In matplotlib y cresce verso l'ALTO, quindi invertiamo.
            """
            fig = canvas_fig.figure
            ax  = fig.axes[0]
            w_px = canvas_fig.get_tk_widget().winfo_width()
            h_px = canvas_fig.get_tk_widget().winfo_height()
            if w_px <= 0 or h_px <= 0:
                return None, None
            # Normalizza in figure-fraction (0..1)
            fig_x = pixel_x / w_px
            fig_y = 1.0 - pixel_y / h_px      # inverti y
            # Trasforma figure-fraction → data
            try:
                data_xy = ax.transData.inverted().transform(
                    fig.transFigure.transform((fig_x, fig_y))
                )
                return float(data_xy[0]), float(data_xy[1])
            except Exception:
                return None, None

        def _pixel_to_data_unclamped(canvas_fig, pixel_x, pixel_y):
            """
            Come _pixel_to_data ma NON verifica che il punto sia dentro l'axes.
            Usata durante on_motion_global per permettere il drag fuori dal canvas sorgente.
            """
            fig = canvas_fig.figure
            ax  = fig.axes[0]
            w_px = canvas_fig.get_tk_widget().winfo_width()
            h_px = canvas_fig.get_tk_widget().winfo_height()
            if w_px <= 0 or h_px <= 0:
                return None, None
            fig_x = pixel_x / w_px
            fig_y = 1.0 - pixel_y / h_px
            try:
                data_xy = ax.transData.inverted().transform(
                    fig.transFigure.transform((fig_x, fig_y))
                )
                return float(data_xy[0]), float(data_xy[1])
            except Exception:
                return None, None

        # ----------------------------------------------------------------
        # Funzioni globali drag (definite UNA SOLA VOLTA, fuori dal loop)
        # ----------------------------------------------------------------

        def _global_motion(event):
            if not ds["active"] or ds["p"] is None:
                return

            p = ds["p"]
            src_cv     = ds["canvas_src"]
            src_widget = src_cv.get_tk_widget()
            root_x = event.x_root
            root_y = event.y_root

            local_px = root_x - src_widget.winfo_rootx()
            local_py = root_y - src_widget.winfo_rooty()

            try:
                fig = src_cv.figure
                ax  = fig.axes[0]
                w_px = src_widget.winfo_width()
                h_px = src_widget.winfo_height()
                if w_px > 0 and h_px > 0:
                    fig_x = local_px / w_px
                    fig_y = 1.0 - local_py / h_px
                    data_xy = ax.transData.inverted().transform(
                        fig.transFigure.transform((fig_x, fig_y))
                    )
                    data_x, data_y = float(data_xy[0]), float(data_xy[1])
                    x_new = _snap(data_x - ds["dx"])
                    y_new = _snap(data_y - ds["dy"])
                    x_new = max(0.0, min(x_new, cont_template.length - p["length"]))
                    y_new = max(0.0, min(y_new, cont_template.width  - p["width"]))
                    ds["last_x"] = x_new
                    ds["last_y"] = y_new
                else:
                    x_new = ds["last_x"]
                    y_new = ds["last_y"]
            except Exception:
                x_new = ds["last_x"]
                y_new = ds["last_y"]

            ds["patch"].set_xy((x_new, y_new))
            if ds["text"]:
                ds["text"].set_position((x_new + p["length"] / 2,
                                          y_new + p["width"]  / 2))
            src_cv.draw_idle()

            # ── Preview nel container target (se diverso dal sorgente) ──
            hover_idx = ds["src_idx"]
            for _e in entries:
                if self._widget_contains_root_point(_e["canvas"].get_tk_widget(), root_x, root_y):
                    hover_idx = _e["idx"]
                    break

            if hover_idx != ds["src_idx"]:
                _tcv = entries[hover_idx]["canvas"]
                _tw  = _tcv.get_tk_widget()
                _lpx = root_x - _tw.winfo_rootx()
                _lpy = root_y - _tw.winfo_rooty()
                _wpx = _tw.winfo_width()
                _hpx = _tw.winfo_height()
                try:
                    _fig_t = _tcv.figure
                    _ax_t  = _fig_t.axes[0]
                    _fx = _lpx / _wpx
                    _fy = 1.0 - _lpy / _hpx
                    _dxy = _ax_t.transData.inverted().transform(
                        _fig_t.transFigure.transform((_fx, _fy))
                    )
                    _px = _snap(float(_dxy[0]) - p["length"] / 2)
                    _py = _snap(float(_dxy[1]) - p["width"]  / 2)
                    _px = max(0.0, min(_px, cont_template.length - p["length"]))
                    _py = max(0.0, min(_py, cont_template.width  - p["width"]))
                    _col = any(
                        _overlaps(_px, _py, p["length"], p["width"],
                                  float(o["x"]), float(o["y"]),
                                  float(o["length"]), float(o["width"]))
                        for o in entries[hover_idx]["cont"]["placed"] if o is not p
                    )
                    # Rimuovi preview se canvas cambiato
                    if ds["prev_patch"] is not None and ds["prev_canvas"] is not _tcv:
                        try:
                            ds["prev_patch"].remove()
                            ds["prev_canvas"].draw_idle()
                        except Exception:
                            pass
                        ds["prev_patch"] = None
                        ds["prev_canvas"] = None
                    # Crea o aggiorna preview
                    if ds["prev_patch"] is None:
                        import matplotlib.patches as _patches
                        _pr = _patches.Rectangle(
                            (_px, _py), p["length"], p["width"],
                            facecolor="lightblue" if not _col else "salmon",
                            edgecolor="blue" if not _col else "red",
                            alpha=0.5, linewidth=2, linestyle="--", zorder=10
                        )
                        _ax_t.add_patch(_pr)
                        ds["prev_patch"]  = _pr
                        ds["prev_canvas"] = _tcv
                    else:
                        ds["prev_patch"].set_xy((_px, _py))
                        ds["prev_patch"].set_facecolor("lightblue" if not _col else "salmon")
                        ds["prev_patch"].set_edgecolor("blue" if not _col else "red")
                    ds["prev_x"] = _px
                    ds["prev_y"] = _py
                    ds["prev_valid"] = not _col
                    _tcv.draw_idle()
                except Exception:
                    pass
            else:
                # Cursore nel canvas sorgente → rimuovi preview da altri canvas
                if ds["prev_patch"] is not None:
                    try:
                        ds["prev_patch"].remove()
                        ds["prev_canvas"].draw_idle()
                    except Exception:
                        pass
                    ds["prev_patch"]  = None
                    ds["prev_canvas"] = None
                    ds["prev_valid"]  = False

        def _global_release(event):
            try:
                self.root.unbind_all("<B1-Motion>")
                self.root.unbind_all("<ButtonRelease-1>")
            except Exception:
                pass

            if not ds["active"] or ds["p"] is None:
                _reset_ds()
                return

            p = ds["p"]
            src_idx    = ds["src_idx"]
            src_cv     = ds["canvas_src"]
            src_widget = src_cv.get_tk_widget()

            root_x = self.root.winfo_pointerx()
            root_y = self.root.winfo_pointery()

            # 1) Trova container target
            tgt_idx = src_idx
            for e2 in entries:
                w = e2["canvas"].get_tk_widget()
                contains = self._widget_contains_root_point(w, root_x, root_y)
                if contains:
                    tgt_idx = e2["idx"]
                    break

            tgt_cv     = entries[tgt_idx]["canvas"]
            tgt_widget = tgt_cv.get_tk_widget()

            # 2) Coordinate nel target
            if tgt_idx == src_idx:
                rel_x = ds["last_x"]
                rel_y = ds["last_y"]
            else:
                # Usa la posizione del preview (già calcolata e validata durante il motion)
                rel_x = ds["prev_x"]
                rel_y = ds["prev_y"]

            # 3) Clamp
            rel_x = max(0.0, min(rel_x, cont_template.length - p["length"]))
            rel_y = max(0.0, min(rel_y, cont_template.width  - p["width"]))

            # 4) Collision check
            valid = True
            for other in entries[tgt_idx]["cont"]["placed"]:
                if other is p:
                    continue
                if _overlaps(rel_x, rel_y, p["length"], p["width"],
                             float(other["x"]), float(other["y"]),
                             float(other["length"]), float(other["width"])):
                    valid = False
                    break
            

            # 5) Commit o rollback
            if valid:
                if tgt_idx != src_idx:
                    removed = self._remove_placed_item_by_identity(
                        entries[src_idx]["cont"]["placed"], p)
                    entries[tgt_idx]["cont"]["placed"].append(p)
                else:
                    pass
                p["x"] = rel_x
                p["y"] = rel_y
                _restore_style()
                _reset_ds()
                self._refresh_overview_view(
                    parent, containers, cont_template, show_labels_var.get())
            else:
                ds["patch"].set_edgecolor("red")
                ds["patch"].set_linewidth(3.0)
                src_cv.draw_idle()

                def _revert():
                    if ds["patch"]:
                        ds["patch"].set_xy((ds["orig_x"], ds["orig_y"]))
                        if ds["text"]:
                            ds["text"].set_position((
                                ds["orig_x"] + p["length"] / 2,
                                ds["orig_y"] + p["width"]  / 2))
                        _restore_style()
                        src_cv.draw_idle()
                    _reset_ds()
                src_widget.after(140, _revert)

        # ----------------------------------------------------------------
        # Costruzione griglia container
        # ----------------------------------------------------------------
        r = c = 0
        for idx, cont in enumerate(containers):
            box = ttk.LabelFrame(
                grid_frame,
                text=f"Container #{cont['index']} – Eff. {cont['eff_area']*100:.1f}%",
                padding=6
            )
            box.grid(row=r, column=c, padx=10, pady=10, sticky="nsew")

            fig, ax = plt.subplots(1, 1, figsize=(6.6, 3.2))
            self._style_axes_for_theme(fig, ax)
            ax.set_xlim(0, cont_template.length)
            ax.set_ylim(0, cont_template.width)
            ax.set_aspect('equal', adjustable='box')
            ax.set_xlabel('Lunghezza (mm)')
            ax.set_ylabel('Larghezza (mm)')
            ax.add_patch(patches.Rectangle(
                (0, 0), cont_template.length, cont_template.width,
                linewidth=2, edgecolor=t["fg"], facecolor='none'
            ))

            placed = cont['placed']
            items = []

            def base_of(p):
                if p.get('z', 1) == 2 and p.get('stacked_on'):
                    return p['stacked_on']['crate'].label
                return p['crate'].label

            base_keys = [base_of(p) for p in placed]
            uniq = {k: j for j, k in enumerate(sorted(set(base_keys)))}
            palette = plt.cm.tab20(np.linspace(0, 1, max(1, len(uniq))))

            for p in placed:
                level     = 0 if p.get('z', 1) == 1 else 1
                ci        = palette[uniq[base_of(p)]]
                fc_alpha  = 0.85 if level == 0 else 0.45
                ls        = '-'  if level == 0 else '--'

                rect = patches.Rectangle(
                    (p['x'], p['y']), p['length'], p['width'],
                    facecolor=ci, edgecolor=t["fg"], alpha=fc_alpha,
                    linewidth=1, linestyle=ls
                )
                if level == 0:
                    rect.set_picker(True)
                ax.add_patch(rect)

                text_obj = None
                if show_labels:
                    crate = p['crate']
                    tag   = f"#{crate.collo}\n{crate.L}×{crate.W}×{crate.H} mm"
                    if level == 1:
                        text_obj = ax.text(
                            p['x'] + p['length'] - 12,
                            p['y'] + p['width']  - 12,
                            tag, ha='right', va='top', fontsize=8,
                            bbox=dict(boxstyle="round,pad=0.2",
                                      facecolor=t["bg_frame"], alpha=0.85),
                            color=t["fg"]
                        )
                    else:
                        text_obj = ax.text(
                            p['x'] + p['length'] / 2,
                            p['y'] + p['width']  / 2,
                            tag, ha='center', va='center', fontsize=8,
                            bbox=dict(boxstyle="round,pad=0.2",
                                      facecolor=t["bg_frame"], alpha=0.85),
                            color=t["fg"]
                        )

                if level == 0:
                    items.append({"p": p, "patch": rect, "text": text_obj})

            fig.tight_layout()
            canvas_fig = FigureCanvasTkAgg(fig, master=box)
            canvas_fig.get_tk_widget().pack(fill="both", expand=True)

            entries.append({"canvas": canvas_fig, "items": items,
                            "cont": cont, "idx": idx})

                # ---- Handler press (uno per container) ----

            def _make_press(my_idx, cv_widget, canvas_fig_ref):

                def _tk_press(event):
                    if ds["active"]:
                        return

                    root_x = event.x_root
                    root_y = event.y_root
                    local_px = root_x - cv_widget.winfo_rootx()
                    local_py = root_y - cv_widget.winfo_rooty()

                    data_x, data_y = _pixel_to_data_unclamped(canvas_fig_ref, local_px, local_py)
                    if data_x is None or data_y is None:
                        return

                    picked = None
                    for it in entries[my_idx]["items"]:
                        p = it["p"]
                        if (float(p["x"]) <= data_x <= float(p["x"]) + float(p["length"]) and
                                float(p["y"]) <= data_y <= float(p["y"]) + float(p["width"])):
                            picked = it
                            break
                    if not picked:
                        return

                    p = picked["p"]
                    _restore_style()

                    ds.update({
                        "active":       True,
                        "p":            p,
                        "patch":        picked["patch"],
                        "text":         picked["text"],
                        "src_idx":      my_idx,
                        "canvas_src":   canvas_fig_ref,
                        "dx":           float(data_x) - float(p["x"]),
                        "dy":           float(data_y) - float(p["y"]),
                        "orig_x":       float(p["x"]),
                        "orig_y":       float(p["y"]),
                        "orig_lw":      picked["patch"].get_linewidth(),
                        "orig_alpha":   picked["patch"].get_alpha() or 0.85,
                        "last_x":       float(p["x"]),
                        "last_y":       float(p["y"]),
                    })

                    ds["patch"].set_linewidth(2.5)
                    ds["patch"].set_alpha(0.95)
                    ds["patch"].set_edgecolor("blue")
                    canvas_fig_ref.draw_idle()

                    self.root.bind_all("<B1-Motion>",       _global_motion,  add=False)
                    self.root.bind_all("<ButtonRelease-1>", _global_release, add=False)

                return _tk_press

            tk_press = _make_press(
                idx,
                canvas_fig.get_tk_widget(),
                canvas_fig
            )
            tk_w = canvas_fig.get_tk_widget()
            tk_w.bind("<ButtonPress-1>", tk_press, add="+")

            c += 1
            if c >= COLS:
                c = 0
                r += 1

    def _refresh_overview_view(self, parent, containers, cont_template, show_labels):
        """Ricrea completamente la vista panoramica."""
        for widget in parent.winfo_children():
            widget.destroy()
        self._build_overview_view(parent, containers, cont_template, show_labels)

    def _restore_position_and_style(self, drag_state, original_x, original_y, p, canvas_fig_ref):
        """Mantenuto per compatibilità con vecchie chiamate."""
        if drag_state.get("patch"):
            drag_state["patch"].set_xy((original_x, original_y))
            if drag_state.get("text"):
                drag_state["text"].set_position((
                    original_x + p["length"] / 2,
                    original_y + p["width"]  / 2,
                ))
            drag_state["patch"].set_linewidth(drag_state.get("orig_lw", 1.0))
            drag_state["patch"].set_alpha(drag_state.get("orig_alpha", 0.85))
            drag_state["patch"].set_edgecolor(THEMES[self.theme_manager.current]["fg"])
            canvas_fig_ref.draw_idle()
        drag_state["active"] = False
        drag_state["p"] = drag_state["patch"] = drag_state["text"] = None

    # ---------- Import/Save ----------
    def import_excel(self):
        path = filedialog.askopenfilename(
            title="Seleziona Excel (5 colonne: Collo, Testo, L, W, H – senza intestazioni)",
            filetypes=[("Excel files", "*.xlsx *.xls"), ("CSV files", "*.csv"), ("All files", "*.*")]
        )
        if not path:
            return

        added = 0
        try:
            rows = []
            if path.lower().endswith(".csv"):
                import csv
                with open(path, newline="", encoding="utf-8-sig") as f:
                    reader = csv.reader(f)
                    for r in reader:
                        rows.append(r)
            else:
                if not HAS_PANDAS:
                    messagebox.showerror(
                        "Errore",
                        "Per importare Excel è necessario 'pandas' (e 'openpyxl').\n"
                        "Installa con: pip install pandas openpyxl"
                    )
                    return
                df = pd.read_excel(path, header=None)
                rows = df.values.tolist()

            for r in rows:
                if len(r) < 5:
                    continue
                try:
                    collo = int(float(r[0]))
                    label = str(r[1]).strip()
                    L = int(float(r[2]))
                    W = int(float(r[3]))
                    H = int(float(r[4]))
                except Exception:
                    continue
                if not label or L <= 0 or W <= 0 or H <= 0:
                    continue

                crate = Crate(collo=collo, label=label, L=L, W=W, H=H, can_stack_top=False)
                self.crates.append(crate)

                iid = self.tree.insert("", "end", values=("☐", collo, label, L, W, H))
                self._check_state[iid] = False
                self._row_canstack[iid] = len(self.crates) - 1 
                added += 1

            messagebox.showinfo("Import", f"Importate {added} casse da file.")
        except Exception as e:
            messagebox.showerror("Errore", f"Impossibile importare il file:\n{e}")

    def save_results(self):
        if not self.crates:
            messagebox.showwarning("Attenzione", "Non c'è nulla da salvare.")
            return
        f = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON", "*.json")],
            title="Salva lista casse"
        )
        if not f:
            return
        data = {
            "container_type": self.container_choice.get(),
            "crates": [
                {
                    "collo": c.collo,
                    "label": c.label,
                    "L": c.L,
                    "W": c.W,
                    "H": c.H,
                    "can_stack_top": c.can_stack_top
                }
                for c in self.crates
            ]
        }

        try:
            with open(f, "w", encoding="utf-8") as fp:
                json.dump(data, fp, indent=2, ensure_ascii=False)
            messagebox.showinfo("OK", f"Risultati salvati in:\n{f}")
        except Exception as e:
            messagebox.showerror("Errore", f"Impossibile salvare:\n{e}")


# ---------------------------- Main ----------------------------
def main():
    root = tk.Tk()
    app = App(root)
    root.minsize(980, 640)
    root.mainloop()


if __name__ == "__main__":
    main()
