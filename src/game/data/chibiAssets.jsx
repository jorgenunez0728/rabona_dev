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
  formations: {
    muro:     { src: `${chibiBase}/icons/formations/form-muro.png`, fallback: '🛡' },
    clasica:  { src: `${chibiBase}/icons/formations/form-clasica.png`, fallback: '⚖️' },
    diamante: { src: `${chibiBase}/icons/formations/form-diamante.png`, fallback: '💎' },
    blitz:    { src: `${chibiBase}/icons/formations/form-blitz.png`, fallback: '⚡' },
    tridente: { src: `${chibiBase}/icons/formations/form-tridente.png`, fallback: '🔱' },
    cadena:   { src: `${chibiBase}/icons/formations/form-cadena.png`, fallback: '🔗' },
  },
  relics: {
    botines94:    { src: `${chibiBase}/icons/relics/relic-botines94.png`, fallback: '👟' },
    corazon:      { src: `${chibiBase}/icons/relics/relic-corazon.png`, fallback: '❤️' },
    mendez:       { src: `${chibiBase}/icons/relics/relic-dra-mendez.png`, fallback: '🩹' },
    vestuario:    { src: `${chibiBase}/icons/relics/relic-vestuario.png`, fallback: '🔗' },
    megafono:     { src: `${chibiBase}/icons/relics/relic-megafono.png`, fallback: '📣' },
    amuleto:      { src: `${chibiBase}/icons/relics/relic-amuleto.png`, fallback: '📿' },
    trofeo:       { src: `${chibiBase}/icons/relics/relic-trofeo.png`, fallback: '🏆' },
    mochila:      { src: `${chibiBase}/icons/relics/relic-mochila.png`, fallback: '🎒' },
    prensa:       { src: `${chibiBase}/icons/relics/relic-prensa.png`, fallback: '📰' },
    reloj:        { src: `${chibiBase}/icons/relics/relic-reloj94.png`, fallback: '⏱' },
    blitz_boots:  { src: `${chibiBase}/icons/relics/relic-botas-ray.png`, fallback: '⚡' },
    muro_cement:  { src: `${chibiBase}/icons/relics/relic-cemento.png`, fallback: '🧱' },
    diamante_key: { src: `${chibiBase}/icons/relics/relic-llave.png`, fallback: '💎' },
    scouting:     { src: `${chibiBase}/icons/relics/relic-ojeadores.png`, fallback: '🔭' },
    pizarron:     { src: `${chibiBase}/icons/relics/relic-pizarron.png`, fallback: '📝' },
    guantes:      { src: `${chibiBase}/icons/relics/relic-guantes.png`, fallback: '🧤' },
    cuaderno:     { src: `${chibiBase}/icons/relics/relic-cuaderno.png`, fallback: '📋' },
  },
  achievements: {
    first_win:    { src: `${chibiBase}/icons/achievements/ach-primera-victoria.png`, fallback: '⚽' },
    barrio_champ: { src: `${chibiBase}/icons/achievements/ach-rey-barrio.png`, fallback: '🏠' },
    nacional:     { src: `${chibiBase}/icons/achievements/ach-seleccion.png`, fallback: '🇲🇽' },
    mundial:      { src: `${chibiBase}/icons/achievements/ach-mundial.png`, fallback: '🌍' },
    galactico:    { src: `${chibiBase}/icons/achievements/ach-galactico.png`, fallback: '🛸' },
    streak5:      { src: `${chibiBase}/icons/achievements/ach-imparable.png`, fallback: '🔥' },
    streak10:     { src: `${chibiBase}/icons/achievements/ach-invencible.png`, fallback: '💎' },
    runs5:        { src: `${chibiBase}/icons/achievements/ach-veterano.png`, fallback: '🎖' },
    runs10:       { src: `${chibiBase}/icons/achievements/ach-maestro.png`, fallback: '👑' },
    goals100:     { src: `${chibiBase}/icons/achievements/ach-100-goles.png`, fallback: '💯' },
    coins500:     { src: `${chibiBase}/icons/achievements/ach-millonario.png`, fallback: '💰' },
    ascension1:   { src: `${chibiBase}/icons/achievements/ach-ascendido.png`, fallback: '⬆️' },
    ascension3:   { src: `${chibiBase}/icons/achievements/ach-curtido.png`, fallback: '🔶' },
    ascension7:   { src: `${chibiBase}/icons/achievements/ach-perfeccion.png`, fallback: '🏆' },
    alien:        { src: `${chibiBase}/icons/achievements/ach-alien.png`, fallback: '👽' },
  },
  legends: {
    maestro: { src: `${chibiBase}/icons/legends/legend-el-maestro.png`, fallback: '👑' },
    muralla: { src: `${chibiBase}/icons/legends/legend-la-muralla.png`, fallback: '🛡' },
    dios:    { src: `${chibiBase}/icons/legends/legend-el-dios.png`, fallback: '⭐' },
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

// ── Shorthand Icon Components ──
export function RelicIcon({ id, size = 28, style }) {
  const asset = CHIBI.relics[id];
  if (!asset) return <span style={{ fontSize: size * 0.7, ...style }}>❓</span>;
  return <ChibiImg asset={asset} size={size} style={style} />;
}

export function FormIcon({ id, size = 28, style }) {
  const asset = CHIBI.formations[id];
  if (!asset) return <span style={{ fontSize: size * 0.7, ...style }}>❓</span>;
  return <ChibiImg asset={asset} size={size} style={style} />;
}

export function AchIcon({ id, size = 28, style }) {
  const asset = CHIBI.achievements[id];
  if (!asset) return <span style={{ fontSize: size * 0.7, ...style }}>❓</span>;
  return <ChibiImg asset={asset} size={size} style={style} />;
}
