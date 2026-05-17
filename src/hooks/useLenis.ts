'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, registerGSAP } from '@/lib/gsap-config';
import { useSceneStore } from '@/store/sceneStore';

/**
 * Initialises Lenis smooth scroll, integrates it with GSAP ScrollTrigger,
 * and writes scroll progress to the scene store.
 *
 * Architecture:
 *   gsap.ticker → Lenis.raf()          (single RAF loop)
 *   Lenis.on('scroll') → ScrollTrigger.update() + store.setScrollProgress()
 *   ScrollTrigger.scrollerProxy(body)  (reads scroll position from Lenis)
 */
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);
  const setScrollProgress = useSceneStore((s) => s.setScrollProgress);

  useEffect(() => {
    registerGSAP();

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // Proxy: let ScrollTrigger read from Lenis
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0, left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.body.style.transform ? 'transform' : 'fixed',
    });

    // Sync ScrollTrigger + store on each Lenis scroll tick
    lenis.on('scroll', ({ scroll, limit }: { scroll: number; limit: number }) => {
      ScrollTrigger.update();
      if (limit > 0) setScrollProgress(scroll / limit);
    });

    // Drive Lenis from GSAP ticker (single RAF loop)
    const tickerCb = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
      ScrollTrigger.clearScrollMemory();
    };
  }, [setScrollProgress]);

  return lenisRef;
}
