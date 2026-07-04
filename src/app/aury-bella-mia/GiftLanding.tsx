'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { dubrovnikImages, giftTrip, tripPlan, type DubrovnikImage } from './trip-config';

function imageById(id: string): DubrovnikImage {
  return dubrovnikImages.find((image) => image.id === id) ?? dubrovnikImages[0];
}

function CinematicImage({
  image,
  priority = false,
  className = '',
  sizes = '100vw',
}: {
  image: DubrovnikImage;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const frameClassName = className.trim() || 'h-full';

  return (
    <div className={`relative w-full max-w-full min-w-0 overflow-hidden bg-[#11283a] ${frameClassName}`}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        unoptimized
        priority={priority}
        sizes={sizes}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: image.focus ?? 'center' }}
      />
    </div>
  );
}

function TravelMark() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-current/20 bg-white/10 text-current backdrop-blur-md">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        <path
          d="M5.5 18.5 19 5m0 0-2.2 8.6L12 12 10.4 7.2 19 5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function GiftLanding() {
  const [accepted, setAccepted] = useState(false);
  const planImages = useMemo(
    () => tripPlan.map((item) => ({ ...item, image: imageById(item.imageId) })),
    []
  );

  const scrollToReveal = () => {
    document.getElementById('rivelazione')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f6efe3] text-[#17231f] selection:bg-[#1f3c52] selection:text-[#fff9ec]">
      <section className="relative flex h-[100svh] min-h-[720px] items-end overflow-hidden px-4 pb-7 pt-24 text-[#fff9ec] sm:px-8 md:px-10 md:pb-12">
        <div className="absolute inset-0">
          <CinematicImage image={imageById('hero-sea')} priority />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,20,31,0.34),rgba(8,20,31,0.18)_28%,rgba(8,20,31,0.82)_100%)]" />
        <div className="absolute inset-0 opacity-[0.13] [background-image:radial-gradient(rgba(255,255,255,0.72)_0.7px,transparent_0.7px)] [background-size:3px_3px]" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mx-auto flex w-full max-w-6xl min-w-0 flex-col items-start"
        >
          <p className="mb-5 inline-flex max-w-full rounded-full border border-[#fff9ec]/30 bg-[#07111f]/70 px-3.5 py-2 text-[14px] font-semibold tracking-[0.02em] text-[#fffdf4] shadow-[0_14px_38px_rgba(0,0,0,0.28)] backdrop-blur-md [text-shadow:0_2px_14px_rgba(0,0,0,0.65)] md:text-[15px]">
            {giftTrip.recipientLine}
          </p>
          <h1 className="w-full max-w-[11.4ch] break-words font-display text-[clamp(2.85rem,12.8vw,3.35rem)] leading-[0.94] tracking-[-0.015em] text-[#fffdf4] text-balance [text-shadow:0_4px_26px_rgba(0,0,0,0.6)] sm:text-6xl md:max-w-[13ch] md:text-8xl md:tracking-[-0.035em] lg:text-[7.4rem]">
            {giftTrip.hero.title}
          </h1>
          <div className="mt-7 flex w-full min-w-0 flex-col gap-5 border-t border-[#fff9ec]/24 pt-5 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="font-display text-[1.7rem] italic leading-tight text-[#f3d39d] [text-shadow:0_2px_18px_rgba(0,0,0,0.45)] md:text-3xl">
                {giftTrip.hero.subtitle}
              </p>
              <p className="mt-2 max-w-sm text-[15px] leading-7 text-[#fff9ec]/84 [text-shadow:0_2px_14px_rgba(0,0,0,0.45)] md:text-base">
                {giftTrip.hero.hint}
              </p>
            </div>
            <button
              type="button"
              onClick={scrollToReveal}
              className="inline-flex min-h-[3.25rem] w-full max-w-full items-center justify-center gap-3 whitespace-normal rounded-full border border-[#fff9ec]/28 bg-[#fff9ec]/14 px-5 py-3.5 text-center text-[12px] font-semibold uppercase tracking-[0.08em] text-[#fff9ec] shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#fff9ec]/48 hover:bg-[#fff9ec]/20 active:translate-y-0 sm:w-auto md:tracking-[0.18em]"
            >
              {giftTrip.hero.cta}
              <span aria-hidden="true" className="text-base leading-none">↓</span>
            </button>
          </div>
        </motion.div>
      </section>

      <section className="px-4 py-20 sm:px-8 md:py-28">
        <div className="mx-auto grid w-full min-w-0 max-w-6xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            className="min-w-0"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7f765e] md:tracking-[0.34em]">
              Prima della mappa
            </p>
            <p className="mt-5 w-full max-w-full break-words font-display text-[clamp(1.92rem,8.4vw,2.28rem)] leading-[1.14] tracking-[-0.004em] text-[#243229] text-pretty md:max-w-xl md:text-6xl md:leading-[1.02] md:tracking-[-0.025em]">
              {giftTrip.narrative}
            </p>
          </motion.div>
          <motion.figure
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, delay: 0.08, ease: 'easeOut' }}
            className="relative w-full max-w-full min-w-0"
          >
            <CinematicImage
              image={imageById('clear-rocks')}
              className="aspect-[4/5] rounded-[0.5rem] shadow-[0_32px_110px_rgba(31,60,82,0.18)] md:aspect-[16/10]"
              sizes="(min-width: 768px) 54vw, 100vw"
            />
            <figcaption className="mt-4 max-w-md text-[14px] leading-7 text-[#6c6656] md:text-xs md:leading-6">
              {imageById('clear-rocks').caption}
            </figcaption>
          </motion.figure>
        </div>
      </section>

      <section id="rivelazione" className="scroll-mt-8 px-4 py-14 sm:px-8 md:py-28">
        <div className="mx-auto w-full max-w-6xl min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 44, scale: 0.985 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[74svh] min-h-[600px] w-full max-w-full min-w-0 overflow-hidden rounded-[0.5rem] bg-[#0e2234] px-4 py-8 text-[#fff9ec] shadow-[0_40px_130px_rgba(17,40,58,0.28)] sm:px-8 md:px-12 md:py-12"
          >
            <div className="absolute inset-0">
              <CinematicImage image={imageById('city-walls')} />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,22,34,0.16),rgba(8,22,34,0.32)_42%,rgba(8,22,34,0.86)_100%)]" />
            <div className="relative z-10 flex h-full w-full min-w-0 flex-col justify-end">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#f0c985]/86 md:tracking-[0.42em]">
                {giftTrip.country}
              </p>
              <motion.h2
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.55 }}
                transition={{ duration: 1.1, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="mt-3 block w-full max-w-full overflow-hidden break-words font-display text-[clamp(2.95rem,14.4vw,3.55rem)] leading-[0.92] tracking-[-0.012em] text-balance sm:text-8xl md:text-[9.5rem] md:tracking-[-0.045em]"
              >
                {giftTrip.destination}
              </motion.h2>
              <div className="mt-7 flex w-full min-w-0 flex-col gap-4 border-t border-[#fff9ec]/20 pt-5 md:flex-row md:items-end md:justify-between">
                <p className="break-words font-display text-[1.55rem] italic leading-tight text-[#f3d39d] md:text-3xl">{giftTrip.dateRange}</p>
                <div className="grid min-w-0 gap-2 text-[12px] uppercase tracking-[0.06em] text-[#fff9ec]/82 sm:grid-cols-2 md:tracking-[0.18em]">
                  <p>Andata {giftTrip.flights.outbound.time}</p>
                  <p>Ritorno {giftTrip.flights.return.time}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-8 md:py-24">
        <div className="mx-auto w-full min-w-0 max-w-6xl">
          <div className="mb-9 max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7f765e] md:tracking-[0.34em]">
              Il piano
            </p>
            <h2 className="mt-4 max-w-full break-words font-display text-[clamp(2.35rem,10.4vw,3rem)] leading-[1] tracking-[-0.01em] text-[#243229] md:text-6xl md:tracking-[-0.025em]">
              Quattro giorni da ricordare.
            </h2>
          </div>

          <div className="grid w-full min-w-0 gap-3 md:grid-cols-4">
            {planImages.map((item, index) => (
              <motion.article
                key={item.day}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.22 }}
                transition={{ duration: 0.62, delay: index * 0.05, ease: 'easeOut' }}
                className="group w-full max-w-full min-w-0 overflow-hidden rounded-[0.5rem] border border-[#1f3c52]/10 bg-[#fff9ec]/74 shadow-[0_18px_70px_rgba(58,47,32,0.06)]"
              >
                <CinematicImage
                  image={item.image}
                  className="aspect-[5/4]"
                  sizes="(min-width: 768px) 25vw, 100vw"
                />
                <div className="p-4 md:p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8f7b54] md:tracking-[0.28em]">
                    0{index + 1}
                  </p>
                  <h3 className="mt-3 font-display text-[2rem] leading-none tracking-[-0.02em] text-[#20302a]">
                    {item.day}
                  </h3>
                  <p className="mt-4 text-[16px] leading-7 text-[#4f574c]">{item.body}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-8 md:py-28">
        <div className="mx-auto w-full min-w-0 max-w-6xl">
          <div className="grid w-full min-w-0 gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-end">
            <motion.figure
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.78, ease: 'easeOut' }}
              className="w-full max-w-full min-w-0"
            >
              <CinematicImage
                image={imageById('srd-sunset')}
                className="aspect-[4/5] rounded-[0.5rem] md:aspect-[16/11]"
                sizes="(min-width: 768px) 56vw, 100vw"
              />
              <figcaption className="mt-4 text-[14px] leading-7 text-[#6c6656] md:text-xs md:leading-6">
                {imageById('srd-sunset').caption}
              </figcaption>
            </motion.figure>
            <div className="grid w-full min-w-0 gap-4">
              {[imageById('clear-rocks'), imageById('old-town'), imageById('city-walls')].map((image, index) => (
                <motion.figure
                  key={`${image.id}-${index}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.62, delay: index * 0.05, ease: 'easeOut' }}
                  className="grid w-full max-w-full min-w-0 gap-3 border-t border-[#1f3c52]/10 pt-4 sm:grid-cols-[0.86fr_1fr] sm:gap-4"
                >
                  <CinematicImage
                    image={image}
                    className="aspect-square rounded-[0.45rem]"
                    sizes="(min-width: 768px) 18vw, 100vw"
                  />
                  <figcaption className="min-w-0 self-center text-[14px] leading-6 text-[#5d6255] md:text-xs">
                    {image.caption}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            className="mx-auto mt-16 w-full max-w-3xl min-w-0 text-center md:mt-24"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7f765e] md:tracking-[0.34em]">
              Non è soltanto un posto da vedere.
            </p>
            <p className="mt-5 max-w-full break-words font-display text-[clamp(2.22rem,10vw,2.85rem)] leading-[1] tracking-[-0.01em] text-[#243229] text-balance md:text-7xl md:tracking-[-0.03em]">
              È un ricordo che dobbiamo ancora costruire.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative flex h-[82svh] min-h-[600px] items-center justify-center overflow-hidden px-4 py-20 text-center text-[#fff9ec] sm:px-8">
        <div className="absolute inset-0">
          <CinematicImage image={imageById('final-sunset')} />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,22,35,0.38),rgba(9,22,35,0.88))]" />
        <div className="absolute inset-0 bg-[#07111f]/25" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 mx-auto w-full max-w-3xl min-w-0"
        >
          <div className="mx-auto mb-6 flex justify-center text-[#f3d39d]">
            <TravelMark />
          </div>
          <h2 className="max-w-full break-words font-display text-[clamp(2.7rem,12.2vw,3.25rem)] leading-[1] tracking-[-0.012em] text-balance sm:text-6xl md:text-8xl md:tracking-[-0.035em]">
            {accepted ? giftTrip.final.after : giftTrip.final.before}
          </h2>
          <motion.div
            animate={accepted ? { opacity: [0, 1], scale: [0.92, 1] } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="mx-auto mt-7 h-px w-32 bg-gradient-to-r from-transparent via-[#f3d39d] to-transparent"
          />
          {!accepted && (
            <button
              type="button"
              onClick={() => setAccepted(true)}
              className="mt-8 inline-flex min-h-[3.25rem] w-full max-w-full items-center justify-center gap-3 whitespace-normal rounded-full border border-[#f3d39d]/36 bg-[#f3d39d]/12 px-6 py-3.5 text-center text-[12px] font-semibold uppercase tracking-[0.08em] text-[#fff9ec] shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#f3d39d]/70 hover:bg-[#f3d39d]/20 active:translate-y-0 sm:w-auto md:tracking-[0.2em]"
            >
              {giftTrip.final.cta}
            </button>
          )}
          {accepted && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: 'easeOut' }}
              className="mx-auto mt-7 max-w-md text-[15px] leading-7 text-[#fff9ec]/78 md:text-sm"
            >
              11 settembre 2026. Partiamo di sera, arriviamo con la città già accesa.
            </motion.p>
          )}
        </motion.div>
      </section>
    </main>
  );
}
