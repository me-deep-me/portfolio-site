'use client';

const SKILL_GROUPS = [
  {
    label: 'Languages & Frameworks',
    items: ['Python', 'TypeScript', 'JavaScript', 'FastAPI', 'React', 'Next.js', 'VBA', 'SQL'],
  },
  {
    label: 'Engineering',
    items: ['Operations Research', '2D/3D Bin Packing', 'Heuristic Algorithms', 'NP-Hard Problems', 'Combinatorial Optimization'],
  },
  {
    label: 'AI & Data',
    items: ['LLM · Local Inference', 'RAG Architecture', 'Prompt Engineering', 'Vector Databases', 'OCR Processing', 'Pandas · Matplotlib'],
  },
  {
    label: 'Domain & Tools',
    items: ['BIM · Revit', 'DXF · CNC', 'ERP Integration', 'Data Governance', 'Lean Digital Engineering', 'Process Design'],
  },
];

export function SkillsSection() {
  return (
    <section
      id="skills"
      style={{ padding: '7rem 3.5rem', position: 'relative', zIndex: 10 }}
    >
      <div style={{
        fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--sky)', marginBottom: '1.1rem', fontWeight: 500,
      }}>Skills</div>
      <div style={{ width: '100%', height: 1, background: 'var(--border)', marginBottom: '5rem' }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '3.5rem',
      }}>
        {SKILL_GROUPS.map((group) => (
          <div key={group.label}>
            <h3 style={{
              fontFamily: 'var(--fd)',
              fontSize: '1.1rem',
              letterSpacing: '-0.01em',
              marginBottom: '1.2rem',
              color: 'var(--ink)',
            }}>
              {group.label}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {group.items.map((item) => (
                <span
                  key={item}
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
                    e.currentTarget.style.borderColor = 'var(--sky)';
                    e.currentTarget.style.color = 'var(--sky)';
                    e.currentTarget.style.background = 'var(--skydim)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border2)';
                    e.currentTarget.style.color = 'var(--ink3)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
