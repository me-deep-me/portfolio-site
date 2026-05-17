'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PanelProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  isActive: boolean;
  glowIntensity: number;
  index: number;
}

const PANEL_COLOR  = new THREE.Color('#0f1e2e');
const BORDER_COLOR = new THREE.Color('#6aaee8');

export function Panel({ position, rotation = [0, 0, 0], isActive, glowIntensity }: PanelProps) {
  const groupRef    = useRef<THREE.Group>(null!);
  const borderRef   = useRef<THREE.MeshStandardMaterial>(null!);
  const bodyRef     = useRef<THREE.MeshStandardMaterial>(null!);
  const glowTarget  = useRef(0);

  useFrame((_, delta) => {
    glowTarget.current = isActive ? glowIntensity : 0;
    const alpha = 1 - Math.pow(0.08, delta);

    if (borderRef.current) {
      borderRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        borderRef.current.emissiveIntensity,
        glowTarget.current * 1.2,
        alpha
      );
    }
    if (bodyRef.current) {
      bodyRef.current.opacity = THREE.MathUtils.lerp(
        bodyRef.current.opacity,
        isActive ? 0.92 : 0,
        alpha
      );
    }
    // Float animation
    if (groupRef.current) {
      groupRef.current.position.y =
        position[1] + Math.sin(Date.now() * 0.001 + position[0]) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[1.4, 0.8, 0.04]} />
        <meshStandardMaterial
          ref={bodyRef}
          color={PANEL_COLOR}
          transparent
          opacity={0}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
      {/* Emissive border strip (top edge) */}
      <mesh position={[0, 0.4, 0.021]}>
        <boxGeometry args={[1.4, 0.006, 0.002]} />
        <meshStandardMaterial
          ref={borderRef}
          color={BORDER_COLOR}
          emissive={BORDER_COLOR}
          emissiveIntensity={0}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      {/* Left edge */}
      <mesh position={[-0.7, 0, 0.021]}>
        <boxGeometry args={[0.006, 0.8, 0.002]} />
        <meshStandardMaterial
          color={BORDER_COLOR}
          emissive={BORDER_COLOR}
          emissiveIntensity={0}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}
