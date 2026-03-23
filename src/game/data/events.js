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
