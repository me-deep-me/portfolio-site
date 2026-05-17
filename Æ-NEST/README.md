# Panel Nesting Optimizer

Sistema completo per l'ottimizzazione del nesting (impaginazione) di pannelli rettangolari su lastre standard, con calcolo automatico di imballaggio, export multi-formato e interfaccia grafica.

## 📁 Struttura del progetto

```
nesting_project/
├── config.py              # Configurazioni, logging, costanti
├── geometry.py            # Classi dati (LayoutRow), utilità geometriche
├── data_io.py            # Lettura/conversione Excel/CSV
├── packing.py            # Algoritmi di nesting (rectpack)
├── ordering.py           # Ordinamento lastre per CNC
├── packaging.py          # Calcolo pesi e proposta casse
├── export_xlsx.py        # Export Excel (LAYOUT, SHEETS, MACHINE, PACKAGING)
├── export_dxf.py         # Export DXF (per lastra + ALL-in-one)
├── export_3d.py          # Export IFC, GLB, PNG esplosi 3D
├── visualization.py      # PNG layout 2D per lastra
├── gui.py                # Interfaccia grafica Tkinter
├── main.py               # Entry point CLI/GUI
└── README.md             # Questa documentazione
```

## 🔧 Installazione

### Dipendenze obbligatorie:
```bash
pip install pandas openpyxl xlsxwriter rectpack
```

### Dipendenze opzionali (per funzionalità avanzate):

**Export DXF:**
```bash
pip install ezdxf
```

**Export 3D (IFC/GLB/PNG):**
```bash
pip install ifcopenshell trimesh numpy matplotlib
```

**GUI con Drag & Drop:**
```bash
pip install tkinterdnd2
```

### Installazione completa:
```bash
pip install pandas openpyxl xlsxwriter rectpack ezdxf ifcopenshell trimesh numpy matplotlib tkinterdnd2
```

## 🚀 Utilizzo

### Interfaccia Grafica (GUI)

**Avvio:**
```bash
python main.py --gui
```
oppure semplicemente:
```bash
python main.py
```

**Funzionalità GUI:**
- Drag & drop del file Excel
- Preset lastre (INOX, HPL, CORIAN, CORIAN+GRECATO, CUSTOM)
- Anteprima dati in tabella
- Console integrata con log in tempo reale
- Calcolo in thread separato (interfaccia non si blocca)

### Command Line Interface (CLI)

**Esempio base:**
```bash
python main.py pannelli.xlsx --sheet 930 3000 --kerf 4 --out risultato
```

**Con visualizzazione PNG:**
```bash
python main.py pannelli.xlsx --sheet 930 3000 --kerf 4 --visualise --out risultato
```

**Disabilita rotazione pannelli:**
```bash
python main.py pannelli.xlsx --sheet 930 3000 --no-rotate --out risultato
```

**Specifica materiale per pesi:**
```bash
python main.py pannelli.xlsx --sheet 930 3000 --material corian --max-crate-kg 1000 --out risultato
```

**Export IFC 3D:**
```bash
python main.py pannelli.xlsx --sheet 930 3000 --export-ifc --panel-thickness 18 --out risultato
```

**Log dettagliati:**
```bash
python main.py pannelli.xlsx --sheet 930 3000 --verbose-log --out risultato
```

### Parametri CLI completi

| Parametro | Tipo | Default | Descrizione |
|-----------|------|---------|-------------|
| `file` | path | - | File Excel input (obbligatorio per CLI) |
| `--gui` | flag | False | Avvia interfaccia grafica |
| `--sheet W H` | float float | 930 3000 | Dimensioni lastra (mm) |
| `--kerf` | float | 4 | Larghezza taglio (mm) |
| `--no-rotate` | flag | False | Disabilita rotazione pannelli |
| `--visualise` | flag | False | Genera PNG layout 2D |
| `--out` | str | result | Prefisso/cartella output |
| `--group-run` | flag | False | Ordine lavorazione CNC |
| `--id-order` | asc/desc | asc | Ordinamento panel_number |
| `--material` | str | hpl | Materiale (hpl/corian/inox/corian_grecato) |
| `--max-crate-kg` | float | 1200 | Peso massimo cassa (kg) |
| `--export-ifc` | flag | False | Export IFC 3D |
| `--panel-thickness` | float | auto | Spessore pannelli 3D (mm) |
| `--verbose-log` | flag | False | Log dettagliati |

## 📄 Formato file input

Il file Excel deve contenere le seguenti colonne (nomi case-insensitive):

| Colonna | Alias accettati | Tipo | Descrizione |
|---------|----------------|------|-------------|
| **id** | id | testo | Identificativo pannello |
| **number** | n°, numero | testo | Numero pannello |
| **width** | larghezza, lunghezza, widht | numerico | Larghezza (mm) |
| **height** | altezza | numerico | Altezza (mm) |
| **qty** | quantità, quantita, qta | numerico | Quantità (default: 1) |

**Esempio:**

| id | N° | larghezza (mm) | altezza (mm) | quantità |
|----|-----|----------------|--------------|----------|
| PAN-A | 001 | 800 | 600 | 2 |
| PAN-B | 002 | 1200 | 400 | 1 |
| PAN-C | 003 | 500 | 500 | 3 |

**Note:**
- Il converter gestisce automaticamente formati IT/EN (virgola/punto decimale)
- Rimuove automaticamente unità di misura (mm, cm, ecc.)
- Genera file `*__issues.xlsx` se rileva valori non interpretabili

## 📤 Output generati

### Struttura cartelle:
```
<nome_output>/
├── <nome_output>.xlsx        # Workbook unico con 4 fogli
├── dxf/
│   ├── RUN001_<nome>_sheet001.dxf
│   ├── RUN002_<nome>_sheet002.dxf
│   └── <nome>_ALL_<timestamp>.dxf
├── png/
│   ├── RUN001_<nome>_sheet001_<panels>.png
│   ├── RUN002_<nome>_sheet002_<panels>.png
│   └── exploded3d/
│       ├── <nome>_ALL_CRATES_EXPLODED3D_ISO.png
│       └── <nome>_CRATE_01_EXPLODED3D_GRID.png
└── glb/
    └── <nome>_packing.glb
```

### Workbook Excel (file unico):

**Foglio LAYOUT:**
- `sheet`: Numero lastra
- `run_order`: Ordine di lavorazione CNC
- `x`, `y`: Coordinate pannello (mm)
- `width`, `height`: Dimensioni pannello (mm)
- `rotated`: Pannello ruotato (True/False)
- `panel_id`: Identificativo
- `panel_number`: Numero pannello

**Foglio SHEETS:**
- Riepilogo per lastra
- Numero pannelli
- Area utilizzata
- Percentuale utilizzo
- Lista pannelli

**Foglio MACHINE:**
- Dati per macchina CNC
- Coordinate e dimensioni
- Flag rotazione

**Foglio PACKAGING:**
- Proposta casse di imballaggio
- Dimensioni casse (mm)
- Pesi (contenuto, cassa, totale)
- Lista lastre per cassa

### Export DXF:

**Per lastra (RUN###_*_sheet###.dxf):**
- Layer `CUT`: Contorni di taglio (colori per panel_id)
- Layer `LABELS`: Etichette pannelli
- Layer `lastra`: Bordo lastra (riferimento)
- Unità: millimetri
- Etichette centrate con autoshrink

**ALL-in-one (***_ALL_<timestamp>.dxf):**
- Tutte le lastre impaginate verticalmente
- Descrizione a destra di ogni lastra
- Lista ID|N° dei pannelli

### Export 3D:

**GLB (<nome>_packing.glb):**
- Visualizzabile in Blender, online viewers
- Casse in griglia 4 colonne
- Livelli con spread radiale
- Colori distintivi per panel_id
- Camere preimpostate (ISO, TOP)

**PNG esplosi 3D:**
- Overview isometrica tutte le casse
- Grid 2×2 per cassa (ISO/TOP/FRONT/SIDE)
- Ombre, connettori, etichette livelli
- DPI 300, qualità pubblicazione

**IFC (opzionale):**
- Compatibile Revit/ArchiCAD
- Gerarchia: Site → Building → Storey → Crate → Level → Panels
- PropertySet per ogni pannello (filtri)
- Unità: millimetri

## 🎯 Modalità INOX

Per lastre INOX, il sistema applica automaticamente incrementi dimensionali:
- **+90 mm** alla larghezza
- **+30 mm** all'altezza

Questi incrementi vengono applicati PRIMA del nesting per compensare lavorazioni speciali.

**Attivazione:**
- GUI: Seleziona "LASTRA INOX 1250×3000"
- CLI: Automatico quando `--material inox`

## 🔬 Algoritmo di nesting

Il sistema utilizza **rectpack** (MaxRects-BSSF e MaxRects-BAF) con:
- Auto-tuning: prova entrambi gli algoritmi e sceglie il migliore
- Reinserimento intelligente: recupera pannelli non allocati
- Gestione kerf: spazio taglio integrato nel calcolo
- Rotazione opzionale: 90° per ottimizzazione

**Processo:**
1. Packing iniziale con algoritmo euristico
2. Identificazione pannelli non allocati
3. Tentativo reinserimento in lastre esistenti
4. Creazione nuove lastre se necessario
5. Ordinamento CNC (miste → pure per panel_id)

## 📊 Calcolo packaging

**Peso pannelli:**
- HPL: formula con bordi + densità
- CORIAN: formula specifica
- INOX: calcolo su densità
- CORIAN GRECATO: solo superficie

**Dimensioni casse:**
- Larghezza: lastra + 30 mm
- Profondità: lastra + 30 mm
- Altezza: (n_livelli × 20mm) + 80mm

**Peso cassa:**
- Basato su superficie totale 6 facce
- Formula: area_cm² × 0.0013 kg/cm²

**Algoritmo greedy:**
- Accumula lastre finché peso totale ≤ max
- Rispetta run_order per efficienza logistica
- Crea nuova cassa al superamento limite

## 🛠️ Personalizzazione

### Aggiungere un nuovo materiale:

**1. In `config.py`:**
```python
DEFAULT_THICKNESS = {
    "hpl": 12.0,
    "corian": 12.0,
    "inox": 2.0,
    "corian_grecato": 18.0,
    "nuovo_materiale": 15.0  # <-- AGGIUNGI
}
```

**2. In `packaging.py` (funzione `_panel_weight_kg`):**
```python
elif material == "nuovo_materiale":
    return (w*h*densità_kg_per_m2/1_000_000.0)
```

**3. In `main.py` e `gui.py`:**
Aggiungi l'opzione nelle scelte CLI/GUI

### Aggiungere un preset lastra:

**In `config.py`:**
```python
SHEET_PRESETS = {
    "inox": (1250.0, 3000.0),
    "hpl": (1300.0, 3050.0),
    "corian": (930.0, 3000.0),
    "corian_grecato": (1200.0, 2945.0),
    "nuovo_preset": (1000.0, 2000.0)  # <-- AGGIUNGI
}
```

**In `gui.py` (metodo `_build_sheet_options`):**
Aggiungi un nuovo Radiobutton

## 🐛 Troubleshooting

**"Rectpack non è installato":**
```bash
pip install rectpack
```

**"ezdxf non installato" (DXF saltati):**
```bash
pip install ezdxf
```

**"GLB non esportato: dipendenze mancanti":**
```bash
pip install trimesh numpy
```

**File Excel non letto correttamente:**
- Verifica che le colonne siano nominate correttamente
- Controlla il file `*__issues.xlsx` generato
- Assicurati che i valori numerici non contengano lettere/simboli

**GUI non si avvia:**
```bash
# Verifica Tkinter
python -c "import tkinter; print('OK')"

# Per drag & drop:
pip install tkinterdnd2
```

**Pannelli non allocati:**
- Verifica dimensioni pannelli vs lastra
- Controlla il kerf impostato
- Considera di aumentare le dimensioni lastra
- Riduci kerf se troppo grande

## 📝 Note tecniche

- **Thread-safe**: GUI usa queue.Queue per log sicuri
- **Fallback intelligenti**: timestamp su file bloccati, motori Excel alternativi
- **Validazione robusta**: gestione formati numerici IT/EN, cleanup automatico
- **Memory-efficient**: conversione Excel in-memory, no file temporanei
- **Export lazy**: solo formati richiesti vengono generati

## 🤝 Contribuire

Per contribuire al progetto:
1. Mantieni la struttura modulare
2. Aggiungi docstring a funzioni pubbliche
3. Testa con file reali prima di commit
4. Aggiorna questa documentazione per nuove feature

## 📜 Licenza

Codice fornito "as-is" per uso interno.

## 🆘 Supporto

Per problemi o domande:
1. Verifica questa documentazione
2. Controlla i file `*__issues.xlsx` generati
3. Esegui con `--verbose-log` per dettagli
4. Controlla la console per errori specifici