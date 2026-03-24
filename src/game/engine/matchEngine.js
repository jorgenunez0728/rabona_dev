import { rnd, pick, avgStat, effectiveStats, teamGKRating, clamp } from './utils.js';
import { createPossessionState, resolvePossession, getPossessionPct } from './possession.js';
import { generateChanceType, shouldGenerateChance, resolveChance, pickScorer, pickAssister, CHANCE_TYPES } from './chances.js';
import { createMomentum, updateMomentum, getMomentumModifiers } from './momentum.js';
import { getTacticalModifiers, getFormationMatchup, HALFTIME_OPTIONS } from './tactics.js';
import { getRivalStrategy, getRivalModifiers } from './rivalAI.js';
import { createMatchStats, recordShot, recordChance, recordGoal, recordCard, recordCorner, recordFoul, recordInjury, recordMomentum, recordZone, recordPossession, getFinalStats } from './matchStats.js';
import { narrate } from './narration.js';
import { FORMATIONS } from '../data/items.js';
import { TACTICS } from '../data/events.js';
import { applyRelicEffects } from '../data/helpers.js';

/*
  Match Engine — Generator pattern

  Usage:
    const engine = simulateMatch(config);
    let result = engine.next();
    while (!result.done) {
      const event = result.value;
      // handle event (render UI, etc.)
      if (event.type === 'tactical_event' || event.type === 'halftime' || event.type === 'penalty') {
        result = engine.next(playerChoice);  // pass player's choice back
      } else {
        result = engine.next();
      }
    }
    const finalResult = result.value;  // { result, stats }
*/

export function* simulateMatch(config) {
  const {
    starters,
    roster,
    formation: formationId,
    relics = [],
    coach,
    rival,
    league = 0,
    chemistry = 50,
    captain,
    matchType = 'normal',
    playStyle = null,
    intensity = null,
  } = config;

  // Resolve formation
  const formation = FORMATIONS.find(f => f.id === formationId) || FORMATIONS[1];
  const formMods = formation.mods;

  // Build team objects
  const home = { name: 'Halcones', players: starters };
  const away = { name: rival.name, players: rival.players };

  // Initialize systems
  const possession = createPossessionState();
  const initialMorale = 50 + (applyRelicEffects({ relics }, 'match_morale_bonus').moraleBonus || 0)
    + (relics.includes('clasico') && matchType === 'nemesis' ? 15 : 0);
  const momentum = createMomentum(initialMorale);
  const stats = createMatchStats();
  const tacticalMods = getTacticalModifiers(formation, playStyle, intensity);
  const matchupMods = getFormationMatchup(formation.id, 'clasica');

  // Relic flags
  const hasGkLastMin = relics.includes('guantes');
  const hasMuroCement = relics.includes('muro_cement') && formationId === 'muro';
  const hasDiamanteKey = relics.includes('diamante_key') && formationId === 'diamante';
  const hasBlitzBoots = relics.includes('blitz_boots') && formationId === 'blitz';
  const hasScoutRival = relics.includes('cuaderno');
  const hasCaptainBoost = relics.includes('capitania') && captain;
  const captainBoostVal = hasCaptainBoost ? 3 : 0;
  const hasCorazon = relics.includes('corazon');

  // Coach bonuses
  const stealBonus = coach?.fx === 'steal' ? 0.12 : 0;
  const noFouls = coach?.fx === 'nofoul';

  // Difficulty
  const diffMod = league <= 1 ? 0.005 : league * 0.008;
  const chemMod = chemistry * 0.001;

  // Match state
  let homeScore = 0;
  let awayScore = 0;
  let minute = 0;
  let halftimeShown = false;
  let tacticalEventsShown = 0;
  let lastEventMin = -10;
  const extraEvents = (relics.includes('reloj') ? 1 : 0) + (hasDiamanteKey ? 1 : 0);
  const MAX_TACTICAL_EVENTS = 2 + extraEvents;
  let strategy = 'balanced';  // halftime strategy
  let stratMod = { atkMod: 0, defMod: 0 };
  let currentMomentum = { ...momentum };
  let currentPossession = { ...possession };
  let activePlayers = [...starters]; // Can change if injuries occur

  // Narration context helper
  const baseCtx = () => ({
    rivalName: away.name,
    homeScore,
    awayScore,
    minute,
    formation: formation.n,
  });

  // Yield kickoff event
  yield {
    type: 'kickoff',
    minute: 0,
    text: narrate('kickoff', baseCtx()),
    homeScore: 0,
    awayScore: 0,
  };

  // ══════════════════════════════════════════
  // MAIN MATCH LOOP
  // ══════════════════════════════════════════
  while (minute < 90) {
    minute += rnd(2, 4);
    if (minute > 90) minute = 90;

    // ─── HALFTIME ───
    if (minute >= 45 && !halftimeShown) {
      halftimeShown = true;
      currentMomentum = updateMomentum(currentMomentum, 'halftime');

      // Comeback relic check
      const comebackBonus = hasCorazon && homeScore < awayScore ? 0.10 : 0;

      const htChoice = yield {
        type: 'halftime',
        minute: 45,
        text: narrate('halftime', baseCtx()),
        homeScore,
        awayScore,
        momentum: currentMomentum.value,
        morale: currentMomentum.morale,
        options: HALFTIME_OPTIONS,
        comebackBonus,
      };

      const htOption = HALFTIME_OPTIONS[htChoice] || HALFTIME_OPTIONS[1];
      strategy = htOption.id;
      stratMod = htOption.stratMod;
      continue;
    }

    // ─── TACTICAL EVENTS ───
    if (tacticalEventsShown < MAX_TACTICAL_EVENTS
      && minute - lastEventMin >= rnd(18, 28)
      && minute > 10 && minute < 85) {
      lastEventMin = minute;
      tacticalEventsShown++;

      const availableTactics = TACTICS.filter(e =>
        !e.n.includes('PENAL') && !e.n.includes('LESIÓN'));
      const ev = randomizeEvent(pick(availableTactics));

      const choice = yield {
        type: 'tactical_event',
        minute,
        event: ev,
        homeScore,
        awayScore,
        momentum: currentMomentum.value,
        morale: currentMomentum.morale,
      };

      const eff = ev.o[choice]?.e || {};
      const opt = ev.o[choice] || {};

      // Apply tactical event effects
      if (eff.morale) {
        currentMomentum = updateMomentum(currentMomentum,
          eff.morale > 0 ? 'tactical_success' : 'tactical_fail');
      }

      // Card risk from event
      if (eff.cardRisk && Math.random() < eff.cardRisk) {
        recordFoul(stats, 'home');
        recordCard(stats, 'home', minute, pick(activePlayers));
        currentMomentum = updateMomentum(currentMomentum, 'card_own');
        yield { type: 'card', minute, team: 'home', text: narrate('card', baseCtx()) };
      }

      // Goal from tactical event
      const atkB = eff.atkBonus || opt.c || 0;
      const defP = eff.defPenalty || 0;
      if (atkB > 0 && Math.random() < atkB) {
        homeScore++;
        const scorer = pickScorer(activePlayers, CHANCE_TYPES.pelotaParada, formMods);
        const assister = pickAssister(activePlayers, scorer, CHANCE_TYPES.pelotaParada, formMods);
        recordGoal(stats, { minute, team: 'home', scorer, assister, chanceType: CHANCE_TYPES.pelotaParada });
        recordShot(stats, 'home', true);
        currentMomentum = updateMomentum(currentMomentum, 'goal');
        yield {
          type: 'goal', minute, team: 'home',
          scorer, assister,
          homeScore, awayScore,
          text: narrate('goalHome', baseCtx(), { scorer, assister }),
          chanceType: 'pelotaParada',
        };
      } else if (defP > 0 && Math.random() < defP) {
        awayScore++;
        recordGoal(stats, { minute, team: 'away', scorer: null, assister: null, chanceType: CHANCE_TYPES.pelotaParada });
        recordShot(stats, 'away', true);
        currentMomentum = updateMomentum(currentMomentum, 'goal_against');
        yield {
          type: 'goal', minute, team: 'away',
          scorer: null, assister: null,
          homeScore, awayScore,
          text: narrate('goalAway', baseCtx()),
          chanceType: 'pelotaParada',
        };
      }
      continue;
    }

    // ─── POSSESSION RESOLUTION ───
    const momMods = getMomentumModifiers(currentMomentum);
    const rivalStrat = getRivalStrategy({ homeScore, awayScore, minute, league });
    const rivalMods = getRivalModifiers(rivalStrat);

    const possResult = resolvePossession(currentPossession, home, away, {
      homeFormMods: formMods,
      momentumMod: momMods.possessionMod,
      chemistryMod: chemMod,
      stealBonus,
      scoutBonus: hasScoutRival ? 0.04 : 0,
      tacticsMod: {
        homePossBonus: tacticalMods.homePossBonus + (stratMod.atkMod || 0),
        awayPossBonus: rivalMods.rivalPossBonus || 0,
        counterBonus: (tacticalMods.counterBonus || 0) + (tacticalMods.counterWeakness || 0),
        rivalCounterBonus: tacticalMods.rivalCounterBonus || 0,
        defenseZoneBonus: tacticalMods.defenseZoneBonus || 0,
        midfieldZoneBonus: tacticalMods.midfieldZoneBonus || 0,
        attackZoneBonus: tacticalMods.attackZoneBonus || 0,
        possessionRetention: tacticalMods.possessionRetention || 0,
      },
    });

    currentPossession = possResult.state;

    // Record possession and zone stats
    recordPossession(stats, possResult.winner);
    recordZone(stats, possResult.zone);

    // Update momentum based on zone
    const momEvent = possResult.winner === 'home'
      ? (possResult.zone === 'attack' ? 'possession_attack'
        : possResult.zone === 'midfield' ? 'possession_mid'
        : 'possession_defense')
      : 'tick';
    currentMomentum = updateMomentum(currentMomentum, momEvent);

    // Record momentum periodically
    if (minute % 5 < 4) recordMomentum(stats, minute, currentMomentum.value);

    // ─── STEAL EVENT ───
    if (possResult.winner === 'home' && Math.random() < (tacticalMods.stealChance || 0.05)) {
      currentMomentum = updateMomentum(currentMomentum, 'steal');
      yield {
        type: 'steal', minute,
        text: narrate('steal', baseCtx()),
        zone: possResult.zone,
      };
    }

    // ─── CHANCE GENERATION ───
    const chanceIntensityMod = tacticalMods.intensityMod + (possResult.winner === 'home' ? (tacticalMods.offensiveOutput || 0) : (tacticalMods.rivalChanceBonus || 0));
    if (shouldGenerateChance(possResult, { intensityMod: chanceIntensityMod })) {
      const isHomeAttacking = possResult.winner === 'home';
      const attackTeam = isHomeAttacking ? home : away;
      const defendTeam = isHomeAttacking ? away : home;
      const attackFormMods = isHomeAttacking ? formMods : null;
      const defendFormMods = isHomeAttacking ? null : formMods;
      const team = isHomeAttacking ? 'home' : 'away';

      const chanceType = generateChanceType({
        zone: possResult.zone,
        isCounterAttack: possResult.isCounterAttack,
        ticksInZone: currentPossession.ticksInZone,
        momentumValue: isHomeAttacking ? currentMomentum.value : -currentMomentum.value,
        isTacticalEvent: false,
      });

      recordChance(stats, team);

      // Trait modifiers
      const clutchActive = !isHomeAttacking ? false :
        homeScore < awayScore && activePlayers.some(p => p.trait?.fx === 'clutch');
      const goleadorActive = isHomeAttacking &&
        activePlayers.some(p => p.trait?.fx === 'atk');

      const result = resolveChance(chanceType, attackTeam, defendTeam, {
        formMods: attackFormMods,
        rivalFormMods: defendFormMods,
        momentumMod: momMods.goalChanceMod * (isHomeAttacking ? 1 : -1),
        moraleMod: momMods.moraleMod * (isHomeAttacking ? 1 : -1),
        traitMods: { clutchActive, goleadorActive },
        relicMods: isHomeAttacking ? {
          blitzBonus: hasBlitzBoots ? 0.08 : 0,
          diamanteBonus: hasDiamanteKey ? 0.03 : 0,
        } : {},
        difficultyMod: isHomeAttacking ? diffMod * 0.5 : -diffMod,
        matchupMod: isHomeAttacking ? matchupMods[0] : matchupMods[1],
      });

      recordShot(stats, team, result.isOnTarget);

      if (result.isGoal) {
        if (isHomeAttacking) {
          homeScore++;
          const scorer = pickScorer(activePlayers, chanceType, formMods);
          const assister = pickAssister(activePlayers, scorer, chanceType, formMods);
          recordGoal(stats, { minute, team: 'home', scorer, assister, chanceType });
          currentMomentum = updateMomentum(currentMomentum, 'goal');

          yield {
            type: 'goal', minute, team: 'home',
            scorer, assister,
            homeScore, awayScore,
            text: narrate('goalHome', baseCtx(), { scorer, assister }),
            chanceType: chanceType.id,
          };
        } else {
          awayScore++;
          recordGoal(stats, { minute, team: 'away', scorer: null, assister: null, chanceType });
          currentMomentum = updateMomentum(currentMomentum, 'goal_against');

          yield {
            type: 'goal', minute, team: 'away',
            scorer: null, assister: null,
            homeScore, awayScore,
            text: narrate('goalAway', baseCtx()),
            chanceType: chanceType.id,
          };
        }
      } else {
        // Chance but no goal — narrate near-miss
        if (isHomeAttacking) {
          yield {
            type: 'chance', minute, team: 'home',
            chanceType: chanceType.id,
            onTarget: result.isOnTarget,
            text: narrate('chanceHome', baseCtx(), { chanceType: chanceType.id }),
            homeScore, awayScore,
          };
          if (!result.isOnTarget) {
            yield {
              type: 'miss', minute, team: 'home',
              text: narrate('missHome', baseCtx()),
            };
          }
        } else {
          yield {
            type: 'chance', minute, team: 'away',
            chanceType: chanceType.id,
            onTarget: result.isOnTarget,
            text: narrate('chanceAway', baseCtx()),
            homeScore, awayScore,
          };
        }

        // Corner from on-target saves (~30%)
        if (result.isOnTarget && Math.random() < 0.3) {
          recordCorner(stats, team);
        }
      }
    }

    // ─── PENALTY EVENT ───
    if (Math.random() < 0.025) {
      const isHomeAttacking = possResult.winner === 'home';
      const penaltyChoice = yield {
        type: 'penalty',
        minute,
        mode: isHomeAttacking ? 'shoot' : 'save',
        homeScore, awayScore,
      };

      if (penaltyChoice && penaltyChoice.scored !== undefined) {
        if (isHomeAttacking && penaltyChoice.scored) {
          homeScore++;
          const scorer = pickScorer(activePlayers, CHANCE_TYPES.pelotaParada, formMods);
          recordGoal(stats, { minute, team: 'home', scorer, assister: null, chanceType: CHANCE_TYPES.pelotaParada });
          recordShot(stats, 'home', true);
          currentMomentum = updateMomentum(currentMomentum, 'goal');
          yield {
            type: 'goal', minute, team: 'home',
            scorer, assister: null, homeScore, awayScore,
            text: `⚽ ${minute}' ¡GOOOL de penal!`,
            chanceType: 'penalty',
          };
        } else if (isHomeAttacking && !penaltyChoice.scored) {
          currentMomentum = updateMomentum(currentMomentum, 'tactical_fail');
          yield { type: 'miss', minute, team: 'home', text: `${minute}' Penal fallado...` };
        } else if (!isHomeAttacking && penaltyChoice.scored) {
          awayScore++;
          recordGoal(stats, { minute, team: 'away', scorer: null, assister: null, chanceType: CHANCE_TYPES.pelotaParada });
          recordShot(stats, 'away', true);
          currentMomentum = updateMomentum(currentMomentum, 'goal_against');
          yield {
            type: 'goal', minute, team: 'away',
            scorer: null, assister: null, homeScore, awayScore,
            text: `💀 ${minute}' Penal encajado.`,
            chanceType: 'penalty',
          };
        } else {
          currentMomentum = updateMomentum(currentMomentum, 'tactical_success');
          yield { type: 'save', minute, team: 'home', text: `🧤 ${minute}' ¡¡ATAJADA HEROICA!!` };
        }
      }
    }

    // ─── RANDOM CARD ───
    if (Math.random() < 0.035 * (tacticalMods.cardChanceMult || 1)) {
      const cardTeam = Math.random() < 0.6 ? 'home' : 'away';
      const cardPlayer = cardTeam === 'home' ? pick(activePlayers) : pick(away.players);
      recordFoul(stats, cardTeam);
      recordCard(stats, cardTeam, minute, cardPlayer);
      currentMomentum = updateMomentum(currentMomentum,
        cardTeam === 'home' ? 'card_own' : 'card_rival');
      yield { type: 'card', minute, team: cardTeam, player: cardPlayer, text: narrate('card', baseCtx()) };
    }

    // ─── INJURY CHECK ───
    if (Math.random() < 0.015 * (tacticalMods.injuryMult || 1)) {
      const injuredPlayer = pick(activePlayers.filter(p => p.pos !== 'GK'));
      if (injuredPlayer) {
        recordInjury(stats, minute, injuredPlayer, 'home');

        // Auto-substitute with best reserve at same position
        const reserves = (roster || []).filter(p => p.role === 'rs' && !p.injuredFor);
        const samePos = reserves.filter(p => p.pos === injuredPlayer.pos);
        const replacement = samePos.length > 0 ? samePos[0] : reserves[0];

        yield {
          type: 'injury', minute, player: injuredPlayer,
          replacement,
          text: narrate('injury', baseCtx(), { player: injuredPlayer }),
          homeScore, awayScore,
        };

        // Remove injured from active starters, add replacement if available
        if (replacement) {
          activePlayers = activePlayers.map(p =>
            p.id === injuredPlayer.id ? { ...replacement, role: 'st' } : p
          );
        } else {
          // Playing with one less — penalty applied via reduced player count
          activePlayers = activePlayers.filter(p => p.id !== injuredPlayer.id);
        }
        home.players = activePlayers;
      }
    }

    // ─── MOMENTUM SHIFT NARRATION ───
    if (currentMomentum.value > 40 && Math.random() < 0.15) {
      yield { type: 'momentum_shift', minute, team: 'home', value: currentMomentum.value,
        text: narrate('momentumUp', baseCtx()) };
    } else if (currentMomentum.value < -40 && Math.random() < 0.15) {
      yield { type: 'momentum_shift', minute, team: 'away', value: currentMomentum.value,
        text: narrate('momentumDown', baseCtx()) };
    }

    // ─── RIVAL STRATEGY CHANGE ───
    const newRivalStrat = getRivalStrategy({ homeScore, awayScore, minute, league });
    if (newRivalStrat.desc !== rivalStrat.desc && Math.random() < 0.4) {
      yield {
        type: 'rival_strategy', minute,
        strategy: newRivalStrat,
        text: narrate('rivalStrategyChange', baseCtx(), { strategyDesc: newRivalStrat.desc }),
      };
    }

    // ─── TICK EVENT (for UI updates) ───
    yield {
      type: 'tick', minute,
      homeScore, awayScore,
      possession: possResult.winner,
      zone: possResult.zone,
      momentum: currentMomentum.value,
      morale: currentMomentum.morale,
      ballX: zoneToBallX(possResult.zone, possResult.winner),
      ballY: zoneToBallY(possResult.zone, possResult.winner),
    };
  }

  // ══════════════════════════════════════════
  // END OF MATCH
  // ══════════════════════════════════════════

  // Relic: Guantes de Hierro — if losing 1-0, block the goal
  if (hasGkLastMin && homeScore < awayScore && awayScore - homeScore === 1) {
    awayScore = Math.max(homeScore, awayScore - 1);
    yield { type: 'relic_effect', minute: 90, relic: 'guantes',
      text: '🧤 ¡Los Guantes de Hierro salvan el marcador al final!',
      homeScore, awayScore };
  }

  // Relic: Cemento Táctico — reduce goals conceded by 1
  if (hasMuroCement && awayScore > 0) {
    awayScore = Math.max(0, awayScore - 1);
    yield { type: 'relic_effect', minute: 90, relic: 'muro_cement',
      text: '🧱 Cemento Táctico: gol rival anulado por la muralla.',
      homeScore, awayScore };
  }

  // Final whistle
  yield {
    type: 'whistle', minute: 90, final: true,
    homeScore, awayScore,
    text: narrate('finalWhistle', baseCtx()),
  };

  // Return final result
  const finalStats = getFinalStats(stats);
  const won = homeScore > awayScore;
  const drew = homeScore === awayScore;
  const lost = homeScore < awayScore;

  return {
    result: {
      homeScore,
      awayScore,
      won,
      drew,
      lost,
      rivalName: away.name,
      morale: currentMomentum.morale,
      activePlayers, // may have changed due to injuries
    },
    stats: finalStats,
  };
}

// Convert zone/possession to ball coordinates for canvas
function zoneToBallX(zone, team) {
  // Some randomness in X
  return 0.3 + Math.random() * 0.4;
}

function zoneToBallY(zone, team) {
  if (team === 'home') {
    switch (zone) {
      case 'defense': return 0.7 + Math.random() * 0.2;
      case 'midfield': return 0.4 + Math.random() * 0.2;
      case 'attack': return 0.05 + Math.random() * 0.25;
    }
  } else {
    switch (zone) {
      case 'defense': return 0.05 + Math.random() * 0.25;
      case 'midfield': return 0.4 + Math.random() * 0.2;
      case 'attack': return 0.7 + Math.random() * 0.2;
    }
  }
  return 0.5;
}

function randomizeEvent(ev) {
  return { ...ev, o: [...ev.o].sort(() => Math.random() - 0.5) };
}
