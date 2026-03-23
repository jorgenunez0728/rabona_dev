// Rival AI: adapts strategy based on score, minute, and league level

export const RIVAL_STRATEGIES = {
  normal:          { atkMod: 0,     defMod: 0,     possBonus: 0,    desc: 'Normal' },
  desperate_attack:{ atkMod: 0.04,  defMod: -0.03, possBonus: 0.05, desc: 'Ataque desesperado' },
  park_the_bus:    { atkMod: -0.03, defMod: 0.05,  possBonus: -0.05,desc: 'Cerrojazo' },
  push_for_winner: { atkMod: 0.02,  defMod: -0.01, possBonus: 0.03, desc: 'Buscando el gol' },
  counter_focus:   { atkMod: 0.01,  defMod: 0.02,  possBonus: -0.04,desc: 'Contraataque' },
};

// Determine rival strategy based on match state
export function getRivalStrategy(matchState) {
  const { homeScore, awayScore, minute, league } = matchState;
  const rivalScore = awayScore;
  const playerScore = homeScore;
  const losing = rivalScore < playerScore;
  const winning = rivalScore > playerScore;
  const drawing = rivalScore === playerScore;

  // Lower leagues: less adaptive
  if (league <= 1) return RIVAL_STRATEGIES.normal;

  // Mid leagues: basic adaptation
  if (league <= 3) {
    if (losing && minute > 70) return RIVAL_STRATEGIES.desperate_attack;
    if (winning && minute > 80) return RIVAL_STRATEGIES.park_the_bus;
    return RIVAL_STRATEGIES.normal;
  }

  // Higher leagues: smarter adaptation
  if (losing) {
    if (minute > 75) return RIVAL_STRATEGIES.desperate_attack;
    if (minute > 60) return RIVAL_STRATEGIES.push_for_winner;
    return RIVAL_STRATEGIES.normal;
  }

  if (winning) {
    if (minute > 70) return RIVAL_STRATEGIES.park_the_bus;
    if (minute > 50 && rivalScore - playerScore >= 2) return RIVAL_STRATEGIES.park_the_bus;
    return RIVAL_STRATEGIES.counter_focus;
  }

  // Drawing
  if (minute > 80) return RIVAL_STRATEGIES.push_for_winner;
  if (minute > 60 && league >= 5) return RIVAL_STRATEGIES.push_for_winner;
  return RIVAL_STRATEGIES.normal;
}

// Apply rival strategy modifiers to goal chance calculations
export function getRivalModifiers(strategy) {
  return {
    rivalAtkMod: strategy.atkMod || 0,
    rivalDefMod: strategy.defMod || 0,
    rivalPossBonus: strategy.possBonus || 0,
  };
}
