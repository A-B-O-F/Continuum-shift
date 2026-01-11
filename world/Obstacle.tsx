
import React, { useRef } from 'react';
import { Vector3, Group } from 'three';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import { ObstacleType, PlayerShape } from '../core/types';
import { useGameState } from '../core/GameState';
import { HIT_BOX } from './SceneManager';

// Fix for JSX intrinsic elements errors in Three.js when the environment doesn't automatically detect R3F namespace augmentation
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface ObstacleProps {
  type: ObstacleType;
  position: Vector3;
  shape?: PlayerShape;
  hp?: number;
}

export const Obstacle: React.FC<ObstacleProps> = ({ type, position, shape, hp }) => {
  const groupRef = useRef<Group>(null);
  const debugMode = useGameState(state => state.debugMode);

  useFrame(() => {
    if (groupRef.current) groupRef.current.position.copy(position);
  });

  // Calculate debug scale to match HIT_BOX logic (AABB size / visual size)
  const obstacleScale = (HIT_BOX.OBSTACLE_SIZE * 2) / 1.5; 
  const breakableScale = (HIT_BOX.OBSTACLE_SIZE * 2) / 1.8;
  const collectibleScale = (HIT_BOX.COLLECTIBLE_SIZE * 2) / 1.0;

  return (
    <group ref={groupRef} position={position}>
      {/* 1. Unbreakable Obstacle (Box) */}
      {type === ObstacleType.UNBREAKABLE && (
        <mesh castShadow>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
          {debugMode && (
             <group scale={[obstacleScale, obstacleScale, obstacleScale]}>
                <Edges threshold={15} color="#ff00ff" lineWidth={2} />
             </group>
          )}
        </mesh>
      )}

      {/* 2. Breakable Obstacle (Dodecahedron) */}
      {type === ObstacleType.BREAKABLE && (
        <group>
          <mesh>
            <dodecahedronGeometry args={[0.9]} />
            <meshStandardMaterial color="orange" transparent opacity={0.8} />
            {debugMode && (
               <group scale={[breakableScale, breakableScale, breakableScale]}>
                  <Edges threshold={10} color="#ff00ff" lineWidth={2} />
               </group>
            )}
          </mesh>
          {hp !== undefined && hp < 3 && (
            <mesh position={[0, 1.2, 0]}>
              <planeGeometry args={[1 * (hp / 3), 0.1]} />
              <meshBasicMaterial color="red" />
            </mesh>
          )}
        </group>
      )}

      {/* 3. Collectible (Octahedron) */}
      {type === ObstacleType.COLLECTIBLE && (
        <mesh>
          <octahedronGeometry args={[0.5]} />
          <meshStandardMaterial color="cyan" emissive="cyan" emissiveIntensity={1} />
          <pointLight distance={3} color="cyan" intensity={1} />
          {debugMode && (
             <group scale={[collectibleScale, collectibleScale, collectibleScale]}>
                <Edges threshold={15} color="#00ff00" lineWidth={2} />
             </group>
          )}
        </mesh>
      )}

      {/* 4. Portals (Plane) */}
      {type.includes('PORTAL') && (
        <group>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[14, 9]} />
            <meshBasicMaterial 
              color={
                shape === PlayerShape.CUBE ? '#4ade80' : 
                shape === PlayerShape.PYRAMID ? '#facc15' : '#f87171'
              } 
              transparent opacity={0.3} side={2} 
            />
            {debugMode && (
              <group scale={[1, 1, HIT_BOX.PORTAL_THICKNESS * 20]}>
                <boxGeometry args={[14, 9, 0.1]} />
                <Edges color="#ffff00" lineWidth={2} />
              </group>
            )}
          </mesh>
          
          {/* Inner shape indicator */}
          <mesh position={[0, 0, 0.1]}>
             {shape === PlayerShape.CUBE && <boxGeometry args={[3, 3, 0.1]} />}
             {shape === PlayerShape.PYRAMID && <coneGeometry args={[2, 3, 4]} />}
             {shape === PlayerShape.SPHERE && <sphereGeometry args={[1.8, 16, 16]} />}
             <meshBasicMaterial color="white" wireframe />
          </mesh>
        </group>
      )}
    </group>
  );
};
