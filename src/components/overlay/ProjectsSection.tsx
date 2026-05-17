'use client';

import { PROJECTS } from '@/data/projects';
import { useSceneStore } from '@/store/sceneStore';

export function ProjectsSection() {
  const setOpen = useSceneStore((s) => s.setOpenProjectId);

  return (
    <section
      id="projects"
      style={{ padding: '7rem 3.5rem', position: 'relative', zIndex: 10 }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: '4rem',
      }}>
        <div>
          <div style={{
            fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--sky)', marginBottom: '0.7rem', fontWeight: 500,
          }}>Projects</div>
          <h2 style={{
            fontFamily: 'var(--fd)',
            fontSize: 'clamp(2.6rem, 5vw, 5.2rem)',
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
          }}>
            Industrial<br />
            <span style={{ fontStyle: 'italic', color: 'var(--ink3)' }}>tools</span>.
          </h2>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--ink3)', letterSpacing: '0.04em' }}>
          08 projects
        </span>
      </div>

      <div style={{ width: '100%', height: 1, background: 'var(--border)', marginBottom: '0' }} />

      {/* Project list */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {PROJECTS.map((project) => (
          <div
            key={project.id}
            onClick={() => setOpen(project.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setOpen(project.id)}
            style={{
              display: 'grid',
              gridTemplateColumns: '5ch 1fr auto',
              gap: '2.8rem',
              alignItems: 'center',
              padding: '2.4rem 0',
              borderTop: '1px solid var(--border)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              transition: 'background 0.4s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(106,174,232,0.04)';
              const name = e.currentTarget.querySelector('.pi-name') as HTMLElement;
              if (name) name.style.color = 'var(--sky)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              const name = e.currentTarget.querySelector('.pi-name') as HTMLElement;
              if (name) name.style.color = 'var(--ink)';
            }}
          >
            {/* Number */}
            <div style={{
              fontSize: '0.72rem', color: 'var(--ink3)',
              letterSpacing: '0.06em', position: 'relative',
            }}>
              {project.number}
            </div>

            {/* Info */}
            <div style={{ position: 'relative' }}>
              <div
                className="pi-name"
                style={{
                  fontFamily: 'var(--fd)',
                  fontSize: 'clamp(1.4rem, 2.6vw, 2.3rem)',
                  letterSpacing: '-0.02em',
                  marginBottom: '0.4rem',
                  transition: 'color 0.2s',
                  lineHeight: 1.05,
                  color: 'var(--ink)',
                }}
              >
                {project.title}
              </div>
              <div style={{
                fontSize: '0.85rem', color: 'var(--ink3)',
                maxWidth: '52ch', lineHeight: 1.62,
              }}>
                {project.shortDesc}
              </div>
            </div>

            {/* Pills */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '0.38rem',
              justifyContent: 'flex-end', position: 'relative',
            }}>
              {project.pills.map((pill) => (
                <span
                  key={pill.label}
                  style={{
                    fontSize: '0.62rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '0.28rem 0.72rem',
                    border: `1px solid ${pill.hi ? 'var(--border2)' : 'var(--border)'}`,
                    borderRadius: 999,
                    color: pill.hi ? 'var(--sky)' : 'var(--ink3)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {pill.label}
                </span>
              ))}
            </div>
          </div>
        ))}
        {/* Bottom border on last item */}
        <div style={{ borderTop: '1px solid var(--border)' }} />
      </div>

      {/* Thesis callout */}
      <div style={{
        marginTop: '5rem',
        padding: '2.5rem 3rem',
        border: '1px solid var(--border2)',
        borderRadius: '1rem',
        background: 'var(--bg2)',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '2rem',
        alignItems: 'center',
      }}>
        <div>
          <div style={{
            fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--sky)', marginBottom: '0.6rem', fontWeight: 500,
          }}>
            Degree Thesis · 2026
          </div>
          <div style={{
            fontFamily: 'var(--fd)',
            fontSize: '1.55rem',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            marginBottom: '0.7rem',
          }}>
            Digitalizzazione e automazione dei processi<br />
            in un&apos;azienda del settore healthcare
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--ink2)', lineHeight: 1.78, maxWidth: '55ch' }}>
            My thesis documents the complete methodology and technical implementation behind the tools above
            — from process analysis and criticality mapping, to heuristic algorithm design, to AI/RAG
            experimentation and the ÆMed vision. Written from 12 months of embedded work in a real industrial
            environment.
          </p>
        </div>
        <div>
          <span style={{
            fontSize: '0.65rem', letterSpacing: '0.09em', textTransform: 'uppercase',
            padding: '0.32rem 0.82rem',
            border: '1px solid var(--border2)',
            borderRadius: 999,
            color: 'var(--ink3)',
            whiteSpace: 'nowrap',
          }}>
            Lean Digital Engineering
          </span>
        </div>
      </div>
    </section>
  );
}
