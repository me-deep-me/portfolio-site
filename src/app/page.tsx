'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ParticleColumn }  from '@/components/canvas/ParticleColumn';
import { ProjectCard }     from '@/components/overlay/ProjectCard';
import { ProjectModal }    from '@/components/overlay/ProjectModal';
import { ProjectActions }  from '@/components/overlay/ProjectActions';
import { PROJECTS, type Project } from '@/data/projects';

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

const MOBILE_PROJECT_SKINS: Record<string, {
  glow: string;
  primary: string;
  secondary: string;
  label: string;
}> = {
  nest: {
    glow: 'bg-[radial-gradient(circle_at_18%_0%,rgba(163,230,53,0.22),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(34,211,238,0.18),transparent_30%)]',
    primary: 'bg-lime-200/82',
    secondary: 'bg-cyan-200/72',
    label: 'nesting board',
  },
  cargo: {
    glow: 'bg-[radial-gradient(circle_at_18%_0%,rgba(251,191,36,0.2),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(34,211,238,0.18),transparent_30%)]',
    primary: 'bg-amber-200/82',
    secondary: 'bg-cyan-200/72',
    label: 'freight model',
  },
  load: {
    glow: 'bg-[radial-gradient(circle_at_18%_0%,rgba(59,130,246,0.2),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(16,185,129,0.16),transparent_30%)]',
    primary: 'bg-sky-200/82',
    secondary: 'bg-emerald-200/68',
    label: 'load scan',
  },
  door: {
    glow: 'bg-[radial-gradient(circle_at_18%_0%,rgba(251,113,133,0.2),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(250,204,21,0.16),transparent_30%)]',
    primary: 'bg-rose-200/78',
    secondary: 'bg-amber-200/68',
    label: 'crate solver',
  },
  gantt: {
    glow: 'bg-[radial-gradient(circle_at_18%_0%,rgba(129,140,248,0.22),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(34,211,238,0.16),transparent_30%)]',
    primary: 'bg-indigo-200/78',
    secondary: 'bg-cyan-200/64',
    label: 'planning board',
  },
  db: {
    glow: 'bg-[radial-gradient(circle_at_18%_0%,rgba(45,212,191,0.2),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(59,130,246,0.16),transparent_30%)]',
    primary: 'bg-teal-200/78',
    secondary: 'bg-sky-200/64',
    label: 'governed data',
  },
  rag: {
    glow: 'bg-[radial-gradient(circle_at_18%_0%,rgba(168,85,247,0.2),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(14,165,233,0.16),transparent_30%)]',
    primary: 'bg-violet-200/76',
    secondary: 'bg-cyan-200/62',
    label: 'retrieval graph',
  },
  micro: {
    glow: 'bg-[radial-gradient(circle_at_18%_0%,rgba(251,146,60,0.19),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(34,197,94,0.15),transparent_30%)]',
    primary: 'bg-orange-200/76',
    secondary: 'bg-emerald-200/60',
    label: 'automation bench',
  },
};

function MobileVisualBody({
  id,
  skin,
}: {
  id: string;
  skin: (typeof MOBILE_PROJECT_SKINS)[string];
}) {
  if (id === 'nest') {
    return (
      <div className="relative h-16 rounded-[0.8rem] border border-white/10 bg-white/[0.04]">
        {[
          'left-[8%] top-[12%] h-[36%] w-[30%]',
          'left-[43%] top-[12%] h-[22%] w-[23%]',
          'left-[70%] top-[12%] h-[52%] w-[18%]',
          'left-[8%] top-[55%] h-[28%] w-[22%]',
          'left-[35%] top-[42%] h-[41%] w-[31%]',
          'left-[70%] top-[71%] h-[12%] w-[18%]',
        ].map((className, cell) => (
          <span
            key={className}
            className={`absolute rounded-[0.35rem] ${cell % 2 === 0 ? skin.primary : skin.secondary} ${className}`}
          />
        ))}
      </div>
    );
  }

  if (id === 'cargo') {
    return (
      <>
        <div className="grid h-14 grid-cols-6 grid-rows-3 gap-1.5">
          {Array.from({ length: 18 }, (_, cell) => (
            <span
              key={cell}
              className={`rounded-[0.35rem] ${
                cell % 5 === 0 ? skin.primary : cell % 3 === 0 ? skin.secondary : 'bg-white/14'
              } ${cell === 7 || cell === 16 ? 'opacity-35' : ''}`}
            />
          ))}
        </div>
        <span className="mt-2 block h-1 overflow-hidden rounded-full bg-white/10">
          <span className="block h-full w-[78%] rounded-full bg-gradient-to-r from-cyan-200 via-emerald-200 to-amber-200" />
        </span>
      </>
    );
  }

  if (id === 'load') {
    return (
      <div className="relative h-16 overflow-hidden rounded-[0.8rem] border border-white/10 bg-white/[0.04] p-2">
        <div className="absolute left-4 right-4 top-1/2 h-px bg-white/14" />
        <div className="grid h-full grid-cols-5 gap-1.5 [transform:skewX(-8deg)]">
          {Array.from({ length: 15 }, (_, cell) => (
            <span
              key={cell}
              className={`rounded-[0.32rem] ${
                cell % 4 === 0 ? skin.primary : cell % 5 === 0 ? skin.secondary : 'bg-white/14'
              } ${cell === 2 || cell === 13 ? 'opacity-35' : ''}`}
            />
          ))}
        </div>
        <span className="absolute bottom-2 left-3 right-3 h-1 rounded-full bg-cyan-100/70" />
      </div>
    );
  }

  if (id === 'door') {
    return (
      <div className="relative h-16 rounded-[0.8rem] border border-white/10 bg-white/[0.04]">
        <span className="absolute inset-x-6 bottom-3 h-1.5 rounded-full bg-rose-100/18" />
        {[
          'left-[12%] top-[20%] h-[50%] w-[15%]',
          'left-[32%] top-[30%] h-[40%] w-[12%]',
          'left-[50%] top-[14%] h-[56%] w-[17%]',
          'left-[74%] top-[26%] h-[44%] w-[12%]',
        ].map((className, panel) => (
          <span
            key={className}
            className={`absolute rounded-[0.35rem] ${panel === 2 ? skin.secondary : panel === 1 ? 'bg-white/16' : skin.primary} ${className}`}
          />
        ))}
      </div>
    );
  }

  if (id === 'gantt') {
    return (
      <div className="grid h-16 grid-rows-4 gap-2">
        {[
          ['w-[58%]', 'ml-[64%] w-[24%]'],
          ['ml-[12%] w-[46%]', 'ml-[62%] w-[30%]'],
          ['ml-[4%] w-[28%]', 'ml-[39%] w-[44%]'],
          ['ml-[20%] w-[62%]'],
        ].map((row, rowIndex) => (
          <div key={rowIndex} className="relative rounded-full bg-white/8">
            {row.map((bar, barIndex) => (
              <span
                key={bar}
                className={`absolute top-1/2 h-2 -translate-y-1/2 rounded-full ${barIndex === 0 ? skin.primary : skin.secondary} ${bar}`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (id === 'db') {
    return (
      <div className="relative grid h-16 grid-cols-5 gap-1.5 rounded-[0.8rem] border border-white/10 bg-white/[0.04] p-2">
        {Array.from({ length: 20 }, (_, cell) => (
          <span
            key={cell}
            className={`rounded-[0.28rem] ${
              cell % 7 === 0 ? skin.primary : cell % 5 === 0 ? skin.secondary : 'bg-white/14'
            }`}
          />
        ))}
        <span className="absolute bottom-2 right-2 rounded-full border border-white/12 bg-white/10 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.16em] text-white/62">
          clean
        </span>
      </div>
    );
  }

  if (id === 'rag') {
    return (
      <div className="relative h-16 rounded-[0.8rem] border border-white/10 bg-white/[0.04]">
        <span className="absolute left-[18%] top-[26%] h-px w-[48%] rotate-12 bg-white/16" />
        <span className="absolute left-[32%] top-[61%] h-px w-[44%] -rotate-12 bg-white/16" />
        {[12, 32, 55, 73, 77].map((left, node) => (
          <span
            key={left}
            className={`absolute h-7 w-7 rounded-full border border-white/12 ${
              node % 2 === 0 ? skin.primary : node === 1 ? 'bg-white/17' : skin.secondary
            }`}
            style={{ left: `${left}%`, top: node % 2 === 0 ? '22%' : '58%' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid h-16 grid-cols-[0.78fr_1.22fr] gap-2">
      <div className="grid gap-1.5">
        <span className={`rounded-[0.55rem] ${skin.primary}`} />
        <span className="rounded-[0.55rem] bg-white/15" />
        <span className={`rounded-[0.55rem] ${skin.secondary}`} />
      </div>
      <div className="rounded-[0.8rem] border border-white/10 bg-white/[0.04] p-2">
        <span className="mb-2 block h-1 rounded-full bg-white/12">
          <span className={`block h-full w-[72%] rounded-full ${skin.primary}`} />
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }, (_, cell) => (
            <span key={cell} className={`h-3 rounded-[0.25rem] ${cell % 3 === 0 ? skin.secondary : 'bg-white/14'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileProjectPreview({
  project,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  const skin = MOBILE_PROJECT_SKINS[project.id] ?? MOBILE_PROJECT_SKINS.cargo;
  const progress = Math.round(((index + 1) / total) * 100);

  return (
    <div className={`relative mb-3 overflow-hidden rounded-[1.05rem] border border-white/12 bg-slate-950 p-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${skin.glow}`}>
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">
          {skin.label}
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-white/46">
          {project.demo ? 'live' : `${String(index + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`}
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.85)]" />
        </span>
      </div>

      <MobileVisualBody id={project.id} skin={skin} />

      <div className="mt-2.5 flex items-center gap-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/42">
          {project.cat.split(' · ')[0]}
        </span>
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
          <span
            className="block h-full rounded-full bg-white/70"
            style={{ width: `${progress}%` }}
          />
        </span>
      </div>
    </div>
  );
}

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
        className="relative z-10 flex min-h-screen items-center justify-center overflow-hidden px-5 text-center"
      >
        <div className="pointer-events-none absolute inset-x-4 top-[29%] bottom-[14%] z-0 rounded-full bg-white/90 blur-3xl md:hidden" />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center pt-20">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="mb-5 text-[9px] uppercase tracking-[0.32em] text-neutral-500 sm:text-xs sm:tracking-[0.38em]"
          >
            Mattia Erigoni · Management Engineer
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
            className="mx-auto mt-7 max-w-[330px] text-balance text-center text-[14px] font-medium leading-7 text-neutral-700 md:mt-8 md:max-w-[760px] md:text-xl md:font-normal md:leading-9 md:text-neutral-600"
          >
            <span className="md:hidden">
              Mattia Erigoni builds operational software and AI tools for planning, logistics and data quality.
            </span>
            <span className="hidden md:inline">
              Mattia Erigoni is a Management Engineer building operational software and AI tools for logistics,
              planning, data quality and private knowledge workflows.
            </span>
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
      <section id="projects-mobile" className="relative z-10 mx-auto max-w-lg px-5 pb-10 pt-7 md:hidden">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-neutral-200" />
            <p className="text-[10px] uppercase tracking-[0.34em] text-neutral-500">Selected work</p>
            <span className="h-px w-10 bg-neutral-200" />
          </div>
          <p className="mx-auto mt-3 max-w-[26rem] text-balance text-[13px] leading-6 text-neutral-500">
            Eight operational tools, each reduced to the decision it makes easier.
          </p>
        </div>
        <div className="grid gap-3.5">
          {PROJECTS.map((project, index) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 34, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileTap={{ scale: 0.985 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.58, delay: Math.min(index * 0.032, 0.16), ease: [0.16, 1, 0.3, 1] }}
              className="group block w-full rounded-[1.45rem] border border-white/80 bg-white/84 p-3.5 text-left shadow-[0_22px_70px_rgba(0,0,0,0.075)] backdrop-blur-xl transition duration-300 hover:border-neutral-950/12 hover:bg-white"
            >
              <MobileProjectPreview project={project} index={index} total={PROJECTS.length} />
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-[11px] tracking-[0.28em] text-neutral-500">{project.number}</span>
                <span className="h-px flex-1 bg-neutral-200" />
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400">
                  {project.cat.split(' · ')[0]}
                </span>
              </div>
              <h3 className="text-balance text-[1.15rem] font-semibold tracking-[-0.04em] text-neutral-950">{project.title}</h3>
              <p className="mt-2 max-h-[3.95rem] overflow-hidden text-pretty text-[12.5px] leading-relaxed text-neutral-600">{project.shortDesc}</p>
              {project.demo && (
                <div className="mt-3 flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-900">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                  Live demo available
                </div>
              )}
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {project.pills.slice(0, 3).map((pill) => (
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
        className="relative z-20 scroll-mt-24 px-5 py-20 md:py-36"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mx-auto w-full max-w-6xl"
        >
          <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-end md:gap-12">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-neutral-500">about</p>
              <h2 className="mt-4 max-w-[11ch] text-balance text-[2.45rem] font-semibold leading-[0.96] tracking-[-0.045em] text-neutral-950 sm:text-5xl lg:text-[4.6rem]">
                Systems for messy operations.
              </h2>
            </div>

            <div className="border-l border-neutral-950/12 pl-4 text-left md:pl-8">
              <p className="max-w-2xl text-pretty text-[15px] leading-7 text-neutral-700 md:text-lg md:leading-9">
                I work across operations, data, suppliers, customers and AI: the useful middle layer where messy
                constraints become faster decisions and cleaner execution.
              </p>
              <p className="mt-4 max-w-2xl text-pretty text-[13px] leading-6 text-neutral-500 md:mt-5 md:text-base md:leading-8">
                Management engineering gives the method; software gives the leverage. I map how work really happens,
                remove manual friction and ship tools that people can trust when time, cost and coordination matter.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:mt-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-5">
            <div className="rounded-[1.25rem] border border-neutral-950/10 bg-neutral-950 p-4 text-white shadow-[0_30px_100px_rgba(15,23,42,0.16)] md:p-7">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/45">operational thesis</p>
                  <p className="mt-4 max-w-md text-pretty text-lg font-semibold leading-tight tracking-[-0.035em] md:mt-5 md:text-2xl">
                    Make operational work measurable, repeatable and faster.
                  </p>
                </div>
                <span className="hidden rounded-full border border-white/12 bg-white/8 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 sm:inline-flex">
                  impact
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/12 pt-4 md:mt-7 md:gap-3 md:pt-5">
                {IMPACT_METRICS.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 md:p-4"
                  >
                    <p className="font-mono text-2xl font-semibold tracking-[-0.05em] text-white md:text-[2.35rem]">
                      {item.value}
                    </p>
                    <p className="mt-1.5 text-[9px] font-semibold uppercase leading-snug tracking-[0.13em] text-white/80 md:mt-2 md:text-[11px] md:tracking-[0.16em]">
                      {item.title}
                    </p>
                    <p className="mt-1.5 text-[10px] leading-snug text-white/44 md:mt-2 md:text-[12px] md:leading-relaxed">
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
                  className="grid grid-cols-[44px_1fr] items-start gap-3 rounded-[1.15rem] border border-neutral-200/80 bg-white/85 p-3 text-left shadow-[0_18px_65px_rgba(0,0,0,0.045)] backdrop-blur-xl transition hover:border-neutral-950/20 hover:shadow-[0_24px_80px_rgba(0,0,0,0.07)] md:grid-cols-[62px_1fr] md:p-5"
                >
                  <div className="flex items-center gap-2 md:block">
                    <span className="font-mono text-[11px] tracking-[0.26em] text-neutral-400">{item.k}</span>
                    <span className="h-px flex-1 bg-neutral-200 md:mt-4 md:block md:w-10" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold tracking-[-0.035em] text-neutral-950 md:text-lg">{item.t}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-neutral-500 md:mt-1.5 md:text-sm">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-[1.25rem] border border-neutral-200/85 bg-white/78 p-4 text-left shadow-[0_18px_70px_rgba(0,0,0,0.04)] backdrop-blur-xl md:mt-5 md:p-5 lg:p-6">
            <div className="grid gap-5 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
              <div>
                <div className="flex items-center justify-between gap-4 border-b border-neutral-200/90 pb-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-neutral-400">
                    operating loop
                  </p>
                  <span className="hidden h-px flex-1 bg-neutral-200 sm:block" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 md:mt-5 md:grid-cols-4 md:gap-3">
                  {METHOD_STEPS.map((item, index) => (
                    <div
                      key={item.label}
                      className="group relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-3 transition hover:-translate-y-0.5 hover:border-neutral-950/20 hover:bg-white hover:shadow-[0_18px_45px_rgba(0,0,0,0.06)] md:p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-[10px] text-neutral-400">
                          0{index + 1}
                        </span>
                        <span className="h-px flex-1 bg-neutral-200 transition group-hover:bg-neutral-950/20" />
                      </div>
                      <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-neutral-950 md:mt-5 md:text-sm">
                        {item.value}
                      </p>
                      <p className="mt-1 text-[12px] font-medium leading-relaxed text-neutral-600 md:text-[13px]">
                        {item.label}
                      </p>
                      <p className="mt-3 hidden text-[12px] leading-relaxed text-neutral-500 sm:block">
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

                <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-1">
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
            Let&apos;s turn the messy workflow into the useful tool.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-balance text-[15px] leading-7 text-neutral-600 md:mt-6 md:text-lg md:leading-8">
            I build operational software for planning, logistics, data quality and private AI workflows.
            The best starting point is a concrete constraint, a spreadsheet nobody trusts, or a process that takes too long.
          </p>
          <div className="mt-8 grid gap-2 sm:inline-grid sm:grid-cols-2 md:mt-10">
            <a
              href="mailto:mattiaerigoni99@gmail.com"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-neutral-950 bg-neutral-950 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_55px_rgba(0,0,0,0.13)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-neutral-950 active:translate-y-0"
            >
              Email me
            </a>
            <a
              href="https://www.linkedin.com/in/mattia-erigoni-b87614183/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-neutral-200 bg-white/75 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-neutral-700 shadow-[0_18px_55px_rgba(0,0,0,0.055)] transition duration-300 hover:-translate-y-0.5 hover:border-neutral-950/25 hover:text-neutral-950 active:translate-y-0"
            >
              LinkedIn ↗
            </a>
          </div>
          <div className="mx-auto mt-7 grid max-w-xl grid-cols-3 gap-2 text-left md:mt-9">
            {['operations', 'data', 'AI'].map((item) => (
              <span
                key={item}
                className="rounded-2xl border border-neutral-200 bg-white/70 px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500 shadow-[0_14px_45px_rgba(0,0,0,0.04)]"
              >
                {item}
              </span>
            ))}
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
