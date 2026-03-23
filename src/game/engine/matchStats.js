// Match statistics tracking

export function createMatchStats() {
  return {
    possession: { home: 0, away: 0 },
    shots: { home: 0, away: 0 },
    shotsOnTarget: { home: 0, away: 0 },
    chances: { home: 0, away: 0 },
    corners: { home: 0, away: 0 },
    fouls: { home: 0, away: 0 },
    cards: { home: [], away: [] },
    goals: [],  // { minute, team, scorer, assister, chanceType }
    injuries: [],  // { minute, player, team }
    momentum: [],  // { minute, value } — sampled every few ticks
    zoneControl: { defense: 0, midfield: 0, attack: 0, total: 0 },
  };
}

export function recordShot(stats, team, onTarget) {
  stats.shots[team]++;
  if (onTarget) stats.shotsOnTarget[team]++;
}

export function recordChance(stats, team) {
  stats.chances[team]++;
}

export function recordGoal(stats, { minute, team, scorer, assister, chanceType }) {
  stats.goals.push({ minute, team, scorer: scorer?.name, assister: assister?.name, type: chanceType?.id || 'unknown' });
}

export function recordCard(stats, team, minute, player, cardType = 'yellow') {
  stats.cards[team].push({ minute, player: player?.name, type: cardType });
}

export function recordCorner(stats, team) {
  stats.corners[team]++;
}

export function recordFoul(stats, team) {
  stats.fouls[team]++;
}

export function recordInjury(stats, minute, player, team) {
  stats.injuries.push({ minute, player: player?.name, team });
}

export function recordMomentum(stats, minute, value) {
  stats.momentum.push({ minute, value });
}

export function recordZone(stats, zone) {
  stats.zoneControl[zone]++;
  stats.zoneControl.total++;
}

export function recordPossession(stats, team) {
  stats.possession[team]++;
}

// Calculate Man of the Match from match stats
export function getManOfTheMatch(stats, starters) {
  if (!starters || starters.length === 0) return null;

  const goalsByPlayer = {};
  const assistsByPlayer = {};
  stats.goals.forEach(g => {
    if (g.team === 'home' && g.scorer) goalsByPlayer[g.scorer] = (goalsByPlayer[g.scorer] || 0) + 1;
    if (g.team === 'home' && g.assister) assistsByPlayer[g.assister] = (assistsByPlayer[g.assister] || 0) + 1;
  });

  const cleanSheet = stats.goals.filter(g => g.team === 'away').length === 0;

  let best = null;
  let bestScore = -1;

  for (const p of starters) {
    let score = (goalsByPlayer[p.name] || 0) * 3
      + (assistsByPlayer[p.name] || 0) * 2
      + (p.pos === 'DEF' && cleanSheet ? 2 : 0)
      + (p.pos === 'GK' && cleanSheet ? 3 : 0);
    // Tiebreak: higher OVR
    score += (p.atk + p.def + p.spd) * 0.01;
    if (score > bestScore) { bestScore = score; best = p; }
  }

  return best;
}

// Get final stats summary (percentages, averages)
export function getFinalStats(stats) {
  const totalPoss = stats.possession.home + stats.possession.away || 1;
  const totalZone = stats.zoneControl.total || 1;

  return {
    ...stats,
    possessionPct: {
      home: Math.round(stats.possession.home / totalPoss * 100),
      away: Math.round(stats.possession.away / totalPoss * 100),
    },
    zoneControlPct: {
      defense: Math.round(stats.zoneControl.defense / totalZone * 100),
      midfield: Math.round(stats.zoneControl.midfield / totalZone * 100),
      attack: Math.round(stats.zoneControl.attack / totalZone * 100),
    },
  };
}
