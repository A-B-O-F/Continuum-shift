import { create } from 'zustand';
import { GameStatus, PlayerShape, GameMode, CameraView } from './types';
import { Group } from 'three';
import React from 'react';
import { LEVEL_MODE_CONFIG, INFINITE_MODE_CONFIG } from '../config/levelConfigs';
import { PLAYER_CONFIG } from '../config/constants';

interface MissionConfig {
  tortuosity: number;
  density: number;
  speedMultiplier: number;
  totalDistance?: number;
}

interface GameState {
  status: GameStatus;
  mode: GameMode;
  hp: number;
  score: number;
  playerShape: PlayerShape;
  cameraView: CameraView;
  distance: number;
  maxDistance: number;
  debugMode: boolean;
  isDamaged: boolean; 
  customConfig: MissionConfig;
  
  playerRef: React.MutableRefObject<Group | null> | null;
  shootSignal: number;

  // Actions
  setMode: (mode: GameMode) => void;
  enterConfig: (mode: GameMode) => void;
  updateCustomConfig: (updates: Partial<MissionConfig>) => void;
  startGame: () => void;
  setGameStatus: (status: GameStatus) => void;
  setShape: (shape: PlayerShape) => void;
  setCameraView: (view: CameraView) => void;
  setPlayerRef: (ref: React.MutableRefObject<Group | null>) => void;
  triggerShoot: () => void;
  takeDamage: () => void;
  heal: () => void;
  addScore: (amount: number) => void;
  updateDistance: (z: number) => void;
  toggleDebug: () => void;
  reset: () => void;
}

let damageTimeout: number | null = null;

export const useGameState = create<GameState>((set, get) => ({
  status: GameStatus.MENU,
  mode: GameMode.LEVEL,
  hp: PLAYER_CONFIG.INITIAL_HP,
  score: 0,
  playerShape: PlayerShape.CUBE,
  cameraView: CameraView.TOP_RIGHT, 
  distance: 0,
  maxDistance: LEVEL_MODE_CONFIG.TOTAL_DISTANCE,
  debugMode: false,
  isDamaged: false,
  playerRef: null,
  shootSignal: 0,
  customConfig: {
    tortuosity: 1.0,
    density: 0.4,
    speedMultiplier: 1.0,
    totalDistance: 500
  },

  setMode: (mode) => set({ mode }),

  enterConfig: (mode) => {
    const base = mode === GameMode.LEVEL ? LEVEL_MODE_CONFIG : INFINITE_MODE_CONFIG;
    set({
      status: GameStatus.CONFIGURING,
      mode,
      cameraView: CameraView.DIAGNOSTIC,
      customConfig: {
        tortuosity: base.TORTUOSITY,
        density: base.OBSTACLE_DENSITY,
        speedMultiplier: 1.0,
        totalDistance: mode === GameMode.LEVEL ? base.TOTAL_DISTANCE : 999999
      }
    });
  },

  updateCustomConfig: (updates) => set((state) => ({
    customConfig: { ...state.customConfig, ...updates }
  })),

  startGame: () => {
    const { customConfig, playerRef } = get();
    
    if (playerRef && playerRef.current) {
      playerRef.current.position.set(0, 0, 0);
    }

    set({ 
        status: GameStatus.PLAYING, 
        hp: PLAYER_CONFIG.INITIAL_HP, 
        score: 0, 
        distance: 0, 
        maxDistance: customConfig.totalDistance || 500,
        playerShape: PlayerShape.CUBE, 
        cameraView: CameraView.FOLLOW, 
        shootSignal: 0,
        isDamaged: false
    });
  },

  setGameStatus: (status) => set({ status }),
  setShape: (shape) => set({ playerShape: shape }),
  setCameraView: (view) => set({ cameraView: view }),
  setPlayerRef: (ref) => set({ playerRef: ref }),
  triggerShoot: () => set(() => ({ shootSignal: Date.now() })),
  toggleDebug: () => set((state) => ({ debugMode: !state.debugMode })),

  takeDamage: () => {
    const { hp, status } = get();
    if (status !== GameStatus.PLAYING) return;
    
    set({ isDamaged: true });
    if (damageTimeout) clearTimeout(damageTimeout);
    damageTimeout = window.setTimeout(() => set({ isDamaged: false }), 400);

    const newHp = hp - 1;
    if (newHp <= 0) {
      set({ hp: 0, status: GameStatus.GAME_OVER });
    } else {
      set({ hp: newHp });
    }
  },

  heal: () => {
    set((state) => ({ hp: Math.min(state.hp + 1, PLAYER_CONFIG.MAX_HP) }));
  },

  addScore: (amount) => set((state) => ({ score: state.score + amount })),

  updateDistance: (z) => {
    const { maxDistance, status, mode } = get();
    if (status !== GameStatus.PLAYING) return;
    const currentDist = Math.abs(z);
    set({ distance: currentDist });
    if (mode === GameMode.LEVEL && currentDist >= maxDistance) {
      set({ status: GameStatus.VICTORY });
    }
  },

  reset: () => {
    const { playerRef } = get();
    if (playerRef && playerRef.current) {
      playerRef.current.position.set(0, 0, 0);
    }

    set({ 
      status: GameStatus.MENU, 
      hp: PLAYER_CONFIG.INITIAL_HP, 
      score: 0, 
      distance: 0, 
      isDamaged: false, 
      cameraView: CameraView.TOP_RIGHT 
    });
  }
}));