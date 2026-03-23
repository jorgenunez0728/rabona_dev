// Substitution system for 7-player squads
// Default: 1 sub per match, 2 with 'pizarron' relic

export function createSubState(relics = []) {
  const maxSubs = relics.includes('pizarron') ? 2 : 1;
  return {
    maxSubs,
    subsUsed: 0,
    substitutions: [], // { minuteOut, playerOut, playerIn }
  };
}

export function canSubstitute(subState) {
  return subState.subsUsed < subState.maxSubs;
}

export function makeSubstitution(subState, minute, playerOut, playerIn, activePlayers) {
  if (!canSubstitute(subState)) return { subState, activePlayers, success: false };

  const newActive = activePlayers.map(p =>
    p.id === playerOut.id ? { ...playerIn, role: 'st', inMatchFatigue: 0 } : p
  );

  const newSubState = {
    ...subState,
    subsUsed: subState.subsUsed + 1,
    substitutions: [
      ...subState.substitutions,
      { minute, playerOut: playerOut.name, playerIn: playerIn.name, playerOutId: playerOut.id, playerInId: playerIn.id },
    ],
  };

  return { subState: newSubState, activePlayers: newActive, success: true };
}

// In-match fatigue: accumulates during the match, degrades stats
export function getInMatchFatigue(minute, isTireless = false) {
  const base = Math.floor(minute / 15) * 2;
  return isTireless ? Math.floor(base * 0.5) : base;
}

export function applyInMatchFatigue(player, minute) {
  const isTireless = player.trait?.fx === 'tireless';
  const fatigue = player.inMatchFatigue ?? getInMatchFatigue(minute, isTireless);
  if (fatigue <= 30) return 1.0; // no penalty
  return 1 - (fatigue - 30) / 100;
}
