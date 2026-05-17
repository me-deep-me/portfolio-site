# backend/server.py
from __future__ import annotations
from typing import List, Dict, Literal, Optional, Any
from math import ceil
import os, sys, webbrowser, json, time, threading, logging

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles   # NEW
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

# usa import RELATIVI perché core è dentro backend/
from .core.models import Package, Container
from .core.calculator import PackageCalculator
from .core.optimizer import ContainerOptimizer, ContainerOptimizerFast

log = logging.getLogger("packaging_optimizer")

# ==== OVERRIDES PERSISTENTI =================================================
def _data_dir() -> str:
    """Cartella scrivibile: sottocartella 'data' accanto all'exe in produzione, accanto a server.py in dev."""
    if hasattr(sys, "_MEIPASS"):
        # PyInstaller: usa sottocartella 'data' accanto all'exe
        base = os.path.dirname(sys.executable)
    else:
        base = os.path.dirname(os.path.abspath(__file__))
    data = os.path.join(base, "data")
    os.makedirs(data, exist_ok=True)
    return data

# Lock globale per serializzare le scritture ai file JSON (safe tra richieste FastAPI concorrenti)
_io_lock = threading.Lock()

def _safe_load_json(path: str, default: Any) -> Any:
    """Carica un JSON. Se il file è corrotto ne fa backup e ritorna il default."""
    if not os.path.isfile(path):
        return default
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        # Backup del file corrotto per eventuale recupero manuale
        try:
            backup = f"{path}.corrupt.{int(time.time())}"
            os.replace(path, backup)
            log.error(f"File JSON corrotto: {path} → salvato come {backup}. Motivo: {e}")
        except Exception as be:
            log.error(f"Impossibile fare backup del file corrotto {path}: {be}")
        return default

def _safe_save_json(path: str, data: Any) -> None:
    """Scrive il JSON in modo atomico (write-then-rename) e thread-safe."""
    with _io_lock:
        tmp = f"{path}.tmp"
        try:
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                f.flush()
                os.fsync(f.fileno())
            os.replace(tmp, path)  # atomic on Windows and POSIX
        finally:
            if os.path.isfile(tmp):
                try:
                    os.remove(tmp)
                except OSError:
                    pass

def _overrides_path() -> str:
    return os.path.join(_data_dir(), "catalog_overrides.json")

def load_overrides() -> Dict:
    return _safe_load_json(_overrides_path(), {})

def save_overrides(data: Dict) -> None:
    _safe_save_json(_overrides_path(), data)

def _deleted_path() -> str:
    return os.path.join(_data_dir(), "catalog_deleted.json")

def load_deleted() -> list:
    return _safe_load_json(_deleted_path(), [])

def save_deleted(data: list) -> None:
    _safe_save_json(_deleted_path(), data)

# ==== CONFIGURAZIONI UTENTE (salvate su file, non in localStorage) ===========
def _configs_path() -> str:
    return os.path.join(_data_dir(), "user_configs.json")

def load_configs() -> list:
    return _safe_load_json(_configs_path(), [])

def save_configs(data: list) -> None:
    _safe_save_json(_configs_path(), data)

def apply_override(code_norm: str, quantity: float) -> Optional[List[Package]]:
    ov = load_overrides()
    entry = ov.get(code_norm)
    resolved_crate_id: Optional[str] = None

    # Se non trovato direttamente, cerca un crate_id composto che lo contenga
    # (es. SPECIAL_CASES con crate_id = "MTA.331_MTA.332")
    if not entry:
        for key, val in ov.items():
            if "L" in val and code_norm in key.split("_"):
                entry = val
                resolved_crate_id = key
                break
    if not entry:
        return None

    # Se il record punta a una cassa (_crate), segui il riferimento per le dims
    if "_crate" in entry:
        resolved_crate_id = entry["_crate"]
        crate_entry = ov.get(resolved_crate_id)
        if not crate_entry or "L" not in crate_entry:
            return None
        entry = crate_entry
    else:
        # Record diretto con dims (es. override su cassa base)
        resolved_crate_id = resolved_crate_id or code_norm

    if "L" not in entry:
        return None
    L, W, H, cap = entry["L"], entry["W"], entry["H"], entry["cap"]
    packs = ceil(quantity / cap)
    return [Package(
        id=code_norm,
        length=L, width=W, height=H,
        quantity=packs,
        description=f"{code_norm} – {quantity} unità ({cap} pz/cassa)",
        crate_id=resolved_crate_id
    )]

app = FastAPI(title="Packaging Optimizer API")

# ---- CORS (dev) ------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://127.0.0.1",
                   *[f"http://localhost:{p}" for p in range(7999, 8021)],
                   *[f"http://127.0.0.1:{p}" for p in range(7999, 8021)]],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
)

# ---------- helper per trovare la cartella asset anche da exe (PyInstaller) ---
def _asset_path(rel: str) -> str:
    """Restituisce il path assoluto a un asset incluso nel bundle."""
    if hasattr(sys, "_MEIPASS"):
        base = sys._MEIPASS  # type: ignore[attr-defined]
    else:
        base = os.path.dirname(os.path.abspath(__file__))  # backend/
        base = os.path.abspath(os.path.join(base, ".."))   # progetto root
    return os.path.join(base, rel)

# Favicon: evita 404 nei log quando manca il file.
# Deve stare PRIMA del mount StaticFiles su /ui, altrimenti viene intercettato dal mount.
@app.get("/ui/favicon.ico", include_in_schema=False)
def ui_favicon():
    ico_path = _asset_path(os.path.join("web", "favicon.ico"))
    if os.path.isfile(ico_path):
        return FileResponse(ico_path)
    return Response(status_code=204)

# Montiamo il frontend come statico su /ui
_frontend_dir = _asset_path("web")
if os.path.isdir(_frontend_dir):
    app.mount("/ui", StaticFiles(directory=_frontend_dir, html=True), name="ui")

# ---- Health ----------------------------------------------------------------
@app.get("/")
def root():
    return {"service": "Packaging Optimizer API",
            "endpoints": ["/healthz", "/api/healthz", "/api/calc-optimize", "/ui"]}

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

@app.get("/api/healthz")
def healthz_api():
    return {"status": "ok"}

# ==== SCHEMI I/O ============================================================
class ArticleIn(BaseModel):
    code: str = Field(min_length=1)
    qty: float = Field(gt=0, description="Quantità deve essere > 0")

class DoorIn(BaseModel):
    type: Literal["scorrevole_singola","scorrevole_doppia","battente_singola","battente_doppia"]
    h: int = Field(gt=0)
    w: int = Field(gt=0)
    quantity: int = Field(gt=0)

class VisualItem(BaseModel):
    length: int = Field(gt=0)
    width: int = Field(gt=0)
    quantity: int = Field(gt=0)

class VisualGroup(BaseModel):
    code: str = "AS.125"
    visuals: List[VisualItem]

class ContainerIn(BaseModel):
    length: int = Field(default=12036, gt=0)
    width: int = Field(default=2340, gt=0)
    height: int = Field(default=2280, gt=0)

class CalcRequest(BaseModel):
    container: ContainerIn
    articles: List[ArticleIn] = Field(default_factory=list)
    doors: List[DoorIn] = Field(default_factory=list)
    visuals: List[VisualGroup] = Field(default_factory=list)
    optimizer: Literal["fast", "exact"] = "fast"

class PlacedOut(BaseModel):
    package: Dict
    x: int
    y: int
    length: int
    width: int
    rotated: bool

class ContainerOut(BaseModel):
    placed: List[PlacedOut]
    efficiency_area: float
    area_used: int
    container_index: int

class OptimizationOut(BaseModel):
    containers: List[ContainerOut]
    not_placed: List[Dict]
    total_units: int
    alternative: Optional[Dict] = None  # Configurazione alternativa con 20' se l'ultimo 40' è sottoutilizzato
    total_placed: int
    warnings: List[str] = Field(default_factory=list)  # Avvisi su codici non riconosciuti o eliminati

# ==== HELPERS ===============================================================
def calc_single_item(code: str, quantity: float, warnings: Optional[List[str]] = None, unrecognized: Optional[List[Dict]] = None) -> List[Package]:
    # Normalizzazione: per SS.C.001.A e SS.C.002.A preserva il codice completo
    code_up = code.strip().upper()
    if code_up.startswith("SS.C.") or code_up.startswith("SA.C."):
        code_norm = code_up  # non troncare
    else:
        code_norm = PackageCalculator.normalize_code(code).upper()

    # Se il codice è stato eliminato dal catalogo → salta + warning
    if code_up in load_deleted() or code_norm in load_deleted():
        if warnings is not None:
            warnings.append(f"Codice '{code}' eliminato dal catalogo: escluso dal calcolo")
        return []

    # Controlla prima gli overrides salvati
    override = apply_override(code_norm, quantity)
    if override:
        return override

    special = PackageCalculator.calculate_special_case(code_norm, quantity)
    if special:
        return special

    if code_up.startswith("SS.C.001"):
        return PackageCalculator.calculate_ssc001a(code_norm, quantity)
    elif code_up.startswith("SS.C.002"):
        return PackageCalculator.calculate_ssc002a(code_norm, quantity)
    elif code_up.startswith("SS.C"):
        return PackageCalculator.calculate_substructure(code_norm, quantity)
    elif code_up.startswith("SL.C"):
        return PackageCalculator.calculate_sl_panels(code_norm, quantity)
    elif code_up.startswith("SA.C"):
        return PackageCalculator.calculate_substructure(code_norm, quantity)
    elif code_norm.startswith("AS.100"):
        return PackageCalculator.calculate_as100(code_norm, quantity)
    elif code_norm.startswith(("AS.114","AS.115","AS.120","AS.121")):
        return PackageCalculator.calculate_as114(code_norm, quantity)
    elif code_norm.startswith("CTS.001"):
        return PackageCalculator.calculate_cts001(code_norm, quantity)
    elif code_norm.startswith("CTS.002"):
        return PackageCalculator.calculate_cts002(code_norm, quantity)
    elif code_norm.startswith("CTS.003"):
        return PackageCalculator.calculate_cts003(code_norm, quantity)
    elif code_norm.startswith("CA.PLAFONIERE"):
        return PackageCalculator.calculate_ca0(code_norm, int(quantity))
    elif code_norm.startswith(("TCP", "MTA.032.22.O")):
        packs = ceil(quantity)
        return [Package(
            id=f"{code_norm}_tcp", length=1200, width=1200, height=1200,
            quantity=packs, description=f"{code_norm} – {quantity} unità"
        )]
    elif code_norm.startswith((
        "AS.001","AS.003","AS.004","AS.005","AS.010","AS.025","AS.030","AS.035","AS.040","AS.045",
        "AS.050","AS.055","AS.060","AS.061","AS.065","AS.070","AS.074","AS.075",
        "AS.078","AS.079","AS.080","AS.085","AS.090","AS.208"
    )):
        return PackageCalculator.calculate_as_ml_series(code_norm, quantity)
    elif code_norm == "XXX.3500_900":
        return [Package("XXX.3500_900", 3500, 900, 1000, ceil(quantity), "Cassa generica 3500×900×1000")]
    elif code_norm == "XXX.1500_900":
        return [Package("XXX.1500_900", 1500, 900, 1000, ceil(quantity), "Cassa generica 1500×900×1000")]
    elif code_norm == "XXX.2300_800":
        return [Package("XXX.2300_800", 2300, 800, 1000, ceil(quantity), "Cassa generica 2300×800×1000")]
    elif code_norm == "XXX.2290_500":
        return [Package("XXX.2290_500", 2290, 500, 600, ceil(quantity), "Cassa generica 2290×500×600")]
    elif code_norm == "XXX.1200_800":
        return [Package("XXX.1200_800", 1200, 800, 1500, ceil(quantity), "Cassa generica 1200×800×1500 (euro pallet)")]
    else:
        # Codice sconosciuto: finisce in not_placed con warning (vedi calc_optimize)
        if warnings is not None:
            warnings.append(f"Codice '{code}' non riconosciuto: aggiunto ai Non posizionati")
        if unrecognized is not None:
            unrecognized.append({
                "id": code_norm,
                "length": 0, "width": 0, "height": 0,
                "quantity": ceil(quantity),
                "description": f"⚠️ Codice non riconosciuto: '{code}'. Inserire le dimensioni nelle ⚙️ Impostazioni per calcolarlo."
            })
        return []

_MERGEABLE_SUFFIXES = ("_crate", "_crate_glass", "_pack")

def _strip_suffix(pid: str) -> str:
    for s in _MERGEABLE_SUFFIXES:
        if pid.endswith(s):
            return pid[:-len(s)]
    return pid

def merge_same_crate(packages: List[Package]) -> List[Package]:
    """Aggrega Package che condividono la stessa cassa fisica.
    Criterio primario: crate_id esplicito (codici custom da impostazioni).
    Criterio secondario: stesse dimensioni + suffisso mergeable (codici base).
    Somma le quantità, unisce i codici nell'id separati da '+'.
    """
    # Gruppo 1: Package con crate_id esplicito (da apply_override)
    by_crate_id: Dict = {}   # crate_id -> [Package]
    no_crate_id: List[Package] = []
    for p in packages:
        if p.crate_id:
            by_crate_id.setdefault(p.crate_id, []).append(p)
        else:
            no_crate_id.append(p)

    # Gruppo 2: Package senza crate_id ma con suffisso mergeable (codici base)
    crate_groups: Dict = {}  # (L,W,H, suffix) -> [Package]
    others: List[Package] = []
    for p in no_crate_id:
        matched = next((s for s in _MERGEABLE_SUFFIXES if p.id.endswith(s)), None)
        if matched:
            key = (p.length, p.width, p.height, matched)
            crate_groups.setdefault(key, []).append(p)
        else:
            others.append(p)

    merged: List[Package] = list(others)

    # Merge per crate_id esplicito
    for crate_id, group in by_crate_id.items():
        if len(group) == 1:
            merged.append(group[0])
        else:
            total_qty = sum(p.quantity for p in group)
            codes = "+".join(p.id for p in group)
            desc = " + ".join(p.description for p in group)
            p0 = group[0]
            merged.append(Package(
                id=codes, length=p0.length, width=p0.width, height=p0.height,
                quantity=total_qty, description=desc, crate_id=crate_id
            ))

    # Merge per dimensioni (codici base)
    for (L, W, H, suffix), group in crate_groups.items():
        if len(group) == 1:
            merged.append(group[0])
        else:
            total_qty = sum(p.quantity for p in group)
            codes = "+".join(_strip_suffix(p.id) for p in group)
            desc = " + ".join(p.description for p in group)
            merged.append(Package(
                id=f"{codes}{suffix}",
                length=L, width=W, height=H,
                quantity=total_qty, description=desc
            ))

    return merged

def calc_packages(articles, doors, visuals, warnings: Optional[List[str]] = None, unrecognized: Optional[List[Dict]] = None) -> List[Package]:
    out: List[Package] = []
    for a in articles:
        out.extend(calc_single_item(a.code, a.qty, warnings, unrecognized))
    out = merge_same_crate(out)
    for vg in visuals:
        out.extend(PackageCalculator.calculate_as125_visuals(
            vg.code, [v.model_dump() for v in vg.visuals]
        ))
    if doors:
        out.extend(PackageCalculator.calculate_doors([d.model_dump() for d in doors]))
    return out

# ==== CATALOG ENDPOINTS ====================================================

@app.get("/api/catalog")
def get_catalog():
    base = PackageCalculator.get_all_dims()
    ov = load_overrides()
    result = {}
    for code, dims in base.items():
        entry = dict(dims)
        if code in ov:
            entry.update(ov[code])
        result[code] = entry
    for code, entry in ov.items():
        if code not in result:
            result[code] = dict(entry)
    return result

@app.get("/api/catalog/groups")
def get_catalog_groups():
    ov = load_overrides()
    deleted = load_deleted()
    groups = PackageCalculator.get_crate_groups()
    result = []
    for g in groups:
        entry = dict(g)
        crate_id = g["crate_id"]
        if crate_id in ov:
            entry.update({k: ov[crate_id][k] for k in ("L","W","H","cap") if k in ov[crate_id]})
        # Filtra codici eliminati dalla lista codes
        entry["codes"] = [c for c in entry["codes"] if c["code"].upper() not in deleted]
        # Includi gruppo solo se ha ancora codici
        if entry["codes"]:
            result.append(entry)
    base_ids = {g["crate_id"] for g in groups}

    # Codici custom aggiunti via form: hanno _crate nel loro override
    # Raggruppa per cassa
    custom_by_crate: Dict = {}  # crate_id -> [{code, unit}]
    for ov_key, ov_val in ov.items():
        if "_crate" in ov_val and ov_key.upper() not in deleted:
            crate = ov_val["_crate"]
            custom_by_crate.setdefault(crate, []).append({"code": ov_key, "unit": ov_val.get("unit", "unità")})

    # Aggiungi i codici custom ai gruppi base esistenti
    for entry in result:
        crate_id = entry["crate_id"]
        if crate_id in custom_by_crate:
            entry["codes"] = entry["codes"] + custom_by_crate.pop(crate_id)

    # Casse completamente nuove (non in get_crate_groups)
    for crate_id, codes in custom_by_crate.items():
        dims = ov.get(crate_id, {})
        result.append({
            "crate_id": crate_id,
            "L": dims.get("L", 0), "W": dims.get("W", 0), "H": dims.get("H", 0),
            "cap": dims.get("cap", 1), "cap_unit": "unità",
            "codes": codes
        })

    return result

@app.get("/api/catalog/deleted")
def get_deleted_codes():
    return load_deleted()

@app.delete("/api/catalog/code/{code}")
def delete_catalog_code(code: str):
    code_up = code.upper()
    deleted = load_deleted()
    if code_up not in deleted:
        deleted.append(code_up)
        save_deleted(deleted)
    # Rimuovi anche da overrides se presente come chiave diretta
    ov = load_overrides()
    if code_up in ov:
        del ov[code_up]
        save_overrides(ov)
    return {"status": "deleted", "code": code_up}

class CatalogOverrideIn(BaseModel):
    code: str = Field(min_length=1)
    L: int = Field(gt=0, description="Lunghezza in mm, > 0")
    W: int = Field(gt=0, description="Larghezza in mm, > 0")
    H: int = Field(gt=0, description="Altezza in mm, > 0")
    cap: int = Field(gt=0, description="Capacità pz/cassa, > 0")
    crate_id: Optional[str] = None
    unit: Optional[str] = "unità"

@app.post("/api/catalog/override")
def set_catalog_override(payload: CatalogOverrideIn):
    ov = load_overrides()
    code_up = payload.code.upper()
    crate_up = (payload.crate_id or payload.code).upper()

    # Salva le dims della cassa (chiave = crate_id)
    # Aggiorna sempre le dims (l'utente potrebbe averle cambiate)
    existing = ov.get(crate_up, {})
    existing.update({"L": payload.L, "W": payload.W, "H": payload.H, "cap": payload.cap, "_is_crate": True})
    ov[crate_up] = existing

    # Se il codice è diverso dalla cassa (nuovo articolo), salva il legame
    if code_up != crate_up:
        ov[code_up] = {"_crate": crate_up, "unit": payload.unit or "unità"}

    save_overrides(ov)
    return {"status": "ok", "code": code_up, "crate": crate_up}

# ==== ENDPOINT PRINCIPALE ===================================================
def _build_container_response(containers: List[Dict]) -> List[Dict]:
    """Helper per serializzare la lista container."""
    return [
        {
            "placed": [
                {
                    "package": {
                        "id": p['package'].id,
                        "length": p['package'].length,
                        "width":  p['package'].width,
                        "height": p['package'].height,
                        "quantity": p['package'].quantity,
                        "description": p['package'].description
                    },
                    "x": p['x'], "y": p['y'],
                    "length": p['length'], "width": p['width'],
                    "rotated": p['rotated']
                } for p in c['placed']
            ],
            "efficiency_area": c['efficiency_area'],
            "area_used": c['area_used'],
            "container_index": c['container_index']
        } for c in containers
    ]


# ==== USER CONFIGS ENDPOINTS =================================================

@app.get("/api/configs")
def get_configs():
    return load_configs()

class ConfigIn(BaseModel):
    id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    model_config = {"extra": "allow"}  # accetta campi extra (date, articles, ecc.)

@app.post("/api/configs")
def save_config(cfg: ConfigIn):
    data = cfg.model_dump()
    configs = load_configs()
    # Se esiste già un config con lo stesso id, sostituiscilo
    configs = [c for c in configs if c.get("id") != data["id"]]
    configs.append(data)
    save_configs(configs)
    return {"status": "saved", "id": data["id"]}

@app.delete("/api/configs/{config_id}")
def delete_config(config_id: str):
    configs = load_configs()
    configs = [c for c in configs if c.get("id") != config_id]
    save_configs(configs)
    return {"status": "deleted", "id": config_id}


@app.post("/api/calc-optimize", response_model=OptimizationOut)
def calc_optimize(payload: CalcRequest):
    container = Container(**payload.container.model_dump())
    warnings: List[str] = []
    unrecognized: List[Dict] = []
    packages = calc_packages(payload.articles, payload.doors, payload.visuals, warnings, unrecognized)

    if payload.optimizer == "exact":
        opt = ContainerOptimizer(container).place_packages_multi(packages)
    else:
        opt = ContainerOptimizerFast(container).place_packages_multi(packages)

    # Calcola alternativa 20' se l'ultimo container 40' è sottoutilizzato
    alternative = None
    if opt['containers']:
        last_idx = len(opt['containers']) - 1
        last_container = opt['containers'][last_idx]
        cont_dims = payload.container

        # Verifica se container scelto è 40' o 40' HC
        is_40 = cont_dims.length > 10000  # 40' = 12036mm
        is_40_hc = is_40 and cont_dims.height > 2400  # HC = 2580mm

        if is_40:
            # Sottoutilizzato se efficiency < 70% o meno di 6 casse
            underutilized = (last_container['efficiency_area'] < 0.70 or
                           len(last_container['placed']) < 6)

            if underutilized:
                # Estrai i package dall'ultimo container
                last_packages = [p['package'] for p in last_container['placed']]

                # Verifica se tutti entrano in lunghezza 20' (5900mm)
                max_len_20 = 5900
                all_fit_length = all(p.length <= max_len_20 for p in last_packages)

                if all_fit_length:
                    # Prova ottimizzazione con 20' (HC se l'originale era HC)
                    alt_container = Container(
                        length=5900,
                        width=2342,
                        height=2580 if is_40_hc else 2280
                    )

                    if payload.optimizer == "exact":
                        alt_opt = ContainerOptimizer(alt_container).place_packages_multi(last_packages)
                    else:
                        alt_opt = ContainerOptimizerFast(alt_container).place_packages_multi(last_packages)

                    # Se tutti entrano in 1 container 20', crea alternativa
                    if len(alt_opt['containers']) == 1 and not alt_opt['not_placed']:
                        # Container precedenti (tutti tranne l'ultimo) + nuovo 20'
                        prev_containers = opt['containers'][:-1]
                        alt_containers_data = _build_container_response(prev_containers + alt_opt['containers'])

                        alt_type = "20' HC" if is_40_hc else "20'"
                        original_type = "40' HC" if is_40_hc else "40'"

                        alternative = {
                            "containers": alt_containers_data,
                            "not_placed": [],
                            "total_units": opt['total_units'],
                            "total_placed": opt['total_placed'],
                            "suggestion": f"Ultimo container sottoutilizzato ({last_container['efficiency_area']*100:.1f}%). "
                                         f"Alternativa: sostituire 1×{original_type} con 1×{alt_type}",
                            "savings": f"1×{original_type} → 1×{alt_type}",
                            "original_container": {"length": cont_dims.length, "width": cont_dims.width, "height": cont_dims.height},
                            "alt_container": {"length": alt_container.length, "width": alt_container.width, "height": alt_container.height},
                            "alt_starts_at": len(prev_containers)
                        }

    resp = {
      "containers": _build_container_response(opt['containers']),
      "not_placed": [
        {
          "id": np.id, "length": np.length, "width": np.width,
          "height": np.height, "quantity": np.quantity,
          "description": np.description
        } for np in opt['not_placed']
      ] + unrecognized,
      "total_units": opt['total_units'],
      "total_placed": opt['total_placed'],
      "alternative": alternative,
      "warnings": warnings,
    }
    return resp

