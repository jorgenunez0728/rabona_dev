import { RELICS, NODE_TYPES } from './items.js';
import { BOARD_EVENTS } from './events.js';
import { initCopaState } from './leagues.js';


// Helpers
export function rnd(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function calcOvr(p) {
  if (p.pos === 'GK') return Math.round((p.def * 0.2 + p.sav * 0.6 + p.spd * 0.2));
  return Math.round((p.atk + p.def + p.spd) / 3);
}

export function effectiveStats(p, formationMods = null) {
  const fatigueMod = (p.fatigue || 0) > 70 ? 0.85 : (p.fatigue || 0) > 50 ? 0.93 : 1;
  const fm = formationMods || { atkMult: 1, defMult: 1, spdMult: 1 };
  let atk = Math.round(p.atk * fatigueMod * fm.atkMult);
  let def = Math.round(p.def * fatigueMod * fm.defMult);
  let spd = Math.round(p.spd * fatigueMod * fm.spdMult);
  let sav = Math.round((p.sav || 1) * fatigueMod);
  if (p.trait?.fx === 'tank') { def += 4; spd = Math.max(1, spd - 1); }
  if (p.trait?.fx === 'ghost') atk += 3;
  if (p.trait?.fx === 'tireless') { atk = Math.round(p.atk * fm.atkMult); def = Math.round(p.def * fm.defMult); spd = Math.round(p.spd * fm.spdMult); }
  if (p.trait?.fx === 'brute') atk += 2;
  return { atk, def, spd, sav };
}

export function effectiveStatsWithFormation(p, formation) {
  const mods = formation?.mods || { atkMult: 1, defMult: 1, spdMult: 1 };
  return effectiveStats(p, mods);
}

export function effectiveOvr(p) {
  const es = effectiveStats(p);
  if (p.pos === 'GK') return Math.round(es.def * 0.2 + es.sav * 0.6 + es.spd * 0.2);
  return Math.round((es.atk + es.def + es.spd) / 3);
}

export function avgStat(players, stat, formationMods = null) {
  if (!players?.length) return 5;
  return players.reduce((s, p) => s + (effectiveStats(p, formationMods)[stat] || p[stat] || 1), 0) / players.length;
}

// ── Relic draft: pick 3 relics weighted by rarity ──
export function getRelicDraftOptions(currentRelics = [], count = 3) {
  const weights = { common: 5, uncommon: 3, rare: 1.5, cursed: 0 }; // cursed only via start
  const available = RELICS.filter(r => !currentRelics.includes(r.id) && r.rarity !== 'cursed');
  if (available.length === 0) return [];
  // Weighted shuffle
  const pool = [];
  available.forEach(r => { for (let i = 0; i < (weights[r.rarity] || 1) * 10; i++) pool.push(r); });
  const chosen = [];
  while (chosen.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    const relic = pool[idx];
    if (!chosen.find(r => r.id === relic.id)) chosen.push(relic);
    pool.splice(idx, 1);
  }
  return chosen;
}

export function generateNodeChoice() {
  // Returns 2-3 node options for the player to pick pre-match
  const base = ['normal', 'normal'];
  const extras = ['elite', 'rest', 'training'];
  const extra = pick(extras);
  return [base[0], extra].map(id => ({ ...NODE_TYPES[id] }));
}

export function applyRelicEffects(game, eventType, data = {}) {
  const relics = game.relics || [];
  let result = { ...data };
  if (eventType === 'win_coins' && relics.includes('botines94')) result.coinBonus = (result.coinBonus || 0) + 3;
  if (eventType === 'streak_coins' && relics.includes('trofeo')) result.coinBonus = (result.coinBonus || 0) + 2 * (game.streak || 0);
  if (eventType === 'morale_floor' && relics.includes('megafono')) result.moraleFloor = 40;
  if (eventType === 'chem_floor' && relics.includes('vestuario')) result.chemFloor = 30;
  if (eventType === 'match_morale_bonus' && relics.includes('mochila')) result.moraleBonus = (result.moraleBonus || 0) + 5;
  if (eventType === 'obj_bonus' && relics.includes('prensa')) result.objCoinMult = (result.objCoinMult || 1) + 0.5;
  if (eventType === 'injury_reduce' && relics.includes('amuleto')) result.injuryChanceMult = (result.injuryChanceMult || 1) * 0.9;
  if (eventType === 'heal_fast' && relics.includes('mendez')) result.healBonus = 1;
  return result;
}

export function teamGKRating(players) {
  const gk = players?.find(p => p.pos === 'GK' || p.tempGK);
  if (!gk) return 0;
  return effectiveStats(gk).sav;
}

export function teamPower(players, formationMods = null) {
  if (!players?.length) return 10;
  const atk = avgStat(players, 'atk', formationMods);
  const def = avgStat(players, 'def', formationMods);
  const spd = avgStat(players, 'spd', formationMods);
  return Math.round((atk + def + spd) / 3 * 10) / 10;
}

// ── LEVEL UP CHOICES ──
export function getLevelUpChoices(player) {
  const pos = player.pos;
  const pool = [
    { id:'atk2',   n:'Rematador',   d:'+3 ATK',              apply: p => ({ ...p, atk: p.atk + 3 }) },
    { id:'def2',   n:'Roca',        d:'+3 DEF',              apply: p => ({ ...p, def: p.def + 3 }) },
    { id:'spd2',   n:'Cohete',      d:'+3 VEL',              apply: p => ({ ...p, spd: p.spd + 3 }) },
    { id:'atkdef', n:'Completo',    d:'+2 ATK, +1 DEF',      apply: p => ({ ...p, atk: p.atk + 2, def: p.def + 1 }) },
    { id:'defspd', n:'Lateral',     d:'+2 DEF, +1 VEL',      apply: p => ({ ...p, def: p.def + 2, spd: p.spd + 1 }) },
    { id:'atkspd', n:'Desequilibrio', d:'+2 ATK, +1 VEL, -1 DEF', apply: p => ({ ...p, atk: p.atk + 2, spd: p.spd + 1, def: Math.max(1, p.def - 1) }) },
    { id:'glass',  n:'Cañón',       d:'+5 ATK, -2 DEF',      apply: p => ({ ...p, atk: p.atk + 5, def: Math.max(1, p.def - 2) }) },
    { id:'wall',   n:'Bunker',      d:'+5 DEF, -2 ATK',      apply: p => ({ ...p, def: p.def + 5, atk: Math.max(1, p.atk - 2) }) },
    { id:'allround', n:'Todo Terreno', d:'+1 ATK, +1 DEF, +1 VEL', apply: p => ({ ...p, atk: p.atk + 1, def: p.def + 1, spd: p.spd + 1 }) },
  ];
  // GK-specific
  if (pos === 'GK') return [
    { id:'sav3', n:'Muralla',    d:'+4 PAR',               apply: p => ({ ...p, sav: p.sav + 4 }) },
    { id:'sav2', n:'Reflejos',   d:'+2 PAR, +2 DEF',       apply: p => ({ ...p, sav: p.sav + 2, def: p.def + 2 }) },
    { id:'savspd',n:'Libero',    d:'+2 PAR, +2 VEL',       apply: p => ({ ...p, sav: p.sav + 2, spd: p.spd + 2 }) },
  ];
  // Shuffle and pick 3 relevant to position
  const biased = pos === 'FWD'
    ? ['atk2','atkspd','glass','atkdef','allround']
    : pos === 'DEF'
    ? ['def2','wall','defspd','atkdef','allround']
    : ['allround','atkdef','defspd','atk2','def2'];
  const chosen = [];
  for (const id of biased) { const c = pool.find(x => x.id === id); if (c && chosen.length < 3) chosen.push(c); }
  while (chosen.length < 3) { const c = pool.find(x => !chosen.find(y => y.id === x.id)); if (c) chosen.push(c); else break; }
  return chosen.slice(0, 3);
}

export function getBoardEvents(game) {
  const mn = game.matchNum || 0;
  return BOARD_EVENTS.filter(ev => {
    if (ev.minMatch && mn < ev.minMatch) return false;
    if (ev.oncePer && game.usedBoardEvents?.includes(ev.who)) return false;
    if (ev.needCopa && !game.copa) return false;
    if (ev.minCoins && game.coins < ev.minCoins) return false;
    return Math.random() < (ev.chance || 0.5);
  }).slice(0, 2);
}

export function applyBoardEffect(gameState, effects, fxKey, genPlayerFn) {
  let g = { ...gameState };
  if (effects.coins) g.coins = Math.max(0, (g.coins || 0) + effects.coins);
  if (effects.chem) g.chemistry = Math.max(0, Math.min(99, (g.chemistry || 0) + effects.chem));

  if (fxKey === 'sellWorstReserve') {
    const reserves = g.roster.filter(p => p.role === 'rs').sort((a, b) => calcOvr(a) - calcOvr(b));
    if (reserves.length > 0) { g.roster = g.roster.filter(p => p.id !== reserves[0].id); g.coins += 15; }
  }
  if (fxKey === 'addBadPlayer') {
    const p = genPlayerFn('MID', 1, 3); p.role = 'rs';
    if (g.roster.length < 12) g.roster = [...g.roster, p];
  }
  if (fxKey === 'fatigueAll5') {
    g.roster = g.roster.map(p => p.role === 'st' ? { ...p, fatigue: Math.min(100, (p.fatigue || 0) + 15) } : p);
  }
  if (fxKey === 'boostRandom') {
    const starters = g.roster.filter(p => p.role === 'st');
    if (starters.length) {
      const idx = Math.floor(Math.random() * starters.length);
      g.roster = g.roster.map(p => p.id === starters[idx].id ? { ...p, atk: p.atk + 1, def: p.def + 1, spd: p.spd + 1 } : p);
    }
  }
  if (fxKey === 'loseReserve') {
    const reserves = g.roster.filter(p => p.role === 'rs');
    if (reserves.length > 1) { const r = reserves[Math.floor(Math.random() * reserves.length)]; g.roster = g.roster.filter(p => p.id !== r.id); }
  }
  if (fxKey === 'addLocalYouth') {
    const p = genPlayerFn(pick(['DEF', 'MID']), 1, 4); p.role = 'rs';
    if (g.roster.length < 12) g.roster = [...g.roster, p];
  }
  if (fxKey === 'friendlyRisk') {
    g.roster = g.roster.map(p => {
      if (p.role !== 'st') return p;
      const newFatigue = Math.min(100, (p.fatigue || 0) + 20);
      const injured = newFatigue > 85 && Math.random() < 0.15;
      return { ...p, fatigue: newFatigue, injuredFor: injured ? (p.injuredFor || 0) + 1 : (p.injuredFor || 0) };
    });
  }
  if (fxKey === 'startCopa') {
    const league = g.league || 0;
    g.copa = initCopaState(league);
  }
  if (fxKey === 'injuryRisk') {
    const starters = g.roster.filter(p => p.role === 'st');
    if (starters.length && Math.random() < 0.3) {
      const target = starters[Math.floor(Math.random() * starters.length)];
      g.roster = g.roster.map(p => p.id === target.id ? { ...p, injuredFor: (p.injuredFor || 0) + 1 } : p);
    }
  }
  return g;
}

// Narration templates
const NARR = {
  goalHome: [
    (h, r, pl) => `¡${pick(pl)?.name || 'Un jugador'} pone el ${h.ps+1}-${h.rs} para ${h}!`,
    (h, r, pl) => `¡GOOOOL! ${pick(pl)?.name?.split(' ').pop() || 'Crack'} no perdona`,
    () => '¡El balón al fondo de la red!',
  ],
  goalAway: [
    (h, r) => `${r} empata. Nos lo complicaron.`,
    (h, r) => `Gol en contra. ${r} pone el marcador apretado.`,
    () => '💀 Gol del rival. Reacción necesaria.',
  ],
  atkBuild: [
    (h, r, pl) => `${pick(pl)?.name?.split(' ').pop() || ''} busca el arco...`,
    () => 'Ataque en marcha, buen toque de balón',
    (h, r, pl) => `Combinación entre ${pick(pl)?.name?.split(' ').pop() || 'titulares'}`,
  ],
  atkFail: [
    () => 'Disparo que se va alto',
    () => 'Bien atajado por el portero rival',
    () => 'El defensa lo despeja en el último momento',
  ],
  defGood: [
    (h, r, pl) => `${pick(pl)?.name?.split(' ').pop() || 'Defensa'} corta el ataque`,
    () => 'Bien defendido, recuperamos posesión',
    () => 'El portero lo tiene controlado',
  ],
  defBad: [
    (h, r) => `${r} presiona, nos cuesta salir`,
    () => 'La defensa cede terreno',
    () => 'Pelota peligrosa en nuestra área',
  ],
  steal: [
    (h, r, pl) => `¡Robo de balón de ${pick(pl)?.name?.split(' ').pop() || 'crack'}!`,
    () => '¡Recuperación excelente! Contraataque',
    () => 'Presión alta y recuperamos el balón',
  ],
};

export function narrate(type, home, rival, players) {
  const templates = NARR[type] || NARR.atkBuild;
  const fn = pick(templates);
  const ctx = { ps: 0, rs: 0 };
  return fn(home, rival, players || []) || '';
}

export function randomizeEvent(ev) {
  return { ...ev, o: [...ev.o].sort(() => Math.random() - 0.5) };
}
