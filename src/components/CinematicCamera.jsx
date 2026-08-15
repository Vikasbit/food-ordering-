import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const CAMERA_KEYFRAMES = [
  { progress: 0.0, pos: new THREE.Vector3(0, 1.5, 5), target: new THREE.Vector3(0, 0, 0) },
  { progress: 1.0, pos: new THREE.Vector3(0, -19.5, -2), target: new THREE.Vector3(0, -20, -5) }
];

export default function CinematicCamera({ progressRef }) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (!progressRef || !progressRef.current) return;
    const p = progressRef.current;
    const targetPos = CAMERA_KEYFRAMES[0].pos.clone().lerp(CAMERA_KEYFRAMES[1].pos, p);
    camera.position.lerp(targetPos, 4 * delta);
  });

  return null;
}
