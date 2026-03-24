// ═══════════════════════════════════════
// ASCENSION MUTATORS — Optional run modifiers
// Toggle before a run for extra legacy points
// ═══════════════════════════════════════

export const ASCENSION_MUTATORS = [
  {
    id: 'reloj_maldito', n: 'Reloj Maldito', i: '⏰',
    d: 'Partidos duran 120 minutos (más ticks, más chances para todos).',
    legacyBonus: 1, unlockAsc: 1,
    engineEffect: { matchLength: 120 },
  },
  {
    id: 'sin_subs', n: 'Sin Cambios', i: '🚫',
    d: 'No puedes hacer sustituciones.',
    legacyBonus: 1, unlockAsc: 1,
    engineEffect: { noSubstitutions: true },
  },
  {
    id: 'mercado_inflado', n: 'Mercado Inflado', i: '📈',
    d: 'Todos los precios del mercado +50%.',
    legacyBonus: 1, unlockAsc: 2,
    engineEffect: { marketPriceMult: 1.5 },
  },
  {
    id: 'vidrio', n: 'Cristal', i: '🪟',
    d: 'Lesiones son 3x más probables.',
    legacyBonus: 2, unlockAsc: 2,
    engineEffect: { injuryMult: 3.0 },
  },
  {
    id: 'amnesia', n: 'Amnesia', i: '🧠',
    d: 'No ves la tabla de posiciones. Juegas a ciegas.',
    legacyBonus: 1, unlockAsc: 3,
    engineEffect: { hideTable: true },
  },
  {
    id: 'karma', n: 'Karma', i: '☯',
    d: 'Cada gol que anotas da +5 moral al rival.',
    legacyBonus: 2, unlockAsc: 3,
    engineEffect: { karmaGoalMorale: 5 },
  },
  {
    id: 'tributo', n: 'Tributo', i: '💀',
    d: 'Empate también roba un jugador (no solo derrota).',
    legacyBonus: 2, unlockAsc: 4,
    engineEffect: { drawStealsPlayer: true },
  },
  {
    id: 'dogma', n: 'Dogma', i: '📏',
    d: 'No puedes cambiar de formación ni estilo de juego.',
    legacyBonus: 2, unlockAsc: 5,
    engineEffect: { lockFormation: true, lockPlayStyle: true },
  },
  {
    id: 'maldicion_eterna', n: 'Maldición Eterna', i: '☠️',
    d: 'Empiezas con 2 maldiciones aleatorias.',
    legacyBonus: 3, unlockAsc: 5,
    engineEffect: { startCurses: 2 },
  },
  {
    id: 'espejo', n: 'Espejo', i: '🪞',
    d: 'El rival siempre copia tu formación.',
    legacyBonus: 1, unlockAsc: 6,
    engineEffect: { rivalMirrorsFormation: true },
  },
];

// Max mutators active at once
export const MAX_ACTIVE_MUTATORS = 3;

// Get unlocked mutators based on ascension level
export function getAvailableMutators(ascensionLevel) {
  return ASCENSION_MUTATORS.filter(m => m.unlockAsc <= ascensionLevel);
}

// Calculate total legacy bonus from active mutators
export function calcMutatorLegacyBonus(activeMutatorIds, ascensionLevel) {
  return activeMutatorIds.reduce((sum, id) => {
    const m = ASCENSION_MUTATORS.find(mut => mut.id === id);
    return sum + (m ? m.legacyBonus : 0);
  }, 0) * Math.max(1, ascensionLevel);
}

// Merge all active mutator engine effects into a single object
export function getMutatorEngineEffects(activeMutatorIds) {
  const effects = {};
  for (const id of activeMutatorIds) {
    const m = ASCENSION_MUTATORS.find(mut => mut.id === id);
    if (m?.engineEffect) Object.assign(effects, m.engineEffect);
  }
  return effects;
}
