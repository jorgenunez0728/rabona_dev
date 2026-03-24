export const COACHES=[
  {id:'miguel',n:'Don Miguel',i:'👴',d:'El entrenador original del torneo inconcluso de 1994.',story:'Hace 30 años, un torneo quedó inconcluso. Don Miguel nunca lo olvidó.',a:'Memoria del 94: +1 nivel inicial',fx:'boost',unlocked:true},
  {id:'bestia',n:'"La Bestia"',i:'🦁',d:'Exjugador violento. Todo o nada.',story:'Lo expulsaron de 3 ligas. Ahora quiere ganar sin patadas.',a:'Furia: +3 ATK, -2 DEF',fx:'fury',unlocked:false,unlockReq:'Ascensión 1',unlockCheck:g=>(g.ascensionLevel||0)>=1},
  {id:'lupe',n:'Doña Lupe',i:'👩‍🦳',d:'Estratega implacable. Primera mujer DT.',story:'Todos dijeron que no era para ella. Ganó 3 torneos y callaron.',a:'Muro: +3 DEF. Sin robo al perder.',fx:'wall',unlocked:false,unlockReq:'Liga Estatal',unlockCheck:g=>(g.bestLeague||0)>=2},
  {id:'profeta',n:'"El Profeta"',i:'🔮',d:'Exanalista de datos de Silicon Valley.',story:'Renunció a todo para entrenar un equipo de barrio.',a:'Analítica: Ve stats rival. +1 evento.',fx:'scout',unlocked:false,unlockReq:'5 runs',unlockCheck:g=>(g.totalRuns||0)>=5},
  {id:'chispa',n:'"La Chispa"',i:'⚡',d:'Todo velocidad. Corre más que piensa.',story:'Era el más rápido de México. La rodilla lo retiró.',a:'Velocista: +4 VEL, -3 DEF',fx:'speed',unlocked:false,unlockReq:'Racha de 5',unlockCheck:g=>(g.bestStreak||0)>=5},
  {id:'fantasma',n:'"El Fantasma"',i:'👻',d:'Nadie sabe de dónde viene.',story:'Dirigió un equipo de la nada al campeonato. Luego desapareció.',a:'Misterio: 1 legendario gratis. -3 quím.',fx:'mystery',unlocked:false,unlockReq:'3 en Hall of Fame',unlockCheck:g=>(g.hallOfFame||[]).length>=3},
  {id:'moneda',n:'"La Moneda"',i:'🪙',d:'El DT más tacaño. Cada centavo cuenta.',story:'Llevó al peor equipo a semifinales gastando menos que todos.',a:'Austero: 80💰 inicio. -30% costos.',fx:'cheap',unlocked:false,unlockReq:'500 monedas total',unlockCheck:g=>(g.totalCoins||0)>=500},
  {id:'zyx7',n:'Zyx-7',i:'👽',d:'Entidad alienígena de la Liga Intergaláctica.',story:'En mi planeta no hay porteros. Tampoco derrotas.',a:'Sin GK. 100💰 inicio.',fx:'alien',unlocked:false,unlockReq:'Campeón Galáctico',unlockCheck:g=>(g.bestLeague||0)>=7},
];

export const COACH_PORTRAIT_IDX={miguel:0,bestia:1,lupe:2,profeta:3,chispa:4,fantasma:5,moneda:6,zyx7:7};

// ── Coach Abilities: unique run-altering mechanics per coach ──
// Applied in store.js confirmStart and during gameplay
export const COACH_ABILITIES = {
  miguel:  { id:'miguel',  desc:'Equilibrio total. +1 nivel inicial a cada titular.',         startBonus:'lv_up',     extraCoins:0,  chemMod:0,  stealMod:0,   counterMod:0,  marketDiscount:0, legendaryStart:false, mapPreview:false, curseFreeRemove:0 },
  bestia:  { id:'bestia',  desc:'Presión brutal. +15% robo de balón, -5 química por partido.', startBonus:'atk_boost', extraCoins:0,  chemMod:-5, stealMod:0.15, counterMod:0,  marketDiscount:0, legendaryStart:false, mapPreview:false, curseFreeRemove:0 },
  lupe:    { id:'lupe',    desc:'Cantera pura. 3 titulares con trait Promesa. Mercado -30%.', startBonus:'cantera_3', extraCoins:0,  chemMod:0,  stealMod:0,   counterMod:0,  marketDiscount:0.30, legendaryStart:false, mapPreview:false, curseFreeRemove:0 },
  profeta: { id:'profeta', desc:'Ve 1 nodo futuro en el mapa. Cura 1 maldición gratis/run.',  startBonus:null,        extraCoins:0,  chemMod:0,  stealMod:0,   counterMod:0,  marketDiscount:0, legendaryStart:false, mapPreview:true,  curseFreeRemove:1 },
  chispa:  { id:'chispa',  desc:'Contraataque letal. +25% contras, partidos más rápidos.',    startBonus:'spd_boost', extraCoins:0,  chemMod:0,  stealMod:0,   counterMod:0.25, marketDiscount:0, legendaryStart:false, mapPreview:false, curseFreeRemove:0 },
  fantasma:{ id:'fantasma',desc:'Empieza con 1 legendario del Hall of Fame. -3 química.',     startBonus:null,        extraCoins:0,  chemMod:-3, stealMod:0,   counterMod:0,  marketDiscount:0, legendaryStart:true,  mapPreview:false, curseFreeRemove:0 },
  moneda:  { id:'moneda',  desc:'80 monedas inicio. Costos de mercado -30%.',                 startBonus:null,        extraCoins:30, chemMod:0,  stealMod:0,   counterMod:0,  marketDiscount:0.30, legendaryStart:false, mapPreview:false, curseFreeRemove:0 },
  zyx7:    { id:'zyx7',    desc:'Sin portero. 100 monedas. Jugadores pueden mutar stats.',    startBonus:null,        extraCoins:50, chemMod:0,  stealMod:0,   counterMod:0,  marketDiscount:0, legendaryStart:false, mapPreview:false, curseFreeRemove:0 },
};

export const ASCENSION_MODS=[
  {lv:0,n:'Normal',d:'Sin modificadores.',mods:[]},
  {lv:1,n:'Ascensión 1',d:'Rivales +1 nivel.',mods:['rival_lv_up']},
  {lv:2,n:'Ascensión 2',d:'Cada rival tiene un delantero killer.',mods:['rival_lv_up','killer_fwd']},
  {lv:3,n:'Ascensión 3',d:'DTs rivales con habilidades potenciadas.',mods:['rival_lv_up','killer_fwd','coach_boost']},
  {lv:4,n:'Ascensión 4',d:'Un rival tiene portero imbatible.',mods:['rival_lv_up','killer_fwd','coach_boost','super_gk']},
  {lv:5,n:'Ascensión 5',d:'Inicias con 20💰 menos.',mods:['rival_lv_up','killer_fwd','coach_boost','super_gk','poor_start']},
  {lv:6,n:'Ascensión 6',d:'Pierdes 2 jugadores al ser derrotado.',mods:['rival_lv_up','killer_fwd','coach_boost','super_gk','poor_start','double_steal']},
  {lv:7,n:'Ascensión 7 — MÁXIMA',d:'Todo combinado + rivales con rasgos legendarios.',mods:['rival_lv_up','killer_fwd','coach_boost','super_gk','poor_start','double_steal','rival_traits']},
];

// ── Legacy Tree: permanent meta-progression unlocks ──
// Points earned: +1 per run completed, +1 per achievement unlocked, +2 per ascension level
export const LEGACY_TREE = {
  // Branch: Scouting
  scouting_1:  { id:'scouting_1',  branch:'scouting', n:'Ojeador Local',     i:'🔭', d:'Ves 1 stat extra del rival antes del partido.',          cost:1, tier:1, requires:null },
  scouting_2:  { id:'scouting_2',  branch:'scouting', n:'Red de Contactos',  i:'🌐', d:'El mercado muestra 1 jugador adicional.',                 cost:2, tier:2, requires:'scouting_1' },
  scouting_3:  { id:'scouting_3',  branch:'scouting', n:'Escuela de Datos',  i:'📊', d:'Ves la formación del rival antes del partido.',           cost:3, tier:3, requires:'scouting_2' },
  // Branch: Cantera (Youth Academy)
  cantera_1:   { id:'cantera_1',   branch:'cantera',  n:'Cantera Básica',    i:'🌱', d:'Titulares iniciales tienen +1 en un stat aleatorio.',     cost:1, tier:1, requires:null },
  cantera_2:   { id:'cantera_2',   branch:'cantera',  n:'Cantera Dorada',    i:'🌟', d:'10% chance de empezar con un wonderkid (stats altos).',   cost:2, tier:2, requires:'cantera_1' },
  cantera_3:   { id:'cantera_3',   branch:'cantera',  n:'Fábrica de Cracks', i:'🏭', d:'Empieza con 1 reserva extra (11 jugadores).',             cost:3, tier:3, requires:'cantera_2' },
  // Branch: Sponsors
  sponsor_1:   { id:'sponsor_1',   branch:'sponsor',  n:'Sponsor Local',     i:'💰', d:'+10 monedas al iniciar cada run.',                         cost:1, tier:1, requires:null },
  sponsor_2:   { id:'sponsor_2',   branch:'sponsor',  n:'Patrocinio Estatal',i:'🏦', d:'+20 monedas al iniciar cada run.',                         cost:2, tier:2, requires:'sponsor_1' },
  sponsor_3:   { id:'sponsor_3',   branch:'sponsor',  n:'Marca Global',      i:'🌍', d:'+30 monedas al iniciar cada run.',                         cost:3, tier:3, requires:'sponsor_2' },
  // Branch: Tactics
  tactics_1:   { id:'tactics_1',   branch:'tactics',  n:'Pizarrón Básico',   i:'📋', d:'Desbloquea la formación Diamante desde la run 1.',        cost:1, tier:1, requires:null },
  tactics_2:   { id:'tactics_2',   branch:'tactics',  n:'Visión Táctica',    i:'🧠', d:'Desbloquea Blitz y Tridente desde la run 1.',              cost:2, tier:2, requires:'tactics_1' },
  tactics_3:   { id:'tactics_3',   branch:'tactics',  n:'Maestro Táctico',   i:'🎓', d:'1 evento táctico extra por partido.',                      cost:3, tier:3, requires:'tactics_2' },
  // Branch: Charisma
  charisma_1:  { id:'charisma_1',  branch:'charisma', n:'Líder Nato',        i:'🗣', d:'+5 química inicial en cada run.',                          cost:1, tier:1, requires:null },
  charisma_2:  { id:'charisma_2',  branch:'charisma', n:'Ídolo del Barrio',  i:'❤️', d:'+10 moral inicial en cada partido.',                       cost:2, tier:2, requires:'charisma_1' },
  charisma_3:  { id:'charisma_3',  branch:'charisma', n:'Leyenda Viviente',  i:'👑', d:'Board events siempre ofrecen la mejor opción.',            cost:3, tier:3, requires:'charisma_2' },
  // Branch: Maestría (Card system)
  maestria_1:  { id:'maestria_1',  branch:'maestria', n:'Aprendiz Táctico',  i:'🎴', d:'+1 slot de carta táctica.',                                cost:1, tier:1, requires:null },
  maestria_2:  { id:'maestria_2',  branch:'maestria', n:'Estratega de Cartas',i:'🃏', d:'+1 slot de carta táctica adicional.',                     cost:2, tier:2, requires:'maestria_1' },
  maestria_3:  { id:'maestria_3',  branch:'maestria', n:'Gran Maestro',      i:'🎯', d:'Elige categoría del slot extra. Maestría de curses +25%.', cost:3, tier:3, requires:'maestria_2' },
};

export const LEGACY_BRANCHES = ['scouting','cantera','sponsor','tactics','charisma','maestria'];

// Calculate total legacy points from globalStats
export function calcLegacyPoints(gs) {
  const fromRuns = gs.totalRuns || 0;
  const fromAchievements = (gs.achievements || []).length;
  const fromAscension = (gs.ascensionLevel || 0) * 2;
  const fromMutators = gs.mutatorBonusTotal || 0;
  return fromRuns + fromAchievements + fromAscension + fromMutators;
}

// Calculate spent legacy points
export function calcSpentLegacy(gs) {
  const unlocked = gs.legacyUnlocks || [];
  return unlocked.reduce((sum, id) => sum + (LEGACY_TREE[id]?.cost || 0), 0);
}

// Check if a legacy node can be unlocked
export function canUnlockLegacy(gs, nodeId) {
  const node = LEGACY_TREE[nodeId];
  if (!node) return false;
  const unlocked = gs.legacyUnlocks || [];
  if (unlocked.includes(nodeId)) return false;
  if (node.requires && !unlocked.includes(node.requires)) return false;
  const available = calcLegacyPoints(gs) - calcSpentLegacy(gs);
  return available >= node.cost;
}

// Check if a legacy node is unlocked
export function hasLegacy(gs, nodeId) {
  return (gs.legacyUnlocks || []).includes(nodeId);
}

// ── Curses: negative effects with mastery system ──
// Play through a curse long enough and it transforms into a blessing
export const CURSES = [
  {
    id:'prensa_hostil', n:'Prensa Hostil', i:'📰', d:'-5 química por 3 partidos.',
    duration:3, fx:'chem_penalty', val:-5,
    masteryThreshold: 3,
    blessing: { id:'prensa_aliada', n:'Prensa Aliada', i:'📰', d:'+8 química permanente este run.', fx:'chem_bonus_permanent', val:8 },
  },
  {
    id:'lesion_cronica', n:'Lesión Crónica', i:'🩼', d:'Un jugador aleatorio pierde -1 en un stat.',
    duration:0, fx:'stat_loss', val:-1,
    masteryThreshold: 5,
    blessing: { id:'regeneracion', n:'Regeneración', i:'🩼', d:'+2 a un stat aleatorio a todos.', fx:'stat_boost_all', val:2 },
  },
  {
    id:'deuda', n:'Deuda con el Barrio', i:'💸', d:'-10 monedas por jornada hasta pagar.',
    duration:5, fx:'coin_drain', val:-10,
    masteryThreshold: 4,
    blessing: { id:'mecenas', n:'Mecenas del Barrio', i:'💸', d:'+15 monedas/jornada permanente.', fx:'coin_gain_permanent', val:15 },
  },
  {
    id:'nemesis', n:'Némesis', i:'😈', d:'Un rival específico se vuelve +3 más fuerte.',
    duration:0, fx:'rival_boost', val:3,
    masteryThreshold: 3, masteryCondition: 'beat_boosted_rival',
    blessing: { id:'cazador', n:'Cazador de Rivales', i:'😈', d:'+10% gol vs rivales ya vencidos.', fx:'beaten_rival_bonus', val:0.10 },
  },
  {
    id:'fatiga_mental', n:'Fatiga Mental', i:'😰', d:'Moral máxima reducida a 70 por 4 partidos.',
    duration:4, fx:'morale_cap', val:70,
    masteryThreshold: 4,
    blessing: { id:'mente_acero', n:'Mente de Acero', i:'😰', d:'Moral nunca baja de 50.', fx:'morale_floor_permanent', val:50 },
  },
  {
    id:'escandalo', n:'Escándalo Mediático', i:'📺', d:'Sin board events positivos por 3 partidos.',
    duration:3, fx:'no_good_events', val:0,
    masteryThreshold: 3,
    blessing: { id:'redencion', n:'Redención Mediática', i:'📺', d:'Board events siempre positivos.', fx:'all_positive_events', val:0 },
  },
];

// ── Player Archetypes (DEPRECATED — replaced by Manager Archetypes in archetypes.js) ──
// Kept for backward compatibility with existing saves
export const ARCHETYPES = [
  {
    id: 'crack', n: 'El Crack', i: '⭐', d: '+15% gol en jugada elaborada. -10% defensa.',
    fx: 'crack', statMod: { atkMult: 1.15, defMult: 0.90 },
    unlockReq: null, // Available from start
  },
  {
    id: 'muro_player', n: 'El Muro', i: '🧱', d: 'Reduce goles rivales en zona defensiva. +3 DEF.',
    fx: 'muro_player', statMod: { defBonus: 3 },
    unlockReq: null,
  },
  {
    id: 'motor', n: 'El Motor', i: '🔋', d: 'No pierde stamina. +recuperación de fatiga.',
    fx: 'motor', statMod: { tireless: true },
    unlockReq: 'cantera_1', // Requires legacy unlock
  },
  {
    id: 'lider', n: 'El Líder', i: '👑', d: '+5 química pasiva al equipo. Boost moral.',
    fx: 'lider', statMod: { chemBonus: 5 },
    unlockReq: 'charisma_1',
  },
  {
    id: 'pibe', n: 'El Pibe', i: '🌱', d: 'Stats bajos pero gana XP 2x más rápido. Alto potencial.',
    fx: 'pibe', statMod: { xpMult: 2.0 },
    unlockReq: 'cantera_2',
  },
];

// Get available archetypes based on legacy unlocks
export function getAvailableArchetypes(gs) {
  return ARCHETYPES.filter(a => !a.unlockReq || hasLegacy(gs, a.unlockReq));
}

export const ACHIEVEMENTS=[
  {id:'first_win',n:'Primera Victoria',d:'Gana tu primer partido',i:'⚽',check:g=>g.totalWins>=1},
  {id:'barrio_champ',n:'Rey del Barrio',d:'Asciende de Liga Barrio',i:'🏠',check:g=>g.bestLeague>=1},
  {id:'nacional',n:'Seleccionado',d:'Alcanza la Liga Nacional',i:'🇲🇽',check:g=>g.bestLeague>=3},
  {id:'mundial',n:'Estrella Mundial',d:'Alcanza la Liga Mundial',i:'🌍',check:g=>g.bestLeague>=5},
  {id:'galactico',n:'Leyenda Galáctica',d:'Gana la Liga Intergaláctica',i:'🛸',check:g=>g.bestLeague>=7},
  {id:'streak5',n:'Imparable',d:'Racha de 5 victorias',i:'🔥',check:g=>g.bestStreak>=5},
  {id:'streak10',n:'Invencible',d:'Racha de 10 victorias',i:'💎',check:g=>g.bestStreak>=10},
  {id:'runs5',n:'Veterano',d:'Completa 5 carreras',i:'🎖',check:g=>g.totalRuns>=5},
  {id:'runs10',n:'Maestro',d:'Completa 10 carreras',i:'👑',check:g=>g.totalRuns>=10},
  {id:'goals100',n:'Centenario',d:'Anota 100 goles totales',i:'💯',check:g=>g.totalGoals>=100},
  {id:'coins500',n:'Millonario',d:'Acumula 500 monedas totales',i:'💰',check:g=>g.totalCoins>=500},
  {id:'ascension1',n:'Ascendido',d:'Completa Ascensión 1',i:'⬆️',check:g=>g.ascensionLevel>=1},
  {id:'ascension3',n:'Curtido',d:'Completa Ascensión 3',i:'🔶',check:g=>g.ascensionLevel>=3},
  {id:'ascension7',n:'Perfección',d:'Completa Ascensión 7 (máxima)',i:'🏆',check:g=>g.ascensionLevel>=7},
  {id:'alien',n:'Contacto Extraterrestre',d:'Desbloquea a Zyx-7',i:'👽',check:g=>g.bestLeague>=7},
  {id:'legacy',n:'Salón de la Fama',d:'Tu primer jugador entra al Hall of Fame',i:'🌟',check:g=>(g.hallOfFame||[]).length>=1},
];
