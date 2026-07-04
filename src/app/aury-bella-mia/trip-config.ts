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

// Modifica qui destinazione, date, voli e testi principali del regalo.
export const giftTrip = {
  recipientLine: 'per il mio amore, Aury',
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
  hero: {
    title: 'Capitolo successivo: noi, da qualche parte sul mare.',
    subtitle: '11 — 14 settembre 2026',
    hint: 'Apri il prossimo ricordo.',
    cta: 'Scopri dove andiamo',
  },
  narrative:
    'Ci siamo incontrati vicino al mare, ci siamo ritrovati lungo il cammino e questo è un nuovo posto dove costruiremo ricordi nostri.',
  final: {
    before: 'Prepariamo le valigie?',
    cta: 'Lo costruiamo insieme',
    after: 'Dubrovnik ci aspetta.',
  },
};

// Sostituisci questi path per cambiare la direzione visiva della pagina.
export const dubrovnikImages: DubrovnikImage[] = [
  {
    id: 'hero-sea',
    src: '/aury-bella-mia/images/dubrovnik-boats-clear-water.jpg',
    alt: 'Acqua limpida di Dubrovnik vista dall alto con barche e costa di pietra.',
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
    id: 'final-sunset',
    src: '/aury-bella-mia/images/dubrovnik-skyline-sea.jpg',
    alt: 'Dubrovnik al tramonto, con mura storiche e mare sullo sfondo.',
    caption: 'La luce finale prima di dirci: andiamo davvero.',
    credit: 'Pexels',
    width: 1800,
    height: 1200,
    focus: 'center',
  },
];

export const tripPlan = [
  {
    day: 'Venerdì',
    body: 'Arriviamo quando la città è già illuminata. Prima notte insieme a Dubrovnik.',
    imageId: 'old-town',
  },
  {
    day: 'Sabato',
    body: 'Mare, città vecchia, vicoli, vista dall’alto e nessuna fretta.',
    imageId: 'city-walls',
  },
  {
    day: 'Domenica',
    body: 'Acqua, spiagge, tramonto e una cena che dobbiamo ancora scegliere.',
    imageId: 'clear-rocks',
  },
  {
    day: 'Lunedì',
    body: 'Ultimo caffè, ultime foto, ritorno. Con un ricordo in più.',
    imageId: 'srd-sunset',
  },
];
