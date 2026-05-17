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
        padding: '0 3.5rem 5.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--fb)',
          fontSize: '0.72rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--sky)',
          marginBottom: '1.8rem',
          fontWeight: 500,
          opacity: 0,
          animation: 'fadeUp 0.9s ease forwards 0.2s',
        }}
      >
        Management Engineer · Digital Builder · AI
      </div>

      <h1
        style={{
          fontFamily: 'var(--fd)',
          fontSize: 'clamp(4.2rem, 9.5vw, 11rem)',
          lineHeight: 0.875,
          letterSpacing: '-0.02em',
          marginBottom: '3.8rem',
          opacity: 0,
          animation: 'fadeUp 0.9s ease forwards 0.4s',
        }}
      >
        Mattia<br />
        <span style={{ fontStyle: 'italic', color: 'var(--sky)' }}>Erigoni</span>
      </h1>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          opacity: 0,
          animation: 'fadeUp 0.9s ease forwards 0.7s',
        }}
      >
        <p
          style={{
            maxWidth: '44ch',
            fontSize: '1.05rem',
            color: 'var(--ink2)',
            lineHeight: 1.8,
          }}
        >
          I turn industrial complexity into software that works. From combinatorial
          optimization to AI-assisted pipelines — I build tools that make hard
          operational problems disappear.
        </p>
        <div
          aria-hidden="true"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.68rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ink3)',
          }}
        >
          <div
            style={{
              width: 1,
              height: 58,
              background: 'linear-gradient(to bottom, var(--sky), transparent)',
              animation: 'breathe 2.2s ease-in-out infinite',
            }}
          />
          <span>Scroll</span>
        </div>
      </div>
    </section>
  );
}
