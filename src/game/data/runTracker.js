// ═══════════════════════════════════════
// RUN TRACKER — Hades/StS-style run history
// ═══════════════════════════════════════

/**
 * Build a compact snapshot of the current run for history.
 * Called at end-of-run (death, champion, or abandon).
 */
export function buildRunSnapshot(game, globalStats, extras = {}) {
  const cs = game.careerStats || {};
  const topScorerEntry = Object.entries(cs.scorers || {})
    .sort((a, b) => b[1] - a[1])[0];
  const topAssisterEntry = Object.entries(cs.assisters || {})
    .sort((a, b) => b[1] - a[1])[0];

  return {
    runNumber: (globalStats.totalRuns || 0) + 1,
    timestamp: Date.now(),
    // Setup
    coachId: game.coach?.id || null,
    coachName: game.coach?.n || null,
    coachIcon: game.coach?.i || null,
    archetypeId: game.archetype || null,
    activeMutators: [...(game.activeMutators || [])],
    cardLoadout: [...(game.cardLoadout || [])],
    ascensionLevel: game.ascension || 0,
    // Outcome
    endType: extras.endType || 'death', // 'death' | 'champion' | 'abandoned'
    leagueReached: game.league || 0,
    leagueName: extras.leagueName || '',
    leagueIcon: extras.leagueIcon || '',
    finalPosition: extras.finalPosition ?? null,
    // Stats
    careerStats: {
      wins: cs.wins || 0, losses: cs.losses || 0, draws: cs.draws || 0,
      goalsFor: cs.goalsFor || 0, goalsAgainst: cs.goalsAgainst || 0,
      matchesPlayed: cs.matchesPlayed || 0, bestStreak: cs.bestStreak || 0,
    },
    // Highlights
    topScorer: topScorerEntry ? { name: topScorerEntry[0], goals: topScorerEntry[1] } : null,
    topAssister: topAssisterEntry ? { name: topAssisterEntry[0], assists: topAssisterEntry[1] } : null,
    immortalizedPlayer: extras.immortalizedPlayer || null,
    relicsCollected: [...(game.relics || [])],
    cursesEncountered: (game.cursesEncountered || []).map(c => typeof c === 'string' ? c : (c.curseId || c.id || c)),
    blessingsMastered: (game.blessings || []).map(b => b.id || b.n || b),
    // Timeline
    runLog: [...(game.runLog || [])],
    mapChoices: [...(game.mapChoices || [])],
    // Economy
    coinsEarned: game.coins || 0,
  };
}

/**
 * Add a run snapshot to history, capped at 50.
 */
export function addRunToHistory(globalStats, snapshot) {
  const history = [...(globalStats.runsHistory || []), snapshot];
  while (history.length > 50) history.shift();
  return { ...globalStats, runsHistory: history };
}

/**
 * Compute all-time records from run history.
 */
export function computeRecords(runsHistory) {
  if (!runsHistory?.length) return {};
  const records = {};

  // Most goals in a single run
  records.mostGoals = runsHistory.reduce((best, r) =>
    (r.careerStats.goalsFor > (best?.careerStats?.goalsFor || 0)) ? r : best, null);

  // Highest league reached
  records.highestLeague = runsHistory.reduce((best, r) =>
    (r.leagueReached > (best?.leagueReached ?? -1)) ? r : best, null);

  // Best win rate (min 5 matches)
  records.bestWinRate = runsHistory
    .filter(r => r.careerStats.matchesPlayed >= 5)
    .reduce((best, r) => {
      const rate = r.careerStats.wins / r.careerStats.matchesPlayed;
      const bestRate = best ? best.careerStats.wins / best.careerStats.matchesPlayed : 0;
      return rate > bestRate ? r : best;
    }, null);

  // Longest win streak
  records.longestStreak = runsHistory.reduce((best, r) =>
    (r.careerStats.bestStreak > (best?.careerStats?.bestStreak || 0)) ? r : best, null);

  // Most relics collected
  records.mostRelics = runsHistory.reduce((best, r) =>
    ((r.relicsCollected?.length || 0) > (best?.relicsCollected?.length || 0)) ? r : best, null);

  // Longest run (most matches)
  records.longestRun = runsHistory.reduce((best, r) =>
    (r.careerStats.matchesPlayed > (best?.careerStats?.matchesPlayed || 0)) ? r : best, null);

  // Fastest ascension (non-death with fewest matches)
  records.fastestAscension = runsHistory
    .filter(r => r.endType !== 'death' && r.endType !== 'abandoned')
    .reduce((best, r) =>
      (!best || r.careerStats.matchesPlayed < best.careerStats.matchesPlayed) ? r : best, null);

  // Fewest goals conceded
  records.bestDefense = runsHistory
    .filter(r => r.careerStats.matchesPlayed >= 5)
    .reduce((best, r) => {
      const avg = r.careerStats.goalsAgainst / r.careerStats.matchesPlayed;
      const bestAvg = best ? best.careerStats.goalsAgainst / best.careerStats.matchesPlayed : Infinity;
      return avg < bestAvg ? r : best;
    }, null);

  // Most goals scored in one run
  records.mostGoalsRun = records.mostGoals;

  return records;
}

/**
 * Compute per-archetype analytics.
 */
export function computeArchetypeAnalytics(runsHistory) {
  const map = {};
  for (const run of (runsHistory || [])) {
    const id = run.archetypeId || 'none';
    if (!map[id]) map[id] = { runs: 0, wins: 0, matches: 0, totalLeague: 0, deaths: 0, champions: 0 };
    map[id].runs++;
    map[id].wins += run.careerStats.wins || 0;
    map[id].matches += run.careerStats.matchesPlayed || 0;
    map[id].totalLeague += run.leagueReached || 0;
    if (run.endType === 'death') map[id].deaths++;
    if (run.endType === 'champion') map[id].champions++;
  }
  return map;
}
