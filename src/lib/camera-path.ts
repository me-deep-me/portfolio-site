import * as THREE from 'three';

/**
 * Camera positions at each of the 5 stations.
 * The tree sits at origin (x=0, z=0), grows from y=-0.45 to ~y+2.
 * We orbit the camera around it so different stations reveal different facets.
 */
const POSITIONS = [
  new THREE.Vector3(0,    1.6,  7.5),   // 0 HERO  — front, mid-height → tree fills frame
  new THREE.Vector3(-4.0, 1.4,  4.0),   // 1 ABOUT — left arc, same height band
  new THREE.Vector3(-1.5, 1.2, -5.5),   // 2 PROJECTS — behind tree, raised so tree stays center
  new THREE.Vector3( 4.5, 2.8,  2.5),   // 3 SKILLS — right, elevated but less extreme
  new THREE.Vector3( 0,   1.4,  9.0),   // 4 CONTACT — front wide shot
];

/** LookAt targets — tracking the tree's visual center (~y=1.4) consistently */
const LOOKAT_TARGETS = [
  new THREE.Vector3(0,   1.4, 0),       // 0 HERO
  new THREE.Vector3(0,   1.3, 0),       // 1 ABOUT
  new THREE.Vector3(0,   1.4, 0),       // 2 PROJECTS
  new THREE.Vector3(0,   1.5, 0),       // 3 SKILLS
  new THREE.Vector3(0,   1.3, 0),       // 4 CONTACT
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
