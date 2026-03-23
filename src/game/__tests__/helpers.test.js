import { describe, it, expect } from 'vitest';
import {
  calcOvr, effectiveStats, effectiveOvr, genPlayer, rnd, pick,
  avgStat, teamPower, teamGKRating,
} from '../data';

// ═══════════════════════════════════════
// calcOvr — the most critical function
// Determines player power displayed everywhere
// ═══════════════════════════════════════

describe('calcOvr', () => {
  it('calculates outfield player OVR as average of atk+def+spd', () => {
    const player = { pos: 'FWD', atk: 12, def: 6, spd: 9, sav: 1 };
    expect(calcOvr(player)).toBe(Math.round((12 + 6 + 9) / 3)); // 9
  });

  it('calculates GK OVR with weighted formula (0.2 def + 0.6 sav + 0.2 spd)', () => {
    const gk = { pos: 'GK', atk: 2, def: 10, sav: 15, spd: 8 };
    expect(calcOvr(gk)).toBe(Math.round(10 * 0.2 + 15 * 0.6 + 8 * 0.2)); // 13
  });

  it('handles MID position same as outfield', () => {
    const mid = { pos: 'MID', atk: 10, def: 10, spd: 10, sav: 1 };
    expect(calcOvr(mid)).toBe(10);
  });

  it('handles DEF position same as outfield', () => {
    const def = { pos: 'DEF', atk: 5, def: 15, spd: 7, sav: 1 };
    expect(calcOvr(def)).toBe(Math.round((5 + 15 + 7) / 3)); // 9
  });

  it('rounds the result correctly', () => {
    const player = { pos: 'FWD', atk: 10, def: 11, spd: 12, sav: 1 };
    expect(calcOvr(player)).toBe(11); // 33/3 = 11 exact
  });
});

// ═══════════════════════════════════════
// effectiveStats — applies fatigue, traits, formation mods
// ═══════════════════════════════════════

describe('effectiveStats', () => {
  const basePlayer = { pos: 'FWD', atk: 10, def: 8, spd: 12, sav: 1, fatigue: 0, trait: { fx: 'none' } };

  it('returns raw stats when no fatigue, no trait, no formation', () => {
    const es = effectiveStats(basePlayer);
    expect(es.atk).toBe(10);
    expect(es.def).toBe(8);
    expect(es.spd).toBe(12);
  });

  it('applies 0.85x penalty when fatigue > 70', () => {
    const tired = { ...basePlayer, fatigue: 80 };
    const es = effectiveStats(tired);
    expect(es.atk).toBe(Math.round(10 * 0.85)); // 9
    expect(es.def).toBe(Math.round(8 * 0.85));  // 7
    expect(es.spd).toBe(Math.round(12 * 0.85)); // 10
  });

  it('applies 0.93x penalty when fatigue > 50 but <= 70', () => {
    const somewhatTired = { ...basePlayer, fatigue: 60 };
    const es = effectiveStats(somewhatTired);
    expect(es.atk).toBe(Math.round(10 * 0.93)); // 9
  });

  it('no fatigue penalty when fatigue <= 50', () => {
    const fresh = { ...basePlayer, fatigue: 50 };
    const es = effectiveStats(fresh);
    expect(es.atk).toBe(10);
  });

  it('applies tank trait: +4 DEF, -1 VEL', () => {
    const tank = { ...basePlayer, trait: { fx: 'tank' } };
    const es = effectiveStats(tank);
    expect(es.def).toBe(8 + 4);
    expect(es.spd).toBe(12 - 1);
  });

  it('applies ghost trait: +3 ATK', () => {
    const ghost = { ...basePlayer, trait: { fx: 'ghost' } };
    const es = effectiveStats(ghost);
    expect(es.atk).toBe(10 + 3);
  });

  it('tireless trait ignores fatigue', () => {
    const tireless = { ...basePlayer, fatigue: 90, trait: { fx: 'tireless' } };
    const es = effectiveStats(tireless);
    expect(es.atk).toBe(10); // no fatigue penalty
    expect(es.def).toBe(8);
    expect(es.spd).toBe(12);
  });

  it('applies brute trait: +2 ATK', () => {
    const brute = { ...basePlayer, trait: { fx: 'brute' } };
    const es = effectiveStats(brute);
    expect(es.atk).toBe(10 + 2);
  });

  it('applies formation modifiers', () => {
    const blitzMods = { atkMult: 1.35, defMult: 0.70, spdMult: 1.05 };
    const es = effectiveStats(basePlayer, blitzMods);
    expect(es.atk).toBe(Math.round(10 * 1.35)); // 14
    expect(es.def).toBe(Math.round(8 * 0.70));  // 6
    expect(es.spd).toBe(Math.round(12 * 1.05)); // 13
  });
});

// ═══════════════════════════════════════
// genPlayer — player generation
// ═══════════════════════════════════════

describe('genPlayer', () => {
  it('creates a player with all required fields', () => {
    const p = genPlayer('FWD', 1, 3);
    expect(p).toHaveProperty('id');
    expect(p).toHaveProperty('name');
    expect(p).toHaveProperty('pos', 'FWD');
    expect(p).toHaveProperty('lv');
    expect(p).toHaveProperty('atk');
    expect(p).toHaveProperty('def');
    expect(p).toHaveProperty('spd');
    expect(p).toHaveProperty('sav');
    expect(p).toHaveProperty('xp', 0);
    expect(p).toHaveProperty('trait');
    expect(p).toHaveProperty('personality');
    expect(p).toHaveProperty('fatigue', 0);
    expect(p).toHaveProperty('role', 'rs');
  });

  it('generates unique IDs', () => {
    const p1 = genPlayer('FWD', 1, 1);
    const p2 = genPlayer('FWD', 1, 1);
    expect(p1.id).not.toBe(p2.id);
  });

  it('level is within min/max range', () => {
    for (let i = 0; i < 20; i++) {
      const p = genPlayer('MID', 3, 5);
      expect(p.lv).toBeGreaterThanOrEqual(3);
      expect(p.lv).toBeLessThanOrEqual(5);
    }
  });

  it('GK has high sav, low atk', () => {
    const gk = genPlayer('GK', 5, 5);
    expect(gk.sav).toBeGreaterThan(gk.atk);
    expect(gk.pos).toBe('GK');
  });

  it('sets correct xpNext based on level', () => {
    const p = genPlayer('DEF', 3, 3);
    expect(p.xpNext).toBe(3 * 10 + 20); // 50
  });
});

// ═══════════════════════════════════════
// rnd & pick — utility functions
// ═══════════════════════════════════════

describe('rnd', () => {
  it('returns value within range (inclusive)', () => {
    for (let i = 0; i < 100; i++) {
      const val = rnd(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
    }
  });

  it('returns integer', () => {
    const val = rnd(1, 100);
    expect(Number.isInteger(val)).toBe(true);
  });
});

describe('pick', () => {
  it('returns an element from the array', () => {
    const arr = ['a', 'b', 'c'];
    for (let i = 0; i < 20; i++) {
      expect(arr).toContain(pick(arr));
    }
  });
});

// ═══════════════════════════════════════
// avgStat & teamPower — team-level calculations
// ═══════════════════════════════════════

describe('avgStat', () => {
  it('returns average of a stat across players', () => {
    const players = [
      { atk: 10, def: 5, spd: 8, sav: 1, fatigue: 0, trait: { fx: 'none' } },
      { atk: 20, def: 15, spd: 12, sav: 1, fatigue: 0, trait: { fx: 'none' } },
    ];
    const avg = avgStat(players, 'atk');
    expect(avg).toBe(15); // (10+20)/2
  });

  it('returns 5 for empty array', () => {
    expect(avgStat([], 'atk')).toBe(5);
  });
});

describe('teamPower', () => {
  it('returns a number for a valid roster', () => {
    const players = [
      { pos: 'GK', atk: 2, def: 10, spd: 8, sav: 12, fatigue: 0, trait: { fx: 'none' } },
      { pos: 'DEF', atk: 6, def: 12, spd: 8, sav: 1, fatigue: 0, trait: { fx: 'none' } },
      { pos: 'FWD', atk: 14, def: 5, spd: 12, sav: 1, fatigue: 0, trait: { fx: 'none' } },
    ];
    const power = teamPower(players);
    expect(typeof power).toBe('number');
    expect(power).toBeGreaterThan(0);
  });
});
