// ═══════════════════════════════════════
// TACTICAL CARDS — Pre-run loadout system
// Cards trigger during matches at specific moments
// ═══════════════════════════════════════

export const CARD_CATEGORIES = ['offensive', 'defensive', 'economic', 'chaotic'];

export const CARD_RARITIES = {
  common:    { n: 'Común',      color: '#9e9e9e' },
  uncommon:  { n: 'Infrecuente', color: '#4caf50' },
  rare:      { n: 'Rara',       color: '#42a5f5' },
  legendary: { n: 'Legendaria', color: '#ffd600' },
};

export const TACTICAL_CARDS = [
  // ── OFFENSIVE (8) ──
  {
    id: 'gol_fantasma', n: 'Gol Fantasma', i: '👻', cat: 'offensive', rarity: 'common',
    d: 'Si fallas en la 2a parte, 15% de convertirla en gol.',
    trigger: 'on_miss', triggerCondition: { half: 2 },
    effect: { goalChanceBonus: 0.15 },
    cooldown: 0, unlockReq: null,
  },
  {
    id: 'presion_final', n: 'Presión Final', i: '⏰', cat: 'offensive', rarity: 'uncommon',
    d: 'Después del minuto 75, +20% chance de gol.',
    trigger: 'on_chance', triggerCondition: { minuteMin: 75, team: 'home' },
    effect: { goalChanceBonus: 0.20 },
    cooldown: 0, unlockReq: null,
  },
  {
    id: 'tiki_taka', n: 'Tiki-Taka', i: '🔄', cat: 'offensive', rarity: 'rare',
    d: 'Si tu posesión es >60%, +1 chance extra por partido.',
    trigger: 'on_tick', triggerCondition: { possessionMin: 60 },
    effect: { extraChance: 1, perMatch: true },
    cooldown: 0, unlockReq: 'streak5',
  },
  {
    id: 'contra_letal', n: 'Contra Letal', i: '⚡', cat: 'offensive', rarity: 'common',
    d: 'Contraataques +25% efectividad.',
    trigger: 'on_chance', triggerCondition: { chanceType: 'contraataque', team: 'home' },
    effect: { goalChanceBonus: 0.25 },
    cooldown: 0, unlockReq: null,
  },
  {
    id: 'cabezazo', n: 'Cabezazo', i: '🗣', cat: 'offensive', rarity: 'common',
    d: 'Pelota parada +20% gol.',
    trigger: 'on_chance', triggerCondition: { chanceType: 'pelotaParada', team: 'home' },
    effect: { goalChanceBonus: 0.20 },
    cooldown: 0, unlockReq: null,
  },
  {
    id: 'gambeta', n: 'Gambeta', i: '💃', cat: 'offensive', rarity: 'uncommon',
    d: 'Jugador más rápido del equipo: +10% chance de gol.',
    trigger: 'on_chance', triggerCondition: { team: 'home', fastestPlayer: true },
    effect: { goalChanceBonus: 0.10 },
    cooldown: 0, unlockReq: null,
  },
  {
    id: 'golazo', n: 'Golazo', i: '🚀', cat: 'offensive', rarity: 'uncommon',
    d: 'Tiros lejanos +15% efectividad.',
    trigger: 'on_chance', triggerCondition: { chanceType: 'tiroLejano', team: 'home' },
    effect: { goalChanceBonus: 0.15 },
    cooldown: 0, unlockReq: null,
  },
  {
    id: 'inspiracion', n: 'Inspiración', i: '🌟', cat: 'offensive', rarity: 'legendary',
    d: 'Primer gol del partido da +15 moral extra.',
    trigger: 'on_goal_scored', triggerCondition: { team: 'home', firstGoal: true },
    effect: { moraleBoost: 15 },
    cooldown: 0, unlockReq: 'ascension3',
  },

  // ── DEFENSIVE (8) ──
  {
    id: 'muro_humano', n: 'Muro Humano', i: '🧱', cat: 'defensive', rarity: 'common',
    d: 'Primera chance rival del partido: -15% gol.',
    trigger: 'on_rival_chance', triggerCondition: { firstRivalChance: true },
    effect: { rivalGoalPenalty: -0.15 },
    cooldown: 0, unlockReq: null,
  },
  {
    id: 'cerrojo', n: 'Cerrojo', i: '🔒', cat: 'defensive', rarity: 'uncommon',
    d: 'Si vas ganando al 70\', defensa +15%.',
    trigger: 'on_tick', triggerCondition: { minuteMin: 70, winning: true },
    effect: { defMult: 1.15 },
    cooldown: 0, unlockReq: null,
  },
  {
    id: 'portero_doble', n: 'Portero Doble', i: '🧤', cat: 'defensive', rarity: 'rare',
    d: 'Portero +5 SAV en penales.',
    trigger: 'on_penalty_save', triggerCondition: {},
    effect: { savBonus: 5 },
    cooldown: 0, unlockReq: 'ascension1',
  },
  {
    id: 'antidoto', n: 'Antídoto', i: '💊', cat: 'defensive', rarity: 'common',
    d: 'Lesiones -50% probabilidad.',
    trigger: 'on_match_start', triggerCondition: {},
    effect: { injuryMult: 0.5 },
    cooldown: 0, unlockReq: null,
  },
  {
    id: 'recuperacion', n: 'Recuperación', i: '🔋', cat: 'defensive', rarity: 'common',
    d: 'Fatiga -30% post-partido.',
    trigger: 'on_match_end', triggerCondition: {},
    effect: { fatigueMult: 0.7 },
    cooldown: 0, unlockReq: null,
  },
  {
    id: 'escudo', n: 'Escudo', i: '🛡', cat: 'defensive', rarity: 'rare',
    d: 'Si pierdes 0-1, rival no puede anotar más.',
    trigger: 'on_rival_chance', triggerCondition: { scoreDiff: -1 },
    effect: { rivalGoalBlock: true },
    cooldown: 0, unlockReq: null,
  },
  {
    id: 'veterano', n: 'Veterano', i: '👴', cat: 'defensive', rarity: 'uncommon',
    d: 'Jugadores con >10 partidos jugados: +3 DEF.',
    trigger: 'on_match_start', triggerCondition: {},
    effect: { veteranDefBonus: 3, minMatches: 10 },
    cooldown: 0, unlockReq: null,
  },
  {
    id: 'muralla', n: 'Muralla', i: '🏰', cat: 'defensive', rarity: 'uncommon',
    d: 'Primeros 15 minutos: chances rivales -20%.',
    trigger: 'on_rival_chance', triggerCondition: { minuteMax: 15 },
    effect: { rivalGoalPenalty: -0.20 },
    cooldown: 0, unlockReq: null,
  },

  // ── ECONOMIC (6) ──
  {
    id: 'bonus_por_gol', n: 'Bono por Gol', i: '💵', cat: 'economic', rarity: 'common',
    d: '+5 monedas por cada gol que anotes.',
    trigger: 'on_goal_scored', triggerCondition: { team: 'home' },
    effect: { coinBonus: 5 },
    cooldown: 0, unlockReq: null,
  },
  {
    id: 'inversor', n: 'Inversor', i: '📈', cat: 'economic', rarity: 'uncommon',
    d: 'Si >60 monedas, +10% interés al final de jornada.',
    trigger: 'on_match_end', triggerCondition: { coinsMin: 60 },
    effect: { coinInterest: 0.10 },
    cooldown: 0, unlockReq: 'coins500',
  },
  {
    id: 'negociante', n: 'Negociante', i: '🤝', cat: 'economic', rarity: 'common',
    d: 'Mercado -20% precios.',
    trigger: 'on_match_start', triggerCondition: {},
    effect: { marketDiscount: 0.20 },
    cooldown: 0, unlockReq: null,
  },
  {
    id: 'clausula', n: 'Cláusula', i: '📝', cat: 'economic', rarity: 'rare',
    d: 'Al ganar, 10% chance de "fichar" un jugador rival por 30 monedas.',
    trigger: 'on_match_end', triggerCondition: { won: true },
    effect: { signRivalChance: 0.10, signCost: 30 },
    cooldown: 0, unlockReq: null,
  },
  {
    id: 'patrocinio', n: 'Patrocinio', i: '🎽', cat: 'economic', rarity: 'common',
    d: '+3 monedas por partido sin importar resultado.',
    trigger: 'on_match_end', triggerCondition: {},
    effect: { coinBonus: 3 },
    cooldown: 0, unlockReq: null,
  },
  {
    id: 'subasta', n: 'Subasta', i: '🔨', cat: 'economic', rarity: 'rare',
    d: 'Vender jugadores a 150% valor.',
    trigger: 'on_match_start', triggerCondition: {},
    effect: { sellMult: 1.5 },
    cooldown: 0, unlockReq: null,
  },

  // ── CHAOTIC (6) ──
  {
    id: 'provocador', n: 'Provocador', i: '😈', cat: 'chaotic', rarity: 'uncommon',
    d: 'Rival +1 tarjeta extra. Tú +15% riesgo de tarjeta.',
    trigger: 'on_match_start', triggerCondition: {},
    effect: { rivalCardMult: 1.5, ownCardMult: 1.15 },
    cooldown: 0, unlockReq: null,
  },
  {
    id: 'pacto_oscuro', n: 'Pacto Oscuro', i: '🌑', cat: 'chaotic', rarity: 'legendary',
    d: '+30% chance de gol pero ganas maldición cada 3 partidos.',
    trigger: 'on_match_start', triggerCondition: {},
    effect: { goalChanceBonusPermanent: 0.30, curseEvery: 3 },
    cooldown: 0, unlockReq: 'ascension3',
  },
  {
    id: 'ruleta_rusa', n: 'Ruleta Rusa', i: '🎰', cat: 'chaotic', rarity: 'common',
    d: 'Al inicio: 50% +3 ATK equipo, 50% -3 ATK.',
    trigger: 'on_match_start', triggerCondition: {},
    effect: { rouletteAtkSwing: 3 },
    cooldown: 0, unlockReq: null,
  },
  {
    id: 'espionaje', n: 'Espionaje', i: '🕵', cat: 'chaotic', rarity: 'uncommon',
    d: 'Copias el estilo táctico del rival.',
    trigger: 'on_match_start', triggerCondition: {},
    effect: { copyRivalStyle: true },
    cooldown: 0, unlockReq: null,
  },
  {
    id: 'sacrificio', n: 'Sacrificio', i: '🩸', cat: 'chaotic', rarity: 'uncommon',
    d: 'Perder un reserva = +20 moral + 20 monedas.',
    trigger: 'on_match_end', triggerCondition: { hasReserves: true },
    effect: { sacrificeReserve: true, moraleBoost: 20, coinBonus: 20 },
    cooldown: 3, unlockReq: null,
  },
  {
    id: 'trampa_offside', n: 'Trampa del Offside', i: '🪤', cat: 'chaotic', rarity: 'common',
    d: '20% anular gol rival (10% anular uno propio).',
    trigger: 'on_goal', triggerCondition: {},
    effect: { annulChance: 0.20, selfAnnulChance: 0.10 },
    cooldown: 0, unlockReq: null,
  },
];

// Get cards available for collection based on achievements
export function getUnlockableCards(gs) {
  const achievements = gs.achievements || [];
  return TACTICAL_CARDS.filter(c => {
    if (!c.unlockReq) return true;
    return achievements.includes(c.unlockReq);
  });
}

// Get cards in a player's collection
export function getCollectionCards(gs) {
  const collection = gs.cardCollection || [];
  return collection.map(id => TACTICAL_CARDS.find(c => c.id === id)).filter(Boolean);
}

// Generate a reward of 3 random cards to pick from (post-run)
export function generateCardReward(gs, leagueReached) {
  const collection = gs.cardCollection || [];
  const available = TACTICAL_CARDS.filter(c => {
    if (collection.includes(c.id)) return false;
    if (!c.unlockReq) return true;
    return (gs.achievements || []).includes(c.unlockReq);
  });
  if (available.length === 0) return [];

  // Weight by rarity — rarer cards more likely at higher leagues
  const rarityWeight = { common: 4, uncommon: 3, rare: 2 - Math.min(leagueReached, 4) * 0.3, legendary: Math.max(0, leagueReached - 4) * 0.5 };
  const weighted = available.map(c => ({ card: c, w: Math.max(0.1, rarityWeight[c.rarity] || 1) }));
  const result = [];
  const used = new Set();

  for (let i = 0; i < Math.min(3, weighted.length); i++) {
    const pool = weighted.filter(w => !used.has(w.card.id));
    const total = pool.reduce((s, w) => s + w.w, 0);
    let r = Math.random() * total;
    for (const item of pool) {
      r -= item.w;
      if (r <= 0) {
        result.push(item.card);
        used.add(item.card.id);
        break;
      }
    }
  }
  return result;
}

// Validate a card loadout against archetype slots
export function validateCardLoadout(loadout, archetypeSlots) {
  const counts = { offensive: 0, defensive: 0, economic: 0, chaotic: 0 };
  for (const cardId of loadout) {
    const card = TACTICAL_CARDS.find(c => c.id === cardId);
    if (!card) return false;
    counts[card.cat]++;
  }
  for (const cat of CARD_CATEGORIES) {
    if (counts[cat] > (archetypeSlots[cat] || 0)) return false;
  }
  return true;
}

// Get total slots for display
export function getTotalSlots(archetypeSlots, legacyBonusSlots) {
  const base = Object.values(archetypeSlots || {}).reduce((s, v) => s + v, 0);
  return base + (legacyBonusSlots || 0);
}
