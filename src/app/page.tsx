'use client';

import dynamic from 'next/dynamic';
import { useLenis }         from '@/hooks/useLenis';
import { useIsMobile }      from '@/hooks/useMediaQuery';
import { Nav }              from '@/components/overlay/Nav';
import { HeroSection }      from '@/components/overlay/HeroSection';
import { AboutSection }     from '@/components/overlay/AboutSection';
import { SkillsSection }    from '@/components/overlay/SkillsSection';
import { ContactSection }   from '@/components/overlay/ContactSection';
import { ProjectCards }     from '@/components/overlay/ProjectCards';
import { ProjectModal }     from '@/components/overlay/ProjectModal';
import { MobileLayout }     from '@/components/mobile/MobileLayout';
import { useSceneStore }    from '@/store/sceneStore';

/** Dynamic import: Three.js is ~380KB, skip SSR */
const Scene = dynamic(
  () => import('@/components/canvas/Scene').then((m) => ({ default: m.Scene })),
  { ssr: false, loading: () => null }
);

function ScrollProgressBar() {
  const progress = useSceneStore((s) => s.scrollProgress);
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: 2,
        background: 'var(--sky)',
        zIndex: 999,
        width: `${progress * 100}%`,
        transition: 'width 0.1s linear',
        pointerEvents: 'none',
      }}
    />
  );
}

export default function Home() {
  const isMobile = useIsMobile();
  useLenis();

  if (isMobile) {
    return <MobileLayout />;
  }

  return (
    <>
      {/* ── 3D Canvas (fixed, behind everything) ── */}
      <Scene />

      {/* ── Fixed chrome ── */}
      <Nav />
      <ScrollProgressBar />

      {/* ── Project cards: fixed overlay alongside DNA ── */}
      <ProjectCards />

      {/* ── Scrollable overlay content ── */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '500vh',
          /* Center column for text — DNA fills side space */
          pointerEvents: 'none',
        }}
      >
        {/* Hero: full-width bottom-left */}
        <div style={{ pointerEvents: 'auto' }}>
          <HeroSection />
        </div>

        {/* About: appears after ~30% scroll, centered with margins */}
        <div
          style={{
            pointerEvents: 'auto',
            maxWidth: 500,
            margin: '0 auto',
            paddingTop: '30vh',
          }}
        >
          <AboutSection />
        </div>

        {/* Spacer: DNA + cards zone (~200vh) */}
        <div style={{ height: '200vh' }} />

        {/* Skills + Contact: centered */}
        <div
          style={{
            pointerEvents: 'auto',
            maxWidth: 600,
            margin: '0 auto',
          }}
        >
          <SkillsSection />
          <ContactSection />
        </div>
      </main>

      {/* ── Project detail modal ── */}
      <ProjectModal />
    </>
  );
}
