'use client';

import { useSceneStore } from '@/store/sceneStore';
import { PROJECTS } from '@/data/projects';

/**
 * ProjectCards — 8 glass cards that emerge from the DNA center and scatter
 * asymmetrically on both sides. They are NOT aligned in a grid: right-side
 * cards overlap vertically with left-side ones to feel organic.
 *
 * Animation: cards start shifted toward the DNA axis (large translateX
 * toward center) and slide out to their final off-axis positions.
 */

/* Scroll threshold at which each card appears */
const THRESHOLDS = [0.10, 0.17, 0.25, 0.21, 0.34, 0.30, 0.44, 0.40];

/*
 * Irregular vertical positions — deliberately NOT aligned.
 * Right-column cards intentionally overlap with left-column rows.
 */
const LAYOUT: {
  top: string;
  side: 'left' | 'right';
  inset: string;   // left% or right%
}[] = [
  { top: '10%', side: 'left',  inset: '2%'   },   // 0
  { top: '26%', side: 'right', inset: '1.5%' },   // 1
  { top: '38%', side: 'left',  inset: '3%'   },   // 2
  { top: '18%', side: 'right', inset: '3%'   },   // 3 ← higher than card 2: cross-over
  { top: '53%', side: 'left',  inset: '1.5%' },   // 4
  { top: '44%', side: 'right', inset: '2.5%' },   // 5 ← higher than card 4
  { top: '69%', side: 'left',  inset: '2%'   },   // 6
  { top: '61%', side: 'right', inset: '2%'   },   // 7 ← higher than card 6
];

export function ProjectCards() {
  const sp             = useSceneStore(s => s.scrollProgress);
  const setOpenProject = useSceneStore(s => s.setOpenProjectId);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 20, pointerEvents: 'none' }}
      aria-label="Project cards"
    >
      {PROJECTS.map((project, i) => {
        const { top, side, inset } = LAYOUT[i];
        const isLeft    = side === 'left';
        const threshold = THRESHOLDS[i];
        const visible   = sp > threshold;

        /* Cards emerge from the DNA center: start shifted ~40vw toward axis */
        const hiddenX   = isLeft ? '40vw' : '-40vw';

        return (
          <div
            key={project.id}
            style={{
              position: 'absolute',
              top,
              left:  isLeft  ? inset : undefined,
              right: !isLeft ? inset : undefined,
              width: 'clamp(160px, 20vw, 260px)',
              pointerEvents: visible ? 'auto' : 'none',
              opacity:   visible ? 1 : 0,
              transform: visible
                ? 'translateX(0) scale(1)'
                : `translateX(${hiddenX}) scale(0.72)`,
              transition: [
                `opacity 0.65s cubic-bezier(.16,1,.3,1) ${i * 0.04}s`,
                `transform 0.65s cubic-bezier(.16,1,.3,1) ${i * 0.04}s`,
              ].join(', '),
            }}
          >
            <button
              onClick={() => setOpenProject(project.id)}
              style={{
                all: 'unset',
                display: 'block',
                width: '100%',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.62)',
                backdropFilter: 'blur(22px) saturate(150%)',
                WebkitBackdropFilter: 'blur(22px) saturate(150%)',
                border: '1px solid rgba(255,255,255,0.88)',
                borderRadius: 13,
                boxShadow: [
                  '0 2px 20px rgba(20,40,100,0.07)',
                  '0 0 0 0.5px rgba(255,255,255,0.70) inset',
                ].join(', '),
                padding: '13px 15px 14px',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform  = 'translateY(-2px)';
                el.style.boxShadow  = '0 6px 30px rgba(20,40,100,0.13), 0 0 0 0.5px rgba(255,255,255,0.82) inset';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform  = '';
                el.style.boxShadow  = '0 2px 20px rgba(20,40,100,0.07), 0 0 0 0.5px rgba(255,255,255,0.70) inset';
              }}
            >
              {/* Number + category */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                <span style={{
                  fontSize: '0.60rem', fontWeight: 700, letterSpacing: '0.09em',
                  color: 'var(--sky)', background: 'rgba(42,133,208,0.10)',
                  padding: '2px 7px', borderRadius: 5, fontFamily: 'var(--fb)',
                }}>
                  #{project.number}
                </span>
                <span style={{
                  fontSize: '0.57rem', letterSpacing: '0.09em', textTransform: 'uppercase',
                  color: 'var(--ink3)', fontFamily: 'var(--fb)', fontWeight: 500,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  maxWidth: 110,
                }}>
                  {project.cat.split(' · ')[0]}
                </span>
              </div>

              {/* Title */}
              <div style={{
                fontFamily: 'var(--fd)',
                fontSize: 'clamp(0.88rem, 1.3vw, 1.10rem)',
                color: 'var(--ink)',
                lineHeight: 1.15,
                marginBottom: 9,
                letterSpacing: '-0.01em',
              }}>
                {project.title}
              </div>

              {/* Pills (max 3) */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {project.pills.slice(0, 3).map(pill => (
                  <span key={pill.label} style={{
                    fontSize: '0.55rem', letterSpacing: '0.06em', textTransform: 'uppercase',
                    padding: '2px 7px', borderRadius: 999, fontWeight: 600, fontFamily: 'var(--fb)',
                    background: pill.hi ? 'rgba(42,133,208,0.11)' : 'rgba(13,26,46,0.05)',
                    color:      pill.hi ? 'var(--sky)'            : 'var(--ink3)',
                    border: `1px solid ${pill.hi ? 'rgba(42,133,208,0.20)' : 'rgba(13,26,46,0.09)'}`,
                  }}>
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
