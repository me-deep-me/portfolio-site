'use client';

import { useEffect, useRef } from 'react';

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

interface Particle {
  seed: number;
  strand: number;        // -1 or +1
  yBase: number;
  radius: number;
  speed: number;
  phase: number;
  cylinderAngle: number;
  cylinderRadius: number;
  depth: number;
  accent: 'black' | 'blue' | 'cyan';
}

interface Props {
  progress: number;
  projectsActive: boolean;
}

export function ParticleColumn({ progress, projectsActive }: Props) {
  const canvasRef         = useRef<HTMLCanvasElement | null>(null);
  const targetProgressRef = useRef(progress);
  const projectsActiveRef = useRef(projectsActive);

  useEffect(() => {
    targetProgressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    projectsActiveRef.current = projectsActive;
  }, [projectsActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width  = 0;
    let height = 0;
    let raf    = 0;
    let dpr    = 1;
    let dnaMorph = projectsActiveRef.current ? 1 : 0;
    let visualProgress = targetProgressRef.current;
    let paused = document.hidden;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const particleCount = reduceMotion ? 140 : isMobile ? 320 : 680;

    const particles: Particle[] = Array.from({ length: particleCount }, (_, i) => {
      const strand    = i % 2 === 0 ? -1 : 1;
      const blueRoll  = Math.random();
      const accent: Particle['accent'] =
        blueRoll > 0.94 ? 'blue' :
        blueRoll > 0.88 ? 'cyan' : 'black';

      return {
        seed: Math.random() * 1000,
        strand,
        yBase: Math.random(),
        radius: 0.55 + Math.random() * 1.45,
        speed: 0.35 + Math.random() * 0.75,
        phase: Math.random() * Math.PI * 2,
        cylinderAngle: Math.random() * Math.PI * 2,
        cylinderRadius: 0.34 + Math.random() * 0.82,
        depth: 0.35 + Math.random() * 0.9,
        accent,
      };
    });

    const resize = () => {
      width  = window.innerWidth;
      height = window.innerHeight;
      dpr    = Math.min(window.devicePixelRatio || 1, width < 768 ? 1.35 : 2);
      canvas.width  = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width  = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      if (paused) {
        raf = window.requestAnimationFrame(draw);
        return;
      }

      const t        = time * 0.001;
      visualProgress += (targetProgressRef.current - visualProgress) * (reduceMotion ? 0.035 : 0.075);
      const p        = visualProgress;
      const targetMorph = projectsActiveRef.current ? 1 : 0;
      dnaMorph += (targetMorph - dnaMorph) * (reduceMotion ? 0.04 : 0.072);
      const cx       = width * 0.5;
      const dnaPull  = dnaMorph * dnaMorph;
      const columnH  = height * lerp(0.8, 0.94, dnaPull);
      const top      = (height - columnH) * 0.5;
      const cylinderAmp = Math.min(width * 0.092, 86);
      const dnaAmp      = Math.min(width * 0.075, 68);
      const amp         = lerp(cylinderAmp, dnaAmp, dnaPull);
      const twist       = lerp(2.3, 4.2, dnaPull);
      const cameraOrbit = t * lerp(reduceMotion ? 0.045 : 0.13, reduceMotion ? 0.055 : 0.16, dnaPull) + p * Math.PI * 1.55;

      ctx.clearRect(0, 0, width, height);

      if (dnaMorph > 0.2) {
        for (let strand = 0; strand < 2; strand += 1) {
          ctx.beginPath();
          for (let i = 0; i <= 84; i += 1) {
            const yNorm = i / 84;
            const angle = yNorm * Math.PI * twist + (strand === 0 ? 0 : Math.PI) + cameraOrbit;
            const x = cx + Math.cos(angle) * amp;
            const y = top + yNorm * columnH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = `rgba(15, 23, 42, ${0.08 * dnaPull})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        const bridges = 26;
        for (let i = 0; i < bridges; i += 1) {
          const yNorm  = i / Math.max(bridges - 1, 1);
          const angle  = yNorm * Math.PI * twist + cameraOrbit;
          const z      = (Math.sin(angle) + 1) * 0.5;
          const y      = top + yNorm * columnH;
          const x1     = cx + Math.cos(angle) * amp;
          const x2     = cx - Math.cos(angle) * amp;
          const bridgeAlpha = clamp((0.035 + z * 0.11) * dnaPull, 0, 0.16);

          ctx.beginPath();
          ctx.strokeStyle = `rgba(15, 23, 42, ${bridgeAlpha})`;
          ctx.lineWidth   = 0.8;
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.stroke();
        }
      }

      for (const particle of particles) {
        const yNorm         = (particle.yBase + t * (reduceMotion ? 0.006 : 0.018) * particle.speed) % 1;
        const cylinderAngle = particle.cylinderAngle + cameraOrbit * 0.72 +
                              Math.sin(t * 0.2 + particle.seed) * 0.12;
        const strandPhase   = particle.strand > 0 ? 0 : Math.PI;
        const dnaAngle      = yNorm * Math.PI * twist + strandPhase + cameraOrbit +
                              Math.sin(t * 0.28 + particle.seed) * 0.045;

        const cylinderX = Math.cos(cylinderAngle) * amp * particle.cylinderRadius;
        const dnaX      = Math.cos(dnaAngle) * amp +
                          Math.sin(particle.phase + t * 0.32) * 2.4;
        const noise     = Math.sin(t * particle.speed + particle.seed + yNorm * 14) * lerp(13, 1.4, dnaPull);

        const cylinderZ = (Math.sin(cylinderAngle) + 1) * 0.5;
        const dnaZ      = (Math.sin(dnaAngle) + 1) * 0.5;
        const z         = lerp(cylinderZ, dnaZ, dnaPull);

        const x     = cx + lerp(cylinderX, dnaX, dnaPull) + noise;
        const y     = top + yNorm * columnH + Math.sin(t * particle.speed + particle.seed) * lerp(6, 1.1, dnaPull);
        const alpha = clamp(0.15 + z * 0.46 + dnaPull * 0.16, 0.11, 0.86);
        const size  = particle.radius * lerp(0.75, 1.35, z) * particle.depth;

        let fill = `rgba(18, 18, 18, ${alpha})`;
        if (particle.accent === 'blue') fill = `rgba(37, 99, 235, ${alpha * 0.72})`;
        if (particle.accent === 'cyan') fill = `rgba(14, 165, 233, ${alpha * 0.55})`;

        ctx.beginPath();
        ctx.fillStyle = fill;
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = window.requestAnimationFrame(draw);
    };

    const onVisibilityChange = () => {
      paused = document.hidden;
    };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibilityChange);
    raf = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-50 md:opacity-75"
    />
  );
}
