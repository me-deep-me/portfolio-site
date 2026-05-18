'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Project } from '@/data/projects';
import { ProjectActions } from './ProjectActions';

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / Math.max(edge1 - edge0, 0.0001));
  return t * t * (3 - 2 * t);
}

function useViewportSize() {
  const [size, setSize] = useState({ width: 1280, height: 820 });

  useEffect(() => {
    const measure = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return size;
}

interface Props {
  project: Project;
  index: number;
  total: number;
  progress: number;
  onOpen: () => void;
}

type PremiumVisual = 'nest' | 'cargo' | 'load' | 'door' | 'gantt' | 'db' | 'rag' | 'micro';

interface PremiumProject {
  eyebrow: string;
  description: string;
  visual: PremiumVisual;
  visualLabel: string;
  glow: string;
  tag: string;
  stats: { value: string; label: string }[];
  flow: string[];
}

const premiumProjects: Record<string, PremiumProject> = {
  nest: {
    eyebrow: 'integrated nesting pipeline',
    description: 'Internalises Revit-to-CNC nesting and keeps design, cutting, packaging and supplier outputs aligned.',
    visual: 'nest',
    visualLabel: 'sheet layout',
    glow: 'bg-[radial-gradient(circle_at_18%_0%,rgba(163,230,53,0.18),transparent_34%),radial-gradient(circle_at_90%_18%,rgba(34,211,238,0.14),transparent_30%)]',
    tag: 'text-lime-100 border-lime-200/20 bg-lime-200/10',
    stats: [
      { value: 'Input', label: 'Revit/BIM export' },
      { value: 'Logic', label: 'nesting heuristic' },
      { value: 'Output', label: 'DXF + Excel' },
    ],
    flow: ['revit export', 'nesting', 'supplier pack'],
  },
  cargo: {
    eyebrow: 'offer-stage freight model',
    description: 'Converts product codes into freight scenarios with crate rules, packing logic and fill signals.',
    visual: 'cargo',
    visualLabel: 'load model',
    glow: 'bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.22),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(251,191,36,0.16),transparent_28%)]',
    tag: 'text-amber-100 border-amber-200/20 bg-amber-200/10',
    stats: [
      { value: 'Input', label: 'product codes' },
      { value: 'Model', label: 'crate rules' },
      { value: 'Result', label: 'container estimate' },
    ],
    flow: ['offer data', 'crate rules', 'container fit'],
  },
  load: {
    eyebrow: 'packing-list validator',
    description: 'Uses confirmed packing lists to produce transport-ready layouts and saturation checks.',
    visual: 'load',
    visualLabel: 'load scan',
    glow: 'bg-[radial-gradient(circle_at_14%_0%,rgba(59,130,246,0.2),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(16,185,129,0.16),transparent_30%)]',
    tag: 'text-sky-100 border-sky-200/20 bg-sky-200/10',
    stats: [
      { value: 'Input', label: 'real packing list' },
      { value: 'Check', label: 'load layout' },
      { value: 'Result', label: 'dispatch ready' },
    ],
    flow: ['real list', 'constraints', 'load map'],
  },
  door: {
    eyebrow: 'technical crate optimizer',
    description: 'Turns implicit door-code knowledge into measurable crate and pallet decisions under real constraints.',
    visual: 'door',
    visualLabel: 'crate solver',
    glow: 'bg-[radial-gradient(circle_at_14%_0%,rgba(251,113,133,0.18),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(250,204,21,0.14),transparent_30%)]',
    tag: 'text-rose-100 border-rose-200/20 bg-rose-200/10',
    stats: [
      { value: 'Input', label: 'door codes' },
      { value: 'Model', label: 'weights + constraints' },
      { value: 'Result', label: 'crate plan' },
    ],
    flow: ['door string', 'weight model', 'crate plan'],
  },
  gantt: {
    eyebrow: 'Excel/VBA planning layer',
    description: 'Makes production planning explicit with a Gantt that recalculates around orders and capacity.',
    visual: 'gantt',
    visualLabel: 'gantt board',
    glow: 'bg-[radial-gradient(circle_at_14%_0%,rgba(129,140,248,0.2),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(34,211,238,0.14),transparent_30%)]',
    tag: 'text-indigo-100 border-indigo-200/20 bg-indigo-200/10',
    stats: [
      { value: 'Input', label: 'orders + capacity' },
      { value: 'View', label: 'daily Gantt' },
      { value: 'Result', label: 'fast replanning' },
    ],
    flow: ['orders', 'capacity', 'daily plan'],
  },
  db: {
    eyebrow: 'contact data governance',
    description: 'Adds validation, duplicate control, guided input and Outlook actions to a large B2B contact base.',
    visual: 'db',
    visualLabel: 'record base',
    glow: 'bg-[radial-gradient(circle_at_14%_0%,rgba(45,212,191,0.18),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(59,130,246,0.16),transparent_30%)]',
    tag: 'text-teal-100 border-teal-200/20 bg-teal-200/10',
    stats: [
      { value: 'Scale', label: '85k+ records' },
      { value: 'Quality', label: 'duplicate checks' },
      { value: 'Action', label: 'email workflow' },
    ],
    flow: ['validate', 'duplicate check', 'activate'],
  },
  rag: {
    eyebrow: 'local RAG research',
    description: 'Tests local AI retrieval that links answers back to source documents and the ÆMed path.',
    visual: 'rag',
    visualLabel: 'retrieval map',
    glow: 'bg-[radial-gradient(circle_at_14%_0%,rgba(168,85,247,0.2),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(14,165,233,0.15),transparent_30%)]',
    tag: 'text-violet-100 border-violet-200/20 bg-violet-200/10',
    stats: [
      { value: 'Input', label: 'technical docs' },
      { value: 'Model', label: 'local retrieval' },
      { value: 'Output', label: 'answers with sources' },
    ],
    flow: ['documents', 'retrieval', 'answers'],
  },
  micro: {
    eyebrow: 'lean automation bench',
    description: 'Lightweight scripts that transform scattered exports into repeatable reports and decision support.',
    visual: 'micro',
    visualLabel: 'tool bench',
    glow: 'bg-[radial-gradient(circle_at_14%_0%,rgba(251,146,60,0.18),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(34,197,94,0.14),transparent_30%)]',
    tag: 'text-orange-100 border-orange-200/20 bg-orange-200/10',
    stats: [
      { value: 'Input', label: 'raw exports' },
      { value: 'Process', label: 'clean + aggregate' },
      { value: 'Output', label: 'reports' },
    ],
    flow: ['raw export', 'script', 'report'],
  },
};

function PremiumVisualPanel({ visual, label }: { visual: PremiumVisual; label: string }) {
  return (
    <div className="rounded-[1.15rem] border border-white/12 bg-white/[0.07] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-300/70">
          {label}
        </span>
        <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.7)]" />
      </div>

      {visual === 'nest' && (
        <div className="relative h-32 overflow-hidden rounded-[0.85rem] border border-white/10 bg-white/[0.04] p-2">
          <div className="absolute inset-2 rounded-[0.55rem] border border-lime-200/18" />
          {[
            'left-[9%] top-[13%] h-[33%] w-[31%] bg-lime-200/80',
            'left-[43%] top-[13%] h-[20%] w-[22%] bg-cyan-200/75',
            'left-[68%] top-[13%] h-[45%] w-[20%] bg-white/18',
            'left-[9%] top-[50%] h-[34%] w-[22%] bg-white/16',
            'left-[34%] top-[39%] h-[45%] w-[31%] bg-lime-100/70',
            'left-[68%] top-[64%] h-[20%] w-[20%] bg-cyan-100/65',
          ].map((className) => (
            <span key={className} className={`absolute rounded-[0.4rem] ${className}`} />
          ))}
        </div>
      )}

      {visual === 'cargo' && (
        <>
          <div className="grid h-28 grid-cols-6 grid-rows-3 gap-1.5">
            {Array.from({ length: 18 }, (_, cell) => (
              <span
                key={cell}
                className={`rounded-[0.35rem] ${
                  cell % 5 === 0
                    ? 'bg-amber-200/80'
                    : cell % 3 === 0
                      ? 'bg-cyan-200/75'
                      : 'bg-white/16'
                }`}
              />
            ))}
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <span className="block h-full w-[78%] rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-200" />
          </div>
        </>
      )}

      {visual === 'load' && (
        <div className="relative h-32 overflow-hidden rounded-[0.85rem] border border-white/10 bg-white/[0.04] p-3">
          <div className="absolute left-3 right-3 top-1/2 h-px bg-white/14" />
          <div className="grid h-full grid-cols-5 gap-1.5">
            {Array.from({ length: 15 }, (_, cell) => (
              <span
                key={cell}
                className={`rounded-[0.35rem] ${
                  cell % 4 === 0
                    ? 'bg-sky-200/80'
                    : cell % 5 === 0
                      ? 'bg-emerald-200/72'
                      : 'bg-white/15'
                } ${cell === 2 || cell === 11 ? 'opacity-35' : ''}`}
              />
            ))}
          </div>
          <div className="absolute bottom-3 left-3 right-3 h-1 overflow-hidden rounded-full bg-white/10">
            <span className="block h-full w-[86%] rounded-full bg-gradient-to-r from-sky-300 via-cyan-200 to-emerald-200" />
          </div>
        </div>
      )}

      {visual === 'door' && (
        <div className="relative h-32 overflow-hidden rounded-[0.85rem] border border-white/10 bg-white/[0.04] p-3">
          <div className="absolute inset-x-5 bottom-5 h-2 rounded-full bg-rose-100/18" />
          {[
            'left-[9%] top-[19%] h-[54%] w-[16%] bg-rose-200/74',
            'left-[29%] top-[28%] h-[45%] w-[13%] bg-white/16',
            'left-[46%] top-[13%] h-[60%] w-[18%] bg-amber-200/72',
            'left-[68%] top-[24%] h-[49%] w-[14%] bg-rose-100/58',
          ].map((className) => (
            <span key={className} className={`absolute rounded-[0.4rem] ${className}`} />
          ))}
          <div className="absolute left-[12%] right-[14%] top-[78%] grid grid-cols-5 gap-1">
            {Array.from({ length: 5 }, (_, brace) => (
              <span key={brace} className="h-1 rounded-full bg-white/18" />
            ))}
          </div>
        </div>
      )}

      {visual === 'gantt' && (
        <div className="relative h-32 overflow-hidden rounded-[0.85rem] border border-white/10 bg-white/[0.04] p-3">
          <div className="grid h-full grid-rows-4 gap-2">
            {[
              ['w-[58%] bg-indigo-200/78', 'ml-[62%] w-[24%] bg-cyan-200/58'],
              ['ml-[12%] w-[46%] bg-white/16', 'ml-[62%] w-[30%] bg-indigo-100/62'],
              ['ml-[4%] w-[28%] bg-cyan-200/72', 'ml-[38%] w-[45%] bg-white/18'],
              ['ml-[20%] w-[62%] bg-indigo-200/68'],
            ].map((row, rowIndex) => (
              <div key={rowIndex} className="relative rounded-full bg-white/8">
                {row.map((bar) => (
                  <span key={bar} className={`absolute top-1/2 h-2 -translate-y-1/2 rounded-full ${bar}`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {visual === 'db' && (
        <div className="relative h-32 overflow-hidden rounded-[0.85rem] border border-white/10 bg-white/[0.04] p-3">
          <div className="grid h-full grid-cols-4 gap-1.5">
            {Array.from({ length: 20 }, (_, cell) => (
              <span
                key={cell}
                className={`rounded-[0.32rem] ${
                  cell % 7 === 0
                    ? 'bg-teal-200/78'
                    : cell % 5 === 0
                      ? 'bg-sky-200/62'
                      : 'bg-white/14'
                }`}
              />
            ))}
          </div>
          <span className="absolute bottom-3 right-3 rounded-full border border-teal-100/20 bg-teal-100/12 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-teal-50/75">
            clean
          </span>
        </div>
      )}

      {visual === 'rag' && (
        <div className="relative h-32 overflow-hidden rounded-[0.85rem] border border-white/10 bg-white/[0.04]">
          <div className="absolute left-[18%] top-[25%] h-px w-[46%] rotate-12 bg-violet-100/18" />
          <div className="absolute left-[32%] top-[58%] h-px w-[42%] -rotate-12 bg-cyan-100/18" />
          <div className="absolute left-[48%] top-[20%] h-[54%] w-px bg-white/12" />
          {[
            'left-[12%] top-[20%] bg-violet-200/78',
            'left-[32%] top-[62%] bg-white/18',
            'left-[55%] top-[38%] bg-cyan-200/72',
            'left-[72%] top-[18%] bg-violet-100/58',
            'left-[74%] top-[66%] bg-cyan-100/52',
          ].map((node) => (
            <span key={node} className={`absolute h-8 w-8 rounded-full border border-white/12 ${node}`} />
          ))}
          <span className="absolute bottom-3 left-3 rounded-full border border-white/12 bg-white/8 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-white/60">
            sources
          </span>
        </div>
      )}

      {visual === 'micro' && (
        <div className="grid h-32 grid-cols-[0.8fr_1.2fr] gap-2">
          <div className="grid gap-2">
            <span className="rounded-[0.65rem] bg-orange-200/72" />
            <span className="rounded-[0.65rem] bg-white/15" />
            <span className="rounded-[0.65rem] bg-emerald-200/62" />
          </div>
          <div className="rounded-[0.85rem] border border-white/10 bg-white/[0.04] p-3">
            <div className="mb-3 h-1.5 rounded-full bg-white/12">
              <span className="block h-full w-[72%] rounded-full bg-orange-200/78" />
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 9 }, (_, cell) => (
                <span
                  key={cell}
                  className={`h-5 rounded-[0.28rem] ${cell % 3 === 0 ? 'bg-emerald-200/58' : 'bg-white/14'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PremiumProjectContent({
  project,
  premium,
  onOpen,
}: {
  project: Project;
  premium: PremiumProject;
  onOpen: () => void;
}) {
  return (
    <div className="relative p-5 md:p-6">
      <div className={`pointer-events-none absolute inset-0 ${premium.glow}`} />
      <div className="relative">
        <div className="mb-5 flex items-center gap-3">
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 font-mono text-[11px] tracking-[0.28em] text-cyan-100">
            {project.number}
          </span>
          <span className="h-px flex-1 bg-white/14" />
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-100/65">
            {project.cat}
          </span>
        </div>

        <div className="grid gap-5">
          <div>
            <p className={`mb-3 inline-flex rounded-full border px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.22em] ${premium.tag}`}>
              {premium.eyebrow}
            </p>
            <h3 className="text-balance text-2xl font-semibold leading-[1] tracking-[-0.035em] text-white lg:text-3xl">
              {project.title}
            </h3>
            <p className="mt-3 text-pretty text-[13px] leading-6 text-slate-200/78 lg:text-[14px] lg:leading-7">
              {premium.description}
            </p>
          </div>

          <PremiumVisualPanel visual={premium.visual} label={premium.visualLabel} />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {premium.stats.map((stat) => (
            <div key={stat.label} className="border-t border-white/12 pt-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white md:text-[13px]">{stat.value}</p>
              <p className="mt-1 text-[9px] leading-snug uppercase tracking-[0.14em] text-slate-300/60">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {premium.flow.map((step) => (
            <span
              key={step}
              className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] text-slate-100/75"
            >
              {step}
            </span>
          ))}
        </div>

        <div className="[&>div>a]:border-white/14 [&>div>a]:bg-white/[0.08] [&>div>a]:text-slate-100 [&>div>a:hover]:border-cyan-100/45 [&>div>button]:border-cyan-100/30 [&>div>button]:bg-cyan-100 [&>div>button]:text-slate-950 [&>div>button:hover]:bg-white">
          <ProjectActions project={project} onOpen={onOpen} />
        </div>
      </div>
    </div>
  );
}

function StandardProjectContent({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <>
      <div className="mb-5 flex items-center gap-3">
        <span className="font-mono text-[11px] tracking-[0.28em] text-neutral-500">
          {project.number}
        </span>
        <span className="h-px flex-1 bg-neutral-200" />
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-400">
          {project.cat}
        </span>
      </div>

      <h3 className="text-balance text-2xl font-medium leading-tight tracking-[-0.035em] text-neutral-950 lg:text-3xl">
        {project.title}
      </h3>

      <p className="mt-4 text-pretty text-[14px] leading-7 text-neutral-600 lg:text-[15px] lg:leading-8">
        {project.shortDesc}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.pills.map((pill) => (
          <span
            key={pill.label}
            className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-wide ${
              pill.hi
                ? 'border-neutral-900/20 bg-neutral-900/5 text-neutral-900'
                : 'border-neutral-200 bg-white/70 text-neutral-700'
            }`}
          >
            {pill.label}
          </span>
        ))}
      </div>

      <ProjectActions project={project} onOpen={onOpen} />
    </>
  );
}

export function ProjectCard({ project, index, total, progress, onOpen }: Props) {
  /* Each card owns an isolated scroll slot. It fades out before
     the next slot can fade in, so cards never visually overlap. */
  const segment    = 1 / total;
  const slotStart  = segment * index;
  const slotLocal  = (progress - slotStart) / segment;
  const enterStart = index === 0 ? 0 : 0.02;
  const enterEnd   = index === 0 ? 0.03 : 0.12;
  const exitStart  = 0.78;
  const exitEnd    = 0.98;
  const visible    = smoothstep(enterStart, enterEnd, slotLocal) *
                     (1 - smoothstep(exitStart, exitEnd, slotLocal));
  const premium    = premiumProjects[project.id];
  const viewport = useViewportSize();

  const side      = index % 2 === 0 ? -1 : 1;
  const yOffset   = side * (premium ? 12 : 18);
  const desiredX  = premium ? lerp(330, 410, visible) : lerp(250, 390, visible);
  const cardWidth = premium
    ? Math.min(440, viewport.width * 0.39)
    : Math.min(560, viewport.width * 0.43);
  const maxX      = Math.max(220, viewport.width / 2 - cardWidth / 2 - 24);
  const xDistance = Math.min(desiredX, maxX);
  const x         = side * xDistance;
  const y         = lerp(34 * side, yOffset, visible);
  const heightScale = clamp((viewport.height - 48) / 680, 0.78, 1);
  const scale     = lerp(Math.min(0.92, heightScale), heightScale, visible);

  return (
    <motion.article
      style={{
        left: '50%',
        top: '50%',
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
        opacity: visible,
        scale,
        pointerEvents: visible > 0.25 ? 'auto' : 'none',
      }}
      className={`absolute z-20 min-h-[350px] text-left backdrop-blur-xl transition ${
        premium
          ? 'w-[min(440px,39vw)] overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-slate-950 text-white shadow-[0_34px_130px_rgba(15,23,42,0.24)] hover:border-cyan-200/45 hover:shadow-[0_38px_150px_rgba(8,47,73,0.26)]'
          : 'w-[min(560px,43vw)] rounded-[2rem] border border-white/80 bg-white/80 p-8 shadow-[0_28px_100px_rgba(0,0,0,0.09)] hover:border-neutral-950/15 hover:shadow-[0_34px_120px_rgba(0,0,0,0.12)]'
      }`}
    >
      {premium ? (
        <PremiumProjectContent project={project} premium={premium} onOpen={onOpen} />
      ) : (
        <StandardProjectContent project={project} onOpen={onOpen} />
      )}
    </motion.article>
  );
}
