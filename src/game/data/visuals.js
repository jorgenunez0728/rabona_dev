import { rnd, pick } from './helpers.js';

// ── Player & Rival Sprite Loading ──
const playerSpriteMods = import.meta.glob('../../assets/chibi/icons/player-sprites/*.png', { eager: true, query: '?url', import: 'default' });
const rivalSpriteMods = import.meta.glob('../../assets/chibi/icons/rival-sprites/*.png', { eager: true, query: '?url', import: 'default' });

function spriteUrl(mods, name) {
  const key = Object.keys(mods).find(k => k.endsWith(`/${name}.png`));
  return key ? mods[key] : null;
}

const _spriteImgCache = {};
function loadSpriteImg(url) {
  if (!url) return null;
  if (!_spriteImgCache[url]) {
    const img = new Image();
    img.src = url;
    _spriteImgCache[url] = img;
  }
  return _spriteImgCache[url];
}

// Pre-build sprite URL arrays
const PLAYER_SPRITE_URLS = {
  idle: [1,2,3,4].map(i => spriteUrl(playerSpriteMods, `player-idle-${i}`)).filter(Boolean),
  run: [1,2,3,4,5,6].map(i => spriteUrl(playerSpriteMods, `player-run-${i}`)).filter(Boolean),
  kick: [1,2,3,4,5,6].map(i => spriteUrl(playerSpriteMods, `player-kick-${i}`)).filter(Boolean),
  celebrate: Array.from({length:10}, (_,i) => spriteUrl(playerSpriteMods, `player-celebrate-${i+1}`)).filter(Boolean),
};

const RIVAL_SPRITE_URLS = {
  red:    { idle: [1,2,3,4].map(i => spriteUrl(rivalSpriteMods, `rival-red-idle-${i}`)).filter(Boolean),
            run:  [1,2,3,4].map(i => spriteUrl(rivalSpriteMods, `rival-red-run-${i}`)).filter(Boolean) },
  green:  { idle: [1,2].map(i => spriteUrl(rivalSpriteMods, `rival-green-idle-${i}`)).filter(Boolean),
            run:  [1,2].map(i => spriteUrl(rivalSpriteMods, `rival-green-run-${i}`)).filter(Boolean) },
  purple: { idle: [1,2].map(i => spriteUrl(rivalSpriteMods, `rival-purple-idle-${i}`)).filter(Boolean),
            run:  [1,2].map(i => spriteUrl(rivalSpriteMods, `rival-purple-run-${i}`)).filter(Boolean) },
  gk:     { idle: [1,2,3,4].map(i => spriteUrl(rivalSpriteMods, `rival-gk-idle-${i}`)).filter(Boolean),
            run:  [1,2,3,4].map(i => spriteUrl(rivalSpriteMods, `rival-gk-idle-${i}`)).filter(Boolean) },
};

// Map rival kit primary color to sprite variant
export function getRivalSpriteVariant(kitColor) {
  if (!kitColor) return 'red';
  const c = kitColor.toLowerCase();
  if (c.includes('9a') || c.includes('4a14') || c.includes('855')) return 'purple';
  if (c.includes('7d32') || c.includes('5e20') || c.includes('474f') || c.includes('3238')) return 'green';
  return 'red'; // red, orange, blue, etc. default to red variant
}

export const PN={GK:'POR',DEF:'DEF',MID:'MED',FWD:'DEL'};
export const PC={GK:'gk',DEF:'df',MID:'md',FWD:'fw'};
export const POS_ORDER={GK:0,DEF:1,MID:2,FWD:3};
export const POS_COLORS={GK:'#ffc107',DEF:'#448aff',MID:'#00e676',FWD:'#ff1744'};
export const POS_ICON_IDX={GK:0,DEF:1,MID:2,FWD:3};

// Design system
export const T={
  bg:'#0D1117', bg1:'#161B22', bg2:'#21262D', bg3:'#30363D',
  tx:'#E6EDF3', tx2:'#8B949E', tx3:'#6E7681', tx4:'#9198A1',
  win:'#3FB950', lose:'#F85149', draw:'#D29922', info:'#58A6FF', gold:'#FFD700',
  accent:'#00C853', purple:'#A855F7', border:'rgba(255,255,255,0.12)',
  shadow:'0 1px 3px rgba(0,0,0,0.4)', glow:'0 0 12px rgba(88,166,255,0.15)',
  fontPixel:"'Silkscreen', cursive", fontHeading:"'Oswald', sans-serif", fontBody:"'Barlow Condensed', sans-serif",
};

export const CARD_TIERS = {
  normal: { bg: 'linear-gradient(135deg,rgba(20,30,58,0.95),rgba(26,39,68,0.95))', border: 'rgba(255,255,255,0.08)', glow: 'none' },
  rare: { bg: 'linear-gradient(135deg,#1a1030,#2d1a4a)', border: 'rgba(168,85,247,0.3)', glow: '0 0 20px rgba(168,85,247,0.15)' },
  legendary: { bg: 'linear-gradient(135deg,#2a2510,#3a3215)', border: 'rgba(255,215,0,0.4)', glow: '0 0 30px rgba(255,215,0,0.2)' },
};

// Social emoji image URLs
const _socialMods = import.meta.glob('../../assets/chibi/icons/social/*.png', { eager: true, query: '?url', import: 'default' });
function _socialImg(name) { const k = Object.keys(_socialMods).find(k => k.endsWith(`/${name}.png`)); return k ? _socialMods[k] : null; }

export const SOCIAL_EMOJIS = {
  soccer: _socialImg('social-soccer-ball'),
  gamepad: _socialImg('social-gamepad'),
  checklist: _socialImg('social-checklist'),
  scoreboard: _socialImg('social-scoreboard'),
  skull: _socialImg('social-skull-1'),
  whistle: _socialImg('social-whistle'),
  phone: _socialImg('social-phone'),
  angry: _socialImg('social-angry-face'),
  sad: _socialImg('social-sad-face'),
  medical: _socialImg('social-medical-cross'),
  arrowUp: _socialImg('social-arrow-up'),
  dumbbell: _socialImg('social-dumbbell'),
  bag: _socialImg('social-shopping-bag'),
};

const SOCIAL_ACCOUNTS = [
  [
    { n: '@TioChuyFutbol', v: false, f: '234', av: '👴', avImg: SOCIAL_EMOJIS.gamepad },
    { n: '@LaComadreDeportiva', v: false, f: '89', av: '👩', avImg: SOCIAL_EMOJIS.checklist },
    { n: '@FutbolDeBarro', v: false, f: '1.2K', av: '⚽', avImg: SOCIAL_EMOJIS.soccer },
  ],
  [
    { n: '@DeportesMunicipal', v: true, f: '12K', av: '📰', avImg: SOCIAL_EMOJIS.scoreboard },
    { n: '@ElChivoFutbolero', v: false, f: '3.4K', av: '🐐', avImg: SOCIAL_EMOJIS.soccer },
    { n: '@FabrizioRomano', v: true, f: '18M', av: '📡', avImg: SOCIAL_EMOJIS.whistle },
  ],
  [
    { n: '@EstatalDeportes', v: true, f: '45K', av: '🏛', avImg: SOCIAL_EMOJIS.scoreboard },
    { n: '@CrackDelNorte', v: false, f: '23K', av: '⭐', avImg: SOCIAL_EMOJIS.soccer },
    { n: '@FabrizioRomano', v: true, f: '18M', av: '📡', avImg: SOCIAL_EMOJIS.whistle },
  ],
  [
    { n: '@TDNMéxico', v: true, f: '890K', av: '📺', avImg: SOCIAL_EMOJIS.phone },
    { n: '@TUDN', v: true, f: '2.1M', av: '🎙', avImg: SOCIAL_EMOJIS.whistle },
    { n: '@FabrizioRomano', v: true, f: '18M', av: '📡', avImg: SOCIAL_EMOJIS.whistle },
  ],
  [
    { n: '@ESPN_MX', v: true, f: '5.6M', av: '🎯', avImg: SOCIAL_EMOJIS.soccer },
    { n: '@FutbolTotal', v: true, f: '8M', av: '🌎', avImg: SOCIAL_EMOJIS.soccer },
    { n: '@FabrizioRomano', v: true, f: '18M', av: '📡', avImg: SOCIAL_EMOJIS.whistle },
  ],
  [
    { n: '@BBC_Sport', v: true, f: '42M', av: '🌍', avImg: SOCIAL_EMOJIS.soccer },
    { n: '@SkySports', v: true, f: '38M', av: '🔵', avImg: SOCIAL_EMOJIS.soccer },
    { n: '@FabrizioRomano', v: true, f: '18M', av: '📡', avImg: SOCIAL_EMOJIS.whistle },
  ],
  [
    { n: '@GalacticSports', v: true, f: '900M', av: '🛸', avImg: SOCIAL_EMOJIS.gamepad },
    { n: '@InterstellarFC', v: true, f: '2.1B', av: '🌌', avImg: SOCIAL_EMOJIS.gamepad },
    { n: '@FabrizioRomano', v: true, f: '18M', av: '📡', avImg: SOCIAL_EMOJIS.whistle },
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
      account: { n: '@FabrizioRomano', v: true, f: '18M', av: '📡', avImg: SOCIAL_EMOJIS.whistle },
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
  {name:'El Maestro Pelé',pos:'FWD',img:'maestro',trait:{n:'Legendario',d:'Clase mundial',fx:'atk'},bonus:{atk:8,def:3,spd:5},story:'Una aparición sobrenatural en tu cancha.'},
  {name:'La Muralla Beckenbauer',pos:'DEF',img:'muralla',trait:{n:'Kaiser',d:'Domina la defensa',fx:'def'},bonus:{atk:2,def:9,spd:3},story:'El kaiser apareció para una última batalla.'},
  {name:'El Maradona del Barrio',pos:'MID',img:'dios',trait:{n:'Dios',d:'El mejor de todos',fx:'ghost'},bonus:{atk:7,def:4,spd:8},story:'Dicen que jugó en el barrio hace 30 años.'},
];

// Formation-specific canvas positions
const CANVAS_FORMATIONS = {
  muro: [
    { bx: .5, by: .88, pull: .005, minY: .78, maxY: .95 },
    { bx: .20, by: .72, pull: .02, minY: .55, maxY: .82 },
    { bx: .50, by: .68, pull: .015, minY: .55, maxY: .80 },
    { bx: .80, by: .72, pull: .02, minY: .55, maxY: .82 },
    { bx: .50, by: .30, pull: .08, minY: .15, maxY: .55 },
  ],
  clasica: [
    { bx: .5, by: .88, pull: .005, minY: .78, maxY: .95 },
    { bx: .25, by: .70, pull: .02, minY: .55, maxY: .82 },
    { bx: .75, by: .70, pull: .02, minY: .55, maxY: .82 },
    { bx: .50, by: .52, pull: .06, minY: .35, maxY: .70 },
    { bx: .50, by: .35, pull: .08, minY: .15, maxY: .60 },
  ],
  diamante: [
    { bx: .5, by: .88, pull: .005, minY: .78, maxY: .95 },
    { bx: .50, by: .68, pull: .02, minY: .55, maxY: .80 },
    { bx: .25, by: .52, pull: .04, minY: .35, maxY: .68 },
    { bx: .75, by: .52, pull: .04, minY: .35, maxY: .68 },
    { bx: .50, by: .30, pull: .08, minY: .15, maxY: .55 },
  ],
  blitz: [
    { bx: .5, by: .88, pull: .005, minY: .78, maxY: .95 },
    { bx: .30, by: .70, pull: .02, minY: .55, maxY: .82 },
    { bx: .70, by: .70, pull: .02, minY: .55, maxY: .82 },
    { bx: .30, by: .35, pull: .07, minY: .15, maxY: .60 },
    { bx: .70, by: .35, pull: .07, minY: .15, maxY: .60 },
  ],
  tridente: [
    { bx: .5, by: .88, pull: .005, minY: .78, maxY: .95 },
    { bx: .50, by: .68, pull: .02, minY: .55, maxY: .80 },
    { bx: .20, by: .35, pull: .07, minY: .15, maxY: .60 },
    { bx: .50, by: .30, pull: .08, minY: .15, maxY: .55 },
    { bx: .80, by: .35, pull: .07, minY: .15, maxY: .60 },
  ],
  cadena: [
    { bx: .5, by: .88, pull: .005, minY: .78, maxY: .95 },
    { bx: .30, by: .68, pull: .02, minY: .55, maxY: .80 },
    { bx: .70, by: .68, pull: .02, minY: .55, maxY: .80 },
    { bx: .25, by: .48, pull: .04, minY: .30, maxY: .65 },
    { bx: .75, by: .48, pull: .04, minY: .30, maxY: .65 },
  ],
};

export function getCanvasFormation(formationId) {
  const id = (formationId || 'clasica').toString().toLowerCase();
  const home = CANVAS_FORMATIONS[id] || CANVAS_FORMATIONS.clasica;
  const away = home.map(p => ({
    bx: p.bx,
    by: 1 - p.by,
    pull: p.pull,
    minY: 1 - p.maxY,
    maxY: 1 - p.minY,
  }));
  const zeros = [0, 0, 0, 0, 0];
  return { home, away, homeSpreadX: zeros, awaySpreadX: zeros };
}

// Canvas sprite drawing
// team: 'home' | 'rival' — rivalVariant: 'red'|'green'|'purple'
export function drawSprite(ctx, x, y, bodyCol, darkCol, frame, seed, isGK = false, team = 'home', rivalVariant = 'red', animState = 'idle') {
  const drawSize = 30;

  // Try to draw a loaded sprite image
  let urls = null;
  if (team === 'home') {
    urls = PLAYER_SPRITE_URLS[animState] || PLAYER_SPRITE_URLS.idle;
  } else {
    const variant = isGK ? 'gk' : (RIVAL_SPRITE_URLS[rivalVariant] ? rivalVariant : 'red');
    if (animState === 'run' && RIVAL_SPRITE_URLS[variant]?.run) {
      urls = RIVAL_SPRITE_URLS[variant].run;
    } else {
      urls = RIVAL_SPRITE_URLS[variant]?.idle || [];
    }
  }

  if (urls && urls.length > 0) {
    const frameIdx = Math.floor(frame / 12 + seed) % urls.length;
    const img = loadSpriteImg(urls[frameIdx]);
    if (img && img.complete && img.naturalWidth > 0) {
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(x, y + drawSize * 0.45, drawSize * 0.35, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(img, x - drawSize / 2, y - drawSize / 2, drawSize, drawSize);
      return;
    }
  }

  // Fallback: procedural drawing
  const s = 14;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + s + 2, s * 0.7, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  const bobY = Math.sin(frame * 0.12 + seed * 0.7) * 1.2;
  ctx.fillStyle = isGK ? '#ffc107' : bodyCol;
  ctx.fillRect(x - s * 0.5, y - s * 0.3 + bobY, s, s * 1.1);
  ctx.fillStyle = '#f5c5a3';
  ctx.beginPath();
  ctx.arc(x, y - s * 0.5 + bobY, s * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = darkCol;
  ctx.fillRect(x - s * 0.5, y + s * 0.6 + bobY, s * 0.45, s * 0.5);
  ctx.fillRect(x + s * 0.05, y + s * 0.6 + bobY, s * 0.45, s * 0.5);
  const legSwing = Math.sin(frame * 0.18 + seed) * 3;
  ctx.fillStyle = '#f5c5a3';
  ctx.fillRect(x - s * 0.35, y + s * 1.05 + bobY - legSwing, s * 0.28, s * 0.7);
  ctx.fillRect(x + s * 0.07, y + s * 1.05 + bobY + legSwing, s * 0.28, s * 0.7);
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(x - s * 0.38, y + s * 1.65 + bobY, s * 0.34, s * 0.28);
  ctx.fillRect(x + s * 0.05, y + s * 1.65 + bobY, s * 0.34, s * 0.28);
}
