import * as THREE from 'three';

/**
 * Camera positions at each of the 5 stations.
 * The tree sits at origin (x=0, z=0), grows from y=-0.45 to ~y+2.
 * We orbit the camera around it so different stations reveal different facets.
 */
const POSITIONS = [
  new THREE.Vector3(0,    2.2,  8.0),   // 0 HERO  — front, high, far → full tree silhouette
  new THREE.Vector3(-4.5, 1.0,  4.5),   // 1 ABOUT — hard left, mid distance
  new THREE.Vector3(-1.5, 0.3, -5.5),   // 2 PROJECTS — behind the tree, low angle
  new THREE.Vector3( 5.0, 3.5,  2.5),   // 3 SKILLS — right, elevated, bird's eye
  new THREE.Vector3( 0,   1.5,  9.0),   // 4 CONTACT — front again, wider shot
];

/** LookAt targets — all pointing toward the tree's visual center */
const LOOKAT_TARGETS = [
  new THREE.Vector3(0,   1.2, 0),       // 0 HERO
  new THREE.Vector3(0,   0.8, 0),       // 1 ABOUT
  new THREE.Vector3(0,   1.0, 0),       // 2 PROJECTS — looking at tree from behind
  new THREE.Vector3(0,   1.4, 0),       // 3 SKILLS
  new THREE.Vector3(0,   1.0, 0),       // 4 CONTACT
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
