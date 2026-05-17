'use client';

import { useSceneStore } from '@/store/sceneStore';
import { PROJECTS } from '@/data/projects';

/**
 * ProjectCards — 8 glass cards in a clean staggered layout.
 * 4 cards per side. Right cards offset vertically by 11% from left cards
 * (zipper pattern). No two cards ever overlap.
 *
 * Cards emerge from the DNA axis as scroll progresses.
 */

/* Scroll thresholds — cards appear progressively */
const THRESHOLDS = [0.06, 0.13, 0.20, 0.27, 0.34, 0.41, 0.48, 0.55];

/* Clean staggered layout — no overlap */
const LAYOUT: {
  top: string;
  side: 'left' | 'right';
  inset: string;
}[] = [
  { top: '11%', side: 'left',  inset: '2.5%' },  // 0
  { top: '22%', side: 'right', inset: '2.5%' },  // 1
  { top: '33%', side: 'left',  inset: '2.5%' },  // 2
  { top: '44%', side: 'right', inset: '2.5%' },  // 3
  { top: '55%', side: 'left',  inset: '2.5%' },  // 4
  { top: '66%', side: 'right', inset: '2.5%' },  // 5
  { top: '77%', side: 'left',  inset: '2.5%' },  // 6
  { top: '78%', side: 'right', inset: '2.5%' },  // 7 — bottom-right
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
        const hiddenX   = isLeft ? '38vw' : '-38vw';

        return (
          <div
            key={project.id}
            style={{
              position: 'absolute',
              top,
              left:  isLeft  ? inset : undefined,
              right: !isLeft ? inset : undefined,
              width: 'clamp(200px, 21vw, 280px)',
              pointerEvents: visible ? 'auto' : 'none',
              opacity: visible ? 1 : 0,
              transform: visible
                ? 'translateX(0) scale(1)'
                : `translateX(${hiddenX}) scale(0.78)`,
              transition: [
                `opacity 0.7s cubic-bezier(.16,1,.3,1) ${i * 0.04}s`,
                `transform 0.7s cubic-bezier(.16,1,.3,1) ${i * 0.04}s`,
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
                background: 'rgba(255,255,255,0.68)',
                backdropFilter: 'blur(24px) saturate(150%)',
                WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                border: '1px solid rgba(255,255,255,0.9)',
                borderRadius: 14,
                boxShadow: [
                  '0 4px 24px rgba(15,30,80,0.08)',
                  '0 0 0 0.5px rgba(255,255,255,0.7) inset',
                ].join(', '),
                padding: '15px 17px 16px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(-3px)';
                el.style.boxShadow = '0 10px 36px rgba(15,30,80,0.16), 0 0 0 0.5px rgba(255,255,255,0.85) inset';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = '';
                el.style.boxShadow = '0 4px 24px rgba(15,30,80,0.08), 0 0 0 0.5px rgba(255,255,255,0.7) inset';
              }}
            >
              {/* Number + category */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.09em',
                  color: 'var(--sky)', background: 'rgba(42,133,208,0.11)',
                  padding: '2px 8px', borderRadius: 5, fontFamily: 'var(--fb)',
                }}>
                  #{project.number}
                </span>
                <span style={{
                  fontSize: '0.58rem', letterSpacing: '0.10em', textTransform: 'uppercase',
                  color: 'var(--ink3)', fontFamily: 'var(--fb)', fontWeight: 600,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  maxWidth: 130,
                }}>
                  {project.cat.split(' · ')[0]}
                </span>
              </div>

              {/* Title */}
              <div style={{
                fontFamily: 'var(--fd)',
                fontSize: 'clamp(1rem, 1.4vw, 1.20rem)',
                color: 'var(--ink)',
                lineHeight: 1.18,
                marginBottom: 10,
                letterSpacing: '-0.012em',
              }}>
                {project.title}
              </div>

              {/* Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {project.pills.slice(0, 3).map(pill => (
                  <span key={pill.label} style={{
                    fontSize: '0.56rem', letterSpacing: '0.07em', textTransform: 'uppercase',
                    padding: '2.5px 8px', borderRadius: 999, fontWeight: 600, fontFamily: 'var(--fb)',
                    background: pill.hi ? 'rgba(42,133,208,0.12)' : 'rgba(12,24,40,0.05)',
                    color:      pill.hi ? 'var(--sky)'            : 'var(--ink3)',
                    border: `1px solid ${pill.hi ? 'rgba(42,133,208,0.22)' : 'rgba(12,24,40,0.10)'}`,
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
