'use client';

import dynamic from 'next/dynamic';
import { useLenis }         from '@/hooks/useLenis';
import { useIsMobile }      from '@/hooks/useMediaQuery';
import { Nav }              from '@/components/overlay/Nav';
import { HeroSection }      from '@/components/overlay/HeroSection';
import { AboutSection }     from '@/components/overlay/AboutSection';
import { ProjectsSection }  from '@/components/overlay/ProjectsSection';
import { SkillsSection }    from '@/components/overlay/SkillsSection';
import { ContactSection }   from '@/components/overlay/ContactSection';
import { ProjectModal }     from '@/components/overlay/ProjectModal';
import { MobileLayout }     from '@/components/mobile/MobileLayout';

/** Dynamic import: Three.js is ~380KB, skip SSR */
const Scene = dynamic(
  () => import('@/components/canvas/Scene').then((m) => ({ default: m.Scene })),
  { ssr: false, loading: () => null }
);

/** Scroll progress bar driven by Zustand store */
import { useSceneStore } from '@/store/sceneStore';

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
  useLenis(); // Initialises smooth scroll + syncs store (no-op on mobile until refactored)

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

      {/* ── Scrollable overlay content ── */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          /* Tall enough to drive the camera through all 5 stations */
          minHeight: '500vh',
        }}
      >
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <SkillsSection />
        <ContactSection />
      </main>

      {/* ── Project detail modal ── */}
      <ProjectModal />
    </>
  );
}
