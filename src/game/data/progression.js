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
