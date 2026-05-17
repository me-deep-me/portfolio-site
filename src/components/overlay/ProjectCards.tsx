'use client';

import { useSceneStore } from '@/store/sceneStore';
import { PROJECTS } from '@/data/projects';

/*
 * ProjectCards — fixed overlay showing 8 project cards left/right of DNA helix.
 * Cards slide in progressively as scrollProgress crosses each threshold.
 *
 * Layout (viewport width):
 *   0%–26%   left cards
 *  26%–74%   DNA helix (canvas center)
 *  74%–100%  right cards
 */

/* Scroll threshold at which each card appears */
const THRESHOLDS = [0.10, 0.18, 0.27, 0.36, 0.45, 0.54, 0.63, 0.72];

/* Vertical positions (from top of viewport) */
const TOPS = ['12%', '32%', '52%', '72%'];

export function ProjectCards() {
  const sp             = useSceneStore(s => s.scrollProgress);
  const setOpenProject = useSceneStore(s => s.setOpenProjectId);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        pointerEvents: 'none',
      }}
      aria-label="Project cards"
    >
      {PROJECTS.map((project, i) => {
        const isLeft    = i % 2 === 0;
        const rowIndex  = Math.floor(i / 2);
        const threshold = THRESHOLDS[i] ?? 0.10;
        const visible   = sp > threshold;

        return (
          <div
            key={project.id}
            style={{
              position: 'absolute',
              top: TOPS[rowIndex],
              left: isLeft ? '1.5%' : undefined,
              right: isLeft ? undefined : '1.5%',
              width: 'clamp(180px, 22vw, 280px)',
              pointerEvents: visible ? 'auto' : 'none',
              /* Slide-in transition */
              opacity:   visible ? 1 : 0,
              transform: visible
                ? 'translateX(0)'
                : `translateX(${isLeft ? '-32px' : '32px'})`,
              transition: 'opacity 0.55s cubic-bezier(.22,1,.36,1), transform 0.55s cubic-bezier(.22,1,.36,1)',
            }}
          >
            <button
              onClick={() => setOpenProject(project.id)}
              style={{
                all: 'unset',
                display: 'block',
                width: '100%',
                cursor: 'pointer',
                /* Glass morphism */
                background: 'rgba(255,255,255,0.58)',
                backdropFilter: 'blur(20px) saturate(160%)',
                WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                border: '1px solid rgba(255,255,255,0.85)',
                borderRadius: 14,
                boxShadow: '0 4px 28px rgba(30,60,120,0.09), 0 0 0 0.5px rgba(255,255,255,0.72) inset',
                padding: '14px 16px',
                transition: 'box-shadow 0.2s ease, transform 0.18s ease',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = '0 8px 36px rgba(30,60,120,0.15), 0 0 0 0.5px rgba(255,255,255,0.82) inset';
                el.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = '0 4px 28px rgba(30,60,120,0.09), 0 0 0 0.5px rgba(255,255,255,0.72) inset';
                el.style.transform = 'translateY(0)';
              }}
            >
              {/* Number + category */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '0.10em',
                  color: 'var(--sky)',
                  fontFamily: 'var(--fb)',
                  background: 'rgba(58,143,212,0.10)',
                  padding: '2px 7px',
                  borderRadius: 6,
                }}>
                  #{project.number}
                </span>
                <span style={{
                  fontSize: '0.58rem',
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: 'var(--ink3)',
                  fontFamily: 'var(--fb)',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '130px',
                }}>
                  {project.cat.split(' · ')[0]}
                </span>
              </div>

              {/* Title */}
              <div style={{
                fontFamily: 'var(--fd)',
                fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)',
                color: 'var(--ink)',
                lineHeight: 1.2,
                marginBottom: 9,
                letterSpacing: '-0.01em',
              }}>
                {project.title}
              </div>

              {/* Pills (max 3) */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {project.pills.slice(0, 3).map((pill) => (
                  <span
                    key={pill.label}
                    style={{
                      fontSize: '0.57rem',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontWeight: 600,
                      fontFamily: 'var(--fb)',
                      background: pill.hi
                        ? 'rgba(58,143,212,0.12)'
                        : 'rgba(13,26,46,0.05)',
                      color: pill.hi ? 'var(--sky)' : 'var(--ink3)',
                      border: `1px solid ${pill.hi ? 'rgba(58,143,212,0.22)' : 'rgba(13,26,46,0.08)'}`,
                    }}
                  >
                    {pill.label}
                  </span>
                ))}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
