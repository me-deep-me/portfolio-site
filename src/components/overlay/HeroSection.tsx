'use client';

export function HeroSection() {
  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 3.5rem 5rem',
        position: 'relative',
      }}
    >
      {/* Frosted text panel so text is legible over the rotating DNA */}
      <div style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignSelf: 'flex-start',
        background: 'rgba(244,246,251,0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: 18,
        padding: '2.2rem 2.8rem 2.4rem',
        border: '1px solid rgba(255,255,255,0.80)',
        maxWidth: '44rem',
      }}>

        <div style={{
          fontFamily: 'var(--fb)',
          fontSize: '0.70rem',
          letterSpacing: '0.20em',
          textTransform: 'uppercase',
          color: 'var(--sky)',
          marginBottom: '1.4rem',
          fontWeight: 600,
          opacity: 0,
          animation: 'fadeUp 0.8s ease forwards 0.1s',
        }}>
          Management Engineer · Digital Builder · AI
        </div>

        <h1 style={{
          fontFamily: 'var(--fd)',
          fontSize: 'clamp(3.8rem, 8vw, 9.5rem)',
          lineHeight: 0.90,
          letterSpacing: '-0.025em',
          color: 'var(--ink)',
          marginBottom: '2.2rem',
          opacity: 0,
          animation: 'fadeUp 0.8s ease forwards 0.25s',
        }}>
          Mattia<br />
          <span style={{ fontStyle: 'italic', color: 'var(--sky)' }}>Erigoni</span>
        </h1>

        <p style={{
          maxWidth: '38ch',
          fontSize: '1rem',
          color: 'var(--ink2)',
          lineHeight: 1.75,
          fontWeight: 400,
          opacity: 0,
          animation: 'fadeUp 0.8s ease forwards 0.45s',
        }}>
          I turn industrial complexity into software that works. From combinatorial
          optimization to AI-assisted pipelines — I build tools that make hard
          operational problems disappear.
        </p>

      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: '3.5rem',
          bottom: '3rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.62rem',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--ink3)',
          fontFamily: 'var(--fb)',
          opacity: 0,
          animation: 'fadeUp 0.8s ease forwards 0.8s',
        }}
      >
        <div style={{
          width: 1,
          height: 50,
          background: 'linear-gradient(to bottom, var(--sky), transparent)',
          animation: 'breathe 2.4s ease-in-out infinite',
        }} />
        <span>Scroll</span>
      </div>
    </section>
  );
}
