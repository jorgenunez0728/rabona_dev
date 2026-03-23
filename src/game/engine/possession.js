import { rnd, avgStat, effectiveStats } from './utils.js';

// Zones: defense → midfield → attack
// Ball transitions between adjacent zones (except counter-attacks skip midfield)
export const ZONES = ['defense', 'midfield', 'attack'];

export function createPossessionState() {
  return {
    zone: 'midfield',
    team: 'home',  // 'home' or 'away'
    ticksInZone: 0,
    totalHome: 0,
    totalAway: 0,
    totalTicks: 0,
  };
}

// Get players by role for zone calculation
function getZonePlayers(players, zone) {
  switch (zone) {
    case 'defense': return players.filter(p => p.pos === 'DEF' || p.pos === 'GK');
    case 'midfield': return players.filter(p => p.pos === 'MID' || p.pos === 'DEF');
    case 'attack': return players.filter(p => p.pos === 'FWD' || p.pos === 'MID');
    default: return players;
  }
}

// Stat weights per zone
function getZoneStat(zone) {
  switch (zone) {
    case 'defense': return { primary: 'def', secondary: 'spd', weights: [0.7, 0.3] };
    case 'midfield': return { primary: 'spd', secondary: 'atk', weights: [0.5, 0.5] };
    case 'attack': return { primary: 'atk', secondary: 'spd', weights: [0.6, 0.4] };
    default: return { primary: 'spd', secondary: 'atk', weights: [0.5, 0.5] };
  }
}

// Calculate zone strength for a team
function zoneStrength(players, zone, formMods = null) {
  const zonePlayers = getZonePlayers(players, zone);
  const allPlayers = players;
  const { primary, secondary, weights } = getZoneStat(zone);

  // Use zone-specific players if available, fallback to all
  const effective = zonePlayers.length > 0 ? zonePlayers : allPlayers;
  const pStat = avgStat(effective, primary, formMods);
  const sStat = avgStat(effective, secondary, formMods);

  return pStat * weights[0] + sStat * weights[1];
}

// Resolve a possession tick
// Returns: { winner: 'home'|'away', zone, transition, isCounterAttack }
export function resolvePossession(state, home, away, modifiers = {}) {
  const {
    homeFormMods = null,
    awayFormMods = null,
    momentumMod = 0,    // from momentum system
    chemistryMod = 0,   // from chemistry
    tacticsMod = {},     // from tactics { homePossBonus, awayPossBonus }
    stealBonus = 0,      // from coach
    scoutBonus = 0,      // from relic
  } = modifiers;

  const zone = state.zone;

  // Opposing zone for away team (their attack = your defense)
  const awayZone = zone === 'attack' ? 'defense' : zone === 'defense' ? 'attack' : 'midfield';

  const homeStr = zoneStrength(home.players, zone, homeFormMods);
  const awayStr = zoneStrength(away.players, awayZone, awayFormMods);

  // Base probability for home team to win possession
  let homeProb = homeStr / (homeStr + awayStr + 0.01);

  // Apply modifiers
  homeProb += momentumMod;
  homeProb += chemistryMod;
  homeProb += stealBonus;
  homeProb += scoutBonus;
  homeProb += (tacticsMod.homePossBonus || 0);
  homeProb -= (tacticsMod.awayPossBonus || 0);

  // Clamp
  homeProb = Math.max(0.15, Math.min(0.85, homeProb));

  const winner = Math.random() < homeProb ? 'home' : 'away';

  // Determine zone transition
  let nextZone = zone;
  let isCounterAttack = false;

  if (winner === 'home') {
    // Home has ball — try to advance
    if (zone === 'defense') {
      // Counter-attack chance: skip midfield (~12%)
      if (Math.random() < 0.12 + (tacticsMod.counterBonus || 0)) {
        nextZone = 'attack';
        isCounterAttack = true;
      } else {
        nextZone = 'midfield';
      }
    } else if (zone === 'midfield') {
      nextZone = Math.random() < 0.55 ? 'attack' : 'midfield';
    } else {
      nextZone = 'attack'; // Stay in attack
    }
  } else {
    // Away has ball — they advance (from home's perspective, zones flip)
    if (zone === 'attack') {
      nextZone = 'midfield';
    } else if (zone === 'midfield') {
      // Rival counter-attack
      if (Math.random() < 0.10 + (tacticsMod.rivalCounterBonus || 0)) {
        nextZone = 'defense';
        isCounterAttack = true;
      } else {
        nextZone = Math.random() < 0.5 ? 'defense' : 'midfield';
      }
    } else {
      nextZone = 'defense'; // Stay in defense
    }
  }

  // Update stats
  const newState = {
    ...state,
    zone: nextZone,
    team: winner,
    ticksInZone: nextZone === zone ? state.ticksInZone + 1 : 0,
    totalHome: state.totalHome + (winner === 'home' ? 1 : 0),
    totalAway: state.totalAway + (winner === 'away' ? 1 : 0),
    totalTicks: state.totalTicks + 1,
  };

  return {
    state: newState,
    winner,
    zone: nextZone,
    previousZone: zone,
    isCounterAttack,
  };
}

export function getPossessionPct(state) {
  if (state.totalTicks === 0) return { home: 50, away: 50 };
  const homePct = Math.round(state.totalHome / state.totalTicks * 100);
  return { home: homePct, away: 100 - homePct };
}
