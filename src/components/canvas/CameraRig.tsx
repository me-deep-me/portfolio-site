'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { sampleCameraPath } from '@/lib/camera-path';
import { useSceneStore } from '@/store/sceneStore';
import { CAMERA_LERP_BASE } from '@/lib/constants';

const _targetPos  = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _currentPos = new THREE.Vector3();

export function CameraRig() {
  const scrollProgress = useSceneStore((s) => s.scrollProgress);
  const scrollRef = useRef(0);

  // Keep a ref to avoid closure staleness inside useFrame
  scrollRef.current = scrollProgress;

  useFrame(({ camera }, delta) => {
    const { position, lookAt } = sampleCameraPath(scrollRef.current);
    _targetPos.copy(position);
    _targetLook.copy(lookAt);

    // Frame-rate-independent lerp: factor = 1 - 0.04^delta (~0.14 @ 60fps)
    const alpha = 1 - Math.pow(CAMERA_LERP_BASE, delta);

    _currentPos.copy(camera.position);
    camera.position.lerp(_targetPos, alpha);

    // Lerp lookAt by constructing a quaternion target
    const tempCam = camera.clone();
    tempCam.position.copy(_targetPos);
    tempCam.lookAt(_targetLook);

    camera.quaternion.slerp(tempCam.quaternion, alpha);
  });

  return null;
}
