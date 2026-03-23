import { rnd, pick } from './helpers.js';

export const PN={GK:'POR',DEF:'DEF',MID:'MED',FWD:'DEL'};
export const PC={GK:'gk',DEF:'df',MID:'md',FWD:'fw'};
export const POS_ORDER={GK:0,DEF:1,MID:2,FWD:3};
export const POS_COLORS={GK:'#ffc107',DEF:'#448aff',MID:'#00e676',FWD:'#ff1744'};
export const POS_ICON_IDX={GK:0,DEF:1,MID:2,FWD:3};

// Design system
export const T={
  bg:'#0D1117', bg1:'#161B22', bg2:'#21262D', bg3:'#30363D',
  tx:'#E6EDF3', tx2:'#8B949E', tx3:'#484F58',
  win:'#3FB950', lose:'#F85149', draw:'#D29922', info:'#58A6FF', gold:'#FFD700',
  accent:'#00C853', purple:'#A855F7', border:'rgba(255,255,255,0.06)',
};

export const CARD_TIERS = {
  normal: { bg: 'linear-gradient(135deg,rgba(20,30,58,0.95),rgba(26,39,68,0.95))', border: 'rgba(255,255,255,0.08)', glow: 'none' },
  rare: { bg: 'linear-gradient(135deg,#1a1030,#2d1a4a)', border: 'rgba(168,85,247,0.3)', glow: '0 0 20px rgba(168,85,247,0.15)' },
  legendary: { bg: 'linear-gradient(135deg,#2a2510,#3a3215)', border: 'rgba(255,215,0,0.4)', glow: '0 0 30px rgba(255,215,0,0.2)' },
};

const SOCIAL_ACCOUNTS = [
  [
    { n: '@TioChuyFutbol', v: false, f: '234', av: '👴' },
    { n: '@LaComadreDeportiva', v: false, f: '89', av: '👩' },
    { n: '@FutbolDeBarro', v: false, f: '1.2K', av: '⚽' },
  ],
  [
    { n: '@DeportesMunicipal', v: true, f: '12K', av: '📰' },
    { n: '@ElChivoFutbolero', v: false, f: '3.4K', av: '🐐' },
    { n: '@FabrizioRomano', v: true, f: '18M', av: '📡' },
  ],
  [
    { n: '@EstatalDeportes', v: true, f: '45K', av: '🏛' },
    { n: '@CrackDelNorte', v: false, f: '23K', av: '⭐' },
    { n: '@FabrizioRomano', v: true, f: '18M', av: '📡' },
  ],
  [
    { n: '@TDNMéxico', v: true, f: '890K', av: '📺' },
    { n: '@TUDN', v: true, f: '2.1M', av: '🎙' },
    { n: '@FabrizioRomano', v: true, f: '18M', av: '📡' },
  ],
  [
    { n: '@ESPN_MX', v: true, f: '5.6M', av: '🎯' },
    { n: '@FutbolTotal', v: true, f: '8M', av: '🌎' },
    { n: '@FabrizioRomano', v: true, f: '18M', av: '📡' },
  ],
  [
    { n: '@BBC_Sport', v: true, f: '42M', av: '🌍' },
    { n: '@SkySports', v: true, f: '38M', av: '🔵' },
    { n: '@FabrizioRomano', v: true, f: '18M', av: '📡' },
  ],
  [
    { n: '@GalacticSports', v: true, f: '900M', av: '🛸' },
    { n: '@InterstellarFC', v: true, f: '2.1B', av: '🌌' },
    { n: '@FabrizioRomano', v: true, f: '18M', av: '📡' },
  ],
];

const LIVE_TEMPLATES = [
  (m, ps, rs) => `Min ${m}' — HAL ${ps}-${rs}. ¡El partido está abierto!`,
  (m) => `${m}' Caliente el partido ahora mismo 🔥`,
  (m, ps, rs) => ps > rs ? `${m}' Los Halcones mandan! ${ps}-${rs} 💙` : `${m}' El rival presiona, ${ps}-${rs}`,
  () => `¿Están viendo esto? 👀 Increíble lo que pasa en la cancha`,
  (m) => `Min ${m}' — ¡Qué partido tan intenso!`,
  (m, ps, rs) => `${m}' Marcador: HAL ${ps} - RIV ${rs} #EnVivo`,
  () => `Se me va el corazón con este partido 😅`,
];

export function generateLivePosts(league, minute, log, ps, rs, matchType) {
  if (minute < 5) return [];
  const accounts = SOCIAL_ACCOUNTS[Math.min(league, 6)];
  const posts = [];
  const numPosts = Math.min(3, Math.floor(minute / 15) + 1);
  for (let i = 0; i < numPosts; i++) {
    const acc = pick(accounts);
    const tmpl = pick(LIVE_TEMPLATES);
    posts.push({
      acc, text: tmpl(minute, ps, rs),
      likes: `${rnd(10, 999)}`, comments: rnd(1, 50), rt: rnd(0, 30),
      t: `${minute}'`, hot: ps !== rs && Math.random() < 0.3,
    });
  }
  return posts;
}

const POST_TEMPLATES = {
  win: [
    (hn, rn, ps, rs) => `¡¡VICTORIA!! ${hn} ${ps}-${rs} ${rn}. ¡Los Halcones siguen vivos! 🦅🔥`,
    (hn, rn, ps, rs) => `${ps}-${rs} y tres puntos para casa. ¡Eso es lo que necesitábamos!`,
    () => `El equipo del barrio no para. 💪 Orgullo total.`,
  ],
  loss: [
    (hn, rn, ps, rs) => `Perdimos ${ps}-${rs}. Duele, pero seguimos. 💙`,
    (hn, rn, ps, rs) => `${rn} ganó hoy ${rs}-${ps}. Hay que levantarse.`,
    () => `Partido difícil. El equipo lo dio todo. A recuperarse.`,
  ],
  draw: [
    (hn, rn, ps, rs) => `Empate ${ps}-${ps}. Un punto es un punto. 🤷`,
    () => `Reparto de puntos. Quedó en ${1}-${1}.`,
    () => `Empate intenso. El marcador no refleja lo que vimos.`,
  ],
  fabrizio: [
    (hn) => `Here we go! ${hn} — confirmado y acuerdo total. El mercado se mueve 📡`,
    () => `Fuentes confiables indican movimiento importante de fichajes ⚽`,
  ],
  streak: [
    (hn, rn, ps, rs, streak) => `${streak} victorias seguidas para ${hn}! Racha histórica 🔥🔥`,
  ],
};

export function generateSocialPosts(league, won, drew, rivalName, ps, rs, streak) {
  const accounts = SOCIAL_ACCOUNTS[Math.min(league, 6)];
  const posts = [];
  const type = won ? 'win' : drew ? 'draw' : 'loss';
  const templates = POST_TEMPLATES[type];
  for (let i = 0; i < Math.min(4, accounts.length + 1); i++) {
    const acc = pick(accounts);
    const tmpl = pick(templates);
    posts.push({
      account: acc,
      text: tmpl('Halcones', rivalName, ps, rs, streak),
      likes: `${rnd(100, 9999)}`,
      comments: rnd(5, 200),
      retweets: rnd(10, 500),
      sticker: null,
      time: `${rnd(1, 59)}m`,
    });
  }
  // Fabrizio special
  if (league >= 1 && Math.random() < 0.4) {
    const fab = pick(POST_TEMPLATES.fabrizio);
    posts.push({
      account: { n: '@FabrizioRomano', v: true, f: '18M', av: '📡' },
      text: fab('Halcones', rivalName),
      likes: `${rnd(5000, 50000)}`,
      comments: rnd(500, 5000),
      retweets: rnd(1000, 20000),
      sticker: null,
      time: `${rnd(1, 10)}m`,
    });
  }
  if (streak >= 3) {
    const streakTmpl = pick(POST_TEMPLATES.streak);
    posts.push({
      account: pick(accounts),
      text: streakTmpl('Halcones', rivalName, ps, rs, streak),
      likes: `${rnd(1000, 20000)}`,
      comments: rnd(100, 1000),
      retweets: rnd(200, 5000),
      sticker: null,
      time: `${rnd(1, 20)}m`,
    });
  }
  return posts;
}

// Kit colors for rival teams by league
export function getRivalKit(league) {
  const kits = [
    ['#c62828', '#b71c1c'],
    ['#6a1b9a', '#4a148c'],
    ['#1565c0', '#0d47a1'],
    ['#2e7d32', '#1b5e20'],
    ['#e65100', '#bf360c'],
    ['#37474f', '#263238'],
    ['#4a148c', '#880e4f'],
  ];
  return kits[league % kits.length];
}

// Pitch images (we'll generate gradient-based ones)
export const _pitchImgs = [];

// Legends pool
export const LEGENDS = [
  {name:'El Maestro Pelé',pos:'FWD',trait:{n:'Legendario',d:'Clase mundial',fx:'atk'},bonus:{atk:8,def:3,spd:5},story:'Una aparición sobrenatural en tu cancha.'},
  {name:'La Muralla Beckenbauer',pos:'DEF',trait:{n:'Kaiser',d:'Domina la defensa',fx:'def'},bonus:{atk:2,def:9,spd:3},story:'El kaiser apareció para una última batalla.'},
  {name:'El Maradona del Barrio',pos:'MID',trait:{n:'Dios',d:'El mejor de todos',fx:'ghost'},bonus:{atk:7,def:4,spd:8},story:'Dicen que jugó en el barrio hace 30 años.'},
];

// Canvas sprite drawing
export function drawSprite(ctx, x, y, bodyCol, darkCol, frame, seed, isGK = false) {
  const s = 14;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + s + 2, s * 0.7, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body
  const bobY = Math.sin(frame * 0.12 + seed * 0.7) * 1.2;
  ctx.fillStyle = isGK ? '#ffc107' : bodyCol;
  ctx.fillRect(x - s * 0.5, y - s * 0.3 + bobY, s, s * 1.1);
  // Head
  ctx.fillStyle = '#f5c5a3';
  ctx.beginPath();
  ctx.arc(x, y - s * 0.5 + bobY, s * 0.42, 0, Math.PI * 2);
  ctx.fill();
  // Shorts
  ctx.fillStyle = darkCol;
  ctx.fillRect(x - s * 0.5, y + s * 0.6 + bobY, s * 0.45, s * 0.5);
  ctx.fillRect(x + s * 0.05, y + s * 0.6 + bobY, s * 0.45, s * 0.5);
  // Legs
  const legSwing = Math.sin(frame * 0.18 + seed) * 3;
  ctx.fillStyle = '#f5c5a3';
  ctx.fillRect(x - s * 0.35, y + s * 1.05 + bobY - legSwing, s * 0.28, s * 0.7);
  ctx.fillRect(x + s * 0.07, y + s * 1.05 + bobY + legSwing, s * 0.28, s * 0.7);
  // Boots
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(x - s * 0.38, y + s * 1.65 + bobY, s * 0.34, s * 0.28);
  ctx.fillRect(x + s * 0.05, y + s * 1.65 + bobY, s * 0.34, s * 0.28);
}
