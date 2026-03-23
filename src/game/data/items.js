export const TRAITS=[{n:'Líder',d:'+1 ATK/DEF a todos',fx:'team'},{n:'Goleador',d:'+3 ATK en remate',fx:'atk'},{n:'Muro',d:'+3 DEF defensiva',fx:'def'},{n:'Veloz',d:'+2 VEL robos',fx:'spd'},{n:'Creativo',d:'Más eventos tácticos',fx:'events'},{n:'Clutch',d:'+5 ATK si van perdiendo',fx:'clutch'},{n:'Tanque',d:'+4 DEF -1 VEL',fx:'tank'},{n:'Fantasma',d:'+3 ATK sorpresa',fx:'ghost'},{n:'Capitán',d:'Penales +20%',fx:'pen'},{n:'Promesa',d:'+50% XP',fx:'xp'},{n:'Sólido',d:'No se fatiga',fx:'tireless'},{n:'Bruto',d:'+2 ATK, foul chance',fx:'brute'}];

// ── FORMATIONS (Fut 7: 1 GK + 6 outfield) ──
export const FORMATIONS = [
  {
    id: 'muro',    n: 'Muro (1-4-2)',    i: '🛡',
    slots: ['GK','DEF','DEF','DEF','DEF','FWD','FWD'],
    desc: 'Fortaleza defensiva. Sacrificas peligro ofensivo.',
    mods: { atkMult: 0.75, defMult: 1.35, spdMult: 0.90 },
    tag: 'Muy defensiva',
  },
  {
    id: 'clasica', n: 'Clásica (1-2-2-2)',  i: '⚖️',
    slots: ['GK','DEF','DEF','MID','MID','FWD','FWD'],
    desc: 'Equilibrio entre ataque y defensa.',
    mods: { atkMult: 1.00, defMult: 1.00, spdMult: 1.00 },
    tag: 'Balanceada',
  },
  {
    id: 'diamante', n: 'Diamante (1-3-2-1)', i: '💎',
    slots: ['GK','DEF','DEF','DEF','MID','MID','FWD'],
    desc: 'Posesión y velocidad. GK más expuesto.',
    mods: { atkMult: 0.90, defMult: 1.10, spdMult: 1.30 },
    tag: 'Posesión',
  },
  {
    id: 'blitz',   n: 'Blitz (1-2-1-3)',   i: '⚡',
    slots: ['GK','DEF','DEF','MID','FWD','FWD','FWD'],
    desc: 'Ataque total. Tu defensa sufrirá.',
    mods: { atkMult: 1.35, defMult: 0.70, spdMult: 1.05 },
    tag: 'Muy ofensiva',
  },
];

// ── RELICS ──
export const RELICS = [
  // ── Common ──
  { id:'botines94',   n:'Botines del 94',       i:'👟', d:'Cada victoria da +3💰 extra.',               rarity:'common',  fx:'win_coins',     val:3 },
  { id:'corazon',     n:'Corazón de Barrio',    i:'❤️', d:'Si vas perdiendo al 45\', +10% gol en 2ª.',  rarity:'common',  fx:'comeback',      val:0.10 },
  { id:'mendez',      n:'Doctora Méndez',       i:'🩹', d:'Lesiones duran 1 partido menos.',             rarity:'common',  fx:'heal_fast',     val:1 },
  { id:'vestuario',   n:'Vestuario Unido',      i:'🔗', d:'La química nunca baja de 30.',               rarity:'common',  fx:'chem_floor',    val:30 },
  { id:'megafono',    n:'Megáfono de Don Miguel',i:'📣', d:'Moral mínima garantizada en 40.',           rarity:'common',  fx:'morale_floor',  val:40 },
  { id:'amuleto',     n:'Amuleto de la Abuela', i:'📿', d:'10% menos de lesiones.',                     rarity:'common',  fx:'injury_reduce', val:0.10 },
  { id:'trofeo',      n:'Mini Trofeo',          i:'🏆', d:'+2💰 por cada partido de racha.',             rarity:'common',  fx:'streak_coins',  val:2 },
  { id:'mochila',     n:'Mochila del Barrio',   i:'🎒', d:'Inicias cada partido con +5 moral.',          rarity:'common',  fx:'match_morale',  val:5 },

  // ── Uncommon ──
  { id:'prensa',      n:'Rueda de Prensa',      i:'📰', d:'+5💰 por cada objetivo completado.',          rarity:'uncommon',fx:'obj_bonus',     val:5 },
  { id:'reloj',       n:'Reloj del 94',         i:'⏱', d:'Siempre tienes 1 evento táctico extra.',       rarity:'uncommon',fx:'extra_event',   val:1 },
  { id:'blitz_boots', n:'Botas Relámpago',      i:'⚡', d:'Con formación Blitz: +8% chance de gol.',     rarity:'uncommon',fx:'formation_blitz',val:0.08 },
  { id:'muro_cement', n:'Cemento Táctico',      i:'🧱', d:'Con formación Muro: goles recibidos -1 (mín 0) por partido.', rarity:'uncommon',fx:'formation_muro',val:1 },
  { id:'diamante_key',n:'Llave de Diamante',    i:'💎', d:'Con formación Diamante: +5% posesión y evento extra.', rarity:'uncommon',fx:'formation_diamante',val:0.05 },
  { id:'scouting',    n:'Red de Ojeadores',     i:'🔭', d:'El mercado muestra 2 jugadores extra.',        rarity:'uncommon',fx:'market_extra',  val:2 },

  // ── Rare ──
  { id:'guantes',     n:'Guantes de Hierro',    i:'🧤', d:'Si pierdes 1-0 al 90\', el portero anula el gol.', rarity:'rare', fx:'gk_last_min', val:1 },
  { id:'cuaderno',    n:'Cuaderno del Profeta', i:'📋', d:'Ves stats del rival antes del partido.',      rarity:'rare',    fx:'scout_rival',   val:1 },
  { id:'clasico',     n:'El Clásico',           i:'🏟', d:'Al enfrentar al némesis: +15 moral inicial.',  rarity:'rare',    fx:'nemesis_boost', val:15 },
  { id:'doblaje',     n:'Doblete Legendario',   i:'🌟', d:'Si ganas 3-0 o más, un jugador aleatorio sube +1 en todas las stats.', rarity:'rare', fx:'blowout_boost', val:1 },
  { id:'sangre',      n:'Sangre y Arena',       i:'🩸', d:'Perder un partido otorga el doble de XP.',    rarity:'rare',    fx:'loss_xp',       val:2 },
  { id:'capitania',   n:'Brazalete Mágico',     i:'💛', d:'El capitán tiene +3 ATK/DEF/VEL en todo partido.', rarity:'rare', fx:'captain_boost', val:3 },

  // ── Cursed (starting relics — powerful but with a cost) ──
  { id:'maldicion',   n:'La Maldición del 94',  i:'💀', d:'Inicio: -10💰, pero +5 OVR a todos tus titulares.', rarity:'cursed', fx:'cursed_start',  val:5, cursed:true },
  { id:'doble_filo',  n:'Doble Filo',           i:'⚔️', d:'Cada gol que haces también sube la moral rival en 5.', rarity:'cursed', fx:'cursed_atk', val:5, cursed:true },
  { id:'pacto',       n:'Pacto del Barrio',     i:'🤝', d:'+20💰 de inicio, pero perder siempre roba 2 jugadores.', rarity:'cursed', fx:'cursed_steal', val:20, cursed:true },
];

// ── Starting relic pairs (one safe + one cursed) ──
export const STARTING_RELIC_PAIRS = [
  [
    { id:'botines94', n:'Botines del 94', i:'👟', d:'Cada victoria da +3💰 extra.', rarity:'common', fx:'win_coins', val:3 },
    { id:'maldicion', n:'La Maldición del 94', i:'💀', d:'Inicio: -10💰, pero +5 OVR a todos tus titulares.', rarity:'cursed', fx:'cursed_start', val:5, cursed:true },
  ],
  [
    { id:'mochila', n:'Mochila del Barrio', i:'🎒', d:'Inicias cada partido con +5 moral.', rarity:'common', fx:'match_morale', val:5 },
    { id:'pacto', n:'Pacto del Barrio', i:'🤝', d:'+20💰 de inicio, pero perder siempre roba 2 jugadores.', rarity:'cursed', fx:'cursed_steal', val:20, cursed:true },
  ],
  [
    { id:'corazon', n:'Corazón de Barrio', i:'❤️', d:'Si vas perdiendo al 45\', +10% gol en 2ª.', rarity:'common', fx:'comeback', val:0.10 },
    { id:'doble_filo', n:'Doble Filo', i:'⚔️', d:'Cada gol que haces también sube la moral rival en 5.', rarity:'cursed', fx:'cursed_atk', val:5, cursed:true },
  ],
];

// ── Pre-match node types ──
export const NODE_TYPES = {
  normal:  { id:'normal',  n:'Partido',       i:'⚽', d:'Partido de liga estándar.',               color:'#42a5f5' },
  elite:   { id:'elite',   n:'Duelo Élite',   i:'💀', d:'Rival mucho más fuerte. Recompensa: relic garantizada.', color:'#a855f7' },
  rest:    { id:'rest',    n:'Descanso',       i:'🏥', d:'Todos los titulares recuperan 30% fatiga y -1 lesión.', color:'#00e676' },
  training:{ id:'training',n:'Entrenamiento', i:'💪', d:'Sesiones de entrenamiento extra (3 slots en vez de 2).', color:'#ffd600' },
};

// Training options
export const TRAINING_OPTIONS = [
  {id:'atk',name:'Entrenamiento Ofensivo',stat:'atk',range:[1,3],cost:0,desc:'Mejora el ATK del jugador',fatigueCost:10},
  {id:'def',name:'Entrenamiento Defensivo',stat:'def',range:[1,3],cost:0,desc:'Mejora el DEF del jugador',fatigueCost:10},
  {id:'spd',name:'Velocidad',stat:'spd',range:[1,2],cost:0,desc:'Mejora la VEL del jugador',fatigueCost:8},
  {id:'sav',name:'Entrenamiento de Portero',stat:'sav',range:[1,3],cost:5,desc:'Mejora el PAR (solo porteros)',fatigueCost:10},
  {id:'rest',name:'Descanso',stat:'rest',range:[0,0],cost:0,desc:'Recupera 30% de fatiga',fatigueCost:0},
  {id:'all',name:'Entrenamiento Intensivo',stat:'all',range:[2,4],cost:10,desc:'+ATK/DEF/VEL, pero más fatiga',fatigueCost:20},
];
