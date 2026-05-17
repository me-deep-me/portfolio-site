'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/sceneStore';

const PARTICLE_COUNT = 1500;

const VERT = /* glsl */`
  attribute float aSpeed;
  attribute float aOffset;
  uniform float uTime;
  uniform float uDensity;
  varying float vAlpha;

  void main() {
    // Y-drift: particles slowly rise, wrap around
    float y = mod(position.y + uTime * aSpeed * 0.12 + aOffset, 8.0) - 4.0;
    vec3 p = vec3(position.x, y, position.z);

    // Fade based on density
    float dist = length(p.xz);
    vAlpha = uDensity * (1.0 - smoothstep(3.5, 7.0, dist)) * 0.6;

    vec4 mvPos = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = 1.8 * (300.0 / -mvPos.z);
    gl_Position  = projectionMatrix * mvPos;
  }
`;

const FRAG = /* glsl */`
  varying float vAlpha;
  void main() {
    // Circular point
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float a = (1.0 - d) * vAlpha;
    gl_FragColor = vec4(0.416, 0.682, 0.910, a); // #6aaee8
  }
`;

export function ParticleField() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const particleDensity = useSceneStore((s) => s.particleDensity);
  const densityRef = useRef(0);
  densityRef.current = particleDensity;

  const { positions, speeds, offsets } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const speeds    = new Float32Array(PARTICLE_COUNT);
    const offsets   = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Spread in a disk volume
      const angle  = Math.random() * Math.PI * 2;
      const radius = Math.random() * 7;
      positions[i * 3]     = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      speeds[i]   = 0.3 + Math.random() * 0.7;
      offsets[i]  = Math.random() * 8;
    }
    return { positions, speeds, offsets };
  }, []);

  const uniforms = useMemo(() => ({
    uTime:    { value: 0 },
    uDensity: { value: 0 },
  }), []);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value    = clock.elapsedTime;
    matRef.current.uniforms.uDensity.value = densityRef.current;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          args={[speeds, 1]}
        />
        <bufferAttribute
          attach="attributes-aOffset"
          args={[offsets, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
