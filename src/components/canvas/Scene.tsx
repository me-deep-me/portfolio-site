'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraRig } from './CameraRig';
import { FluidDNA }  from './FluidDNA';

function Lighting() {
  return (
    <>
      <ambientLight intensity={1.0} color="#ffffff" />
      <directionalLight position={[3, 6, 4]} intensity={0.8} color="#ffffff" />
    </>
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
        style={{ background: '#f4f6fb' }}
      >
        <Suspense fallback={null}>
          {/* Set WebGL clear color — CSS background alone is overridden by WebGL */}
          <color attach="background" args={['#f4f6fb']} />
          <Lighting />
          <FluidDNA />
          <CameraRig />
        </Suspense>
      </Canvas>
    </div>
  );
}
