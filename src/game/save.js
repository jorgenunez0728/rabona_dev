// ═══════════════════════════════════════
// SAVE / LOAD SYSTEM — localStorage
// ═══════════════════════════════════════

const SAVE_KEY = 'rabona-save';
const STATS_KEY = 'rabona-stats';
const CURRENT_VERSION = '3.1';

// Migration functions: each key is the version to migrate FROM
const MIGRATIONS = {
  '3.0': (data) => {
    // Ensure new fields exist for saves created before 3.1
    const g = data.game;
    g.relics = g.relics || [];
    g.formation = g.formation || 'clasica';
    g.trainedIds = g.trainedIds || [];
    g.rivalMemory = g.rivalMemory || {};
    g.streak = g.streak ?? 0;
    g.chemistry = g.chemistry ?? 0;
    g.matchesTogether = g.matchesTogether ?? 0;
    g.careerStats = g.careerStats || { wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0, matchesPlayed: 0, bestStreak: 0, scorers: {} };
    data.version = '3.1';
    return data;
  },
  // Future migrations go here:
  // '3.1': (data) => { ... data.version = '3.2'; return data; },
};

function migrateSave(data) {
  let current = data;
  let safety = 0; // prevent infinite loops
  while (current.version !== CURRENT_VERSION && safety < 20) {
    const migrateFn = MIGRATIONS[current.version];
    if (!migrateFn) {
      console.warn(`No migration path from save version ${current.version} to ${CURRENT_VERSION}`);
      return null; // incompatible save
    }
    current = migrateFn(current);
    safety++;
  }
  return current;
}

export function saveGlobalStats(gs) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(gs));
  } catch(e) { console.warn('Stats save failed:', e); }
}

export function loadGlobalStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return null;
}

export function saveGame(gameState, currentScreen) {
  try {
    const data = { game: gameState, screen: currentScreen, version: CURRENT_VERSION, timestamp: Date.now() };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch(e) { console.warn('Save failed:', e); }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      let data = JSON.parse(raw);
      if (!data.game || !data.game.coach) return null;

      // If save is from an older version, migrate it
      if (data.version !== CURRENT_VERSION) {
        data = migrateSave(data);
        if (!data) return null; // migration failed
        // Re-save with updated version
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      }

      return data;
    }
  } catch(e) { console.warn('Load failed:', e); }
  return null;
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function hasSaveData() {
  return !!localStorage.getItem(SAVE_KEY);
}
