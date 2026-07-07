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
  const [revealed, setRevealed] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const galleryImages = useMemo(
    () => giftTrip.galleryImageIds.map((id) => imageById(id)),
    []
  );

  const scrollToPlan = () => {
    document.getElementById('piano')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToPause = () => {
    document.getElementById('pausa')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openReveal = () => {
    setRevealed(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById('rivelazione')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f6efe3] text-[#17231f] selection:bg-[#1f3c52] selection:text-[#fff9ec]">
      <section className="relative flex h-[100svh] min-h-[720px] items-end overflow-hidden px-4 pb-7 pt-24 text-[#fff9ec] sm:px-8 md:px-10 md:pb-12">
        <div className="absolute inset-0">
          <CinematicImage image={imageById(giftTrip.intro.imageId)} priority />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,20,31,0.34),rgba(8,20,31,0.2)_30%,rgba(8,20,31,0.86)_100%)]" />
        <div className="absolute inset-0 opacity-[0.13] [background-image:radial-gradient(rgba(255,255,255,0.72)_0.7px,transparent_0.7px)] [background-size:3px_3px]" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mx-auto flex w-full max-w-6xl min-w-0 flex-col items-start"
        >
          <h1 className="w-full max-w-[9.8ch] break-words font-display text-[clamp(3.25rem,14.6vw,3.95rem)] leading-[0.94] tracking-[-0.015em] text-[#fffdf4] text-balance [text-shadow:0_4px_26px_rgba(0,0,0,0.62)] sm:text-6xl md:max-w-[12ch] md:text-8xl md:tracking-[-0.035em]">
            {giftTrip.intro.title}
          </h1>
          <p className="mt-5 max-w-[17rem] text-[18px] leading-8 text-[#fff9ec]/88 [text-shadow:0_2px_14px_rgba(0,0,0,0.52)] md:max-w-md md:text-xl">
            {giftTrip.intro.subtitle}
          </p>
          <button
            type="button"
            onClick={openReveal}
            className="mt-8 inline-flex min-h-[3.25rem] w-full max-w-full items-center justify-center rounded-full border border-[#fff9ec]/30 bg-[#fff9ec]/14 px-6 py-3.5 text-center text-[12px] font-semibold uppercase tracking-[0.14em] text-[#fff9ec] shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#fff9ec]/54 hover:bg-[#fff9ec]/22 active:translate-y-0 sm:w-auto"
          >
            {giftTrip.intro.cta}
          </button>
        </motion.div>
      </section>

      {revealed && (
        <motion.section
          id="rivelazione"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex h-[100svh] min-h-[720px] scroll-mt-0 items-end overflow-hidden px-4 pb-7 pt-24 text-[#fff9ec] sm:px-8 md:px-10 md:pb-12"
        >
          <div className="absolute inset-0">
            <motion.div
              initial={{ scale: 1.035 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <CinematicImage image={imageById(giftTrip.reveal.imageId)} />
            </motion.div>
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,20,31,0.2),rgba(8,20,31,0.34)_36%,rgba(8,20,31,0.9)_100%)]" />
          <div className="absolute inset-0 opacity-[0.11] [background-image:radial-gradient(rgba(255,255,255,0.72)_0.7px,transparent_0.7px)] [background-size:3px_3px]" />

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 mx-auto flex w-full max-w-6xl min-w-0 flex-col items-start"
          >
            <div className="max-w-2xl">
              <p className="font-display text-[clamp(2rem,8.8vw,2.65rem)] leading-[1.04] tracking-[-0.01em] text-[#fffdf4] text-balance [text-shadow:0_4px_24px_rgba(0,0,0,0.62)] md:text-6xl md:leading-[1.02]">
                {giftTrip.reveal.lineOne}
                <br />
                {giftTrip.reveal.lineTwo}
              </p>
              <p className="mt-5 max-w-md text-[16px] leading-8 text-[#fff9ec]/86 [text-shadow:0_2px_14px_rgba(0,0,0,0.52)] md:text-lg">
                {giftTrip.reveal.body}
              </p>
            </div>
            <div className="mt-9 w-full border-t border-[#fff9ec]/24 pt-6">
              <p className="font-display text-[clamp(3.05rem,15vw,3.7rem)] leading-[0.92] tracking-[-0.012em] text-[#fffdf4] [text-shadow:0_4px_28px_rgba(0,0,0,0.64)] sm:text-8xl md:text-[9rem] md:tracking-[-0.04em]">
                {giftTrip.destination}
              </p>
              <p className="mt-4 break-words font-display text-[1.45rem] italic leading-tight text-[#f3d39d] [text-shadow:0_2px_18px_rgba(0,0,0,0.48)] md:text-3xl">
                {giftTrip.reveal.subtitle}
              </p>
              <button
                type="button"
                onClick={scrollToPause}
                className="mt-8 inline-flex min-h-[3.25rem] w-full max-w-full items-center justify-center rounded-full border border-[#fff9ec]/30 bg-[#fff9ec]/14 px-6 py-3.5 text-center text-[12px] font-semibold uppercase tracking-[0.1em] text-[#fff9ec] shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#fff9ec]/54 hover:bg-[#fff9ec]/22 active:translate-y-0 sm:w-auto"
              >
                {giftTrip.reveal.cta}
              </button>
            </div>
          </motion.div>
        </motion.section>
      )}

      {revealed && (
        <section id="pausa" className="scroll-mt-0 px-4 py-16 sm:px-8 md:py-24">
          <div className="mx-auto grid w-full min-w-0 max-w-6xl gap-8 md:grid-cols-[0.82fr_1.18fr] md:items-center">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="min-w-0"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7f765e] md:tracking-[0.34em]">
                {giftTrip.pause.eyebrow}
              </p>
              <h2 className="mt-4 max-w-full break-words font-display text-[clamp(2.45rem,11vw,3.15rem)] leading-[1] tracking-[-0.012em] text-[#243229] md:text-6xl md:tracking-[-0.03em]">
                {giftTrip.pause.title}
              </h2>
              <p className="mt-5 max-w-md text-[17px] leading-8 text-[#586054]">
                {giftTrip.pause.body}
              </p>
              <button
                type="button"
                onClick={scrollToPlan}
                className="mt-8 inline-flex min-h-[3.25rem] w-full max-w-full items-center justify-center rounded-full border border-[#1f3c52]/18 bg-[#1f3c52] px-6 py-3.5 text-center text-[12px] font-semibold uppercase tracking-[0.1em] text-[#fff9ec] shadow-[0_20px_70px_rgba(31,60,82,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#172f43] active:translate-y-0 sm:w-auto"
              >
                {giftTrip.pause.cta}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28, rotate: -1.2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full min-w-0 rounded-[0.5rem] border border-[#1f3c52]/12 bg-[#fff9ec] p-4 shadow-[0_28px_90px_rgba(58,47,32,0.14)] sm:p-5"
            >
              <div className="absolute inset-x-4 top-4 h-px bg-gradient-to-r from-transparent via-[#d8c9ae] to-transparent" />
              <div className="flex min-w-0 items-start justify-between gap-4 pt-3">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8f7b54]">
                    {giftTrip.boardingPass.label}
                  </p>
                  <p className="mt-2 break-words font-display text-[2rem] leading-none tracking-[-0.02em] text-[#20302a] sm:text-5xl">
                    {giftTrip.boardingPass.code}
                  </p>
                </div>
                <div className="shrink-0 text-[#1f3c52]">
                  <TravelMark />
                </div>
              </div>

              <div className="mt-7 grid min-w-0 grid-cols-[1fr_auto_1fr] items-end gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9c8b68]">Da</p>
                  <p className="mt-2 break-words font-display text-[1.75rem] leading-none text-[#20302a]">
                    {giftTrip.boardingPass.from}
                  </p>
                </div>
                <div className="mb-2 h-px w-8 bg-[#1f3c52]/30 sm:w-14" />
                <div className="min-w-0 text-right">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9c8b68]">A</p>
                  <p className="mt-2 break-words font-display text-[1.75rem] leading-none text-[#20302a]">
                    {giftTrip.boardingPass.to}
                  </p>
                </div>
              </div>

              <div className="my-6 border-t border-dashed border-[#1f3c52]/20" />

              <dl className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-5 text-[#4f574c]">
                <div className="min-w-0">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9c8b68]">
                    Passeggeri
                  </dt>
                  <dd className="mt-1 break-words text-[15px] leading-6">{giftTrip.boardingPass.passenger}</dd>
                </div>
                <div className="min-w-0 text-right">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9c8b68]">
                    Data
                  </dt>
                  <dd className="mt-1 break-words text-[15px] leading-6">{giftTrip.boardingPass.date}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9c8b68]">
                    Andata
                  </dt>
                  <dd className="mt-1 break-words text-[15px] leading-6">{giftTrip.boardingPass.outbound}</dd>
                </div>
                <div className="min-w-0 text-right">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9c8b68]">
                    Ritorno
                  </dt>
                  <dd className="mt-1 break-words text-[15px] leading-6">{giftTrip.boardingPass.return}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9c8b68]">
                    Posto
                  </dt>
                  <dd className="mt-1 break-words text-[15px] leading-6">{giftTrip.boardingPass.seat}</dd>
                </div>
                <div className="min-w-0 text-right">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9c8b68]">
                    Gate
                  </dt>
                  <dd className="mt-1 break-words text-[15px] leading-6">{giftTrip.boardingPass.gate}</dd>
                </div>
              </dl>
            </motion.div>
          </div>
        </section>
      )}

      <section id="piano" className="scroll-mt-8 px-4 py-16 sm:px-8 md:py-24">
        <div className="mx-auto w-full min-w-0 max-w-6xl">
          <div className="mb-9 max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7f765e] md:tracking-[0.34em]">
              Il piano
            </p>
            <h2 className="mt-4 max-w-full break-words font-display text-[clamp(2.35rem,10.4vw,3rem)] leading-[1] tracking-[-0.01em] text-[#243229] md:text-6xl md:tracking-[-0.025em]">
              {giftTrip.planTitle}
            </h2>
          </div>

          <div className="grid w-full min-w-0 gap-3 md:grid-cols-4">
            {tripPlan.map((item, index) => (
              <motion.article
                key={item.day}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.22 }}
                transition={{ duration: 0.62, delay: index * 0.05, ease: 'easeOut' }}
                className="group w-full max-w-full min-w-0 rounded-[0.5rem] border border-[#1f3c52]/10 bg-[#fff9ec]/74 p-5 shadow-[0_18px_70px_rgba(58,47,32,0.06)] md:min-h-[19rem] md:p-6"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8f7b54] md:tracking-[0.28em]">
                  0{index + 1}
                </p>
                <h3 className="mt-5 font-display text-[2.15rem] leading-none tracking-[-0.02em] text-[#20302a]">
                  {item.day}
                </h3>
                <p className="mt-5 whitespace-pre-line text-[16px] leading-7 text-[#4f574c]">{item.body}</p>
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
                image={galleryImages[0]}
                className="aspect-[4/5] rounded-[0.5rem] md:aspect-[16/11]"
                sizes="(min-width: 768px) 56vw, 100vw"
              />
              <figcaption className="mt-4 text-[14px] leading-7 text-[#6c6656] md:text-xs md:leading-6">
                {galleryImages[0].caption}
              </figcaption>
            </motion.figure>
            <div className="grid w-full min-w-0 gap-4">
              {galleryImages.slice(1).map((image, index) => (
                <motion.figure
                  key={image.id}
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
        </div>
      </section>

      <section className="relative flex h-[82svh] min-h-[600px] items-center justify-center overflow-hidden px-4 py-20 text-center text-[#fff9ec] sm:px-8">
        <div className="absolute inset-0 bg-[#07111f]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(31,60,82,0.68),rgba(7,17,31,0.92)_55%,rgba(7,17,31,1))]" />
        <div className="absolute inset-0 opacity-[0.11] [background-image:radial-gradient(rgba(255,255,255,0.7)_0.7px,transparent_0.7px)] [background-size:3px_3px]" />
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
          <h2 className="max-w-full break-words font-display text-[clamp(2.35rem,10.4vw,3rem)] leading-[1.04] tracking-[-0.012em] text-balance sm:text-6xl md:text-7xl md:tracking-[-0.035em]">
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
        </motion.div>
      </section>
    </main>
  );
}
