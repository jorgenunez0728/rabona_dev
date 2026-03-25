// ═══════════════════════════════════════
// SAVE / LOAD SYSTEM — localStorage
// ═══════════════════════════════════════

const SAVE_KEY = 'rabona-save';
const STATS_KEY = 'rabona-stats';
export const CURRENT_VERSION = '3.4';

// ── Simple checksum for integrity ──
// Not cryptographic — just detects corruption/tampering
function checksum(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

// ── Migration functions: each key is the version to migrate FROM ──
const MIGRATIONS = {
  '3.0': (data) => {
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
  '3.1': (data) => {
    const g = data.game;
    // Metaprogression v2 fields
    g.archetype = g.archetype || null;
    g.cardLoadout = g.cardLoadout || [];
    g.cardCooldowns = g.cardCooldowns || {};
    g.activeMutators = g.activeMutators || [];
    g.blessings = g.blessings || [];
    g.matchBet = g.matchBet || 0;
    // Add masteryProgress to existing curses
    if (Array.isArray(g.curses)) {
      g.curses = g.curses.map(c => ({ ...c, masteryProgress: c.masteryProgress || 0 }));
    }
    data.version = '3.2';
    return data;
  },
  '3.2': (data) => {
    const g = data.game;
    g.betweenMatchVisits = g.betweenMatchVisits || { roster: false, training: false, market: false };
    g.topAssisters = g.topAssisters || [];
    g.topCleanSheets = g.topCleanSheets || [];
    if (g.careerStats) {
      g.careerStats.assisters = g.careerStats.assisters || {};
      g.careerStats.cleanSheets = g.careerStats.cleanSheets || {};
    }
    data.version = '3.3';
    return data;
  },
  '3.3': (data) => {
    const g = data.game;
    g.runLog = g.runLog || [];
    g.cursesEncountered = g.cursesEncountered || [];
    g.mapChoices = g.mapChoices || [];
    data.version = '3.4';
    return data;
  },
};

export function migrateSave(data) {
  let current = data;
  let safety = 0;
  while (current.version !== CURRENT_VERSION && safety < 20) {
    const migrateFn = MIGRATIONS[current.version];
    if (!migrateFn) {
      console.warn(`No migration path from save version ${current.version} to ${CURRENT_VERSION}`);
      return null;
    }
    current = migrateFn(current);
    safety++;
  }
  return current;
}

// ── Required fields validation ──
const REQUIRED_GAME_FIELDS = ['coach', 'roster', 'league', 'matchNum', 'formation'];

function validateGameState(game) {
  if (!game || typeof game !== 'object') return false;
  if (!game.coach) return false;
  if (!Array.isArray(game.roster)) return false;
  for (const field of REQUIRED_GAME_FIELDS) {
    if (!(field in game)) return false;
  }
  return true;
}

// ── Public API ──

export function saveGlobalStats(gs) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(gs));
  } catch(e) { console.warn('Stats save failed:', e); }
}

export function loadGlobalStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const gs = JSON.parse(raw);
      // Ensure new fields have defaults
      gs.runsHistory = gs.runsHistory || [];
      gs.allTimeAssisters = gs.allTimeAssisters || {};
      gs.allTimeCleanSheets = gs.allTimeCleanSheets || {};
      return gs;
    }
  } catch(e) {}
  return null;
}

export function saveGame(gameState, currentScreen) {
  try {
    const payload = { game: gameState, screen: currentScreen, version: CURRENT_VERSION, timestamp: Date.now() };
    const json = JSON.stringify(payload);
    const data = { json, checksum: checksum(json) };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch(e) { console.warn('Save failed:', e); }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;

    const wrapper = JSON.parse(raw);

    // Handle saves with checksum wrapper
    let payload;
    if (wrapper.json && wrapper.checksum) {
      // Verify integrity
      if (checksum(wrapper.json) !== wrapper.checksum) {
        console.warn('Save file integrity check failed — data may be corrupted');
        return null;
      }
      payload = JSON.parse(wrapper.json);
    } else {
      // Legacy save without checksum (pre-3.1 format)
      payload = wrapper;
    }

    if (!validateGameState(payload.game)) return null;

    // Migrate if needed
    if (payload.version !== CURRENT_VERSION) {
      payload = migrateSave(payload);
      if (!payload) return null;
      // Re-save with updated version + checksum
      saveGame(payload.game, payload.screen);
    }

    return payload;
  } catch(e) { console.warn('Load failed:', e); }
  return null;
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function hasSaveData() {
  return !!localStorage.getItem(SAVE_KEY);
}
