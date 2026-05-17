import * as THREE from 'three';

/**
 * Camera path tuned for the wider DNA (radius 0.9 → 1.45).
 * Pulls back enough at scroll=0 to show the full tight helix,
 * then zooms in as it uncoils and widens.
 */
const POSITIONS = [
  new THREE.Vector3( 0.0,  0.0, 11.0),   // 0 HERO   — far, full tight helix
  new THREE.Vector3( 1.5,  1.5,  8.5),   // 1 ABOUT  — zooming, slight right
  new THREE.Vector3( 0.0,  2.5,  6.5),   // 2 PROJ   — mid-zoom
  new THREE.Vector3(-1.5,  3.2,  5.5),   // 3 SKILLS — close, left drift
  new THREE.Vector3( 0.0,  3.0,  7.0),   // 4 CONTACT— slight pullback
];

const LOOKAT_TARGETS = [
  new THREE.Vector3(0,  0.4, 0),
  new THREE.Vector3(0,  1.6, 0),
  new THREE.Vector3(0,  2.6, 0),
  new THREE.Vector3(0,  3.2, 0),
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
