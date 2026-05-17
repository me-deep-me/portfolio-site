'use client';

/**
 * FluidDNA — black liquid particle field on white background.
 *
 * No explicit helix geometry. Instead, 14 000 particles follow a
 * GPU-computed flow field whose attractor is shaped like a double
 * helix but with circular eddies, breathing, and radial turbulence
 * that make it feel like ink swirling in water.
 *
 * All positions are computed in the vertex shader every frame —
 * zero CPU particle updates, one draw call.
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/sceneStore';

const N = 14_000;

/* ── Vertex shader ── */
const VERT = /* glsl */`
  attribute float aT;       // 0→1 position along helix height
  attribute float aSeed;    // 0→1 random per-particle
  attribute float aStrand;  // 0.0 or 1.0
  attribute float aRad;     // signed radial offset from helix axis

  uniform float uTime;
  uniform float uGrowth;    // 0→1, visible height fraction

  varying float vAlpha;

  const float PI      = 3.14159265359;
  const float TWO_PI  = 6.28318530718;
  const float TURNS   = 5.2;    // helix turns over full height
  const float HEIGHT  = 7.0;
  const float BOT     = -1.0;
  const float HELIX_R = 0.48;   // core helix radius

  void main() {
    /* ── World-space Y position ── */
    float yWorld = BOT + aT * HEIGHT;

    /* ── Slow global spin (circular motion) ── */
    float spin = uTime * 0.26;

    /* ── Base helix angle at this height ── */
    float baseAngle = aT * TURNS * TWO_PI + aStrand * PI + spin;

    /* ── Fluid 1: radial breathing ── */
    float breathe = 0.09 * sin(uTime * 0.58 + aSeed * TWO_PI + aT * PI * 1.7);

    /* ── Fluid 2: angular drift ── */
    float drift = 0.13 * sin(uTime * 0.38 + aSeed * 5.1);

    /* ── Fluid 3: local circular eddies every turn ── */
    float turnPhase = mod(aT * TURNS, 1.0) * TWO_PI;
    float eddyAmp   = 0.07 * abs(sin(turnPhase * 0.5));
    float eddyAngle = turnPhase + uTime * 1.05 + aSeed * TWO_PI;

    /* ── Compose final position ── */
    float r     = HELIX_R + aRad + breathe;
    float angle = baseAngle + drift;

    float x = r * cos(angle) + eddyAmp * sin(eddyAngle);
    float y = yWorld
              + 0.05 * sin(uTime * 0.85 + aSeed * 7.3)   // Y wobble
              + 0.03 * sin(uTime * 1.40 + aT * TWO_PI);   // wave along strand
    float z = r * sin(angle) + eddyAmp * cos(eddyAngle);

    /* ── Growth clip: smoothly fade above growth frontier ── */
    float growthTop = BOT + uGrowth * HEIGHT;
    float clipFade  = smoothstep(growthTop, growthTop - 0.5, y);

    /* ── Bottom fade ── */
    float botFade = smoothstep(BOT - 0.05, BOT + 0.35, y);

    /* ── Core alpha: denser near helix axis ── */
    float distCore = abs(aRad + breathe);
    float coreA    = clamp(0.82 - distCore * 2.4, 0.0, 1.0);

    vAlpha = coreA * clipFade * botFade;

    /* ── Point size: larger at core, perspective-scaled ── */
    float sz = mix(5.0, 1.8, distCore * 3.0);
    vec4 mvPos   = modelViewMatrix * vec4(x, y, z, 1.0);
    gl_PointSize = clamp(sz * 5.5 / -mvPos.z, 1.0, 9.0);
    gl_Position  = projectionMatrix * mvPos;
  }
`;

/* ── Fragment shader ── */
const FRAG = /* glsl */`
  varying float vAlpha;

  void main() {
    /* Soft circular droplet */
    float d = length(gl_PointCoord - vec2(0.5)) * 2.0;
    if (d > 1.0) discard;

    float a = smoothstep(1.0, 0.15, d) * vAlpha;
    if (a < 0.004) discard;

    /* Near-black ink color */
    gl_FragColor = vec4(0.04, 0.04, 0.07, a);
  }
`;

export function FluidDNA() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const spRef  = useRef(0);
  spRef.current = useSceneStore(s => s.scrollProgress);

  /* ── Generate particle seed data (once) ── */
  const { positions, aT, aSeed, aStrand, aRad } = useMemo(() => {
    const positions = new Float32Array(N * 3);   // dummy — positions computed in shader
    const aT        = new Float32Array(N);
    const aSeed     = new Float32Array(N);
    const aStrand   = new Float32Array(N);
    const aRad      = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      aT[i]      = Math.random();
      aSeed[i]   = Math.random();
      /* Two strands + ~15% free-drifting particles between them */
      const r = Math.random();
      aStrand[i] = r < 0.45 ? 0.0 : r < 0.85 ? 1.0 : aSeed[i]; // free: random angle phase
      /* Radial offset: concentrated near 0 with long tails for fluid texture */
      aRad[i]    = (Math.random() - 0.5) * 0.52;
    }

    return { positions, aT, aSeed, aStrand, aRad };
  }, []);

  const uniforms = useMemo(() => ({
    uTime:   { value: 0 },
    uGrowth: { value: 0.50 },
  }), []);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = clock.elapsedTime;

    /* Growth: 50% at scroll=0, fully grown by scroll≈0.85 */
    const sp = spRef.current;
    matRef.current.uniforms.uGrowth.value = Math.min(1.0, 0.50 + sp * 0.59);
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        {/* Dummy position so Three.js knows vertex count */}
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aT"       args={[aT,       1]} />
        <bufferAttribute attach="attributes-aSeed"    args={[aSeed,    1]} />
        <bufferAttribute attach="attributes-aStrand"  args={[aStrand,  1]} />
        <bufferAttribute attach="attributes-aRad"     args={[aRad,     1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}
