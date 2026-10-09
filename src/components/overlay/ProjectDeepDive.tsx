'use client';

import { useState } from 'react';
import type { Project } from '@/data/projects';
import { CASE_STUDY_ARTICLES, type CaseStudyArticle } from '@/data/case-studies';

const number = new Intl.NumberFormat('en', { maximumFractionDigits: 1 });

export function ProjectArticle({ project, onExplore }: { project: Project; onExplore: () => void }) {
  const article = CASE_STUDY_ARTICLES[project.id];
  const words = [article.standfirst, ...article.sections.map((section) => section.text)].join(' ').split(/\s+/).length;

  return (
    <article className="mx-auto w-full max-w-4xl px-5 py-7 sm:px-8 sm:py-9">
      <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
        <span>Engineering case study</span><span aria-hidden="true">/</span><span>{Math.ceil(words / 180)} min read</span>
      </div>
      <h4 className="mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.12] tracking-[-0.045em] text-neutral-950 sm:text-4xl">{article.headline}</h4>
      <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">{article.standfirst}</p>
      <p className="mt-4 text-xs leading-5 text-neutral-500">Anonymised project account · Architecture and design decisions at a public level.</p>

      <ol aria-label="System flow" className="my-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {article.flow.map((step, index) => (
          <li key={step} className="rounded-2xl border border-neutral-200 bg-white p-3 sm:p-4">
            <span className="font-mono text-[10px] text-teal-700">0{index + 1}</span>
            <p className="mt-2 text-xs font-medium leading-5 text-neutral-800">{step}</p>
          </li>
        ))}
      </ol>

      <div className="grid gap-7">
        {article.sections.map((section, index) => (
          <section key={section.title} className="grid gap-3 border-t border-neutral-200 pt-6 sm:grid-cols-[38px_1fr] sm:gap-5">
            <span aria-hidden="true" className="font-mono text-xs text-neutral-400">0{index + 1}</span>
            <div>
              <h5 className="text-lg font-semibold tracking-[-0.02em] text-neutral-950">{section.title}</h5>
              <p className="mt-3 max-w-[68ch] text-pretty text-[15px] leading-8 text-neutral-600">{section.text}</p>
            </div>
          </section>
        ))}
      </div>
      <div className="mt-9 flex flex-col gap-4 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-950">Explore the operational impact</p>
          <p className="mt-1 text-xs leading-5 text-teal-800">Change the workload assumptions and inspect the time model.</p>
        </div>
        <button type="button" onClick={onExplore} className="min-h-[44px] shrink-0 rounded-full bg-teal-950 px-5 py-3 text-xs font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700">Open impact lab ↗</button>
      </div>
    </article>
  );
}

function ImpactModel({ article }: { article: CaseStudyArticle }) {
  const initial = article.impact;
  const [volume, setVolume] = useState(initial.monthlyVolume);
  const [manual, setManual] = useState(initial.manualMinutes);
  const [assisted, setAssisted] = useState(initial.assistedMinutes);
  const [scenario, setScenario] = useState(1);
  const scenarios = [
    { label: 'More review', multiplier: 1.25, description: '25% more assisted time' },
    { label: 'Baseline', multiplier: 1, description: 'Your selected times' },
    { label: 'Smoother run', multiplier: 0.8, description: '20% less assisted time' },
  ];
  const selected = scenarios[scenario];
  const assistedTime = assisted * selected.multiplier;
  const savedMinutes = manual - assistedTime;
  const reduction = (savedMinutes / manual) * 100;
  const monthlySaved = savedMinutes * volume / 60;
  const manualHours = manual * volume / 60;
  const assistedHours = assistedTime * volume / 60;
  const maxHours = Math.max(manualHours, assistedHours, 1);
  const quarterlySaved = monthlySaved * 3;
  const maxProjection = Math.max(Math.abs(quarterlySaved), 1);
  const points = Array.from({ length: 13 }, (_, week) => `${30 + week * 40},${165 - (quarterlySaved * week / 12) / maxProjection * 110}`).join(' ');

  const reset = () => {
    setVolume(initial.monthlyVolume);
    setManual(initial.manualMinutes);
    setAssisted(initial.assistedMinutes);
    setScenario(1);
  };

  return (
    <div className="grid gap-5">
      <section className="rounded-[1.4rem] bg-slate-950 p-5 text-white sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-teal-200">Workload simulator</p>
          <span className="rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-[10px] text-amber-100">Illustrative assumptions · not measured results</span>
        </div>
        <h4 className="mt-4 text-2xl font-semibold tracking-[-0.035em]">How much work could this remove?</h4>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Explore a hypothetical month of {initial.unit}. Assisted time includes preparation and human review. The model estimates effort, not software runtime.</p>

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {[
            { label: `${initial.unit} / month`, value: volume, min: 1, max: 200, set: setVolume, suffix: '' },
            { label: 'Manual effort / unit', value: manual, min: 5, max: 240, set: setManual, suffix: ' min' },
            { label: 'Assisted effort / unit', value: assisted, min: 5, max: 240, set: setAssisted, suffix: ' min' },
          ].map((input) => (
            <label key={input.label} className="block">
              <span className="flex items-start justify-between gap-2 text-xs text-slate-300"><span>{input.label}</span><span className="shrink-0 font-mono text-white">{input.value}{input.suffix}</span></span>
              <input type="range" min={input.min} max={input.max} value={input.value} onChange={(event) => input.set(Number(event.target.value))} className="mt-1 h-[44px] w-full cursor-pointer accent-teal-300" />
            </label>
          ))}
        </div>
        <div aria-label="Review effort scenario" className="mt-5 flex flex-wrap gap-2">
          {scenarios.map((item, index) => (
            <button key={item.label} type="button" aria-pressed={scenario === index} onClick={() => setScenario(index)} className={`min-h-[44px] rounded-full border px-4 py-2 text-xs transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300 ${scenario === index ? 'border-teal-200 bg-teal-200 text-slate-950' : 'border-white/20 bg-white/5 text-white hover:bg-white/10'}`}>{item.label}</button>
          ))}
          <button type="button" onClick={reset} className="ml-auto min-h-[44px] rounded-full px-3 py-2 text-xs text-slate-300 underline underline-offset-4 hover:text-white">Reset</button>
        </div>
        <p className="mt-3 text-xs text-slate-400">{selected.description}. Scenario adjustments apply only to assisted effort.</p>
        <div aria-live="polite" aria-atomic="true" className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { value: `${number.format(reduction)}%`, label: 'Modelled effort reduction' },
            { value: `${number.format(monthlySaved)} h`, label: 'Net hours saved / month' },
            { value: `${number.format(savedMinutes)} min`, label: 'Net time saved / unit' },
            { value: `${number.format(quarterlySaved)} h`, label: '12-week projection' },
          ].map((metric) => (
            <div key={metric.label} className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="break-words font-mono text-2xl tracking-[-0.045em] text-teal-100 sm:text-3xl">{metric.value}</p>
              <p className="mt-2 text-[11px] leading-5 text-slate-400">{metric.label}</p>
            </div>
          ))}
        </div>
        {savedMinutes < 0 && <p className="mt-4 text-sm text-amber-200">With these assumptions, assisted work takes longer. Negative savings represent additional effort.</p>}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h5 className="text-sm font-semibold text-neutral-950">Monthly effort comparison</h5>
          <p className="mt-1 text-xs leading-5 text-neutral-500">Hours at the selected workload · lower is less effort</p>
          <div className="mt-6 grid gap-5">
            {[{ label: 'Manual workflow', hours: manualHours, color: 'bg-slate-400' }, { label: 'With the system', hours: assistedHours, color: 'bg-teal-600' }].map((bar) => (
              <div key={bar.label}>
                <div className="mb-2 flex justify-between gap-2 text-xs text-neutral-600"><span>{bar.label}</span><span className="font-mono text-neutral-950">{number.format(bar.hours)} h</span></div>
                <div aria-hidden="true" className="h-4 overflow-hidden rounded-full bg-neutral-100"><div style={{ width: `${bar.hours / maxHours * 100}%` }} className={`h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none ${bar.color}`} /></div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs leading-5 text-neutral-500">{initial.boundary}</p>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h5 className="text-sm font-semibold text-neutral-950">Cumulative time projection</h5>
          <p className="mt-1 text-xs leading-5 text-neutral-500">Constant workload · 4 weeks per modelled month</p>
          <svg viewBox="0 0 540 310" role="img" aria-label={`Cumulative net time saving after 12 weeks: ${number.format(quarterlySaved)} hours`} className="mt-2 w-full">
            <title>Illustrative cumulative savings over 12 weeks</title>
            <desc>Linear projection at a constant workload, with no adoption ramp or seasonality. Negative values indicate additional effort.</desc>
            {[55, 165, 275].map((y) => <line key={y} x1="30" x2="510" y1={y} y2={y} stroke="#e5e5e5" strokeDasharray="4 5" />)}
            <polyline points={points} fill="none" stroke={savedMinutes < 0 ? '#b45309' : '#0d9488'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="510" cy={165 - quarterlySaved / maxProjection * 110} r="5" fill={savedMinutes < 0 ? '#b45309' : '#0d9488'} />
            <text x="30" y="155" fontSize="12" fill="#737373">0 h</text>
            <text x="500" y={savedMinutes >= 0 ? 40 : 295} textAnchor="end" fontSize="14" fill="#171717">{number.format(quarterlySaved)} h</text>
            {[0, 4, 8, 12].map((week) => <text key={week} x={30 + week * 40} y="308" textAnchor="middle" fontSize="12" fill="#737373">W{week}</text>)}
          </svg>
        </section>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h5 className="text-sm font-semibold text-neutral-950">Sensitivity to review effort</h5>
        <p className="mt-1 text-xs leading-5 text-neutral-500">Three what-if cases, not a statistical confidence interval or a measured sample.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {scenarios.map((item, index) => {
            const hours = (manual - assisted * item.multiplier) * volume / 60;
            return <button key={item.label} type="button" aria-pressed={index === scenario} onClick={() => setScenario(index)} className={`rounded-xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 ${index === scenario ? 'border-teal-600 bg-teal-50' : 'border-neutral-200 hover:border-teal-400'}`}><span className="block text-xs text-neutral-600">{item.label}</span><span className="mt-2 block font-mono text-xl text-neutral-950">{number.format(hours)} h / month</span><span className="mt-2 block text-[11px] text-neutral-500">{item.description}</span></button>;
          })}
        </div>
      </section>
      <p className="text-xs leading-6 text-neutral-500">Method: (manual minutes − assisted minutes × scenario factor) × monthly volume ÷ 60. Defaults are fictional workload assumptions for exploration. They do not represent client data, measured savings or a guaranteed outcome.</p>
    </div>
  );
}

export function ProjectImpactDashboard({ project }: { project: Project }) {
  const article = CASE_STUDY_ARTICLES[project.id];
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-7 sm:py-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">Impact lab / {project.title}</p>
      <div className="mt-4"><ImpactModel key={project.id} article={article} /></div>
      <h4 className="mb-3 mt-7 text-sm font-semibold text-neutral-950">System profile</h4>
      <div className="grid gap-3 sm:grid-cols-3">
        {article.signals.map((signal) => (
          <div key={signal.label} className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="font-mono text-2xl tracking-[-0.04em] text-neutral-950">{signal.value}</p>
            <p className="mt-2 text-xs font-semibold text-neutral-800">{signal.label}</p>
            <p className="mt-1 text-xs leading-5 text-neutral-500">{signal.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
