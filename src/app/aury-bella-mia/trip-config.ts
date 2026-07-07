export type DubrovnikImage = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  credit: string;
  width: number;
  height: number;
  focus?: string;
};

// Modifica qui destinazione, date, voli, testi e immagini principali del regalo.
export const giftTrip = {
  destination: 'Dubrovnik',
  country: 'Croazia',
  dateRange: '11 — 14 settembre 2026',
  flights: {
    outbound: {
      date: '11 settembre 2026',
      time: '21:35–22:55',
    },
    return: {
      date: '14 settembre 2026',
      time: '21:35–22:55',
    },
  },
  intro: {
    imageId: 'hero-sea',
    title: 'C’è un’ultima cosa.',
    subtitle: 'E questa non entrava nella scatola.',
    cta: 'Apri',
  },
  reveal: {
    imageId: 'city-walls',
    lineOne: 'Ci sono posti belli.',
    lineTwo: 'E poi ci sono posti che diventano belli perché ci sei tu.',
    body: 'Quattro giorni per perderci un po’, stare bene e aggiungere un altro posto alla nostra storia.',
    subtitle: 'Croazia · 11 — 14 settembre 2026',
    cta: 'Fammi vedere',
  },
  pause: {
    eyebrow: 'Prima del piano',
    title: 'Ora sai dove.',
    body: 'Il resto lo scegliamo lì: un passo alla volta, con il mare vicino e il telefono pieno di foto mosse.',
    cta: 'Vedi il piano',
  },
  boardingPass: {
    label: 'Boarding pass',
    passenger: 'Aury + Mattia',
    from: 'Casa',
    to: 'Dubrovnik',
    code: 'DBV',
    date: '11 settembre 2026',
    outbound: '21:35 — 22:55',
    return: '14 set · 21:35 — 22:55',
    seat: 'Noi due',
    gate: 'Settembre',
  },
  planTitle: 'Il piano, più o meno.',
  galleryImageIds: ['clear-rocks', 'old-town', 'side-street', 'srd-sunset'],
  final: {
    before:
      'Non so ancora quale sarà la foto più bella del viaggio. Ma so già con chi voglio esserci dentro.',
    cta: 'Ok, andiamo.',
    after: 'Dubrovnik ci aspetta.',
  },
};

// Sostituisci questi path per cambiare la direzione visiva della pagina.
export const dubrovnikImages: DubrovnikImage[] = [
  {
    id: 'hero-sea',
    src: '/aury-bella-mia/images/dubrovnik-boats-clear-water.jpg',
    alt: 'Acqua limpida vista dall alto con piccole barche e una costa di pietra.',
    caption: 'Il mare dall alto, chiaro come una rivelazione.',
    credit: 'Pexels / Luciann Photography',
    width: 1600,
    height: 1067,
    focus: 'center',
  },
  {
    id: 'clear-rocks',
    src: '/aury-bella-mia/images/dubrovnik-clear-rocks.jpg',
    alt: 'Acqua limpida e rocce viste dall alto sulla costa di Dubrovnik.',
    caption: 'Acqua chiara, rocce, il tipo di silenzio che resta addosso.',
    credit: 'Pexels / Luciann Photography',
    width: 1600,
    height: 1067,
    focus: 'center',
  },
  {
    id: 'city-walls',
    src: '/aury-bella-mia/images/dubrovnik-walls-sea.jpg',
    alt: 'Le mura di Dubrovnik sopra la roccia e il mare Adriatico.',
    caption: 'Pietra, luce e mare: il punto in cui la città diventa scena.',
    credit: 'Pexels',
    width: 1800,
    height: 1200,
    focus: 'center',
  },
  {
    id: 'srd-sunset',
    src: '/aury-bella-mia/images/dubrovnik-sunset.jpg',
    alt: 'Dubrovnik al tramonto, con mura storiche e mare sullo sfondo.',
    caption: 'Il tramonto sopra le isole, quando tutto diventa più lento.',
    credit: 'Pexels / This And No Internet 25',
    width: 1600,
    height: 1200,
    focus: 'center',
  },
  {
    id: 'old-town',
    src: '/aury-bella-mia/images/dubrovnik-old-town-aerial.jpg',
    alt: 'La città vecchia di Dubrovnik affacciata sull Adriatico.',
    caption: 'La città vecchia, il porto, il mare che tiene tutto insieme.',
    credit: 'Pexels',
    width: 1800,
    height: 1200,
    focus: 'center',
  },
  {
    id: 'side-street',
    src: '/aury-bella-mia/images/dubrovnik-side-street.jpg',
    alt: 'Una via stretta nella città vecchia di Dubrovnik con tetti rossi e luce mediterranea.',
    caption: 'Uno scorcio più piccolo, il tipo di posto in cui fermarci senza motivo.',
    credit: 'Pexels / Asim Hocagil',
    width: 1200,
    height: 2133,
    focus: 'center',
  },
  {
    id: 'final-sunset',
    src: '/aury-bella-mia/images/dubrovnik-skyline-sea.jpg',
    alt: 'Dubrovnik vista dall alto con il mare e il profilo della città.',
    caption: 'Un ultimo sguardo prima di scegliere dove fermarci.',
    credit: 'Pexels',
    width: 1800,
    height: 1200,
    focus: 'center',
  },
];

export const tripPlan = [
  {
    day: 'Venerdì',
    body: 'Atterriamo tardi.\nQuindi la prima cosa da fare è capire dove siamo e baciarci da qualche parte con vista.',
  },
  {
    day: 'Sabato',
    body: 'Ci perdiamo tra vicoli, mare e posti che vedremo su TikTok cinque minuti prima.',
  },
  {
    day: 'Domenica',
    body: 'Giornata ufficiale dedicata al relax, al mare e a non avere alcuna fretta.',
  },
  {
    day: 'Lunedì',
    body: 'Ultimo caffè, ultime foto e tentativo inutile di non voler tornare.',
  },
];
