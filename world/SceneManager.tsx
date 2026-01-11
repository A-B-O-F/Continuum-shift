
import React, { useRef, useState, useEffect } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import { useGameState } from '../core/GameState';
import { GameStatus, ObstacleType, PlayerShape, GameMode } from '../core/types';
import { BULLET_STATS } from '../config/constants';
import { LevelItem, LevelItem as TLevelItem } from '../core/LevelGenerator';
import { Bullet } from './Bullet';
import { Obstacle } from './Obstacle';

// Fix for JSX intrinsic elements errors in Three.js when the environment doesn't automatically detect R3F namespace augmentation
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

export const HIT_BOX = {
    PLAYER_SIZE: 0.6,
    OBSTACLE_SIZE: 0.9,
    COLLECTIBLE_SIZE: 0.7,
    PORTAL_THICKNESS: 0.5,
};

type BulletType = { id: string; position: Vector3; active: boolean; shape: PlayerShape; };

// Inline local generator to easily use customConfig
const getPathPosition = (z: number, phaseOffset: number, tortuosity: number) => {
  const freq = 0.04 * tortuosity;
  const x = Math.sin(z * freq + phaseOffset) * 5.0;
  const y = Math.cos(z * (freq * 1.5) + phaseOffset) * 2.1;
  return new Vector3(x, y, -z);
};

const generateCustomLevel = (length: number, density: number, tortuosity: number): TLevelItem[] => {
  const items: TLevelItem[] = [];
  let lastPortalZ = -999;
  
  for (let z = 40; z < length; z += 5) {
    const p1 = getPathPosition(z, 0, tortuosity);
    const p2 = getPathPosition(z, Math.PI, tortuosity);

    if (Math.random() < 0.1 && z < length - 20 && (z - lastPortalZ) >= 30) {
        lastPortalZ = z;
        const shape = [PlayerShape.CUBE, PlayerShape.SPHERE, PlayerShape.PYRAMID][Math.floor(Math.random()*3)];
        items.push({ 
            type: shape === PlayerShape.CUBE ? ObstacleType.PORTAL_CUBE : 
                  shape === PlayerShape.PYRAMID ? ObstacleType.PORTAL_PYRAMID : ObstacleType.PORTAL_SPHERE,
            position: new Vector3(0, 0.5, -z), 
            shape, id: `portal-${z}`, hp: 1
        });
        continue;
    }

    for (let i = 0; i < 6; i++) {
        if (Math.random() > density) continue;
        const rx = MathUtils.randFloat(-7, 7);
        const ry = MathUtils.randFloat(-4.5, 4.5);
        const pos = new Vector3(rx, ry, -z);
        if (pos.distanceTo(p1) < 3.5 || pos.distanceTo(p2) < 3.5) {
            if (Math.random() > 0.85) items.push({ type: ObstacleType.COLLECTIBLE, position: pos, id: `col-${z}-${i}`, hp: 1 });
        } else {
            items.push({ type: Math.random() > 0.4 ? ObstacleType.BREAKABLE : ObstacleType.UNBREAKABLE, position: pos, id: `obs-${z}-${i}`, hp: 3 });
        }
    }
  }
  return items;
};

export const SceneManager: React.FC = () => {
  const { maxDistance, distance, playerShape, takeDamage, addScore, heal, status, shootSignal, mode, customConfig } = useGameState();
  
  const [obstacles, setObstacles] = useState<LevelItem[]>([]);
  const [bullets, setBullets] = useState<BulletType[]>([]);
  
  const obstaclesRef = useRef(obstacles);
  const bulletsRef = useRef(bullets);
  const lastGenZ = useRef(0);
  
  useEffect(() => { obstaclesRef.current = obstacles; }, [obstacles]);
  useEffect(() => { bulletsRef.current = bullets; }, [bullets]);

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
        setBullets([]);
        if (mode === GameMode.LEVEL) {
            setObstacles(generateCustomLevel(maxDistance, customConfig.density, customConfig.tortuosity));
        } else {
            // Basic infinite chunking using customConfig
            setObstacles(generateCustomLevel(500, customConfig.density, customConfig.tortuosity));
            lastGenZ.current = 500;
        }
    }
  }, [status, mode]);

  useEffect(() => {
      if (status !== GameStatus.PLAYING || shootSignal === 0) return;
      const playerRef = useGameState.getState().playerRef;
      if (playerRef && playerRef.current) {
          const spawnPos = playerRef.current.position.clone();
          spawnPos.z -= 2; 
          setBullets(prev => [...prev, { id: `b-${shootSignal}`, position: spawnPos, active: true, shape: playerShape }]);
      }
  }, [shootSignal, status, playerShape]);

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) return;
    const playerRef = useGameState.getState().playerRef;
    if (!playerRef || !playerRef.current) return;
    const playerPos = playerRef.current.position;
    const activeObstacles = obstaclesRef.current;
    
    if (mode === GameMode.INFINITE && distance + 300 > lastGenZ.current) {
        const newChunk = generateCustomLevel(lastGenZ.current + 300, customConfig.density, customConfig.tortuosity)
                         .filter(o => Math.abs(o.position.z) > lastGenZ.current);
        setObstacles(prev => [...prev, ...newChunk]);
        lastGenZ.current += 300;
    }
    
    const itemsToRemove = new Set<string>();
    const bulletsToRemove = new Set<string>();
    const obstacleUpdates = new Map<string, number>(); 
    let scoreToAdd = 0;
    let damageTaken = false;
    let healed = false;

    bulletsRef.current.forEach(b => {
        if (!b.active) return;
        const stats = BULLET_STATS[b.shape];
        b.position.z -= stats.speed * delta; 
        if (b.position.z < -distance - 200) { bulletsToRemove.add(b.id); b.active = false; return; }

        for (const obs of activeObstacles) {
            if (itemsToRemove.has(obs.id)) continue;
            if (obs.type === ObstacleType.BREAKABLE || obs.type === ObstacleType.UNBREAKABLE) {
                const dx = Math.abs(b.position.x - obs.position.x);
                const dy = Math.abs(b.position.y - obs.position.y);
                const dz = Math.abs(b.position.z - obs.position.z);
                if (dx < (0.9 + stats.width/2) && dy < (0.9 + stats.width/2) && dz < (1.0 + stats.length/2)) {
                    if (obs.type === ObstacleType.BREAKABLE) {
                        bulletsToRemove.add(b.id);
                        b.active = false;
                        const newHp = (obstacleUpdates.get(obs.id) ?? obs.hp) - stats.damage;
                        obstacleUpdates.set(obs.id, newHp);
                        if (newHp <= 0) { itemsToRemove.add(obs.id); scoreToAdd += 20; }
                        break; 
                    } else {
                        bulletsToRemove.add(b.id); b.active = false; break;
                    }
                }
            }
        }
    });

    for (const obs of activeObstacles) {
        if (itemsToRemove.has(obs.id)) continue;
        if (obs.position.z > -distance + 50) { itemsToRemove.add(obs.id); continue; }
        const dx = Math.abs(playerPos.x - obs.position.x);
        const dy = Math.abs(playerPos.y - obs.position.y);
        const dz = Math.abs(playerPos.z - obs.position.z);

        if (obs.type.includes('PORTAL')) {
            if (dz < HIT_BOX.PORTAL_THICKNESS) {
                if (obs.shape !== playerShape) damageTaken = true; 
                else scoreToAdd += 50; 
                itemsToRemove.add(obs.id);
            }
        } else {
            const hitSize = obs.type === ObstacleType.COLLECTIBLE ? HIT_BOX.COLLECTIBLE_SIZE : HIT_BOX.OBSTACLE_SIZE;
            if (dx < hitSize + HIT_BOX.PLAYER_SIZE && dy < hitSize + HIT_BOX.PLAYER_SIZE && dz < hitSize + HIT_BOX.PLAYER_SIZE) {
                if (obs.type === ObstacleType.COLLECTIBLE) {
                    healed = true; scoreToAdd += 50; itemsToRemove.add(obs.id);
                } else {
                    damageTaken = true; itemsToRemove.add(obs.id);
                }
            }
        }
    }

    if (itemsToRemove.size > 0 || obstacleUpdates.size > 0) {
        setObstacles(prev => prev.map(o => obstacleUpdates.has(o.id) ? { ...o, hp: obstacleUpdates.get(o.id)! } : o).filter(o => !itemsToRemove.has(o.id)));
    }
    if (bulletsToRemove.size > 0) setBullets(prev => prev.filter(b => !bulletsToRemove.has(b.id)));
    if (scoreToAdd > 0) addScore(Math.floor(scoreToAdd));
    if (damageTaken) takeDamage();
    if (healed) heal();
  });

  return (
    <group>
      {Array.from({ length: 15 }).map((_, i) => {
         const segmentIndex = Math.floor(distance / 20) + i;
         return (
        <group key={segmentIndex} position={[0, 0, -(segmentIndex * 20)]}>
            <mesh position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[14, 20]} />
                <meshStandardMaterial color="#1a1a1c" roughness={0.8} />
                <gridHelper args={[14, 14, 0x444444, 0x111111]} rotation={[-Math.PI/2, 0, 0]} position={[0, 0.1, 0]} />
            </mesh>
            <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[14, 20]} /><meshStandardMaterial color="#0a0a0c" /></mesh>
        </group>
      )})}
      {bullets.map(b => {
          const stats = BULLET_STATS[b.shape];
          return <Bullet key={b.id} position={b.position} color={stats.color} width={stats.width} length={stats.length} />;
      })}
      //be sure that the GPU can only generate scene in 150 distance after 
      {obstacles.map((item) => {
          if (Math.abs(item.position.z + distance) > 150) return null;
          return <Obstacle key={item.id} type={item.type} position={item.position} shape={item.shape} hp={item.hp} />;
      })}
    </group>
  );
};
