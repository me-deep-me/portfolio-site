'use client';

const CONTACT_LINES = [
  { label: 'Email',        href: 'mailto:mattiaerigoni99@gmail.com', text: 'mattiaerigoni99@gmail.com' },
  { label: 'LinkedIn',     href: 'https://www.linkedin.com/in/mattia-erigoni-b87614183/', text: 'linkedin.com/in/mattia-erigoni-b87614183', external: true },
  { label: 'Languages',    href: null, text: 'Italian · English · Spanish' },
  { label: 'Availability', href: null, text: 'Open to opportunities' },
];

export function ContactSection() {
  return (
    <section
      id="contact"
      style={{ padding: '7rem 3.5rem', position: 'relative', zIndex: 10 }}
    >
      <div style={{
        fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--sky)', marginBottom: '1.1rem', fontWeight: 500,
      }}>Contact</div>
      <div style={{ width: '100%', height: 1, background: 'var(--border)', marginBottom: '5rem' }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '7rem',
        alignItems: 'end',
      }}>
        {/* Headline */}
        <div>
          <h2 style={{
            fontFamily: 'var(--fd)',
            fontSize: 'clamp(3.5rem, 7vw, 8rem)',
            lineHeight: 0.87,
            letterSpacing: '-0.03em',
          }}>
            Let&apos;s<br />
            <span style={{ fontStyle: 'italic', color: 'var(--sky)' }}>talk.</span>
          </h2>
        </div>

        {/* Links */}
        <div>
          <div style={{ marginBottom: '2.4rem' }}>
            {CONTACT_LINES.map(({ label, href, text, external }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.95rem 0',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '0.88rem',
                  color: 'var(--ink3)',
                }}
              >
                <span>{label}</span>
                {href ? (
                  <a
                    href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    style={{
                      color: 'var(--ink2)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--sky)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink2)')}
                  >
                    {text}
                  </a>
                ) : (
                  <span style={{ color: 'var(--ink2)' }}>{text}</span>
                )}
              </div>
            ))}
          </div>

          <a
            href="mailto:mattiaerigoni99@gmail.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
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
            Get in touch ↗
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: '6rem',
        paddingTop: '2.2rem',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.73rem',
        color: 'var(--ink3)',
        letterSpacing: '0.04em',
      }}>
        <span>© 2026 Mattia Erigoni</span>
        <span>Management Engineer · Digital Builder</span>
        <a
          href="https://www.linkedin.com/in/mattia-erigoni-b87614183/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--ink3)', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--sky)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink3)')}
        >
          LinkedIn ↗
        </a>
      </footer>
    </section>
  );
}
