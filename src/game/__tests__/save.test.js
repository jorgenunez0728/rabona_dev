import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveGame, loadGame, deleteSave, migrateSave, CURRENT_VERSION, saveGlobalStats, loadGlobalStats } from '../save';

// Mock localStorage
const storage = {};
const localStorageMock = {
  getItem: vi.fn((key) => storage[key] || null),
  setItem: vi.fn((key, val) => { storage[key] = val; }),
  removeItem: vi.fn((key) => { delete storage[key]; }),
  clear: vi.fn(() => { Object.keys(storage).forEach(k => delete storage[k]); }),
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// ═══════════════════════════════════════
// Save & Load
// ═══════════════════════════════════════

describe('saveGame & loadGame', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  const validGame = {
    coach: { id: 'miguel', n: 'Don Miguel' },
    roster: [{ id: '1', pos: 'GK', name: 'Test' }],
    league: 0,
    matchNum: 2,
    formation: 'clasica',
    coins: 50,
  };

  it('saves and loads a game correctly', () => {
    saveGame(validGame, 'table');
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded.game.coach.id).toBe('miguel');
    expect(loaded.game.coins).toBe(50);
    expect(loaded.version).toBe(CURRENT_VERSION);
  });

  it('saves with a checksum for integrity', () => {
    saveGame(validGame, 'table');
    const raw = JSON.parse(storage['rabona-save']);
    expect(raw).toHaveProperty('json');
    expect(raw).toHaveProperty('checksum');
    expect(typeof raw.checksum).toBe('string');
  });

  it('detects corrupted save data', () => {
    saveGame(validGame, 'table');
    // Tamper with the save
    const raw = JSON.parse(storage['rabona-save']);
    raw.json = raw.json.replace('"miguel"', '"hacker"');
    storage['rabona-save'] = JSON.stringify(raw);
    const loaded = loadGame();
    expect(loaded).toBeNull(); // integrity check should fail
  });

  it('returns null for empty storage', () => {
    expect(loadGame()).toBeNull();
  });

  it('returns null for save without coach', () => {
    const noCoach = { ...validGame, coach: null };
    saveGame(noCoach, 'table');
    // Manually set without checksum to bypass checksum check
    const payload = { game: noCoach, screen: 'table', version: CURRENT_VERSION, timestamp: Date.now() };
    storage['rabona-save'] = JSON.stringify(payload);
    expect(loadGame()).toBeNull();
  });

  it('returns null for save without roster array', () => {
    const noRoster = { ...validGame, roster: 'not-an-array' };
    const payload = { game: noRoster, screen: 'table', version: CURRENT_VERSION, timestamp: Date.now() };
    storage['rabona-save'] = JSON.stringify(payload);
    expect(loadGame()).toBeNull();
  });
});

// ═══════════════════════════════════════
// Migrations
// ═══════════════════════════════════════

describe('migrateSave', () => {
  it('migrates v3.0 to current version', () => {
    const oldSave = {
      version: '3.0',
      game: {
        coach: { id: 'miguel' },
        roster: [],
        league: 0,
        matchNum: 0,
        formation: undefined,
      },
    };
    const migrated = migrateSave(oldSave);
    expect(migrated).not.toBeNull();
    expect(migrated.version).toBe(CURRENT_VERSION);
    expect(migrated.game.formation).toBe('clasica');
    expect(migrated.game.relics).toEqual([]);
    expect(migrated.game.trainedIds).toEqual([]);
    expect(migrated.game.streak).toBe(0);
    expect(migrated.game.chemistry).toBe(0);
    expect(migrated.game.careerStats).toBeDefined();
    expect(migrated.game.careerStats.wins).toBe(0);
  });

  it('returns null for unknown version', () => {
    const futureSave = { version: '99.0', game: { coach: { id: 'test' } } };
    expect(migrateSave(futureSave)).toBeNull();
  });

  it('handles legacy save without checksum wrapper', () => {
    // Old format: direct JSON without checksum
    const legacySave = {
      game: {
        coach: { id: 'miguel' },
        roster: [{ id: '1', pos: 'GK' }],
        league: 1,
        matchNum: 3,
        formation: 'clasica',
      },
      version: '3.0',
      screen: 'table',
      timestamp: Date.now(),
    };
    storage['rabona-save'] = JSON.stringify(legacySave);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded.version).toBe(CURRENT_VERSION);
  });
});

// ═══════════════════════════════════════
// Delete
// ═══════════════════════════════════════

describe('deleteSave', () => {
  it('removes saved game', () => {
    saveGame({ coach: { id: 'test' }, roster: [], league: 0, matchNum: 0, formation: 'clasica' }, 'table');
    deleteSave();
    expect(loadGame()).toBeNull();
  });
});

// ═══════════════════════════════════════
// Global Stats
// ═══════════════════════════════════════

describe('globalStats', () => {
  beforeEach(() => { localStorageMock.clear(); vi.clearAllMocks(); });

  it('saves and loads global stats', () => {
    const stats = { totalRuns: 5, bestLeague: 3, totalGoals: 42 };
    saveGlobalStats(stats);
    const loaded = loadGlobalStats();
    expect(loaded.totalRuns).toBe(5);
    expect(loaded.totalGoals).toBe(42);
  });

  it('returns null when no stats saved', () => {
    expect(loadGlobalStats()).toBeNull();
  });
});
