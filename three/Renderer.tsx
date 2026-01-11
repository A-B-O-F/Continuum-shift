
import React, { Suspense } from 'react';
import { Canvas, ThreeElements } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import { Player } from '../world/Player';
import { SceneManager } from '../world/SceneManager';
import { useGameState } from '../core/GameState';
import { GameStatus } from '../core/types';

// Fix for JSX intrinsic elements errors in Three.js when the environment doesn't automatically detect R3F namespace augmentation
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

export const Renderer: React.FC = () => {
  const status = useGameState((state) => state.status);

  return (
    <Canvas shadows camera={{ position: [0, 3, 10], fov: 60 }}>
      <color attach="background" args={['#020205']} />
      <fog attach="fog" args={['#020205', 5, 80]} />

      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 20, 10]} angle={0.5} penumbra={1} intensity={2} castShadow />
        <Player />
        <SceneManager />

        <Stars 
          radius={100} 
          depth={50} 
          count={status === GameStatus.MENU ? 5000 : 2000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={status === GameStatus.MENU ? 0.5 : 2} 
        />
        
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
};
