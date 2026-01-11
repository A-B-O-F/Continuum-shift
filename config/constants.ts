import { PlayerShape } from '../core/types';

// Player HP Configuration
export const PLAYER_CONFIG = {
  INITIAL_HP: 4,
  MAX_HP: 5,
};

// Player Movement Speeds
export const SPEED_MAP = {
  [PlayerShape.CUBE]: 0.15,
  [PlayerShape.PYRAMID]: 0.25,
  [PlayerShape.SPHERE]: 0.40,
};

// Weapon Cooldowns
export const WEAPON_COOLDOWN = {
  [PlayerShape.CUBE]: 600,
  [PlayerShape.PYRAMID]: 300,
  [PlayerShape.SPHERE]: 120,
};

// Bullet Properties
export const BULLET_STATS = {
    [PlayerShape.CUBE]: { 
        damage: 3, width: 0.8, length: 4.0, speed: 100, color: '#4ade80' 
    },
    [PlayerShape.PYRAMID]: { 
        damage: 1.5, width: 0.4, length: 3.5, speed: 120, color: '#facc15' 
    },
    [PlayerShape.SPHERE]: { 
        damage: 1, width: 0.2, length: 2.5, speed: 150, color: '#f87171' 
    },
};