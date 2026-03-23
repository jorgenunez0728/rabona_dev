import { clamp } from './utils.js';

// Momentum ranges from -100 (rival dominates) to +100 (you dominate)
const MOMENTUM_CONFIG = {
  goal:              20,
  goalAgainst:      -25,
  possessionAttack:   3,
  possessionMid:      1,
  possessionDefense: -1,
  steal:              8,
  cardOwn:           -5,
  cardRival:          3,
  tacticalSuccess:   10,
  tacticalFail:      -5,
  decay:             -2,   // Per tick, towards 0
  halftimeReset:      0.5, // Multiplier — momentum halves at halftime
};

export function createMomentum(initialMorale = 50) {
  return {
    value: 0,
    morale: initialMorale,
    moraleFloor: 0,
    streak: 0,  // consecutive ticks with possession in attack
  };
}

export function updateMomentum(state, event, config = {}) {
  let { value, morale, moraleFloor, streak } = state;
  const floor = config.moraleFloor || moraleFloor;

  switch (event) {
    case 'goal':
      value += MOMENTUM_CONFIG.goal;
      morale = Math.min(99, morale + 10);
      streak = 0;
      break;
    case 'goal_against':
      value += MOMENTUM_CONFIG.goalAgainst;
      morale = Math.max(floor, morale - 8);
      streak = 0;
      break;
    case 'possession_attack':
      streak++;
      value += MOMENTUM_CONFIG.possessionAttack;
      break;
    case 'possession_mid':
      value += MOMENTUM_CONFIG.possessionMid;
      streak = 0;
      break;
    case 'possession_defense':
      value += MOMENTUM_CONFIG.possessionDefense;
      streak = Math.max(0, streak - 1);
      break;
    case 'steal':
      value += MOMENTUM_CONFIG.steal;
      morale = Math.min(99, morale + 2);
      break;
    case 'card_own':
      value += MOMENTUM_CONFIG.cardOwn;
      break;
    case 'card_rival':
      value += MOMENTUM_CONFIG.cardRival;
      break;
    case 'tactical_success':
      value += MOMENTUM_CONFIG.tacticalSuccess;
      morale = Math.min(99, morale + 5);
      break;
    case 'tactical_fail':
      value += MOMENTUM_CONFIG.tacticalFail;
      morale = Math.max(floor, morale - 3);
      break;
    case 'halftime':
      value = Math.round(value * MOMENTUM_CONFIG.halftimeReset);
      morale = Math.min(99, morale + 5);
      break;
    case 'tick':
      // Natural decay towards 0
      if (value > 0) value = Math.max(0, value + MOMENTUM_CONFIG.decay);
      else if (value < 0) value = Math.min(0, value - MOMENTUM_CONFIG.decay);
      break;
  }

  value = clamp(value, -100, 100);
  morale = clamp(Math.max(floor, morale), 0, 99);

  return { value, morale, moraleFloor: floor, streak };
}

// How momentum affects the match
export function getMomentumModifiers(momentum) {
  const ratio = momentum.value / 100;
  return {
    goalChanceMod:   ratio * 0.03,   // ±3% goal chance
    possessionMod:   ratio * 0.05,   // ±5% possession
    moraleMod:       (Math.max(momentum.moraleFloor, momentum.morale) - 50) / 200,
  };
}
