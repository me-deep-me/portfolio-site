# Packaging Optimizer — Guida Utente

> **Packaging Optimizer** | Versione Maggio 2026
> Guida completa all'utilizzo di tutte le funzionalità dell'applicazione.

---

## Indice

1. [Cos'è Packaging Optimizer](#1-cosè-packaging-optimizer)
2. [Avvio dell'applicazione](#2-avvio-dellapplicazione)
3. [Panoramica della schermata principale](#3-panoramica-della-schermata-principale)
4. [Selezione del container](#4-selezione-del-container)
5. [Inserimento articoli](#5-inserimento-articoli)
6. [Configurazione porte](#6-configurazione-porte)
7. [Telai vetrati](#7-telai-vetrati)
8. [Calcolo e risultati](#8-calcolo-e-risultati)
9. [Configurazione alternativa 20'](#9-configurazione-alternativa-20)
10. [Pannello Impostazioni (catalogo)](#10-pannello-impostazioni-catalogo)
11. [Salva / Carica configurazioni (💾 Config)](#11-salva--carica-configurazioni--config)
12. [Esporta JSON e Salva PNG](#12-esporta-json-e-salva-png)
13. [Avvisi e gestione errori](#13-avvisi-e-gestione-errori)
14. [Domande frequenti](#14-domande-frequenti)

---

## 1. Cos'è Packaging Optimizer

L'applicazione calcola **quanti container servono per spedire una lista di articoli** ottimizzandone la disposizione all'interno.

A partire da:
- un elenco di articoli con relative quantità,
- porte e telai vetrati da aggiungere alla spedizione,
- il tipo di container (40', 40' HC, 20', 20' HC, TIR),

il sistema restituisce:
- il **numero minimo di container necessari**,
- la **disposizione ottimale** di ogni singola cassa (visualizzata graficamente),
- l'**efficienza di riempimento** (% di superficie usata),
- l'elenco delle **casse non posizionate** (se l'articolo è più grande del container),
- un eventuale **suggerimento di container alternativo** più piccolo se l'ultimo 40' risulta poco utilizzato.

---

## 2. Avvio dell'applicazione

1. Fare doppio clic su **`PackagingOptimizer.exe`**.
2. Si apre automaticamente il browser predefinito all'indirizzo `http://127.0.0.1:8000/ui/`.
3. Non chiudere la finestra nera (prompt dei comandi): è il motore dell'app. Chiudendola si arresta anche il programma.

Se il browser non si apre da solo, basta aprirlo manualmente e andare su `http://127.0.0.1:8000/ui/`.

---

## 3. Panoramica della schermata principale

La schermata è divisa in due colonne:

### Intestazione (in alto)

| Pulsante | Funzione |
|---|---|
| 🌙 / ☀️ | Cambia tra tema scuro e tema chiaro |
| 💾 Config | Salva / carica configurazioni articoli |
| Esporta JSON | Scarica i dati dell'ultimo calcolo in formato JSON |
| Pulisci | Azzera tutti i campi (con conferma) |
| ⚙️ Impostazioni | Apre il pannello per personalizzare il catalogo |
| **INIZIA IL CALCOLO** | Avvia l'ottimizzazione con i dati inseriti |

### Colonna sinistra
Contiene tutti i pannelli di inserimento dati:
- Tipo di container
- Inserimento articoli
- Configurazione porte
- Telai vetrati
- Articoli inseriti (tabella riepilogativa)
- Risultati (compare dopo il calcolo)

### Colonna destra
- **Stato**: mostra messaggi di sistema (es. *"Calcolo completato"*, *"Errore..."*).

---

## 4. Selezione del container

Nel pannello **Tipo di Container** scegliere dal menu a tendina:

| Opzione | Dimensioni interne (L × W × H) | Note |
|---|---|---|
| Container 40' | 12036 × 2340 × 2280 mm | Standard |
| Container 40' HC | 12036 × 2340 × 2580 mm | High Cube (più alto) |
| Container 20' | 5900 × 2342 × 2280 mm | Standard corto |
| Container 20' HC | 5900 × 2342 × 2580 mm | High Cube corto |
| TIR | 13600 × 2400 × 2400 mm | Camion articolato |

### Dimensioni personalizzate

Se il container non è uno standard, premere **Modifica** sul campo *Dimensioni*, inserire i valori nel formato `L × W × H` (es. `11500 × 2300 × 2500`) e confermare con **Applica**.

---

## 5. Inserimento articoli

Nel pannello **Inserimento Articoli** compilare:

- **Codice Articolo**: digitare o selezionare dalla lista a comparsa (autocomplete).
- **Quantità**: valore in base al tipo di articolo:
  - *sqm* (metri quadri) per pannelli e sottostrutture,
  - *ml* (metri lineari) per profilati, angolari e componenti lineari,
  - *unità* (pezzi) per singoli oggetti.

Premere **Aggiungi** per inserire l'articolo nella lista sottostante.

### Categorie disponibili nel catalogo

L'autocomplete raggruppa i codici per categoria:

| Categoria | Esempi |
|---|---|
| **SOTTOSTRUTTURA** | SS.C.001.A, SS.C.002.A, SA.C.… |
| **PANNELLO** | SL.C.01, SL.C.02, SL.C.03, SL.C.05 |
| **PERIMETRALE CTS / ANGOLI** | Elementi perimetrali e angolari |
| **PANN_ISOLANTE** | AS.100 |
| **PIOMBATURA DELLA PARETE** | AS.114, AS.115, AS.120, AS.121 |
| **TCP** | MTA.032.22.O |
| **KIT TERMINALE FILTRANTE** | MTA.091, MTA.092, MTA.093, MTA.094 |
| **ARMADI** | MTA.292 |
| **ACCESSORI A PARETE** | MTA.113, MTA.142, MTA.172, MTA.020, MTA.AVICS.OR |
| **PLENUM E ANEMOSTATI** | MTA.330 → MTA.336 |
| **CTS** | CTS.001, CTS.002, CTS.003 |
| **PLAFONIERE** | CA.020, CA.030 |
| **LAVABI** | AF.035, AF.036, AF.037, AF.038 (+ varianti AC) |
| **GENERICA** | Casse generiche XXX (vedi sotto) |

### Casse generiche XXX

Per articoli non codificati si possono usare le **casse standard generiche**, il cui nome indica direttamente le dimensioni (Lunghezza × Larghezza):

| Codice | Dimensioni L × W × H (mm) | Uso tipico |
|---|---|---|
| `XXX.3500_900` | 3500 × 900 × 1000 | Pezzi lunghi |
| `XXX.2300_800` | 2300 × 800 × 1000 | Pezzi medi |
| `XXX.2290_500` | 2290 × 500 × 600 | Pezzi stretti |
| `XXX.1500_900` | 1500 × 900 × 1000 | Pezzi corti |
| `XXX.1200_800` | 1200 × 800 × 1500 | Euro-pallet standard |

La quantità indicata è il **numero di casse**, non di pezzi al suo interno.

### Rimuovere un articolo dalla lista

Dalla tabella **Articoli Inseriti**, premere il pulsante ✖ sulla riga corrispondente. Per svuotare tutto premere **Svuota lista**.

---

## 6. Configurazione porte

Nel pannello **Configurazione Porte** inserire le porte da spedire:

1. Selezionare il **Tipo Porta** dai riquadri:
   - Scorrevole Singola / Doppia
   - Battente Singola / Doppia
2. Inserire **H** (altezza), **W** (larghezza) e la **Quantità** in mm.
3. Premere **Aggiungi Porta**.

Il sistema genera automaticamente:
- il packaging della/e anta/e,
- per le **scorrevoli**, anche la **trave/binario** relativa al loro numero e dimensione.

Le porte aggiunte compaiono nella tabella articoli con il tipo indicato.

---

## 7. Telai vetrati

Per imballare  i telai vetrati multipli nella stessa cassa, usare il pannello **Telai Vetrati**:

1. Codice: default `AS.125` (modificabile).
2. Inserire **L × W** e **Quantità** del singolo telaio vetrato.
3. Premere **Aggiungi Telaio Vetrato** per aggiungerlo al gruppo in preparazione.
4. Ripetere per ogni formato diverso.
5. Premere **Conferma gruppo telai vetrati** per generare una cassa unica che contiene tutti i telai vetrati aggiunti.

La preview mostra il contenuto del gruppo in preparazione prima della conferma.

---

## 8. Calcolo e risultati

Dopo aver inserito tutti gli articoli, premere **INIZIA IL CALCOLO** nell'intestazione.

Dopo qualche secondo compare la card **Risultati** con i seguenti tab:

### 📊 Riepilogo (tab di default)

KPI principali:
- **Container usati** (quanti 40' / 20' / TIR servono)
- **Casse totali**
- **Efficienza media** (% di area interna usata)

Sotto, una tabella **Dettaglio per container** con il numero di packaging e l'efficienza di ciascuno.

### 📈 Report Efficienza
Tabella con l'efficienza di ogni singolo container, utile per capire se ci sono container sottoutilizzati.

### 🔍 Visualizzazione Singola
Mostra **un container alla volta** con la vista dall'alto (pianta). Usare i bottoni in alto per passare da un container all'altro (es. 1, 2, 3…).

- **Etichette ON/OFF**: mostra/nasconde il codice articolo sulle casse.
- **Salva PNG**: scarica un'immagine PNG del container corrente.

### 🗺️ Visualizzazione Panoramica
Mostra **tutti i container affiancati** nella stessa immagine. Utile per presentazioni o confronti. Anche qui si può scaricare in PNG.

### ⚠️ Non posizionati
Elenca le casse che **non entrano** in nessun container. Cause possibili:
- La cassa è più grande del container scelto (container troppo piccolo).
- Il codice non è riconosciuto dal catalogo (vedi § 13).

Ogni voce mostra: codice, dimensioni cassa, quantità e descrizione del problema.

### 💡 Alternativa 20' (tab che compare condizionalmente)
Vedi sezione seguente.

---

## 9. Configurazione alternativa 20'

Quando il calcolo usa un container **40' o 40' HC** e l'ultimo container risulta **sottoutilizzato** (sotto al 70% di riempimento o con meno di 6 casse), il sistema verifica se quei pezzi entrerebbero in un container 20'.

Se sì, compare il tab **💡 Alternativa 20'** evidenziato in azzurro, con dentro:

### Sub-tab Visualizzazione Singola
Come la visualizzazione singola principale, ma per la configurazione alternativa. Include sia i container 40' precedenti sia l'ultimo sostituito con un 20'.

### Sub-tab Visualizzazione Panoramica
Tutti i container della soluzione alternativa affiancati.

> **Nota**: se non compare il tab significa che l'ultimo 40' è già ben utilizzato oppure che le casse non entrano in un 20' (qualche cassa è più lunga di 5900 mm).

---

## 10. Pannello Impostazioni (catalogo)

Premere **⚙️ Impostazioni** nell'intestazione per aprire il pannello di **personalizzazione catalogo**.

### 10.1 Modificare un articolo esistente
1. Scorrere la lista dei gruppi o usare la ricerca.
2. Cliccare sulla riga del codice.
3. Modificare **L**, **W**, **H** (in mm) e **Capacità** (pezzi per cassa).
4. Premere **Salva**.

Da questo momento il calcolo userà le nuove dimensioni per quel codice. La modifica è sempre reversibile eliminando l'override.

### 10.2 Aggiungere un codice nuovo
1. Scorrere fino in fondo al pannello, alla sezione **Aggiungi nuovo codice**.
2. Inserire:
   - **Codice** (es. `MTA.999`)
   - **L × W × H** in mm
   - **Capacità** (pezzi per cassa)
   - **Unità di misura** (unità / sqm / ml)
   - **Cassa condivisa** (opzionale): se il nuovo codice è imballato nella **stessa cassa** di uno esistente, selezionarlo qui. Così in fase di calcolo il sistema unirà le quantità in un'unica cassa.
3. Premere **Aggiungi**.

Il codice appare immediatamente nella tabella e può essere usato nel calcolo.

### 10.3 Eliminare un codice
Premere **×** accanto al codice. Viene nascosto dal catalogo e dall'autocomplete. Se qualcuno lo inserisce comunque nel calcolo, il sistema lo segnala come *"eliminato, escluso dal calcolo"* (vedi § 13).

### 10.4 Dove finiscono le modifiche

Le personalizzazioni vengono salvate nel file `data/catalog_overrides.json` **accanto all'exe**.

- **Se l'exe è su un server condiviso**: le modifiche sono visibili a **tutti** gli utenti che aprono l'app da quella posizione. Attenzione quindi a non alterare dati condivisi senza avvisare.
- **Se ogni PC ha la propria copia dell'exe**: le modifiche sono locali e private di quel PC.

Il catalogo originale incorporato nell'exe **non viene mai modificato**: le personalizzazioni funzionano come "post-it" sopra i valori originali. Rimuovendo l'override ricompaiono i valori di fabbrica.

---

## 11. Salva / Carica configurazioni (💾 Config)

Premere **💾 Config** nell'intestazione per aprire il pannello di gestione configurazioni.

### Cosa viene salvato in una configurazione
- Tipo e dimensioni del container
- Tutti gli articoli inseriti con quantità
- Tutte le porte inserite
- Tutti i telai vetrati inseriti

### Operazioni

- **Salva attuale**: digitare un nome descrittivo (es. *"Offerta 12345"*) e premere il pulsante. La configurazione compare nella lista.
- **Carica**: premere *Carica* accanto alla config desiderata. La schermata di inserimento viene ripristinata com'era al salvataggio.
- **Elimina**: premere ✕ accanto alla config. Richiede conferma.

### Dove vengono salvate
Nel file `data/user_configs.json` **accanto all'exe**. Vale la stessa regola del catalogo:
- **Exe condiviso** → configurazioni visibili a tutti.
- **Exe locale** → configurazioni private del PC.

---

## 12. Esporta JSON e Salva PNG

### Esporta JSON
Dopo un calcolo, premere **Esporta JSON** nell'intestazione. Scarica un file `.json` con:
- input (container, articoli, porte, telai vetrati),
- output (container usati, disposizione casse, efficienze, non posizionati).

Utile per archivio commessa, condivisione con colleghi, analisi offline.

### Salva PNG
Nei tab **Visualizzazione Singola** e **Panoramica** (principale + alternativa) è presente il pulsante **Salva PNG** che scarica l'immagine della disposizione visualizzata. Utile per documenti tecnici o DDT.

---

## 13. Avvisi e gestione errori

### Avvisi post-calcolo
Dopo un calcolo, se il sistema ha rilevato problemi sui codici inseriti, compare un **popup di avviso** con la lista. Possibili messaggi:

| Messaggio | Significato | Cosa fare |
|---|---|---|
| *Codice '...' non riconosciuto: aggiunto ai Non posizionati* | Il codice digitato non esiste nel catalogo | Aprire ⚙️ Impostazioni e aggiungere il codice con le dimensioni corrette, poi rilanciare il calcolo |
| *Codice '...' eliminato dal catalogo: escluso dal calcolo* | Il codice è stato nascosto in Impostazioni | Se serve, ripristinarlo eliminando la voce dalla lista *eliminati* |

### Errori di validazione
I campi numerici accettano **solo valori positivi**. In caso contrario compare un alert:
- Quantità articolo deve essere > 0.
- Dimensioni (H, W, L) delle porte e dei telai vetrati devono essere > 0.
- Capacità / dimensioni degli override devono essere > 0.

### Recupero da file corrotti
Se un file dati (`catalog_overrides.json`, `user_configs.json`, `catalog_deleted.json`) risulta danneggiato (es. errore disco), il sistema:
1. Fa automaticamente una **copia di backup** rinominandolo in `nomefile.json.corrupt.<timestamp>`.
2. Riparte da zero per quel file.

Il backup resta nella cartella `data/` e può essere recuperato manualmente (aprendolo in un editor di testo).

---

*Per segnalazioni, richieste di nuove funzionalità o supporto tecnico, contattare Mattia Erigoni.*
