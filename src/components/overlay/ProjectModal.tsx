'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSceneStore } from '@/store/sceneStore';
import { PROJECTS } from '@/data/projects';

export function ProjectModal() {
  const openProjectId   = useSceneStore((s) => s.openProjectId);
  const setOpenProject  = useSceneStore((s) => s.setOpenProjectId);
  const project         = PROJECTS.find((p) => p.id === openProjectId) ?? null;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenProject(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setOpenProject]);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = openProjectId ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [openProjectId]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => setOpenProject(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(7,16,28,0.92)',
            backdropFilter: 'blur(20px)',
            zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <motion.div
            key="modal-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg3)',
              border: '1px solid var(--border2)',
              borderRadius: '1.2rem',
              padding: '2.8rem 3rem 2.5rem',
              maxWidth: 640,
              width: '100%',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setOpenProject(null)}
              aria-label="Close"
              style={{
                position: 'absolute', top: '1.4rem', right: '1.4rem',
                background: 'none',
                border: '1px solid var(--border2)',
                borderRadius: '50%',
                color: 'var(--ink3)',
                width: 32, height: 32,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                fontFamily: 'var(--fb)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--sky)';
                e.currentTarget.style.color = 'var(--sky)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border2)';
                e.currentTarget.style.color = 'var(--ink3)';
              }}
            >
              ✕
            </button>

            {/* Category */}
            <div style={{
              fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--sky)', marginBottom: '0.7rem', fontWeight: 500,
            }}>
              {project.cat}
            </div>

            {/* Title */}
            <h3 style={{
              fontFamily: 'var(--fd)',
              fontSize: '2.2rem',
              letterSpacing: '-0.02em',
              marginBottom: '1.1rem',
              lineHeight: 1,
            }}>
              {project.title}
            </h3>

            {/* Body */}
            <p style={{
              fontSize: '0.93rem',
              color: 'var(--ink2)',
              lineHeight: 1.84,
              marginBottom: '1.7rem',
            }}>
              {project.body}
            </p>

            {/* Demo disclaimer */}
            {project.demo && (
              <div style={{
                fontSize: '0.75rem',
                color: 'rgba(221,230,242,0.42)',
                lineHeight: 1.65,
                borderLeft: '2px solid rgba(106,174,232,0.3)',
                padding: '0.5rem 0.9rem',
                marginBottom: '1.6rem',
                fontStyle: 'italic',
              }}>
                ⚠ The live demo is a web-based simplification. The full tool runs locally and includes
                additional features: native desktop UI, file import/export, Excel and DXF outputs, and
                deeper algorithm controls not exposed here.
              </div>
            )}

            {/* Stack pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.42rem', marginBottom: '1.4rem' }}>
              {project.stack.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.09em',
                    textTransform: 'uppercase',
                    padding: '0.32rem 0.82rem',
                    border: '1px solid var(--border2)',
                    borderRadius: 999,
                    color: 'var(--ink3)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.9rem' }}>
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.68rem 1.45rem',
                    borderRadius: 999,
                    fontSize: '0.75rem',
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    fontFamily: 'var(--fb)',
                    fontWeight: 600,
                    background: 'var(--sky)',
                    color: 'var(--bg)',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#8ac4ef')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--sky)')}
                >
                  Live Demo ↗
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.68rem 1.45rem',
                    borderRadius: 999,
                    fontSize: '0.75rem',
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    fontFamily: 'var(--fb)',
                    fontWeight: 600,
                    background: 'transparent',
                    color: 'var(--ink)',
                    border: '1px solid var(--border2)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--sky)';
                    e.currentTarget.style.color = 'var(--sky)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border2)';
                    e.currentTarget.style.color = 'var(--ink)';
                  }}
                >
                  View on GitHub →
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
