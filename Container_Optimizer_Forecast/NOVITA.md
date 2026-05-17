# Packaging Optimizer — Novità per l'utente | Aggiornamento Aprile 2026

---

## 1. Tema Chiaro / Scuro

È ora possibile passare da un tema scuro (default) a un tema chiaro premendo il pulsante **🌙 / ☀️** in alto a destra nell'intestazione.

---

## 2. Salvataggio e Caricamento Configurazioni

Il pulsante **💾 Config** in alto a destra apre un pannello dove è possibile:

### Salvare la configurazione attuale
1. Inserire un nome descrittivo nel campo di testo (es. _"Commessa 2025-001"_).
2. Premere **Salva attuale**.
3. La configurazione salvata include: tutti gli articoli inseriti, le porte, i telai vetrati e il tipo di container selezionato.

### Caricare una configurazione salvata
- Nell'elenco delle configurazioni salvate, premere **Carica** accanto a quella desiderata.
- La schermata di inserimento viene ripristinata esattamente com'era al momento del salvataggio.
- È possibile salvare **più configurazioni** con nomi diversi e passare dall'una all'altra liberamente.

### Eliminare una configurazione
- Premere il pulsante **×** accanto alla configurazione da eliminare.
- Verrà chiesta una conferma prima di procedere.

> Le configurazioni vengono salvate nel browser locale. Sono disponibili finché si usa lo stesso PC e browser; non vengono perse allo spegnimento.

---

## 3. Suggerimento Configurazione Alternativa con Container 20'

Quando il sistema calcola la soluzione ottimale con un **container 40'** e rileva che l'ultimo container è utilizzato solo parzialmente, ora propone automaticamente una **configurazione alternativa** che sostituisce l'ultimo 40' con uno o più container **20'**.

### Come funziona
- Dopo il calcolo, se esiste un'alternativa valida, compare un avviso colorato nella scheda dei risultati con il messaggio:  
  _"💡 Alternativa suggerita: sostituire l'ultimo 40' con N container 20' (risparmio di X cm)"_
- Premere **Usa questa configurazione** oppure cliccare sul tab **"Alternativa (20')"** per vedere nel dettaglio:
  - La disposizione di ogni singolo container alternativo (vista singola con navigazione).
  - La panoramica di tutti i container affiancati (comprensivi del 20' sostitutivo).

### Quando conviene usarla
L'alternativa è utile quando la merce residua occupa molto meno della metà di un 40': in quel caso un 20' è più economico da spedire e si evita pagare volume vuoto.

---

## 4. Pannello Impostazioni (⚙️)

Il pulsante **⚙️ Impostazioni** apre un pannello avanzato che permette di **personalizzare il catalogo articoli** direttamente dall'applicazione.

Questa funzione è pensata per gestire situazioni in cui le dimensioni o le capacità delle casse standard non corrispondono a quelle realmente usate in magazzino, o quando si lavora con articoli nuovi non ancora presenti nel catalogo.

---

### Cosa si può fare

#### Modificare un articolo esistente
Se le dimensioni o la capacità di una cassa nel catalogo non sono corrette (ad esempio perché il fornitore ha cambiato l'imballo), è possibile sovrascrivere quei valori:

1. Cercare il codice articolo nella lista del pannello.
2. Modificare lunghezza, larghezza, altezza o numero di pezzi per cassa.
3. Salvare: da quel momento in poi il sistema userà le nuove misure per quel codice.

Il catalogo originale è incorporato nel programma e non può essere modificato. Le correzioni inserite vengono salvate in un file separato, nella stessa cartella dell'eseguibile. Funziona come un **post-it attaccato sopra un dato**: il programma lo vede per primo e lo usa; se lo si toglie, ricompare il valore originale sottostante, senza che sia stato mai alterato. Per "togliere il post-it" è sufficiente eliminare la sovrascrittura dal pannello.

---

#### Aggiungere un articolo nuovo
Se un codice non è ancora presente nel catalogo (es. un prodotto nuovo o un codice personalizzato), è possibile aggiungerlo manualmente:

1. Inserire il codice articolo (es. _"MTA.999"_).
2. Inserire le dimensioni della cassa (L × W × H in mm) e il numero di pezzi per cassa.
3. Salvare: il codice entra a tutti gli effetti nel catalogo e sarà disponibile immediatamente nel campo di inserimento articoli, con le stesse funzionalità di un articolo originale (calcolo, posizionamento, visualizzazione grafica).

---

#### Eliminare un articolo
È possibile nascondere dal catalogo un articolo che non viene più utilizzato, così da non vederlo comparire nei suggerimenti. L'articolo non viene cancellato definitivamente: si può ripristinare in qualsiasi momento.

---

### Importante

**Se l'eseguibile si trova sul server:**
le modifiche al catalogo sono visibili a **tutti gli utenti** che aprono l'applicazione da quella posizione — perché il file delle personalizzazioni viene salvato nella stessa cartella dell'exe e tutti lo leggono. Una modifica fatta da un utente si riflette immediatamente anche sugli altri.

**Se ogni utente ha una copia locale dell'exe sul proprio PC:**
le modifiche rimangono private a quel PC. Se si vuole allineare i cataloghi, occorre reinserire le personalizzazioni su ogni macchina.

> **Nota separata — Configurazioni articoli (💾 Config):** queste sono sempre personali, indipendentemente da dove si trova l'exe. Vengono salvate nel browser di ciascun utente e non vengono mai condivise.

---



## Riepilogo visivo dei nuovi controlli in intestazione

| Pulsante | Funzione |
|---|---|
| 🌙 / ☀️ | Cambia tra tema scuro e tema chiaro |
| 💾 Config | Apre il pannello salvataggio/caricamento configurazioni |
| Esporta JSON | Scarica i risultati dell'ultimo calcolo in formato JSON |
| Pulisci | Azzera tutti i campi di inserimento |
| ⚙️ Impostazioni | Apre il pannello impostazioni avanzate (modifica catalogo) |
| **INIZIA IL CALCOLO** | Avvia l'ottimizzazione con i dati inseriti |
