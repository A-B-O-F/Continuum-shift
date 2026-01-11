import React, { useEffect, useRef } from 'react';
import { GUI } from 'lil-gui';
import { useGameState } from '../core/GameState';
import { GameMode } from '../core/types';

export const DebugPanel: React.FC = () => {
  const { customConfig, updateCustomConfig, mode } = useGameState();
  const guiRef = useRef<GUI | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create GUI instance
    const gui = new GUI({
      container: containerRef.current,
      width: 320,
      title: '⚙️ SYSTEM OVERRIDE PARAMETERS'
    });
    guiRef.current = gui;

    // Create a proxy object that will trigger updates
    const params = {
      // Level Configuration
      tortuosity: customConfig.tortuosity,
      density: customConfig.density,
      speedMultiplier: customConfig.speedMultiplier,
      totalDistance: customConfig.totalDistance || 500,

      // Player Configuration
      playerInitialHP: customConfig.playerInitialHP,
      playerMaxHP: customConfig.playerMaxHP,

      // Movement Speeds
      cubeSpeed: customConfig.cubeSpeed,
      pyramidSpeed: customConfig.pyramidSpeed,
      sphereSpeed: customConfig.sphereSpeed,

      // Weapon Cooldowns
      cubeCooldown: customConfig.cubeCooldown,
      pyramidCooldown: customConfig.pyramidCooldown,
      sphereCooldown: customConfig.sphereCooldown,

      // Bullet Damage
      cubeDamage: customConfig.cubeDamage,
      pyramidDamage: customConfig.pyramidDamage,
      sphereDamage: customConfig.sphereDamage,

      // Visual Debug
      showDebugBoxes: customConfig.showDebugBoxes
    };

    // Level Configuration Folder
    const levelFolder = gui.addFolder('🌍 Level Configuration');
    levelFolder.add(params, 'tortuosity', 0.5, 3.0, 0.1)
      .name('Spatial Tortuosity')
      .onChange((v: number) => updateCustomConfig({ tortuosity: v }));
    levelFolder.add(params, 'density', 0.1, 1.0, 0.05)
      .name('Obstacle Density')
      .onChange((v: number) => updateCustomConfig({ density: v }));
    levelFolder.add(params, 'speedMultiplier', 0.5, 2.5, 0.1)
      .name('Temporal Velocity')
      .onChange((v: number) => updateCustomConfig({ speedMultiplier: v }));

    if (mode === GameMode.LEVEL) {
      levelFolder.add(params, 'totalDistance', 100, 2000, 50)
        .name('Mission Range (m)')
        .onChange((v: number) => updateCustomConfig({ totalDistance: v }));
    }
    levelFolder.open();

    // Player Configuration Folder
    const playerFolder = gui.addFolder('👤 Player Configuration');
    playerFolder.add(params, 'playerInitialHP', 1, 10, 1)
      .name('Initial HP')
      .onChange((v: number) => updateCustomConfig({ playerInitialHP: v }));
    playerFolder.add(params, 'playerMaxHP', 1, 10, 1)
      .name('Max HP')
      .onChange((v: number) => updateCustomConfig({ playerMaxHP: v }));

    // Movement Speeds Folder
    const speedFolder = gui.addFolder('🚀 Movement Speeds');
    speedFolder.add(params, 'cubeSpeed', 0.05, 0.5, 0.01)
      .name('Cube Speed')
      .onChange((v: number) => updateCustomConfig({ cubeSpeed: v }));
    speedFolder.add(params, 'pyramidSpeed', 0.05, 0.5, 0.01)
      .name('Pyramid Speed')
      .onChange((v: number) => updateCustomConfig({ pyramidSpeed: v }));
    speedFolder.add(params, 'sphereSpeed', 0.05, 0.5, 0.01)
      .name('Sphere Speed')
      .onChange((v: number) => updateCustomConfig({ sphereSpeed: v }));

    // Weapon Cooldowns Folder
    const weaponFolder = gui.addFolder('⚔️ Weapon Cooldowns (ms)');
    weaponFolder.add(params, 'cubeCooldown', 100, 2000, 50)
      .name('Cube Cooldown')
      .onChange((v: number) => updateCustomConfig({ cubeCooldown: v }));
    weaponFolder.add(params, 'pyramidCooldown', 100, 2000, 50)
      .name('Pyramid Cooldown')
      .onChange((v: number) => updateCustomConfig({ pyramidCooldown: v }));
    weaponFolder.add(params, 'sphereCooldown', 50, 1000, 10)
      .name('Sphere Cooldown')
      .onChange((v: number) => updateCustomConfig({ sphereCooldown: v }));

    // Bullet Damage Folder
    const damageFolder = gui.addFolder('💥 Bullet Damage');
    damageFolder.add(params, 'cubeDamage', 0.5, 10, 0.5)
      .name('Cube Damage')
      .onChange((v: number) => updateCustomConfig({ cubeDamage: v }));
    damageFolder.add(params, 'pyramidDamage', 0.5, 10, 0.5)
      .name('Pyramid Damage')
      .onChange((v: number) => updateCustomConfig({ pyramidDamage: v }));
    damageFolder.add(params, 'sphereDamage', 0.5, 10, 0.5)
      .name('Sphere Damage')
      .onChange((v: number) => updateCustomConfig({ sphereDamage: v }));

    // Visual Debug Folder
    const debugFolder = gui.addFolder('🔍 Visual Debug');
    debugFolder.add(params, 'showDebugBoxes')
      .name('Show Hitboxes')
      .onChange((v: boolean) => updateCustomConfig({ showDebugBoxes: v }));

    // Cleanup
    return () => {
      gui.destroy();
      guiRef.current = null;
    };
  }, [mode, updateCustomConfig]);

  return (
    <div
      ref={containerRef}
      className="w-full animate-in fade-in slide-in-from-right-8 duration-500"
      style={{
        fontFamily: 'monospace'
      }}
    />
  );
};
