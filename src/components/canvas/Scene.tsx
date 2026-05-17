'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { CameraRig }  from './CameraRig';
import { DNAHelix }   from './DNAHelix';

function Lighting() {
  return (
    <>
      {/* Strong ambient for bright white bg */}
      <ambientLight intensity={1.4} color="#ffffff" />
      {/* Key light — top-right, creates glass highlights */}
      <directionalLight position={[4, 8, 4]} intensity={2.2} color="#ffffff" />
      {/* Fill — left-back, cool blue tint */}
      <directionalLight position={[-5, 3, -3]} intensity={0.9} color="#cce4ff" />
      {/* Rim — top-center-back for glass edge glow */}
      <pointLight position={[0, 7, -4]} intensity={2.0} color="#aaccff" />
      {/* Ground bounce */}
      <pointLight position={[0, -3, 3]} intensity={0.6} color="#e8f2ff" />
    </>
  );
}

function PostFX() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.35}
        luminanceThreshold={0.78}
        luminanceSmoothing={0.6}
        mipmapBlur
        radius={0.5}
      />
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
        camera={{ position: [0, 0.5, 5.5], fov: 55, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: false,
          stencil: false,
          powerPreference: 'high-performance',
          antialias: true,
        }}
        style={{ background: '#f0f4fc' }}
      >
        <Suspense fallback={null}>
          <Lighting />
          <DNAHelix />
          <CameraRig />
          <PostFX />
        </Suspense>
      </Canvas>
    </div>
  );
}
