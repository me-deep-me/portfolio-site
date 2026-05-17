'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ParticleColumn } from '@/components/canvas/ParticleColumn';
import { ProjectCard }    from '@/components/overlay/ProjectCard';
import { ProjectModal }   from '@/components/overlay/ProjectModal';
import { PROJECTS }       from '@/data/projects';

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      if (!ref.current) return;
      const rect       = ref.current.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const next       = clamp(-rect.top / Math.max(scrollable, 1));
      setProgress(next);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ref]);
  return progress;
}

export default function Home() {
  const scrollRef = useRef<HTMLElement>(null);
  const progress  = useScrollProgress(scrollRef);
  const year      = useMemo(() => new Date().getFullYear(), []);

  /* Modal state lives at the root */
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-white text-neutral-950 selection:bg-neutral-950 selection:text-white">
      <ParticleColumn progress={progress} />

      {/* ── Nav ── */}
      <nav className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-4 py-4 text-[11px] uppercase tracking-[0.22em] text-neutral-600 sm:px-6 md:px-9 md:py-5">
        <a href="#top" className="transition hover:text-neutral-950">mattia erigoni</a>
        <div className="hidden items-center gap-6 md:flex">
          <a href="#about"    className="transition hover:text-neutral-950">About</a>
          <a href="#projects" className="transition hover:text-neutral-950">Projects</a>
          <a href="#contact"  className="transition hover:text-neutral-950">Contact</a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        id="top"
        className="relative z-10 flex min-h-screen items-center justify-center px-5 text-center"
      >
        <div className="mx-auto max-w-4xl pt-20">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="mb-5 text-[10px] uppercase tracking-[0.36em] text-neutral-500 sm:text-xs sm:tracking-[0.38em]"
          >
            Management Engineer · Digital Builder · AI
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: 'easeOut' }}
            className="text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-neutral-950 sm:text-5xl sm:tracking-[-0.05em] md:text-7xl md:tracking-[-0.055em] lg:text-8xl"
          >
            Building tools where process meets intelligence.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: 'easeOut' }}
            className="mx-auto mt-7 max-w-xl text-pretty text-[15px] leading-relaxed text-neutral-600 md:mt-8 md:max-w-2xl md:text-lg md:leading-7"
          >
            I turn industrial complexity into software that works. From combinatorial
            optimization to AI-assisted pipelines — I build tools that make hard
            operational problems disappear.
          </motion.p>
        </div>
      </section>

      {/* ── DESKTOP: pinned projects section ── */}
      <section
        id="projects"
        ref={scrollRef}
        className="relative z-10 hidden md:block md:h-[760vh]"
      >
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-5">
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-[78vh] w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-neutral-950/10 to-transparent" />
          <div className="absolute left-1/2 top-[14vh] z-20 -translate-x-1/2 text-center">
            <p className="text-xs uppercase tracking-[0.34em] text-neutral-500">Selected work</p>
          </div>
          <div>
            {PROJECTS.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                total={PROJECTS.length}
                progress={progress}
                onOpen={() => setOpenId(project.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── MOBILE: stacked project list ── */}
      <section id="projects-mobile" className="relative z-10 mx-auto max-w-md px-5 pb-12 pt-8 md:hidden">
        <p className="mb-6 text-center text-[10px] uppercase tracking-[0.34em] text-neutral-500">Selected work</p>
        <div className="grid gap-3">
          {PROJECTS.map((project) => (
            <button
              key={project.id}
              onClick={() => setOpenId(project.id)}
              className="block w-full rounded-2xl border border-white/80 bg-white/70 px-5 py-4 text-left shadow-[0_18px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl transition active:scale-[0.99]"
            >
              <div className="mb-2.5 flex items-center gap-3">
                <span className="font-mono text-[11px] tracking-[0.28em] text-neutral-500">
                  {project.number}
                </span>
                <span className="h-px flex-1 bg-neutral-200" />
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400">
                  {project.cat.split(' · ')[0]}
                </span>
              </div>
              <h3 className="text-balance text-base font-medium tracking-tight text-neutral-950">
                {project.title}
              </h3>
              <p className="mt-1.5 text-pretty text-[12.5px] leading-snug text-neutral-600 line-clamp-2">
                {project.shortDesc}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.pills.slice(0, 3).map((pill) => (
                  <span
                    key={pill.label}
                    className={`rounded-full border px-2.5 py-0.5 text-[9px] tracking-wide uppercase ${
                      pill.hi
                        ? 'border-neutral-900/20 bg-neutral-900/5 text-neutral-900'
                        : 'border-neutral-200 bg-white/70 text-neutral-700'
                    }`}
                  >
                    {pill.label}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section
        id="about"
        className="relative z-20 mx-auto flex min-h-screen max-w-5xl items-center px-5 py-20 md:py-24"
      >
        <div className="grid w-full gap-8 md:grid-cols-[0.75fr_1.25fr] md:items-start md:gap-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-neutral-500">about</p>
          </div>
          <div>
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.035em] text-neutral-950 md:text-5xl md:tracking-[-0.04em]">
              Engineer who ships.
            </h2>
            <p className="mt-6 text-pretty text-[15px] leading-relaxed text-neutral-600 md:mt-8 md:text-lg md:leading-8">
              I&apos;m a Management Engineer with a strong lean toward{' '}
              <span className="font-medium text-neutral-950">
                process digitalization, operations research and AI
              </span>
              . My work sits at the intersection of industrial logic and software craft — I analyse how
              things actually work, find where the friction is, and build tools that remove it.
            </p>
            <p className="mt-4 text-pretty text-[15px] leading-relaxed text-neutral-600 md:mt-5 md:text-lg md:leading-8">
              Over the past year I independently designed and deployed a full suite of industrial
              applications in a real healthcare infrastructure company — solving NP-hard optimization
              problems, automating logistics planning, structuring a 85,000-record database, and
              experimenting with local LLM and RAG architectures.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 md:mt-10">
              {['Process Automation', 'Operations Research', 'AI Workflows'].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-neutral-100 bg-white/70 p-4 text-center shadow-[0_18px_60px_rgba(0,0,0,0.045)] md:p-5 md:text-left"
                >
                  <p className="text-sm font-medium text-neutral-950">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-1.5 md:mt-8 md:gap-2">
              {[
                'Python', 'Operations Research', 'FastAPI', 'Excel · VBA', 'HTML · CSS · JS',
                '2D/3D Bin Packing', 'LLM · RAG', 'Data Quality', 'BIM · Revit',
                'Process Design', 'Lean Digital Engineering', 'Prompt Engineering',
              ].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-neutral-200 bg-white/60 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-neutral-600 md:px-3 md:py-1 md:text-[11px]"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section
        id="contact"
        className="relative z-20 flex min-h-[70vh] items-center justify-center px-5 py-20 text-center md:py-24"
      >
        <div className="mx-auto max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.34em] text-neutral-500">contact</p>
          <h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.04em] text-neutral-950 md:mt-6 md:text-6xl md:tracking-[-0.045em] lg:text-7xl">
            Let&apos;s build the next system.
          </h2>
          <a
            href="mailto:mattiaerigoni99@gmail.com"
            className="mt-8 inline-flex rounded-full border border-neutral-950 bg-neutral-950 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white hover:text-neutral-950 md:mt-10 md:px-7 md:py-4"
          >
            mattiaerigoni99@gmail.com
          </a>
          <div className="mt-7 flex justify-center gap-5 text-[10px] uppercase tracking-[0.22em] text-neutral-500 md:mt-8 md:gap-6 md:text-xs">
            <a href="https://linkedin.com/in/mattia-erigoni" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-950">
              LinkedIn ↗
            </a>
            <a href="https://github.com/mattia-erigoni" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-950">
              GitHub ↗
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-20 flex flex-col items-center justify-between gap-2 px-5 py-7 text-[10px] text-neutral-400 sm:flex-row sm:px-6 md:px-9 md:text-xs">
        <span>© {year} Mattia Erigoni</span>
        <span>Management Engineer · Digital Builder</span>
      </footer>

      {/* ── Project modal ── */}
      <ProjectModal openId={openId} onClose={() => setOpenId(null)} />
    </main>
  );
}
