import * as THREE from 'three';

/**
 * Camera zooms IN as user scrolls — DNA fills the frame progressively.
 * Combined with the opening helix pitch, the effect is: tight spiral far away →
 * loose open helix up-close.
 *
 * z: 10.0 → 4.2 over the scroll journey (~2.4× zoom).
 */
const POSITIONS = [
  new THREE.Vector3( 0.0,  0.0, 10.0),   // 0 HERO   — far back, full form visible
  new THREE.Vector3( 1.2,  1.4,  7.5),   // 1 ABOUT  — zooming in, slight right
  new THREE.Vector3( 0.0,  2.6,  5.5),   // 2 PROJ   — mid-zoom, front
  new THREE.Vector3(-1.2,  3.4,  4.2),   // 3 SKILLS — close zoom, left drift
  new THREE.Vector3( 0.0,  3.0,  6.0),   // 4 CONTACT— slight pullback, full open helix
];

const LOOKAT_TARGETS = [
  new THREE.Vector3(0,  0.6, 0),   // lower DNA (tight helix)
  new THREE.Vector3(0,  1.8, 0),
  new THREE.Vector3(0,  2.6, 0),
  new THREE.Vector3(0,  3.2, 0),   // upper DNA (open helix)
  new THREE.Vector3(0,  3.0, 0),
];

export const POSITION_CURVE = new THREE.CatmullRomCurve3(POSITIONS, false, 'catmullrom', 0.5);
export const LOOKAT_CURVE   = new THREE.CatmullRomCurve3(LOOKAT_TARGETS, false, 'catmullrom', 0.5);

export function sampleCameraPath(t: number): {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
} {
  const clamped = Math.min(1, Math.max(0, t));
  return {
    position: POSITION_CURVE.getPoint(clamped),
    lookAt:   LOOKAT_CURVE.getPoint(clamped),
  };
}
