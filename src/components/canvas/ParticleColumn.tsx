'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  strand: number;
  y: number;
  jitter: number;
  radial: number;
  phase: number;
  size: number;
  opacity: number;
  drift: number;
}

interface Vortex {
  y: number;
  phase: number;
  strength: number;
  radius: number;
}

interface FrameParticle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  depth: number;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = clamp((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface Props {
  progress: number;
}

export function ParticleColumn({ progress }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame = 0;
    let width  = 0;
    let height = 0;
    let dpr    = 1;

    const particles: Particle[] = Array.from({ length: 980 }, (_, i) => ({
      strand: i % 2,
      y:       seededRandom(i * 7.13 + 3.7),
      jitter:  seededRandom(i * 11.91 + 8.2),
      radial:  seededRandom(i * 17.41 + 2.5),
      phase:   seededRandom(i * 19.17 + 9.9) * Math.PI * 2,
      size:    0.55 + seededRandom(i * 23.3 + 4.4) * 1.35,
      opacity: 0.28 + seededRandom(i * 29.3 + 1.2) * 0.62,
      drift:   seededRandom(i * 31.3 + 6.9) - 0.5,
    }));

    const vortices: Vortex[] = Array.from({ length: 18 }, (_, i) => ({
      y:        seededRandom(i * 13.77 + 1.4),
      phase:    seededRandom(i * 9.31 + 2.8) * Math.PI * 2,
      strength: 0.5 + seededRandom(i * 6.71 + 8.1) * 0.9,
      radius:   0.04 + seededRandom(i * 14.44 + 5.2) * 0.05,
    }));

    const resize = () => {
      dpr           = Math.min(window.devicePixelRatio || 1, 2);
      width         = window.innerWidth;
      height        = window.innerHeight;
      canvas.width  = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width  = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (timeMs: number) => {
      const time         = timeMs * 0.001;
      const p            = progressRef.current;
      const growth       = smoothstep(0.02, 0.96, p);
      const centerX      = width / 2;
      const centerY      = height / 2;
      const columnHeight = Math.min(height * 0.88, 820);
      const topY         = centerY - columnHeight / 2;
      const bottomY      = centerY + columnHeight / 2;
      const revealTop    = bottomY - columnHeight * growth;
      const baseRadius   = Math.max(38, Math.min(78, width * 0.055));

      // Camera orbit: the helix stays conceptually central, the viewpoint circles around it.
      const cameraOrbit = time * 0.22 + p * Math.PI * 1.45;
      const cosCamera   = Math.cos(cameraOrbit);
      const sinCamera   = Math.sin(cameraOrbit);
      const focalLength = baseRadius * 5.9;

      ctx.clearRect(0, 0, width, height);

      const frameParticles: FrameParticle[] = [];

      for (const particle of particles) {
        const yNorm = particle.y;
        const yBase = topY + yNorm * columnHeight;
        if (yBase < revealTop) continue;

        const revealFade = smoothstep(revealTop, revealTop + 120, yBase);
        const edgeFade   = smoothstep(0, 0.08, yNorm) * (1 - smoothstep(0.93, 1, yNorm));
        const helixTurns = Math.PI * 2 * 2.65;
        const helixPhase = particle.strand === 0 ? 0 : Math.PI;

        // Slow internal drift keeps the ink alive without looking spun.
        const internalFlow = time * 0.055;
        const angle        = yNorm * helixTurns + helixPhase + internalFlow + particle.phase * 0.08;

        const breathing   = 1 + 0.17 * Math.sin(time * 1.4 + yNorm * 18) + 0.06 * Math.sin(time * 2.7 + yNorm * 37);
        const localRadius = baseRadius * breathing * (0.72 + particle.radial * 0.62);

        let vortexX = 0, vortexY = 0, vortexZ = 0;
        for (const vortex of vortices) {
          const dy        = yNorm - vortex.y;
          const influence = Math.exp(-(dy * dy) / (vortex.radius * vortex.radius));
          if (influence > 0.001) {
            const va  = time * (1.2 + vortex.strength) + vortex.phase + dy * 46;
            vortexX  += Math.cos(va) * influence * 10 * vortex.strength;
            vortexY  += Math.sin(va) * influence * 7  * vortex.strength;
            vortexZ  += Math.sin(va * 0.8 + particle.phase) * influence * 9 * vortex.strength;
          }
        }

        const liquidNoiseX = Math.sin(time * 0.85 + particle.phase + yNorm * 31)         * 7 * particle.jitter;
        const liquidNoiseY = Math.cos(time * 0.65 + particle.phase * 1.7 + yNorm * 19)   * 5 * particle.drift;
        const liquidNoiseZ = Math.sin(time * 0.72 + particle.phase * 1.3 + yNorm * 23)   * 8 * particle.jitter;

        // 3D helix, then rotate camera around vertical axis.
        const objectX = Math.sin(angle) * localRadius + liquidNoiseX + vortexX;
        const objectZ = Math.cos(angle) * localRadius + liquidNoiseZ + vortexZ;
        const cameraX = objectX * cosCamera - objectZ * sinCamera;
        const cameraZ = objectX * sinCamera + objectZ * cosCamera;

        // Perspective projection
        const perspective = clamp(focalLength / Math.max(focalLength - cameraZ, focalLength * 0.42), 0.68, 1.42);
        const depth01     = clamp((cameraZ / baseRadius + 1.65) / 3.3);
        const x           = centerX + cameraX * perspective;
        const y           = yBase + liquidNoiseY + vortexY + cameraZ * 0.025;

        const alpha = particle.opacity * revealFade * edgeFade * (0.32 + depth01 * 0.72);
        const size  = particle.size * perspective * (0.82 + depth01 * 0.26);

        frameParticles.push({ x, y, size, alpha, depth: cameraZ });
      }

      // Back-to-front draw for depth perception.
      frameParticles.sort((a, b) => a.depth - b.depth);

      for (const fp of frameParticles) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(0, 0, 0, ${fp.alpha})`;
        ctx.arc(fp.x, fp.y, fp.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Liquid surface line at growth frontier
      const liquidLineAlpha = clamp((growth - 0.02) / 0.2) * 0.08;
      if (liquidLineAlpha > 0) {
        const gradient = ctx.createLinearGradient(0, revealTop - 22, 0, revealTop + 34);
        gradient.addColorStop(0,   'rgba(0,0,0,0)');
        gradient.addColorStop(0.5, `rgba(0,0,0,${liquidLineAlpha})`);
        gradient.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(centerX - baseRadius * 1.9, revealTop - 24, baseRadius * 3.8, 58);
      }

      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    animationFrame = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
