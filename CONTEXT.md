# Portfolio Mattia Erigoni — Contesto del Progetto

## Chi sono
Management Engineer con forte orientamento alla digitalizzazione dei processi, operations research e AI.
Nel corso dell'ultimo anno ho progettato e sviluppato in autonomia una suite completa di applicazioni industriali
per un'azienda reale del settore healthcare — ogni tool nasce dall'osservazione diretta di un processo rotto,
e viene validato in produzione.

Il portfolio è collegato alla mia tesi magistrale (2026):
**"Digitalizzazione e automazione dei processi in un'azienda del settore healthcare"**

---

## Obiettivo del portfolio

1. **Vetrina professionale** per recruiter e potenziali datori di lavoro
2. **Documentazione tecnica** del lavoro svolto (algoritmi, architetture, scelte progettuali)
3. **Demo interattive** dei tool più dimostrabili (via Streamlit Cloud)
4. **Pubblicazione gratuita** in prima fase, poi su dominio personale (mattia-erigoni.com o simile)

---

## Stack tecnico scelto

| Layer | Tecnologia | Piano | Motivo |
|---|---|---|---|
| Sito vetrina | HTML / CSS / JS | Vercel (gratis) | Zero dipendenze, deploy in 2 click |
| Demo Python | Streamlit | Streamlit Cloud (gratis) | Converte app Python in web app senza riscrivere |
| Codice sorgente | GitHub | GitHub (gratis) | Hosting + visibilità tecnica |
| Dominio futuro | TBD | ~10€/anno | Fase 2, dopo validazione |

---

## Architettura repository GitHub (target)

```
github.com/mattia-erigoni/
├── portfolio-site          → questo repo (sito vetrina)
├── ae-nest                 → Æ-Nest: 2D nesting pannelli
├── cargocast               → CargoCast: stima container commerciale
├── loadscan                → LoadScan: verifica container operativa
├── door-pack-optimizer     → Door Pack: imballaggio porte tecniche
├── gantt-pm                → Gantt PM: scheduling produzione (Excel/VBA)
├── contactbase-xl          → ContactBase XL: governance DB 85k record
├── rag-experiments         → RAG: LLM locale su documentazione tecnica
└── micro-tools             → Micro Tools: utility Python varie
```

---

## I tool (panoramica)

### 01 · Æ-Nest — 2D Cut-Stock Optimizer
- **Problema:** ottimizzare il taglio di pannelli per pareti modulari (sale operatorie, locali tecnici) da lastre standard
- **Tipo:** NP-hard bin packing problem
- **Algoritmo:** heuristica BSSF + BAF (via rectpack), multi-strategia con ordinamento logistico
- **Input:** export BIM/Revit (Excel), parametri lastra, kerf
- **Output:** Excel, DXF per CNC, PNG layout, GLB/IFC 3D
- **UI:** Tkinter desktop
- **Demo:** screenshot/gif (UI desktop non deployabile direttamente)

### 02 · CargoCast — Container Estimator (commerciale)
- **Problema:** stimare quanti container servono per una spedizione *prima* che esista la packing list reale
- **Input:** codici articolo + quantità preventivate
- **Logica:** regole per famiglia prodotto → generazione casse virtuali → 3D bin packing
- **Output:** conteggio container, tasso saturazione, visualizzazione 2D
- **Stack:** Python + FastAPI + HTML/CSS/JS
- **Demo:** Streamlit (riscrittura della logica core)

### 03 · LoadScan — Container Verifier (operativo)
- **Problema:** verificare il carico di una packing list reale prima della spedizione
- **Input:** codici cassa + quantità + dimensioni confermate
- **Logica:** stesso motore di CargoCast, dati reali invece di stimati
- **Output:** mappe di carico 2D/3D, report peso/volume per container
- **Stack:** Python + JavaScript
- **Demo:** Streamlit

### 04 · Door Pack Optimizer — Casse per Porte Tecniche
- **Problema:** dimensionare casse di imballaggio per porte ospedaliere tecniche (ermetiche, piombate, acustiche)
- **Input:** stringhe prodotto (codici tecnici) → parsing automatico dimensioni, tipo, schermatura
- **Logica:** stima peso per modelli material-specific + multi-constraint bin packing (peso, profondità, stabilità)
- **Output:** configurazione casse, report Excel, dashboard interattivo
- **UI:** Tkinter
- **Demo:** Streamlit

### 05 · Gantt PM — Production Scheduler
- **Problema:** scheduling automatico in ambienti engineer-to-order
- **Input:** dati ordini + capacità risorse + tempi medi operazione
- **Output:** Gantt con allocazione giornaliera per macchina/reparto, ricalcolo rapido su cambio priorità
- **Stack:** Excel + VBA
- **Demo:** screenshot/gif + file scaricabile

### 06 · ContactBase XL — Data Governance 85k Record
- **Problema:** database B2B da 85.000+ contatti (ospedali, cliniche, distributori) senza governance
- **Soluzione:** sistema VBA con validazione format, deduplicazione per chiavi logiche, CRUD strutturato,
  separazione input/master, generazione automatica bozze Outlook contestualizzate
- **Stack:** Excel + VBA
- **Demo:** screenshot/gif + file scaricabile (dati anonimizzati)

### 07 · RAG Experiments — LLM Locale su Documentazione Tecnica
- **Problema:** documentazione tecnica frammentata (PDF, Excel, manuali) non interrogabile efficientemente
- **Approccio:** LLM locale + RAG (vector DB, OCR, source-constrained generation) senza inviare dati a servizi esterni
- **Vision:** ÆMed — sistema modulare privacy-first per intelligence su cartelle cliniche
- **Stack:** Python, vector DB, OCR
- **Demo:** notebook / video demo

### 08 · Micro Tools & Analytics
- Batch converter MBOX → PDF (archiviazione email)
- Analytics produzione da export ERP (volumi, distribuzione tipi, variabilità carico)
- Analisi fornitori (costo/qualità comparativo)
- Pipeline ETL: dati grezzi → output decision-support
- **Demo:** codice su GitHub + notebook dimostrativi

---

## Stato attuale

- [x] Design e HTML sito vetrina completato
- [ ] Deploy su Vercel
- [ ] Creazione repository GitHub per ogni tool
- [ ] Implementazione demo Streamlit (CargoCast, LoadScan, Door Pack)
- [ ] Collegamento link demo/GitHub nel sito
- [ ] Dominio personale (fase 2)

---

## Contatti
- Email: mattiaerigoni99@gmail.com
- LinkedIn: linkedin.com/in/mattia-erigoni
- GitHub: github.com/mattia-erigoni
