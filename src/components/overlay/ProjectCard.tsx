'use client';

import { motion } from 'framer-motion';
import type { Project } from '@/data/projects';

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

function smoothstep(e0: number, e1: number, v: number) {
  const x = clamp((v - e0) / (e1 - e0));
  return x * x * (3 - 2 * x);
}

interface Props {
  project: Project;
  index: number;
  total: number;
  progress: number;
  onOpen: () => void;
}

export function ProjectCard({ project, index, total, progress, onOpen }: Props) {
  const isLeft = index % 2 === 0;

  const trigger      = 0.06 + index * 0.105;
  const fadeInEnd    = trigger + 0.045;
  const fadeOutStart = trigger + 0.085;
  const fadeOutEnd   = trigger + 0.135;

  const visible =
    smoothstep(trigger, fadeInEnd, progress) *
    (1 - smoothstep(fadeOutStart, fadeOutEnd, progress));

  const maxSlotSpread =
    typeof window !== 'undefined' ? Math.min(190, window.innerHeight * 0.24) : 190;
  const normalizedIndex = total > 1 ? index / (total - 1) : 0.5;
  const slotY     = -maxSlotSpread + normalizedIndex * maxSlotSpread * 2;
  const entranceX = isLeft ? -34 + visible * 34 : 34 - visible * 34;
  const entranceY = slotY + (1 - visible) * 14;

  return (
    <motion.article
      onClick={visible > 0.45 ? onOpen : undefined}
      className={`absolute top-1/2 z-20 w-[min(340px,34vw)] cursor-pointer rounded-3xl border border-white/80 bg-white/55 px-5 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-shadow hover:shadow-[0_30px_90px_rgba(0,0,0,0.14)] ${
        isLeft ? 'right-[calc(50%+108px)]' : 'left-[calc(50%+108px)]'
      }`}
      style={{
        opacity: visible,
        transform: `translate3d(${entranceX}px, ${entranceY}px, 0)`,
        pointerEvents: visible > 0.45 ? 'auto' : 'none',
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="font-mono text-xs tracking-[0.28em] text-neutral-500">
          {project.number}
        </span>
        <span className="h-px flex-1 bg-neutral-200" />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400 max-w-[120px] truncate">
          {project.cat.split(' · ')[0]}
        </span>
      </div>

      <h3 className="text-balance text-base font-medium tracking-tight text-neutral-950 md:text-lg">
        {project.title}
      </h3>

      <p className="mt-2 text-pretty text-[13px] leading-snug text-neutral-600 line-clamp-3">
        {project.shortDesc}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.pills.slice(0, 3).map((pill) => (
          <span
            key={pill.label}
            className={`rounded-full border px-3 py-1 text-[10px] tracking-wide uppercase ${
              pill.hi
                ? 'border-neutral-900/20 bg-neutral-900/5 text-neutral-900'
                : 'border-neutral-200 bg-white/70 text-neutral-700'
            }`}
          >
            {pill.label}
          </span>
        ))}
      </div>
    </motion.article>
  );
}
