'use client';

import { PROJECTS } from '@/data/projects';
import { useSceneStore } from '@/store/sceneStore';
import { ProjectModal } from '@/components/overlay/ProjectModal';

export function MobileLayout() {
  const setOpen = useSceneStore((s) => s.setOpenProjectId);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--ink)' }}>
      {/* Mobile Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.2rem 1.5rem',
        background: 'rgba(7,16,28,0.88)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <a href="#" style={{ fontFamily: 'var(--fd)', fontSize: '1rem', color: 'var(--ink)', textDecoration: 'none' }}>
          Mattia Erigoni
        </a>
        <a href="mailto:mattiaerigoni99@gmail.com" style={{
          fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--sky)', textDecoration: 'none', fontWeight: 500,
        }}>
          Contact
        </a>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 1.5rem 4rem' }}>
        <div style={{
          fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--sky)', marginBottom: '1.5rem', fontWeight: 500,
          animation: 'fadeUp 0.9s ease forwards 0.2s', opacity: 0,
        }}>
          Management Engineer · Digital Builder · AI
        </div>
        <h1 style={{
          fontFamily: 'var(--fd)',
          fontSize: 'clamp(3.5rem, 15vw, 5.5rem)',
          lineHeight: 0.875,
          letterSpacing: '-0.02em',
          marginBottom: '2.5rem',
          animation: 'fadeUp 0.9s ease forwards 0.4s', opacity: 0,
        }}>
          Mattia<br />
          <span style={{ fontStyle: 'italic', color: 'var(--sky)' }}>Erigoni</span>
        </h1>
        <p style={{
          fontSize: '1rem', color: 'var(--ink2)', lineHeight: 1.8, maxWidth: '40ch',
          animation: 'fadeUp 0.9s ease forwards 0.6s', opacity: 0,
        }}>
          I turn industrial complexity into software that works. From combinatorial optimization to
          AI-assisted pipelines.
        </p>
      </section>

      {/* About */}
      <section id="about" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--sky)', marginBottom: '0.8rem', fontWeight: 500 }}>About</div>
        <div style={{ height: 1, background: 'var(--border)', marginBottom: '2.5rem' }} />
        <p style={{ fontSize: '0.95rem', color: 'var(--ink2)', lineHeight: 1.88 }}>
          Management Engineer specialising in process digitalization, operations research and AI.
          Over the past year I built a full suite of industrial tools — NP-hard optimizers, logistics
          planners, a 85,000-record database, and RAG experiments — deployed in a real healthcare company.
        </p>
      </section>

      {/* Projects */}
      <section id="projects" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--sky)', marginBottom: '0.8rem', fontWeight: 500 }}>Projects</div>
        <div style={{ height: 1, background: 'var(--border)', marginBottom: '2.5rem' }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {PROJECTS.map((project) => (
            <div
              key={project.id}
              onClick={() => setOpen(project.id)}
              style={{
                padding: '1.8rem 0',
                borderTop: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '0.65rem', color: 'var(--ink3)', marginBottom: '0.4rem' }}>
                {project.number}
              </div>
              <div style={{
                fontFamily: 'var(--fd)', fontSize: '1.6rem',
                letterSpacing: '-0.02em', marginBottom: '0.4rem', color: 'var(--ink)',
              }}>
                {project.title}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--ink3)', lineHeight: 1.6 }}>
                {project.shortDesc}
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)' }} />
        </div>
      </section>

      {/* Contact */}
      <section id="contact" style={{ padding: '4rem 1.5rem' }}>
        <div style={{ fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--sky)', marginBottom: '0.8rem', fontWeight: 500 }}>Contact</div>
        <div style={{ height: 1, background: 'var(--border)', marginBottom: '2.5rem' }} />
        <h2 style={{ fontFamily: 'var(--fd)', fontSize: '3.5rem', lineHeight: 0.9, letterSpacing: '-0.02em', marginBottom: '2rem' }}>
          Let&apos;s<br /><span style={{ fontStyle: 'italic', color: 'var(--sky)' }}>talk.</span>
        </h2>
        <a
          href="mailto:mattiaerigoni99@gmail.com"
          style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '0.8rem 1.8rem',
            borderRadius: 999,
            fontSize: '0.78rem', letterSpacing: '0.07em', textTransform: 'uppercase',
            textDecoration: 'none', fontWeight: 600,
            background: 'var(--sky)', color: 'var(--bg)',
          }}
        >
          mattiaerigoni99@gmail.com ↗
        </a>
      </section>

      <ProjectModal />
    </div>
  );
}
