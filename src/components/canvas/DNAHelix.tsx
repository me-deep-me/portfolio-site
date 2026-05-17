'use client';

import { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/sceneStore';

/* ── DNA constants ── */
const HELIX_RADIUS  = 0.52;
const HELIX_PITCH   = 1.1;
const HELIX_TURNS   = 7;
const HELIX_HEIGHT  = HELIX_PITCH * HELIX_TURNS;   // 7.7
const STRAND_R      = 0.052;
const RUNG_R        = 0.018;
const SPHERE_R      = 0.072;
const RUNG_PER_TURN = 10;
const RUNG_COUNT    = HELIX_TURNS * RUNG_PER_TURN;  // 70
const STRAND_SEGS   = 140;
export const DNA_BOTTOM  = -1.0;
export const DNA_TOP     = DNA_BOTTOM + HELIX_HEIGHT;  // 6.7

/* ── Build a helical strand tube ── */
function buildStrand(phase: number): THREE.TubeGeometry {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= STRAND_SEGS; i++) {
    const t     = i / STRAND_SEGS;
    const y     = DNA_BOTTOM + t * HELIX_HEIGHT;
    const angle = t * HELIX_TURNS * Math.PI * 2 + phase;
    pts.push(new THREE.Vector3(
      HELIX_RADIUS * Math.cos(angle),
      y,
      HELIX_RADIUS * Math.sin(angle),
    ));
  }
  return new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(pts),
    STRAND_SEGS, STRAND_R, 10, false,
  );
}

/* ── Enable local clipping (must be inside Canvas) ── */
function EnableClipping() {
  const { gl } = useThree();
  useEffect(() => {
    gl.localClippingEnabled = true;
    return () => { gl.localClippingEnabled = false; };
  }, [gl]);
  return null;
}

export function DNAHelix() {
  const geoA    = useMemo(() => buildStrand(0), []);
  const geoB    = useMemo(() => buildStrand(Math.PI), []);

  const rungRef  = useRef<THREE.InstancedMesh>(null!);
  const sphRef   = useRef<THREE.InstancedMesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  const spRef   = useRef(0);
  spRef.current = useSceneStore(s => s.scrollProgress);

  /* Clipping plane: y < constant → visible (reveals bottom-to-top) */
  const growPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), DNA_BOTTOM),
    [],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const UP    = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  /* Pre-compute rung / sphere positions (static, only plane moves) */
  const rungData = useMemo(() => {
    return Array.from({ length: RUNG_COUNT }, (_, i) => {
      const t     = i / RUNG_COUNT;
      const y     = DNA_BOTTOM + t * HELIX_HEIGHT;
      const angle = t * HELIX_TURNS * Math.PI * 2;
      const posA  = new THREE.Vector3(
        HELIX_RADIUS * Math.cos(angle), y, HELIX_RADIUS * Math.sin(angle),
      );
      const posB  = new THREE.Vector3(
        HELIX_RADIUS * Math.cos(angle + Math.PI), y, HELIX_RADIUS * Math.sin(angle + Math.PI),
      );
      return {
        posA, posB,
        mid: posA.clone().lerp(posB, 0.5),
        len: posA.distanceTo(posB),
      };
    });
  }, []);

  /* Set instance matrices once on mount */
  useEffect(() => {
    if (!rungRef.current || !sphRef.current) return;
    for (let i = 0; i < RUNG_COUNT; i++) {
      const { posA, posB, mid, len } = rungData[i];
      const dir = posB.clone().sub(posA).normalize();

      // Rung cylinder
      dummy.position.copy(mid);
      dummy.quaternion.setFromUnitVectors(UP, dir);
      dummy.scale.set(1, len, 1);
      dummy.updateMatrix();
      rungRef.current.setMatrixAt(i, dummy.matrix);

      // Sphere A
      dummy.position.copy(posA);
      dummy.quaternion.identity();
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      sphRef.current.setMatrixAt(i * 2, dummy.matrix);

      // Sphere B
      dummy.position.copy(posB);
      dummy.updateMatrix();
      sphRef.current.setMatrixAt(i * 2 + 1, dummy.matrix);
    }
    rungRef.current.instanceMatrix.needsUpdate = true;
    sphRef.current.instanceMatrix.needsUpdate  = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, delta) => {
    const sp = spRef.current;

    /* 50% grown at scroll=0, fully grown by scroll≈0.85 */
    const growth = Math.min(1, 0.50 + sp * 0.59);
    growPlane.constant = DNA_BOTTOM + growth * HELIX_HEIGHT;

    /* Slow Y rotation */
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.22;
  });

  const planes = [growPlane];

  return (
    <group ref={groupRef}>
      <EnableClipping />

      {/* Strand A — sky-blue liquid glass */}
      <mesh geometry={geoA}>
        <meshPhysicalMaterial
          color="#7ab8f5"
          transmission={0.88}
          roughness={0.04}
          metalness={0}
          thickness={1.0}
          ior={1.45}
          transparent
          opacity={0.94}
          clippingPlanes={planes}
          clipShadows
        />
      </mesh>

      {/* Strand B — soft violet liquid glass */}
      <mesh geometry={geoB}>
        <meshPhysicalMaterial
          color="#c8a0f0"
          transmission={0.88}
          roughness={0.04}
          metalness={0}
          thickness={1.0}
          ior={1.45}
          transparent
          opacity={0.94}
          clippingPlanes={planes}
          clipShadows
        />
      </mesh>

      {/* Rungs — white glass rungs */}
      <instancedMesh ref={rungRef} args={[undefined, undefined, RUNG_COUNT]}>
        <cylinderGeometry args={[RUNG_R, RUNG_R, 1, 6]} />
        <meshPhysicalMaterial
          color="#e8f0ff"
          transmission={0.72}
          roughness={0.06}
          metalness={0}
          thickness={0.5}
          ior={1.40}
          transparent
          opacity={0.88}
          clippingPlanes={planes}
        />
      </instancedMesh>

      {/* Sphere nodes — teal crystal */}
      <instancedMesh ref={sphRef} args={[undefined, undefined, RUNG_COUNT * 2]}>
        <sphereGeometry args={[SPHERE_R, 12, 8]} />
        <meshPhysicalMaterial
          color="#55aadf"
          transmission={0.62}
          roughness={0.02}
          metalness={0.15}
          thickness={0.4}
          ior={1.50}
          transparent
          opacity={0.92}
          clippingPlanes={planes}
        />
      </instancedMesh>
    </group>
  );
}
