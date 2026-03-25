import { useState, useEffect, useRef } from 'react';
import useGameStore from '@/game/store';
import { T } from '@/game/data';

const STAGES = [
  { label: 'Preparando estadio...', target: 25 },
  { label: 'Cargando planteles...', target: 50 },
  { label: 'Generando liga...', target: 75 },
  { label: '\u00a1Listo!', target: 100 },
];

export default function LoadingScreen() {
  const { storageReady, go } = useGameStore();
  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const [fadeClass, setFadeClass] = useState('fade-in');
  const doneRef = useRef(false);

  useEffect(() => {
    const timers = [];

    // Stage 0 -> 25% at 0ms
    timers.push(setTimeout(() => {
      setProgress(25);
    }, 100));

    // Stage 1 -> 50% at 700ms
    timers.push(setTimeout(() => {
      setFadeClass('fade-out');
      setTimeout(() => { setStageIdx(1); setFadeClass('fade-in'); }, 200);
      setProgress(50);
    }, 700));

    // Stage 2 -> 75% at 1400ms
    timers.push(setTimeout(() => {
      setFadeClass('fade-out');
      setTimeout(() => { setStageIdx(2); setFadeClass('fade-in'); }, 200);
      setProgress(75);
    }, 1400));

    // Stage 3 -> 100% at 2100ms
    timers.push(setTimeout(() => {
      setFadeClass('fade-out');
      setTimeout(() => { setStageIdx(3); setFadeClass('fade-in'); }, 200);
      setProgress(100);
    }, 2100));

    return () => timers.forEach(clearTimeout);
  }, []);

  // Auto-advance when progress is 100 and storage is ready
  useEffect(() => {
    if (progress === 100 && storageReady && !doneRef.current) {
      doneRef.current = true;
      const t = setTimeout(() => go('title'), 500);
      return () => clearTimeout(t);
    }
  }, [progress, storageReady, go]);

  const stage = STAGES[stageIdx];

  return (
    <div className="bg-metallic-shine" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', gap: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient stadium glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: T.gradientStadium, pointerEvents: 'none',
      }} />

      {/* Bouncing ball */}
      <div style={{
        fontSize: 64,
        filter: `drop-shadow(0 0 20px rgba(240,192,64,0.35))`,
        animation: 'loadingBounce 1s cubic-bezier(0.36, 0, 0.66, -0.56) infinite alternate',
        position: 'relative', zIndex: 1,
      }}>
        <span role="img" aria-label="football">&#9917;</span>
      </div>

      {/* Title */}
      <div style={{
        fontFamily: T.fontTitle, fontWeight: 700, fontSize: 28, color: T.gold,
        textTransform: 'uppercase', letterSpacing: 6, textShadow: T.glowGold,
        position: 'relative', zIndex: 1,
      }}>
        RABONA
      </div>

      {/* Stage text with fade */}
      <div style={{
        fontFamily: T.fontBody, fontSize: 14, color: T.tx2,
        letterSpacing: 1, minHeight: 20, textAlign: 'center',
        opacity: fadeClass === 'fade-in' ? 1 : 0,
        transition: 'opacity 0.2s ease',
        position: 'relative', zIndex: 1,
      }}>
        {stage.label}
      </div>

      {/* Progress bar container */}
      <div style={{
        width: 220, position: 'relative', zIndex: 1,
      }}>
        {/* Track */}
        <div className="glass" style={{
          width: '100%', height: 8, borderRadius: 4, overflow: 'hidden',
          border: `1px solid ${T.glassBorder}`,
        }}>
          {/* Fill */}
          <div style={{
            width: `${progress}%`, height: '100%',
            background: T.gradientPrimary,
            borderRadius: 4,
            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: `0 0 12px rgba(240,192,64,0.4)`,
          }} />
        </div>
        {/* Percentage */}
        <div style={{
          fontFamily: T.fontHeading, fontWeight: 600, fontSize: 12, color: T.gold,
          textAlign: 'right', marginTop: 6, letterSpacing: 1,
        }}>
          {progress}%
        </div>
      </div>

      {/* Inline keyframes for bounce animation */}
      <style>{`
        @keyframes loadingBounce {
          0% { transform: translateY(0) scale(1, 1); }
          100% { transform: translateY(-18px) scale(0.95, 1.05); }
        }
      `}</style>
    </div>
  );
}
