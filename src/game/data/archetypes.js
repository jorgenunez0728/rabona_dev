// ═══════════════════════════════════════
// MANAGER ARCHETYPES — Filosofías de Juego
// Each fundamentally changes the run's gameplay
// ═══════════════════════════════════════

export const MANAGER_ARCHETYPES = [
  {
    id: 'caudillo',
    n: 'El Caudillo',
    i: '🦅',
    d: 'Dominar o morir. Victoria total o derrota absoluta.',
    story: 'Un técnico que nunca aceptó un empate. Sus equipos juegan como si la vida dependiera de ello.',
    mechanic: 'furia_total',
    mechanicDesc: 'Los empates cuentan como derrota. +25% ATK cuando vas perdiendo. Goles dan doble moral.',
    startMods: { atkBonus: 2, defPenalty: -1, extraCoins: 0, chemBonus: 0 },
    engineHooks: {
      onLosing: { atkMult: 1.25 },
      onGoalScored: { moraleBoost: 20 },
      drawCountsAsLoss: true,
    },
    synergies: { coaches: ['bestia', 'chispa'], relics: ['corazon', 'sangre'] },
    cardSlots: { offensive: 3, defensive: 1, economic: 1, chaotic: 1 },
    unlocked: true,
    unlockReq: null,
    unlockDesc: null,
  },
  {
    id: 'arquitecto',
    n: 'El Arquitecto',
    i: '📐',
    d: 'Cada partido es una obra maestra táctica.',
    story: 'Analiza cada dato, cada ángulo. Sus rivales no entienden cómo predice sus jugadas.',
    mechanic: 'pizarron_vivo',
    mechanicDesc: 'Ve formación rival pre-match. +1 evento táctico. Eventos tácticos tienen 4a opción secreta.',
    startMods: { atkBonus: 0, defPenalty: 0, extraCoins: -5, chemBonus: 5 },
    engineHooks: {
      extraTacticalEvents: 1,
      tacticalSecretOption: true,
      formationSwitchAtHalf: true,
    },
    synergies: { coaches: ['profeta', 'lupe'], relics: ['reloj', 'pizarron', 'cuaderno'] },
    cardSlots: { offensive: 2, defensive: 2, economic: 1, chaotic: 1 },
    unlocked: true,
    unlockReq: null,
    unlockDesc: null,
  },
  {
    id: 'mercenario',
    n: 'El Mercenario',
    i: '💰',
    d: 'El dinero es el gol más importante.',
    story: 'Compra barato, vende caro. Su equipo rota cada 3 partidos pero siempre gana dinero.',
    mechanic: 'mercado_salvaje',
    mechanicDesc: '+30 monedas inicio. Mercado -30% precios. Jugadores comprados +20% stats por 3 partidos. Venta a 150%.',
    startMods: { atkBonus: 0, defPenalty: 0, extraCoins: 30, chemBonus: -5 },
    engineHooks: {
      debutBonus: { statMult: 1.20, duration: 3 },
      sellBonusMult: 1.5,
      marketDiscount: 0.30,
    },
    synergies: { coaches: ['moneda', 'fantasma'], relics: ['prensa', 'scouting'] },
    cardSlots: { offensive: 1, defensive: 1, economic: 4, chaotic: 0 },
    unlocked: false,
    unlockReq: 'coins500',
    unlockDesc: 'Acumula 500 monedas totales',
  },
  {
    id: 'mistico',
    n: 'El Místico',
    i: '🔮',
    d: 'El caos es tu aliado. Abraza lo desconocido.',
    story: 'Sus métodos no tienen sentido. Sus resultados tampoco. Hasta que empiezas a ganar.',
    mechanic: 'caos_controlado',
    mechanicDesc: 'Maldiciones +50% efecto pero dan bono oculto. Nodos ??? dobles. Reliquias malditas sin penalización.',
    startMods: { atkBonus: 0, defPenalty: 0, extraCoins: 0, chemBonus: 0, startWithCurse: true },
    engineHooks: {
      curseEffectMult: 1.5,
      curseBonusEnabled: true,
      cursedRelicNoPenalty: true,
      mysteryNodeDouble: true,
      curseMasterySpeedMult: 1.5,
    },
    synergies: { coaches: ['fantasma', 'zyx7'], relics: ['maldicion', 'doble_filo', 'pacto'] },
    cardSlots: { offensive: 1, defensive: 1, economic: 1, chaotic: 3 },
    unlocked: false,
    unlockReq: 'runs10',
    unlockDesc: 'Completa 10 carreras',
  },
  {
    id: 'cantera_pura',
    n: 'La Cantera',
    i: '🌱',
    d: 'Solo jóvenes promesas. Sin fichajes.',
    story: 'Cree que el futuro se construye desde abajo. Nunca compra. Solo entrena.',
    mechanic: 'academia',
    mechanicDesc: 'Sin mercado. +2 slots entrenamiento. XP 2x. Cada 3 partidos aparece canterano gratis.',
    startMods: { atkBonus: -1, defPenalty: -1, extraCoins: -20, chemBonus: 15 },
    engineHooks: {
      xpMult: 2.0,
      noMarket: true,
      freePlayerEvery: 3,
      trainingSlots: 4,
    },
    synergies: { coaches: ['lupe', 'miguel'], relics: ['vestuario', 'megafono'] },
    cardSlots: { offensive: 2, defensive: 2, economic: 0, chaotic: 2 },
    unlocked: false,
    unlockReq: 'nacional',
    unlockDesc: 'Alcanza la Liga Nacional',
  },
  {
    id: 'apostador',
    n: 'El Apostador',
    i: '🎲',
    d: 'Apuestas dobles. Ganar da el doble, perder cuesta el doble.',
    story: 'La vida es una apuesta. El fútbol es la apuesta más grande.',
    mechanic: 'todo_o_nada',
    mechanicDesc: 'Victoria da doble recompensa. Derrota pierde doble. Opción de apostar monedas pre-partido.',
    startMods: { atkBonus: 1, defPenalty: 0, extraCoins: 15, chemBonus: 0 },
    engineHooks: {
      winRewardMult: 2.0,
      lossRewardMult: 2.0,
      drawCountsAsLoss: true,
      preBetOption: true,
    },
    synergies: { coaches: ['bestia', 'moneda'], relics: ['botines94', 'pacto'] },
    cardSlots: { offensive: 2, defensive: 1, economic: 2, chaotic: 1 },
    unlocked: false,
    unlockReq: 'streak10',
    unlockDesc: 'Racha de 10 victorias',
  },
];

// Get available archetypes based on achievements
export function getAvailableManagerArchetypes(gs) {
  const achievements = gs.achievements || [];
  return MANAGER_ARCHETYPES.filter(a => {
    if (a.unlocked) return true;
    if (!a.unlockReq) return true;
    return achievements.includes(a.unlockReq);
  });
}

// Check if a specific archetype is unlocked
export function isArchetypeUnlocked(gs, archetypeId) {
  const arch = MANAGER_ARCHETYPES.find(a => a.id === archetypeId);
  if (!arch) return false;
  if (arch.unlocked) return true;
  if (!arch.unlockReq) return true;
  return (gs.achievements || []).includes(arch.unlockReq);
}

// Get total card slots for an archetype (base = sum of category slots)
export function getArchetypeCardSlots(archetypeId) {
  const arch = MANAGER_ARCHETYPES.find(a => a.id === archetypeId);
  if (!arch) return { offensive: 1, defensive: 1, economic: 1, chaotic: 1 };
  return { ...arch.cardSlots };
}

// Check if a coach synergizes with the archetype
export function hasArchetypeSynergy(archetypeId, coachId) {
  const arch = MANAGER_ARCHETYPES.find(a => a.id === archetypeId);
  if (!arch) return false;
  return arch.synergies.coaches.includes(coachId);
}
