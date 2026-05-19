'use client';

import type { MouseEvent } from 'react';
import type { Project } from '@/data/projects';

interface Props {
  project: Project;
  onOpen: () => void;
  compact?: boolean;
}

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

export function ProjectActions({ project, onOpen, compact = false }: Props) {
  const buttonBase = compact
    ? 'justify-center px-3 py-2.5 text-[10px] min-h-10'
    : 'px-4 py-2.5 text-[11px]';

  return (
    <div className={compact ? (project.demo ? 'mt-4 grid grid-cols-2 gap-2' : 'mt-4 flex flex-wrap items-center gap-2') : 'mt-6 flex flex-wrap items-center gap-2'}>
      <button
        type="button"
        onClick={onOpen}
        className={`${buttonBase} inline-flex rounded-full border border-neutral-950 bg-neutral-950 font-medium uppercase tracking-[0.18em] text-white shadow-[0_12px_34px_rgba(0,0,0,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-neutral-950 active:translate-y-0 active:scale-[0.98]`}
      >
        Details
      </button>
      {project.demo && (
        <a
          href={project.demo}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => openPopup(event, project.demo!, `${project.id}-demo`)}
          className={`${buttonBase} inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/85 font-medium uppercase tracking-[0.18em] text-emerald-950 shadow-[0_12px_34px_rgba(16,185,129,0.12)] transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400/60 hover:bg-white active:translate-y-0 active:scale-[0.98]`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.75)]" />
          Live demo
        </a>
      )}
    </div>
  );
}
