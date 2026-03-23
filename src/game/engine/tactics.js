// Team instructions — chosen pre-match, changeable at halftime

export const PLAY_STYLES = [
  {
    id: 'presion_alta',
    name: 'Presión Alta',
    icon: '🔥',
    desc: 'Robar arriba, pero desgasta más.',
    mods: {
      homePossBonus: 0.05,
      counterBonus: -0.05,       // Fewer own counters (pressing high)
      rivalCounterBonus: 0.08,   // Rival gets more counter chances
      fatigueMult: 1.15,
      stealChance: 0.15,
    },
  },
  {
    id: 'posesion',
    name: 'Posesión',
    icon: '🎯',
    desc: 'Controlar el balón, menos riesgo.',
    mods: {
      homePossBonus: 0.08,
      counterBonus: -0.08,
      rivalCounterBonus: 0.03,
      fatigueMult: 0.95,
      stealChance: 0.03,
    },
  },
  {
    id: 'contraataque',
    name: 'Contraataque',
    icon: '⚡',
    desc: 'Ceder posesión, golpear rápido.',
    mods: {
      homePossBonus: -0.08,
      counterBonus: 0.15,
      rivalCounterBonus: -0.03,
      fatigueMult: 1.0,
      stealChance: 0.08,
    },
  },
  {
    id: 'directo',
    name: 'Juego Directo',
    icon: '⬆',
    desc: 'Pelotazos largos, más tiros lejanos.',
    mods: {
      homePossBonus: -0.03,
      counterBonus: 0.05,
      rivalCounterBonus: 0.02,
      fatigueMult: 1.05,
      stealChance: 0.05,
      longShotBonus: 0.04,
    },
  },
];

export const INTENSITIES = [
  {
    id: 'conservadora',
    name: 'Conservadora',
    icon: '🛡',
    desc: 'Menos chances, menos riesgos.',
    mods: {
      intensityMod: -0.08,
      fatigueMult: 0.85,
      cardChanceMult: 0.5,
      injuryMult: 0.7,
    },
  },
  {
    id: 'normal',
    name: 'Normal',
    icon: '⚖',
    desc: 'Balance estándar.',
    mods: {
      intensityMod: 0,
      fatigueMult: 1.0,
      cardChanceMult: 1.0,
      injuryMult: 1.0,
    },
  },
  {
    id: 'intensa',
    name: 'Intensa',
    icon: '💪',
    desc: 'Más chances, más desgaste.',
    mods: {
      intensityMod: 0.06,
      fatigueMult: 1.2,
      cardChanceMult: 1.5,
      injuryMult: 1.3,
    },
  },
];

// Get combined modifiers from formation + play style + intensity
export function getTacticalModifiers(formation, playStyle, intensity) {
  const fm = formation?.mods || { atkMult: 1, defMult: 1, spdMult: 1 };
  const ps = playStyle?.mods || PLAY_STYLES[1].mods; // default: posesion
  const it = intensity?.mods || INTENSITIES[1].mods;  // default: normal

  // Formation-specific zone bonuses
  const formationZoneBonus = getFormationZoneBonus(formation?.id);

  return {
    formMods: fm,
    homePossBonus: ps.homePossBonus || 0,
    counterBonus: ps.counterBonus || 0,
    rivalCounterBonus: ps.rivalCounterBonus || 0,
    intensityMod: it.intensityMod || 0,
    fatigueMult: (ps.fatigueMult || 1) * (it.fatigueMult || 1),
    cardChanceMult: it.cardChanceMult || 1,
    injuryMult: it.injuryMult || 1,
    stealChance: ps.stealChance || 0.05,
    longShotBonus: ps.longShotBonus || 0,
    ...formationZoneBonus,
  };
}

// Formation matchup table: [homeBonus, awayBonus] applied to goal chance
// Keys are 'homeFormation_vs_awayFormation' (away = rival)
const FORMATION_MATCHUPS = {
  'blitz_vs_muro':      [-0.01, +0.01],
  'blitz_vs_cadena':    [+0.02, -0.01],
  'tridente_vs_muro':   [-0.02, +0.02],
  'diamante_vs_blitz':  [+0.01, -0.01],
  'cadena_vs_blitz':    [-0.01, +0.02],
  'cadena_vs_tridente': [+0.01, -0.01],
  'muro_vs_tridente':   [+0.02, -0.02],
  'muro_vs_blitz':      [+0.01, -0.01],
  'tridente_vs_cadena': [+0.01, -0.01],
  'tridente_vs_clasica':[+0.01, -0.005],
  'clasica_vs_tridente':[-0.005, +0.01],
};

export function getFormationMatchup(homeFormationId, awayFormationId) {
  const key = `${homeFormationId}_vs_${awayFormationId}`;
  const reverse = `${awayFormationId}_vs_${homeFormationId}`;
  if (FORMATION_MATCHUPS[key]) return FORMATION_MATCHUPS[key];
  if (FORMATION_MATCHUPS[reverse]) {
    const [a, b] = FORMATION_MATCHUPS[reverse];
    return [b, a]; // flip
  }
  return [0, 0];
}

// Formation-specific bonuses beyond flat stat multipliers
function getFormationZoneBonus(formationId) {
  switch (formationId) {
    case 'muro':
      return {
        defenseZoneBonus: 0.10,
        counterWeakness: 0.05,
        rivalChanceReduction: -0.05,
      };
    case 'diamante':
      return {
        midfieldZoneBonus: 0.08,
        counterVulnerability: 0.06,
        possessionRetention: 0.05,
      };
    case 'blitz':
      return {
        attackZoneBonus: 0.10,
        rivalChanceBonus: 0.05,
        offensiveOutput: 0.04,
      };
    case 'tridente':
      return {
        attackZoneBonus: 0.14,
        rivalChanceBonus: 0.08,
        offensiveOutput: 0.06,
        defenseZoneBonus: -0.10,
      };
    case 'cadena':
      return {
        midfieldZoneBonus: 0.12,
        possessionRetention: 0.08,
        counterWeakness: 0.04,
        defenseZoneBonus: 0.06,
      };
    case 'clasica':
    default:
      return {};
  }
}

// Halftime tactical options (replaces the old halftime strategy)
export const HALFTIME_OPTIONS = [
  { id: 'offensive', name: 'Ofensiva', icon: '⚔', desc: '+Ataque, -Defensa', stratMod: { atkMod: 0.015, defMod: -0.01 } },
  { id: 'balanced',  name: 'Equilibrada', icon: '⚖', desc: 'Balance', stratMod: { atkMod: 0, defMod: 0 } },
  { id: 'defensive', name: 'Defensiva', icon: '🛡', desc: '+Defensa, -Ataque', stratMod: { atkMod: -0.01, defMod: 0.015 } },
];
