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
