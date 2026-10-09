'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { PROJECTS, type Project } from '@/data/projects';
import { ProjectArticle, ProjectImpactDashboard } from './ProjectDeepDive';
import { ProjectOwnership } from './ProjectOwnership';

interface Props {
  openId: string | null;
  onClose: () => void;
}

type VisualKind = 'nest' | 'cargo' | 'load' | 'door' | 'gantt' | 'db' | 'rag' | 'micro' | 'cerbrain';

interface CaseStudy {
  eyebrow: string;
  visual: VisualKind;
  accent: string;
  glow: string;
  problem: string;
  system: string;
  output: string;
  metrics: { value: string; label: string }[];
}

const caseStudies: Record<string, CaseStudy> = {
  nest: {
    eyebrow: 'integrated nesting pipeline',
    visual: 'nest',
    accent: 'text-lime-100 border-lime-200/20 bg-lime-200/10',
    glow: 'bg-[radial-gradient(circle_at_18%_0%,rgba(163,230,53,0.2),transparent_36%),radial-gradient(circle_at_88%_18%,rgba(34,211,238,0.16),transparent_30%)]',
    problem: 'Panel nesting was outsourced, so layout logic, room grouping and downstream packaging were hard to control.',
    system: 'The pipeline validates design exports, evaluates sheet layouts and carries item references into manufacturing and packaging outputs.',
    output: 'One data flow links design, CNC sequence, packaging and supplier documentation through Excel, DXF, GLB/IFC and PNG outputs.',
    metrics: [
      { value: 'Input', label: 'Revit/BIM export' },
      { value: 'Logic', label: 'nesting heuristic' },
      { value: 'Output', label: 'DXF + Excel' },
    ],
  },
  cargo: {
    eyebrow: 'offer-stage freight model',
    visual: 'cargo',
    accent: 'text-amber-100 border-amber-200/20 bg-amber-200/10',
    glow: 'bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.22),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(251,191,36,0.16),transparent_28%)]',
    problem: 'During offers, freight assumptions were made before a real packing list existed, creating risk of under- or over-estimated containers.',
    system: 'CargoCast transforms product codes and quantities into physical crates with deterministic family rules, then simulates container loading.',
    output: 'Sales gets repeatable container counts, saturation levels and a first logistics scenario aligned with the later operating model.',
    metrics: [
      { value: 'Input', label: 'product codes' },
      { value: 'Model', label: 'crate rules' },
      { value: 'Result', label: 'container estimate' },
    ],
  },
  load: {
    eyebrow: 'packing-list validator',
    visual: 'load',
    accent: 'text-sky-100 border-sky-200/20 bg-sky-200/10',
    glow: 'bg-[radial-gradient(circle_at_14%_0%,rgba(59,130,246,0.2),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(16,185,129,0.16),transparent_30%)]',
    problem: 'The dispatch phase needed a reliable way to validate final packing lists and book transport from real crate data.',
    system: 'LoadScan applies the same loading model to confirmed crates, dimensions and quantities with rotation and compatibility constraints.',
    output: 'It produces visual load layouts, fill indicators and operational checks for logistics coordination.',
    metrics: [
      { value: 'Input', label: 'real packing list' },
      { value: 'Check', label: 'load layout' },
      { value: 'Result', label: 'dispatch ready' },
    ],
  },
  door: {
    eyebrow: 'technical crate optimizer',
    visual: 'door',
    accent: 'text-rose-100 border-rose-200/20 bg-rose-200/10',
    glow: 'bg-[radial-gradient(circle_at_14%_0%,rgba(251,113,133,0.18),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(250,204,21,0.14),transparent_30%)]',
    problem: 'Door crate planning depended on implicit knowledge of technical strings, weights and handling constraints.',
    system: 'The tool parses product codes, models weights for shielding, glass and materials, then runs a multi-constraint packing heuristic.',
    output: 'It returns measurable crate and pallet configurations with weight, volume and stability control for Excel/dashboard output.',
    metrics: [
      { value: 'Input', label: 'door codes' },
      { value: 'Model', label: 'weights + constraints' },
      { value: 'Result', label: 'crate plan' },
    ],
  },
  gantt: {
    eyebrow: 'Excel/VBA planning layer',
    visual: 'gantt',
    accent: 'text-indigo-100 border-indigo-200/20 bg-indigo-200/10',
    glow: 'bg-[radial-gradient(circle_at_14%_0%,rgba(129,140,248,0.2),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(34,211,238,0.14),transparent_30%)]',
    problem: 'Production scheduling lived in manual Excel files and relied on operator experience to translate orders into capacity.',
    system: 'The workbook combines order data, work types, resource capacity, average times and assignment rules.',
    output: 'It generates a daily Gantt plan that can be recalculated when priorities or project scope change.',
    metrics: [
      { value: 'Input', label: 'orders + capacity' },
      { value: 'View', label: 'daily Gantt' },
      { value: 'Result', label: 'fast replanning' },
    ],
  },
  db: {
    eyebrow: 'contact data governance',
    visual: 'db',
    accent: 'text-teal-100 border-teal-200/20 bg-teal-200/10',
    glow: 'bg-[radial-gradient(circle_at_14%_0%,rgba(45,212,191,0.18),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(59,130,246,0.16),transparent_30%)]',
    problem: 'Commercial data was useful but fragmented: duplicates, inconsistent fields, missing validation and slow reuse.',
    system: 'ContactBase XL adds standardised fields, guided input, validation, duplicate checks and separated consolidation in Excel/VBA.',
    output: 'The database becomes a working layer for segmentation, analysis and Outlook-based communication, not just storage.',
    metrics: [
      { value: 'Scale', label: 'large contact archive' },
      { value: 'Quality', label: 'duplicate checks' },
      { value: 'Action', label: 'email workflow' },
    ],
  },
  rag: {
    eyebrow: 'private knowledge retrieval',
    visual: 'rag',
    accent: 'text-violet-100 border-violet-200/20 bg-violet-200/10',
    glow: 'bg-[radial-gradient(circle_at_14%_0%,rgba(168,85,247,0.2),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(14,165,233,0.15),transparent_30%)]',
    problem: 'Technical knowledge was available but dispersed across manuals, specs, PDFs, extractions and project records.',
    system: 'The system combines local inference, document preparation and retrieval with source inspection in a real working context.',
    output: 'Technical evidence becomes easier to retrieve and inspect, with source gaps visible rather than replaced by unsupported answers.',
    metrics: [
      { value: 'Input', label: 'technical docs' },
      { value: 'Model', label: 'local retrieval' },
      { value: 'Output', label: 'answers with sources' },
    ],
  },
  micro: {
    eyebrow: 'lean automation bench',
    visual: 'micro',
    accent: 'text-orange-100 border-orange-200/20 bg-orange-200/10',
    glow: 'bg-[radial-gradient(circle_at_14%_0%,rgba(251,146,60,0.18),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(34,197,94,0.14),transparent_30%)]',
    problem: 'Many operations were too small for a full system but repeated enough to waste time and create manual errors.',
    system: 'Small Python and Excel utilities clean exports, aggregate production, commercial and supplier data, and generate reports.',
    output: 'Raw data becomes structured information for planning, monitoring and decision support with minimal infrastructure.',
    metrics: [
      { value: 'Input', label: 'raw exports' },
      { value: 'Process', label: 'clean + aggregate' },
      { value: 'Output', label: 'reports' },
    ],
  },
  cerbrain: {
    eyebrow: 'flagship · enterprise operating intelligence',
    visual: 'cerbrain',
    accent: 'text-teal-100 border-teal-200/20 bg-teal-200/10',
    glow: 'bg-[radial-gradient(circle_at_14%_0%,rgba(45,212,191,0.2),transparent_34%),radial-gradient(circle_at_88%_20%,rgba(139,92,246,0.18),transparent_30%)]',
    problem: 'A renewable-energy business held its knowledge across document folders, emails, CRM records and specialist spreadsheets. Understanding a project meant reconstructing its history by hand; preparing a weekly management report meant copying, reconciling and rewriting the same information.',
    system: 'I built a persistent hybrid search index over tens of thousands of documents, an AI-connected operational CRM/ERP layer and one shared hub of tools. Semantic embeddings and exact-term search retrieve relevant evidence without opening every source. Business records, calculations, reports and agents then use the same company context.',
    output: 'The team works from a shared company memory: it can see what changed, retrieve the evidence, understand project status, compare energy scenarios and generate reports. Management sees deadlines, risks and opportunities, while agents handle routine work through scoped permissions and recorded actions.',
    metrics: [
      { value: 'Search', label: 'large indexed archive' },
      { value: 'Connect', label: 'AI-linked CRM/ERP layer' },
      { value: 'Operate', label: 'one governed tool hub' },
    ],
  },
};

function openPopup(event: MouseEvent<HTMLAnchorElement>, url: string, label: string) {
  const width = Math.min(1180, window.screen.availWidth - 48);
  const height = Math.min(820, window.screen.availHeight - 64);
  const left = window.screenX + Math.max(24, (window.outerWidth - width) / 2);
  const top = window.screenY + Math.max(32, (window.outerHeight - height) / 2);
  const popup = window.open(
    url,
    `portfolio-${label}`,
    `popup=yes,width=${Math.round(width)},height=${Math.round(height)},left=${Math.round(left)},top=${Math.round(top)},resizable=yes,scrollbars=yes`
  );

  if (popup) {
    event.preventDefault();
    popup.opener = null;
    popup.focus();
  }
}

function VisualPanel({ kind }: { kind: VisualKind }) {
  return (
    <div className="relative h-32 overflow-hidden rounded-[1.1rem] border border-white/12 bg-white/[0.07] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:h-56 sm:p-4 lg:h-full lg:min-h-[318px]">
      {kind === 'nest' && (
        <div className="relative h-full rounded-[0.9rem] border border-lime-200/18 bg-white/[0.04]">
          {[
            'left-[8%] top-[12%] h-[28%] w-[33%] bg-lime-200/82',
            'left-[46%] top-[12%] h-[18%] w-[22%] bg-cyan-200/74',
            'left-[72%] top-[12%] h-[44%] w-[18%] bg-white/18',
            'left-[8%] top-[48%] h-[34%] w-[24%] bg-white/16',
            'left-[37%] top-[39%] h-[43%] w-[31%] bg-lime-100/68',
            'left-[72%] top-[64%] h-[18%] w-[18%] bg-cyan-100/64',
          ].map((className) => (
            <span key={className} className={`absolute rounded-[0.45rem] ${className}`} />
          ))}
        </div>
      )}

      {kind === 'cargo' && (
        <div className="flex h-full flex-col justify-between">
          <div className="grid flex-1 grid-cols-6 grid-rows-4 gap-1.5">
            {Array.from({ length: 24 }, (_, cell) => (
              <span
                key={cell}
                className={`rounded-[0.35rem] ${
                  cell % 5 === 0 ? 'bg-amber-200/80' : cell % 3 === 0 ? 'bg-cyan-200/74' : 'bg-white/16'
                }`}
              />
            ))}
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <span className="block h-full w-[78%] rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-200" />
          </div>
        </div>
      )}

      {kind === 'load' && (
        <div className="relative h-full rounded-[0.9rem] border border-white/10 bg-white/[0.04] p-3">
          <div className="grid h-full grid-cols-5 gap-1.5">
            {Array.from({ length: 20 }, (_, cell) => (
              <span
                key={cell}
                className={`rounded-[0.35rem] ${
                  cell % 4 === 0 ? 'bg-sky-200/80' : cell % 5 === 0 ? 'bg-emerald-200/72' : 'bg-white/15'
                } ${cell === 2 || cell === 17 ? 'opacity-35' : ''}`}
              />
            ))}
          </div>
          <span className="absolute bottom-3 left-3 right-3 h-1 rounded-full bg-cyan-100/70" />
        </div>
      )}

      {kind === 'door' && (
        <div className="relative h-full rounded-[0.9rem] border border-white/10 bg-white/[0.04]">
          <span className="absolute inset-x-6 bottom-7 h-2 rounded-full bg-rose-100/18" />
          {[
            'left-[11%] top-[20%] h-[50%] w-[15%] bg-rose-200/74',
            'left-[31%] top-[29%] h-[41%] w-[12%] bg-white/16',
            'left-[48%] top-[14%] h-[56%] w-[17%] bg-amber-200/72',
            'left-[71%] top-[25%] h-[45%] w-[13%] bg-rose-100/58',
          ].map((className) => (
            <span key={className} className={`absolute rounded-[0.45rem] ${className}`} />
          ))}
        </div>
      )}

      {kind === 'gantt' && (
        <div className="grid h-full grid-rows-5 gap-2">
          {[
            ['w-[58%] bg-indigo-200/78', 'ml-[64%] w-[24%] bg-cyan-200/58'],
            ['ml-[10%] w-[46%] bg-white/16', 'ml-[62%] w-[31%] bg-indigo-100/62'],
            ['ml-[4%] w-[28%] bg-cyan-200/72', 'ml-[38%] w-[45%] bg-white/18'],
            ['ml-[20%] w-[62%] bg-indigo-200/68'],
            ['ml-[8%] w-[38%] bg-white/14', 'ml-[52%] w-[35%] bg-cyan-100/55'],
          ].map((row, rowIndex) => (
            <div key={rowIndex} className="relative rounded-full bg-white/8">
              {row.map((bar) => (
                <span key={bar} className={`absolute top-1/2 h-2 -translate-y-1/2 rounded-full ${bar}`} />
              ))}
            </div>
          ))}
        </div>
      )}

      {kind === 'db' && (
        <div className="grid h-full grid-cols-5 gap-1.5">
          {Array.from({ length: 30 }, (_, cell) => (
            <span
              key={cell}
              className={`rounded-[0.32rem] ${
                cell % 7 === 0 ? 'bg-teal-200/78' : cell % 5 === 0 ? 'bg-sky-200/62' : 'bg-white/14'
              }`}
            />
          ))}
        </div>
      )}

      {kind === 'rag' && (
        <div className="relative h-full">
          <span className="absolute left-[18%] top-[28%] h-px w-[48%] rotate-12 bg-violet-100/18" />
          <span className="absolute left-[32%] top-[60%] h-px w-[44%] -rotate-12 bg-cyan-100/18" />
          <span className="absolute left-[50%] top-[18%] h-[60%] w-px bg-white/12" />
          {[
            'left-[12%] top-[22%] bg-violet-200/78',
            'left-[31%] top-[64%] bg-white/18',
            'left-[55%] top-[39%] bg-cyan-200/72',
            'left-[73%] top-[19%] bg-violet-100/58',
            'left-[75%] top-[68%] bg-cyan-100/52',
          ].map((node) => (
            <span key={node} className={`absolute h-10 w-10 rounded-full border border-white/12 ${node}`} />
          ))}
        </div>
      )}

      {kind === 'micro' && (
        <div className="grid h-full grid-cols-[0.75fr_1.25fr] gap-3">
          <div className="grid gap-2">
            <span className="rounded-[0.7rem] bg-orange-200/72" />
            <span className="rounded-[0.7rem] bg-white/15" />
            <span className="rounded-[0.7rem] bg-emerald-200/62" />
          </div>
          <div className="rounded-[0.9rem] border border-white/10 bg-white/[0.04] p-3">
            <div className="mb-4 h-1.5 rounded-full bg-white/12">
              <span className="block h-full w-[72%] rounded-full bg-orange-200/78" />
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 12 }, (_, cell) => (
                <span
                  key={cell}
                  className={`h-6 rounded-[0.3rem] ${cell % 3 === 0 ? 'bg-emerald-200/58' : 'bg-white/14'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {kind === 'cerbrain' && (
        <div className="relative h-full">
          <span className="absolute left-[18%] top-[28%] h-px w-[52%] rotate-[16deg] bg-teal-100/22" />
          <span className="absolute left-[25%] top-[62%] h-px w-[50%] -rotate-[14deg] bg-violet-100/22" />
          <span className="absolute left-[50%] top-[18%] h-[62%] w-px bg-white/12" />
          {[
            'left-[12%] top-[20%] bg-teal-200/78',
            'left-[31%] top-[63%] bg-white/18',
            'left-[53%] top-[39%] bg-violet-200/76',
            'left-[73%] top-[19%] bg-cyan-100/62',
            'left-[75%] top-[67%] bg-teal-100/56',
          ].map((node) => (
            <span key={node} className={`absolute h-10 w-10 rounded-full border border-white/12 ${node}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function CaseStepBlock({
  number,
  label,
  text,
}: {
  number: string;
  label: string;
  text: string;
}) {
  return (
    <div className="grid gap-3 rounded-[1.1rem] border border-neutral-200/85 bg-white p-4 shadow-[0_14px_45px_rgba(0,0,0,0.035)] sm:grid-cols-[44px_1fr] md:p-5">
      <div className="flex items-center gap-3 sm:block">
        <span className="font-mono text-[11px] tracking-[0.24em] text-neutral-400">{number}</span>
        <span className="h-px flex-1 bg-neutral-200 sm:mt-4 sm:block sm:w-8" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-950">{label}</p>
        <p className="mt-2 text-pretty text-[13px] leading-6 text-neutral-600 md:text-[15px] md:leading-7">{text}</p>
      </div>
    </div>
  );
}

function ModalLink({
  href,
  children,
  project,
  kind,
}: {
  href: string;
  children: string;
  project: Project;
  kind: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => openPopup(event, href, `${project.id}-${kind}`)}
      className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-800 shadow-[0_12px_35px_rgba(0,0,0,0.06)] transition hover:border-neutral-950/25 active:scale-[0.98] sm:w-auto"
    >
      {children}
    </a>
  );
}

export function ProjectModal({ openId, onClose }: Props) {
  return <ProjectDialog key={openId ?? 'closed'} openId={openId} onClose={onClose} />;
}

function ProjectDialog({ openId, onClose }: Props) {
  const project = PROJECTS.find((p) => p.id === openId);
  const study = project ? caseStudies[project.id] : null;
  const [view, setView] = useState<'overview' | 'article' | 'impact'>('overview');
  const dialogRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const expanded = view !== 'overview';

  const changeView = (next: typeof view) => {
    setView(next);
    contentRef.current?.scrollTo({ top: 0 });
    dialogRef.current?.querySelector<HTMLButtonElement>(`[data-view="${next}"]`)?.focus();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, a[href], input, [tabindex="0"]')).filter((element) => element.getClientRects().length > 0);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!project) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [project]);

  return (
    <AnimatePresence>
      {project && study ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
            className="portfolio-dialog-overlay fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/45 p-0 pt-10 backdrop-blur-xl md:grid md:place-items-center md:p-6"
            onClick={onClose}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-dialog-title"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 360, damping: 34, mass: 0.82 }}
              className="portfolio-dialog flex max-h-[92dvh] w-full max-w-[1120px] flex-col overflow-hidden rounded-t-[1.5rem] border border-white/80 bg-white text-left shadow-[0_35px_140px_rgba(0,0,0,0.22)] md:max-h-[calc(100dvh-3rem)] md:rounded-[1.75rem]"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="portfolio-dialog-header relative shrink-0 overflow-hidden bg-slate-950 p-4 text-white sm:p-5 md:p-6">
              <div className={`pointer-events-none absolute inset-0 ${study.glow}`} />
              <span className="relative mx-auto mb-3 block h-1 w-11 rounded-full bg-white/22 md:hidden" />
              <div className={`relative grid gap-4 sm:gap-5 ${expanded ? '' : 'lg:grid-cols-[1fr_0.9fr] lg:items-stretch'}`}>
                <div className={`portfolio-dialog-heading flex min-h-0 flex-col justify-between ${expanded ? '' : 'md:min-h-[230px]'}`}>
                  <div>
                    <div className="mb-3 flex items-start justify-between gap-4 sm:mb-5">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/65 sm:tracking-[0.28em]">
                          case study · {project.number}<span className="hidden sm:inline"> · {project.cat}</span>
                        </p>
                        <div className="portfolio-dialog-badges mt-3 hidden flex-wrap gap-2 sm:mt-4 sm:flex">
                          <p className={`inline-flex rounded-full border px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.22em] ${study.accent}`}>
                            {study.eyebrow}
                          </p>
                          {project.demo && (
                            <p className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-emerald-100">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]" />
                              live demo
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        ref={closeRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Close project modal"
                        className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 text-xl text-white/70 transition hover:bg-white hover:text-slate-950 active:scale-[0.96]"
                      >
                        ×
                      </button>
                    </div>

                    <h3 id="project-dialog-title" className={`max-w-2xl text-balance font-semibold leading-[1.05] tracking-[-0.045em] text-white ${expanded ? 'text-2xl sm:text-3xl' : 'text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl'}`}>
                      {project.title}
                    </h3>
                  </div>

                  <div className={expanded ? 'hidden' : 'portfolio-dialog-metrics mt-5 hidden grid-cols-3 gap-2 border-t border-white/12 pt-3 sm:mt-7 sm:gap-3 sm:pt-4 md:grid'}>
                    {study.metrics.map((metric) => (
                      <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.055] p-2.5 sm:p-3">
                        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white md:text-[13px]">{metric.value}</p>
                        <p className="mt-1 text-[9px] leading-snug uppercase tracking-[0.14em] text-white/45">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={expanded ? 'hidden' : 'portfolio-dialog-visual hidden md:block'}>
                  <VisualPanel kind={study.visual} />
                </div>
              </div>
            </div>

            <nav aria-label="Project detail views" className="flex shrink-0 gap-1 border-b border-neutral-200 bg-white px-3 py-2 sm:px-6">
              {([
                { id: 'overview', label: 'Overview' },
                { id: 'article', label: 'In details ↗' },
                { id: 'impact', label: 'Impact lab' },
              ] as const).map((item) => (
                <button key={item.id} data-view={item.id} type="button" aria-pressed={view === item.id} onClick={() => changeView(item.id)} className={`min-h-[44px] flex-1 rounded-full px-2 py-2.5 text-[11px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:flex-none sm:px-4 ${view === item.id ? 'bg-neutral-950 text-white' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950'}`}>{item.label}</button>
              ))}
            </nav>
            <div ref={contentRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-neutral-50/60">
            {view === 'article' ? <ProjectArticle project={project} onExplore={() => changeView('impact')} /> : view === 'impact' ? <ProjectImpactDashboard project={project} /> : (
            <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[1fr_0.72fr] md:gap-5 md:p-6">
              <div className="md:col-span-2"><ProjectOwnership /></div>
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-teal-200 bg-teal-50 p-3 md:hidden">
                <p className="col-span-2 mb-1 text-xs leading-5 text-teal-950">Go deeper: the design story and a system-specific decision lab.</p>
                <button type="button" onClick={() => changeView('article')} className="min-h-[44px] rounded-full bg-teal-950 px-3 py-3 text-xs font-semibold text-white">Read case study ↗</button>
                <button type="button" onClick={() => changeView('impact')} className="min-h-[44px] rounded-full border border-teal-300 bg-white px-3 py-3 text-xs font-semibold text-teal-950">Impact lab</button>
              </div>
              <div className="grid gap-3 md:gap-4">
                <div className="grid grid-cols-3 gap-2 md:hidden">
                  {study.metrics.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-neutral-200/80 bg-white p-2.5 shadow-[0_12px_34px_rgba(0,0,0,0.035)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-950">{metric.value}</p>
                      <p className="mt-1 text-[8px] leading-snug uppercase tracking-[0.12em] text-neutral-500">{metric.label}</p>
                    </div>
                  ))}
                </div>
                <CaseStepBlock number="01" label="Problem" text={study.problem} />
                <CaseStepBlock number="02" label="Approach" text={study.system} />
                <CaseStepBlock number="03" label="Result" text={study.output} />
                {project.capabilities && (
                  <section className="rounded-[1.1rem] border border-neutral-200/85 bg-white p-4 md:p-5">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-950">What the second brain does</h4>
                    <p className="mt-3 text-[13px] leading-6 text-neutral-600">{project.body}</p>
                    <div className="mt-5 grid gap-5">
                      {project.capabilities.map((capability) => (
                        <div key={capability.title}>
                          <h5 className="text-sm font-semibold text-neutral-950">{capability.title}</h5>
                          <p className="mt-1.5 text-[13px] leading-6 text-neutral-600">{capability.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <aside className="grid content-start gap-3 rounded-[1.15rem] border border-neutral-200/80 bg-white p-4 shadow-[0_14px_45px_rgba(0,0,0,0.035)] md:rounded-[1.25rem] md:p-5">
                <div className="hidden rounded-2xl border border-teal-200 bg-teal-50 p-4 md:block">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-teal-700">For the technically curious</p>
                  <p className="mt-2 text-sm leading-6 text-teal-950">Read the problem, the design decisions and how the system works. Then explore its operational impact.</p>
                  <button type="button" onClick={() => changeView('article')} className="mt-4 min-h-[44px] w-full rounded-full bg-teal-950 px-4 py-3 text-xs font-semibold text-white transition hover:bg-teal-800">In details · Read case study ↗</button>
                  <button type="button" onClick={() => changeView('impact')} className="mt-2 min-h-[44px] w-full rounded-full border border-teal-300 bg-white px-4 py-3 text-xs font-semibold text-teal-950 transition hover:bg-teal-100">Explore impact lab</button>
                </div>
                <div className="rounded-[1rem] border border-neutral-200/80 bg-neutral-950 p-4 text-white">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/42">{project.example ? 'Example workflow' : 'decision output'}</p>
                  <p className="mt-3 text-pretty text-lg font-semibold leading-tight tracking-[-0.035em]">
                    {project.example ? 'From incoming information to coordinated work.' : 'A practical interface for a specific operational decision.'}
                  </p>
                  <p className="mt-3 text-[12px] leading-6 text-white/56">
                    {project.example ?? 'The goal is not a generic dashboard: it is a repeatable way to move from raw operational input to a usable answer.'}
                  </p>
                </div>

                {project.demo && (
                  <ModalLink href={project.demo} project={project} kind="demo">
                    Open live demo ↗
                  </ModalLink>
                )}

                <div className="border-t border-neutral-200/80 pt-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-400">stack</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                  {project.stack.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-[10px] uppercase tracking-wide text-neutral-600"
                    >
                      {item}
                    </span>
                  ))}
                  </div>
                </div>
              </aside>
            </div>
            )}
            </div>

            <div className="portfolio-dialog-footer shrink-0 grid grid-cols-1 gap-2 border-t border-neutral-200/80 bg-white/88 px-4 py-3.5 backdrop-blur-xl md:flex md:flex-wrap md:items-center md:justify-between md:gap-3 md:px-6">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-neutral-950 bg-neutral-950 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-neutral-950 active:scale-[0.98]"
              >
                Close
              </button>
              <p className="hidden max-w-md text-[12px] leading-6 text-neutral-500 md:block">
                {view === 'impact' ? 'Synthetic decision lab · no customer data or measured ROI.' : view === 'article' ? 'Anonymised case study · public design narrative.' : 'Go further: read the case study or explore the impact lab.'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
