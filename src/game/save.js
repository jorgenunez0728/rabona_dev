// ═══════════════════════════════════════
// SAVE / LOAD SYSTEM — localStorage
// ═══════════════════════════════════════

const SAVE_KEY = 'rabona-save';
const STATS_KEY = 'rabona-stats';

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
    const data = { game: gameState, screen: currentScreen, version: '3.0', timestamp: Date.now() };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch(e) { console.warn('Save failed:', e); }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.game && data.game.coach) {
        return data;
      }
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