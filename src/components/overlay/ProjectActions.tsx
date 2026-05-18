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
    ? 'px-3 py-2 text-[10px]'
    : 'px-4 py-2.5 text-[11px]';

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onOpen}
        className={`${buttonBase} rounded-full border border-neutral-950 bg-neutral-950 font-medium uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-neutral-950`}
      >
        Details
      </button>
      {project.demo && (
        <a
          href={project.demo}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => openPopup(event, project.demo!, `${project.id}-demo`)}
          className={`${buttonBase} rounded-full border border-neutral-200 bg-white/75 font-medium uppercase tracking-[0.18em] text-neutral-700 transition hover:border-neutral-950/30 hover:text-neutral-950`}
        >
          Demo ↗
        </a>
      )}
    </div>
  );
}
