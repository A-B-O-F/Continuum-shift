import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { Renderer } from './three/Renderer';
import { HUD } from './ui/HUD';
import { Menu } from './ui/Menu';
import { SplashScreen } from './ui/SplashScreen';
import { useGameState } from './core/GameState';
import { useMusicManager } from './core/useMusicManager';

function App() {
  const isDamaged = useGameState(state => state.isDamaged);
  const [showSplash, setShowSplash] = useState(true);

  const { unlockAndPlay } = useMusicManager(); // ✅ 接住返回值

  const handleSplashDone = useCallback(() => setShowSplash(false), []);
  const handleSplashStart = useCallback(() => {
    unlockAndPlay();
  }, [unlockAndPlay]);

  return (
    <div className={`
      relative w-full h-full bg-black
      transition-[filter,transform]
      ${isDamaged ? 'duration-75 grayscale contrast-150' : 'duration-2000 grayscale-0 contrast-100'}
      ease-[cubic-bezier(0.22,1,0.36,1)]
    `}>
      <Renderer />
      <HUD />
      <Menu />
      {showSplash && (
        <SplashScreen
          onDone={handleSplashDone}
          onStart={handleSplashStart}
        />
      )}
    </div>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);