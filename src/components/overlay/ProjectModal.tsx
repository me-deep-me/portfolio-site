'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { PROJECTS } from '@/data/projects';

interface Props {
  openId: string | null;
  onClose: () => void;
}

export function ProjectModal({ openId, onClose }: Props) {
  const project = openId ? PROJECTS.find((p) => p.id === openId) : null;

  /* Escape to close */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  /* Lock body scroll while open */
  useEffect(() => {
    if (project) document.body.style.overflow = 'hidden';
    else         document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [project]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/35 px-4 py-10 backdrop-blur-md md:items-center md:py-16"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl rounded-3xl border border-white/80 bg-white p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)] md:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-950 md:right-6 md:top-6"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {/* Header */}
            <div className="mb-3 flex items-center gap-3">
              <span className="font-mono text-xs tracking-[0.28em] text-neutral-500">
                #{project.number}
              </span>
              <span className="h-px w-8 bg-neutral-300" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                {project.cat}
              </span>
            </div>

            {/* Title */}
            <h2 className="mb-5 text-balance text-3xl font-semibold tracking-tight text-neutral-950 md:text-4xl">
              {project.title}
            </h2>

            {/* Body */}
            <p className="mb-7 text-pretty text-[15px] leading-relaxed text-neutral-600 md:text-base">
              {project.body}
            </p>

            {/* Stack */}
            <div className="mb-7">
              <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-neutral-400">Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Buttons */}
            {(project.demo || project.github) && (
              <div className="flex flex-wrap gap-3">
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
                  >
                    Live Demo
                    <span className="text-xs">↗</span>
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-500 hover:bg-neutral-50"
                  >
                    GitHub
                    <span className="text-xs">↗</span>
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
