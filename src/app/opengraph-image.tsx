import { ImageResponse } from 'next/og';

export const alt = 'Mattia Erigoni portfolio preview';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f7f7f3',
          color: '#0a0a0a',
          padding: '64px',
          fontFamily: 'Arial, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-120px',
            top: '-80px',
            width: '520px',
            height: '520px',
            borderRadius: '50%',
            background: 'rgba(34, 211, 238, 0.18)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '120px',
            bottom: '-120px',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            background: 'rgba(132, 204, 22, 0.18)',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 999,
                border: '1px solid rgba(10, 10, 10, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              ME
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: 4 }}>MATTIA ERIGONI</span>
              <span style={{ marginTop: 6, fontSize: 14, color: '#71717a', letterSpacing: 5 }}>
                MANAGEMENT ENGINEER
              </span>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#71717a', letterSpacing: 5 }}>PORTFOLIO</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 860 }}>
          <div style={{ fontSize: 20, color: '#525252', letterSpacing: 4, textTransform: 'uppercase' }}>
            Operational software and AI tools
          </div>
          <div style={{ marginTop: 24, fontSize: 82, lineHeight: 0.96, fontWeight: 700, letterSpacing: -5 }}>
            Tools where process meets intelligence.
          </div>
          <div style={{ marginTop: 30, fontSize: 27, lineHeight: 1.35, color: '#525252', maxWidth: 760 }}>
            Logistics, planning, data quality and private AI workflows for messy industrial operations.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {['Optimization', 'Logistics', 'Data Quality', 'Local AI'].map((item) => (
            <div
              key={item}
              style={{
                border: '1px solid rgba(10, 10, 10, 0.12)',
                borderRadius: 999,
                padding: '12px 18px',
                fontSize: 16,
                color: '#3f3f46',
                background: 'rgba(255, 255, 255, 0.62)',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
