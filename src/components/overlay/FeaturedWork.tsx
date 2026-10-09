'use client';

import { FEATURED_WORK, PROJECT_OWNERSHIP } from '@/data/project-editorial';

export function FeaturedWork({ onOpen }: { onOpen: (id: string) => void }) {
  return <section id="selected-work" className="relative z-20 mx-auto max-w-6xl scroll-mt-24 px-5 py-14 sm:py-20">
    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">Start here · Selected systems</p>
    <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]"><div><h2 className="max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">One builder. From industrial tools to connected enterprise AI.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600">{PROJECT_OWNERSHIP.detail}</p></div><p className="self-end text-xs leading-6 text-neutral-500">Three entry points, nine systems. Explore the flagship platform, the manufacturing pipeline or the quotation-to-dispatch workflow. Every project has its own case study and decision lab.</p></div>
    <div className="mt-8 grid gap-4 lg:grid-cols-2">{FEATURED_WORK.map((item, i) => <article key={item.id} className={`overflow-hidden rounded-[1.5rem] border p-5 sm:p-7 ${i === 0 ? 'border-teal-200/20 bg-slate-950 text-white lg:col-span-2' : 'border-neutral-200 bg-white text-neutral-950 shadow-[0_15px_60px_rgba(15,23,42,0.05)]'}`}>
      <p className={`font-mono text-[10px] uppercase tracking-[0.2em] ${i === 0 ? 'text-teal-200' : 'text-neutral-500'}`}>{item.eyebrow}</p>
      <div className={i === 0 ? 'mt-4 grid gap-6 lg:grid-cols-2 lg:items-center' : 'mt-4'}><div><h3 className={`text-balance font-semibold leading-tight tracking-[-0.045em] ${i === 0 ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-3xl'}`}>{item.title}</h3><p className={`mt-4 max-w-2xl text-sm leading-7 ${i === 0 ? 'text-slate-300' : 'text-neutral-600'}`}>{item.description}</p></div>{i === 0 && <div className="grid gap-2">{[{ label: 'Search', text: 'Indexed archive · semantic + keyword retrieval' }, { label: 'Connect', text: 'AI-linked business records · operational CRM/ERP' }, { label: 'Operate', text: 'One tool hub · calculations, workflows & governed agents' }].map(layer => <div key={layer.label} className="grid grid-cols-[80px_1fr] gap-3 rounded-xl border border-white/10 bg-gradient-to-r from-teal-200/5 to-violet-200/5 p-3"><span className="text-xs font-semibold text-teal-100">{layer.label}</span><span className="text-xs leading-5 text-slate-300">{layer.text}</span></div>)}</div>}</div>
      <div className="mt-6 flex flex-wrap gap-2">{item.links.map(link => <button type="button" key={link.id} onClick={() => onOpen(link.id)} className={`min-h-[44px] rounded-full border px-5 py-3 text-xs font-semibold transition ${i === 0 ? 'border-teal-200 bg-teal-200 text-slate-950 hover:bg-white' : 'border-neutral-950 bg-neutral-950 text-white hover:bg-teal-950'}`}>{link.label} ↗</button>)}</div>
    </article>)}</div>
  </section>;
}
