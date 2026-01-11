
import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree, ThreeElements } from '@react-three/fiber';
import { Mesh, Group, MathUtils, Vector3 } from 'three';
import { Sparkles, Trail, Edges } from '@react-three/drei';
import { useGameState } from '../core/GameState';
import { PlayerShape, GameStatus, CameraView } from '../core/types';
import { SPEED_MAP, WEAPON_COOLDOWN } from '../config/constants';
import { HIT_BOX } from './SceneManager';

// Fix for JSX intrinsic elements errors in Three.js when the environment doesn't automatically detect R3F namespace augmentation
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

const LATERAL_SPEED = 0.2;
const BOUNDS_X = 6;
const BOUNDS_Y = 4;

export const Player: React.FC = () => {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const { playerShape, cameraView, setShape, setCameraView, updateDistance, status, setPlayerRef, triggerShoot, isDamaged, customConfig } = useGameState();
  const { camera } = useThree();
  
  const [visualShape, setVisualShape] = useState(playerShape);
  const [isMorphing, setIsMorphing] = useState(false);
  const scaleRef = useRef(1);
  const shakeIntensityRef = useRef(0);
  const lastShootTime = useRef(0);
  const keys = useRef({ w: false, a: false, s: false, d: false });

  const lookAtTarget = useRef(new Vector3(0, 0, 0));

  useEffect(() => { setPlayerRef(groupRef); }, [setPlayerRef]);

  useEffect(() => {
    if (isDamaged) {
      shakeIntensityRef.current = 1.0;
    }
  }, [isDamaged]);

  useEffect(() => {
    if (playerShape !== visualShape) setIsMorphing(true);
  }, [playerShape, visualShape]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();

      if (k === '1') setShape(PlayerShape.CUBE);
      if (k === '2') setShape(PlayerShape.PYRAMID);
      if (k === '3') setShape(PlayerShape.SPHERE);

      if (k === 'i') setCameraView(CameraView.FOLLOW);
      if (k === 'o') setCameraView(CameraView.HIGH);
      if (k === 'p') setCameraView(CameraView.TOP_RIGHT);

      if (status !== GameStatus.PLAYING) return;

      if (['w','arrowup'].includes(k)) keys.current.w = true;
      if (['a','arrowleft'].includes(k)) keys.current.a = true;
      if (['s','arrowdown'].includes(k)) keys.current.s = true;
      if (['d','arrowright'].includes(k)) keys.current.d = true;

      if (k === ' ') {
        const now = Date.now();
        if (now - lastShootTime.current >= WEAPON_COOLDOWN[playerShape]) {
            triggerShoot();
            lastShootTime.current = now;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (['w','arrowup'].includes(k)) keys.current.w = false;
      if (['a','arrowleft'].includes(k)) keys.current.a = false;
      if (['s','arrowdown'].includes(k)) keys.current.s = false;
      if (['d','arrowright'].includes(k)) keys.current.d = false;
    };

    const handleMouseClick = () => {
      if (status !== GameStatus.PLAYING) return;

      const now = Date.now();
      if (now - lastShootTime.current >= WEAPON_COOLDOWN[playerShape]) {
        triggerShoot();
        lastShootTime.current = now;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('click', handleMouseClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('click', handleMouseClick);
    };
  }, [status, setShape, setCameraView, triggerShoot, playerShape]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const player = groupRef.current;
    
    if (isMorphing) {
        scaleRef.current = MathUtils.lerp(scaleRef.current, 0, 15 * delta);
        if (scaleRef.current < 0.05) {
            setVisualShape(playerShape);
            setIsMorphing(false);
        }
    } else {
        scaleRef.current = MathUtils.lerp(scaleRef.current, 1, 15 * delta);
    }
    if (meshRef.current) {
        meshRef.current.scale.setScalar(scaleRef.current);
        meshRef.current.rotation.z -= delta * 0.5;
        meshRef.current.rotation.x += delta * 0.2;
    }

    if (status === GameStatus.PLAYING) {
        // Use custom speed multiplier from config
        const zSpeed = SPEED_MAP[playerShape] * 60 * delta * (customConfig.speedMultiplier || 1.0); 
        player.position.z -= zSpeed;
        updateDistance(player.position.z);

        const moveSpeed = LATERAL_SPEED * 60 * delta;
        if (keys.current.a) player.position.x = Math.max(player.position.x - moveSpeed, -BOUNDS_X);
        if (keys.current.d) player.position.x = Math.min(player.position.x + moveSpeed, BOUNDS_X);
        if (keys.current.w) player.position.y = Math.min(player.position.y + moveSpeed, BOUNDS_Y);
        if (keys.current.s) player.position.y = Math.max(player.position.y - moveSpeed, -BOUNDS_Y + 1);
    } else {
        player.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }

    let targetCamX = 0;
    let targetCamY = 0;
    let targetCamZ = 0;
    let targetLookAt = new Vector3(0, 0, 0);

    const isMenu = status === GameStatus.MENU;
    const isConfig = status === GameStatus.CONFIGURING;

    switch (cameraView) {
      case CameraView.DIAGNOSTIC:
        // Side close-up for inspection
        targetCamX = player.position.x - 6;
        targetCamY = player.position.y + 1;
        targetCamZ = player.position.z + 4;
        targetLookAt.set(player.position.x + 2, player.position.y, player.position.z);
        break;
      case CameraView.HIGH:
        targetCamX = player.position.x * 0.2;
        targetCamY = player.position.y + 12;
        targetCamZ = player.position.z + 14;
        targetLookAt.set(player.position.x, player.position.y, player.position.z - 5);
        break;
      case CameraView.TOP_RIGHT:
        targetCamX = player.position.x + (isMenu ? 15 : 12);
        targetCamY = player.position.y + (isMenu ? 4 : 10);
        targetCamZ = player.position.z + (isMenu ? 5 : 16);
        targetLookAt.set(player.position.x - (isMenu ? 4 : 2), player.position.y, player.position.z - 10);
        break;
      case CameraView.FOLLOW:
      default:
        targetCamX = player.position.x * 0.5;
        targetCamY = player.position.y * 0.5 + 3;
        targetCamZ = player.position.z + 10;
        targetLookAt.set(player.position.x * 0.1, player.position.y * 0.1, player.position.z - 10);
        break;
    }

    if (shakeIntensityRef.current > 0) {
      const shakeAmount = 2 * shakeIntensityRef.current;
      targetCamX += (Math.random() - 0.5) * shakeAmount;
      targetCamY += (Math.random() - 0.5) * shakeAmount;
      shakeIntensityRef.current = MathUtils.lerp(shakeIntensityRef.current, 0, delta * 8);
      if (shakeIntensityRef.current < 0.01) shakeIntensityRef.current = 0;
    }

    const lerpSpeed = (isMenu || isConfig) ? 2 : 5;
    camera.position.x = MathUtils.lerp(camera.position.x, targetCamX, delta * lerpSpeed);
    camera.position.y = MathUtils.lerp(camera.position.y, targetCamY, delta * lerpSpeed);
    camera.position.z = MathUtils.lerp(camera.position.z, targetCamZ, delta * lerpSpeed);

    lookAtTarget.current.lerp(targetLookAt, delta * lerpSpeed);
    camera.lookAt(lookAtTarget.current);
  });

  const ColorMap = {
    [PlayerShape.CUBE]: '#4ade80',
    [PlayerShape.PYRAMID]: '#facc15',
    [PlayerShape.SPHERE]: '#f87171',
  };

  const playerHitScale = (HIT_BOX.PLAYER_SIZE * 2) / 1.0;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <Trail width={1.2} length={6} color={ColorMap[visualShape]} attenuation={(t) => t * t}>
        <mesh ref={meshRef} castShadow receiveShadow>
            {visualShape === PlayerShape.CUBE && <boxGeometry args={[1, 1, 1]} />}
            {visualShape === PlayerShape.PYRAMID && <coneGeometry args={[0.8, 1.2, 4]} />}
            {visualShape === PlayerShape.SPHERE && <sphereGeometry args={[0.6, 32, 32]} />}
            <meshStandardMaterial
              color={ColorMap[visualShape]}
              emissive={ColorMap[visualShape]}
              emissiveIntensity={(status === GameStatus.MENU || status === GameStatus.CONFIGURING) ? 1.5 : 0.6}
            />

            {customConfig.showDebugBoxes && (
              <group scale={[playerHitScale / scaleRef.current, playerHitScale / scaleRef.current, playerHitScale / scaleRef.current]}>
                 <Edges threshold={15} color="#00ffff" lineWidth={3} />
              </group>
            )}
        </mesh>
      </Trail>

      <Sparkles 
        count={isMorphing ? 50 : 20} 
        scale={isMorphing ? 4 : 2} 
        size={isMorphing ? 10 : 3} 
        opacity={isMorphing ? 1 : 0.5} 
        color={ColorMap[visualShape]} 
      />
      <pointLight position={[0, 0, 0.5]} intensity={3} color={ColorMap[visualShape]} distance={5} decay={2} />
    </group>
  );
};
