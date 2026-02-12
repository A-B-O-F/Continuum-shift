import { useEffect, useRef } from 'react';
import { useGameState } from './GameState';
import { GameStatus, GameMode } from './types';

const TRACKS = {
  menu: new URL('../music/main-menu.mp3', import.meta.url).href,
  level: new URL('../music/level1.mp3', import.meta.url).href,
  endless: new URL('../music/endless-mode.mp3', import.meta.url).href,
};

const REPLAY_DELAY = 5000; // 5 seconds after track ends

function getTrackKey(status: GameStatus, mode: GameMode): keyof typeof TRACKS {
  if (status === GameStatus.PLAYING) {
    return mode === GameMode.INFINITE ? 'endless' : 'level';
  }
  return 'menu';
}

export function useMusicManager() {
  const status = useGameState((s) => s.status);
  const mode = useGameState((s) => s.mode);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<string>('');
  const replayTimerRef = useRef<number | null>(null);
  const userInteractedRef = useRef(false);

  // Unlock audio on first user interaction (click, key, or mouse move)
  useEffect(() => {
    const unlock = () => {
      userInteractedRef.current = true;
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('mousemove', unlock);
      document.removeEventListener('touchstart', unlock);
    };
    document.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock);
    document.addEventListener('mousemove', unlock);
    document.addEventListener('touchstart', unlock);
    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('mousemove', unlock);
      document.removeEventListener('touchstart', unlock);
    };
  }, []);

  useEffect(() => {
    const trackKey = getTrackKey(status, mode);
    const trackSrc = TRACKS[trackKey];

    // Clear any pending replay timer
    if (replayTimerRef.current !== null) {
      clearTimeout(replayTimerRef.current);
      replayTimerRef.current = null;
    }

    // Same track already playing — do nothing
    if (currentTrackRef.current === trackKey && audioRef.current && !audioRef.current.paused) {
      return;
    }

    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }

    // Create new audio element
    const audio = new Audio(trackSrc);
    audio.volume = 0.4;
    audioRef.current = audio;
    currentTrackRef.current = trackKey;

    // When the track ends, wait 5s then replay
    const handleEnded = () => {
      replayTimerRef.current = window.setTimeout(() => {
        if (audioRef.current === audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      }, REPLAY_DELAY);
    };

    audio.addEventListener('ended', handleEnded);

    // Start playback — always try, browser will allow if user already interacted
    audio.play().then(() => {
      userInteractedRef.current = true;
    }).catch(() => {});

    return () => {
      audio.removeEventListener('ended', handleEnded);
      if (replayTimerRef.current !== null) {
        clearTimeout(replayTimerRef.current);
        replayTimerRef.current = null;
      }
    };
  }, [status, mode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (replayTimerRef.current !== null) {
        clearTimeout(replayTimerRef.current);
      }
    };
  }, []);
}
