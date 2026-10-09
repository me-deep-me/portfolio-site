import { PROJECT_OWNERSHIP } from '@/data/project-editorial';

export function ProjectOwnership() {
  return <div className="rounded-2xl border border-neutral-200 bg-white p-4">
    <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-900">{PROJECT_OWNERSHIP.status}</span><span className="text-xs font-semibold text-neutral-800">My role · {PROJECT_OWNERSHIP.role}</span></div>
    <p className="mt-2 text-xs leading-6 text-neutral-500">{PROJECT_OWNERSHIP.detail}</p>
  </div>;
}
