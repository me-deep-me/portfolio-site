# Packaging Optimizer — Changelog tecnico

> Riepilogo completo delle modifiche introdotte in questa iterazione di sviluppo (Maggio 2026).

---

## 1. Casse generiche XXX rinominate

Tutti i codici delle casse generiche sono stati rinominati nel formato **`XXX.<L>_<W>`** in modo che il nome stesso comunichi le dimensioni della cassa.

| Codice precedente | Nuovo codice | Dimensioni L × W × H (mm) |
|---|---|---|
| `XXX.3500` | `XXX.3500_900` | 3500 × 900 × 1000 |
| `XXX.1500` | `XXX.1500_900` | 1500 × 900 × 1000 |
| `XXX.2300` | `XXX.2300_800` | 2300 × 800 × 1000 |
| `XXX.2290` | `XXX.2290_500` | 2290 × 500 × 600 |
| `XXX.EURO_PALLET` | `XXX.1200_800` | 1200 × 800 × 1500 |

Aggiornato in: `backend/server.py` (calc_single_item), `backend/core/calculator.py` (get_crate_groups + get_all_dims), `web/index.html` (lista autocomplete).

Tutti e 5 i codici sono ora raggruppati sotto un'**unica categoria GENERICA** nell'autocomplete (in precedenza ognuno aveva la propria categoria).

## 2. Codici non riconosciuti → Non Posizionati

**Comportamento precedente**: i codici sconosciuti generavano silenziosamente una "cassa generica" 1000×1000×1000 e finivano nei container con qty calcolata, mascherando l'errore di input.

**Nuovo comportamento**:
- Codici **sconosciuti** → finiscono nella sezione **Non Posizionati** con descrizione *"⚠️ Codice non riconosciuto: '...'. Inserire le dimensioni nelle ⚙️ Impostazioni per calcolarlo."*
- Codici **eliminati** dal catalogo → esclusi dal calcolo con warning dedicato.
- Tutti i warning vengono mostrati all'utente in un **popup post-calcolo** + badge nello status.

## 3. Validazioni input rigorose (Pydantic + UI)

Aggiunti vincoli `Field(gt=0)` su tutti i campi numerici critici, sia lato server (Pydantic) che lato UI (alert). Casi prima accettati silenziosamente che ora restituiscono **HTTP 422** con messaggio chiaro:

- Quantità articolo ≤ 0
- Dimensioni container ≤ 0
- Dimensioni porte/telai vetrati ≤ 0
- Override con `cap` = 0 o dimensioni negative (causava `ZeroDivisionError`)
- Configurazioni salvate senza `id` o con `id` vuoto (creavano voci orfane non eliminabili)

## 4. Robustezza file dati JSON

Riscritta la gestione di `catalog_overrides.json`, `catalog_deleted.json`, `user_configs.json`:

- **Scrittura atomica**: write su `.tmp` + `os.replace()` → nessuna corruzione in caso di crash a metà scrittura.
- **Lock thread-safe** (`threading.Lock`) → richieste FastAPI concorrenti serializzate.
- **Backup automatico file corrotti**: rinominati come `<file>.corrupt.<timestamp>`, il sistema riparte da zero senza errori.
- **Logging**: errori di I/O loggati con motivo e percorso del backup.

## 5. Warnings nel response API

L'endpoint `POST /api/calc-optimize` ora restituisce un nuovo campo `warnings: List[str]` con tutti gli avvisi rilevati durante il calcolo. Il frontend mostra:
- popup `alert()` con la lista bullet point degli avvisi,
- badge nello `statusArea` con il numero di avvisi (es. *"Calcolo completato — 2 avvisi"*).

## 6. Fix UI tema chiaro: contrasto menu a tendina

In tema chiaro i `<select>` apparivano con testo sbiadito a causa del gradient residuo di `#containerSelect` (ottimizzato per il tema scuro).

**Fix**: aggiunte regole CSS ad alta specificità per tutti e 4 i select dell'app (`#containerSelect`, `#ncUnit`, `#ncCrateExisting`, `#ncCatExisting`):
- `background: #ffffff !important; background-image: none !important;`
- `color: #111827 !important;`
- Bordo leggermente più marcato.
- Stati `option`, `option:checked`, `option:hover` con contrasto massimo.

## 7. Fix UI panoramica alternativa schiacciata

Il sub-tab **Visualizzazione Panoramica** dell'alternativa 20' mostrava i container schiacciati verticalmente, perché le regole CSS `height: auto !important` e `max-height: 66vh` erano applicate solo al canvas principale (`#gridCanvas`).

**Fix**: estese le stesse regole anche a `#altGridCanvas` e `#altGridScroll`. Ora la panoramica alternativa rispetta l'altezza naturale del disegno e scrolla se eccede il 66vh.

## 8. Rinomina "Visive" → "Telai vetrati" nell'UI

In tutta l'interfaccia (web/index.html) tutti i testi visibili all'utente che contenevano "visiva/visive" sono stati sostituiti con "telaio vetrato/telai vetrati":

- Bottone *"Aggiungi Visiva"* → *"Aggiungi Telaio Vetrato"*
- Bottone *"Conferma gruppo visive"* → *"Conferma gruppo telai vetrati"*
- Placeholder *"Nessuna visiva aggiunta…"* → *"Nessun telaio vetrato aggiunto…"*
- Etichetta preview *"Visive temporanee:"* → *"Telai vetrati temporanei:"*
- Alert *"Aggiungi almeno una visiva"* → *"Aggiungi almeno un telaio vetrato"*
- Conferma reset, colonna "tipo" nella tabella articoli aggiornate.

> Codice interno (variabili `state.visuals`, ID `btnAddVisual`, `visualsPreview`, suffissi `_visual_N` dei package) **non modificato** per non rompere il sistema.

## 9. Documentazione

Creati due nuovi file nella radice del progetto:

- **`GUIDA_UTENTE.md`** — guida completa in 14 sezioni: descrizione, avvio, schermata principale, container, articoli, porte, telai vetrati, calcolo e tab risultati, alternativa 20', impostazioni catalogo, configurazioni salvate, export, gestione avvisi, FAQ.
- **`MAIL_NOVITA.md`** — bozza di mail interna per annunciare le novità ai colleghi.

## 10. Verifiche QA effettuate

Test sistematici eseguiti su tutti gli endpoint:

- ✅ `GET /api/healthz`, `GET /api/catalog`, `GET /api/catalog/groups`, `GET /api/catalog/deleted`
- ✅ `POST /api/catalog/override`, `DELETE /api/catalog/code/<id>`
- ✅ `GET/POST/DELETE /api/configs`
- ✅ `POST /api/calc-optimize` con casi normali, casi limite (qty enormi, container molto piccoli, articoli misti)
- ✅ Validazione 422 su tutti i casi non validi
- ✅ Comportamento warning su codici sconosciuti/eliminati
- ✅ Suggerimento alternativa 20' funzionante
- ✅ Persistenza override e configurazioni dopo riavvio exe

## File modificati in questa iterazione

```
backend/server.py                  (calc_single_item, validation models, safe I/O)
backend/core/calculator.py         (get_crate_groups, get_all_dims)
web/index.html                     (rinomina codici, label UI, CSS tema chiaro,
                                    CSS panoramica, validazioni client, popup warning)
GUIDA_UTENTE.md                    (NUOVO)
MAIL_NOVITA.md                     (NUOVO)
CHANGELOG.md                       (NUOVO — questo file)
```

## Limitazioni note (non affrontate in questa iterazione)

- **Calcolo bidimensionale**: l'ottimizzatore non gestisce l'impilamento verticale delle casse. Esplicitato in FAQ della guida utente.
- **Concorrenza multi-processo**: il lock è limitato al singolo processo. In scenario "exe condiviso da più PC che scrivono nello stesso file dati nello stesso momento" rimane una piccola finestra di race (improbabile nella pratica).
- **Test automatici**: nessun `pytest` ancora introdotto, le verifiche QA sono manuali.
