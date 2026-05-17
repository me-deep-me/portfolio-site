import * as THREE from 'three';

/** Camera positions at each of the 5 stations */
const POSITIONS = [
  new THREE.Vector3(0,    1.2, 6.0),   // 0 HERO
  new THREE.Vector3(-1.5, 0.8, 4.5),   // 1 ABOUT
  new THREE.Vector3(2.0,  0.6, 3.0),   // 2 PROJECTS
  new THREE.Vector3(0.5,  2.2, 4.0),   // 3 SKILLS
  new THREE.Vector3(0,    1.0, 7.0),   // 4 CONTACT
];

/** LookAt targets at each station */
const LOOKAT_TARGETS = [
  new THREE.Vector3(0,    0.5, 0),     // 0 HERO
  new THREE.Vector3(-0.5, 0.2, 0),    // 1 ABOUT
  new THREE.Vector3(0.5,  0.2, 0),    // 2 PROJECTS
  new THREE.Vector3(0,    0.5, 0),    // 3 SKILLS
  new THREE.Vector3(0,    0,   0),    // 4 CONTACT
];

/** CatmullRom curves for smooth interpolation */
export const POSITION_CURVE = new THREE.CatmullRomCurve3(POSITIONS, false, 'catmullrom', 0.5);
export const LOOKAT_CURVE   = new THREE.CatmullRomCurve3(LOOKAT_TARGETS, false, 'catmullrom', 0.5);

/**
 * Sample camera position and lookAt target at scroll progress t (0→1).
 * Returns mutable vectors — callers should clone if needed.
 */
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
