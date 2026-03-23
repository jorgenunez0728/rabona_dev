// ═══════════════════════════════════════
// GAME DATA CONSTANTS
// ═══════════════════════════════════════

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
  { id:'botines94',   n:'Botines del 94',      i:'👟', d:'Cada victoria da +3💰 extra.',          rarity:'common',  fx:'win_coins',    val:3 },
  { id:'guantes',     n:'Guantes de Hierro',   i:'🧤', d:'El portero nunca concede en el 90\'.',   rarity:'rare',    fx:'gk_last_min',  val:1 },
  { id:'cuaderno',    n:'Cuaderno del Profeta', i:'📋', d:'Ves stats del rival antes del partido.', rarity:'rare',    fx:'scout_rival',  val:1 },
  { id:'corazon',     n:'Corazón de Barrio',   i:'❤️', d:'Si vas 0-1 al 45\', +10% chance de gol.', rarity:'common',  fx:'comeback',     val:0.10 },
  { id:'mendez',      n:'Doctora Méndez',      i:'🩹', d:'Lesiones duran 1 partido menos.',        rarity:'common',  fx:'heal_fast',    val:1 },
  { id:'vestuario',   n:'Vestuario Unido',     i:'🔗', d:'La química nunca baja de 30.',           rarity:'common',  fx:'chem_floor',   val:30 },
  { id:'megafono',    n:'Megáfono de Don Miguel', i:'📣', d:'Moral mínima garantizada en 40.',     rarity:'common',  fx:'morale_floor', val:40 },
  { id:'prensa',      n:'Rueda de Prensa',     i:'📰', d:'+5💰 por cada objetivo completado.',     rarity:'rare',    fx:'obj_bonus',    val:5 },
  { id:'mochila',     n:'Mochila del Barrio',  i:'🎒', d:'Inicias cada partido con +5 moral.',     rarity:'uncommon',fx:'match_morale',  val:5 },
  { id:'reloj',       n:'Reloj del 94',        i:'⏱', d:'Siempre tienes 1 evento táctico extra.', rarity:'rare',    fx:'extra_event',  val:1 },
  { id:'amuleto',     n:'Amuleto de la Abuela',i:'📿', d:'10% menos de lesiones.',                rarity:'uncommon',fx:'injury_reduce', val:0.10 },
  { id:'trofeo',      n:'Mini Trofeo',         i:'🏆', d:'+2💰 por cada partido de racha.',        rarity:'uncommon',fx:'streak_coins',  val:2 },
];

export const FN='Memo,Chuy,Beto,Nacho,Paco,Rafa,Toño,Pipe,Lalo,Hugo,Iker,Leo,Gael,Said,Omar,Diego,Alan,Erik,Joel,Ivan,Santiago,Patricio,Emilio,Rodrigo,Fernando,Arturo,Salvador,Margarito,Valentín,Ulises,Néstor,Damián,Rubén,Gonzalo,Édgar,Adrián,Ismael,Saúl,Gerardo,Ezequiel,Armando,Raúl,Víctor,Gilberto,Sebastián,Mateo,Dante,Héctor,Cristian,Josué,Esteban,Ramiro,Tadeo,Fabian,Marcelo,Octavio,Renato,Bruno,Axel,Aldo,Benito,Camilo,Darío,Elías'.split(',');
export const LN='García,López,Hernández,Martínez,Rodríguez,Pérez,Sánchez,Ramírez,Torres,Flores,Cruz,Reyes,Morales,Ortiz,Vargas,Castillo,Fernández,Estrella,De la Rosa,Mendoza,Ríos,Fuentes,Acosta,Aguilar,Navarro,Ponce,Guerrero,Medina,Delgado,Romero,Salazar,Vega,Ibarra,Orozco,Contreras,Cervantes,Domínguez,Ávila,Montes,Espinosa,Valencia,Paredes,Lozano,Herrera,Solís,Villanueva,Cisneros,Cárdenas,Bravo,Luna,Ángeles,Barrera,Trejo,Sandoval,Pineda,Rosas,Bautista,Carrillo,Duarte,Quiroz,De León,Nava,Chávez,Pacheco'.split(',');
export const NK='El Tanque,Flash,El Mago,Chuletón,Pared,Máquina,Fantasma,El Jefe,Cohete,Pulga,Toro,Gato,Halcón,Rayo,Muralla,Tigre,La Bala,Pirata,El Poeta,Dinamita,Zurdo,Turbo,El Ruso,Pantera,Cometa,Misil,El Flaco,Cacique,Manos de Seda,Pitbull,Locomotora,Trueno,Terremoto,El Científico,Volcán,Torpedo,Vikingo,Samurái,Cañón,Relámpago'.split(',');

export const _usedNames = new Set();

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

export const STADIUMS=[
  {n:'Cancha Llanera "El Potrero"',d:'Pasto irregular, una portería sin red. Charcos cuando llueve.',x:'⏰ $50 por equipo · 1 hora · Sin árbitro ni líneas',c:'#8d6e63'},
  {n:'Campo Municipal #3',d:'Cancha de tierra con gradas de concreto pelón.',x:'🚿 Vestidores disponibles · Sin agua caliente',c:'#78909c'},
  {n:'Estadio "El Coloso del Norte"',d:'15,000 localidades. Pasto sintético de segunda.',x:'📺 Transmisión local · Hay tienda de playeras pirata',c:'#5c6bc0'},
  {n:'Estadio Nacional',d:'65,000 almas rugiendo. Pasto impecable.',x:'🏟 Cobertura nacional · VAR activo · Mosca con el offside',c:'#43a047'},
  {n:'Arena Continental',d:'Techo retráctil. Pantallas LED perimetrales.',x:'🌎 Transmisión continental · Camerinos de lujo',c:'#1e88e5'},
  {n:'World Stadium Tokyo',d:'Tecnología holográfica. 90,000 asientos flotantes.',x:'🌍 500M espectadores · Drones de cámara · Repetición 360°',c:'#ffd600'},
  {n:'Nebula Arena — Estación Orbital',d:'Gravedad artificial al 95%. El balón flota ligeramente.',x:'🛸 Oxígeno incluido · Sin viento · Espectadores de 47 galaxias',c:'#e040fb'},
];

export const LEAGUES=[
  {n:'Liga Barrio',i:'🏠',lv:[1,5],m:8,rb:4},
  {n:'Liga Municipal',i:'🏛',lv:[4,8],m:8,rb:7},
  {n:'Liga Estatal',i:'🏟',lv:[7,12],m:10,rb:10},
  {n:'Liga Nacional',i:'🇲🇽',lv:[10,15],m:10,rb:13},
  {n:'Liga Continental',i:'🌎',lv:[13,17],m:10,rb:16},
  {n:'Liga Mundial',i:'🌍',lv:[15,19],m:12,rb:18},
  {n:'Liga Intergaláctica',i:'🛸',lv:[17,22],m:7,rb:21,cup:true},
];

export const CUP_STAGES=['group','semi','final'];
export const CUP_RIVAL_NAMES=['Nova Stellaris','Andrómeda FC','Orión United','Nebula Rangers','Cosmos XI','Quasar City'];

export function initCupState(){
  const groupTeams=[
    {name:'Halcones',you:true,w:0,d:0,l:0,gf:0,ga:0},
    ...CUP_RIVAL_NAMES.slice(0,3).map(n=>({name:n,you:false,w:0,d:0,l:0,gf:0,ga:0}))
  ];
  return {stage:'group',groupTable:groupTeams,matchInStage:0,bracket:{semi1:null,semi2:null,final:null},
    semiFoe:null,finalFoe:null,eliminated:false,champion:false};
}

export const RIVAL_NAMES=[
  ['Los Panaderos','Chamacos FC','Dep. Herreros','Taquería Utd','Mecánicos FC'],
  ['Municipal FC','Atl. Bomberos','Club Mercado','Inter Vecinos','Taxistas FC'],
  ['Rayados','Potros FC','Águilas Reales','Guerreros','Titanes FC','Halcones B'],
  ['Azteca FC','Club Industrial','Pumas Norte','Reyes del Sur','Centinelas','Jaguares'],
  ['Estrellas','Cóndores Andinos','Jaguares Caribe','Ciclones FC','Leyendas','Quetzales'],
  ['World United','Dragones Asia','Leones Europa','Faraones FC','Samurai FC','Berserkers','Vikings FC'],
  ['Nebulosa FC','Andrómeda XI','Aliens United','Nova Galáctica','Dark Matter FC','Supernova','Quantum FC'],
];

export const RIVAL_COACHES=[
  {n:'Don Pepe',i:'🍞',a:'Muro de Pan'},
  {n:'La Abuela',i:'👵',a:'Bendición Divina'},
  {n:'El Ingeniero',i:'🔧',a:'Táctica Perfecta'},
  {n:'Mister X',i:'🎩',a:'Impredecible'},
  {n:'El Profe',i:'📚',a:'Disciplina Total'},
];

export const NEMESIS={
  miguel:{n:'"El Cacique" Paredes',i:'🦅',d:'Tu rival desde el barrio. Siempre un paso adelante.',story:'Creció en la misma cancha que Don Miguel.',a:'Veterano: +2 a todo',boost:{atk:2,def:2,spd:1}},
  bestia:{n:'"El Cirujano" Delgado',i:'🔪',d:'Preciso donde tú eres caótico.',story:'Fue compañero de La Bestia.',a:'Precisión: +4 DEF, ataque quirúrgico',boost:{atk:1,def:4,spd:1}},
  lupe:{n:'"El Patrón" Sandoval',i:'🎩',d:'Machista, millonario, compra todo.',story:'Le dijo a Doña Lupe que se fuera a la cocina.',a:'Billetera: Equipo caro, +3 ATK',boost:{atk:3,def:2,spd:0}},
  profeta:{n:'"El Chamán" Orozco',i:'🌀',d:'Entrena con brujería y superstición.',story:'Donde El Profeta ve datos, El Chamán ve signos.',a:'Místico: Impredecible, +2 VEL',boost:{atk:1,def:1,spd:3}},
  chispa:{n:'"El Tanque" Ibarra',i:'🪖',d:'Lento, pesado, imbatible.',story:'Cada vez que La Chispa corría, El Tanque estaba ahí.',a:'Blindaje: +5 DEF, muro total',boost:{atk:0,def:5,spd:0}},
  fantasma:{n:'"El Detective" Mora',i:'🕵️',d:'Te conoce mejor de lo que te conoces tú.',story:'Lleva 3 torneos persiguiendo al Fantasma.',a:'Vigilante: Conoce tu táctica',boost:{atk:2,def:3,spd:1}},
  moneda:{n:'"El Jeque" Al-Rashid',i:'💎',d:'Dinero ilimitado. Compra estrellas.',story:'Donde La Moneda ahorra, El Jeque gasta.',a:'Petrodólares: +3 todo',boost:{atk:3,def:3,spd:2}},
  zyx7:{n:'Kx-9 ("El Heraldo")',i:'🤖',d:'IA rival de otra galaxia.',story:'Zyx-7 fue enviado a aprender. Kx-9 a ganar.',a:'Algoritmo: +4 DEF, +2 ATK',boost:{atk:2,def:4,spd:1}},
};

export const NEMESIS_PORTRAIT_IDX={miguel:0,bestia:1,lupe:2,profeta:3,chispa:4,fantasma:5,moneda:6,zyx7:7};

export function getNemesis(coachId) {
  return NEMESIS[coachId] || NEMESIS.miguel;
}

export const COPA_NAMES=['Copa Vecinal','Copa Municipal','Copa del Estado','Copa Nacional','Copa Continental','Copa del Mundo','Copa Galáctica'];
export const COPA_RIVALS_PER_ROUND=[
  ['Barrio Stars','Calle FC'],['Municipal Select','Ciudad United'],['Estado XI','Regional FC'],
  ['Selección B','Nacional Reservas'],['América Select','Euro Stars'],['World All-Stars','Global XI'],['Galactic Legends','Nova Prime'],
];

export function initCopaState(league){
  return {active:true,round:0,maxRounds:3,league,eliminated:false,won:false,
    bracket:[
      {name:COPA_RIVALS_PER_ROUND[Math.min(league,6)][0],beaten:false},
      {name:COPA_RIVALS_PER_ROUND[Math.min(league,6)][1]||'Copa FC',beaten:false},
      {name:'???',beaten:false},
    ]};
}

export const CUTSCENES=[
  {title:'El Primer Paso',sub:'De la cancha llanera al campo municipal',quote:'"En el 94 también empezamos así, mijo. Unos chamacos mugrosos que nadie conocía."',detail:'"Recuerdo la primera vez que nos pusimos una playera con número. El Chato lloró."',icon:'👴'},
  {title:'La Ciudad Nos Mira',sub:'Del municipio al estadio estatal',quote:'"Ya salimos en el periódico local. Bueno, en una esquinita de la sección de deportes."',detail:'"En el 94, cuando llegamos a estatal, Don Roque me dijo: ya no son un equipo de barrio."',icon:'📰'},
  {title:'Orgullo Nacional',sub:'Del estado a la liga nacional',quote:'"Esto ya es otro nivel, mijo. Aquí juegan los que sueñan en grande."',detail:'"En el 94 nos quedamos aquí. Esta fue la puerta que nunca pudimos cruzar. Tú... tú vas a cruzarla."',icon:'🇲🇽'},
  {title:'Más Allá de las Fronteras',sub:'De México al continente americano',quote:'"¿Sabes qué se siente cuando un equipo de barrio juega contra los grandes de América?"',detail:'"Nunca llegamos tan lejos. Esto es territorio nuevo, mijo."',icon:'🌎'},
  {title:'El Mundo Es Nuestro',sub:'Del continente al escenario mundial',quote:'"Hay millones de equipos en el mundo. MILLONES. Y nosotros estamos aquí."',detail:'"Me acuerdo de cuando la portería era dos piedras. Ahora mira dónde estamos."',icon:'🌍'},
  {title:'Las Estrellas Nos Esperan',sub:'De la Tierra a la Liga Intergaláctica',quote:'"Mijo... ya no hay palabras. Un equipo de barrio mexicano jugando entre las estrellas."',detail:'"En el 94, soñé que llegábamos lejos. Pero nunca soñé ESTO."',icon:'🛸'},
];

export const EVENTS=[
  {n:'⚽ TIRO DE ESQUINA',d:'Córner a favor — la defensa rival se amontona en el área.',o:[{n:'Centro directo',d:'Cabezazo al arco (40%)',c:.4,i:'🎯'},{n:'Córner corto',d:'Crear espacio, jugar por fuera',c:.12,i:'↗'},{n:'Segundo palo',d:'Sorpresa al poste lejano (25%, riesgo contra)',c:.25,i:'💫',r:1}]},
  {n:'⚽ TIRO LIBRE',d:'Falta peligrosa al borde del área grande.',o:[{n:'Disparo directo',d:'Buscar el ángulo (30%)',c:.3,i:'💥'},{n:'Centro al área',d:'Buscar cabezazo (35%)',c:.35,i:'⚽'},{n:'Jugada ensayada',d:'Riesgo calculado (20%)',c:.2,i:'🎭'}]},
  {n:'⚡ CONTRAATAQUE',d:'Recuperación rápida, superioridad numérica.',o:[{n:'Pase al espacio',d:'Si hay velocidad, casi gol (50%)',c:.5,i:'🏃',sp:1},{n:'Conducir y tirar',d:'Más seguro, definir solo (35%)',c:.35,i:'⚡'},{n:'Esperar apoyo',d:'No arriesgar, mantener posesión',c:0,i:'⏳'}]},
  {n:'‼️ PENAL',d:'¡El árbitro señala el punto de penalti!',o:[{n:'Potencia al centro',d:'Con todo, riesgo de fallo (70%)',c:.7,i:'💥'},{n:'Colocado a un lado',d:'Más seguro, técnica pura (80%)',c:.8,i:'🎯'},{n:'Panenka',d:'Estilo puro, humillar al portero (50%)',c:.5,i:'🎭'}]},
  {n:'🏥 LESIÓN EN CANCHA',d:'Un jugador se resiente de la pierna.',o:[{n:'Que siga jugando',d:'Aguanta, pero puede empeorar',c:0,i:'💪'},{n:'Tratamiento rápido',d:'Pierde 2 minutos de juego',c:0,i:'🩹'}]},
  {n:'🟨 JUGADA POLÉMICA',d:'El árbitro duda, los jugadores protestan.',o:[{n:'Protestar al árbitro',d:'Puede salir a favor... o tarjeta',c:.3,i:'😤'},{n:'Aceptar y seguir',d:'Mantener la calma',c:0,i:'🤝'}]},
  {n:'🌧️ CAMBIO DE CLIMA',d:'Empieza a llover. El pasto se pone resbaloso.',o:[{n:'Juego directo',d:'Pelotazos largos (25% gol)',c:.25,i:'⬆'},{n:'Posesión segura',d:'No arriesgar con el pasto mojado',c:.1,i:'↔'},{n:'Presión total',d:'Aprovechar el caos (35%)',c:.35,i:'🔥'}]},
];

// Tactical events for halftime
export const TACTICS = EVENTS;

export const PN={GK:'POR',DEF:'DEF',MID:'MED',FWD:'DEL'};
export const PC={GK:'gk',DEF:'df',MID:'md',FWD:'fw'};
export const POS_ORDER={GK:0,DEF:1,MID:2,FWD:3};
export const POS_COLORS={GK:'#ffc107',DEF:'#448aff',MID:'#00e676',FWD:'#ff1744'};
export const POS_ICON_IDX={GK:0,DEF:1,MID:2,FWD:3};

// Design system
export const T={
  bg:'#0D1117', bg1:'#161B22', bg2:'#21262D', bg3:'#30363D',
  tx:'#E6EDF3', tx2:'#8B949E', tx3:'#484F58',
  win:'#3FB950', lose:'#F85149', draw:'#D29922', info:'#58A6FF', gold:'#FFD700',
  accent:'#00C853', purple:'#A855F7', border:'rgba(255,255,255,0.06)',
};

export const CARD_TIERS = {
  normal: { bg: 'linear-gradient(135deg,rgba(20,30,58,0.95),rgba(26,39,68,0.95))', border: 'rgba(255,255,255,0.08)', glow: 'none' },
  rare: { bg: 'linear-gradient(135deg,#1a1030,#2d1a4a)', border: 'rgba(168,85,247,0.3)', glow: '0 0 20px rgba(168,85,247,0.15)' },
  legendary: { bg: 'linear-gradient(135deg,#2a2510,#3a3215)', border: 'rgba(255,215,0,0.4)', glow: '0 0 30px rgba(255,215,0,0.2)' },
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

// Personalities for players
export const PERSONALITIES = [
  {n:'Líder',i:'🦅',d:'Motiva al equipo',fx:'mentor'},
  {n:'Ambicioso',i:'🔥',d:'Exige titularidad',fx:'ambitious'},
  {n:'Leal',i:'❤️',d:'Mejora con juego continuo',fx:'loyal'},
  {n:'Conflictivo',i:'😤',d:'Puede crear fricciones',fx:'conflictive'},
  {n:'Profesional',i:'📋',d:'Sin drama, solo trabaja',fx:'professional'},
  {n:'Egocéntrico',i:'💎',d:'Mejor cuando gana, peor cuando pierde',fx:'egocentric'},
];

// Match objectives
export const MATCH_OBJECTIVES = [
  {n:'Sin encajar',d:'No recibir goles',r:{coins:10,xp:5},check:(ps,rs)=>rs===0},
  {n:'Goleada',d:'Ganar por 3+',r:{coins:15,xp:8},check:(ps,rs)=>ps-rs>=3},
  {n:'Remontar',d:'Ganar desde abajo',r:{coins:20,xp:10},check:(ps,rs,data)=>ps>rs&&data.wentBehind},
  {n:'Posesión',d:'Más del 60% de posesión',r:{coins:8,xp:4},check:(ps,rs,data)=>data.possPct>=60},
  {n:'Moral alta',d:'Terminar con moral >70',r:{coins:10,xp:5},check:(ps,rs,data)=>data.finalMorale>=70},
];

// Board events
export const BOARD_EVENTS = [
  {who:'👴 Don Miguel',text:'"Mijo, hay unos chavos del barrio que quieren entrenar con nosotros. Sin sueldo, solo por aprender. ¿Los aceptamos?"',cat:'miguel',a:{l:'Bienvenidos',e:{chem:5}},b:{l:'No hay lugar',e:{coins:10}},chance:0.7,minMatch:1},
  {who:'🏛 La Directiva',text:'El patrocinador quiere que uses su camiseta horrible. A cambio: dinero.',cat:'board',a:{l:'Aceptar (💰)',e:{coins:20,chem:-5}},b:{l:'Rechazar',e:{chem:5}},chance:0.6,minMatch:2},
  {who:'📰 La Prensa',text:'"¿Qué opinas del árbitro del último partido?"',cat:'press',a:{l:'Criticarlo',e:{chem:5,coins:-5}},b:{l:'Sin comentarios',e:{coins:5}},chance:0.5,minMatch:1},
  {who:'👥 El Vestuario',text:'Dos jugadores se pelearon en el entrenamiento. El ambiente está tenso.',cat:'locker',a:{l:'Intervenir',e:{chem:8},fx:'boostRandom'},b:{l:'Dejar que se resuelva',e:{chem:-5,coins:5}},chance:0.6,minMatch:2},
  {who:'📣 La Afición',text:'Los fans organizaron una cena para el equipo. ¿Asisten?',cat:'fans',a:{l:'Con todo',e:{chem:10},fx:'fatigueAll5'},b:{l:'Solo un rato',e:{chem:3}},chance:0.5,minMatch:3},
  {who:'💰 Oportunidad',text:'Un agente ofrece comprar a tu peor reserva. Buen dinero.',cat:'opportunity',a:{l:'Vender',e:{coins:25},fx:'sellWorstReserve'},b:{l:'Quedarnos',e:{}},chance:0.4,minMatch:2},
  {who:'📣 Patrocinador',text:'"Queremos financiar un torneo amistoso. Expone a tus jugadores."',cat:'opportunity',a:{l:'Participar',e:{coins:15},fx:'friendlyRisk'},b:{l:'Declinar',e:{}},chance:0.35,minMatch:3},
  {who:'🏆 La Copa',text:'¡Una invitación a la copa paralela! El formato es brutal: eliminar o ser eliminado.',cat:'copa',a:{l:'¡Inscribirse!',e:{},fx:'startCopa'},b:{l:'No arriesgar',e:{coins:5}},chance:0.3,minMatch:3,oncePer:true},
  {who:'👴 Don Miguel',text:'"Tengo un contacto. Puede ver al rival y darnos info. ¿Lo usamos?"',cat:'miguel',a:{l:'Sí, necesitamos ventaja',e:{},fx:'scoutBonus'},b:{l:'Ganar limpio',e:{chem:5}},chance:0.4,minMatch:4},
  {who:'🏛 La Directiva',text:'La directiva exige resultados. Si no mejoras, habrá consecuencias.',cat:'board',a:{l:'Aguantar la presión',e:{chem:-3}},b:{l:'Pedir tiempo',e:{coins:-10,chem:5}},chance:0.5,minMatch:4},
];

export function getBoardEvents(game) {
  const mn = game.matchNum || 0;
  return BOARD_EVENTS.filter(ev => {
    if (ev.minMatch && mn < ev.minMatch) return false;
    if (ev.oncePer && game.usedBoardEvents?.includes(ev.who)) return false;
    if (ev.needCopa && !game.copa) return false;
    if (ev.minCoins && game.coins < ev.minCoins) return false;
    return Math.random() < (ev.chance || 0.5);
  }).slice(0, 2);
}

export function applyBoardEffect(gameState, effects, fxKey) {
  let g = { ...gameState };
  if (effects.coins) g.coins = Math.max(0, (g.coins || 0) + effects.coins);
  if (effects.chem) g.chemistry = Math.max(0, Math.min(99, (g.chemistry || 0) + effects.chem));

  if (fxKey === 'sellWorstReserve') {
    const reserves = g.roster.filter(p => p.role === 'rs').sort((a, b) => calcOvr(a) - calcOvr(b));
    if (reserves.length > 0) { g.roster = g.roster.filter(p => p.id !== reserves[0].id); g.coins += 15; }
  }
  if (fxKey === 'addBadPlayer') {
    const p = genPlayer('MID', 1, 3); p.role = 'rs';
    if (g.roster.length < 12) g.roster = [...g.roster, p];
  }
  if (fxKey === 'fatigueAll5') {
    g.roster = g.roster.map(p => p.role === 'st' ? { ...p, fatigue: Math.min(100, (p.fatigue || 0) + 15) } : p);
  }
  if (fxKey === 'boostRandom') {
    const starters = g.roster.filter(p => p.role === 'st');
    if (starters.length) {
      const idx = Math.floor(Math.random() * starters.length);
      g.roster = g.roster.map(p => p.id === starters[idx].id ? { ...p, atk: p.atk + 1, def: p.def + 1, spd: p.spd + 1 } : p);
    }
  }
  if (fxKey === 'loseReserve') {
    const reserves = g.roster.filter(p => p.role === 'rs');
    if (reserves.length > 1) { const r = reserves[Math.floor(Math.random() * reserves.length)]; g.roster = g.roster.filter(p => p.id !== r.id); }
  }
  if (fxKey === 'addLocalYouth') {
    const p = genPlayer(pick(['DEF', 'MID']), 1, 4); p.role = 'rs';
    if (g.roster.length < 12) g.roster = [...g.roster, p];
  }
  if (fxKey === 'friendlyRisk') {
    g.roster = g.roster.map(p => {
      if (p.role !== 'st') return p;
      const newFatigue = Math.min(100, (p.fatigue || 0) + 20);
      const injured = newFatigue > 85 && Math.random() < 0.15;
      return { ...p, fatigue: newFatigue, injuredFor: injured ? (p.injuredFor || 0) + 1 : (p.injuredFor || 0) };
    });
  }
  if (fxKey === 'startCopa') {
    const league = g.league || 0;
    g.copa = initCopaState(league);
  }
  if (fxKey === 'injuryRisk') {
    const starters = g.roster.filter(p => p.role === 'st');
    if (starters.length && Math.random() < 0.3) {
      const target = starters[Math.floor(Math.random() * starters.length)];
      g.roster = g.roster.map(p => p.id === target.id ? { ...p, injuredFor: (p.injuredFor || 0) + 1 } : p);
    }
  }
  return g;
}

// ── LEVEL UP CHOICES ──
export function getLevelUpChoices(player) {
  const pos = player.pos;
  const pool = [
    { id:'atk2',   n:'Rematador',   d:'+3 ATK',              apply: p => ({ ...p, atk: p.atk + 3 }) },
    { id:'def2',   n:'Roca',        d:'+3 DEF',              apply: p => ({ ...p, def: p.def + 3 }) },
    { id:'spd2',   n:'Cohete',      d:'+3 VEL',              apply: p => ({ ...p, spd: p.spd + 3 }) },
    { id:'atkdef', n:'Completo',    d:'+2 ATK, +1 DEF',      apply: p => ({ ...p, atk: p.atk + 2, def: p.def + 1 }) },
    { id:'defspd', n:'Lateral',     d:'+2 DEF, +1 VEL',      apply: p => ({ ...p, def: p.def + 2, spd: p.spd + 1 }) },
    { id:'atkspd', n:'Desequilibrio', d:'+2 ATK, +1 VEL, -1 DEF', apply: p => ({ ...p, atk: p.atk + 2, spd: p.spd + 1, def: Math.max(1, p.def - 1) }) },
    { id:'glass',  n:'Cañón',       d:'+5 ATK, -2 DEF',      apply: p => ({ ...p, atk: p.atk + 5, def: Math.max(1, p.def - 2) }) },
    { id:'wall',   n:'Bunker',      d:'+5 DEF, -2 ATK',      apply: p => ({ ...p, def: p.def + 5, atk: Math.max(1, p.atk - 2) }) },
    { id:'allround', n:'Todo Terreno', d:'+1 ATK, +1 DEF, +1 VEL', apply: p => ({ ...p, atk: p.atk + 1, def: p.def + 1, spd: p.spd + 1 }) },
  ];
  // GK-specific
  if (pos === 'GK') return [
    { id:'sav3', n:'Muralla',    d:'+4 PAR',               apply: p => ({ ...p, sav: p.sav + 4 }) },
    { id:'sav2', n:'Reflejos',   d:'+2 PAR, +2 DEF',       apply: p => ({ ...p, sav: p.sav + 2, def: p.def + 2 }) },
    { id:'savspd',n:'Libero',    d:'+2 PAR, +2 VEL',       apply: p => ({ ...p, sav: p.sav + 2, spd: p.spd + 2 }) },
  ];
  // Shuffle and pick 3 relevant to position
  const biased = pos === 'FWD'
    ? ['atk2','atkspd','glass','atkdef','allround']
    : pos === 'DEF'
    ? ['def2','wall','defspd','atkdef','allround']
    : ['allround','atkdef','defspd','atk2','def2'];
  const chosen = [];
  for (const id of biased) { const c = pool.find(x => x.id === id); if (c && chosen.length < 3) chosen.push(c); }
  while (chosen.length < 3) { const c = pool.find(x => !chosen.find(y => y.id === x.id)); if (c) chosen.push(c); else break; }
  return chosen.slice(0, 3);
}

// Helper: generate player
export function genPlayer(pos, minLv, maxLv) {
  const lv = rnd(minLv, maxLv);
  let name;
  let tries = 0;
  do { name = `${pick(FN)} ${pick(LN)}`; tries++; } while (_usedNames.has(name) && tries < 20);
  _usedNames.add(name);
  const trait = pick(TRAITS);
  const personality = pick(PERSONALITIES);
  const base = lv * 3 + rnd(2, 6);
  const isGK = pos === 'GK';
  return {
    id: Math.random().toString(36).slice(2),
    name, pos, lv,
    atk: isGK ? rnd(1, 3) : base + rnd(-2, 4),
    def: isGK ? base + rnd(0, 3) : base + rnd(-2, 4),
    spd: base + rnd(-3, 3),
    sav: isGK ? base + rnd(2, 6) : rnd(1, 3),
    xp: 0, xpNext: lv * 10 + 20,
    trait, evo: false, role: 'rs',
    personality, fatigue: 0, injuredFor: 0,
    consecutiveGames: 0, consecutiveBench: 0, gamesPlayed: 0,
  };
}

// Helpers
export function rnd(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function calcOvr(p) {
  if (p.pos === 'GK') return Math.round((p.def * 0.2 + p.sav * 0.6 + p.spd * 0.2));
  return Math.round((p.atk + p.def + p.spd) / 3);
}

export function effectiveStats(p, formationMods = null) {
  const fatigueMod = (p.fatigue || 0) > 70 ? 0.85 : (p.fatigue || 0) > 50 ? 0.93 : 1;
  const fm = formationMods || { atkMult: 1, defMult: 1, spdMult: 1 };
  let atk = Math.round(p.atk * fatigueMod * fm.atkMult);
  let def = Math.round(p.def * fatigueMod * fm.defMult);
  let spd = Math.round(p.spd * fatigueMod * fm.spdMult);
  let sav = Math.round((p.sav || 1) * fatigueMod);
  if (p.trait?.fx === 'tank') { def += 4; spd = Math.max(1, spd - 1); }
  if (p.trait?.fx === 'ghost') atk += 3;
  if (p.trait?.fx === 'tireless') { atk = Math.round(p.atk * fm.atkMult); def = Math.round(p.def * fm.defMult); spd = Math.round(p.spd * fm.spdMult); }
  if (p.trait?.fx === 'brute') atk += 2;
  return { atk, def, spd, sav };
}

export function effectiveStatsWithFormation(p, formation) {
  const mods = formation?.mods || { atkMult: 1, defMult: 1, spdMult: 1 };
  return effectiveStats(p, mods);
}

export function effectiveOvr(p) {
  const es = effectiveStats(p);
  if (p.pos === 'GK') return Math.round(es.def * 0.2 + es.sav * 0.6 + es.spd * 0.2);
  return Math.round((es.atk + es.def + es.spd) / 3);
}

export function avgStat(players, stat, formationMods = null) {
  if (!players?.length) return 5;
  return players.reduce((s, p) => s + (effectiveStats(p, formationMods)[stat] || p[stat] || 1), 0) / players.length;
}

export function applyRelicEffects(game, eventType, data = {}) {
  const relics = game.relics || [];
  let result = { ...data };
  if (eventType === 'win_coins' && relics.includes('botines94')) result.coinBonus = (result.coinBonus || 0) + 3;
  if (eventType === 'streak_coins' && relics.includes('trofeo')) result.coinBonus = (result.coinBonus || 0) + 2 * (game.streak || 0);
  if (eventType === 'morale_floor' && relics.includes('megafono')) result.moraleFloor = 40;
  if (eventType === 'chem_floor' && relics.includes('vestuario')) result.chemFloor = 30;
  if (eventType === 'match_morale_bonus' && relics.includes('mochila')) result.moraleBonus = (result.moraleBonus || 0) + 5;
  if (eventType === 'obj_bonus' && relics.includes('prensa')) result.objCoinMult = (result.objCoinMult || 1) + 0.5;
  if (eventType === 'injury_reduce' && relics.includes('amuleto')) result.injuryChanceMult = (result.injuryChanceMult || 1) * 0.9;
  if (eventType === 'heal_fast' && relics.includes('mendez')) result.healBonus = 1;
  return result;
}

export function teamGKRating(players) {
  const gk = players?.find(p => p.pos === 'GK' || p.tempGK);
  if (!gk) return 0;
  return effectiveStats(gk).sav;
}

export function teamPower(players) {
  if (!players?.length) return 10;
  const atk = avgStat(players, 'atk');
  const def = avgStat(players, 'def');
  const spd = avgStat(players, 'spd');
  return Math.round((atk + def + spd) / 3 * 10) / 10;
}

// Narration templates
const NARR = {
  goalHome: [
    (h, r, pl) => `¡${pick(pl)?.name || 'Un jugador'} pone el ${h.ps+1}-${h.rs} para ${h}!`,
    (h, r, pl) => `¡GOOOOL! ${pick(pl)?.name?.split(' ').pop() || 'Crack'} no perdona`,
    () => '¡El balón al fondo de la red!',
  ],
  goalAway: [
    (h, r) => `${r} empata. Nos lo complicaron.`,
    (h, r) => `Gol en contra. ${r} pone el marcador apretado.`,
    () => '💀 Gol del rival. Reacción necesaria.',
  ],
  atkBuild: [
    (h, r, pl) => `${pick(pl)?.name?.split(' ').pop() || ''} busca el arco...`,
    () => 'Ataque en marcha, buen toque de balón',
    (h, r, pl) => `Combinación entre ${pick(pl)?.name?.split(' ').pop() || 'titulares'}`,
  ],
  atkFail: [
    () => 'Disparo que se va alto',
    () => 'Bien atajado por el portero rival',
    () => 'El defensa lo despeja en el último momento',
  ],
  defGood: [
    (h, r, pl) => `${pick(pl)?.name?.split(' ').pop() || 'Defensa'} corta el ataque`,
    () => 'Bien defendido, recuperamos posesión',
    () => 'El portero lo tiene controlado',
  ],
  defBad: [
    (h, r) => `${r} presiona, nos cuesta salir`,
    () => 'La defensa cede terreno',
    () => 'Pelota peligrosa en nuestra área',
  ],
  steal: [
    (h, r, pl) => `¡Robo de balón de ${pick(pl)?.name?.split(' ').pop() || 'crack'}!`,
    () => '¡Recuperación excelente! Contraataque',
    () => 'Presión alta y recuperamos el balón',
  ],
};

export function narrate(type, home, rival, players) {
  const templates = NARR[type] || NARR.atkBuild;
  const fn = pick(templates);
  const ctx = { ps: 0, rs: 0 };
  return fn(home, rival, players || []) || '';
}

export function randomizeEvent(ev) {
  return { ...ev, o: [...ev.o].sort(() => Math.random() - 0.5) };
}

// Social Media
const SOCIAL_ACCOUNTS = [
  [
    { n: '@TioChuyFutbol', v: false, f: '234', av: '👴' },
    { n: '@LaComadreDeportiva', v: false, f: '89', av: '👩' },
    { n: '@FutbolDeBarro', v: false, f: '1.2K', av: '⚽' },
  ],
  [
    { n: '@DeportesMunicipal', v: true, f: '12K', av: '📰' },
    { n: '@ElChivoFutbolero', v: false, f: '3.4K', av: '🐐' },
    { n: '@FabrizioRomano', v: true, f: '18M', av: '📡' },
  ],
  [
    { n: '@EstatalDeportes', v: true, f: '45K', av: '🏛' },
    { n: '@CrackDelNorte', v: false, f: '23K', av: '⭐' },
    { n: '@FabrizioRomano', v: true, f: '18M', av: '📡' },
  ],
  [
    { n: '@TDNMéxico', v: true, f: '890K', av: '📺' },
    { n: '@TUDN', v: true, f: '2.1M', av: '🎙' },
    { n: '@FabrizioRomano', v: true, f: '18M', av: '📡' },
  ],
  [
    { n: '@ESPN_MX', v: true, f: '5.6M', av: '🎯' },
    { n: '@FutbolTotal', v: true, f: '8M', av: '🌎' },
    { n: '@FabrizioRomano', v: true, f: '18M', av: '📡' },
  ],
  [
    { n: '@BBC_Sport', v: true, f: '42M', av: '🌍' },
    { n: '@SkySports', v: true, f: '38M', av: '🔵' },
    { n: '@FabrizioRomano', v: true, f: '18M', av: '📡' },
  ],
  [
    { n: '@GalacticSports', v: true, f: '900M', av: '🛸' },
    { n: '@InterstellarFC', v: true, f: '2.1B', av: '🌌' },
    { n: '@FabrizioRomano', v: true, f: '18M', av: '📡' },
  ],
];

const LIVE_TEMPLATES = [
  (m, ps, rs) => `Min ${m}' — HAL ${ps}-${rs}. ¡El partido está abierto!`,
  (m) => `${m}' Caliente el partido ahora mismo 🔥`,
  (m, ps, rs) => ps > rs ? `${m}' Los Halcones mandan! ${ps}-${rs} 💙` : `${m}' El rival presiona, ${ps}-${rs}`,
  () => `¿Están viendo esto? 👀 Increíble lo que pasa en la cancha`,
  (m) => `Min ${m}' — ¡Qué partido tan intenso!`,
  (m, ps, rs) => `${m}' Marcador: HAL ${ps} - RIV ${rs} #EnVivo`,
  () => `Se me va el corazón con este partido 😅`,
];

export function generateLivePosts(league, minute, log, ps, rs, matchType) {
  if (minute < 5) return [];
  const accounts = SOCIAL_ACCOUNTS[Math.min(league, 6)];
  const posts = [];
  const numPosts = Math.min(3, Math.floor(minute / 15) + 1);
  for (let i = 0; i < numPosts; i++) {
    const acc = pick(accounts);
    const tmpl = pick(LIVE_TEMPLATES);
    posts.push({
      acc, text: tmpl(minute, ps, rs),
      likes: `${rnd(10, 999)}`, comments: rnd(1, 50), rt: rnd(0, 30),
      t: `${minute}'`, hot: ps !== rs && Math.random() < 0.3,
    });
  }
  return posts;
}

const POST_TEMPLATES = {
  win: [
    (hn, rn, ps, rs) => `¡¡VICTORIA!! ${hn} ${ps}-${rs} ${rn}. ¡Los Halcones siguen vivos! 🦅🔥`,
    (hn, rn, ps, rs) => `${ps}-${rs} y tres puntos para casa. ¡Eso es lo que necesitábamos!`,
    () => `El equipo del barrio no para. 💪 Orgullo total.`,
  ],
  loss: [
    (hn, rn, ps, rs) => `Perdimos ${ps}-${rs}. Duele, pero seguimos. 💙`,
    (hn, rn, ps, rs) => `${rn} ganó hoy ${rs}-${ps}. Hay que levantarse.`,
    () => `Partido difícil. El equipo lo dio todo. A recuperarse.`,
  ],
  draw: [
    (hn, rn, ps, rs) => `Empate ${ps}-${ps}. Un punto es un punto. 🤷`,
    () => `Reparto de puntos. Quedó en ${1}-${1}.`,
    () => `Empate intenso. El marcador no refleja lo que vimos.`,
  ],
  fabrizio: [
    (hn) => `Here we go! ${hn} — confirmado y acuerdo total. El mercado se mueve 📡`,
    () => `Fuentes confiables indican movimiento importante de fichajes ⚽`,
  ],
  streak: [
    (hn, rn, ps, rs, streak) => `${streak} victorias seguidas para ${hn}! Racha histórica 🔥🔥`,
  ],
};

export function generateSocialPosts(league, won, drew, rivalName, ps, rs, streak) {
  const accounts = SOCIAL_ACCOUNTS[Math.min(league, 6)];
  const posts = [];
  const type = won ? 'win' : drew ? 'draw' : 'loss';
  const templates = POST_TEMPLATES[type];
  for (let i = 0; i < Math.min(4, accounts.length + 1); i++) {
    const acc = pick(accounts);
    const tmpl = pick(templates);
    posts.push({
      account: acc,
      text: tmpl('Halcones', rivalName, ps, rs, streak),
      likes: `${rnd(100, 9999)}`,
      comments: rnd(5, 200),
      retweets: rnd(10, 500),
      sticker: null,
      time: `${rnd(1, 59)}m`,
    });
  }
  // Fabrizio special
  if (league >= 1 && Math.random() < 0.4) {
    const fab = pick(POST_TEMPLATES.fabrizio);
    posts.push({
      account: { n: '@FabrizioRomano', v: true, f: '18M', av: '📡' },
      text: fab('Halcones', rivalName),
      likes: `${rnd(5000, 50000)}`,
      comments: rnd(500, 5000),
      retweets: rnd(1000, 20000),
      sticker: null,
      time: `${rnd(1, 10)}m`,
    });
  }
  if (streak >= 3) {
    const streakTmpl = pick(POST_TEMPLATES.streak);
    posts.push({
      account: pick(accounts),
      text: streakTmpl('Halcones', rivalName, ps, rs, streak),
      likes: `${rnd(1000, 20000)}`,
      comments: rnd(100, 1000),
      retweets: rnd(200, 5000),
      sticker: null,
      time: `${rnd(1, 20)}m`,
    });
  }
  return posts;
}

// Kit colors for rival teams by league
export function getRivalKit(league) {
  const kits = [
    ['#c62828', '#b71c1c'],
    ['#6a1b9a', '#4a148c'],
    ['#1565c0', '#0d47a1'],
    ['#2e7d32', '#1b5e20'],
    ['#e65100', '#bf360c'],
    ['#37474f', '#263238'],
    ['#4a148c', '#880e4f'],
  ];
  return kits[league % kits.length];
}

// Pitch images (we'll generate gradient-based ones)
export const _pitchImgs = [];

// Legends pool
export const LEGENDS = [
  {name:'El Maestro Pelé',pos:'FWD',trait:{n:'Legendario',d:'Clase mundial',fx:'atk'},bonus:{atk:8,def:3,spd:5},story:'Una aparición sobrenatural en tu cancha.'},
  {name:'La Muralla Beckenbauer',pos:'DEF',trait:{n:'Kaiser',d:'Domina la defensa',fx:'def'},bonus:{atk:2,def:9,spd:3},story:'El kaiser apareció para una última batalla.'},
  {name:'El Maradona del Barrio',pos:'MID',trait:{n:'Dios',d:'El mejor de todos',fx:'ghost'},bonus:{atk:7,def:4,spd:8},story:'Dicen que jugó en el barrio hace 30 años.'},
];

// Career mode data
export const CAREER_CAST = [
  {id:'manos',n:'Manos',role:'Agente',i:'🤝'},
  {id:'depredador',n:'El Depredador',role:'Rival',i:'⚔️'},
  {id:'doctora',n:'Doctora Méndez',role:'Médico',i:'🏥'},
  {id:'buitre',n:'El Buitre',role:'Periodista',i:'📰'},
  {id:'familia',n:'La Familia',role:'Apoyo',i:'❤️'},
  {id:'miguel',n:'Don Miguel',role:'Mentor',i:'👴'},
];

export const CAREER_TEAMS = [
  'Barrio FC', 'Municipal Atlético', 'Club Estatal', 'Nacional United',
  'Continental Stars', 'World FC', 'Galactic Legends',
];

export const ALL_CAREER_CARDS = [
  {who:'🤝 Manos',text:'"Hay una oferta del equipo Municipal. No es mucho, pero es profesional."',cast:'manos',a:{l:'Aceptar',e:{rel:5,fam:10}},b:{l:'Esperar mejor oferta',e:{rel:-5}},minAge:17},
  {who:'⚔️ El Depredador',text:'"En el próximo partido, voy a anularte. Disfruta el último partido como titular."',cast:'depredador',a:{l:'Ignorarlo',e:{men:5}},b:{l:'Responderle',e:{fam:8,men:-3}},minAge:16},
  {who:'🏥 Doctora Méndez',text:'"Necesitas descanso. Tu cuerpo habla."',cast:'doctora',a:{l:'Escucharla',e:{fis:15,rend:-10}},b:{l:'Seguir jugando',e:{fis:-10,rend:5}},minAge:16},
  {who:'📰 El Buitre',text:'"¿Cómo te sientes con el entrenador? ¿Hay tensión?"',cast:'buitre',a:{l:'Sin comentarios',e:{rel:3}},b:{l:'Hablar claro',e:{fam:15,rel:-8}},minAge:17},
  {who:'❤️ La Familia',text:'"Llevas semanas sin visitarnos. ¿Todo bien?"',cast:'familia',a:{l:'Ir a verlos',e:{men:12,rend:-5}},b:{l:'Más adelante',e:{men:-8,fis:3}},minAge:16},
  {who:'👴 Don Miguel',text:'"¿Recuerdas por qué empezaste a jugar, mijo?"',cast:'miguel',a:{l:'"Por amor al juego"',e:{men:15,rend:5}},minAge:16},
  {who:'⚽ El Desafío',text:'Un rival te reta 1vs1 antes del partido. Humillarlo o no.',a:{l:'Aceptar',e:{fam:10,fis:-5}},b:{l:'Declinar',e:{rel:5}},minAge:16},
  {who:'💊 Oferta Sospechosa',text:'Un "representante" te ofrece una sustancia para mejorar el rendimiento.',a:{l:'Rechazar',e:{men:5,rel:5}},b:{l:'¿Y si...?',e:{rend:15,rel:-20}},minAge:18},
  {who:'🎯 Entrenamiento Extra',text:'El entrenador propone sesiones dobles. Más rendimiento, más desgaste.',a:{l:'Aceptar',e:{rend:8,fis:-10}},b:{l:'Solo lo necesario',e:{fis:5}},minAge:16},
  {who:'🌟 Oportunidad Grande',text:'Invitación a un torneo internacional. Tu equipo no quiere dejarte ir.',a:{l:'Ir igual',e:{fam:20,rel:-10}},b:{l:'Quedarse',e:{rel:10,men:-5}},minAge:18},
];

export const CAREER_CARDS_MIGUEL = [
  {who:'👴 Don Miguel',text:'"Mijo, llevas mucho tiempo en esto. ¿Sigues disfrutándolo?"',a:{l:'"Más que nunca"',e:{men:20,rend:5}},minAge:16},
  {who:'👴 Don Miguel',text:'"A veces hay que saber cuándo dar un paso atrás para dar dos hacia adelante."',a:{l:'Entendido',e:{men:10,fis:10}},minAge:18},
  {who:'👴 Don Miguel',text:'"La gente del barrio te sigue. Eso es lo que de verdad importa."',a:{l:'"Lo sé, Don Miguel"',e:{men:15,fam:5}},minAge:16},
];

export const MATCH_CARDS = {
  FWD: [
    {text:'Mano a mano con el portero, ¿qué haces?',a:{l:'Disparo potente',e:{rend:5},goal:0.6},b:{l:'Colocado',e:{},goal:0.45}},
    {text:'Pase de gol para un compañero o intentas el gol tú.',a:{l:'Asistencia',e:{rel:5},goal:0.3},b:{l:'Rematar',e:{fam:3},goal:0.55}},
    {text:'El defensa te hace falta brutal. ¿Cómo reaccionas?',a:{l:'Levantarte y seguir',e:{men:5}},b:{l:'Protestar',e:{fam:5,rel:-3}}},
    {text:'Última jugada, empate y solo tú en el área.',a:{l:'Definir tranquilo',e:{rend:8},goal:0.5},b:{l:'Picar al portero',e:{fam:10},goal:0.35}},
  ],
  DEF: [
    {text:'Delantero veloz en tu espalda, ¿lo cortas?',a:{l:'Entrada fuerte',e:{fis:-5},goal:-0.4},b:{l:'Posición',e:{rend:3},goal:-0.25}},
    {text:'El árbitro te llama la atención.',a:{l:'Aceptarlo',e:{rel:3}},b:{l:'Discutir',e:{fam:8,rel:-5}}},
    {text:'Tu portero sale mal. ¿Cubres tú?',a:{l:'Cubrir el arco',e:{rend:8},goal:-0.3},b:{l:'Esperar',e:{fis:3},goal:-0.1}},
    {text:'Penal a favor, ¿quién patea?',a:{l:'Yo lo pateo',e:{fam:5},goal:0.35},b:{l:'El delantero',e:{rel:5},goal:0.5}},
  ],
  MID: [
    {text:'Control de balón en zona peligrosa, ¿qué haces?',a:{l:'Filtrar pase',e:{rel:5},goal:0.3},b:{l:'Disparar desde fuera',e:{fam:5},goal:0.2}},
    {text:'El equipo está nervioso, ¿cómo lideras?',a:{l:'Hablar en cancha',e:{men:5,rend:3}},b:{l:'Con juego',e:{rend:8}}},
    {text:'Contragolpe 3vs2. ¿Aceleras o organizas?',a:{l:'Acelerar',e:{fis:-3},goal:0.45},b:{l:'Organizar',e:{rend:5},goal:0.25}},
    {text:'Falta táctica, te puede costar tarjeta.',a:{l:'Hacerla',e:{fis:-2},goal:-0.2},b:{l:'Dejar ir',e:{rel:3}}},
  ],
  GK: [
    {text:'Disparo al ángulo, ¿cómo reaccionas?',a:{l:'Vuelo completo',e:{fis:-5},goal:-0.5},b:{l:'Posición base',e:{rend:3},goal:-0.3}},
    {text:'Penal en contra.',a:{l:'Leer al rival',e:{rend:5},goal:-0.45},b:{l:'Adivinar',e:{fis:2},goal:-0.25}},
    {text:'Centro peligroso al área.',a:{l:'Salir a cortar',e:{rend:8,fis:-3},goal:-0.4},b:{l:'Quedarte en línea',e:{},goal:-0.2}},
    {text:'Error del defensa que deja solo al rival.',a:{l:'Cerrar el ángulo',e:{rend:5},goal:-0.35},b:{l:'Esperar el disparo',e:{fis:3},goal:-0.2}},
  ],
};

export const BAR_NAMES = ['Rendimiento', 'Físico', 'Relaciones', 'Fama', 'Mental'];
export const BAR_ICONS = ['⚽', '💪', '🤝', '⭐', '🧠'];
export const BAR_COLORS = ['#00e676', '#42a5f5', '#ff9800', '#ffd600', '#a78bfa'];

// Canvas sprite drawing
export function drawSprite(ctx, x, y, bodyCol, darkCol, frame, seed, isGK = false) {
  const s = 14;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + s + 2, s * 0.7, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body
  const bobY = Math.sin(frame * 0.12 + seed * 0.7) * 1.2;
  ctx.fillStyle = isGK ? '#ffc107' : bodyCol;
  ctx.fillRect(x - s * 0.5, y - s * 0.3 + bobY, s, s * 1.1);
  // Head
  ctx.fillStyle = '#f5c5a3';
  ctx.beginPath();
  ctx.arc(x, y - s * 0.5 + bobY, s * 0.42, 0, Math.PI * 2);
  ctx.fill();
  // Shorts
  ctx.fillStyle = darkCol;
  ctx.fillRect(x - s * 0.5, y + s * 0.6 + bobY, s * 0.45, s * 0.5);
  ctx.fillRect(x + s * 0.05, y + s * 0.6 + bobY, s * 0.45, s * 0.5);
  // Legs
  const legSwing = Math.sin(frame * 0.18 + seed) * 3;
  ctx.fillStyle = '#f5c5a3';
  ctx.fillRect(x - s * 0.35, y + s * 1.05 + bobY - legSwing, s * 0.28, s * 0.7);
  ctx.fillRect(x + s * 0.07, y + s * 1.05 + bobY + legSwing, s * 0.28, s * 0.7);
  // Boots
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(x - s * 0.38, y + s * 1.65 + bobY, s * 0.34, s * 0.28);
  ctx.fillRect(x + s * 0.05, y + s * 1.65 + bobY, s * 0.34, s * 0.28);
}