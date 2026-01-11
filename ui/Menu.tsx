import React from 'react';
import { useGameState } from '../core/GameState';
import { GameStatus, GameMode } from '../core/types';
import { DebugPanel } from './DebugPanel';

export const Menu: React.FC = () => {
  const { status, enterConfig, startGame, score, reset, mode } = useGameState();

  if (status === GameStatus.PLAYING) return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col font-mono text-white pointer-events-none">
      {/* 顶部标题区 */}
      <div className="w-full pt-12 pb-6 px-12 pointer-events-auto">
        <h1 className="text-7xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_5px_15px_rgba(6,182,212,0.4)]">
          CONTINUUM SHIFT
        </h1>
        <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-transparent mt-2"></div>
        <p className="text-cyan-200/60 text-xs mt-3 tracking-[0.3em] uppercase">
          {status === GameStatus.CONFIGURING ? `CONFIGURING_CORE // ${mode}` : 'NEURAL INTERFACE INITIALIZED // VER 2.5'}
        </p>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* 左侧视角区 */}
        <div className="col-span-7 relative">
          <div className="absolute bottom-12 left-12 p-4 border-l-2 border-cyan-500 bg-black/20 backdrop-blur-sm pointer-events-auto">
            <p className="text-[10px] text-cyan-400 mb-1 tracking-tighter">
              {status === GameStatus.CONFIGURING ? 'STATUS: STANDBY_FOR_CALIBRATION' : 'PREVIEW_MODE'}
            </p>
            <p className="text-xl font-bold tracking-widest uppercase">
              {status === GameStatus.CONFIGURING ? 'DIAGNOSTIC VIEW' : 'External Orbital View'}
            </p>
          </div>
          
          {status === GameStatus.CONFIGURING && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                <div className="w-64 h-64 border border-cyan-500/50 rounded-full animate-pulse flex items-center justify-center">
                    <div className="w-48 h-48 border border-cyan-400/30 rounded-full" />
                </div>
             </div>
          )}
        </div>

        {/* 右侧交互区 */}
        <div className="col-span-5 bg-black/60 backdrop-blur-xl border-l border-white/10 p-12 flex flex-col justify-between pointer-events-auto">
          {status === GameStatus.MENU && (
            <>
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-2 h-6 bg-cyan-500"></span>
                  MISSION PARAMETERS
                </h2>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => enterConfig(GameMode.LEVEL)} 
                    className="group relative overflow-hidden bg-white/5 hover:bg-cyan-500/20 border border-white/10 p-6 transition-all text-left"
                  >
                    <div className="relative z-10">
                      <div className="text-cyan-400 text-xs mb-1">PROGRAM_01</div>
                      <div className="text-2xl font-bold">LEVEL EXPEDITION</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => enterConfig(GameMode.INFINITE)} 
                    className="group relative overflow-hidden bg-white/5 hover:bg-red-500/20 border border-white/10 p-6 transition-all text-left"
                  >
                    <div className="relative z-10">
                      <div className="text-red-400 text-xs mb-1">PROGRAM_X</div>
                      <div className="text-2xl font-bold">INFINITE VOID</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="mt-12 p-6 bg-white/5 rounded border border-white/5">
                <h3 className="text-xs text-gray-400 mb-4 tracking-widest uppercase italic text-center underline">Operational Protocols</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  <div className="flex flex-col border-l border-cyan-500/30 pl-2">
                    <span className="text-cyan-400 font-bold">[W/A/S/D] [↑←↓→]</span>
                    <span>NEURAL MOVEMENT</span>
                  </div>
                  <div className="flex flex-col border-l border-cyan-500/30 pl-2">
                    <span className="text-cyan-400 font-bold">[SPACE]</span>
                    <span>DISCHARGE WEAPON</span>
                  </div>
                  <div className="flex flex-col border-l border-green-500/30 pl-2">
                    <span className="text-green-400 font-bold">[1] [2] [3]</span>
                    <span>MORPH GEOMETRY</span>
                  </div>
                  <div className="flex flex-col border-l border-purple-500/30 pl-2">
                    <span className="text-purple-400 font-bold">[I] [O] [P]</span>
                    <span>CAMERA MODES</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-[9px] text-gray-500 italic">
                    1=CUBE(GREEN) • 2=PYRAMID(YELLOW) • 3=SPHERE(RED) // I=FOLLOW • O=HIGH • P=TOP_RIGHT
                  </p>
                </div>
              </div>
            </>
          )}

          {status === GameStatus.CONFIGURING && (
            <>
              <div className="flex-1 overflow-y-auto mb-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-black mb-2 italic flex items-center justify-between">
                    SYSTEM OVERRIDE
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 not-italic border border-red-500/30">UNSAFE_MODE</span>
                  </h2>
                  <p className="text-xs text-cyan-400/60 mb-6 tracking-wider">
                    Configure all game parameters using lil-gui interface
                  </p>
                </div>

                <DebugPanel />
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={startGame}
                  className="w-full py-8 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-2xl transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] uppercase tracking-tighter"
                >
                  ENGAGE SYSTEM
                </button>
                <button
                  onClick={reset}
                  className="w-full py-2 text-xs text-gray-500 hover:text-white uppercase tracking-[0.4em] transition-colors"
                >
                  [ ABORT_MISSION ]
                </button>
              </div>
            </>
          )}

          {(status === GameStatus.GAME_OVER || status === GameStatus.VICTORY) && (
            <div className="h-full flex flex-col justify-center items-center text-center">
              <h2 className={`text-6xl font-black mb-4 italic ${status === GameStatus.VICTORY ? 'text-green-400' : 'text-red-500'}`}>
                {status === GameStatus.VICTORY ? 'SUCCESS' : 'FAILURE'}
              </h2>
              <p className="text-gray-400 tracking-widest mb-12">
                {status === GameStatus.VICTORY ? 'MISSION PARAMETERS ACHIEVED' : 'CORE INTEGRITY COMPROMISED'}
              </p>
              
              <div className="text-sm text-gray-500 mb-2 uppercase">Syncing Final Metrics...</div>
              <div className="text-7xl font-bold mb-16 tabular-nums">{score.toString().padStart(6, '0')}</div>
              
              <button 
                onClick={reset} 
                className="w-full py-6 bg-white text-black font-black hover:bg-cyan-400 hover:text-white transition-colors uppercase tracking-widest"
              >
                Return to Command
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="h-2 w-full bg-gradient-to-r from-cyan-600 via-purple-600 to-blue-600 opacity-30"></div>
    </div>
  );
};