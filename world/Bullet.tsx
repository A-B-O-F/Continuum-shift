
import React, { useRef } from 'react';
import { Vector3, Group } from 'three';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import { useGameState } from '../core/GameState';

// Fix for JSX intrinsic elements errors in Three.js when the environment doesn't automatically detect R3F namespace augmentation
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface BulletProps {
  position: Vector3;
  color: string;
  width: number;
  length: number;
}

export const Bullet: React.FC<BulletProps> = ({ position, color, width, length }) => {
  const groupRef = useRef<Group>(null);
  const showDebugBoxes = useGameState(state => state.customConfig.showDebugBoxes);

  useFrame(() => {
    if (groupRef.current) groupRef.current.position.copy(position);
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <boxGeometry args={[width, 0.1, length]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
        {showDebugBoxes && <Edges color="#ff0000" lineWidth={2} />}
      </mesh>
      <mesh scale={[0.5, 1.2, 0.9]}>
        <boxGeometry args={[width, 0.1, length]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      <pointLight distance={5} intensity={2} color={color} decay={2} />
    </group>
  );
};
