'use client';

/**
 * FluidDNA — black liquid particle field on white background.
 *
 * Scroll drives two simultaneous effects:
 *  1. uGrowth  → reveals the form bottom-to-top
 *  2. uScroll  → opens the helix pitch (turns 5.8 → 2.4, like a spring uncoiling)
 *
 * Camera zooms in via camera-path.ts, so the uncoiling form fills the frame.
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/sceneStore';

const N = 18_000;

/* ── Vertex shader ── */
const VERT = /* glsl */`
  attribute float aT;       // 0→1 position along helix height
  attribute float aSeed;    // 0→1 random per-particle
  attribute float aStrand;  // 0.0 or 1.0 (+ free drifters ~0.5)
  attribute float aRad;     // signed radial offset from helix axis

  uniform float uTime;
  uniform float uGrowth;   // 0→1, visible height fraction
  uniform float uScroll;   // 0→1, drives pitch opening

  varying float vAlpha;

  const float PI      = 3.14159265359;
  const float TWO_PI  = 6.28318530718;
  const float HEIGHT  = 7.0;
  const float BOT     = -1.0;

  void main() {
    /* ── Pitch opens with scroll: 5.8 turns → 2.4 turns ── */
    float turns   = mix(5.8, 2.4, uScroll);
    float helixR  = mix(0.44, 0.60, uScroll); // radius grows slightly too

    /* ── World Y ── */
    float yWorld = BOT + aT * HEIGHT;

    /* ── Slow global spin ── */
    float spin = uTime * 0.24;

    /* ── Strand angle (free drifters: aStrand ∈ (0,1), gives random intermediate phase) ── */
    float strandPhase = aStrand * PI;
    float baseAngle   = aT * turns * TWO_PI + strandPhase + spin;

    /* ── Fluid 1: radial breathing ── */
    float breathe = 0.10 * sin(uTime * 0.55 + aSeed * TWO_PI + aT * PI * 1.9);

    /* ── Fluid 2: angular drift ── */
    float drift = 0.14 * sin(uTime * 0.36 + aSeed * 4.9);

    /* ── Fluid 3: circular eddies along each turn ── */
    float turnPhase = mod(aT * turns, 1.0) * TWO_PI;
    float eddyAmp   = 0.08 * abs(sin(turnPhase * 0.5));
    float eddyAngle = turnPhase + uTime * 1.0 + aSeed * TWO_PI;

    /* ── Compose position ── */
    float r     = helixR + aRad + breathe;
    float angle = baseAngle + drift;

    float x = r * cos(angle) + eddyAmp * sin(eddyAngle);
    float y = yWorld
              + 0.055 * sin(uTime * 0.82 + aSeed * 7.1)
              + 0.030 * sin(uTime * 1.35 + aT * TWO_PI);
    float z = r * sin(angle) + eddyAmp * cos(eddyAngle);

    /* ── Growth clip ── */
    float growthTop = BOT + uGrowth * HEIGHT;
    float clipFade  = smoothstep(growthTop, growthTop - 0.55, y);
    float botFade   = smoothstep(BOT - 0.05, BOT + 0.40, y);

    /* ── Alpha: denser near core ── */
    float distCore = abs(aRad + breathe);
    float coreA    = clamp(0.88 - distCore * 2.2, 0.0, 1.0);
    vAlpha = coreA * clipFade * botFade;

    /* ── Point size: perspective-scaled, bigger as camera zooms in ── */
    float sz     = mix(6.5, 2.2, distCore * 2.8);
    vec4  mvPos  = modelViewMatrix * vec4(x, y, z, 1.0);
    gl_PointSize = clamp(sz * 9.0 / -mvPos.z, 1.5, 18.0);
    gl_Position  = projectionMatrix * mvPos;
  }
`;

/* ── Fragment shader ── */
const FRAG = /* glsl */`
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5)) * 2.0;
    if (d > 1.0) discard;

    /* Soft ink droplet */
    float a = smoothstep(1.0, 0.10, d) * vAlpha;
    if (a < 0.004) discard;

    gl_FragColor = vec4(0.04, 0.04, 0.07, a);
  }
`;

export function FluidDNA() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const spRef  = useRef(0);
  spRef.current = useSceneStore(s => s.scrollProgress);

  const { positions, aT, aSeed, aStrand, aRad } = useMemo(() => {
    const positions = new Float32Array(N * 3);
    const aT        = new Float32Array(N);
    const aSeed     = new Float32Array(N);
    const aStrand   = new Float32Array(N);
    const aRad      = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      aT[i]    = Math.random();
      aSeed[i] = Math.random();
      /* Two main strands (0, 1) + ~18% free-drifters (fractional aStrand) */
      const r = Math.random();
      aStrand[i] = r < 0.42 ? 0.0
                 : r < 0.82 ? 1.0
                 : Math.random();           // free: intermediate phase
      /* Radial: concentrated near axis, long fat tail for fluid texture */
      const u = Math.random();
      aRad[i] = (u * u - 0.5) * 0.58;     // quadratic → more particles near core
    }

    return { positions, aT, aSeed, aStrand, aRad };
  }, []);

  const uniforms = useMemo(() => ({
    uTime:   { value: 0 },
    uGrowth: { value: 0.50 },
    uScroll: { value: 0 },
  }), []);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const sp = spRef.current;
    matRef.current.uniforms.uTime.value   = clock.elapsedTime;
    matRef.current.uniforms.uGrowth.value = Math.min(1.0, 0.50 + sp * 0.59);
    matRef.current.uniforms.uScroll.value = sp;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
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
