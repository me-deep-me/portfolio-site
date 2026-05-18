'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ParticleColumn }  from '@/components/canvas/ParticleColumn';
import { ProjectCard }     from '@/components/overlay/ProjectCard';
import { ProjectModal }    from '@/components/overlay/ProjectModal';
import { ProjectActions }  from '@/components/overlay/ProjectActions';
import { PROJECTS }        from '@/data/projects';

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);
  const [projectsActive, setProjectsActive] = useState(false);
  const targetProgressRef = useRef(0);
  const visualProgressRef = useRef(0);

  useEffect(() => {
    let raf = 0;

    const measure = () => {
      if (!ref.current) return;
      const rect       = ref.current.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const next       = clamp(-rect.top / Math.max(scrollable, 1));
      const active     = rect.top < window.innerHeight * 0.82 && rect.bottom > window.innerHeight * 0.18;

      targetProgressRef.current = next;
      setProjectsActive(active);
    };

    const tick = () => {
      const current = visualProgressRef.current;
      const target  = targetProgressRef.current;
      const next    = Math.abs(target - current) < 0.0008
        ? target
        : current + (target - current) * 0.16;

      if (Math.abs(next - current) > 0.0001) {
        visualProgressRef.current = next;
        setProgress(next);
      }

      raf = window.requestAnimationFrame(tick);
    };

    measure();
    tick();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [ref]);

  return { progress, projectsActive };
}

const IMPACT_METRICS = [
  {
    value: '40-70%',
    title: 'manual planning effort cut',
    detail: 'Estimated range across scheduling and logistics workflows.',
  },
  {
    value: '85k+',
    title: 'contacts cleaned and governed',
    detail: 'CRM records structured, deduplicated and made operational.',
  },
  {
    value: '2-5x',
    title: 'faster recurring reports',
    detail: 'Raw exports turned into repeatable analysis-ready outputs.',
  },
  {
    value: '0',
    title: 'external AI data exposure',
    detail: 'Local retrieval tests designed around controlled documents.',
  },
];

const METHOD_STEPS = [
  {
    value: 'process',
    label: 'map the constraint',
    detail: 'Find the real operating rule behind the messy exception.',
  },
  {
    value: 'model',
    label: 'formalise the logic',
    detail: 'Turn tacit decisions into data structures and repeatable rules.',
  },
  {
    value: 'tool',
    label: 'ship the interface',
    detail: 'Make the workflow usable where the decision actually happens.',
  },
  {
    value: 'iterate',
    label: 'tighten in use',
    detail: 'Measure friction, adjust the model and keep the system alive.',
  },
];

const TOOLKIT_GROUPS = [
  { title: 'Build', items: ['Python', 'FastAPI', 'HTML · CSS · JS'] },
  { title: 'Optimize', items: ['Operations Research', '2D/3D Bin Packing', 'Excel · VBA'] },
  { title: 'Data + AI', items: ['LLM · RAG', 'Data Quality', 'Prompt Engineering'] },
  { title: 'Operations', items: ['BIM · Revit', 'Process Design', 'Lean Digital Engineering'] },
];

export default function Home() {
  const scrollRef = useRef<HTMLElement>(null);
  const { progress, projectsActive } = useScrollProgress(scrollRef);
  const year = useMemo(() => new Date().getFullYear(), []);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-white text-neutral-950 selection:bg-neutral-950 selection:text-white">
      <ParticleColumn progress={progress} projectsActive={projectsActive} />

      {/* ── Nav ── */}
      <nav className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-4 py-4 text-[11px] uppercase tracking-[0.22em] text-neutral-600 sm:px-6 md:px-9 md:py-5">
        <a
          href="#top"
          aria-label="Mattia Erigoni homepage"
          className="group inline-flex items-center gap-3 transition hover:text-neutral-950"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-950/15 bg-white/75 text-[10px] font-semibold tracking-[-0.02em] text-neutral-950 shadow-[0_10px_35px_rgba(0,0,0,0.05)] backdrop-blur-xl transition group-hover:border-neutral-950/35">
            ME
          </span>
          <span className="hidden leading-none sm:block">
            <span className="block text-[12px] font-semibold tracking-[0.28em] text-neutral-950">
              MATTIA ERIGONI
            </span>
            <span className="mt-1 block text-[8px] font-medium tracking-[0.34em] text-neutral-400">
              DIGITAL BUILDER
            </span>
          </span>
        </a>

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
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center pt-20">
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
            className="mx-auto max-w-[15ch] text-balance text-center text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-neutral-950 sm:text-5xl sm:tracking-[-0.05em] md:text-7xl md:tracking-[-0.055em] lg:text-8xl xl:text-[8.6rem]"
          >
            Building tools where process meets intelligence.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: 'easeOut' }}
            className="mx-auto mt-7 max-w-[760px] text-balance text-center text-[15px] leading-relaxed text-neutral-600 md:mt-8 md:text-xl md:leading-9"
          >
            I turn industrial complexity into software that works. From combinatorial optimization to AI-assisted
            pipelines — I build tools that make hard operational problems disappear.
          </motion.p>
        </div>
      </section>

      {/* ── Projects (pinned, md+) ── */}
      <section
        id="projects"
        ref={scrollRef}
        className="relative z-10 hidden md:block md:h-[820vh]"
      >
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-5">
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-[78vh] w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-neutral-950/10 to-transparent" />
          <div className="absolute left-1/2 top-[7vh] z-30 -translate-x-1/2 text-center">
            <p className="rounded-full bg-white/80 px-4 py-1.5 text-[10px] uppercase tracking-[0.32em] text-neutral-600 backdrop-blur-md ring-1 ring-black/[0.04]">
              Selected work
            </p>
          </div>
          <div className="relative h-screen w-full max-w-7xl">
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

      {/* ── Projects (mobile stacked) ── */}
      <section id="projects-mobile" className="relative z-10 mx-auto max-w-lg px-5 pb-12 pt-8 md:hidden">
        <p className="mb-6 text-center text-[10px] uppercase tracking-[0.34em] text-neutral-500">Selected work</p>
        <div className="grid gap-4">
          {PROJECTS.map((project, index) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 34, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: Math.min(index * 0.035, 0.18), ease: [0.16, 1, 0.3, 1] }}
              className="block w-full rounded-[1.75rem] border border-white/80 bg-white/75 px-6 py-5 text-left shadow-[0_22px_70px_rgba(0,0,0,0.07)] backdrop-blur-xl transition active:scale-[0.99]"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-[11px] tracking-[0.28em] text-neutral-500">{project.number}</span>
                <span className="h-px flex-1 bg-neutral-200" />
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400">
                  {project.cat.split(' · ')[0]}
                </span>
              </div>
              <h3 className="text-balance text-lg font-medium tracking-tight text-neutral-950">{project.title}</h3>
              <p className="mt-2.5 text-pretty text-[13px] leading-relaxed text-neutral-600">{project.shortDesc}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.pills.slice(0, 4).map((pill) => (
                  <span
                    key={pill.label}
                    className={`rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-wide ${
                      pill.hi
                        ? 'border-neutral-900/20 bg-neutral-900/5 text-neutral-900'
                        : 'border-neutral-200 bg-white/70 text-neutral-700'
                    }`}
                  >
                    {pill.label}
                  </span>
                ))}
              </div>
              <ProjectActions project={project} onOpen={() => setOpenId(project.id)} compact />
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section
        id="about"
        className="relative z-20 scroll-mt-24 px-5 py-28 md:py-36"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mx-auto w-full max-w-6xl"
        >
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-end md:gap-12">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-neutral-500">about</p>
              <h2 className="mt-5 max-w-[11ch] text-balance text-4xl font-semibold leading-[0.96] tracking-[-0.045em] text-neutral-950 sm:text-5xl lg:text-[4.6rem]">
                Systems for messy operations.
              </h2>
            </div>

            <div className="border-l border-neutral-950/12 pl-5 text-left md:pl-8">
              <p className="max-w-2xl text-pretty text-[16px] leading-8 text-neutral-700 md:text-lg md:leading-9">
                I work across operations, data, suppliers, customers and AI: the useful middle layer where messy
                constraints become faster decisions and cleaner execution.
              </p>
              <p className="mt-5 max-w-2xl text-pretty text-[14px] leading-7 text-neutral-500 md:text-base md:leading-8">
                Management engineering gives the method; software gives the leverage. I map how work really happens,
                remove manual friction and ship tools that people can trust when time, cost and coordination matter.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-[0.92fr_1.08fr] lg:gap-5">
            <div className="rounded-[1.25rem] border border-neutral-950/10 bg-neutral-950 p-6 text-white shadow-[0_30px_100px_rgba(15,23,42,0.16)] md:p-7">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/45">operational thesis</p>
                  <p className="mt-5 max-w-md text-pretty text-xl font-semibold leading-tight tracking-[-0.035em] md:text-2xl">
                    Make operational work measurable, repeatable and faster.
                  </p>
                </div>
                <span className="hidden rounded-full border border-white/12 bg-white/8 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 sm:inline-flex">
                  impact
                </span>
              </div>

              <div className="mt-7 grid gap-3 border-t border-white/12 pt-5 sm:grid-cols-2">
                {IMPACT_METRICS.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.055] p-4"
                  >
                    <p className="font-mono text-3xl font-semibold tracking-[-0.05em] text-white md:text-[2.35rem]">
                      {item.value}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold uppercase leading-snug tracking-[0.16em] text-white/80">
                      {item.title}
                    </p>
                    <p className="mt-2 text-[12px] leading-relaxed text-white/44">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              {[
                { k: '01', t: 'Process clarity', d: 'I turn tacit know-how, exceptions and handoffs into explicit operating logic.' },
                { k: '02', t: 'Decision speed', d: 'I compress planning, logistics and reporting into outputs people can act on quickly.' },
                { k: '03', t: 'AI leverage', d: 'I use AI as a controlled amplifier for analysis, documentation, code and knowledge retrieval.' },
              ].map((item) => (
                <div
                  key={item.k}
                  className="grid gap-4 rounded-[1.15rem] border border-neutral-200/80 bg-white/85 p-4 text-left shadow-[0_18px_65px_rgba(0,0,0,0.045)] backdrop-blur-xl transition hover:border-neutral-950/20 hover:shadow-[0_24px_80px_rgba(0,0,0,0.07)] sm:grid-cols-[62px_1fr] sm:items-start md:p-5"
                >
                  <div className="flex items-center gap-3 sm:block">
                    <span className="font-mono text-[11px] tracking-[0.26em] text-neutral-400">{item.k}</span>
                    <span className="h-px flex-1 bg-neutral-200 sm:mt-4 sm:block sm:w-10" />
                  </div>
                  <div>
                    <p className="text-base font-semibold tracking-[-0.035em] text-neutral-950 md:text-lg">{item.t}</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500 md:text-sm">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-[1.25rem] border border-neutral-200/85 bg-white/78 p-4 text-left shadow-[0_18px_70px_rgba(0,0,0,0.04)] backdrop-blur-xl md:p-5 lg:p-6">
            <div className="grid gap-7 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
              <div>
                <div className="flex items-center justify-between gap-4 border-b border-neutral-200/90 pb-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-neutral-400">
                    operating loop
                  </p>
                  <span className="hidden h-px flex-1 bg-neutral-200 sm:block" />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  {METHOD_STEPS.map((item, index) => (
                    <div
                      key={item.label}
                      className="group relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-4 transition hover:-translate-y-0.5 hover:border-neutral-950/20 hover:bg-white hover:shadow-[0_18px_45px_rgba(0,0,0,0.06)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-[10px] text-neutral-400">
                          0{index + 1}
                        </span>
                        <span className="h-px flex-1 bg-neutral-200 transition group-hover:bg-neutral-950/20" />
                      </div>
                      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">
                        {item.value}
                      </p>
                      <p className="mt-1 text-[13px] font-medium leading-relaxed text-neutral-600">
                        {item.label}
                      </p>
                      <p className="mt-3 text-[12px] leading-relaxed text-neutral-500">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-950/10 bg-neutral-950/[0.025] p-4 md:p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-neutral-400">
                    toolkit
                  </p>
                  <span className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-neutral-500">
                    applied stack
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {TOOLKIT_GROUPS.map((group) => (
                    <div key={group.title} className="border-t border-neutral-200/90 pt-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-950">
                        {group.title}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {group.items.map((chip) => (
                          <span
                            key={chip}
                            className="rounded-full border border-neutral-200 bg-white/82 px-2.5 py-1 text-[10px] uppercase tracking-wide text-neutral-600 shadow-[0_8px_24px_rgba(0,0,0,0.035)]"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
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
            <a href="https://www.linkedin.com/in/mattia-erigoni-b87614183/" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-950">
              LinkedIn ↗
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-20 flex flex-col items-center justify-between gap-2 px-5 py-7 text-[10px] text-neutral-400 sm:flex-row sm:px-6 md:px-9 md:text-xs">
        <span>© {year} Mattia Erigoni</span>
        <span>Management Engineer · Digital Builder</span>
      </footer>

      <ProjectModal openId={openId} onClose={() => setOpenId(null)} />
    </main>
  );
}
