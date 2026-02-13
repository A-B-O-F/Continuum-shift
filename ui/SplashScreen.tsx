import React, { useState, useEffect, useCallback } from 'react';

const ASCII_TITLE = [
  ' ██████╗ ██████╗ ███╗   ██╗████████╗██╗███╗   ██╗██╗   ██╗██╗   ██╗███╗   ███╗    ███████╗██╗  ██╗██╗███████╗████████╗',
  '██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██║████╗  ██║██║   ██║██║   ██║████╗ ████║    ██╔════╝██║  ██║██║██╔════╝╚══██╔══╝',
  '██║     ██║   ██║██╔██╗ ██║   ██║   ██║██╔██╗ ██║██║   ██║██║   ██║██╔████╔██║    ███████╗███████║██║█████╗     ██║   ',
  '██║     ██║   ██║██║╚██╗██║   ██║   ██║██║╚██╗██║██║   ██║██║   ██║██║╚██╔╝██║    ╚════██║██╔══██║██║██╔══╝     ██║   ',
  '╚██████╗╚██████╔╝██║ ╚████║   ██║   ██║██║ ╚████║╚██████╔╝╚██████╔╝██║ ╚═╝ ██║    ███████║██║  ██║██║██║        ██║   ',
  ' ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ ╚═╝     ╚═╝    ╚══════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝   ',
];

const CHARS_PER_TICK = 3;
const TICK_MS = 18;
const FADE_DURATION = 2000;

interface SplashScreenProps {
  onDone: () => void;
  onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDone, onStart }) => {
  const [displayedChars, setDisplayedChars] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  const totalChars = ASCII_TITLE.reduce((sum, line) => sum + line.length, 0) + ASCII_TITLE.length;

  // Typewriter effect
  useEffect(() => {
    if (typingDone) return;
    const timer = setInterval(() => {
      setDisplayedChars((prev) => {
        const next = prev + CHARS_PER_TICK;
        if (next >= totalChars) {
          clearInterval(timer);
          setTypingDone(true);
          return totalChars;
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [totalChars, typingDone]);

  // Build visible text
  const visibleText = (() => {
    let remaining = displayedChars;
    const lines: string[] = [];
    for (const line of ASCII_TITLE) {
      if (remaining <= 0) break;
      if (remaining >= line.length + 1) {
        lines.push(line);
        remaining -= line.length + 1;
      } else {
        lines.push(line.slice(0, remaining));
        remaining = 0;
      }
    }
    return lines;
  })();

  // Fade out then remove
  useEffect(() => {
    if (!fadingOut) return;
    const t = setTimeout(() => onDone(), FADE_DURATION);
    return () => clearTimeout(t);
  }, [fadingOut, onDone]);

  const handleStart = useCallback(() => {
    if (fadingOut) return;
    onStart();  
    setFadingOut(true);
  }, [fadingOut,onStart]);

  return (
  <div
    className="absolute inset-0 z-50 bg-black"
    style={{
      fontFamily: 'monospace',
      opacity: fadingOut ? 0 : 1,
      transition: `opacity ${FADE_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    }}
  >
    {/* Scanline background */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6,182,212,0.02) 2px, rgba(6,182,212,0.02) 4px)',
      }}
    />

    {/* ===== Title Block ===== */}
    <div
      className="absolute left-0 right-0 pointer-events-none"
      style={{
        top: '40%',
        transform: 'translateY(-50%)',
      }}
    >
    <div className="flex justify-center">
    <pre
      className="text-cyan-400 leading-tight select-none"
      style={{
        fontSize: 'clamp(5px, 0.65vw, 10px)',
        textShadow:
          '0 0 10px rgba(6,182,212,0.6), 0 0 30px rgba(6,182,212,0.3)',
        padding: '0 32px',
      }}
    >
      {visibleText.map((line, i) => (
        <div key={i}>{line || ' '}</div>
      ))}
      {!typingDone && (
        <span className="inline-block animate-pulse text-white">_</span>
      )}
    </pre>
  </div>
  </div>
    {/* ===== CTA Block ===== */}
    <div
      className="absolute left-0 right-0 flex flex-col items-center"
      style={{
        top: '40%',
        transform: 'translateY(100px)', 
      }}
    >
      {/* Decorative line */}
      <div
        className="h-px"
        style={{
          width: typingDone ? '200px' : '0px',
          background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)',
          opacity: typingDone ? 0.6 : 0,
          transition: 'width 1200ms ease-out, opacity 1200ms ease-out',
        }}
      />

      {/* Start button*/}
      <button
        onClick={handleStart}
        className="mt-8 group relative overflow-hidden bg-cyan-500/10 hover:bg-cyan-500
                   border border-cyan-500/60 hover:border-cyan-400
                   text-cyan-400 hover:text-black font-black
                   px-16 py-5 text-lg tracking-[0.3em] uppercase
                   transition-all duration-300
                   shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:shadow-[0_0_40px_rgba(6,182,212,0.4)]"
        style={{
          opacity: typingDone ? 1 : 0,
          transform: typingDone ? 'translateY(0px) scale(1)' : 'translateY(10px) scale(0.98)',
          transition: 'opacity 520ms ease, transform 520ms ease',
          pointerEvents: typingDone ? 'auto' : 'none',
        }}
      >
        <span className="relative z-10">GAME START</span>
      </button>

      {/* Hint */}
      <p
        className="text-center text-[10px] text-cyan-400/40 mt-3 tracking-[0.4em] uppercase"
        style={{
          opacity: typingDone ? 1 : 0,
          transform: typingDone ? 'translateY(0px)' : 'translateY(6px)',
          transition: 'opacity 650ms ease, transform 650ms ease',
          pointerEvents: 'none',
        }}
      >
        click to engage neural interface
      </p>
    </div>
  </div>
);
};
