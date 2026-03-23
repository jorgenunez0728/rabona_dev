import { useState } from 'react';

// ── Asset Registry ──
// Maps game entities to chibi asset paths with emoji fallbacks.
// Assets are loaded from src/assets/chibi/ via Vite imports.
// Until images are provided, the emoji fallback is shown.

const chibiBase = '/src/assets/chibi';

export const CHIBI = {
  coaches: {
    miguel:   { src: `${chibiBase}/coaches/coach-miguel.png`, fallback: '👴' },
    bestia:   { src: `${chibiBase}/coaches/coach-bestia.png`, fallback: '🦁' },
    lupe:     { src: `${chibiBase}/coaches/coach-lupe.png`, fallback: '👩‍🦳' },
    profeta:  { src: `${chibiBase}/coaches/coach-profeta.png`, fallback: '🔮' },
    chispa:   { src: `${chibiBase}/coaches/coach-chispa.png`, fallback: '⚡' },
    fantasma: { src: `${chibiBase}/coaches/coach-fantasma.png`, fallback: '👻' },
    moneda:   { src: `${chibiBase}/coaches/coach-moneda.png`, fallback: '🪙' },
    zyx7:     { src: `${chibiBase}/coaches/coach-zyx7.png`, fallback: '👽' },
  },
  nemesis: {
    miguel:   { src: `${chibiBase}/coaches/nemesis-cacique.png`, fallback: '🦅' },
    bestia:   { src: `${chibiBase}/coaches/nemesis-cirujano.png`, fallback: '🔪' },
    lupe:     { src: `${chibiBase}/coaches/nemesis-patron.png`, fallback: '🎩' },
    profeta:  { src: `${chibiBase}/coaches/nemesis-chaman.png`, fallback: '🌀' },
    chispa:   { src: `${chibiBase}/coaches/nemesis-tanque.png`, fallback: '🪖' },
    fantasma: { src: `${chibiBase}/coaches/nemesis-detective.png`, fallback: '🕵️' },
    moneda:   { src: `${chibiBase}/coaches/nemesis-jeque.png`, fallback: '💎' },
    zyx7:     { src: `${chibiBase}/coaches/nemesis-kx9.png`, fallback: '🤖' },
  },
  positions: {
    GK:  { src: `${chibiBase}/icons/pos-gk.png`, fallback: '🧤' },
    DEF: { src: `${chibiBase}/icons/pos-def.png`, fallback: '🛡' },
    MID: { src: `${chibiBase}/icons/pos-mid.png`, fallback: '⚙' },
    FWD: { src: `${chibiBase}/icons/pos-fwd.png`, fallback: '⚡' },
  },
};

// ── ChibiImg Component ──
// Renders a chibi pixel art image with automatic emoji fallback.
// If the image fails to load (404), it shows the fallback emoji.
export function ChibiImg({ asset, size = 32, style = {} }) {
  const [failed, setFailed] = useState(false);

  if (!asset?.src || failed) {
    return (
      <span style={{
        fontSize: size * 0.7,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        ...style,
      }}>
        {asset?.fallback || '❓'}
      </span>
    );
  }

  return (
    <img
      src={asset.src}
      width={size}
      height={size}
      alt=""
      onError={() => setFailed(true)}
      style={{
        imageRendering: 'pixelated',
        ...style,
      }}
    />
  );
}
