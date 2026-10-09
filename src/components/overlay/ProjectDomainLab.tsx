'use client';

import { useState, type ReactNode } from 'react';
import { contactModel, crateModel, freightModel, loadModel, reportModel, scheduleModel, sheetModel } from '@/data/lab-models';

const format = new Intl.NumberFormat('en', { maximumFractionDigits: 1 });
const button = 'min-h-[44px] rounded-full border px-4 py-2 text-xs font-semibold transition';

function Lab({ title, description, children, boundary }: { title: string; description: string; children: ReactNode; boundary: string }) {
  return <section aria-label={title} className="space-y-5 rounded-[1.4rem] border border-slate-800 bg-slate-950 p-4 text-white sm:p-6">
    <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[10px] uppercase tracking-[0.2em] text-teal-200">Decision lab</span><span className="rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-[10px] text-amber-100">Synthetic demo · not measured results</span></div>
    <div><h4 className="text-balance text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{title}</h4><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{description}</p></div>
    {children}
    <p className="border-t border-white/10 pt-4 text-xs leading-6 text-slate-400">{boundary}</p>
  </section>;
}

function Range({ label, value, min, max, step = 1, unit = '', onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (value: number) => void }) {
  return <label className="block rounded-xl border border-white/10 bg-white/5 px-4 pt-3"><span className="flex justify-between gap-3 text-xs text-slate-300"><span>{label}</span><span className="shrink-0 font-mono text-white">{value}{unit}</span></span><input type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))} className="h-[44px] w-full cursor-pointer accent-teal-300" /></label>;
}

function Choices({ label, options, selected, onChange }: { label: string; options: string[]; selected: number; onChange: (index: number) => void }) {
  return <div><p className="mb-2 text-xs text-slate-400">{label}</p><div role="group" aria-label={label} className="flex flex-wrap gap-2">{options.map((option, index) => <button key={option} type="button" aria-pressed={selected === index} onClick={() => onChange(index)} className={`${button} ${selected === index ? 'border-teal-200 bg-teal-200 text-slate-950' : 'border-white/20 bg-white/5 text-slate-200 hover:bg-white/10'}`}>{option}</button>)}</div></div>;
}

function Metrics({ items }: { items: { label: string; value: string | number }[] }) {
  return <div aria-live="polite" aria-atomic="true" data-testid="domain-metrics" className="grid grid-cols-2 gap-2 sm:gap-3">{items.map(item => <div key={item.label} className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4"><p className="break-words font-mono text-2xl tracking-[-0.05em] text-teal-100">{item.value}</p><p className="mt-2 text-xs leading-5 text-slate-400">{item.label}</p></div>)}</div>;
}

function Bar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  return <div><div className="mb-2 flex justify-between gap-3 text-xs text-slate-300"><span>{label}</span><span>{format.format(value)}{max === 100 ? '%' : ''}</span></div><div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-teal-300 transition-[width] motion-reduce:transition-none" style={{ width: `${Math.max(0, Math.min(100, value / max * 100))}%` }} /></div></div>;
}

function NestLab() {
  const [quantity, setQuantity] = useState(16), [rotate, setRotate] = useState(0), [gap, setGap] = useState(5);
  const result = sheetModel(quantity, rotate === 1, gap);
  return <Lab title="Material utilisation & sheet planning" description="Change the batch size, spacing and orientation policy. Inspect how a simple public shelf layout translates panel demand into sheet use." boundary="Synthetic rectangles on 2440 × 1220 mm sheets. This is a deliberately simple shelf heuristic, not the project's production optimiser. Unused area includes gaps and offcuts; it is not a reusable-remnant estimate.">
    <div className="grid gap-3 sm:grid-cols-2"><Range label="Panels in batch" value={quantity} min={4} max={32} onChange={setQuantity} /><Range label="Inter-panel gap" value={gap} min={0} max={20} unit=" mm" onChange={setGap} /></div>
    <Choices label="Orientation policy" options={['Fixed orientation', 'Allow rotation']} selected={rotate} onChange={setRotate} />
    <Metrics items={[{ label: 'Sheets in this demo', value: result.sheets }, { label: 'Material utilisation', value: `${format.format(result.utilisation)}%` }, { label: 'Unused sheet area', value: `${format.format(100 - result.utilisation)}%` }, { label: 'Panels placed', value: result.placements.length }]} />
    <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: Math.min(4, result.sheets) }, (_, sheet) => <figure key={sheet} className="rounded-xl border border-white/15 bg-white/5 p-3"><figcaption className="mb-2 text-xs text-slate-300">Sheet {sheet + 1} · scaled layout</figcaption><svg viewBox="0 0 2440 1220" className="w-full" role="img" aria-label={`Synthetic panel layout on sheet ${sheet + 1}`}><rect width="2440" height="1220" fill="#1e293b" stroke="#64748b" strokeWidth="12" />{result.placements.filter(panel => panel.sheet === sheet).map(panel => <g key={panel.id}><rect x={panel.x} y={panel.y} width={panel.width} height={panel.height} fill={panel.id % 2 ? '#a5b4fc' : '#99f6e4'} stroke="#0f172a" strokeWidth="6" /><text x={panel.x + 30} y={panel.y + 80} fontSize="60" fill="#0f172a">P{panel.id + 1}</text></g>)}</svg></figure>)}</div>
    {result.sheets > 4 && <p className="text-xs text-slate-400">Showing the first four sheets. Metrics include the complete batch.</p>}
  </Lab>;
}

function CargoLab() {
  const [quantity, setQuantity] = useState(30), [size, setSize] = useState(0), [allowance, setAllowance] = useState(10);
  const result = freightModel(quantity, size === 1, allowance), alternative = freightModel(quantity, size !== 1, allowance);
  return <Lab title="Quotation-stage freight scenarios" description="Explore how shipment assumptions affect a container allowance before final packing dimensions exist." boundary="Volume-only teaching model: each synthetic unit starts at 1.35 m³; capacity is 33 or 67 m³ with a fixed 20% planning reserve. No dimensional placement, freight rates or physical feasibility is calculated. The real system evaluates physical loading separately.">
    <div className="grid gap-3 sm:grid-cols-2"><Range label="Shipping units" value={quantity} min={5} max={80} onChange={setQuantity} /><Range label="Packaging allowance" value={allowance} min={0} max={30} unit="%" onChange={setAllowance} /></div>
    <Choices label="Container scenario" options={['Smaller container', 'Larger container']} selected={size} onChange={setSize} />
    <Metrics items={[{ label: 'Scenario volume', value: `${format.format(result.volume)} m³` }, { label: 'Volume-budget containers', value: result.containers }, { label: 'Average volume utilisation', value: `${format.format(result.utilisation)}%` }, { label: 'Alternative size · containers', value: alternative.containers }]} />
    <div className="grid gap-4 rounded-2xl border border-white/10 p-4"><Bar label="Selected scenario · average volume utilisation" value={result.utilisation} /><Bar label="Alternative size · average volume utilisation" value={alternative.utilisation} /></div>
    <p className="text-sm leading-6 text-slate-300">The smallest container count is not automatically the best freight decision. Actual crate geometry, route availability and carrier terms belong in the next review.</p>
  </Lab>;
}

function LoadLab() {
  const [quantity, setQuantity] = useState(18), [size, setSize] = useState(0), [oversized, setOversized] = useState(0);
  const result = loadModel(quantity, size === 1, oversized === 1);
  return <Lab title="Confirmed shipment exception checks" description="Unlike the commercial estimate, this lab begins with identified shipping units. See which items pass a coarse dimensional, payload and volume screen." boundary="Synthetic crates. Green means within these screening limits, not a feasible 3D load. Length checks assume longitudinal placement; width, height, stacking, securing and load distribution are intentionally omitted. This does not replace the real loading solver.">
    <Range label="Confirmed crates" value={quantity} min={5} max={40} onChange={setQuantity} />
    <Choices label="Transport envelope" options={['Smaller container', 'Larger container']} selected={size} onChange={setSize} />
    <Choices label="Packing-list fixture" options={['Standard crates', 'Include long crates']} selected={oversized} onChange={setOversized} />
    <Metrics items={[{ label: 'Within screening limits', value: result.included }, { label: 'Exceptions to inspect', value: quantity - result.included }, { label: 'Screened volume utilisation', value: `${format.format(result.utilisation)}%` }, { label: 'Screened payload', value: `${format.format(result.weight / 1000)} t` }]} />
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8" aria-label="Crate screening results">{result.rows.map(row => <div key={row.id} className={`rounded-xl border p-2 text-center ${row.included ? 'border-teal-300/30 bg-teal-300/10 text-teal-100' : 'border-amber-300/30 bg-amber-300/10 text-amber-100'}`}><span className="font-mono text-xs">{row.id}</span><span className="mt-1 block text-[9px]">{row.included ? 'Screened' : 'Review'}</span></div>)}</div>
    <ul className="space-y-2 text-xs leading-5 text-amber-100">{result.rows.filter(row => !row.included).slice(0, 5).map(row => <li key={row.id}>{row.id} · {row.reason}</li>)}</ul>
  </Lab>;
}

function DoorLab() {
  const [quantity, setQuantity] = useState(14), [weight, setWeight] = useState(230), [formatChoice, setFormatChoice] = useState(0);
  const result = crateModel(quantity, weight, formatChoice === 1);
  return <Lab title="Packaging weight & grouping trade-offs" description="Compare a crate and pallet grouping under a weight ceiling. The proposal updates as a handling constraint changes." boundary="Synthetic 45 kg assemblies, 50 kg crate tare or 30 kg pallet tare, with four or six nominal slots. This illustrates weight/grouping only: no proprietary product decoding, dimensions, stability or fabrication rules are reproduced.">
    <div className="grid gap-3 sm:grid-cols-2"><Range label="Assemblies to package" value={quantity} min={4} max={30} onChange={setQuantity} /><Range label="Gross package weight ceiling" value={weight} min={100} max={400} step={10} unit=" kg" onChange={setWeight} /></div>
    <Choices label="Packaging format" options={['Crates', 'Pallets']} selected={formatChoice} onChange={setFormatChoice} />
    <Metrics items={[{ label: 'Packages proposed', value: result.packages.length }, { label: 'Maximum assemblies / package', value: result.perPackage }, { label: 'Gross shipment weight', value: `${result.totalWeight} kg` }, { label: 'Heaviest package', value: `${Math.max(...result.packages.map(row => row.weight))} kg` }]} />
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{result.packages.map((row, i) => <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-slate-400">Package {i + 1}</p><div className="my-3 flex flex-wrap gap-1" aria-hidden="true">{Array.from({ length: row.units }, (_, unit) => <span key={unit} className="h-8 w-3 rounded bg-violet-200" />)}</div><p className="font-mono text-sm">{row.units} units · {row.weight} kg</p></div>)}</div>
  </Lab>;
}

function GanttLab() {
  const [capacity, setCapacity] = useState(8), [priority, setPriority] = useState(0), [due, setDue] = useState(5);
  const result = scheduleModel(capacity, priority === 1, due);
  return <Lab title="Resource load & priority replanning" description="Move an urgent job ahead of the queue and adjust daily capacity. Inspect the effect on its completion date and the overall plan." boundary="Six synthetic jobs on three independent resources, starting at day zero. Durations are rounded up to working days. This public example omits calendars, dependencies, setup times and the production workbook's scheduling rules. Utilisation uses the full makespan as its horizon.">
    <div className="grid gap-3 sm:grid-cols-2"><Range label="Daily capacity / resource" value={capacity} min={4} max={12} unit=" h" onChange={setCapacity} /><Range label="Priority job due day" value={due} min={2} max={10} onChange={setDue} /></div>
    <Choices label="Priority policy" options={['Original queue', 'Urgent job first']} selected={priority} onChange={setPriority} />
    <Metrics items={[{ label: 'Plan finishes · day', value: result.finish }, { label: 'Priority job finishes · day', value: result.priorityEnd }, { label: 'Priority lateness', value: `${result.late} days` }, { label: 'Horizon capacity utilisation', value: `${format.format(result.load)}%` }]} />
    <div className="space-y-4 rounded-xl border border-white/10 p-3"><p className="text-xs text-slate-400">Timeline · day 0 → {result.finish}</p>{[0, 1, 2].map(resource => <div key={resource}><p className="mb-2 text-xs text-slate-300">Resource {resource + 1}</p><div className="relative h-10 rounded bg-white/5">{result.rows.filter(job => job.resource === resource).map(job => <div key={job.id} className={`absolute flex h-10 items-center justify-center overflow-hidden rounded border border-slate-950 px-1 text-[10px] font-semibold text-slate-950 ${job.id === 'Priority job' ? 'bg-amber-200' : 'bg-teal-200'}`} style={{ left: `${job.start / result.finish * 100}%`, width: `${(job.end - job.start) / result.finish * 100}%` }} title={`${job.id}: day ${job.start}–${job.end}`}>{job.id}</div>)}</div></div>)}</div>
    <p className="text-xs leading-6 text-slate-300">Giving one job priority changes who waits. It does not create additional resource capacity.</p>
  </Lab>;
}

function DataLab() {
  const [normalise, setNormalise] = useState(0), [duplicates, setDuplicates] = useState(0);
  const result = contactModel(normalise === 1, duplicates === 1);
  return <Lab title="Contact quality & review readiness" description="Start with a deliberately imperfect archive. Toggle normalisation and exact-match duplicate screening to see how many records become suitable for review." boundary="Twenty-four synthetic records using example.test addresses. Duplicate candidates are flagged, never merged. Readiness measures only this fixture's formatting and matching checks; it does not verify real identities, deliverability or data freshness.">
    <Choices label="Field normalisation" options={['Original fields', 'Trim & lowercase']} selected={normalise} onChange={setNormalise} />
    <Choices label="Duplicate screening" options={['No screening', 'Flag exact matches']} selected={duplicates} onChange={setDuplicates} />
    <Metrics items={[{ label: 'Ready for review', value: result.ready }, { label: 'Formatting / matching readiness', value: `${format.format(result.readiness)}%` }, { label: 'Missing email addresses', value: result.missing }, { label: 'Duplicate candidates', value: result.duplicates }]} />
    <div className="space-y-2">{result.rows.filter(row => row.status !== 'Ready for review').slice(0, 6).map(row => <div key={row.id} className="flex flex-wrap justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs"><span>{row.id} · {row.company}</span><span className="text-amber-200">{row.status}</span></div>)}</div>
    <p className="text-xs text-slate-400">Showing up to six exceptions. All 24 records contribute to the counters.</p>
  </Lab>;
}

const evidenceCases = [
  { question: 'What is the next step for Project Atlas?', answer: 'Review the synthetic feasibility note before preparing the client briefing.', sources: ['Project Atlas · reviewed update', 'Feasibility note · revision 2'], claims: 2 },
  { question: 'What changed in the latest technical revision?', answer: 'The synthetic revision changes the capacity assumption; the previous summary must be reviewed.', sources: ['Technical note · revision 3', 'Revision comparison · 2 → 3'], claims: 2 },
  { question: 'Has the client approved the final proposal?', answer: '', sources: [], claims: 1 },
];

function RagLab() {
  const [question, setQuestion] = useState(0), [sources, setSources] = useState(0);
  const fixture = evidenceCases[question], supported = sources === 0 && fixture.sources.length > 0;
  return <Lab title="Evidence coverage & answer boundaries" description="Inspect a sourced answer, remove its supporting evidence or ask a question the collection cannot answer. The important behaviour is knowing when not to claim certainty." boundary="Scripted questions and answers over synthetic evidence. No live LLM, retrieval benchmark or accuracy measurement runs here. Claim support is defined by the fixture, not scored by an AI model. Evidence coverage is not the same as correctness.">
    <Choices label="Research question" options={['Next project step', 'Revision change', 'Client approval']} selected={question} onChange={setQuestion} />
    <Choices label="Evidence availability" options={['Sources available', 'Remove supporting sources']} selected={sources} onChange={setSources} />
    <Metrics items={[{ label: 'Supporting source records', value: supported ? fixture.sources.length : 0 }, { label: 'Supported fixture claims', value: `${supported ? fixture.claims : 0} / ${fixture.claims}` }, { label: 'Fixture evidence coverage', value: supported ? '100%' : '0%' }, { label: 'Response behaviour', value: supported ? 'Sourced' : 'Abstain' }]} />
    <div className="rounded-2xl border border-teal-200/20 bg-teal-200/5 p-4"><p className="text-xs text-teal-200">{fixture.question}</p><p className="mt-3 text-sm leading-7">{supported ? fixture.answer : 'The available evidence is insufficient. Check the original records or request human confirmation before answering.'}</p>{supported && <ul className="mt-4 space-y-2 border-t border-white/10 pt-3 text-xs text-slate-300">{fixture.sources.map(source => <li key={source}>↗ {source}</li>)}</ul>}</div>
  </Lab>;
}

function MicroLab() {
  const [batches, setBatches] = useState(3), [view, setView] = useState(0);
  const result = reportModel(batches), max = Math.max(...result.groups.map(group => view === 0 ? group.count : group.amount));
  return <Lab title="From raw exports to a reviewable report" description="Follow one concrete automation: validate synthetic exports, separate missing values and repeated rows, then generate an aggregate report." boundary="Each synthetic export has 12 rows. Duplicate IDs are removed before checking missing amounts; exceptions are kept separate from the valid aggregate. Amounts use arbitrary demo units, not revenue or client financial data. This does not estimate runtime or business outcomes.">
    <Range label="Recurring exports" value={batches} min={1} max={12} onChange={setBatches} />
    <Metrics items={[{ label: 'Incoming rows', value: result.input }, { label: 'Rows in reviewed aggregate', value: result.clean }, { label: 'Duplicate rows removed', value: result.duplicates }, { label: 'Missing-value exceptions', value: result.exceptions }]} />
    <ol aria-label="Report transformation" className="grid grid-cols-2 gap-2 sm:grid-cols-4">{['Import exports', 'Validate fields', 'Separate exceptions', 'Aggregate report'].map((stage, i) => <li key={stage} className="rounded-xl border border-white/10 bg-white/5 p-3"><span className="font-mono text-xs text-teal-200">0{i + 1}</span><p className="mt-2 text-xs leading-5">{stage}</p></li>)}</ol>
    <Choices label="Report perspective" options={['Valid record count', 'Aggregated demo units']} selected={view} onChange={setView} />
    <div className="space-y-4">{result.groups.map(group => <Bar key={group.team} label={group.team} value={view === 0 ? group.count : group.amount} max={max} />)}</div>
  </Lab>;
}

const brainEvents = [
  { label: 'Project email', source: 'Synthetic message · Project Atlas', fact: 'The partner has requested an updated project briefing.', work: 'Link the update to the project history and prepare a reviewed next step.', analysis: 'Connect the request to the latest project evidence and surface missing inputs.', action: 'Apply an internal project-history update', external: false, linked: 4 },
  { label: 'Energy document', source: 'Synthetic bill · Asset North', fact: 'A new consumption period is available for the project.', work: 'Attach the evidence to the asset and refresh the analysis task.', analysis: 'Run the versioned deterministic consumption scenario; AI explains the output, not the formula.', action: 'Publish a feasibility report to the client', external: true, linked: 5 },
  { label: 'Market signal', source: 'Synthetic public notice · Opportunity Delta', fact: 'A new opportunity matches the selected project context.', work: 'Create a reviewable opportunity record linked to relevant projects.', analysis: 'Compare dated source information with known requirements and project context.', action: 'Submit an external application', external: true, linked: 3 },
];

function BrainLab() {
  const [event, setEvent] = useState(0), [autonomy, setAutonomy] = useState(1), [applied, setApplied] = useState(false), [approved, setApproved] = useState(false);
  const fixture = brainEvents[event];
  const changeEvent = (next: number) => { setEvent(next); setApplied(false); setApproved(false); };
  const changeAutonomy = (next: number) => { setAutonomy(next); setApplied(false); setApproved(false); };
  const canApply = autonomy === 2 && (!fixture.external || approved);
  const status = applied ? 'Applied · logged' : autonomy === 0 ? 'Observed' : fixture.external && autonomy === 2 && !approved ? 'Approval required' : autonomy === 1 ? 'Proposed' : 'Ready · reversible';
  return <Lab title="Connected company intelligence & governed action" description="Not just question answering: follow a new event through company memory, operational work, domain analysis and a permission-bounded action. Every layer shares the same context." boundary="Scripted, synthetic platform walkthrough. It illustrates system responsibilities and an autonomy policy, not a live agent or an ROI benchmark. Applying or undoing affects only this local demonstration. External actions remain approval-gated; no messages, files or applications are sent.">
    <Choices label="Incoming event" options={brainEvents.map(item => item.label)} selected={event} onChange={changeEvent} />
    <Choices label="Capability autonomy" options={['Observe', 'Propose', 'Act with undo']} selected={autonomy} onChange={changeAutonomy} />
    <Metrics items={[{ label: 'Connected context types in this fixture', value: fixture.linked }, { label: 'Cooperating platform layers', value: 3 }, { label: 'Action state', value: status }, { label: 'Evidence trail', value: 'Source-linked' }]} />
    <div className="grid gap-3 sm:grid-cols-2">{[{ layer: '01 · System of record', title: 'Company memory', text: fixture.fact }, { layer: '02 · System of work', title: 'Operational continuity', text: fixture.work }, { layer: '03 · System of intelligence', title: 'Reasoning + explicit engines', text: fixture.analysis }, { layer: 'Control plane', title: 'Permission-bounded execution', text: autonomy === 0 ? 'Observe the event without proposing or applying an action.' : fixture.action }].map(card => <div key={card.layer} className="rounded-2xl border border-teal-200/15 bg-gradient-to-br from-teal-200/5 to-violet-200/5 p-4"><p className="font-mono text-[10px] text-teal-200">{card.layer}</p><h5 className="mt-3 text-sm font-semibold">{card.title}</h5><p className="mt-2 text-xs leading-6 text-slate-300">{card.text}</p></div>)}</div>
    <div className="rounded-xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">Evidence · {fixture.source}</p><p className="mt-2 text-sm leading-6">{fixture.external ? 'This action crosses the organisation boundary. Human approval is required.' : 'This fixture changes an internal record. The proposed update remains inspectable and reversible.'}</p><div className="mt-4 flex flex-wrap gap-2">{fixture.external && autonomy === 2 && !approved && <button type="button" className={`${button} border-amber-200/40 bg-amber-200/10 text-amber-100`} onClick={() => setApproved(true)}>Approve demo action</button>}<button type="button" disabled={!canApply || applied} onClick={() => setApplied(true)} className={`${button} border-teal-200 bg-teal-200 text-slate-950 disabled:cursor-not-allowed disabled:opacity-40`}>Apply demo action</button><button type="button" disabled={!applied} onClick={() => { setApplied(false); setApproved(false); }} className={`${button} border-white/20 text-white disabled:cursor-not-allowed disabled:opacity-40`}>Undo demo action</button></div><p aria-live="polite" className="mt-3 text-xs text-teal-200">{applied ? 'Demo audit entry recorded. The action can be undone.' : status}</p></div>
  </Lab>;
}

export function ProjectDomainLab({ projectId }: { projectId: string }) {
  const [revision, setRevision] = useState(0);
  const labs: Record<string, ReactNode> = { nest: <NestLab />, cargo: <CargoLab />, load: <LoadLab />, door: <DoorLab />, gantt: <GanttLab />, db: <DataLab />, rag: <RagLab />, micro: <MicroLab />, cerbrain: <BrainLab /> };
  return <div><div key={revision}>{labs[projectId] ?? null}</div><button type="button" onClick={() => setRevision(value => value + 1)} className="mt-3 min-h-[44px] rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-600 hover:border-teal-600 hover:text-teal-800">Reset decision lab</button></div>;
}
