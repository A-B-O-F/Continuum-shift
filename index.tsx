import React from 'react';
import ReactDOM from 'react-dom/client';
import { Renderer } from './three/Renderer';
import { HUD } from './ui/HUD';
import { Menu } from './ui/Menu';
import { useGameState } from './core/GameState';

function App() {
  const isDamaged = useGameState(state => state.isDamaged);
  
  return (
    // 使用 custom transition: 进入(受击)极快，恢复(正常)平滑
    <div className={`
      relative w-full h-full bg-black 
      transition-[filter,transform] 
      ${isDamaged ? 'duration-75 grayscale contrast-150' : 'duration-700 grayscale-0 contrast-100'}
      ease-[cubic-bezier(0.22,1,0.36,1)]
    `}>
      <Renderer />
      <HUD />
      <Menu />
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