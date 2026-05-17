import * as THREE from 'three';

/**
 * Camera path for the fluid DNA particle field.
 * The fluid rotates on its own — camera moves subtly to reveal depth.
 * Arc: front → slight-right → front-higher → slight-left → pullback.
 */
const POSITIONS = [
  new THREE.Vector3( 0.0,  0.2, 5.5),   // 0 HERO  — front, low
  new THREE.Vector3( 1.8,  1.2, 5.2),   // 1 ABOUT — right drift
  new THREE.Vector3( 0.0,  2.4, 5.0),   // 2 PROJ  — front, mid-high
  new THREE.Vector3(-1.8,  3.0, 5.2),   // 3 SKILLS — left drift
  new THREE.Vector3( 0.0,  2.8, 7.0),   // 4 CONTACT — front, pulled back
];

const LOOKAT_TARGETS = [
  new THREE.Vector3(0,  0.8, 0),
  new THREE.Vector3(0,  1.6, 0),
  new THREE.Vector3(0,  2.4, 0),
  new THREE.Vector3(0,  2.8, 0),
  new THREE.Vector3(0,  2.6, 0),
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
