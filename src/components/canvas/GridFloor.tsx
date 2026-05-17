'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/sceneStore';

const GRID_VERT = /* glsl */`
  varying vec2 vUv;
  varying float vDist;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vDist = length(worldPos.xz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const GRID_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uScrollProgress;
  uniform float uOpacity;
  varying vec2 vUv;
  varying float vDist;

  float grid(vec2 uv, float lineWidth) {
    vec2 d = abs(fract(uv - 0.5) - 0.5) / fwidth(uv);
    float g = min(d.x, d.y);
    return 1.0 - min(g, lineWidth);
  }

  void main() {
    vec2 uv = vUv * 40.0;

    // Fine grid
    float g1 = grid(uv, 60.0);
    // Coarse grid (x4)
    float g2 = grid(uv / 4.0, 30.0);
    float lines = max(g1 * 0.28, g2 * 0.65);

    // Perspective fade: closer = brighter, far horizon = transparent
    float fade = 1.0 - smoothstep(0.0, 28.0, vDist);

    // Appear when scrolling past station 0 (18%)
    float appear = smoothstep(0.10, 0.28, uScrollProgress);

    float alpha = lines * fade * appear * uOpacity;
    vec3 col = mix(vec3(0.026, 0.055, 0.094), vec3(0.416, 0.682, 0.910), lines * 0.45);

    gl_FragColor = vec4(col, alpha);
  }
`;

export function GridFloor() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const scrollProgress = useSceneStore((s) => s.scrollProgress);

  const uniforms = useMemo(() => ({
    uTime:           { value: 0 },
    uScrollProgress: { value: 0 },
    uOpacity:        { value: 0.8 },
  }), []);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value           = clock.elapsedTime;
    matRef.current.uniforms.uScrollProgress.value = scrollProgress;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[60, 60, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={GRID_VERT}
        fragmentShader={GRID_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
