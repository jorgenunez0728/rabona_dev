import {
  CAREER_CAST, CAREER_CAST_UNLOCKABLE, ALL_CAREER_CARDS, CAREER_CARDS_MIGUEL,
  MATCH_CARDS, CAREER_TRAITS, SIGNATURE_MOMENTS, BAR_GAME_OVER,
} from '@/game/data/career.js';

// ── Initialize career with all new systems ──

export function initCareer(name, pos, legacyUnlocks = [], unlockedNpcs = []) {
  // Build active NPC list: base cast + unlocked NPCs
  const activeCast = CAREER_CAST.map(npc => ({
    ...npc, rel: npc.startRel, arc: 'neutral', arcPhase: 0, memory: [],
  }));
  for (const npc of CAREER_CAST_UNLOCKABLE) {
    if (unlockedNpcs.includes(npc.id)) {
      activeCast.push({ ...npc, rel: npc.startRel, arc: 'neutral', arcPhase: 0, memory: [] });
    }
  }

  // Base bars (balanced for Reigns-style max/min game-over)
  const bars = { rend: 45, fis: 50, rel: 50, fam: 30, men: 50 };

  // Apply legacy bonuses
  if (legacyUnlocks.includes('cd1')) { // Herencia: +5 all bars
    for (const k of Object.keys(bars)) bars[k] += 5;
  }

  const startTeam = legacyUnlocks.includes('cd3') ? 1 : 0; // Legado Vivo: start tier 1

  // Starting trait from legacy
  const startTraits = [];
  if (legacyUnlocks.includes('cd2')) { // Linaje: random trait at start
    const available = CAREER_TRAITS.filter(t => !startTraits.find(s => s === t.id));
    if (available.length) startTraits.push(available[Math.floor(Math.random() * available.length)].id);
  }

  return {
    name, pos, age: 16, season: 1, bars, team: startTeam,
    matchNum: 0, matchesThisSeason: 0, totalMatches: 0,
    goals: 0, ratings: [], cardQueue: [], seasonGoals: 0,
    cast: activeCast,
    history: [], retired: false, retireReason: '',
    // New systems
    npcRelations: Object.fromEntries(activeCast.map(n => [n.id, n.rel])),
    traits: startTraits,        // active trait ids (max 4)
    traitProgress: {},          // { traitId: count } for tracking trigger conditions
    momentsTriggered: [],       // ids of signature moments already seen
    decisionTags: {},           // { leadership: 3, analysis: 5 } for trait triggers
    legacyUnlocks,              // passed through for in-career checks
    usedCardIds: [],            // prevent repeat cards within same season
    phantomShieldUsed: false,   // fantasma_trait: one-time max-bar save
  };
}

// ── Card condition checker ──

function meetsCondition(card, c) {
  const cond = card.condition || {};
  if (card.minAge && c.age < card.minAge) return false;
  if (cond.minAge && c.age < cond.minAge) return false;
  if (cond.maxAge && c.age > cond.maxAge) return false;
  if (cond.minTeam != null && c.team < cond.minTeam) return false;
  if (cond.maxTeam != null && c.team > cond.maxTeam) return false;
  if (cond.minSeason && c.season < cond.minSeason) return false;
  if (cond.maxSeason && c.season > cond.maxSeason) return false;
  if (cond.trait && !(c.traits || []).includes(cond.trait)) return false;
  if (cond.noTrait && (c.traits || []).includes(cond.noTrait)) return false;

  // NPC-gated cards
  if (cond.npcId) {
    const npcData = (c.cast || []).find(n => n.id === cond.npcId);
    if (!npcData) return false; // NPC not in active cast
    if (cond.npcMinRel != null && (c.npcRelations?.[cond.npcId] ?? npcData.rel) < cond.npcMinRel) return false;
    if (cond.npcMaxRel != null && (c.npcRelations?.[cond.npcId] ?? npcData.rel) > cond.npcMaxRel) return false;
    if (cond.npcArc && npcData.arc !== cond.npcArc) return false;
  }

  // Bar conditions
  if (cond.minBar) { for (const [k, v] of Object.entries(cond.minBar)) { if ((c.bars[k] || 0) < v) return false; } }
  if (cond.maxBar) { for (const [k, v] of Object.entries(cond.maxBar)) { if ((c.bars[k] || 0) > v) return false; } }

  return true;
}

export function getCareerCards(c) {
  const legacyUnlocks = c.legacyUnlocks || [];
  let numCards = Math.min(6, 2 + Math.floor((c.bars.fam || 0) / 25));
  if (legacyUnlocks.includes('cc2')) numCards += 2; // Influencia: +2 cards
  if ((c.traits || []).includes('cerebral')) numCards += 1;

  const usedIds = new Set(c.usedCardIds || []);
  const eligible = ALL_CAREER_CARDS.filter(card => {
    if (card.id && usedIds.has(card.id)) return false;
    return meetsCondition(card, c);
  });

  const pool = [];

  // Guarantee at least 1 NPC card per season
  const npcCards = eligible.filter(card => card.cast);
  if (npcCards.length > 0) pool.push(npcCards[Math.floor(Math.random() * npcCards.length)]);

  // Fill remaining with shuffled non-NPC cards
  const shuffled = [...eligible.filter(card => !card.cast)].sort(() => Math.random() - 0.5);
  for (let i = 0; pool.length < numCards && i < shuffled.length; i++) pool.push(shuffled[i]);

  // Don Miguel cards: every 3 seasons (or every 2 with legacy cs1)
  const miguelFreq = legacyUnlocks.includes('cs1') ? 2 : 3;
  if (c.season % miguelFreq === 0) {
    const dm = CAREER_CARDS_MIGUEL.filter(card => meetsCondition(card, c));
    if (dm.length) pool.push(dm[Math.floor(Math.random() * dm.length)]);
  }

  // Check for pending signature moment
  const moment = getNextSignatureMoment(c);
  if (moment) {
    pool.unshift({ ...moment, _isMoment: true, who: '✨ Momento Estelar', id: moment.id });
  }

  return pool.sort(() => Math.random() - 0.5);
}

// ── Signature Moments ──

function meetsMomentTrigger(moment, c) {
  const t = moment.trigger;
  if (t.maxSeason && c.season > t.maxSeason) return false;
  if (t.minSeason && c.season < t.minSeason) return false;
  if (t.minAge && c.age < t.minAge) return false;
  if (t.minGoals && c.goals < t.minGoals) return false;
  if (t.minTeam != null && c.team < t.minTeam) return false;
  if (t.minBar) { for (const [k, v] of Object.entries(t.minBar)) { if ((c.bars[k] || 0) < v) return false; } }
  if (t.maxBar) { for (const [k, v] of Object.entries(t.maxBar)) { if ((c.bars[k] || 0) > v) return false; } }
  if (t.npcArc) {
    const npc = (c.cast || []).find(n => n.id === t.npcArc.id);
    if (!npc || npc.arc !== t.npcArc.arc) return false;
  }
  return true;
}

export function getNextSignatureMoment(c) {
  const triggered = new Set(c.momentsTriggered || []);
  for (const moment of SIGNATURE_MOMENTS) {
    if (triggered.has(moment.id)) continue;
    if (meetsMomentTrigger(moment, c)) return moment;
  }
  return null;
}

// ── NPC Relationship System ──

export function updateNpcRelation(c, npcId, delta) {
  if (!c.npcRelations) return c;
  const npc = (c.cast || []).find(n => n.id === npcId);
  if (!npc) return c;

  const legacyUnlocks = c.legacyUnlocks || [];
  const arcSpeedBonus = legacyUnlocks.includes('cc3') ? 1.5 : 1; // Ídolo: 50% faster arcs
  const adjustedDelta = Math.round(delta * arcSpeedBonus);

  const newRel = Math.max(0, Math.min(100, (c.npcRelations[npcId] || 50) + adjustedDelta));
  const updatedRelations = { ...c.npcRelations, [npcId]: newRel };

  // Check arc transitions
  const updatedCast = (c.cast || []).map(n => {
    if (n.id !== npcId) return n;
    const updated = { ...n, rel: newRel };
    if (newRel >= n.arcThresholds.ally && n.arc !== 'ally' && n.arc !== 'betrayer') {
      updated.arc = 'ally';
      updated.arcPhase = Math.min((n.arcPhase || 0) + 1, 3);
    } else if (newRel <= n.arcThresholds.rival && n.arc !== 'rival' && n.arc !== 'betrayer') {
      updated.arc = 'rival';
      updated.arcPhase = Math.min((n.arcPhase || 0) + 1, 3);
    }
    // Betrayer: deep rival + specific conditions (arcPhase 3 + rel very low)
    if (updated.arc === 'rival' && updated.arcPhase >= 3 && newRel <= 10) {
      updated.arc = 'betrayer';
    }
    return updated;
  });

  return { ...c, npcRelations: updatedRelations, cast: updatedCast };
}

// ── Trait System ──

export function checkTraitUnlocks(c) {
  const current = c.traits || [];
  if (current.length >= 4) return c; // max 4 traits

  const tags = c.decisionTags || {};
  let newTraits = [...current];

  for (const trait of CAREER_TRAITS) {
    if (newTraits.includes(trait.id)) continue;
    if (newTraits.length >= 4) break;
    const t = trait.trigger;
    let met = true;

    // Bar conditions
    if (t.minBar) { for (const [k, v] of Object.entries(t.minBar)) { if ((c.bars[k] || 0) < v) { met = false; break; } } }
    if (met && t.maxBar) { for (const [k, v] of Object.entries(t.maxBar)) { if ((c.bars[k] || 0) > v) { met = false; break; } } }
    if (met && t.minTeam != null && c.team < t.minTeam) met = false;
    if (met && t.leadershipDecisions && (tags.leadership || 0) < t.leadershipDecisions) met = false;
    if (met && t.analysisDecisions && (tags.analysis || 0) < t.analysisDecisions) met = false;
    if (met && t.moment && !(c.momentsTriggered || []).includes(t.moment)) met = false;
    if (met && t.npcArc) {
      const npc = (c.cast || []).find(n => n.id === t.npcArc.id);
      if (!npc || npc.arc !== t.npcArc.arc) met = false;
    }

    if (met) newTraits.push(trait.id);
  }

  if (newTraits.length === current.length) return c;
  return { ...c, traits: newTraits };
}

// ── Apply card choice with all new systems ──

export function applyCardChoice(c, card, option) {
  let next = { ...c };
  const choice = card[option];
  if (!choice) return next;

  // Apply bar effects (with trait modifiers)
  const effects = { ...(choice.e || {}) };

  // Trait: rebelde — option B gets +2 positive effects
  if (option === 'b' && (next.traits || []).includes('rebelde')) {
    for (const k of Object.keys(effects)) {
      if (effects[k] > 0) effects[k] += 2;
    }
  }

  // Legacy: Hambre — +10% positive effects
  if ((next.legacyUnlocks || []).includes('ca1')) {
    for (const k of Object.keys(effects)) {
      if (effects[k] > 0) effects[k] = Math.round(effects[k] * 1.1);
    }
  }

  // Legacy: Serenidad — fam doesn't damage men
  if ((next.legacyUnlocks || []).includes('cs2')) {
    // handled in applyAging instead
  }

  next.bars = applyBarEffects(next, effects);

  // NPC relationship effect
  if (card.npcRel) {
    const delta = card.npcRel[option] ?? 0;
    if (delta !== 0) next = updateNpcRelation(next, card.npcRel.id, delta);
  }

  // Trait progress
  if (card.traitProgress) {
    const tp = { ...(next.traitProgress || {}) };
    tp[card.traitProgress.id] = (tp[card.traitProgress.id] || 0) + (card.traitProgress.delta || 1);
    next.traitProgress = tp;
  }

  // Track decision tags (for trait triggers)
  if (card.cast) {
    const tags = { ...(next.decisionTags || {}) };
    // NPC-related decisions count as 'leadership' or 'analysis' based on choice
    if (option === 'a' && ['familia', 'miguel'].includes(card.cast)) tags.leadership = (tags.leadership || 0) + 1;
    if (option === 'b' && ['doctora', 'buitre'].includes(card.cast)) tags.analysis = (tags.analysis || 0) + 1;
    next.decisionTags = tags;
  }

  // Track used card ids to avoid repeats within season
  if (card.id) {
    next.usedCardIds = [...(next.usedCardIds || []), card.id];
  }

  // Signature moment: mark as triggered + apply trait
  if (card._isMoment) {
    next.momentsTriggered = [...(next.momentsTriggered || []), card.id];
    if (card.addsTrait && !(next.traits || []).includes(card.addsTrait) && (next.traits || []).length < 4) {
      next.traits = [...(next.traits || []), card.addsTrait];
    }
  }

  // Check trait unlocks after every decision
  next = checkTraitUnlocks(next);

  return next;
}

export function getMatchCards(pos) {
  const cards = MATCH_CARDS[pos] || MATCH_CARDS.MID;
  return [...cards].sort(() => Math.random() - 0.5).slice(0, 4 + Math.floor(Math.random() * 2));
}

export function applyBarEffects(c, effects) {
  const b = { ...c.bars };
  if (effects.rend) b.rend = Math.max(0, Math.min(100, b.rend + effects.rend));
  if (effects.fis) b.fis = Math.max(0, Math.min(100, b.fis + effects.fis));
  if (effects.rel) b.rel = Math.max(0, Math.min(100, b.rel + effects.rel));
  if (effects.fam) b.fam = Math.max(0, Math.min(100, b.fam + effects.fam));
  if (effects.men) b.men = Math.max(0, Math.min(100, b.men + effects.men));
  return b;
}

// ── Game Over — Reigns-style (both 0 and 100) ──

export function checkCareerEnd(c) {
  const legacyUnlocks = c.legacyUnlocks || [];
  const minFloor = legacyUnlocks.includes('cf3') ? 10 : 0; // Inmortal: bars never below 10
  const retireAge = legacyUnlocks.includes('cf2') ? 38 : 36; // Longevidad

  // Game over by minimum (0 or floor)
  for (const bar of ['rend', 'fis', 'rel', 'men', 'fam']) {
    if (c.bars[bar] <= minFloor) return BAR_GAME_OVER[bar].min;
  }

  // Game over by maximum (100) — Reigns style
  for (const bar of ['rend', 'fis', 'rel', 'fam', 'men']) {
    if (c.bars[bar] >= 100) {
      // fantasma_trait: one-time shield against max-bar game over
      if ((c.traits || []).includes('fantasma_trait') && !c.phantomShieldUsed) {
        c.phantomShieldUsed = true;
        c.bars[bar] = 90; // pull back from the edge
        return null;
      }
      return BAR_GAME_OVER[bar].max;
    }
  }

  // Age retirement
  if (c.age >= retireAge) return `A los ${retireAge}, incluso las leyendas cuelgan los botines.`;
  return null;
}

// ── Aging with trait and legacy modifiers ──

export function applyAging(c) {
  const b = { ...c.bars };
  const legacyUnlocks = c.legacyUnlocks || [];
  const traits = c.traits || [];

  // Genética legacy: aging starts 2 years later
  const agingOffset = legacyUnlocks.includes('cf1') ? 2 : 0;
  // Resiliente trait: 50% less fis decay
  const fisDecayMult = traits.includes('resiliente') ? 0.5 : 1;

  if (c.age <= 22 + agingOffset) {
    b.fis = Math.min(100, b.fis + 3);
  } else if (c.age >= 29 + agingOffset && c.age <= 34 + agingOffset) {
    b.fis = Math.max(0, b.fis - Math.round(5 * fisDecayMult));
    b.rend = Math.max(0, b.rend - 3);
    b.men = Math.min(100, b.men + 2);
  } else if (c.age >= 35 + agingOffset) {
    b.fis = Math.max(0, b.fis - Math.round(8 * fisDecayMult));
    b.rend = Math.max(0, b.rend - 5);
  }

  // Fame pressure on mental (unless Serenidad legacy)
  if (b.fam > 70 && !legacyUnlocks.includes('cs2')) {
    b.men = Math.max(0, b.men - 2);
  }
  if (b.men < 30) b.rend = Math.max(0, b.rend - 2);

  // Mediático trait: +2 fam per season
  if (traits.includes('mediático')) b.fam = Math.min(100, b.fam + 2);

  // Zen trait: bars can't go below 15 (except from aging itself — applied as floor)
  const zenFloor = traits.includes('zen') ? 15 : 0;
  for (const k of Object.keys(b)) {
    if (b[k] < zenFloor) b[k] = zenFloor;
  }

  // Inmortal legacy: bars never below 10
  if (legacyUnlocks.includes('cf3')) {
    for (const k of Object.keys(b)) {
      if (b[k] < 10) b[k] = 10;
    }
  }

  return b;
}

// ── Legacy Points calculation ──

export function calcCareerLegacyPoints(c) {
  let points = 1; // base: +1 per completed career

  // +1 per NPC arc completed (not neutral)
  const completedArcs = (c.cast || []).filter(n => n.arc === 'ally' || n.arc === 'betrayer').length;
  points += completedArcs;

  // +1 per signature moment triggered
  points += (c.momentsTriggered || []).length > 0 ? Math.min(3, Math.floor((c.momentsTriggered || []).length / 3)) : 0;

  // +2 if reached top-tier team (index 5+)
  if (c.team >= 5) points += 2;

  // +1 per trait earned
  points += Math.min(2, (c.traits || []).length);

  return points;
}

// ── Season reset helper ──

export function resetSeasonCards(c) {
  return { ...c, usedCardIds: [], matchesThisSeason: 0, matchNum: 0, seasonGoals: 0, ratings: [] };
}