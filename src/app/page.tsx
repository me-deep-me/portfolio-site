'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ParticleColumn } from '@/components/canvas/ParticleColumn';
import { ProjectCard }    from '@/components/overlay/ProjectCard';
import { useIsMobile }    from '@/hooks/useMediaQuery';
import { MobileLayout }   from '@/components/mobile/MobileLayout';
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
  const isMobile  = useIsMobile();
  const scrollRef = useRef<HTMLElement>(null);
  const progress  = useScrollProgress(scrollRef);
  const year      = useMemo(() => new Date().getFullYear(), []);

  if (isMobile) {
    return <MobileLayout />;
  }

  return (
    <main className="min-h-screen bg-white text-neutral-950 selection:bg-neutral-950 selection:text-white">
      <ParticleColumn progress={progress} />

      {/* ── Nav ── */}
      <nav className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-5 py-5 text-xs uppercase tracking-[0.24em] text-neutral-600 md:px-9">
        <a href="#top" className="transition hover:text-neutral-950">
          mattia erigoni
        </a>
        <div className="hidden items-center gap-6 md:flex">
          <a href="#about"    className="transition hover:text-neutral-950">About</a>
          <a href="#projects" className="transition hover:text-neutral-950">Projects</a>
          <a href="#contact"  className="transition hover:text-neutral-950">Contact</a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="top" className="relative z-10 flex min-h-screen items-center justify-center px-5 text-center">
        <div className="mx-auto max-w-4xl pt-20">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="mb-6 text-xs uppercase tracking-[0.38em] text-neutral-500"
          >
            Management Engineer · Digital Builder · AI
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: 'easeOut' }}
            className="text-5xl font-semibold tracking-[-0.055em] text-neutral-950 md:text-7xl lg:text-8xl"
          >
            Building tools where process meets intelligence.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: 'easeOut' }}
            className="mx-auto mt-8 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg"
          >
            I turn industrial complexity into software that works. From combinatorial
            optimization to AI-assisted pipelines — I build tools that make hard
            operational problems disappear.
          </motion.p>
        </div>
      </section>

      {/* ── Pinned projects section ── */}
      <section
        id="projects"
        ref={scrollRef}
        className="relative z-10 h-[760vh]"
      >
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-5">
          {/* Subtle central spine line */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-[78vh] w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-neutral-950/10 to-transparent" />

          {/* Section label top-center */}
          <div className="absolute left-1/2 top-[14vh] z-20 hidden -translate-x-1/2 text-center md:block">
            <p className="text-xs uppercase tracking-[0.34em] text-neutral-500">
              Selected work
            </p>
          </div>

          {/* Cards */}
          <div className="hidden md:block">
            {PROJECTS.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                total={PROJECTS.length}
                progress={progress}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="relative z-20 mx-auto flex min-h-screen max-w-5xl items-center px-5 py-24">
        <div className="grid gap-12 md:grid-cols-[0.75fr_1.25fr] md:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-neutral-500">about</p>
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-neutral-950 md:text-5xl">
              Engineer who ships.
            </h2>
            <p className="mt-8 text-lg leading-8 text-neutral-600">
              I&apos;m a Management Engineer with a strong lean toward{' '}
              <span className="text-neutral-950 font-medium">process digitalization, operations research and AI</span>.
              My work sits at the intersection of industrial logic and software craft — I analyse how things actually
              work, find where the friction is, and build tools that remove it.
            </p>
            <p className="mt-5 text-lg leading-8 text-neutral-600">
              Over the past year I independently designed and deployed a full suite of industrial applications
              in a real healthcare infrastructure company — solving NP-hard optimization problems, automating
              logistics planning, structuring a 85,000-record database, and experimenting with local LLM and
              RAG architectures.
            </p>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {['Process Automation', 'Operations Research', 'AI Workflows'].map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-neutral-100 bg-white/70 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.045)]"
                >
                  <p className="text-sm font-medium text-neutral-950">{item}</p>
                </div>
              ))}
            </div>

            {/* Skill chips */}
            <div className="mt-8 flex flex-wrap gap-2">
              {[
                'Python', 'Operations Research', 'FastAPI', 'Excel · VBA', 'HTML · CSS · JS',
                '2D/3D Bin Packing', 'LLM · RAG', 'Data Quality', 'BIM · Revit',
                'Process Design', 'Lean Digital Engineering', 'Prompt Engineering',
              ].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-neutral-200 bg-white/60 px-3 py-1 text-[11px] uppercase tracking-wide text-neutral-600"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="relative z-20 flex min-h-[70vh] items-center justify-center px-5 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.34em] text-neutral-500">contact</p>
          <h2 className="mt-6 text-4xl font-semibold tracking-[-0.045em] text-neutral-950 md:text-6xl lg:text-7xl">
            Let&apos;s build the next system.
          </h2>
          <a
            href="mailto:mattiaerigoni99@gmail.com"
            className="mt-10 inline-flex rounded-full border border-neutral-950 bg-neutral-950 px-7 py-4 text-sm font-medium text-white transition hover:bg-white hover:text-neutral-950"
          >
            mattiaerigoni99@gmail.com
          </a>
          <div className="mt-8 flex justify-center gap-6 text-xs uppercase tracking-[0.22em] text-neutral-500">
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
      <footer className="relative z-20 flex items-center justify-between px-5 py-8 text-xs text-neutral-400 md:px-9">
        <span>© {year} Mattia Erigoni</span>
        <span>Management Engineer · Digital Builder</span>
      </footer>
    </main>
  );
}
