'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Bloom, DepthOfField, Vignette, EffectComposer } from '@react-three/postprocessing';
import { CameraRig }      from './CameraRig';
import { GridFloor }      from './GridFloor';
import { FloatingPanels } from './FloatingPanels';
import { ParticleField }  from './ParticleField';
import { useSceneStore }  from '@/store/sceneStore';

function Lighting() {
  return (
    <>
      {/* Ambient: dim blue tint */}
      <ambientLight intensity={0.18} color="#1a3a5c" />
      {/* Key: sky-blue fill */}
      <directionalLight position={[3, 5, 4]} intensity={0.6} color="#6aaee8" />
      {/* Rim: subtle back-left */}
      <directionalLight position={[-4, 2, -3]} intensity={0.25} color="#3d85c8" />
    </>
  );
}

function PostFX() {
  const bloomIntensity = useSceneStore((s) => s.bloomIntensity);
  return (
    <EffectComposer>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.35}
        luminanceSmoothing={0.82}
        mipmapBlur
        radius={0.65}
      />
      <DepthOfField
        focusDistance={0.01}
        focalLength={0.2}
        bokehScale={1.2}
      />
      <Vignette eskil={false} offset={0.28} darkness={0.62} />
    </EffectComposer>
  );
}

export function Scene() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 1.2, 6.0], fov: 60, near: 0.1, far: 120 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: false,
          stencil: false,
          powerPreference: 'high-performance',
          antialias: false,
        }}
        style={{ background: '#07101c' }}
      >
        <Suspense fallback={null}>
          <Lighting />
          <FogLayer />
          <GridFloor />
          <FloatingPanels />
          <ParticleField />
          <CameraRig />
          <PostFX />
        </Suspense>
      </Canvas>
    </div>
  );
}

/** Reads fogFar from store each frame — must be inside Canvas */
function FogLayer() {
  const fogFar = useSceneStore((s) => s.fogFar);
  return <fog attach="fog" args={['#07101c', 4, fogFar]} />;
}
