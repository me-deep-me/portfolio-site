'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/sceneStore';

/* ─── Tree parameters ─── */
const MAX_LEVEL    = 5;
const ROOT_LENGTH  = 1.85;
const ROOT_WIDTH   = 0.13;
const LENGTH_RATIO = 0.60;
const WIDTH_RATIO  = 0.68;
const ROOT_ORIGIN  = new THREE.Vector3(0, -0.45, 0);

/* ─── Materials colors ─── */
const BODY_COLOR = new THREE.Color('#05101f');
const GLOW_COLOR = new THREE.Color('#6aaee8');

/* ─── Branch data ─── */
interface Branch {
  origin: THREE.Vector3;
  dir: THREE.Vector3;
  length: number;
  width: number;
  level: number;
  idx: number;
  revealT: number; // 0→1, order in which this branch appears
}

/* ─── Procedural L-system tree ─── */
function buildTree(): Branch[] {
  const list: Branch[] = [];

  function grow(
    origin: THREE.Vector3,
    dir: THREE.Vector3,
    length: number,
    width: number,
    level: number,
  ) {
    if (level > MAX_LEVEL || length < 0.018) return;

    list.push({
      origin: origin.clone(),
      dir: dir.clone().normalize(),
      length,
      width,
      level,
      idx: list.length,
      revealT: 0, // set below
    });

    const tip = origin.clone().addScaledVector(dir.normalize(), length);
    const nChildren = level < 2 ? 3 : 2;

    for (let i = 0; i < nChildren; i++) {
      const az   = (i / nChildren) * Math.PI * 2 + level * 1.18 + i * 0.42;
      const tilt = 0.28 + level * 0.058;

      // Perpendicular to dir
      const perp = Math.abs(dir.y) < 0.95
        ? new THREE.Vector3(0, 1, 0).cross(dir).normalize()
        : new THREE.Vector3(1, 0, 0).cross(dir).normalize();

      // Tilt then azimuth-rotate around parent direction
      const childDir = dir.clone()
        .applyAxisAngle(perp, tilt)
        .applyAxisAngle(dir, az)
        .normalize();

      grow(tip, childDir, length * LENGTH_RATIO, width * WIDTH_RATIO, level + 1);
    }
  }

  grow(ROOT_ORIGIN, new THREE.Vector3(0, 1, 0), ROOT_LENGTH, ROOT_WIDTH, 0);

  /* Assign revealT: level is primary, index-within-level adds micro-stagger */
  const byLevel = new Map<number, Branch[]>();
  list.forEach(b => {
    if (!byLevel.has(b.level)) byLevel.set(b.level, []);
    byLevel.get(b.level)!.push(b);
  });
  list.forEach(b => {
    const inLevel   = byLevel.get(b.level)!;
    const posNorm   = inLevel.indexOf(b) / Math.max(1, inLevel.length - 1);
    b.revealT = (b.level / MAX_LEVEL) * 0.88 + posNorm * (0.12 / MAX_LEVEL);
  });

  return list;
}

/* ─── Component ─── */
export function BoxTree() {
  const branches = useMemo(() => buildTree(), []);
  const count    = branches.length;

  const groupRef = useRef<THREE.Group>(null!);
  const bodyRef  = useRef<THREE.InstancedMesh>(null!);
  const wireRef  = useRef<THREE.InstancedMesh>(null!);

  const matRef  = useRef<THREE.MeshStandardMaterial>(null!);
  const wMatRef = useRef<THREE.MeshStandardMaterial>(null!);

  const dummy  = useMemo(() => new THREE.Object3D(), []);
  const UP     = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  const spRef  = useRef(0);
  const scrollProgress = useSceneStore(s => s.scrollProgress);
  spRef.current = scrollProgress;

  useFrame((_, delta) => {
    if (!bodyRef.current || !wireRef.current) return;
    const sp = spRef.current;

    // Tree starts partially grown at hero, fully grown by station 2 (sp≈0.45)
    // growth=0.20 at scroll=0 → trunk + level-1 branches visible from the start
    const growth = Math.min(1, 0.20 + sp / 0.65);

    for (const b of branches) {
      // Each branch reveals as growth surpasses its revealT
      const bProg = Math.min(1, Math.max(0, (growth - b.revealT) / 0.10));

      if (bProg <= 0) {
        dummy.position.set(0, -9999, 0);
        dummy.scale.setScalar(0.0001);
        dummy.updateMatrix();
        bodyRef.current.setMatrixAt(b.idx, dummy.matrix);
        wireRef.current.setMatrixAt(b.idx, dummy.matrix);
        continue;
      }

      // Branch grows from its origin toward its tip
      const len = b.length * bProg;
      dummy.position.copy(b.origin).addScaledVector(b.dir, len * 0.5);
      dummy.quaternion.setFromUnitVectors(UP, b.dir);
      dummy.scale.set(b.width, len, b.width);
      dummy.updateMatrix();
      bodyRef.current.setMatrixAt(b.idx, dummy.matrix);

      // Wireframe slightly enlarged for edge glow
      dummy.scale.set(b.width * 1.04, len * 1.002, b.width * 1.04);
      dummy.updateMatrix();
      wireRef.current.setMatrixAt(b.idx, dummy.matrix);
    }

    bodyRef.current.instanceMatrix.needsUpdate = true;
    wireRef.current.instanceMatrix.needsUpdate = true;

    // Bloom intensity: ramps up with scroll, pulses at station 3 (skills)
    const pulse     = Math.sin(Date.now() * 0.0015) * 0.12;
    const inStation3 = sp > 0.60 && sp < 0.80;
    const emissive  = 0.28 + sp * 0.45 + (inStation3 ? pulse : 0);

    if (matRef.current)  matRef.current.emissiveIntensity  = emissive * 0.6;
    if (wMatRef.current) wMatRef.current.emissiveIntensity = emissive * 1.4;
  });

  return (
    <group ref={groupRef}>
      {/* ── Solid body ── */}
      <instancedMesh ref={bodyRef} args={[undefined, undefined, count]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={matRef}
          color={BODY_COLOR}
          emissive={GLOW_COLOR}
          emissiveIntensity={0.28}
          roughness={0.12}
          metalness={0.88}
          transparent
          opacity={0.85}
        />
      </instancedMesh>

      {/* ── Wireframe glow layer ── */}
      <instancedMesh ref={wireRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={wMatRef}
          color={GLOW_COLOR}
          emissive={GLOW_COLOR}
          emissiveIntensity={0.85}
          roughness={0.0}
          metalness={1.0}
          wireframe
          transparent
          opacity={0.55}
        />
      </instancedMesh>
    </group>
  );
}
