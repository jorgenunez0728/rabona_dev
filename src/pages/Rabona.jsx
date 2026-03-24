import { useState, useEffect, useRef } from "react";
import { SFX, Crowd } from "@/game/audio";
import {
  TACTICS, POS_ORDER, T, PERSONALITIES,
  rnd, pick, calcOvr,
  avgStat, teamGKRating, teamPower, narrate as legacyNarrate, randomizeEvent,
  generateLivePosts, generateSocialPosts, getRivalKit, drawSprite, getRivalSpriteVariant,
  FORMATIONS, getLevelUpChoices, applyRelicEffects,
  getRelicDraftOptions, PN, LEAGUES, genPlayer, TRAITS, getCanvasFormation,
} from "@/game/data";
import { getStadiumPitch } from "@/assets/stadiums";
import { simulateMatch, PLAY_STYLES, INTENSITIES, getManOfTheMatch } from "@/game/engine";
import { PlayerDetailModal, ParticleSystem } from "@/game/components";
import { CareerCreateScreen, CareerCardScreen, CareerMatchScreen, CareerSeasonEnd, CareerEndScreen } from "@/game/CareerScreens";
import useGameStore from "@/game/store";
import { initCareer, getCareerCards, getMatchCards, applyBarEffects, checkCareerEnd, applyAging } from "@/game/careerLogic";

// ─── Extracted screens ───
import LoadingScreen from "@/game/screens/LoadingScreen";
import TitleScreen from "@/game/screens/TitleScreen";
import TutorialScreen from "@/game/screens/TutorialScreen";
import CoachScreen from "@/game/screens/CoachScreen";
import TableScreen from "@/game/screens/TableScreen";
import RosterScreen from "@/game/screens/RosterScreen";
import MarketScreen from "@/game/screens/MarketScreen";
import TrainingScreen from "@/game/screens/TrainingScreen";
import BoardEventScreen from "@/game/screens/BoardEventScreen";
import PrematchScreen from "@/game/screens/PrematchScreen";
import RewardsScreen from "@/game/screens/RewardsScreen";
import AscensionScreen from "@/game/screens/AscensionScreen";
import ChampionScreen from "@/game/screens/ChampionScreen";
import DeathScreen from "@/game/screens/DeathScreen";
import StatsScreen from "@/game/screens/StatsScreen";
import RelicDraftOverlay from "@/game/overlays/RelicDraftOverlay";
import LevelUpModal from "@/game/overlays/LevelUpModal";

export default function Rabona() {
  const store = useGameStore();
  const {
    screen, game, setGame, match, setMatch,
    setRewards, setRewardsTab, matchType,
    detailPlayer, setDetailPlayer,
    career, setCareer, careerScreen, setCareerScreen,
    transState, setScreen,
    autoSave, go, initFromStorage,
    setPendingLevelUp, setPendingRelicDraft,
  } = store;

  useEffect(() => { initFromStorage(); }, []);

  // ─── MATCH SCREEN (will extract in future phase) ───

  const MatchScreen = () => {
    const simRef = useRef(false);
    const canvasRef = useRef(null);
    const frameRef = useRef(0);
    const particlesRef = useRef(new ParticleSystem());
    const hTrailRef = useRef(Array.from({ length: 5 }, () => []));
    const aTrailRef = useRef(Array.from({ length: 5 }, () => []));
    const shakeRef = useRef(0);
    const hpxRef = useRef([]), hpyRef = useRef([]), apxRef = useRef([]), apyRef = useRef([]);
    const eventResolveRef = useRef(null);
    const penaltyResolveRef = useRef(null);
    const pitchImgRef = useRef(null);
    const sim = useRef({ ps: 0, rs: 0, minute: 0, speed: 2, ballX: .5, ballY: .5, ballTargetX: .5, ballTargetY: .5, possession: true, log: [], done: false, rivalName: '', rivalPlayers: [], morale: 50, strategy: 'balanced', shots: 0, possCount: 0, totalTicks: 0, pendingEvent: null, halftimeShown: false, goalEffect: 0, pendingPenalty: null });
    const [display, setDisplay] = useState({ ps: 0, rs: 0, minute: 0, speed: 2, log: [], done: false, morale: 50, pendingEvent: null, strategy: 'balanced', pendingPenalty: null });

    const formation = FORMATIONS.find(f => f.id === game.formation) || FORMATIONS[1];
    const formMods = formation.mods;

    useEffect(() => {
      if (!match.running || simRef.current) return;
      simRef.current = true;
      sim.current = { ps: 0, rs: 0, minute: 0, speed: 2, ballX: .5, ballY: .5, ballTargetX: .5, ballTargetY: .5, possession: true, log: [], done: false, rivalName: match.rival?.name || 'Rival', rivalPlayers: match.rivalPlayers || [], morale: 50, strategy: 'balanced', shots: 0, possCount: 0, totalTicks: 0, pendingEvent: null, halftimeShown: false, goalEffect: 0, pendingPenalty: null, animState: 'idle', celebrateUntil: 0, chanceIndicator: null, involvedPlayer: null };
      hpxRef.current = []; hpyRef.current = []; apxRef.current = []; apyRef.current = [];
      Crowd.start();
      const di = setInterval(() => { const s = sim.current; setDisplay({ ps: s.ps, rs: s.rs, minute: s.minute, speed: s.speed, log: [...s.log.slice(-4)], done: s.done, morale: s.morale, pendingEvent: s.pendingEvent, strategy: s.strategy, pendingPenalty: s.pendingPenalty }); }, 150);
      const ci = setInterval(() => { const s = sim.current; Crowd.setIntensity(s.morale / 100); }, 1000);
      let animId; function dl() { frameRef.current++; drawPitch(); animId = requestAnimationFrame(dl); } dl();
      runEngineLoop().then(() => { clearInterval(di); clearInterval(ci); cancelAnimationFrame(animId); const s = sim.current; setDisplay({ ps: s.ps, rs: s.rs, minute: s.minute, speed: s.speed, log: [...s.log.slice(-4)], done: true, morale: s.morale, pendingEvent: null, strategy: s.strategy }); });
      return () => { clearInterval(di); clearInterval(ci); cancelAnimationFrame(animId); Crowd.stop(); };
    }, [match.running]);

    useEffect(() => {
      const src = getStadiumPitch(game.league);
      if (src) { const img = new Image(); img.src = src; img.onload = () => { pitchImgRef.current = img; }; }
      else { pitchImgRef.current = null; }
    }, [game.league]);

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
    function waitForChoice() { return new Promise(resolve => { eventResolveRef.current = resolve; }); }
    function handleEventChoice(optionIndex) { if (eventResolveRef.current) { eventResolveRef.current(optionIndex); eventResolveRef.current = null; } }
    function waitForPenalty() { return new Promise(resolve => { penaltyResolveRef.current = resolve; }); }

    async function showTacticalEvent(ev) {
      SFX.play('event');
      sim.current.pendingEvent = ev;
      const choice = await waitForChoice();
      sim.current.pendingEvent = null;
      return choice;
    }

    // mode: 'shoot' (you attack) or 'save' (you defend)
    async function showPenaltyMinigame(mode = 'shoot') {
      SFX.play('event');
      sim.current.pendingPenalty = { phase: 'aim', mode, shootDir: null, keeperDir: null, result: null };
      const result = await waitForPenalty();
      sim.current.pendingPenalty = null;
      return result;
    }

    function handlePenaltyShoot(dir) {
      const S = sim.current;
      if (!S.pendingPenalty || S.pendingPenalty.phase !== 'aim') return;
      const mode = S.pendingPenalty.mode || 'shoot';
      SFX.play('kick');
      if (mode === 'shoot') {
        // Player chooses where to shoot, keeper guesses
        const keeperDir = pick(['left', 'center', 'right']);
        const scored = dir !== keeperDir || (dir === 'center' && Math.random() < 0.3);
        S.pendingPenalty = { ...S.pendingPenalty, phase: 'result', shootDir: dir, keeperDir, result: scored };
        setTimeout(() => {
          if (scored) SFX.play('goal'); else SFX.play('card');
          setTimeout(() => { if (penaltyResolveRef.current) { penaltyResolveRef.current({ scored }); penaltyResolveRef.current = null; } }, 1200);
        }, 600);
      } else {
        // 'save' mode: player chooses corner to dive, rival shoots randomly
        const shootDir = pick(['left', 'center', 'right']);
        const saved = dir === shootDir || (shootDir === 'center' && Math.random() < 0.35);
        S.pendingPenalty = { ...S.pendingPenalty, phase: 'result', shootDir, keeperDir: dir, result: saved };
        setTimeout(() => {
          if (saved) SFX.play('goal'); else SFX.play('goal_rival');
          setTimeout(() => { if (penaltyResolveRef.current) { penaltyResolveRef.current({ scored: !saved }); penaltyResolveRef.current = null; } }, 1200);
        }, 600);
      }
    }

    async function runEngineLoop() {
      const S = sim.current;
      const starters = game.roster.filter(p => p.role === 'st');
      const allRoster = game.roster.map(p => ({ ...p, trait: { ...p.trait } }));
      const simRelics = game.relics || [];
      const sp = () => S.speed;
      function addLog(t, x) { S.log.push({ type: t, text: x }); if (S.log.length > 25) S.log.shift(); }
      function narrate(type) { return legacyNarrate(type, 'Halcones', S.rivalName, starters); }

      // Create the engine generator
      const engine = simulateMatch({
        starters,
        roster: game.roster,
        formation: game.formation,
        relics: simRelics,
        coach: game.coach,
        rival: { name: match.rival?.name || 'Rival', players: match.rivalPlayers || [] },
        league: game.league,
        chemistry: game.chemistry,
        captain: game.roster.find(p => p.id === game.captain),
        matchType,
      });

      let result = engine.next();
      let engineResult = null;

      while (!result.done) {
        const ev = result.value;
        S.minute = ev.minute || S.minute;
        if (ev.homeScore !== undefined) S.ps = ev.homeScore;
        if (ev.awayScore !== undefined) S.rs = ev.awayScore;
        if (ev.morale !== undefined) S.morale = ev.morale;
        if (ev.ballX !== undefined) S.ballTargetX = ev.ballX;
        if (ev.ballY !== undefined) S.ballTargetY = ev.ballY;
        if (ev.possession) S.possession = ev.possession === 'home';

        switch (ev.type) {
          case 'kickoff':
            addLog('event', ev.text);
            break;

          case 'chance_approach':
            if (ev.ballX !== undefined) S.ballTargetX = ev.ballX;
            if (ev.ballY !== undefined) S.ballTargetY = ev.ballY;
            S.animState = 'run';
            if (ev.involvedPlayer) S.involvedPlayer = ev.involvedPlayer.name;
            await sleep(sp() >= 2 ? 400 : sp() === 1 ? 150 : 50);
            break;

          case 'chance_shot':
            if (ev.ballX !== undefined) S.ballTargetX = ev.ballX;
            if (ev.ballY !== undefined) S.ballTargetY = ev.ballY;
            S.animState = 'kick';
            if (ev.involvedPlayer) S.involvedPlayer = ev.involvedPlayer.name;
            if (sp() >= 2) SFX.play('kick');
            await sleep(sp() >= 2 ? 500 : sp() === 1 ? 150 : 50);
            break;

          case 'goal':
            if (ev.chanceType) S.chanceIndicator = { type: ev.chanceType, until: frameRef.current + 60 };
            if (ev.team === 'home') {
              S.goalEffect = 1; shakeRef.current = 15; S.ballX = .5; S.ballY = .05; S.ballTargetX = .5; S.ballTargetY = .05;
              SFX.play('goal');
              addLog('goal', ev.text || `⚽ ${ev.minute}' ${narrate('goalHome')}`);
              S.morale = Math.min(99, (S.morale || 50) + 10);
              S.animState = 'celebrate'; S.celebrateUntil = Date.now() + 2500;
              await sleep(sp() >= 2 ? 2500 : sp() === 1 ? 800 : 200);
            } else {
              S.goalEffect = -1; shakeRef.current = 10; S.ballX = .5; S.ballY = .95; S.ballTargetX = .5; S.ballTargetY = .95;
              SFX.play('goal_rival');
              addLog('goalRival', ev.text || `💀 ${ev.minute}' ${narrate('goalAway')}`);
              S.morale = Math.max(0, (S.morale || 50) - 8);
              S.animState = 'idle';
              await sleep(sp() >= 2 ? 2500 : sp() === 1 ? 800 : 200);
            }
            S.ballX = .5; S.ballY = .5; S.ballTargetX = .5; S.ballTargetY = .5;
            S.shots++;
            break;

          case 'chance':
            if (ev.chanceType) S.chanceIndicator = { type: ev.chanceType, until: frameRef.current + 60 };
            S.animState = 'kick';
            if (ev.team === 'home') {
              if (sp() >= 2) { SFX.play('kick'); addLog('normal', ev.text || `${ev.minute}' ${narrate('atkBuild')}`); await sleep(700); }
            }
            S.animState = 'run';
            S.shots++;
            break;

          case 'miss':
            if (ev.chanceType) S.chanceIndicator = { type: ev.chanceType, until: frameRef.current + 60 };
            S.animState = 'kick';
            if (ev.team === 'home' && sp() >= 2) {
              addLog('normal', ev.text || `${ev.minute}' ${narrate('atkFail')}`);
            }
            S.animState = 'run';
            break;

          case 'save':
            if (ev.chanceType) S.chanceIndicator = { type: ev.chanceType, until: frameRef.current + 60 };
            S.animState = 'kick';
            addLog('event', ev.text);
            S.morale = Math.min(99, (S.morale || 50) + 8);
            S.animState = 'run';
            break;

          case 'halftime': {
            SFX.play('halftime');
            S.halftimeShown = true;
            addLog('event', ev.text || `🕐 Descanso: ${S.ps}-${S.rs}`);
            const htEvent = {
              n: '🕐 MEDIO TIEMPO', d: `${S.ps}-${S.rs} · ¿Cómo encaras la 2ª parte?`, isHalftime: true,
              o: [{ n: 'Ofensiva', d: '+Ataque, -Defensa', i: '⚔' }, { n: 'Equilibrada', d: 'Balance', i: '⚖' }, { n: 'Defensiva', d: '+Defensa, -Ataque', i: '🛡' }],
            };
            const htChoice = await showTacticalEvent(htEvent);
            S.strategy = ['offensive', 'balanced', 'defensive'][htChoice] || 'balanced';
            await sleep(200);
            result = engine.next(htChoice);
            continue;
          }

          case 'tactical_event': {
            const choice = await showTacticalEvent(ev.event);
            await sleep(sp() >= 2 ? 400 : 100);
            result = engine.next(choice);
            continue;
          }

          case 'penalty': {
            const mode = ev.mode;
            addLog('event', `‼ ${ev.minute}' ${mode === 'shoot' ? '¡PENAL a favor!' : '¡Penal en contra!'}`);
            const penResult = await showPenaltyMinigame(mode);
            await sleep(sp() >= 2 ? 600 : 150);
            S.ballX = .5; S.ballY = .5; S.ballTargetX = .5; S.ballTargetY = .5;
            result = engine.next(penResult);
            // Defensive: ensure score is synced after penalty resolution
            if (result.value && result.value.homeScore !== undefined) S.ps = result.value.homeScore;
            if (result.value && result.value.awayScore !== undefined) S.rs = result.value.awayScore;
            continue;
          }

          case 'card':
            if (sp() >= 2) { SFX.play('card'); addLog('card', ev.text || `🟨 ${ev.minute}' ¡Tarjeta!`); }
            break;

          case 'steal':
            if (sp() >= 2) { SFX.play('tick'); addLog('steal', ev.text || `🔥 ${ev.minute}' ${narrate('steal')}`); S.morale = Math.min(99, (S.morale || 50) + 2); }
            break;

          case 'injury':
            addLog('event', ev.text || `🏥 ${ev.minute}' Lesión`);
            break;

          case 'momentum_shift':
            addLog('normal', ev.text);
            break;

          case 'rival_strategy':
            if (sp() >= 2) addLog('normal', ev.text);
            break;

          case 'relic_effect':
            addLog('event', ev.text);
            break;

          case 'whistle':
            SFX.play('whistle_double');
            addLog('event', ev.text || `🏁 ¡Final! Halcones ${S.ps}-${S.rs} ${S.rivalName}`);
            Crowd.stop();
            await sleep(sp() === 0 ? 600 : 2500);
            S.done = true;
            break;

          case 'tick':
            S.animState = 'run';
            S.involvedPlayer = ev.involvedPlayer ? ev.involvedPlayer.name : null;
            if (S.possession) S.possCount++;
            S.totalTicks++;
            await sleep(sp() >= 2 ? 600 : sp() === 1 ? 180 : 100);
            break;
        }

        result = engine.next();
      }

      // Engine returned final result
      engineResult = result.value;

      // End of match processing
      const ps = S.ps, rs = S.rs;
      const won = ps > rs, drew = ps === rs, lost = ps < rs;
      const streakBonus = Math.max(0, game.streak) * 3;
      const leagueBonus = Math.floor(game.league * 4);
      const relicCoinBonus = (won && simRelics.includes('botines94') ? 3 : 0)
        + (won && simRelics.includes('trofeo') ? 2 * Math.max(0, game.streak) : 0)
        + (simRelics.includes('prensa') ? 5 : 0);
      const coinGain = (won ? 25 : drew ? 12 : 5) + streakBonus + leagueBonus + relicCoinBonus;
      const hasLossXp = simRelics.includes('sangre');
      const xpGain = won ? 18 : drew ? 12 : (hasLossXp ? 16 : 8);
      const possPct = Math.round(S.possCount / Math.max(1, S.totalTicks) * 100);
      const objData = { wentBehind: S.log.some(e => e.type === 'goalRival'), fatiguedCount: 0, finalMorale: S.morale, possPct };
      const objResults = (game.currentObjectives || []).map(o => ({ ...o, completed: o.check ? o.check(ps, rs, objData) : false }));
      const objCoins = objResults.filter(o => o.completed).reduce((s, o) => s + (o.r?.coins || 0), 0);
      const injuryList = [];
      const personalityEvents = [];

      setGame(g => {
        const table = [...g.table]; const me = table.find(t => t.you); me.gf += ps; me.ga += rs;
        if (won) me.w++; else if (drew) me.d++; else me.l++;
        table.filter(t => !t.you).forEach(t => { if (Math.random() < .7) { const gf = rnd(0, 3), ga = rnd(0, 2); t.gf += gf; t.ga += ga; if (gf > ga) t.w++; else if (gf === ga) t.d++; else t.l++; } });
        const roster = g.roster.map(p => ({ ...p, trait: { ...p.trait }, personality: p.personality || pick(PERSONALITIES) }));
        roster.filter(p => p.role === 'st').forEach(p => {
          let xp = xpGain; if (p.trait.fx === 'xp') xp = Math.floor(xp * 1.5);
          p.xp += xp;
          // No auto-level — level up is handled via choice modal after match
        });
        roster.forEach(p => {
          if (p.role === 'st') { p.fatigue = Math.min(100, (p.fatigue || 0) + rnd(20, 30)); p.gamesPlayed = (p.gamesPlayed || 0) + 1; }
          else p.fatigue = Math.max(0, (p.fatigue || 0) - rnd(12, 18));
        });
        const hasAmuleto = (g.relics || []).includes('amuleto');
        const hasMendez = (g.relics || []).includes('mendez');
        roster.filter(p => p.role === 'st').forEach(p => {
          const baseRisk = p.fatigue > 90 ? .25 : p.fatigue > 70 ? .1 : .02;
          const risk = hasAmuleto ? baseRisk * 0.9 : baseRisk;
          if (Math.random() < risk && (p.injuredFor || 0) <= 0) {
            p.injuredFor = hasMendez ? 1 : rnd(1, 3);
            p.role = 'rs'; injuryList.push({ name: p.name, pos: p.pos, games: p.injuredFor });
          }
        });
        roster.forEach(p => { if ((p.injuredFor || 0) > 0) p.injuredFor--; });
        const lineupKey = roster.filter(p => p.role === 'st').slice(0, 6).map(p => p.id).sort().join(',');
        let mt = g.matchesTogether, chem = g.chemistry;
        if (g.lastLineup === lineupKey) { mt++; chem = Math.min(99, mt * 5 + 10); } else { mt = Math.max(0, mt - 2); chem = Math.max(5, mt * 5 + 10); }
        const newStreak = won ? (Math.max(0, g.streak) + 1) : (lost ? Math.min(0, g.streak) - 1 : 0);
        const rivalMem = { ...g.rivalMemory }; rivalMem[S.rivalName] = { result: `${ps}-${rs}`, gdiff: ps - rs };
        const cs = { ...g.careerStats || { wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0, matchesPlayed: 0, bestStreak: 0, scorers: {} } };
        cs.matchesPlayed++; cs.goalsFor += ps; cs.goalsAgainst += rs;
        if (won) cs.wins++; else if (drew) cs.draws++; else cs.losses++;
        cs.bestStreak = Math.max(cs.bestStreak, newStreak);
        const scorers = { ...cs.scorers || {} };
        // Use engine stats for goal attribution (weighted by position/stats, not random)
        const engineGoals = engineResult?.stats?.goals || [];
        const homeGoals = engineGoals.filter(g => g.team === 'home');
        if (homeGoals.length > 0) {
          homeGoals.forEach(g => { if (g.scorer) scorers[g.scorer] = (scorers[g.scorer] || 0) + 1; });
        } else {
          // Fallback: attribute goals randomly to FWD/MID
          const fwdMid = roster.filter(p => p.role === 'st' && (p.pos === 'FWD' || p.pos === 'MID'));
          for (let i = 0; i < ps; i++) { const scorer = fwdMid.length ? fwdMid[Math.floor(Math.random() * fwdMid.length)] : roster[0]; if (scorer) scorers[scorer.name] = (scorers[scorer.name] || 0) + 1; }
        }
        cs.scorers = scorers;
        const newState = { ...g, table, roster, matchNum: g.matchNum + 1, matchesTogether: mt, chemistry: chem, lastLineup: lineupKey, coins: g.coins + coinGain + objCoins, streak: newStreak, rivalMemory: rivalMem, careerStats: cs, trainedIds: [] };
        setTimeout(() => autoSave(newState), 100);
        return newState;
      });

      // Rewards — Level-up with choice (deferred), relic, recruit
      const rwOptions = [];

      // Level up with CHOICE — use post-XP roster from setGame snapshot
      // We need to read the updated roster, so defer via a small timeout after setGame settles
      // For now, detect from allRoster (pre-setGame XP add) — will trigger if xp+xpGain >= xpNext
      const levelUpPlayers = allRoster
        .filter(p => p.role === 'st' && p.lv < 20)
        .filter(p => {
          const gainedXp = p.trait?.fx === 'xp' ? Math.floor(xpGain * 1.5) : xpGain;
          return (p.xp + gainedXp) >= (p.xpNext || 20);
        });
      if (levelUpPlayers.length > 0) {
        const t = levelUpPlayers[0];
        const choices = getLevelUpChoices(t);
        rwOptions.push({
          title: `⬆ ${t.name} sube de nivel`,
          desc: `Nivel ${t.lv} → ${t.lv + 1} · Elige mejora`,
          detail: choices.map(c => c.d).join(' / '),
          isLevelUp: true,
          player: t,
          choices,
          fn: () => { setPendingLevelUp({ player: t, choices }); },
        });
      }

      // Relic draft (if won/drew and has < 4 relics) — show 1-of-3 picker after rewards
      const currentRelics = game.relics || [];
      if (won && currentRelics.length < 4) {
        const draftOptions = getRelicDraftOptions(currentRelics, 3);
        if (draftOptions.length > 0) {
          rwOptions.push({
            title: `📿 Elegir Reliquia`,
            desc: `Elige 1 de ${draftOptions.length} reliquias — ${won ? 'recompensa por victoria' : 'recompensa élite'}`,
            detail: draftOptions.map(r => `${r.i} ${r.n}`).join(' / '),
            isRelicDraft: true,
            fn: () => { setPendingRelicDraft({ options: draftOptions }); },
          });
        }
      }

      // Evolve
      if ((won || drew) && allRoster.some(p => p.lv >= 5 && !p.evo)) {
        const evs = allRoster.filter(p => p.lv >= 5 && !p.evo);
        const t = pick(evs); const nt = pick(TRAITS);
        rwOptions.push({ title: '🌟 Evolucionar', desc: `${t.name} → +${nt.n}`, detail: `${nt.d} + ⚔+3 🛡+3 ⚡+2`, fn: () => { t.evo = true; t.trait = { n: t.trait.n + '+' + nt.n, d: t.trait.d + '|' + nt.d, fx: t.trait.fx }; t.atk += 3; t.def += 3; t.spd += 2; } });
      }

      // Recruit / free agent
      if (won && allRoster.length < 14) { const r = pick(S.rivalPlayers); rwOptions.push({ title: '🔄 Reclutar', desc: `${r.name} (${PN[r.pos]} OVR${calcOvr(r)})`, detail: `⚔${r.atk} 🛡${r.def} ⚡${r.spd}`, fn: () => { r.role = 'rs'; setGame(g => ({ ...g, roster: [...g.roster, r] })); } }); }
      else if (allRoster.length < 14) { const lg2 = LEAGUES[game.league]; const fa = genPlayer(pick(['GK', 'DEF', 'MID', 'FWD']), lg2.lv[0], lg2.lv[0] + 2); rwOptions.push({ title: '🆕 Agente Libre', desc: `${fa.name} (${PN[fa.pos]} OVR${calcOvr(fa)})`, detail: `⚔${fa.atk} 🛡${fa.def} ⚡${fa.spd}`, fn: () => { fa.role = 'rs'; setGame(g => ({ ...g, roster: [...g.roster, fa] })); } }); }

      // blowout_boost relic: win 3-0+ → random starter gets +1 all stats
      if (simRelics.includes('doblaje') && won && ps - rs >= 3) {
        const starters2 = allRoster.filter(p => p.role === 'st');
        if (starters2.length) {
          const t = pick(starters2);
          setGame(g => ({ ...g, roster: g.roster.map(p => p.id === t.id ? { ...p, atk: p.atk + 1, def: p.def + 1, spd: p.spd + 1 } : p) }));
        }
      }

      // Copa check BEFORE steal — losing in Copa ends the run immediately
      const isCopaLoss = matchType === 'copa' && game.copa && lost;
      if (matchType === 'copa' && game.copa) {
        if (won) { setGame(g => { const copa = { ...g.copa }; copa.bracket[copa.round].beaten = true; copa.round++; if (copa.round >= copa.maxRounds) { copa.won = true; copa.active = false; } return { ...g, copa, coins: g.coins + 15 * copa.round }; }); }
        else { setGame(g => ({ ...g, copa: { ...g.copa, eliminated: true, active: false } })); setTimeout(() => go('death'), 1500); return; }
      }

      let stolen = null;
      const hasCursedSteal = simRelics.includes('pacto');
      if (lost && !isCopaLoss) {
        const stealCount = hasCursedSteal ? 2 : 1;
        const stealable = allRoster.filter(p => p.id !== game.captain && p.role === 'st');
        const minRosterSize = 7; // 6 starters + 1 reserve minimum to keep playing
        const maxSteals = Math.max(0, allRoster.length - minRosterSize);
        const actualSteals = Math.min(stealCount, maxSteals, stealable.length);
        for (let si = 0; si < actualSteals; si++) {
          const s = stealable[si];
          if (si === 0) stolen = s;
          setGame(g => ({ ...g, roster: g.roster.filter(p => p.id !== s.id) }));
        }
      }
      const snapRoster = allRoster.filter(p => !stolen || p.id !== stolen.id);
      const goals = S.log.filter(e => e.type === 'goal' || e.type === 'goalRival');
      const cards = S.log.filter(e => e.type === 'card');
      const socialPosts = generateSocialPosts(game.league, won, drew, S.rivalName, ps, rs, game.streak);

      // Engine-enhanced stats
      const engStats = engineResult?.stats || null;
      const motm = engStats ? getManOfTheMatch(engStats, starters) : null;

      setRewards({ options: rwOptions, selected: null, stolen, xpGain, result: { ps, rs, won, drew, lost, xpGain, coinGain: coinGain + objCoins, rivalName: S.rivalName, rosterSnapshot: snapRoster, rivalPlayers: S.rivalPlayers, starters: allRoster.filter(p => p.role === 'st'), goals, cards, possPct, shots: S.shots, morale: S.morale, objResults, personalityEvents, injuryList, socialPosts, matchType, engineStats: engStats, manOfTheMatch: motm } });
      setMatch(m => ({ ...m, running: false })); simRef.current = false; setRewardsTab('summary'); setScreen('rewards');
    }

    function drawPitch() {
      const canvas = canvasRef.current; if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      const rect = canvas.parentElement.getBoundingClientRect();
      if (canvas.width !== Math.floor(rect.width) || canvas.height !== Math.floor(rect.height)) { canvas.width = Math.floor(rect.width); canvas.height = Math.floor(rect.height); }
      const W = canvas.width, H = canvas.height, f = frameRef.current, S = sim.current;
      if (!W || !H) return;
      ctx.save();
      if (shakeRef.current > 0) { const s = shakeRef.current; ctx.translate(Math.sin(f * 0.5) * s * 0.3, Math.cos(f * 0.7) * s * 0.2); shakeRef.current = Math.max(0, shakeRef.current - 0.5); }
      const m = 10, fw = W - m * 2, fh = H - m * 2;
      if (pitchImgRef.current) {
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.drawImage(pitchImgRef.current, -H / 2, -W / 2, H, W);
        ctx.restore();
      } else {
        for (let i = 0; i < 16; i++) {
          const t = i / 16;
          ctx.fillStyle = i % 2 === 0 ? `rgb(${Math.floor(38 + t * 12)},${Math.floor(96 + t * 20)},${Math.floor(21 + t * 10)})` : `rgb(${Math.floor(43 + t * 12)},${Math.floor(104 + t * 20)},${Math.floor(26 + t * 10)})`;
          ctx.fillRect(0, i * H / 16, W, H / 16 + 1);
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1.5;
        ctx.strokeRect(m, m, fw, fh);
        ctx.beginPath(); ctx.moveTo(m, H / 2); ctx.lineTo(W - m, H / 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(fw, fh) * .08, 0, Math.PI * 2); ctx.stroke();
        const gpw = fw * .14, gph = 4;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillRect(W / 2 - gpw / 2, m - 1, gpw, gph); ctx.fillRect(W / 2 - gpw / 2, H - m - gph + 1, gpw, gph);
      }
      S.ballX += (S.ballTargetX - S.ballX) * 0.08;
      S.ballY += (S.ballTargetY - S.ballY) * 0.08;
      const bpx = m + fw * S.ballX, bpy = m + fh * S.ballY;
      const fmCfg = getCanvasFormation(game.formation?.id || game.formation);
      const homeFormation = fmCfg.home;
      const awayFormation = fmCfg.away;
      const homeSpreadX = fmCfg.homeSpreadX;
      const awaySpreadX = fmCfg.awaySpreadX;
      if (!hpxRef.current.length) {
        homeFormation.forEach((p, i) => { hpxRef.current[i] = m + fw * (p.bx + homeSpreadX[i]); hpyRef.current[i] = m + fh * p.by; });
        awayFormation.forEach((p, i) => { apxRef.current[i] = m + fw * (p.bx + awaySpreadX[i]); apyRef.current[i] = m + fh * p.by; });
      }
      homeFormation.forEach((pos, i) => {
        const baseX = m + fw * (pos.bx + homeSpreadX[i]), baseY = m + fh * pos.by;
        const pull = S.possession ? pos.pull : pos.pull * 0.4;
        const pushY = S.possession ? -fh * 0.06 : fh * 0.04;
        const targetX = baseX + (bpx - baseX) * pull * 2;
        const targetY = Math.max(m + fh * pos.minY, Math.min(m + fh * pos.maxY, baseY + pushY + (bpy - baseY) * pull));
        hpxRef.current[i] += (targetX - hpxRef.current[i]) * .045;
        hpyRef.current[i] += (targetY - hpyRef.current[i]) * .045;
        hpxRef.current[i] += Math.sin(f * .008 + i * 2.1) * 0.3;
      });
      awayFormation.forEach((pos, i) => {
        const baseX = m + fw * (pos.bx + awaySpreadX[i]), baseY = m + fh * pos.by;
        const pull = S.possession ? pos.pull * 0.4 : pos.pull;
        const pushY = S.possession ? fh * 0.04 : -fh * 0.06;
        const targetX = baseX + (bpx - baseX) * pull * 2;
        const targetY = Math.max(m + fh * pos.minY, Math.min(m + fh * pos.maxY, baseY + pushY + (bpy - baseY) * pull));
        apxRef.current[i] += (targetX - apxRef.current[i]) * .04;
        apyRef.current[i] += (targetY - apyRef.current[i]) * .04;
        apxRef.current[i] += Math.sin(f * .009 + i * 1.7) * 0.3;
      });
      if (S.goalEffect !== 0) {
        const gx = W / 2, gy = S.goalEffect > 0 ? m + 20 : H - m - 20;
        const col = S.goalEffect > 0 ? ['#f0c040', '#ffd600', '#fff'] : ['#ff1744', '#ef5350'];
        for (let c = 0; c < 3; c++) particlesRef.current.emit(gx, gy, 8, pick(col), { spread: 6, upforce: 4, type: 'confetti', size: 3 });
        S.goalEffect = 0;
      }
      if (S.celebrateUntil > 0 && Date.now() > S.celebrateUntil) { S.animState = 'run'; S.celebrateUntil = 0; }
      const currentAnim = S.celebrateUntil > Date.now() ? 'celebrate' : (S.animState || 'idle');
      const rivalAnim = S.animState === 'kick' ? 'idle' : (S.animState === 'celebrate' ? 'idle' : 'run');
      const hStarters = game.roster.filter(p => p.role === 'st').sort((a, b) => POS_ORDER[a.pos] - POS_ORDER[b.pos]);
      const rKit = getRivalKit(game.league || 0);
      for (let i = 0; i < 5; i++) {
        const px = hpxRef.current[i] + Math.sin(f * .016 + i * 1.3) * 1.5, py = hpyRef.current[i] + Math.sin(f * .013 + i) * 1.2;
        const isGK = i === 0 || (hStarters[i] && hStarters[i].pos === 'GK');
        if (S.involvedPlayer && hStarters[i] && hStarters[i].name === S.involvedPlayer) {
          ctx.fillStyle = 'rgba(88,166,255,0.25)';
          ctx.beginPath();
          ctx.arc(px, py + 5, 18, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        drawSprite(ctx, px, py, '#1565c0', '#0d47a1', f, i + 100, isGK, 'home', 'red', currentAnim);
        ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(hStarters[i] ? hStarters[i].name.split(' ').pop().substring(0, 8) : '', px, py + 22);
        ctx.textAlign = 'left';
      }
      const rivalVariant = getRivalSpriteVariant(rKit[0]);
      for (let i = 0; i < 5; i++) {
        const px = apxRef.current[i] + Math.sin(f * .018 + i * 1.5) * 1.5, py = apyRef.current[i] + Math.sin(f * .015 + i * 1.1) * 1.2;
        ctx.globalAlpha = 1;
        drawSprite(ctx, px, py, rKit[0], rKit[1], f, i + 200, i === 0, 'rival', rivalVariant, rivalAnim);
        ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(S.rivalPlayers[i] ? S.rivalPlayers[i].name.split(' ').pop().substring(0, 8) : '', px, py + 22);
        ctx.textAlign = 'left';
      }
      const bs = 12;
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(bpx + 1, bpy + bs * 0.6, bs * 0.6, bs * 0.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bpx, bpy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(bpx, bpy, 1.5, 0, Math.PI * 2); ctx.fill();
      // Chance type indicator
      if (S.chanceIndicator && frameRef.current < S.chanceIndicator.until) {
        const alpha = (S.chanceIndicator.until - frameRef.current) / 60;
        ctx.globalAlpha = alpha * 0.9;
        const icons = { contraataque: '\u26A1', elaborada: '\u26BD', pelotaParada: '\uD83C\uDFAF', tiroLejano: '\uD83D\uDCA5', errorRival: '\uD83D\uDD25' };
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(icons[S.chanceIndicator.type] || '\u26BD', bpx, bpy - 20);
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
      }
      particlesRef.current.update(ctx);
      if (shakeRef.current > 5) { ctx.fillStyle = shakeRef.current > 12 ? 'rgba(240,192,64,0.15)' : 'rgba(255,23,68,0.1)'; ctx.fillRect(0, 0, W, H); }
      ctx.restore();
    }

    const LC = { goal: T.gold, goalRival: T.lose, event: T.purple, steal: T.draw, card: '#ffd600', normal: 'rgba(230,237,243,0.4)' };
    const ev = display.pendingEvent;
    const moraleColor = display.morale > 65 ? T.win : display.morale > 35 ? T.draw : T.lose;
    const starters = game.roster.filter(p => p.role === 'st');
    const tp = teamPower(starters), rtp = teamPower(match.rivalPlayers || []);
    const winProb = Math.min(95, Math.max(5, Math.round((tp / (tp + rtp + 1) * 50 + 25 + ((display.ps - display.rs) * 12) + (display.morale - 50) * 0.15))));
    const socialCacheRef = useRef({ posts: [], lastUpdate: 0, lastMinute: 0 });
    const nowTime = Date.now();
    if (nowTime - socialCacheRef.current.lastUpdate > 3000 || display.minute !== socialCacheRef.current.lastMinute) {
      socialCacheRef.current = { posts: generateLivePosts(game.league, display.minute, display.log, display.ps, display.rs, matchType), lastUpdate: nowTime, lastMinute: display.minute };
    }
    const livePosts = socialCacheRef.current.posts;

    return (
      <div style={{ display: 'flex', flexDirection: 'row', height: '100%', background: '#000', position: 'relative' }}>
        {/* Social Feed */}
        <div style={{ flex: '0 0 28%', display: 'flex', flexDirection: 'column', background: T.bg, borderRight: `1px solid ${T.bg3}`, overflow: 'hidden' }}>
          <div style={{ padding: '4px 6px', background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontFamily: "'Oswald'", fontSize: 8, color: T.tx3, textTransform: 'uppercase', letterSpacing: 1 }}>📱 En vivo</div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {livePosts.map((p, i) => (
              <div key={i} style={{ background: T.bg1, borderRadius: 5, padding: '4px 5px', border: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2 }}>
                  <div style={{ fontSize: 9, flexShrink: 0, width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.acc?.avImg ? <img src={p.acc.avImg} width={14} height={14} alt="" style={{ imageRendering: 'pixelated', display: 'block' }} /> : (p.acc?.av || '👤')}
                  </div>
                  <span style={{ fontFamily: "'Oswald'", fontSize: 7, color: T.tx2, flex: 1 }}>{p.acc?.n}</span>
                  <span style={{ fontSize: 6, color: T.tx3 }}>{p.t}</span>
                </div>
                <div style={{ fontFamily: "'Barlow'", fontSize: 10, color: T.tx, lineHeight: 1.3 }}>{p.text}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 2, fontFamily: "'Barlow Condensed'", fontSize: 7, color: T.tx3 }}>
                  <span>❤ {p.likes}</span><span>💬 {p.comments}</span>
                </div>
              </div>
            ))}
            {livePosts.length === 0 && <div style={{ textAlign: 'center', padding: 8, color: T.tx3, fontSize: 9, fontStyle: 'italic' }}>Esperando...</div>}
          </div>
          <div style={{ padding: '4px 6px', background: T.bg1, borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Oswald'", fontSize: 7, color: T.tx3, marginBottom: 1 }}>
              <span style={{ color: '#4DABF7' }}>HAL {winProb}%</span><span style={{ color: '#FF6B6B' }}>{100 - winProb}%</span>
            </div>
            <div style={{ display: 'flex', height: 3, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${winProb}%`, background: 'linear-gradient(90deg,#1565c0,#4DABF7)', transition: 'width 0.5s' }} />
              <div style={{ flex: 1, background: 'linear-gradient(90deg,#FF6B6B,#c62828)' }} />
            </div>
          </div>
        </div>
        {/* Pitch */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', imageRendering: 'pixelated' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 15, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.7)', padding: '3px 6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ padding: '2px 6px', background: '#1565c0', fontFamily: "'Oswald'", fontWeight: 700, fontSize: 11, color: '#fff' }}>HAL</div>
                <div style={{ padding: '2px 8px', background: '#222', fontFamily: "'Oswald'", fontWeight: 700, fontSize: 16, color: '#fff', minWidth: 40, textAlign: 'center' }}>{display.ps}-{display.rs}</div>
                <div style={{ padding: '2px 6px', background: '#c62828', fontFamily: "'Oswald'", fontWeight: 700, fontSize: 11, color: '#fff' }}>{match.rival?.name?.substring(0, 4) || 'RIV'}</div>
                <div style={{ padding: '2px 5px', background: T.accent, fontFamily: "'Oswald'", fontWeight: 700, fontSize: 11, color: '#000' }}>{display.minute}'</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <div style={{ width: 36, height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }}><div style={{ width: `${display.morale}%`, height: '100%', background: moraleColor, borderRadius: 2 }} /></div>
                <span style={{ fontSize: 9, color: moraleColor, fontFamily: "'Oswald'", fontWeight: 700 }}>{display.morale}</span>
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {[{ l: '⏩', s: 0 }, { l: '▶', s: 1 }, { l: '▶▶', s: 2 }].map(({ l, s }) => (
                  <button key={s} onClick={() => { sim.current.speed = s; setDisplay(d => ({ ...d, speed: s })); }} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 8, padding: '2px 5px', border: `1px solid ${display.speed === s ? T.win : 'rgba(255,255,255,0.15)'}`, background: display.speed === s ? `${T.win}25` : 'transparent', color: display.speed === s ? T.win : 'rgba(255,255,255,0.4)', borderRadius: 3, cursor: 'pointer' }}>{l}</button>
                ))}
                <button onClick={() => { SFX._muted = !SFX._muted; if (SFX._muted) Crowd.stop(); else if (sim.current && !sim.current.done) Crowd.start(); setDisplay(d => ({ ...d })); }} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 8, padding: '2px 5px', border: `1px solid ${SFX._muted ? 'rgba(239,83,80,0.4)' : 'rgba(255,255,255,0.15)'}`, background: SFX._muted ? 'rgba(239,83,80,0.1)' : 'transparent', color: SFX._muted ? '#ef5350' : 'rgba(255,255,255,0.4)', borderRadius: 3, cursor: 'pointer', marginLeft: 3 }}>{SFX._muted ? '🔇' : '🔊'}</button>
              </div>
            </div>
          </div>
          <div style={{ flex: '0 0 auto', maxHeight: 70, overflow: 'auto', background: T.bg, borderTop: `1px solid ${T.bg3}`, padding: 4 }}>
            {[...display.log].reverse().slice(0, 4).map((e, i) => (
              <div key={i} style={{ display: 'flex', padding: '1px 4px', borderLeft: `2px solid ${LC[e.type] || 'transparent'}`, marginBottom: 1 }}>
                <span style={{ fontFamily: "'Barlow'", fontSize: 11, color: LC[e.type] || T.tx2, fontWeight: (e.type === 'goal' || e.type === 'goalRival') ? 700 : 400, lineHeight: 1.2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{e.text}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Tactical Event */}
        {ev && !display.pendingPenalty && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50, padding: 12, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'linear-gradient(135deg,#141e3a,#1a2744)', border: '1px solid rgba(213,0,249,0.15)', borderRadius: 8, padding: 16, maxWidth: 340, width: '100%' }}>
              <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 18, color: '#fff', textAlign: 'center', textTransform: 'uppercase' }}>{ev.n}</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: '#607d8b', textAlign: 'center' }}>{display.minute}'</div>
              <div style={{ fontSize: 14, color: '#e8eaf6', textAlign: 'center', lineHeight: 1.3, whiteSpace: 'pre-line', margin: '8px 0' }}>{ev.d}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {ev.o.map((opt, i) => (
                  <div key={i} onClick={() => { SFX.play('click'); handleEventChoice(i); }} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {opt.i && <div style={{ fontSize: 18, minWidth: 24, textAlign: 'center' }}>{opt.i}</div>}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, color: '#fff', textTransform: 'uppercase' }}>{opt.n}</div>
                      <div style={{ fontSize: 11, color: '#607d8b' }}>{opt.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Penalty Mini-Game */}
        {display.pendingPenalty && (() => {
          const pk = display.pendingPenalty;
          const isSave = pk.mode === 'save';
          const resultLabel = isSave
            ? (pk.result ? '❌ ¡GOL EN CONTRA!' : '🧤 ¡¡ATAJADA!!')
            : (pk.result ? '⚽ ¡¡GOOOL!!' : '❌ ¡ATAJADO!');
          const resultColor = isSave ? (pk.result ? '#ff1744' : '#f0c040') : (pk.result ? '#f0c040' : '#ff1744');
          return (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 55, padding: 16 }}>
              <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 24, color: isSave ? '#ef5350' : '#f0c040', textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 }}>
                {isSave ? '‼ PENAL EN CONTRA' : '‼ PENAL A FAVOR'}
              </div>
              <div style={{ width: '100%', maxWidth: 280, height: 90, position: 'relative', marginBottom: 16 }}>
                <div style={{ position: 'absolute', top: 0, left: '10%', width: '80%', height: '100%', background: 'rgba(255,255,255,0.03)', border: '3px solid #fff', borderBottom: 'none', borderRadius: '4px 4px 0 0' }}>
                  {pk.phase === 'result' && pk.shootDir && (
                    <div style={{ position: 'absolute', top: isSave ? (pk.result ? '30%' : '15%') : (pk.result ? '15%' : '30%'), left: pk.shootDir === 'left' ? '15%' : pk.shootDir === 'right' ? '60%' : '40%', fontSize: 20, opacity: 0.9 }}>⚽</div>
                  )}
                  <div style={{ position: 'absolute', bottom: 4, left: pk.phase === 'result' ? (pk.keeperDir === 'left' ? '5%' : pk.keeperDir === 'right' ? '60%' : '35%') : '35%', fontSize: 22, transition: 'left 0.3s' }}>🧤</div>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 4, background: '#2d7018' }} />
              </div>
              {pk.phase === 'aim' ? (
                <div style={{ width: '100%', maxWidth: 280 }}>
                  <div style={{ fontFamily: "'Barlow'", fontSize: 13, color: '#e8eaf6', textAlign: 'center', marginBottom: 8 }}>
                    {isSave ? '¿A qué lado te tiras?' : '¿A dónde disparas?'}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['left', 'center', 'right'].map(d => (
                      <button key={d} onClick={() => handlePenaltyShoot(d)} style={{ flex: 1, padding: '12px 6px', background: isSave ? 'rgba(40,10,10,0.95)' : 'rgba(20,30,58,0.95)', border: `1px solid ${isSave ? 'rgba(255,50,50,0.2)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <div style={{ fontSize: 20 }}>{isSave ? (d === 'left' ? '↖' : d === 'center' ? '⬆' : '↗') : (d === 'left' ? '↙' : d === 'center' ? '⬆' : '↘')}</div>
                        <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 10, color: '#fff', textTransform: 'uppercase' }}>{d === 'left' ? 'Izq' : d === 'center' ? 'Centro' : 'Der'}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 36, color: resultColor, textTransform: 'uppercase' }}>{resultLabel}</div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    );
  };


  // ─── CAREER SCREENS (imported — see game/CareerScreens.jsx) ───
  const careerHelpers = { setCareer, setCareerScreen, go, initCareer, getCareerCards, applyBarEffects, checkCareerEnd, applyAging, getMatchCards };
  const CareerCreateScreenLocal = () => <CareerCreateScreen {...careerHelpers} />;
  const CareerCardScreenLocal = () => career ? <CareerCardScreen career={career} {...careerHelpers} /> : null;
  const CareerMatchScreenLocal = () => career ? <CareerMatchScreen career={career} {...careerHelpers} /> : null;
  const CareerSeasonEndLocal = () => career ? <CareerSeasonEnd career={career} {...careerHelpers} /> : null;
  const CareerEndScreenLocal = () => career ? <CareerEndScreen career={career} {...careerHelpers} /> : null;

  // ─── RENDER ───
  const transStyle = { opacity: transState === 'out' ? 0 : 1, transform: transState === 'out' ? 'scale(0.97)' : 'scale(1)', transition: 'opacity 0.22s ease, transform 0.22s ease' };

  return (
    <div className="fw-bg-pattern" style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: T.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@400;500;600&family=Silkscreen:wght@400;700&display=swap');
        @keyframes fw-fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fw-pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes fw-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fw-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes fw-slideIn { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fw-scaleIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        @keyframes fw-bounceIn { 0%{opacity:0;transform:scale(0.3)} 50%{transform:scale(1.05)} 70%{transform:scale(0.95)} 100%{opacity:1;transform:scale(1)} }
        @keyframes fw-countUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fw-anim-1{animation:fw-fadeUp .4s ease .05s both}.fw-anim-2{animation:fw-fadeUp .4s ease .12s both}.fw-anim-3{animation:fw-fadeUp .4s ease .2s both}.fw-anim-4{animation:fw-fadeUp .4s ease .28s both}.fw-anim-5{animation:fw-fadeUp .4s ease .36s both}
        .fw-float{animation:fw-float 3s ease-in-out infinite}.fw-pulse{animation:fw-pulse 2s ease infinite}
        .fw-slideIn{animation:fw-slideIn .3s ease both}.fw-scaleIn{animation:fw-scaleIn .25s ease both}.fw-bounceIn{animation:fw-bounceIn .5s ease both}
        .fw-hover{transition:transform .15s ease,box-shadow .15s ease}.fw-hover:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.3)}.fw-hover:active{transform:translateY(0)}
        .fw-shimmer{background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.06) 50%,transparent 100%);background-size:200% 100%;animation:fw-shimmer 2.5s linear infinite}
        .fw-btn{font-family:'Oswald';font-weight:600;font-size:14px;padding:11px 28px;border:none;border-radius:6px;cursor:pointer;text-transform:uppercase;letter-spacing:1px;transition:transform .15s ease,filter .15s ease,box-shadow .15s ease;}
        .fw-btn:hover{transform:translateY(-1px);filter:brightness(1.1);box-shadow:0 4px 12px rgba(0,0,0,0.3)}.fw-btn:active{transform:scale(.93)!important;filter:brightness(.9)}.fw-btn:disabled{opacity:.4;cursor:not-allowed;transform:none!important;filter:none!important}
        .fw-btn-primary{background:linear-gradient(135deg,#d4a017,#f0c040);color:#0b1120}.fw-btn-green{background:linear-gradient(135deg,#00c853,#00e676);color:#0b1120}.fw-btn-outline{background:transparent;border:1.5px solid currentColor}
        .fw-bg-pattern{background-image:radial-gradient(circle,rgba(255,255,255,0.03) 1px,transparent 1px);background-size:20px 20px}
        *{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:2px}
      `}</style>
      <div style={{ ...transStyle, width: '100%', height: '100%', position: 'relative' }}>
        {screen === 'loading' && <LoadingScreen />}
        {screen === 'title' && <TitleScreen />}
        {screen === 'tutorial' && <TutorialScreen />}
        {screen === 'coach' && <CoachScreen />}
        {screen === 'table' && <TableScreen />}
        {screen === 'market' && <MarketScreen />}
        {screen === 'roster' && <RosterScreen />}
        {screen === 'training' && <TrainingScreen />}
        {screen === 'boardEvent' && <BoardEventScreen />}
        {screen === 'prematch' && <PrematchScreen />}
        {screen === 'match' && <MatchScreen />}
        {screen === 'rewards' && <RewardsScreen />}
        {screen === 'ascension' && <AscensionScreen />}
        {screen === 'champion' && <ChampionScreen />}
        {screen === 'death' && <DeathScreen />}
        {screen === 'stats' && <StatsScreen />}

        {screen === 'career' && (
          careerScreen === 'create' ? <CareerCreateScreenLocal /> :
            careerScreen === 'cards' ? <CareerCardScreenLocal /> :
              careerScreen === 'match' ? <CareerMatchScreenLocal /> :
                careerScreen === 'seasonEnd' ? <CareerSeasonEndLocal /> :
                  careerScreen === 'careerEnd' ? <CareerEndScreenLocal /> :
                    <CareerCreateScreenLocal />
        )}

        <RelicDraftOverlay />
        <LevelUpModal />
        {detailPlayer && <PlayerDetailModal player={detailPlayer} onClose={() => setDetailPlayer(null)} captainId={game.captain} />}
      </div>
    </div>
  );
}