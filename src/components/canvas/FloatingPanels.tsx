'use client';

import { Panel } from './Panel';
import { useSceneStore } from '@/store/sceneStore';

/** 8 panel positions arranged in a loose arc around the scene center */
const PANEL_TRANSFORMS: Array<{
  pos: [number, number, number];
  rot: [number, number, number];
}> = [
  { pos: [-2.2,  0.4, -0.8], rot: [0,  0.35, 0] },
  { pos: [-1.0,  1.1, -1.2], rot: [0,  0.15, 0] },
  { pos: [ 0.3,  0.8, -1.5], rot: [0,  0.0,  0] },
  { pos: [ 1.6,  0.2, -1.1], rot: [0, -0.25, 0] },
  { pos: [ 2.4,  1.0, -0.5], rot: [0, -0.40, 0] },
  { pos: [-1.8, -0.3, -0.6], rot: [0,  0.20, 0] },
  { pos: [ 0.8, -0.2, -0.9], rot: [0, -0.10, 0] },
  { pos: [ 2.0, -0.5,  0.2], rot: [0, -0.50, 0] },
];

export function FloatingPanels() {
  const panels = useSceneStore((s) => s.panels);

  return (
    <group>
      {panels.map((panel, i) => (
        <Panel
          key={panel.id}
          index={i}
          position={PANEL_TRANSFORMS[i].pos}
          rotation={PANEL_TRANSFORMS[i].rot}
          isActive={panel.isActive}
          glowIntensity={panel.glowIntensity}
        />
      ))}
    </group>
  );
}
