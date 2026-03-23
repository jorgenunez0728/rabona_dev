import { describe, it, expect } from 'vitest';
import { initCareer, applyBarEffects, checkCareerEnd, applyAging, getMatchCards } from '../careerLogic';

// ═══════════════════════════════════════
// initCareer — creates a new career
// ═══════════════════════════════════════

describe('initCareer', () => {
  it('creates a career with correct name and position', () => {
    const c = initCareer('Leo Messi', 'FWD');
    expect(c.name).toBe('Leo Messi');
    expect(c.pos).toBe('FWD');
  });

  it('starts at age 16, season 1', () => {
    const c = initCareer('Test', 'MID');
    expect(c.age).toBe(16);
    expect(c.season).toBe(1);
  });

  it('has default bar values', () => {
    const c = initCareer('Test', 'GK');
    expect(c.bars.rend).toBe(50);
    expect(c.bars.fis).toBe(55);
    expect(c.bars.rel).toBe(50);
    expect(c.bars.fam).toBe(20);
    expect(c.bars.men).toBe(55);
  });

  it('initializes with empty history and stats', () => {
    const c = initCareer('Test', 'DEF');
    expect(c.goals).toBe(0);
    expect(c.totalMatches).toBe(0);
    expect(c.history).toEqual([]);
    expect(c.retired).toBe(false);
  });
});

// ═══════════════════════════════════════
// applyBarEffects — modifies career bars
// ═══════════════════════════════════════

describe('applyBarEffects', () => {
  const career = { bars: { rend: 50, fis: 55, rel: 50, fam: 20, men: 55 } };

  it('applies positive effects', () => {
    const newBars = applyBarEffects(career, { rend: 10, fam: 5 });
    expect(newBars.rend).toBe(60);
    expect(newBars.fam).toBe(25);
    expect(newBars.fis).toBe(55); // unchanged
  });

  it('applies negative effects', () => {
    const newBars = applyBarEffects(career, { fis: -10, men: -20 });
    expect(newBars.fis).toBe(45);
    expect(newBars.men).toBe(35);
  });

  it('clamps values to 0-100 range', () => {
    const high = { bars: { rend: 95, fis: 5, rel: 50, fam: 50, men: 50 } };
    const newBars = applyBarEffects(high, { rend: 20, fis: -30 });
    expect(newBars.rend).toBe(100); // capped at 100
    expect(newBars.fis).toBe(0);    // capped at 0
  });

  it('does not modify original career object', () => {
    const original = { bars: { rend: 50, fis: 55, rel: 50, fam: 20, men: 55 } };
    applyBarEffects(original, { rend: 10 });
    expect(original.bars.rend).toBe(50); // unchanged
  });
});

// ═══════════════════════════════════════
// checkCareerEnd — detects retirement triggers
// ═══════════════════════════════════════

describe('checkCareerEnd', () => {
  it('returns null for healthy career', () => {
    const c = { bars: { rend: 50, fis: 55, rel: 50, fam: 20, men: 55 }, age: 25 };
    expect(checkCareerEnd(c)).toBeNull();
  });

  it('triggers on zero fitness', () => {
    const c = { bars: { rend: 50, fis: 0, rel: 50, fam: 20, men: 55 }, age: 25 };
    expect(checkCareerEnd(c)).toContain('Lesión');
  });

  it('triggers on zero performance', () => {
    const c = { bars: { rend: 0, fis: 55, rel: 50, fam: 20, men: 55 }, age: 25 };
    expect(checkCareerEnd(c)).toContain('rendimiento');
  });

  it('triggers on zero relationships', () => {
    const c = { bars: { rend: 50, fis: 55, rel: 0, fam: 20, men: 55 }, age: 25 };
    expect(checkCareerEnd(c)).toContain('quiere');
  });

  it('triggers on zero mental health', () => {
    const c = { bars: { rend: 50, fis: 55, rel: 50, fam: 20, men: 0 }, age: 25 };
    expect(checkCareerEnd(c)).toContain('burnout');
  });

  it('triggers on max fame (100)', () => {
    const c = { bars: { rend: 50, fis: 55, rel: 50, fam: 100, men: 55 }, age: 25 };
    expect(checkCareerEnd(c)).toContain('fama');
  });

  it('triggers at age 36', () => {
    const c = { bars: { rend: 50, fis: 55, rel: 50, fam: 20, men: 55 }, age: 36 };
    expect(checkCareerEnd(c)).toContain('36');
  });

  it('does NOT trigger at age 35', () => {
    const c = { bars: { rend: 50, fis: 55, rel: 50, fam: 20, men: 55 }, age: 35 };
    expect(checkCareerEnd(c)).toBeNull();
  });
});

// ═══════════════════════════════════════
// applyAging — age-related stat changes
// ═══════════════════════════════════════

describe('applyAging', () => {
  it('young players (<=22) gain fitness', () => {
    const c = { age: 20, bars: { rend: 50, fis: 55, rel: 50, fam: 20, men: 55 } };
    const newBars = applyAging(c);
    expect(newBars.fis).toBe(58); // +3
  });

  it('veteran players (29-34) lose fitness and performance', () => {
    const c = { age: 30, bars: { rend: 50, fis: 55, rel: 50, fam: 20, men: 55 } };
    const newBars = applyAging(c);
    expect(newBars.fis).toBe(50);  // -5
    expect(newBars.rend).toBe(47); // -3
    expect(newBars.men).toBe(57);  // +2 (experience)
  });

  it('old players (>=35) lose a lot', () => {
    const c = { age: 35, bars: { rend: 50, fis: 55, rel: 50, fam: 20, men: 55 } };
    const newBars = applyAging(c);
    expect(newBars.fis).toBe(47);  // -8
    expect(newBars.rend).toBe(45); // -5
  });

  it('high fame (>70) drains mental health', () => {
    const c = { age: 25, bars: { rend: 50, fis: 55, rel: 50, fam: 80, men: 55 } };
    const newBars = applyAging(c);
    expect(newBars.men).toBe(53); // -2
  });

  it('low mental (<30) drains performance', () => {
    const c = { age: 25, bars: { rend: 50, fis: 55, rel: 50, fam: 20, men: 25 } };
    const newBars = applyAging(c);
    expect(newBars.rend).toBe(48); // -2
  });
});

// ═══════════════════════════════════════
// getMatchCards — generates match decisions
// ═══════════════════════════════════════

describe('getMatchCards', () => {
  it('returns 4-5 cards', () => {
    const cards = getMatchCards('FWD');
    expect(cards.length).toBeGreaterThanOrEqual(4);
    expect(cards.length).toBeLessThanOrEqual(6);
  });

  it('returns cards for unknown positions (defaults to MID)', () => {
    const cards = getMatchCards('UNKNOWN');
    expect(cards.length).toBeGreaterThan(0);
  });
});
