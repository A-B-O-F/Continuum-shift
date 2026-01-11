import React, { useEffect, useState } from 'react';
import { useGameState } from '../core/GameState';
import { GameStatus, PlayerShape } from '../core/types';
import { PLAYER_CONFIG } from '../config/constants';

export const HUD: React.FC = () => {
  const { hp, score, distance, maxDistance, playerShape, status, isDamaged } = useGameState();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setPulse(true);
    const timeout = setTimeout(() => setPulse(false), 200);
    return () => clearTimeout(timeout);
  }, [playerShape]);

  if (status !== GameStatus.PLAYING) return null;

  const progress = Math.min(100, (distance / maxDistance) * 100);
  const getShapeColor = (shape: PlayerShape) => {
    switch (shape) {
        case PlayerShape.CUBE: return 'text-green-400';
        case PlayerShape.PYRAMID: return 'text-yellow-400';
        case PlayerShape.SPHERE: return 'text-red-400';
    }
  }

  // Generate an array for the integrity bars
  const integrityBars = Array.from({ length: PLAYER_CONFIG.MAX_HP }, (_, i) => i + 1);

  return (
    <>
      {/* Damage Flash Overlay - 优化透明度过渡 */}
      <div className={`
        absolute inset-0 pointer-events-none z-30 transition-opacity 
        ${isDamaged ? 'duration-75 opacity-100' : 'duration-500 opacity-0'}
      `}>
         <div className="absolute inset-0 border-[15px] border-red-500/40 shadow-[inset_0_0_120px_rgba(220,38,38,0.7)]" />
      </div>

      <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-10 text-white font-mono">
        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col">
            <span className="text-sm opacity-70">INTEGRITY</span>
            <div className="flex gap-2 mt-1">
              {integrityBars.map((i) => (
                <div key={i} className={`w-6 h-6 border-2 border-white transition-all duration-300 ${i <= hp ? 'bg-cyan-500 shadow-[0_0_10px_cyan]' : 'bg-transparent opacity-30'}`} />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">SYSTEM READY</span>
            <div className="w-64 h-2 bg-gray-900 mt-2 rounded-full overflow-hidden border border-gray-700 relative">
               <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs mt-1 text-cyan-200">{Math.floor(distance)}m</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm opacity-70">SCORE</span>
            <span className="text-4xl font-bold">{score.toString().padStart(6, '0')}</span>
          </div>
        </div>
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
              <div className="text-xs text-gray-400 uppercase tracking-widest">Form Configuration</div>
              <div className={`text-4xl font-bold uppercase transition-all duration-150 ${pulse ? 'scale-125' : 'scale-100'} ${getShapeColor(playerShape)}`}>
                  {playerShape}
              </div>
          </div>
        </div>
      </div>
    </>
  );
};