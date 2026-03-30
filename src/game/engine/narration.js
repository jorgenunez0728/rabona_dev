import { pick } from './utils.js';

// Contextual match narration — extracted and expanded from helpers.js

const NARR = {
  goalHome: [
    (ctx) => `¡${ctx.scorer} pone el ${ctx.homeScore}-${ctx.awayScore}!`,
    (ctx) => `¡GOOOOL! ${ctx.scorerLast} no perdona`,
    (ctx) => `¡El balón al fondo de la red! ${ctx.scorerLast} marca`,
    (ctx) => `¡Tremendo gol de ${ctx.scorerLast}!`,
    (ctx) => ctx.assister ? `¡Asistencia de ${ctx.assisterLast} y gol de ${ctx.scorerLast}!` : `¡${ctx.scorerLast} define solo!`,
  ],
  goalAway: [
    (ctx) => `${ctx.rivalName} empata. Gol en contra.`,
    (ctx) => `Gol del rival. ${ctx.rivalName} aprieta el marcador.`,
    (ctx) => `💀 Gol en contra. Reacción necesaria.`,
    (ctx) => `El rival marca. ${ctx.awayScore}-${ctx.homeScore} parcial.`,
  ],
  chanceHome: {
    elaborada:    [(ctx) => `Jugada elaborada, ${ctx.scorerLast} busca el arco...`,
                   (ctx) => `Buen toque de balón, combinan para crear peligro`],
    contraataque: [(ctx) => `¡Contraataque veloz! ${ctx.scorerLast} corre al arco`,
                   (ctx) => `Transición rapidísima, llegan al área`],
    pelotaParada: [(ctx) => `Tiro libre peligroso...`,
                   (ctx) => `Córner al área, buscan el cabezazo`],
    tiroLejano:   [(ctx) => `${ctx.scorerLast} prueba desde lejos...`,
                   (ctx) => `Disparo lejano, el portero atento`],
    errorRival:   [(ctx) => `¡Error del rival! ${ctx.scorerLast} intercepta`,
                   (ctx) => `Mal pase del rival, oportunidad clara`],
  },
  chanceAway: [
    (ctx) => `${ctx.rivalName} presiona, llegan al área`,
    (ctx) => `Ataque del rival, peligro en nuestra zona`,
    (ctx) => `La defensa resiste el embate de ${ctx.rivalName}`,
  ],
  missHome: [
    () => 'Disparo que se va alto',
    () => 'Bien atajado por el portero rival',
    () => 'El defensa lo despeja en el último momento',
    () => 'Al palo... increíble',
  ],
  missAway: [
    () => 'Bien defendido, recuperamos posesión',
    () => 'El portero lo tiene controlado',
    (ctx) => `La defensa corta el ataque de ${ctx.rivalName}`,
  ],
  steal: [
    (ctx) => `¡Robo de balón! Presión alta recupera el balón`,
    (ctx) => `¡Recuperación excelente! Contraataque`,
    () => 'Presión alta y recuperamos el balón',
  ],
  momentumUp: [
    () => '🔥 El equipo empuja, se siente el momento',
    () => '🔥 Crecemos en el partido, dominamos',
    () => '🔥 El rival retrocede, los tenemos contra las cuerdas',
  ],
  momentumDown: [
    () => '⚠ El rival crece, nos cuesta salir',
    () => '⚠ Sufrimos, no encontramos espacios',
    () => '⚠ El rival domina esta fase del partido',
  ],
  halftime: [
    (ctx) => `🕐 Descanso: ${ctx.homeScore}-${ctx.awayScore}`,
  ],
  kickoff: [
    (ctx) => `⚽ Arranca — ${ctx.homeName || 'Halcones FC'} vs ${ctx.rivalName} [${ctx.formation}]`,
  ],
  finalWhistle: [
    (ctx) => `🏁 ¡Final! ${ctx.homeName || 'Halcones FC'} ${ctx.homeScore}-${ctx.awayScore} ${ctx.rivalName}`,
  ],
  card: [
    (ctx) => `🟨 ${ctx.minute}' ¡Tarjeta!`,
  ],
  injury: [
    (ctx) => `🏥 ${ctx.minute}' ${ctx.playerName} se lesiona`,
    (ctx) => `🏥 ${ctx.minute}' Lesión de ${ctx.playerName}, sale del campo`,
  ],
  rivalStrategyChange: [
    (ctx) => `📋 ${ctx.rivalName} cambia: ${ctx.strategyDesc}`,
  ],
  // ── Secret / Special narrations ──
  claseMagistral: [
    () => '🎓 Clase magistral. Esto fue una exhibición de fútbol puro.',
    () => '🎓 Perfección absoluta. El rival nunca tuvo una oportunidad real.',
    () => '🎓 Dominio total. Así se escribe la historia.',
  ],
  remontadaEpica: [
    () => '🔥 ¡REMONTADA ÉPICA! De las cenizas surge la gloria.',
    () => '🔥 Nadie creía... ¡pero este equipo nunca se rinde!',
    () => '🔥 Esto es para la historia. ¡Remontada increíble!',
  ],
  ultimoSuspiro: [
    () => '⏱ ¡GOL EN EL ÚLTIMO SUSPIRO! ¡Locura total en el estadio!',
    () => '⏱ ¡Al último minuto! Los aficionados no pueden creerlo.',
    () => '⏱ ¡Gol agónico! El destino tenía otros planes.',
  ],
};

function buildContext(base, extras = {}) {
  return {
    scorer: extras.scorer?.name || '',
    scorerLast: extras.scorer?.name?.split(' ').pop() || 'Crack',
    assister: extras.assister?.name || null,
    assisterLast: extras.assister?.name?.split(' ').pop() || null,
    rivalName: base.rivalName || 'Rival',
    homeScore: base.homeScore ?? 0,
    awayScore: base.awayScore ?? 0,
    minute: base.minute ?? 0,
    formation: base.formation || '',
    playerName: extras.player?.name || 'Un jugador',
    strategyDesc: extras.strategyDesc || '',
    ...extras,
  };
}

export function narrate(type, baseCtx, extras = {}) {
  const ctx = buildContext(baseCtx, extras);

  // For chance types, use the sub-category
  if (type === 'chanceHome' && extras.chanceType) {
    const templates = NARR.chanceHome[extras.chanceType] || NARR.chanceHome.elaborada;
    return pick(templates)(ctx);
  }

  const templates = NARR[type];
  if (!templates) return '';
  return pick(templates)(ctx);
}
