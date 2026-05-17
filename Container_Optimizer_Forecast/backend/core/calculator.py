from __future__ import annotations

"""
Modulo: core/calculator.py

Contiene la classe PackageCalculator con tutte le regole di calcolo packaging
così come sviluppate nella versione Tkinter originale, senza componenti UI.

Dipendenze: core.models.Package, core.models.Container
"""

import math
from typing import List, Dict

from .models import Package, Container


class PackageCalculator:
    """Classe per il calcolo dei packaging basato sui codici articolo"""

    # Casi speciali identici alla versione originale
    SPECIAL_CASES = {
        # MTA.330 - MTA.336 (1 unità per cassa)
        "MTA.330": {"dims": (1950, 1000, 1800), "capacity": 1, "unit": "unità"},
        "MTA.331": {"dims": (2250, 1000, 1800), "capacity": 1, "unit": "unità"},
        "MTA.332": {"dims": (2250, 1000, 1800), "capacity": 1, "unit": "unità"},
        "MTA.333": {"dims": (2580, 1000, 1800), "capacity": 1, "unit": "unità"},
        "MTA.334": {"dims": (2700, 1000, 1800), "capacity": 1, "unit": "unità"},
        "MTA.335": {"dims": (3200, 1000, 1800), "capacity": 1, "unit": "unità"},
        "MTA.336": {"dims": (3200, 1000, 1800), "capacity": 1, "unit": "unità"},

        # Lavabi_inox (1 unità per cassa)
        "AF.035": {"dims": (870, 920, 1400), "capacity": 1, "unit": "unità"},
        "AF.036": {"dims": (1720, 920, 1400), "capacity": 1, "unit": "unità"},
        "AF.037": {"dims": (2600, 920, 1400), "capacity": 1, "unit": "unità"},
        "AF.038": {"dims": (3500, 920, 1400), "capacity": 1, "unit": "unità"},

        # Lavabi_inox-corian (1 unità per cassa)
        "AF.035.AC": {"dims": (770, 770, 1300), "capacity": 1, "unit": "unità"},
        "AF.036.AC": {"dims": (1520, 770, 1300), "capacity": 1, "unit": "unità"},
        "AF.037.AC": {"dims": (2300, 770, 1300), "capacity": 1, "unit": "unità"},
        "AF.028.AC": {"dims": (3100, 770, 1300), "capacity": 1, "unit": "unità"},

        # MTA.091 - MTA.094 (12 unità per cassa)
        "MTA.091": {"dims": (1200, 800, 1200), "capacity": 12, "unit": "unità"},
        "MTA.092": {"dims": (1200, 800, 1200), "capacity": 12, "unit": "unità"},
        "MTA.093": {"dims": (1200, 800, 1200), "capacity": 12, "unit": "unità"},
        "MTA.094": {"dims": (1200, 800, 1200), "capacity": 12, "unit": "unità"},

        # MTA.113, MTA.142, MTA.172 (1 unità per cassa)
        "MTA.113": {"dims": (1250, 500, 1700), "capacity": 1, "unit": "unità"},
        "MTA.142": {"dims": (1200, 1200, 1200), "capacity": 1, "unit": "unità"},
        "MTA.172": {"dims": (1200, 1200, 1200), "capacity": 1, "unit": "unità"},

        # MTA.AVICS.OR e MTA.020 (1 unità per cassa)
        "MTA.AVICS": {"dims": (1200, 800, 1400), "capacity": 1, "unit": "unità"},
        "MTA.020": {"dims": (1200, 800, 1400), "capacity": 1, "unit": "unità"},

        # Plafoniere
        "CA.020": {"dims": (1100, 1300, 1900), "capacity": 60, "unit": "unità"},
        "CA.030": {"dims": (1100, 1300, 1900), "capacity": 60, "unit": "unità"},

        # MTA.292 - armadio standard
        "MTA.292": {"dims": (2200, 700, 2200), "capacity": 1, "unit": "unità"},
    }

    @staticmethod
    def normalize_code(code: str) -> str:
        """Regola generale: ignora qualunque suffisso dopo 'RADICE.NUMERO'.
        Esempi: 'MTA.333.XYZ123' -> 'MTA.333', 'lavabo_3.prova' -> 'lavabo_3'
        Eccezione: suffisso '.AC' viene preservato (es. AF.028.AC -> AF.028.AC)
        """
        code = (code or "").strip()
        # Se è del tipo lavabi: lavora con underscore
        if code.lower().startswith("lavabo_"):
            return code.split(".")[0]  # 'lavabo_3.abc' -> 'lavabo_3'
        # Per i codici a punti: 'RADICE.NUM' è sufficiente
        parts = code.split(".")
        if len(parts) >= 3 and parts[2].upper() == "AC":
            return parts[0] + "." + parts[1] + ".AC"  # AF.028.AC -> AF.028.AC
        if len(parts) >= 2:
            return parts[0] + "." + parts[1]
        return parts[0]

    # ---------------------- CASI SPECIFICI ----------------------
    @staticmethod
    def calculate_special_case(code_root: str, qty: float) -> List[Package]:
        """Se code_root è in SPECIAL_CASES, restituisce i Package relativi.
        qty è interpretata secondo 'capacity' (unità per cassa).
        """
        rule = PackageCalculator.SPECIAL_CASES.get(code_root)
        if not rule:
            return []
        L, W, H = rule["dims"]
        capacity = rule["capacity"]
        packs = math.ceil(qty / capacity)
        return [Package(
            id=f"{code_root}_pack",
            length=L, width=W, height=H,
            quantity=packs,
            description=f"{code_root} – {qty} {rule['unit']}"
        )]

    @staticmethod
    def calculate_sl_panels(code: str, sqm: float) -> List[Package]:
        """Calcola i package (casse) per i pannelli SL.C...
        - SL.C.03... : 37 sqm/cassa, cassa 3100x1100x1400
        - altri SL.C : 100 sqm/cassa, cassa 3100x1300x1400
        """
        code_up = code.upper()
        if code_up.startswith("SL.C.03"):
            capacity_sqm = 37
            crate_len, crate_wid, crate_hei = 3100, 1100, 1400
            crate_id_suffix = "crate_glass"
            note = f"{capacity_sqm} sqm/cassa (vetro)"
        else:
            capacity_sqm = 100
            crate_len, crate_wid, crate_hei = 3100, 1300, 1400
            crate_id_suffix = "crate"
            note = f"{capacity_sqm} sqm/cassa"

        packages_needed = math.ceil(sqm / capacity_sqm)
        return [Package(
            id=f"{code_up}_{crate_id_suffix}",
            length=crate_len,
            width=crate_wid,
            height=crate_hei,
            quantity=packages_needed,
            description=f"Casse pannelli {code_up} – {sqm} sqm totali, {note}"
        )]

    @staticmethod
    def calculate_as_ml_series(code: str, units: float) -> List[Package]:
        """Calcola i package per AS.001, AS.003, AS.004, AS.005, AS.208 e i codici
        AS.010, AS.025, AS.030, AS.035, AS.040, AS.045, AS.050, AS.055, AS.060,
        AS.061, AS.065, AS.070, AS.074, AS.075, AS.078, AS.079, AS.080, AS.085, AS.090.
        - Ogni unità vale 3 ml
        - Capacità cassa: 600 ml
        - Dimensioni cassa: 3200 x 900 x 900 mm
        """
        ml = units * 3
        capacity_ml = 600
        crate_len, crate_wid, crate_hei = 3200, 900, 900
        packages_needed = math.ceil(ml / capacity_ml)
        return [Package(
            id=f"{code}_crate",
            length=crate_len,
            width=crate_wid,
            height=crate_hei,
            quantity=packages_needed,
            description=f"{code} – {units} unità ({ml} ml totali, 600 ml per cassa)"
        )]

    @staticmethod
    def calculate_substructure(code: str, sqm: float) -> List[Package]:
        """Calcola i package per sottostruttura SA.C / SS.C"""
        packages: List[Package] = []
        # Montanti
        num_montanti = math.ceil((sqm / (3.0 * 1.2)) * 1.05)  # +5%
        montanti_packs = math.ceil(num_montanti / 300)
        packages.append(Package(
            id=f"{code}_montanti",
            length=3200,
            width=600,
            height=900,
            quantity=montanti_packs,
            description=f"Montanti {code} - {num_montanti} pz"
        ))
        # Traversi
        num_traversi = num_montanti * 3
        traversi_packs = math.ceil(num_traversi / 800)
        packages.append(Package(
            id=f"{code}_traversi",
            length=2500,
            width=600,
            height=900,
            quantity=traversi_packs,
            description=f"Traversi {code} - {num_traversi} pz"
        ))
        # Traccianti / guide
        traccianti_packs = math.ceil(sqm / 450)
        packages.append(Package(
            id=f"{code}_traccianti",
            length=3200,
            width=600,
            height=900,
            quantity=traccianti_packs,
            description=f"Traccianti/Guide {code}"
        ))
        return packages

    @staticmethod
    def calculate_ssc001a(code: str, sqm: float) -> List[Package]:
        """Calcola i package per SS.C.001.A - uguale a SA.C ma montanti 3700mm"""
        packages: List[Package] = []
        # Montanti
        num_montanti = math.ceil((sqm / (3.0 * 1.2)) * 1.05)  # +5%
        montanti_packs = math.ceil(num_montanti / 300)
        packages.append(Package(
            id=f"{code}_montanti",
            length=3700,
            width=600,
            height=900,
            quantity=montanti_packs,
            description=f"Montanti {code} - {num_montanti} pz"
        ))
        # Traversi
        num_traversi = num_montanti * 3
        traversi_packs = math.ceil(num_traversi / 800)
        packages.append(Package(
            id=f"{code}_traversi",
            length=2500,
            width=600,
            height=900,
            quantity=traversi_packs,
            description=f"Traversi {code} - {num_traversi} pz"
        ))
        # Traccianti / guide
        traccianti_packs = math.ceil(sqm / 450)
        packages.append(Package(
            id=f"{code}_traccianti",
            length=3200,
            width=600,
            height=900,
            quantity=traccianti_packs,
            description=f"Traccianti/Guide {code}"
        ))
        return packages

    @staticmethod
    def calculate_ssc002a(code: str, sqm: float) -> List[Package]:
        """Calcola i package per SS.C.002.A - uguale a SA.C ma montanti 4700mm"""
        packages: List[Package] = []
        # Montanti
        num_montanti = math.ceil((sqm / (3.0 * 1.2)) * 1.05)  # +5%
        montanti_packs = math.ceil(num_montanti / 300)
        packages.append(Package(
            id=f"{code}_montanti",
            length=4700,
            width=600,
            height=900,
            quantity=montanti_packs,
            description=f"Montanti {code} - {num_montanti} pz"
        ))
        # Traversi
        num_traversi = num_montanti * 3
        traversi_packs = math.ceil(num_traversi / 800)
        packages.append(Package(
            id=f"{code}_traversi",
            length=2500,
            width=600,
            height=900,
            quantity=traversi_packs,
            description=f"Traversi {code} - {num_traversi} pz"
        ))
        # Traccianti / guide
        traccianti_packs = math.ceil(sqm / 450)
        packages.append(Package(
            id=f"{code}_traccianti",
            length=3200,
            width=600,
            height=900,
            quantity=traccianti_packs,
            description=f"Traccianti/Guide {code}"
        ))
        return packages

    @staticmethod
    def calculate_as100(code: str, sqm: float) -> List[Package]:
        """Calcola i package per AS.100 - pannelli performanti"""
        packages_needed = math.ceil(sqm / 95)
        return [Package(
            id=f"{code}_perf",
            length=1200,
            width=1200,
            height=2100,
            quantity=packages_needed,
            description=f"Pannelli performanti {code} - {sqm} sqm"
        )]

    @staticmethod
    def calculate_mta032_tcp(code: str, units: int) -> List[Package]:
        """Cassa fissa 1200x1200x1200 per ogni articolo TCP (TCP)."""
        return [Package(
            id=f"{code}_tcp",
            length=1200,
            width=1200,
            height=1200,
            quantity=math.ceil(units),
            description=f"TCP {code} - {units} pz"
        )]

    @staticmethod
    def calculate_as114(code: str, sqm: float) -> List[Package]:
        """Gestisce:
        - AS.114.02, AS.115.02, AS.120.02, AS.121.02 → 22 sqm/cassa (2300x520x540)
        - AS.114.03, AS.115.03, AS.120.03, AS.121.03 → 33 sqm/cassa (3100x520x540)
        """
        code_up = code.upper()
        if code_up.endswith(".02"):
            capacity_sqm = 22
            crate_len, crate_wid, crate_hei = 2300, 520, 540
        elif code_up.endswith(".03"):
            capacity_sqm = 33
            crate_len, crate_wid, crate_hei = 3100, 520, 540
        else:
            return []  # non gestito
        packages_needed = math.ceil(sqm / capacity_sqm)
        return [Package(
            id=f"{code}_crate",
            length=crate_len,
            width=crate_wid,
            height=crate_hei,
            quantity=packages_needed,
            description=f"{code} – {sqm} sqm totali, {capacity_sqm} sqm per cassa"
        )]

    @staticmethod
    def calculate_as125_visuals(code: str, visuals_data: List[Dict]) -> List[Package]:
        """Calcola i package per AS.125 - moduli visiva"""
        packages: List[Package] = []
        for i, visual in enumerate(visuals_data):
            length = int(visual['length']) + 100
            width = int(visual['width']) + 100
            quantity = int(visual['quantity'])
            # Ogni visiva è spessa 150mm, max 8 sovrapposte (1200mm + 100)
            visuals_per_pack = min(8, quantity)
            height = visuals_per_pack * 150 + 100
            packs_needed = math.ceil(quantity / 8)
            packages.append(Package(
                id=f"{code}_visual_{i+1}",
                length=length,
                width=width,
                height=height,
                quantity=packs_needed,
                description=f"Moduli visiva {code} - {length-100}x{width-100}mm, {quantity} pz"
            ))
        return packages

    @staticmethod
    def calculate_mta302(code: str, cabinet_data: Dict) -> List[Package]:
        """Calcola i package per MTA.302 - armadi"""
        h, w, sp = int(cabinet_data['h']), int(cabinet_data['w']), int(cabinet_data['sp'])
        quantity = int(cabinet_data['quantity'])
        # Dimensioni packaging
        pack_length = h + 100
        pack_height = w + 100
        pack_width = sp * 2  # Due armadi affiancati max
        # Calcolo numero di package considerando l'affiancamento
        packs_needed = math.ceil(quantity / 2)
        return [Package(
            id=f"{code}_cabinet",
            length=pack_length,
            width=pack_width,
            height=pack_height,
            quantity=packs_needed,
            description=f"Armadi {code} - {h}x{w}x{sp}mm, {quantity} pz"
        )]

    @staticmethod
    def calculate_cts002(code: str, sqm: float) -> List[Package]:
        """Calcola i package per CTS.002 - controsoffitto
        - main: 1 cassa ogni 90 sqm
        - profiles: sempre 1 (se esistono casse main)
        - accessories: 1 cassa ogni 3 casse main (ceil)
        """
        packages: List[Package] = []
        main_packs = math.ceil(sqm / 90)
        if main_packs > 0:
            packages.append(Package(
                id=f"{code}_main",
                length=1220,
                width=1250,
                height=2000,
                quantity=main_packs,
                description=f"Controsoffitto principale {code} - {sqm} sqm"
            ))
            packages.append(Package(
                id=f"{code}_profiles",
                length=4050,
                width=900,
                height=500,
                quantity=1,
                description=f"Profili CTS {code} (fisso 1 cassa)"
            ))
            accessories_packs = math.ceil(main_packs / 3)
            packages.append(Package(
                id=f"{code}_accessories",
                length=1000,
                width=1200,
                height=1000,
                quantity=accessories_packs,
                description=f"Accessori CTS {code} (1 ogni 3 casse main)"
            ))
        return packages

    @staticmethod
    def calculate_cts001(code: str, sqm: float) -> List[Package]:
        """Calcola i package per CTS.001 - controsoffitto
        - main: 1 cassa ogni 90 sqm
        - profiles: sempre 1 (se esistono casse main)
        - accessories: 1 cassa ogni 3 casse main (ceil)
        """
        packages: List[Package] = []
        main_packs = math.ceil(sqm / 90)
        if main_packs > 0:
            packages.append(Package(
                id=f"{code}_main",
                length=1220,
                width=1250,
                height=2000,
                quantity=main_packs,
                description=f"Controsoffitto principale {code} - {sqm} sqm"
            ))
            packages.append(Package(
                id=f"{code}_profiles",
                length=4050,
                width=900,
                height=500,
                quantity=1,
                description=f"Profili CTS {code} (fisso 1 cassa)"
            ))
            accessories_packs = math.ceil(main_packs / 3)
            packages.append(Package(
                id=f"{code}_accessories",
                length=1000,
                width=1200,
                height=1000,
                quantity=accessories_packs,
                description=f"Accessori CTS {code} (1 ogni 3 casse main)"
            ))
        return packages

    @staticmethod
    def calculate_cts003(code: str, sqm: float) -> List[Package]:
        """Calcola i package per CTS.003 - controsoffitto
        - main: 1 cassa ogni 90 sqm
        - profiles: sempre 1 (se esistono casse main)
        - accessories: 1 cassa ogni 3 casse main (ceil)
        """
        packages: List[Package] = []
        main_packs = math.ceil(sqm / 90)
        if main_packs > 0:
            packages.append(Package(
                id=f"{code}_main",
                length=1220,
                width=1250,
                height=2000,
                quantity=main_packs,
                description=f"Controsoffitto principale {code} - {sqm} sqm"
            ))
            packages.append(Package(
                id=f"{code}_profiles",
                length=4050,
                width=900,
                height=500,
                quantity=1,
                description=f"Profili CTS {code} (fisso 1 cassa)"
            ))
            accessories_packs = math.ceil(main_packs / 3)
            packages.append(Package(
                id=f"{code}_accessories",
                length=1000,
                width=1200,
                height=1000,
                quantity=accessories_packs,
                description=f"Accessori CTS {code} (1 ogni 3 casse main)"
            ))
        return packages

    @staticmethod
    def calculate_ca0(code: str, units: int) -> List[Package]:
        """Calcola i package per CA.0 - plafoniere"""
        packages_needed = math.ceil(units / 60)
        return [Package(
            id=f"{code}_lights",
            length=1100,
            width=1300,
            height=1900,
            quantity=packages_needed,
            description=f"Plafoniere {code} - {units} unità"
        )]

    @staticmethod
    def get_crate_groups() -> List[Dict]:
        """Restituisce i gruppi di codici che condividono la stessa cassa.
        Formato: [{ "crate_id": str, "L": int, "W": int, "H": int,
                    "cap": int|float, "cap_unit": str,
                    "codes": [{"code": str, "unit": str}] }]
        """
        groups: List[Dict] = []

        # --- SPECIAL_CASES: raggruppa per dimensioni identiche ---
        dim_map: Dict = {}  # (L,W,H,cap,unit) -> [code]
        for code, rule in PackageCalculator.SPECIAL_CASES.items():
            key = (rule["dims"][0], rule["dims"][1], rule["dims"][2], rule["capacity"], rule["unit"])
            dim_map.setdefault(key, []).append(code)
        for (L, W, H, cap, unit), codes in dim_map.items():
            groups.append({
                "crate_id": "_".join(codes),
                "L": L, "W": W, "H": H,
                "cap": cap, "cap_unit": unit,
                "codes": [{"code": c, "unit": unit} for c in codes]
            })

        # --- Pannelli SL.C ---
        groups.append({
            "crate_id": "SL.C.03",
            "L": 3100, "W": 1100, "H": 1400, "cap": 37, "cap_unit": "sqm",
            "codes": [{"code": "SL.C.03", "unit": "sqm"}]
        })
        groups.append({
            "crate_id": "SL.C.04",
            "L": 3100, "W": 1300, "H": 1400, "cap": 100, "cap_unit": "sqm",
            "codes": [{"code": "SL.C.04", "unit": "sqm"}]
        })

        # --- Sottostrutture SA.C / SS.C (cassa montanti principale) ---
        groups.append({
            "crate_id": "SA.C.001",
            "L": 3200, "W": 600, "H": 900, "cap": 300, "cap_unit": "pz",
            "codes": [{"code": "SA.C.001", "unit": "sqm"}]
        })
        groups.append({
            "crate_id": "SS.C.001.A",
            "L": 3700, "W": 600, "H": 900, "cap": 300, "cap_unit": "pz",
            "codes": [{"code": "SS.C.001.A", "unit": "sqm"}]
        })
        groups.append({
            "crate_id": "SS.C.002.A",
            "L": 4700, "W": 600, "H": 900, "cap": 300, "cap_unit": "pz",
            "codes": [{"code": "SS.C.002.A", "unit": "sqm"}]
        })

        # --- AS.100 pannelli performanti ---
        groups.append({
            "crate_id": "AS.100",
            "L": 1200, "W": 1200, "H": 2100, "cap": 95, "cap_unit": "sqm",
            "codes": [{"code": "AS.100", "unit": "sqm"}]
        })

        # --- AS serie ml (tutti condividono stessa cassa 3200x900x900) ---
        as_ml_codes = [
            "AS.001","AS.003","AS.004","AS.005","AS.010","AS.025","AS.030","AS.035",
            "AS.040","AS.045","AS.050","AS.055","AS.060","AS.061","AS.065","AS.070",
            "AS.074","AS.075","AS.078","AS.079","AS.080","AS.085","AS.090","AS.208"
        ]
        groups.append({
            "crate_id": "AS_ML_SERIES",
            "L": 3200, "W": 900, "H": 900, "cap": 200, "cap_unit": "unità",
            "codes": [{"code": c, "unit": "unità"} for c in as_ml_codes]
        })

        # --- AS.114/.115/.120/.121 con .02 e .03 ---
        pb_02_codes = ["AS.114.02","AS.115.02","AS.120.02","AS.121.02"]
        pb_03_codes = ["AS.114.03","AS.115.03","AS.120.03","AS.121.03"]
        groups.append({
            "crate_id": "AS_PB_02",
            "L": 2300, "W": 520, "H": 540, "cap": 22, "cap_unit": "sqm",
            "codes": [{"code": c, "unit": "sqm"} for c in pb_02_codes]
        })
        groups.append({
            "crate_id": "AS_PB_03",
            "L": 3100, "W": 520, "H": 540, "cap": 33, "cap_unit": "sqm",
            "codes": [{"code": c, "unit": "sqm"} for c in pb_03_codes]
        })

        # --- TCP / MTA.032.22.O ---
        groups.append({
            "crate_id": "MTA.032.22.O",
            "L": 1200, "W": 1200, "H": 1200, "cap": 1, "cap_unit": "unità",
            "codes": [{"code": "MTA.032.22.O", "unit": "unità"}]
        })

        # --- CTS (stessa logica per tutti e 3) ---
        groups.append({
            "crate_id": "CTS_MAIN",
            "L": 1220, "W": 1250, "H": 2000, "cap": 90, "cap_unit": "sqm",
            "codes": [{"code": c, "unit": "sqm"} for c in ["CTS.001","CTS.002","CTS.003"]]
        })

        # --- Generiche XXX ---
        for code, L, W, H in [
            ("XXX.3500_900", 3500, 900, 1000), ("XXX.1500_900", 1500, 900, 1000),
            ("XXX.2300_800", 2300, 800, 1000), ("XXX.2290_500", 2290, 500, 600),
            ("XXX.1200_800", 1200, 800, 1500)
        ]:
            groups.append({
                "crate_id": code,
                "L": L, "W": W, "H": H, "cap": 1, "cap_unit": "unità",
                "codes": [{"code": code, "unit": "unità"}]
            })

        return groups

    @staticmethod
    def get_all_dims() -> Dict:
        """Restituisce le dimensioni di packaging per ogni codice noto del catalogo.
        Per i codici con logiche multi-cassa viene usata la cassa principale (main).
        Formato: { "CODICE": {"L": int, "W": int, "H": int, "cap": int} }
        """
        dims: Dict = {}
        # SPECIAL_CASES
        for code, rule in PackageCalculator.SPECIAL_CASES.items():
            L, W, H = rule["dims"]
            dims[code] = {"L": L, "W": W, "H": H, "cap": rule["capacity"]}

        # SL.C.03 (vetro)
        for c in ["SL.C.03"]:
            dims[c] = {"L": 3100, "W": 1100, "H": 1400, "cap": 37}
        # SL.C.04 (inox) e altri SL.C
        for c in ["SL.C.04"]:
            dims[c] = {"L": 3100, "W": 1300, "H": 1400, "cap": 100}

        # SA.C.001, SS.C (sottostruttura) — cassa montanti principale
        for c in ["SA.C.001"]:
            dims[c] = {"L": 3200, "W": 600, "H": 900, "cap": 300}
        for c in ["SS.C.001.A"]:
            dims[c] = {"L": 3700, "W": 600, "H": 900, "cap": 300}
        for c in ["SS.C.002.A"]:
            dims[c] = {"L": 4700, "W": 600, "H": 900, "cap": 300}

        # AS.100 (pannelli performanti)
        dims["AS.100"] = {"L": 1200, "W": 1200, "H": 2100, "cap": 95}

        # AS serie ml (3200x900x900, 600ml/cassa = 200 unità/cassa)
        for c in ["AS.001","AS.003","AS.004","AS.005","AS.010","AS.025","AS.030","AS.035",
                  "AS.040","AS.045","AS.050","AS.055","AS.060","AS.061","AS.065","AS.070",
                  "AS.074","AS.075","AS.078","AS.079","AS.080","AS.085","AS.090","AS.208"]:
            dims[c] = {"L": 3200, "W": 900, "H": 900, "cap": 200}

        # AS.114 / AS.115 / AS.120 / AS.121 con .02 e .03
        for base in ["AS.114","AS.115","AS.120","AS.121"]:
            dims[f"{base}.02"] = {"L": 2300, "W": 520, "H": 540, "cap": 22}
            dims[f"{base}.03"] = {"L": 3100, "W": 520, "H": 540, "cap": 33}

        # TCP / MTA.032.22.O
        dims["MTA.032.22.O"] = {"L": 1200, "W": 1200, "H": 1200, "cap": 1}

        # CTS (cassa main principale)
        for c in ["CTS.001","CTS.002","CTS.003"]:
            dims[c] = {"L": 1220, "W": 1250, "H": 2000, "cap": 90}

        # Generiche XXX
        dims["XXX.3500_900"]   = {"L": 3500, "W": 900, "H": 1000, "cap": 1}
        dims["XXX.1500_900"]   = {"L": 1500, "W": 900, "H": 1000, "cap": 1}
        dims["XXX.2300_800"]   = {"L": 2300, "W": 800, "H": 1000, "cap": 1}
        dims["XXX.2290_500"]   = {"L": 2290, "W": 500, "H": 600,  "cap": 1}
        dims["XXX.1200_800"]   = {"L": 1200, "W": 800, "H": 1500, "cap": 1}

        return dims

    @staticmethod
    def calculate_doors(doors_data: List[Dict]) -> List[Package]:
        """Calcola packaging per porte (scorrevoli/battenti) e relative travi automatiche per scorrevoli"""
        packages: List[Package] = []
        for i, door in enumerate(doors_data):
            h = int(door['h'])
            w = int(door['w'])
            quantity = int(door['quantity'])
            door_type = door['type']
            # Cassa porte
            pack_length = h + 100
            pack_height = w + 200
            if door_type in ['scorrevole_doppia', 'battente_doppia']:
                ante_per_porta = 2
            else:
                ante_per_porta = 1
            total_ante = quantity * ante_per_porta
            pack_width = min(total_ante * 75, 1200)  # 75 fisso, max 1200
            packs_needed = math.ceil(total_ante / 16)
            packages.append(Package(
                id=f"door_{i+1}_{door_type}",
                length=pack_length,
                width=pack_width,
                height=pack_height,
                quantity=packs_needed,
                description=f"Porte {door_type} - {h}x{w}mm, {quantity} pz"
            ))
            # Cassa "trave" automatica per scorrevoli (singola o doppia)
            if door_type in ['scorrevole_singola', 'scorrevole_doppia']:
                trave_len = 2 * w + 200
                trave_wid = 1000
                trave_hei = 1300
                num_travi = quantity  # 1 trave per porta
                packs_travi = math.ceil(num_travi / 12)
                packages.append(Package(
                    id=f"trave_{i+1}",
                    length=trave_len,
                    width=trave_wid,
                    height=trave_hei,
                    quantity=packs_travi,
                    description=f"Travi per porte scorrevoli – {num_travi} travi (12 per cassa)"
                ))
        return packages
