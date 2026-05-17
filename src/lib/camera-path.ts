import * as THREE from 'three';

/**
 * Camera path orbiting the DNA helix.
 * DNA grows from y=-1.0 to y=6.7, visual center tracks upward with scroll.
 * Camera arcs: front → right → front-high → left → front-pullback.
 */
const POSITIONS = [
  new THREE.Vector3( 0.0,  0.5, 5.5),   // 0 HERO  — front, lower DNA in frame
  new THREE.Vector3( 3.0,  1.5, 4.5),   // 1 ABOUT — right orbit
  new THREE.Vector3( 0.0,  2.8, 5.0),   // 2 PROJ  — front, mid-height
  new THREE.Vector3(-3.0,  3.5, 4.5),   // 3 SKILLS — left orbit, higher
  new THREE.Vector3( 0.0,  3.2, 7.0),   // 4 CONTACT — front, pulled back
];

/** LookAt targets tracking the growing DNA center */
const LOOKAT_TARGETS = [
  new THREE.Vector3(0,  1.0, 0),   // lower DNA visible
  new THREE.Vector3(0,  2.0, 0),   // mid DNA
  new THREE.Vector3(0,  2.8, 0),   // mid-upper DNA
  new THREE.Vector3(0,  3.2, 0),   // upper DNA
  new THREE.Vector3(0,  3.0, 0),   // full DNA
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
