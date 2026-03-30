import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock audio (Tone.js needs browser APIs)
vi.mock('@/game/audio', () => ({
  SFX: { play: vi.fn() },
  Crowd: { start: vi.fn(), stop: vi.fn(), surge: vi.fn() },
  Music: { start: vi.fn(), stop: vi.fn() },
  startAudio: vi.fn(),
}));

// Mock localStorage
const storage = {};
const localStorageMock = {
  getItem: vi.fn((key) => storage[key] || null),
  setItem: vi.fn((key, val) => { storage[key] = val; }),
  removeItem: vi.fn((key) => { delete storage[key]; }),
  clear: vi.fn(() => { Object.keys(storage).forEach(k => delete storage[k]); }),
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

import useGameStore from '../store';

// Reset store between tests
const initialState = useGameStore.getState();
beforeEach(() => {
  useGameStore.setState({ ...initialState });
  localStorageMock.clear();
  vi.clearAllMocks();
});

// ═══════════════════════════════════════
// debugToggleAutoPlay
// ═══════════════════════════════════════

describe('debugToggleAutoPlay', () => {
  it('starts as false', () => {
    expect(useGameStore.getState().debugAutoPlay).toBe(false);
  });

  it('toggles to true', () => {
    useGameStore.getState().debugToggleAutoPlay();
    expect(useGameStore.getState().debugAutoPlay).toBe(true);
  });

  it('toggles back to false', () => {
    useGameStore.getState().debugToggleAutoPlay();
    useGameStore.getState().debugToggleAutoPlay();
    expect(useGameStore.getState().debugAutoPlay).toBe(false);
  });
});

// ═══════════════════════════════════════
// debugStartCareer
// ═══════════════════════════════════════

describe('debugStartCareer', () => {
  it('creates a career with default parameters', () => {
    useGameStore.getState().debugStartCareer('FWD');
    const { career, careerScreen, screen } = useGameStore.getState();
    expect(career).not.toBeNull();
    expect(career.name).toBe('Debug FWD');
    expect(career.pos).toBe('FWD');
    expect(career.age).toBe(16);
    expect(career.season).toBe(1);
    expect(career.team).toBe(0);
    expect(career.bars).toEqual({ rend: 45, fis: 50, rel: 50, fam: 30, men: 50 });
    expect(careerScreen).toBe('cards');
    expect(screen).toBe('career');
  });

  it('populates cardQueue with career cards', () => {
    useGameStore.getState().debugStartCareer('MID');
    const { career } = useGameStore.getState();
    expect(career.cardQueue).toBeInstanceOf(Array);
    expect(career.cardQueue.length).toBeGreaterThan(0);
  });

  it('creates cast with 6 members', () => {
    useGameStore.getState().debugStartCareer('DEF');
    const { career } = useGameStore.getState();
    expect(career.cast).toHaveLength(6);
    expect(career.cast[0]).toHaveProperty('id');
    expect(career.cast[0]).toHaveProperty('n');
  });

  it('accepts custom age and calculates season', () => {
    useGameStore.getState().debugStartCareer('MID', 25);
    const { career } = useGameStore.getState();
    expect(career.age).toBe(25);
    expect(career.season).toBe(10); // 25 - 15
  });

  it('accepts custom team', () => {
    useGameStore.getState().debugStartCareer('DEF', 16, 3);
    const { career } = useGameStore.getState();
    expect(career.team).toBe(3);
  });

  it('clamps team to max 6', () => {
    useGameStore.getState().debugStartCareer('GK', 16, 99);
    const { career } = useGameStore.getState();
    expect(career.team).toBe(6);
  });

  it('accepts custom bars', () => {
    const customBars = { rend: 80, fis: 80, rel: 80, fam: 50, men: 80 };
    useGameStore.getState().debugStartCareer('FWD', 16, 0, customBars);
    const { career } = useGameStore.getState();
    expect(career.bars).toEqual(customBars);
  });

  it('works for all positions', () => {
    for (const pos of ['GK', 'DEF', 'MID', 'FWD']) {
      useGameStore.getState().debugStartCareer(pos);
      const { career } = useGameStore.getState();
      expect(career.pos).toBe(pos);
      expect(career.cardQueue.length).toBeGreaterThan(0);
    }
  });

  it('initializes career as not retired', () => {
    useGameStore.getState().debugStartCareer('FWD');
    const { career } = useGameStore.getState();
    expect(career.retired).toBe(false);
    expect(career.retireReason).toBe('');
    expect(career.goals).toBe(0);
    expect(career.totalMatches).toBe(0);
    expect(career.history).toEqual([]);
  });
});

// ═══════════════════════════════════════
// debugExportState
// ═══════════════════════════════════════

describe('debugExportState', () => {
  it('returns valid JSON string', () => {
    const json = useGameStore.getState().debugExportState();
    expect(typeof json).toBe('string');
    const parsed = JSON.parse(json);
    expect(parsed).toHaveProperty('game');
    expect(parsed).toHaveProperty('globalStats');
    expect(parsed).toHaveProperty('_v', 2);
  });

  it('includes career state when active', () => {
    useGameStore.getState().debugStartCareer('FWD');
    const json = useGameStore.getState().debugExportState();
    const parsed = JSON.parse(json);
    expect(parsed.career).not.toBeNull();
    expect(parsed.career.pos).toBe('FWD');
    expect(parsed.screen).toBe('career');
    expect(parsed.careerScreen).toBe('cards');
  });

  it('includes null career when no career active', () => {
    const json = useGameStore.getState().debugExportState();
    const parsed = JSON.parse(json);
    expect(parsed.career).toBeNull();
  });
});

// ═══════════════════════════════════════
// debugImportState
// ═══════════════════════════════════════

describe('debugImportState', () => {
  it('roundtrip: export → reset → import restores state', () => {
    useGameStore.getState().debugStartCareer('FWD', 22, 3);
    const exported = useGameStore.getState().debugExportState();

    // Reset
    useGameStore.setState({ career: null, screen: 'title', careerScreen: 'create' });
    expect(useGameStore.getState().career).toBeNull();

    // Import
    const ok = useGameStore.getState().debugImportState(exported);
    expect(ok).toBe(true);

    const { career, screen, careerScreen } = useGameStore.getState();
    expect(career).not.toBeNull();
    expect(career.pos).toBe('FWD');
    expect(career.age).toBe(22);
    expect(career.team).toBe(3);
    expect(screen).toBe('career');
    expect(careerScreen).toBe('cards');
  });

  it('returns false for invalid JSON', () => {
    const ok = useGameStore.getState().debugImportState('not json at all');
    expect(ok).toBe(false);
  });

  it('returns true for empty object (does not crash)', () => {
    const ok = useGameStore.getState().debugImportState('{}');
    expect(ok).toBe(true);
  });

  it('restores globalStats and persists to localStorage', () => {
    const state = {
      globalStats: { totalRuns: 42, bestLeague: 5, totalGoals: 100 },
      _v: 1,
    };
    const ok = useGameStore.getState().debugImportState(JSON.stringify(state));
    expect(ok).toBe(true);
    expect(useGameStore.getState().globalStats.totalRuns).toBe(42);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════
// debugStartAtLeague (existing but untested)
// ═══════════════════════════════════════

describe('debugStartAtLeague', () => {
  it('creates a game at specified league', () => {
    useGameStore.getState().debugStartAtLeague(0);
    const { game, hasSave } = useGameStore.getState();
    expect(game.league).toBe(0);
    expect(game.roster.length).toBe(10); // 7 starters + 3 reserves
    expect(game.table.length).toBeGreaterThan(1);
    expect(game.coins).toBe(500);
    expect(hasSave).toBe(true);
  });

  it('creates game at higher league', () => {
    useGameStore.getState().debugStartAtLeague(3);
    const { game } = useGameStore.getState();
    expect(game.league).toBe(3);
    expect(game.roster.length).toBe(10);
  });

  it('roster has correct role distribution', () => {
    useGameStore.getState().debugStartAtLeague(0);
    const { game } = useGameStore.getState();
    const starters = game.roster.filter(p => p.role === 'st');
    const reserves = game.roster.filter(p => p.role === 'rs');
    expect(starters).toHaveLength(7);
    expect(reserves).toHaveLength(3);
  });
});
