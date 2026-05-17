'use client';

const CHIPS = [
  'Python', 'Operations Research', 'FastAPI', 'Excel · VBA',
  'HTML · CSS · JS', '2D/3D Bin Packing', 'LLM · RAG', 'Data Quality',
  'BIM · Revit', 'Process Design', 'Lean Digital Engineering', 'Prompt Engineering',
];

export function AboutSection() {
  return (
    <section
      id="about"
      style={{ padding: '7rem 3.5rem', position: 'relative', zIndex: 10 }}
    >
      {/* Section tag */}
      <div style={{
        fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--sky)', marginBottom: '1.1rem', fontWeight: 500,
      }}>About</div>
      <div style={{
        width: '100%', height: 1, background: 'var(--border)', marginBottom: '5rem',
      }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '7rem',
        alignItems: 'start',
      }}>
        {/* Left: headline */}
        <div>
          <h2 style={{
            fontFamily: 'var(--fd)',
            fontSize: 'clamp(2.6rem, 5vw, 5.2rem)',
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
          }}>
            Engineer<br />
            <span style={{ color: 'var(--ink3)', fontStyle: 'italic' }}>who</span><br />
            <span style={{ color: 'var(--ink3)' }}>ships.</span>
          </h2>
        </div>

        {/* Right: bio + chips */}
        <div>
          <p style={{
            fontSize: '0.98rem', color: 'var(--ink2)', lineHeight: 1.88, marginBottom: '2.5rem',
          }}>
            I&apos;m a Management Engineer with a strong lean toward{' '}
            <strong style={{ color: 'var(--ink)', fontWeight: 500 }}>
              process digitalization, operations research and AI
            </strong>. My work sits at the intersection of industrial logic and software craft — I analyse how
            things actually work, find where the friction is, and build tools that remove it.
            <br /><br />
            Over the past year I independently designed and deployed a full suite of industrial applications
            in a real healthcare infrastructure company — solving NP-hard optimization problems, automating
            logistics planning, structuring a 85,000-record database, and experimenting with local LLM and
            RAG architectures. Every tool was born from direct observation of a broken process, and validated
            in production.
            <br /><br />
            I work through rapid prototyping and iterative validation. I care about the quality of the data,
            the coherence of the flow, and the elegance of the result.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {CHIPS.map((chip) => (
              <span
                key={chip}
                style={{
                  fontSize: '0.68rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0.38rem 0.95rem',
                  border: '1px solid var(--border2)',
                  borderRadius: 999,
                  color: 'var(--ink3)',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = 'var(--sky)';
                  el.style.color = 'var(--sky)';
                  el.style.background = 'var(--skydim)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = 'var(--border2)';
                  el.style.color = 'var(--ink3)';
                  el.style.background = 'transparent';
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
