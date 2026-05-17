'use client';

import { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/sceneStore';

/* ── Tree constants ── */
const MAX_LEVEL   = 5;
const TREE_BOTTOM = -0.5;
const TREE_TOP    = 4.2;
const GLOW        = new THREE.Color('#6aaee8');
const BODY        = new THREE.Color('#040f1c');

/* ── Seeded pseudo-random (reproducible tree shape) ── */
let _seed = 0;
const resetSeed = () => { _seed = 83741; };
const rand = (): number => {
  _seed = (Math.imul(1664525, _seed) + 1013904223) | 0;
  return (_seed >>> 0) / 0xffffffff;
};

/* ── Perpendicular to v (safe, no zero vectors) ── */
function perpTo(v: THREE.Vector3): THREE.Vector3 {
  const ref = Math.abs(v.y) < 0.9
    ? new THREE.Vector3(0, 1, 0)
    : new THREE.Vector3(1, 0, 0);
  return new THREE.Vector3().crossVectors(ref, v).normalize();
}

/* ── Merge array of BufferGeometry into one (handles indexed geoms) ── */
function mergeGeos(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const pos: number[] = [];
  const nor: number[] = [];
  const idx: number[] = [];
  let off = 0;
  for (const g of geos) {
    g.computeVertexNormals();
    const p = g.getAttribute('position') as THREE.BufferAttribute;
    const n = g.getAttribute('normal')   as THREE.BufferAttribute;
    const i = g.getIndex();
    for (let j = 0; j < p.count; j++) {
      pos.push(p.getX(j), p.getY(j), p.getZ(j));
      if (n) nor.push(n.getX(j), n.getY(j), n.getZ(j));
    }
    if (i) for (let j = 0; j < i.count; j++) idx.push(i.getX(j) + off);
    off += p.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  if (nor.length) out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  if (idx.length) out.setIndex(idx);
  return out;
}

/* ── Procedural tree geometry ── */
function buildTreeGeo(): THREE.BufferGeometry {
  resetSeed();
  const bGeos: THREE.BufferGeometry[] = []; // branch tubes
  const pGeos: THREE.BufferGeometry[] = []; // leaf pads

  function grow(
    origin: THREE.Vector3,
    dir: THREE.Vector3,
    length: number,
    radius: number,
    level: number,
  ) {
    if (level > MAX_LEVEL || length < 0.014) return;

    const end = origin.clone().addScaledVector(dir, length);

    // Organic mid-point: slight perpendicular deviation
    const perp = perpTo(dir);
    const tang = new THREE.Vector3().crossVectors(dir, perp).normalize();
    const mid  = origin.clone().lerp(end, 0.45 + rand() * 0.15);
    mid.addScaledVector(perp, (rand() - 0.5) * length * 0.28);
    mid.addScaledVector(tang, (rand() - 0.5) * length * 0.18);

    // TubeGeometry along curve
    const curve   = new THREE.CatmullRomCurve3([origin.clone(), mid, end.clone()]);
    const tubeSeg = level < 2 ? 10 : 6;
    const radSeg  = level < 2 ? 8  : 6;
    bGeos.push(new THREE.TubeGeometry(curve, tubeSeg, radius, radSeg, false));

    // Leaf pads at tips (level MAX_LEVEL)
    if (level === MAX_LEVEL) {
      const n = 2 + Math.floor(rand() * 2);
      for (let j = 0; j < n; j++) {
        const pad = new THREE.BoxGeometry(0.22 + rand() * 0.12, 0.018, 0.14 + rand() * 0.08);
        const m   = new THREE.Matrix4();
        m.makeRotationY(rand() * Math.PI * 2);
        m.setPosition(
          end.x + (rand() - 0.5) * 0.14,
          end.y + j * 0.035 + rand() * 0.025,
          end.z + (rand() - 0.5) * 0.14,
        );
        pad.applyMatrix4(m);
        pGeos.push(pad);
      }
      return;
    }

    // Branch children: wide-spread angle (tattoo style)
    const nKids = level < 2 ? 3 : 2;
    for (let i = 0; i < nKids; i++) {
      const az   = (i / nKids) * Math.PI * 2 + level * 1.18 + rand() * 0.38;
      const tilt = 0.52 + level * 0.042 + rand() * 0.06;
      const cPerp = perpTo(dir);
      const child = dir.clone()
        .applyAxisAngle(cPerp, tilt)
        .applyAxisAngle(dir, az)
        .normalize();
      grow(end, child, length * 0.57, radius * 0.67, level + 1);
    }
  }

  grow(new THREE.Vector3(0, TREE_BOTTOM, 0), new THREE.Vector3(0, 1, 0), 1.65, 0.055, 0);

  return mergeGeos([...bGeos, ...pGeos]);
}

/* ── EnableClipping: must live inside Canvas ── */
function EnableClipping() {
  const { gl } = useThree();
  useEffect(() => {
    gl.localClippingEnabled = true;
    return () => { gl.localClippingEnabled = false; };
  }, [gl]);
  return null;
}

/* ── TubeTree component ── */
export function TubeTree() {
  const geo      = useMemo(() => buildTreeGeo(), []);
  const matRef   = useRef<THREE.MeshStandardMaterial>(null!);
  const wMatRef  = useRef<THREE.MeshStandardMaterial>(null!);
  const spRef    = useRef(0);
  spRef.current  = useSceneStore(s => s.scrollProgress);

  /**
   * Clipping plane: keeps geometry where y < constant (reveals bottom→top).
   * Plane normal (0,-1,0): positive side is y < constant.
   */
  const growPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), TREE_BOTTOM),
    [],
  );

  useFrame(() => {
    const sp = spRef.current;

    // Reveal: ~60% grown at load (trunk + main branches visible), fully grown by sp≈0.80
    const growth = Math.min(1, 0.55 + sp * 0.55);
    growPlane.constant = TREE_BOTTOM + growth * (TREE_TOP - TREE_BOTTOM);

    // Emissive: ramps up with scroll, pulses at station 3 (skills)
    const pulse      = Math.sin(Date.now() * 0.0016) * 0.1;
    const inStation3 = sp > 0.60 && sp < 0.80;
    const emBase     = 0.22 + sp * 0.50 + (inStation3 ? pulse : 0);
    if (matRef.current)  matRef.current.emissiveIntensity  = emBase * 0.7;
    if (wMatRef.current) wMatRef.current.emissiveIntensity = emBase * 1.3;
  });

  return (
    <group>
      <EnableClipping />

      {/* Solid body */}
      <mesh geometry={geo}>
        <meshStandardMaterial
          ref={matRef}
          color={BODY}
          emissive={GLOW}
          emissiveIntensity={0.22}
          roughness={0.18}
          metalness={0.80}
          clippingPlanes={[growPlane]}
          clipShadows
        />
      </mesh>

      {/* Wireframe glow layer */}
      <mesh geometry={geo}>
        <meshStandardMaterial
          ref={wMatRef}
          color={GLOW}
          emissive={GLOW}
          emissiveIntensity={0.75}
          wireframe
          transparent
          opacity={0.42}
          clippingPlanes={[growPlane]}
          clipShadows
        />
      </mesh>
    </group>
  );
}
