import { Vector3, MathUtils } from 'three';
import { ObstacleType, PlayerShape } from './types';
import { LEVEL_MODE_CONFIG, INFINITE_MODE_CONFIG } from '../config/levelConfigs';

export interface LevelItem {
    type: ObstacleType;
    position: Vector3;
    shape?: PlayerShape;
    id: string;
    hp: number;
}

// Helper: Calculate path position (Sine Wave)
const getPathPosition = (z: number, phaseOffset: number, config: typeof LEVEL_MODE_CONFIG) => {
  const freq = 0.04 * config.TORTUOSITY;
  const x = Math.sin(z * freq + phaseOffset) * config.AMPLITUDE_X;
  const y = Math.cos(z * (freq * 1.5) + phaseOffset) * config.AMPLITUDE_Y;
  return new Vector3(x, y, -z);
};

export const generateLevelData = (length: number): LevelItem[] => {
  const items: LevelItem[] = [];
  const config = LEVEL_MODE_CONFIG;
  let lastPortalZ = -999; // Track last portal position
  
  for (let z = config.START_Z; z < length; z += config.Z_INCREMENT) {
    const p1 = getPathPosition(z, config.PATH_1_PHASE, config);
    const p2 = getPathPosition(z, config.PATH_2_PHASE, config);

    // Shape Gates
    // Check for configured minimum spacing and random chance
    if (Math.random() < config.PORTAL_CHANCE && z < length - 20 && (z - lastPortalZ) >= config.PORTAL_MIN_SPACING) {
        lastPortalZ = z;
        const shapeRand = Math.random();
        let shape = PlayerShape.CUBE;
        if (shapeRand > 0.66) shape = PlayerShape.SPHERE;
        else if (shapeRand > 0.33) shape = PlayerShape.PYRAMID;

        items.push({ 
            type: shape === PlayerShape.CUBE ? ObstacleType.PORTAL_CUBE : 
                  shape === PlayerShape.PYRAMID ? ObstacleType.PORTAL_PYRAMID : ObstacleType.PORTAL_SPHERE,
            position: new Vector3(0, 0.5, -z), 
            shape,
            id: `portal-${z}`,
            hp: 1
        });
        continue;
    }

    // Obstacles
    const SPAWN_ATTEMPTS = 6;
    for (let i = 0; i < SPAWN_ATTEMPTS; i++) {
        if (Math.random() > config.OBSTACLE_DENSITY) continue;

        const rx = MathUtils.randFloat(-7, 7);
        const ry = MathUtils.randFloat(-4.5, 4.5);
        const pos = new Vector3(rx, ry, -z);

        const d1 = pos.distanceTo(p1);
        const d2 = pos.distanceTo(p2);

        if (d1 < config.SAFE_RADIUS || d2 < config.SAFE_RADIUS) {
            if (Math.random() > 0.85) {
                 items.push({
                    type: ObstacleType.COLLECTIBLE,
                    position: pos, 
                    id: `col-${z}-${i}`,
                    hp: 1
                });
            }
        } else {
            const isBreakable = Math.random() > 0.4;
            items.push({
                type: isBreakable ? ObstacleType.BREAKABLE : ObstacleType.UNBREAKABLE,
                position: pos,
                id: `obs-${z}-${i}`,
                hp: 3
            });
        }
    }
  }
  return items;
};

export const generateInfiniteChunk = (startZ: number, length: number): LevelItem[] => {
  const items: LevelItem[] = [];
  const config = INFINITE_MODE_CONFIG;
  let lastPortalZInChunk = -999; 

  for (let z = startZ; z < startZ + length; z += config.Z_INCREMENT) {
    const p1 = getPathPosition(z, config.PATH_1_PHASE, config);
    const p2 = getPathPosition(z, config.PATH_2_PHASE, config);

    // Occasional Portal in infinite mode using configured spacing and chance
    if (Math.random() < config.PORTAL_CHANCE && (z - lastPortalZInChunk) >= config.PORTAL_MIN_SPACING) {
        lastPortalZInChunk = z;
        const shapeRand = Math.random();
        let shape = PlayerShape.CUBE;
        if (shapeRand > 0.66) shape = PlayerShape.SPHERE;
        else if (shapeRand > 0.33) shape = PlayerShape.PYRAMID;

        items.push({
            type: shape === PlayerShape.CUBE ? ObstacleType.PORTAL_CUBE : 
                  shape === PlayerShape.PYRAMID ? ObstacleType.PORTAL_PYRAMID : ObstacleType.PORTAL_SPHERE,
            position: new Vector3(0, 0.5, -z),
            shape,
            id: `inf-portal-${z}`,
            hp: 1
        });
        continue;
    }

    for (let i = 0; i < 8; i++) {
        if (Math.random() > config.OBSTACLE_DENSITY) continue;
        const rx = MathUtils.randFloat(-7, 7);
        const ry = MathUtils.randFloat(-4.5, 4.5);
        const pos = new Vector3(rx, ry, -z);

        if (pos.distanceTo(p1) < config.SAFE_RADIUS || pos.distanceTo(p2) < config.SAFE_RADIUS) continue;

        items.push({
            type: Math.random() > 0.3 ? ObstacleType.BREAKABLE : ObstacleType.UNBREAKABLE,
            position: pos,
            id: `inf-obs-${z}-${i}`,
            hp: 3
        });
    }
  }
  return items;
};