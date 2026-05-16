# Roadmap — Portfolio Mattia Erigoni

## Fase 1 — Sito vetrina (gratis, in corso)

### Step 1 · Sito locale ✅
- [x] `index.html` completo con design, animazioni, modal progetti

### Step 2 · GitHub
- [ ] Creare account GitHub (se non esiste) o usare quello esistente
- [ ] Creare repo `portfolio-site` (pubblico)
- [ ] Push di `index.html`

### Step 3 · Deploy Vercel
- [ ] Collegare repo GitHub a Vercel
- [ ] Deploy automatico → URL tipo `mattia-erigoni.vercel.app`
- [ ] Testare su mobile e desktop

### Step 4 · Demo Streamlit — priorità alta
Riscrivere la logica core dei tool più dimostrabili in Streamlit:
- [ ] **CargoCast** — input SKU+quantità → output container count (alta priorità, già FastAPI)
- [ ] **LoadScan** — input packing list → visualizzazione carico
- [ ] **Door Pack Optimizer** — input stringa prodotto → output configurazione casse
- [ ] Deploy su Streamlit Cloud (gratis, collegato a GitHub)

### Step 5 · Repository tool
Per ogni tool, creare un repo GitHub con:
- [ ] Codice sorgente (ripulito da dati aziendali sensibili)
- [ ] README con descrizione, screenshot, istruzioni
- [ ] Link Streamlit demo (dove disponibile)

### Step 6 · Collegare tutto nel sito
- [ ] Aggiornare i link "Live Demo" e "View on GitHub" nel modal di ogni progetto
- [ ] Aggiungere screenshot/gif per i tool senza demo web (Æ-Nest, Gantt PM, ContactBase XL)

---

## Fase 2 — Dominio personale (~10€/anno)

- [ ] Acquistare dominio (es. `mattiaerigoni.com` o `erigoni.dev`)
- [ ] Collegare dominio a Vercel (gratuito nel piano free)
- [ ] Aggiornare footer e meta tag nel sito

---

## Decisioni pendenti

| Decisione | Opzioni | Note |
|---|---|---|
| Mostrare il codice sorgente? | Pubblico / Privato / Solo README | Valutare cosa è sensibile |
| Demo Æ-Nest | Screenshot gif / Video / Nessuna demo web | Tkinter non deployabile |
| ContactBase XL demo | File Excel con dati fake / Solo screenshot | Dati reali da anonimizzare |
| Lingua del sito | Inglese (attuale) / Italiano / Bilingue | Inglese per reach internazionale |

---

## Prossima sessione di lavoro

Priorità suggerita:
1. Deploy Vercel (10 minuti, impatto massimo)
2. Streamlit demo CargoCast (già in FastAPI, conversione rapida)
3. README template per i repo
