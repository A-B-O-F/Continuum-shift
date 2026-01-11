import React, { useEffect, useRef } from 'react';
import { GUI } from 'lil-gui';
import { useGameState } from '../core/GameState';
import { GameMode } from '../core/types';

export const DebugPanel: React.FC = () => {
  const { customConfig, updateCustomConfig, mode } = useGameState();
  const guiRef = useRef<GUI | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export configuration to JSON file
  const exportConfig = () => {
    const configData = JSON.stringify(customConfig, null, 2);
    const blob = new Blob([configData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `continuum-shift-config-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import configuration from JSON file
  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string);
        updateCustomConfig(importedConfig);
        alert('Configuration imported successfully!');
      } catch (error) {
        alert('Failed to import configuration. Invalid JSON file.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);

    // Reset input value to allow importing the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
    const levelFolder = gui.addFolder('🌍 Level Settings');
    levelFolder.add(params, 'tortuosity', 0.5, 3.0, 0.1)
      .name('Path Curvature (higher = more curved)')
      .onChange((v: number) => updateCustomConfig({ tortuosity: v }));
    levelFolder.add(params, 'density', 0.1, 1.0, 0.05)
      .name('Obstacle Amount (higher = more obstacles)')
      .onChange((v: number) => updateCustomConfig({ density: v }));
    levelFolder.add(params, 'speedMultiplier', 0.5, 2.5, 0.1)
      .name('Game Speed (higher = faster)')
      .onChange((v: number) => updateCustomConfig({ speedMultiplier: v }));

    if (mode === GameMode.LEVEL) {
      levelFolder.add(params, 'totalDistance', 100, 2000, 50)
        .name('Mission Distance (meters)')
        .onChange((v: number) => updateCustomConfig({ totalDistance: v }));
    }
    levelFolder.open();

    // Player Configuration Folder
    const playerFolder = gui.addFolder('👤 Player Health');
    playerFolder.add(params, 'playerInitialHP', 1, 10, 1)
      .name('Starting HP (health at start)')
      .onChange((v: number) => updateCustomConfig({ playerInitialHP: v }));
    playerFolder.add(params, 'playerMaxHP', 1, 10, 1)
      .name('Maximum HP (health limit)')
      .onChange((v: number) => updateCustomConfig({ playerMaxHP: v }));

    // Movement Speeds Folder
    const speedFolder = gui.addFolder('🚀 Ship Movement Speed');
    speedFolder.add(params, 'cubeSpeed', 0.05, 0.5, 0.01)
      .name('🟩 Cube (slow, tanky)')
      .onChange((v: number) => updateCustomConfig({ cubeSpeed: v }));
    speedFolder.add(params, 'pyramidSpeed', 0.05, 0.5, 0.01)
      .name('🟨 Pyramid (balanced)')
      .onChange((v: number) => updateCustomConfig({ pyramidSpeed: v }));
    speedFolder.add(params, 'sphereSpeed', 0.05, 0.5, 0.01)
      .name('🔴 Sphere (fast, agile)')
      .onChange((v: number) => updateCustomConfig({ sphereSpeed: v }));

    // Weapon Cooldowns Folder
    const weaponFolder = gui.addFolder('⚔️ Weapon Fire Rate');
    weaponFolder.add(params, 'cubeCooldown', 100, 2000, 50)
      .name('🟩 Cube (ms, lower = faster fire)')
      .onChange((v: number) => updateCustomConfig({ cubeCooldown: v }));
    weaponFolder.add(params, 'pyramidCooldown', 100, 2000, 50)
      .name('🟨 Pyramid (ms, lower = faster fire)')
      .onChange((v: number) => updateCustomConfig({ pyramidCooldown: v }));
    weaponFolder.add(params, 'sphereCooldown', 50, 1000, 10)
      .name('🔴 Sphere (ms, lower = faster fire)')
      .onChange((v: number) => updateCustomConfig({ sphereCooldown: v }));

    // Bullet Damage Folder
    const damageFolder = gui.addFolder('💥 Weapon Damage');
    damageFolder.add(params, 'cubeDamage', 0.5, 10, 0.5)
      .name('🟩 Cube (damage per shot)')
      .onChange((v: number) => updateCustomConfig({ cubeDamage: v }));
    damageFolder.add(params, 'pyramidDamage', 0.5, 10, 0.5)
      .name('🟨 Pyramid (damage per shot)')
      .onChange((v: number) => updateCustomConfig({ pyramidDamage: v }));
    damageFolder.add(params, 'sphereDamage', 0.5, 10, 0.5)
      .name('🔴 Sphere (damage per shot)')
      .onChange((v: number) => updateCustomConfig({ sphereDamage: v }));

    // Visual Debug Folder
    const debugFolder = gui.addFolder('🔍 Debug View');
    debugFolder.add(params, 'showDebugBoxes')
      .name('Show Collision Boxes')
      .onChange((v: boolean) => updateCustomConfig({ showDebugBoxes: v }));

    // Import/Export Actions Folder
    const actionsFolder = gui.addFolder('💾 Save/Load Configuration');
    const actions = {
      exportConfig: () => exportConfig(),
      importConfig: () => fileInputRef.current?.click()
    };
    actionsFolder.add(actions, 'exportConfig').name('📤 Export Config (Download JSON)');
    actionsFolder.add(actions, 'importConfig').name('📥 Import Config (Load JSON)');

    // Cleanup
    return () => {
      gui.destroy();
      guiRef.current = null;
    };
  }, [mode, updateCustomConfig, customConfig]);

  return (
    <>
      <div
        ref={containerRef}
        className="w-full animate-in fade-in slide-in-from-right-8 duration-500"
        style={{
          fontFamily: 'monospace'
        }}
      />
      {/* Hidden file input for importing configuration */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={importConfig}
        aria-label="Import configuration file"
        style={{ display: 'none' }}
      />
    </>
  );
};
