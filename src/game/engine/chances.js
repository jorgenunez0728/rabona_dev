import { rnd, pick, avgStat, effectiveStats, teamGKRating, weightedPick, clamp } from './utils.js';

// Chance types with base goal probabilities
export const CHANCE_TYPES = {
  elaborada:    { id: 'elaborada',    name: 'Jugada elaborada', baseChance: 0.10, icon: '⚽' },
  contraataque: { id: 'contraataque', name: 'Contraataque',     baseChance: 0.17, icon: '⚡' },
  pelotaParada: { id: 'pelotaParada', name: 'Pelota parada',    baseChance: 0.12, icon: '🎯' },
  tiroLejano:   { id: 'tiroLejano',   name: 'Disparo lejano',   baseChance: 0.04, icon: '💥' },
  errorRival:   { id: 'errorRival',    name: 'Error del rival',  baseChance: 0.22, icon: '💀' },
};

// Determine what type of chance is generated based on context
export function generateChanceType(context) {
  const { zone, isCounterAttack, ticksInZone, momentumValue, isTacticalEvent } = context;

  if (isTacticalEvent) return CHANCE_TYPES.pelotaParada;
  if (isCounterAttack) return CHANCE_TYPES.contraataque;

  // Prolonged possession in attack → elaborated play
  if (zone === 'attack' && ticksInZone >= 2) {
    return Math.random() < 0.7 ? CHANCE_TYPES.elaborada : CHANCE_TYPES.tiroLejano;
  }

  // High momentum → chance of rival error
  if (momentumValue > 50 && Math.random() < 0.2) {
    return CHANCE_TYPES.errorRival;
  }

  // From midfield → long shot
  if (zone === 'midfield') return CHANCE_TYPES.tiroLejano;

  // Default in attack zone
  const roll = Math.random();
  if (roll < 0.5) return CHANCE_TYPES.elaborada;
  if (roll < 0.75) return CHANCE_TYPES.tiroLejano;
  return CHANCE_TYPES.pelotaParada;
}

// Should a chance be generated this tick?
export function shouldGenerateChance(possResult, tacticsConfig = {}) {
  const { winner, zone } = possResult;
  const { intensityMod = 0 } = tacticsConfig;

  // Only generate chances when a team is in the attacking zone
  const isAttacking = (winner === 'home' && zone === 'attack') ||
                      (winner === 'away' && zone === 'defense');

  if (!isAttacking) {
    // Small chance of long shot from midfield
    if (zone === 'midfield') return Math.random() < 0.06 + intensityMod;
    return false;
  }

  // Base chance generation rate: ~35% per tick in attack zone
  return Math.random() < 0.35 + intensityMod;
}

// Resolve whether a chance results in a goal
export function resolveChance(chanceType, attackTeam, defendTeam, modifiers = {}) {
  const {
    formMods = null,
    rivalFormMods = null,
    momentumMod = 0,
    moraleMod = 0,
    traitMods = {},   // { clutchActive, goleadorActive }
    relicMods = {},   // { blitzBonus, diamanteBonus }
    difficultyMod = 0,
  } = modifiers;

  let goalChance = chanceType.baseChance;

  // Team attack vs rival defense
  const atkAvg = avgStat(attackTeam.players, 'atk', formMods);
  const defAvg = avgStat(defendTeam.players, 'def', rivalFormMods);
  const statDiff = (atkAvg - defAvg * 0.6) * 0.012;
  goalChance += statDiff;

  // GK save reduction
  const gkRating = teamGKRating(defendTeam.players);
  const gkMod = gkRating > 8 ? -0.04 : gkRating > 5 ? -0.02 : gkRating < 3 ? 0.03 : 0;
  goalChance += gkMod;

  // Speed bonus for counter-attacks
  if (chanceType.id === 'contraataque') {
    const spdDiff = avgStat(attackTeam.players, 'spd', formMods) - avgStat(defendTeam.players, 'spd', rivalFormMods);
    goalChance += spdDiff * 0.008;
  }

  // Apply modifiers
  goalChance += momentumMod;
  goalChance += moraleMod * 0.02;
  goalChance -= difficultyMod;

  // Trait bonuses
  if (traitMods.clutchActive) goalChance += 0.05;
  if (traitMods.goleadorActive) goalChance += 0.03;

  // Relic bonuses
  goalChance += (relicMods.blitzBonus || 0);
  goalChance += (relicMods.diamanteBonus || 0);

  // Clamp to reasonable range
  goalChance = clamp(goalChance, 0.02, 0.25);

  const isGoal = Math.random() < goalChance;
  const isOnTarget = isGoal || Math.random() < 0.4; // 40% of misses are on target (saved)

  return { isGoal, isOnTarget, goalChance, chanceType };
}

// Pick the scorer based on player stats and chance type
export function pickScorer(players, chanceType, formMods = null) {
  const outfield = players.filter(p => p.pos !== 'GK');
  if (outfield.length === 0) return players[0];

  // Position weights based on chance type
  const posWeights = {
    elaborada:    { FWD: 3.0, MID: 1.5, DEF: 0.3 },
    contraataque: { FWD: 3.5, MID: 1.0, DEF: 0.1 },
    pelotaParada: { FWD: 2.0, MID: 1.0, DEF: 1.5 },
    tiroLejano:   { FWD: 1.5, MID: 2.5, DEF: 0.5 },
    errorRival:   { FWD: 2.5, MID: 2.0, DEF: 0.5 },
  };

  const weights = posWeights[chanceType.id] || posWeights.elaborada;

  return weightedPick(outfield, p => {
    const stats = effectiveStats(p, formMods);
    const posWeight = weights[p.pos] || 1;
    return stats.atk * posWeight;
  });
}

// Pick the assister (different from scorer)
export function pickAssister(players, scorer, chanceType, formMods = null) {
  const candidates = players.filter(p => p.id !== scorer.id && p.pos !== 'GK');
  if (candidates.length === 0) return null;

  // Counter-attacks: speed matters for assists
  const statKey = chanceType.id === 'contraataque' ? 'spd' : 'atk';

  return weightedPick(candidates, p => {
    const stats = effectiveStats(p, formMods);
    const midBonus = p.pos === 'MID' ? 1.5 : 1;
    return stats[statKey] * midBonus;
  });
}
