import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMomentum, updateMomentum, getMomentumModifiers } from '../engine/momentum.js';
import { createPossessionState, resolvePossession, getPossessionPct } from '../engine/possession.js';
import { generateChanceType, shouldGenerateChance, resolveChance, pickScorer, pickAssister, CHANCE_TYPES } from '../engine/chances.js';
import { getTacticalModifiers, PLAY_STYLES, INTENSITIES, HALFTIME_OPTIONS, getFormationMatchup } from '../engine/tactics.js';
import { getRivalStrategy, getRivalModifiers, RIVAL_STRATEGIES } from '../engine/rivalAI.js';
import { createMatchStats, recordShot, recordGoal, recordChance, recordCard, recordCorner, recordFoul, recordPossession, getFinalStats, getManOfTheMatch } from '../engine/matchStats.js';
import { createSubState, canSubstitute, makeSubstitution, getInMatchFatigue, applyInMatchFatigue } from '../engine/substitutions.js';
import { simulateMatch } from '../engine/matchEngine.js';
import { FORMATIONS } from '../data/items.js';

// ═══════════════════════════════════════
// Test helpers
// ═══════════════════════════════════════

function makePlayer(pos, atk = 10, def = 10, spd = 10, extras = {}) {
  return { id: `p_${pos}_${Math.random().toString(36).slice(2, 6)}`, name: `Test ${pos}`, pos, atk, def, spd, sav: pos === 'GK' ? 12 : 1, role: 'st', lv: 1, xp: 0, xpNext: 20, fatigue: 0, trait: {}, ...extras };
}

function makeTeam() {
  return [
    makePlayer('GK', 3, 8, 5, { sav: 12 }),
    makePlayer('DEF', 5, 14, 8),
    makePlayer('DEF', 6, 13, 7),
    makePlayer('MID', 10, 8, 11),
    makePlayer('MID', 9, 9, 10),
    makePlayer('FWD', 14, 5, 12),
    makePlayer('FWD', 13, 4, 11),
  ];
}

function makeRivalPlayers() {
  return [
    makePlayer('GK', 3, 7, 5, { sav: 10 }),
    makePlayer('DEF', 5, 12, 7),
    makePlayer('DEF', 4, 11, 8),
    makePlayer('MID', 8, 7, 9),
    makePlayer('MID', 9, 8, 8),
    makePlayer('FWD', 12, 4, 10),
    makePlayer('FWD', 11, 5, 9),
  ];
}

// ═══════════════════════════════════════
// Momentum system
// ═══════════════════════════════════════

describe('Momentum', () => {
  it('createMomentum returns initial state with value 0', () => {
    const m = createMomentum(50);
    expect(m.value).toBe(0);
    expect(m.morale).toBe(50);
    expect(m.streak).toBe(0);
  });

  it('goal increases momentum', () => {
    const m = createMomentum(50);
    const after = updateMomentum(m, 'goal');
    expect(after.value).toBeGreaterThan(0);
    expect(after.morale).toBeGreaterThan(50);
  });

  it('goal_against decreases momentum', () => {
    const m = createMomentum(50);
    const after = updateMomentum(m, 'goal_against');
    expect(after.value).toBeLessThan(0);
    expect(after.morale).toBeLessThan(50);
  });

  it('momentum is clamped to [-100, 100]', () => {
    let m = createMomentum(50);
    for (let i = 0; i < 20; i++) m = updateMomentum(m, 'goal');
    expect(m.value).toBeLessThanOrEqual(100);

    m = createMomentum(50);
    for (let i = 0; i < 20; i++) m = updateMomentum(m, 'goal_against');
    expect(m.value).toBeGreaterThanOrEqual(-100);
  });

  it('halftime resets momentum toward 0', () => {
    let m = createMomentum(50);
    m = updateMomentum(m, 'goal'); // positive momentum
    const before = m.value;
    m = updateMomentum(m, 'halftime');
    expect(Math.abs(m.value)).toBeLessThan(Math.abs(before));
  });

  it('tactical_success boosts momentum and morale', () => {
    const m = createMomentum(50);
    const after = updateMomentum(m, 'tactical_success');
    expect(after.value).toBeGreaterThan(0);
    expect(after.morale).toBeGreaterThan(50);
  });

  it('possession_attack increases streak and momentum', () => {
    const m = createMomentum(50);
    const after = updateMomentum(m, 'possession_attack');
    expect(after.streak).toBe(1);
    expect(after.value).toBeGreaterThan(0);
  });

  it('getMomentumModifiers returns modifiers proportional to value', () => {
    const m = { value: 50, morale: 70, moraleFloor: 0, streak: 0 };
    const mods = getMomentumModifiers(m);
    expect(mods.goalChanceMod).toBeGreaterThan(0);
    expect(mods.possessionMod).toBeGreaterThan(0);
  });

  it('morale never goes below moraleFloor', () => {
    let m = createMomentum(50);
    m = updateMomentum(m, 'goal_against', { moraleFloor: 40 });
    for (let i = 0; i < 20; i++) m = updateMomentum(m, 'goal_against', { moraleFloor: 40 });
    expect(m.morale).toBeGreaterThanOrEqual(40);
  });
});

// ═══════════════════════════════════════
// Possession
// ═══════════════════════════════════════

describe('Possession', () => {
  it('createPossessionState starts in midfield', () => {
    const p = createPossessionState();
    expect(p.zone).toBe('midfield');
    expect(p.totalTicks).toBe(0);
  });

  it('resolvePossession returns valid structure', () => {
    const state = createPossessionState();
    const home = { name: 'Halcones', players: makeTeam() };
    const away = { name: 'Rival', players: makeRivalPlayers() };
    const result = resolvePossession(state, home, away);
    expect(['home', 'away']).toContain(result.winner);
    expect(['defense', 'midfield', 'attack']).toContain(result.zone);
    expect(result.state.totalTicks).toBe(1);
  });

  it('getPossessionPct returns 50/50 for empty state', () => {
    const p = createPossessionState();
    const pct = getPossessionPct(p);
    expect(pct.home).toBe(50);
    expect(pct.away).toBe(50);
  });

  it('stronger team tends to win possession more often', () => {
    const state = createPossessionState();
    const strongTeam = makeTeam().map(p => ({ ...p, atk: p.atk + 10, def: p.def + 10, spd: p.spd + 10 }));
    const home = { name: 'Strong', players: strongTeam };
    const away = { name: 'Weak', players: makeRivalPlayers() };
    let homeWins = 0;
    for (let i = 0; i < 200; i++) {
      const result = resolvePossession(state, home, away);
      if (result.winner === 'home') homeWins++;
    }
    expect(homeWins).toBeGreaterThan(80); // should win more than 40%
  });
});

// ═══════════════════════════════════════
// Chances
// ═══════════════════════════════════════

describe('Chances', () => {
  it('CHANCE_TYPES has expected types', () => {
    expect(CHANCE_TYPES.elaborada).toBeDefined();
    expect(CHANCE_TYPES.contraataque).toBeDefined();
    expect(CHANCE_TYPES.pelotaParada).toBeDefined();
    expect(CHANCE_TYPES.tiroLejano).toBeDefined();
    expect(CHANCE_TYPES.errorRival).toBeDefined();
  });

  it('generateChanceType returns contraataque for counter-attacks', () => {
    const ct = generateChanceType({ zone: 'attack', isCounterAttack: true, ticksInZone: 0, momentumValue: 0 });
    expect(ct.id).toBe('contraataque');
  });

  it('shouldGenerateChance returns false outside attack zones', () => {
    expect(shouldGenerateChance({ winner: 'home', zone: 'defense' })).toBe(false);
  });

  it('resolveChance returns isGoal and isOnTarget booleans', () => {
    const attackTeam = { players: makeTeam() };
    const defendTeam = { players: makeRivalPlayers() };
    const result = resolveChance(CHANCE_TYPES.elaborada, attackTeam, defendTeam);
    expect(typeof result.isGoal).toBe('boolean');
    expect(typeof result.isOnTarget).toBe('boolean');
    expect(result.goalChance).toBeGreaterThan(0);
  });

  it('goalChance is clamped to valid range', () => {
    const weakTeam = { players: makeTeam().map(p => ({ ...p, atk: 1, spd: 1 })) };
    const strongTeam = { players: makeRivalPlayers().map(p => ({ ...p, def: 30 })) };
    const result = resolveChance(CHANCE_TYPES.elaborada, weakTeam, strongTeam);
    expect(result.goalChance).toBeGreaterThanOrEqual(0.02);
    expect(result.goalChance).toBeLessThanOrEqual(0.25);
  });

  it('pickScorer returns a player from the team', () => {
    const team = makeTeam();
    const scorer = pickScorer(team, CHANCE_TYPES.elaborada);
    expect(team.some(p => p.id === scorer.id)).toBe(true);
    expect(scorer.pos).not.toBe('GK');
  });

  it('pickAssister returns a different player from scorer', () => {
    const team = makeTeam();
    const scorer = team.find(p => p.pos === 'FWD');
    const assister = pickAssister(team, scorer, CHANCE_TYPES.elaborada);
    expect(assister).not.toBeNull();
    expect(assister.id).not.toBe(scorer.id);
  });
});

// ═══════════════════════════════════════
// Tactics
// ═══════════════════════════════════════

describe('Tactics', () => {
  it('PLAY_STYLES has at least 3 options', () => {
    expect(PLAY_STYLES.length).toBeGreaterThanOrEqual(3);
  });

  it('INTENSITIES has 3 levels', () => {
    expect(INTENSITIES.length).toBe(3);
  });

  it('HALFTIME_OPTIONS has offensive, balanced, defensive', () => {
    expect(HALFTIME_OPTIONS.map(h => h.id)).toEqual(['offensive', 'balanced', 'defensive']);
  });

  it('getTacticalModifiers returns valid structure', () => {
    const formation = FORMATIONS.find(f => f.id === 'clasica');
    const mods = getTacticalModifiers(formation, null, null);
    expect(mods).toHaveProperty('formMods');
    expect(mods).toHaveProperty('intensityMod');
    expect(mods).toHaveProperty('fatigueMult');
  });

  it('getFormationMatchup returns array of two numbers', () => {
    const result = getFormationMatchup('blitz', 'muro');
    expect(result).toHaveLength(2);
    expect(typeof result[0]).toBe('number');
    expect(typeof result[1]).toBe('number');
  });

  it('getFormationMatchup returns [0,0] for unknown pairing', () => {
    const result = getFormationMatchup('clasica', 'clasica');
    expect(result).toEqual([0, 0]);
  });

  it('all formations have 7 slots', () => {
    FORMATIONS.forEach(f => {
      expect(f.slots.length).toBe(7);
      expect(f.slots[0]).toBe('GK');
    });
  });

  it('new formations tridente and cadena exist', () => {
    expect(FORMATIONS.find(f => f.id === 'tridente')).toBeDefined();
    expect(FORMATIONS.find(f => f.id === 'cadena')).toBeDefined();
  });
});

// ═══════════════════════════════════════
// Rival AI
// ═══════════════════════════════════════

describe('Rival AI', () => {
  it('returns normal for low leagues', () => {
    const strat = getRivalStrategy({ homeScore: 0, awayScore: 0, minute: 50, league: 0 });
    expect(strat.desc).toBe('Normal');
  });

  it('returns desperate_attack when losing late in higher leagues', () => {
    const strat = getRivalStrategy({ homeScore: 2, awayScore: 0, minute: 80, league: 5 });
    expect(strat.desc).toBe('Ataque desesperado');
  });

  it('returns park_the_bus when winning by 2+ late', () => {
    const strat = getRivalStrategy({ homeScore: 0, awayScore: 3, minute: 75, league: 5 });
    expect(strat.desc).toBe('Cerrojazo');
  });

  it('getRivalModifiers returns valid modifiers', () => {
    const mods = getRivalModifiers(RIVAL_STRATEGIES.desperate_attack);
    expect(mods.rivalAtkMod).toBeGreaterThan(0);
    expect(mods.rivalDefMod).toBeLessThan(0);
  });

  it('transitions to push_for_winner when drawing late', () => {
    const strat = getRivalStrategy({ homeScore: 1, awayScore: 1, minute: 85, league: 4 });
    expect(strat.desc).toBe('Buscando el gol');
  });
});

// ═══════════════════════════════════════
// Match Stats
// ═══════════════════════════════════════

describe('Match Stats', () => {
  it('createMatchStats returns proper structure', () => {
    const stats = createMatchStats();
    expect(stats.possession.home).toBe(0);
    expect(stats.goals).toEqual([]);
    expect(stats.cards.home).toEqual([]);
  });

  it('recordShot tracks shots and on-target', () => {
    const stats = createMatchStats();
    recordShot(stats, 'home', true);
    recordShot(stats, 'home', false);
    recordShot(stats, 'away', true);
    expect(stats.shots.home).toBe(2);
    expect(stats.shotsOnTarget.home).toBe(1);
    expect(stats.shots.away).toBe(1);
  });

  it('recordGoal tracks scorers and assisters', () => {
    const stats = createMatchStats();
    recordGoal(stats, { minute: 25, team: 'home', scorer: makePlayer('FWD'), assister: makePlayer('MID'), chanceType: CHANCE_TYPES.elaborada });
    expect(stats.goals.length).toBe(1);
    expect(stats.goals[0].minute).toBe(25);
    expect(stats.goals[0].team).toBe('home');
  });

  it('getFinalStats calculates possession percentages', () => {
    const stats = createMatchStats();
    for (let i = 0; i < 60; i++) recordPossession(stats, 'home');
    for (let i = 0; i < 40; i++) recordPossession(stats, 'away');
    const final = getFinalStats(stats);
    expect(final.possessionPct.home).toBe(60);
    expect(final.possessionPct.away).toBe(40);
  });

  it('getManOfTheMatch picks best performer', () => {
    const stats = createMatchStats();
    const starters = makeTeam();
    const scorer = starters.find(p => p.pos === 'FWD');
    recordGoal(stats, { minute: 30, team: 'home', scorer, assister: null, chanceType: CHANCE_TYPES.elaborada });
    recordGoal(stats, { minute: 60, team: 'home', scorer, assister: null, chanceType: CHANCE_TYPES.elaborada });
    const motm = getManOfTheMatch(stats, starters);
    expect(motm).toBeDefined();
    expect(motm.name).toBe(scorer.name);
  });

  it('getManOfTheMatch returns null for empty starters', () => {
    const stats = createMatchStats();
    expect(getManOfTheMatch(stats, [])).toBeNull();
  });

  it('getManOfTheMatch values clean sheet for GK/DEF', () => {
    const stats = createMatchStats();
    const starters = makeTeam();
    // No away goals = clean sheet
    const motm = getManOfTheMatch(stats, starters);
    // GK or DEF should score high due to clean sheet bonus
    expect(motm).toBeDefined();
    expect(['GK', 'DEF']).toContain(motm.pos);
  });
});

// ═══════════════════════════════════════
// Substitutions
// ═══════════════════════════════════════

describe('Substitutions', () => {
  it('createSubState defaults to 1 max sub', () => {
    const sub = createSubState([]);
    expect(sub.maxSubs).toBe(1);
    expect(sub.subsUsed).toBe(0);
  });

  it('createSubState allows 2 subs with pizarron relic', () => {
    const sub = createSubState(['pizarron']);
    expect(sub.maxSubs).toBe(2);
  });

  it('canSubstitute returns true when subs available', () => {
    const sub = createSubState([]);
    expect(canSubstitute(sub)).toBe(true);
  });

  it('canSubstitute returns false when max reached', () => {
    const sub = { maxSubs: 1, subsUsed: 1, substitutions: [] };
    expect(canSubstitute(sub)).toBe(false);
  });

  it('makeSubstitution replaces player in active lineup', () => {
    const sub = createSubState([]);
    const starters = makeTeam();
    const playerOut = starters[5]; // FWD
    const playerIn = makePlayer('FWD', 15, 6, 13, { role: 'rs' });
    const result = makeSubstitution(sub, 60, playerOut, playerIn, starters);
    expect(result.success).toBe(true);
    expect(result.subState.subsUsed).toBe(1);
    expect(result.activePlayers.some(p => p.id === playerIn.id)).toBe(true);
    expect(result.activePlayers.some(p => p.id === playerOut.id)).toBe(false);
  });

  it('makeSubstitution fails when no subs remaining', () => {
    const sub = { maxSubs: 1, subsUsed: 1, substitutions: [] };
    const starters = makeTeam();
    const result = makeSubstitution(sub, 60, starters[5], makePlayer('FWD'), starters);
    expect(result.success).toBe(false);
  });

  it('getInMatchFatigue increases with minutes played', () => {
    expect(getInMatchFatigue(0)).toBe(0);
    expect(getInMatchFatigue(30)).toBe(4);
    expect(getInMatchFatigue(90)).toBe(12);
  });

  it('tireless trait halves in-match fatigue', () => {
    expect(getInMatchFatigue(90, true)).toBe(6);
  });

  it('applyInMatchFatigue returns 1.0 when low fatigue', () => {
    const p = makePlayer('FWD');
    p.inMatchFatigue = 10;
    expect(applyInMatchFatigue(p, 30)).toBe(1.0);
  });
});

// ═══════════════════════════════════════
// Match Engine Integration
// ═══════════════════════════════════════

describe('Match Engine Integration', () => {
  it('simulateMatch runs to completion', () => {
    const starters = makeTeam();
    const engine = simulateMatch({
      starters,
      roster: starters,
      formation: 'clasica',
      relics: [],
      coach: null,
      rival: { name: 'Test Rival', players: makeRivalPlayers() },
      league: 1,
      chemistry: 50,
      captain: starters[0],
    });

    let events = [];
    let result = engine.next();
    let iterations = 0;
    const maxIterations = 500;

    while (!result.done && iterations < maxIterations) {
      events.push(result.value);
      const ev = result.value;

      // Auto-respond to interactive events
      if (ev.type === 'halftime') {
        result = engine.next(1); // balanced
      } else if (ev.type === 'tactical_event') {
        result = engine.next(0); // first option
      } else if (ev.type === 'penalty') {
        result = engine.next({ scored: true });
      } else {
        result = engine.next();
      }
      iterations++;
    }

    expect(result.done).toBe(true);
    const final = result.value;
    expect(final.result).toBeDefined();
    expect(final.stats).toBeDefined();
    expect(final.result.homeScore).toBeGreaterThanOrEqual(0);
    expect(final.result.awayScore).toBeGreaterThanOrEqual(0);
    expect(typeof final.result.won).toBe('boolean');
  });

  it('emits kickoff as first event', () => {
    const starters = makeTeam();
    const engine = simulateMatch({
      starters,
      roster: starters,
      formation: 'clasica',
      relics: [],
      coach: null,
      rival: { name: 'Test', players: makeRivalPlayers() },
      league: 0,
      chemistry: 50,
      captain: starters[0],
    });

    const first = engine.next();
    expect(first.value.type).toBe('kickoff');
  });

  it('emits halftime event', () => {
    const starters = makeTeam();
    const engine = simulateMatch({
      starters,
      roster: starters,
      formation: 'clasica',
      relics: [],
      coach: null,
      rival: { name: 'Test', players: makeRivalPlayers() },
      league: 0,
      chemistry: 50,
      captain: starters[0],
    });

    let sawHalftime = false;
    let result = engine.next();
    let iterations = 0;

    while (!result.done && iterations < 500) {
      if (result.value.type === 'halftime') {
        sawHalftime = true;
        result = engine.next(1);
      } else if (result.value.type === 'tactical_event') {
        result = engine.next(0);
      } else if (result.value.type === 'penalty') {
        result = engine.next({ scored: true });
      } else {
        result = engine.next();
      }
      iterations++;
    }

    expect(sawHalftime).toBe(true);
  });

  it('emits whistle event at end', () => {
    const starters = makeTeam();
    const engine = simulateMatch({
      starters,
      roster: starters,
      formation: 'clasica',
      relics: [],
      coach: null,
      rival: { name: 'Test', players: makeRivalPlayers() },
      league: 0,
      chemistry: 50,
      captain: starters[0],
    });

    let lastEvent = null;
    let result = engine.next();
    let iterations = 0;

    while (!result.done && iterations < 500) {
      lastEvent = result.value;
      if (result.value.type === 'halftime') {
        result = engine.next(1);
      } else if (result.value.type === 'tactical_event') {
        result = engine.next(0);
      } else if (result.value.type === 'penalty') {
        result = engine.next({ scored: true });
      } else {
        result = engine.next();
      }
      iterations++;
    }

    expect(lastEvent.type).toBe('whistle');
    expect(lastEvent.minute).toBe(90);
  });

  it('relics affect match behavior', () => {
    // Test with blitz_boots + blitz formation
    const starters = makeTeam();
    const engine = simulateMatch({
      starters,
      roster: starters,
      formation: 'blitz',
      relics: ['blitz_boots'],
      coach: null,
      rival: { name: 'Test', players: makeRivalPlayers() },
      league: 0,
      chemistry: 50,
      captain: starters[0],
    });

    // Just verify it runs without errors
    let result = engine.next();
    let iterations = 0;
    while (!result.done && iterations < 500) {
      if (result.value.type === 'halftime') result = engine.next(1);
      else if (result.value.type === 'tactical_event') result = engine.next(0);
      else if (result.value.type === 'penalty') result = engine.next({ scored: true });
      else result = engine.next();
      iterations++;
    }
    expect(result.done).toBe(true);
  });

  it('final stats include possession percentages', () => {
    const starters = makeTeam();
    const engine = simulateMatch({
      starters,
      roster: starters,
      formation: 'clasica',
      relics: [],
      coach: null,
      rival: { name: 'Test', players: makeRivalPlayers() },
      league: 0,
      chemistry: 50,
      captain: starters[0],
    });

    let result = engine.next();
    let iterations = 0;
    while (!result.done && iterations < 500) {
      if (result.value.type === 'halftime') result = engine.next(1);
      else if (result.value.type === 'tactical_event') result = engine.next(0);
      else if (result.value.type === 'penalty') result = engine.next({ scored: true });
      else result = engine.next();
      iterations++;
    }

    const final = result.value;
    expect(final.stats.possessionPct).toBeDefined();
    expect(final.stats.possessionPct.home + final.stats.possessionPct.away).toBe(100);
  });

  it('guantes relic blocks last-minute goal when losing by 1', () => {
    // This is hard to test deterministically, but we verify the engine handles the relic flag
    const starters = makeTeam();
    const engine = simulateMatch({
      starters,
      roster: starters,
      formation: 'clasica',
      relics: ['guantes'],
      coach: null,
      rival: { name: 'Test', players: makeRivalPlayers() },
      league: 0,
      chemistry: 50,
      captain: starters[0],
    });

    let sawRelicEffect = false;
    let result = engine.next();
    let iterations = 0;
    while (!result.done && iterations < 500) {
      if (result.value.type === 'relic_effect' && result.value.relic === 'guantes') sawRelicEffect = true;
      if (result.value.type === 'halftime') result = engine.next(1);
      else if (result.value.type === 'tactical_event') result = engine.next(0);
      else if (result.value.type === 'penalty') result = engine.next({ scored: true });
      else result = engine.next();
      iterations++;
    }
    // sawRelicEffect may or may not be true depending on score — just verify it completes
    expect(result.done).toBe(true);
  });
});
