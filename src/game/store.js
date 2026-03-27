// ═══════════════════════════════════════
// GAME STORE — Zustand centralized state
// ═══════════════════════════════════════
import { create } from 'zustand';
import { SFX } from '@/game/audio';
import {
  COACHES, ASCENSION_MODS, ACHIEVEMENTS, LEAGUES, RIVAL_NAMES,
  FORMATIONS, RELICS, STARTING_RELIC_PAIRS, CURSES, COACH_ABILITIES,
  LEGACY_TREE, hasLegacy, calcLegacyPoints, calcSpentLegacy, canUnlockLegacy,
  _usedNames, genPlayer, rnd, pick, calcOvr,
  CAREER_CAST, CAREER_CAST_UNLOCKABLE, CAREER_LEGACY_TREE,
} from '@/game/data';
import { MANAGER_ARCHETYPES } from '@/game/data/archetypes.js';
import { TACTICAL_CARDS } from '@/game/data/cards.js';
import { calcMutatorLegacyBonus } from '@/game/data/mutators.js';
import { getCareerCards, calcCareerLegacyPoints, initCareer } from '@/game/careerLogic';
import { buildRunSnapshot, addRunToHistory } from '@/game/data/runTracker.js';
import {
  saveGame, loadGame, saveGlobalStats, loadGlobalStats, deleteSave,
  saveCareerGlobalStats, loadCareerGlobalStats,
} from '@/game/save';

// ── Initial state shapes ──

const INITIAL_GAME = {
  coach: null, roster: [], league: 0, matchNum: 0,
  table: [], captain: null, chemistry: 0, matchesTogether: 0, lastLineup: null, coins: 0,
  rivalMemory: {}, streak: 0, currentObjectives: [], trainedIds: [],
  formation: 'clasica', relics: [], ascension: 0, copa: null, curses: [],
  careerStats: { wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0, matchesPlayed: 0, bestStreak: 0, scorers: {}, assisters: {}, cleanSheets: {} },
  // Metaprogression v2
  archetype: null,          // manager archetype id
  cardLoadout: [],          // array of tactical card ids for this run
  cardCooldowns: {},        // { cardId: matchesRemaining }
  activeMutators: [],       // array of mutator ids
  blessings: [],            // transformed curses (blessing objects)
  matchBet: 0,              // coins wagered on current match (apostador)
  betweenMatchVisits: { roster: false, training: false, market: false },
  matchResults: [],           // [{home, away, homeGoals, awayGoals, isPlayer}] for current matchday
  topScorers: [],             // [{name, team, goals}] league-wide scorers
  topAssisters: [],           // [{name, team, assists}] league-wide assisters
  topCleanSheets: [],         // [{name, team, cleanSheets, pos}] league-wide clean sheets
  // Run tracker
  runLog: [],                 // [{matchNum, result, goalsFor, goalsAgainst, league, rivalName}]
  cursesEncountered: [],      // [curseId, ...]
  mapChoices: [],             // [{matchNum, nodeType}]
};

const INITIAL_MATCH = {
  ps: 0, rs: 0, minute: 0, speed: 2, running: false,
  rival: null, rivalPlayers: [], rivalCoach: null,
  ballX: .5, ballY: .5, possession: true, log: [], eventPopup: null,
};

const INITIAL_REWARDS = { options: [], selected: null, stolen: null, xpGain: 0 };

const INITIAL_GLOBAL_STATS = {
  totalRuns: 0, bestLeague: 0, bestLeagueName: '—', totalMatches: 0,
  totalWins: 0, totalGoals: 0, totalConceded: 0, bestStreak: 0, totalCoins: 0,
  hallOfFame: [], ascensionLevel: 0, achievements: [], allTimeScorers: {},
  legacyUnlocks: [],
  // Metaprogression v2
  cardCollection: [],         // permanently unlocked card ids
  curseMasteryProgress: {},   // { curseId: totalMatchesPlayed } persists across runs
  mutatorBonusTotal: 0,       // cumulative legacy bonus from mutator runs
  // Run tracker
  runsHistory: [],            // array of run snapshots, max 50
  allTimeAssisters: {},       // {name: totalAssists}
  allTimeCleanSheets: {},     // {name: totalCleanSheets}
};

const INITIAL_CAREER_GLOBAL_STATS = {
  totalCareers: 0,
  hallOfLegends: [],          // best completed careers [{name, pos, seasons, goals, avgRating, maxTeam, traits, legendLevel}]
  legendPoints: 0,            // currency for career legacy tree
  careerUnlocks: [],          // unlocked node ids from CAREER_LEGACY_TREE
  bestTeamReached: 0,
  totalGoals: 0,
  traitsDiscovered: [],       // trait ids found across all careers
  momentsWitnessed: [],       // signature moment ids seen across all careers
  npcArcsCompleted: [],       // [{npcId, arc}] arcs completed across careers
  dynastyBonus: {},           // inherited bonuses (reserved for future)
};

// ── Store ──

const useGameStore = create((set, get) => ({
  // ─── State slices ───
  screen: 'loading',
  game: { ...INITIAL_GAME },
  match: { ...INITIAL_MATCH },
  rewards: { ...INITIAL_REWARDS },
  rewardsTab: 'summary',
  market: { players: [], open: false },
  hasSave: false,
  storageReady: false,
  globalStats: { ...INITIAL_GLOBAL_STATS },
  boardEvents: [],
  boardEventIdx: 0,
  boardPhase: 'choose',
  boardSlideDir: null,
  boardResultData: null,
  matchType: 'league',
  detailPlayer: null,
  pendingLeague: null,
  career: null,
  careerScreen: 'create',
  careerGlobalStats: { ...INITIAL_CAREER_GLOBAL_STATS },
  transState: 'in',
  pendingRelicDraft: null,
  pendingLevelUp: null,
  debugAutoPlay: false,

  // ─── Navigation ───
  navigateTo: (newScreen) => {
    SFX.play('click');
    set({ transState: 'out' });
    setTimeout(() => { set({ screen: newScreen, transState: 'in' }); }, 180);
  },
  go: (s) => {
    if (s === 'match') {
      SFX.play('whistle');
      set({ screen: s });
    } else {
      get().navigateTo(s);
    }
  },
  setScreen: (screen) => set({ screen }),

  // ─── Game state ───
  setGame: (updater) => {
    if (typeof updater === 'function') {
      set((state) => ({ game: updater(state.game) }));
    } else {
      set({ game: updater });
    }
  },
  autoSave: (gameState) => {
    const g = gameState || get().game;
    saveGame(g, 'table');
    set({ hasSave: true });
  },

  // ─── Match state ───
  setMatch: (updater) => {
    if (typeof updater === 'function') {
      set((state) => ({ match: updater(state.match) }));
    } else {
      set({ match: updater });
    }
  },

  // ─── Rewards ───
  setRewards: (updater) => {
    if (typeof updater === 'function') {
      set((state) => ({ rewards: updater(state.rewards) }));
    } else {
      set({ rewards: updater });
    }
  },
  setRewardsTab: (tab) => set({ rewardsTab: tab }),

  // ─── Market ───
  setMarket: (updater) => {
    if (typeof updater === 'function') {
      set((state) => ({ market: updater(state.market) }));
    } else {
      set({ market: updater });
    }
  },
  openMarket: () => {
    const { game, globalStats, go } = get();
    const lg = LEAGUES[game.league];
    const players = ['GK', 'DEF', 'MID', 'FWD'].map(pos => {
      const p = genPlayer(pos, lg.lv[0], lg.lv[1]);
      p.price = Math.floor(calcOvr(p) * 3 + rnd(5, 20) + (pos === 'GK' ? 5 : 0));
      return p;
    });
    const hof = globalStats.hallOfFame || [];
    if (hof.length > 0 && Math.random() < 0.15) {
      const legend = pick(hof);
      const lp = genPlayer(legend.pos || 'MID', lg.lv[0] + 1, lg.lv[1] + 2);
      lp.name = '⭐ ' + legend.name; lp.atk = legend.atk || lp.atk; lp.def = legend.def || lp.def;
      lp.legendary = true; lp.story = `Leyenda del run #${legend.run}.`;
      lp.price = Math.floor(calcOvr(lp) * 4 + 30);
      players.push(lp);
    }
    set({ market: { players, open: true } });
    go('market');
  },

  // ─── Global stats ───
  setGlobalStats: (gs) => set({ globalStats: gs }),

  // ─── Board events ───
  setBoardEvents: (evs) => set({ boardEvents: evs }),
  setBoardEventIdx: (idx) => set({ boardEventIdx: idx }),
  setBoardPhase: (phase) => set({ boardPhase: phase }),
  setBoardSlideDir: (dir) => set({ boardSlideDir: dir }),
  setBoardResultData: (data) => set({ boardResultData: data }),

  // ─── Match type ───
  setMatchType: (type) => set({ matchType: type }),

  // ─── UI state ───
  setDetailPlayer: (player) => set({ detailPlayer: player }),
  setPendingLeague: (league) => set({ pendingLeague: league }),
  setCareer: (updater) => {
    if (typeof updater === 'function') {
      set((state) => ({ career: updater(state.career) }));
    } else {
      set({ career: updater });
    }
  },
  setCareerScreen: (screen) => set({ careerScreen: screen }),

  // ─── Career Metaprogression ───
  endCareerRun: () => {
    const { career, careerGlobalStats } = get();
    if (!career) return;

    const cgs = { ...careerGlobalStats };
    cgs.totalCareers = (cgs.totalCareers || 0) + 1;
    cgs.totalGoals = (cgs.totalGoals || 0) + (career.goals || 0);
    cgs.bestTeamReached = Math.max(cgs.bestTeamReached || 0, career.team || 0);

    // Legacy points
    const earned = calcCareerLegacyPoints(career);
    cgs.legendPoints = (cgs.legendPoints || 0) + earned;

    // Traits discovered (collect across careers)
    const traits = new Set(cgs.traitsDiscovered || []);
    for (const t of (career.traits || [])) traits.add(t);
    cgs.traitsDiscovered = [...traits];

    // Moments witnessed
    const moments = new Set(cgs.momentsWitnessed || []);
    for (const m of (career.momentsTriggered || [])) moments.add(m);
    cgs.momentsWitnessed = [...moments];

    // NPC arcs completed
    const arcs = [...(cgs.npcArcsCompleted || [])];
    for (const npc of (career.cast || [])) {
      if (npc.arc !== 'neutral') {
        const exists = arcs.find(a => a.npcId === npc.id && a.arc === npc.arc);
        if (!exists) arcs.push({ npcId: npc.id, arc: npc.arc });
      }
    }
    cgs.npcArcsCompleted = arcs;

    // Hall of Legends
    const avgRating = career.history.length
      ? Math.round(career.history.reduce((a, h) => a + h.rating, 0) / career.history.length * 10) / 10
      : 5.0;
    const entry = {
      name: career.name, pos: career.pos,
      seasons: career.season - 1, goals: career.goals,
      avgRating, maxTeam: career.team,
      traits: [...(career.traits || [])],
      momentsCount: (career.momentsTriggered || []).length,
      legendPoints: earned,
    };
    cgs.hallOfLegends = [...(cgs.hallOfLegends || []), entry].slice(-20); // keep last 20

    set({ careerGlobalStats: cgs });
    saveCareerGlobalStats(cgs);
  },

  unlockCareerLegacy: (nodeId) => {
    const { careerGlobalStats } = get();
    const cgs = { ...careerGlobalStats };
    const unlocks = [...(cgs.careerUnlocks || [])];
    if (unlocks.includes(nodeId)) return false;

    // Find the node and check cost
    let cost = 0;
    for (const branch of CAREER_LEGACY_TREE) {
      const node = branch.nodes.find(n => n.id === nodeId);
      if (node) { cost = node.cost; break; }
    }
    if ((cgs.legendPoints || 0) < cost) return false;

    cgs.legendPoints -= cost;
    cgs.careerUnlocks = [...unlocks, nodeId];
    set({ careerGlobalStats: cgs });
    saveCareerGlobalStats(cgs);
    return true;
  },

  loadCareerGlobalStats: () => {
    const loaded = loadCareerGlobalStats();
    if (loaded) set({ careerGlobalStats: loaded });
  },
  setTransState: (state) => set({ transState: state }),
  setPendingRelicDraft: (draft) => set({ pendingRelicDraft: draft }),
  setPendingLevelUp: (levelUp) => set({ pendingLevelUp: levelUp }),
  setHasSave: (val) => set({ hasSave: val }),

  // ─── Achievements ───
  checkAchievements: (gs) => {
    const newAchs = [...(gs.achievements || [])];
    let changed = false;
    ACHIEVEMENTS.forEach(a => {
      if (!newAchs.includes(a.id) && a.check(gs)) { newAchs.push(a.id); changed = true; }
    });
    return changed ? { ...gs, achievements: newAchs } : gs;
  },

  isCoachUnlocked: (coach) => {
    if (coach.unlocked) return true;
    if (coach.unlockCheck) return coach.unlockCheck(get().globalStats);
    return false;
  },

  // ─── Legacy Tree ───
  unlockLegacy: (nodeId) => {
    const gs = get().globalStats;
    if (!canUnlockLegacy(gs, nodeId)) return false;
    const newGS = { ...gs, legacyUnlocks: [...(gs.legacyUnlocks || []), nodeId] };
    set({ globalStats: newGS });
    saveGlobalStats(newGS);
    return true;
  },

  // ─── Curses (with mastery system) ───
  addCurse: (curseId) => {
    const { game } = get();
    const curses = [...(game.curses || [])];
    if (curses.some(c => c.id === curseId)) return;
    const curse = CURSES.find(c => c.id === curseId);
    if (!curse) return;
    // Carry over global mastery progress
    const globalProgress = (get().globalStats.curseMasteryProgress || {})[curseId] || 0;
    curses.push({ ...curse, remaining: curse.duration, masteryProgress: Math.floor(globalProgress * 0.3) });
    const encountered = [...(game.cursesEncountered || [])];
    if (!encountered.includes(curseId)) encountered.push(curseId);
    // Track max simultaneous curses for achievement
    const cs = { ...(game.careerStats || {}) };
    cs.maxSimultaneousCurses = Math.max(cs.maxSimultaneousCurses || 0, curses.length);
    set({ game: { ...game, curses, cursesEncountered: encountered, careerStats: cs } });
  },
  tickCurses: () => {
    const { game } = get();
    if (!game.curses?.length) return;
    const archetype = game.archetype ? MANAGER_ARCHETYPES.find(a => a.id === game.archetype) : null;
    const masterySpeed = archetype?.engineHooks?.curseMasterySpeedMult || 1;
    const curses = [];
    const newBlessings = [];
    for (const c of game.curses) {
      const updated = { ...c, masteryProgress: (c.masteryProgress || 0) + masterySpeed };
      if (updated.remaining > 0) updated.remaining--;
      // Check mastery completion
      if (c.masteryThreshold && updated.masteryProgress >= c.masteryThreshold && c.blessing) {
        newBlessings.push(c.blessing);
      } else if (c.duration === 0 || updated.remaining > 0) {
        curses.push(updated);
      }
      // else: timed curse expired naturally, remove it
    }
    const blessings = [...(game.blessings || []), ...newBlessings];
    set({ game: { ...game, curses, blessings } });
  },
  removeCurse: (curseId) => {
    const { game } = get();
    set({ game: { ...game, curses: (game.curses || []).filter(c => c.id !== curseId) } });
  },

  // ─── Blessings ───
  getBlessings: () => get().game.blessings || [],

  // ─── Card cooldowns ───
  tickCardCooldowns: () => {
    const { game } = get();
    const cd = { ...(game.cardCooldowns || {}) };
    let changed = false;
    for (const [id, val] of Object.entries(cd)) {
      if (val > 0) { cd[id] = val - 1; changed = true; }
      if (cd[id] <= 0) { delete cd[id]; changed = true; }
    }
    if (changed) set({ game: { ...game, cardCooldowns: cd } });
  },

  // ─── Between-match visit tracking ───
  markVisited: (screen) => {
    const { game } = get();
    const visits = { ...(game.betweenMatchVisits || { roster: false, training: false, market: false }) };
    if (screen in visits) {
      visits[screen] = true;
      set({ game: { ...game, betweenMatchVisits: visits } });
    }
  },
  resetVisits: () => {
    const { game } = get();
    set({ game: { ...game, betweenMatchVisits: { roster: false, training: false, market: false } } });
  },

  // ─── Mutator bonus tracking ───
  saveMutatorBonus: () => {
    const { game, globalStats } = get();
    if (!game.activeMutators?.length) return;
    const bonus = calcMutatorLegacyBonus(game.activeMutators, game.ascension || 0);
    const newGS = { ...globalStats, mutatorBonusTotal: (globalStats.mutatorBonusTotal || 0) + bonus };
    set({ globalStats: newGS });
    saveGlobalStats(newGS);
  },

  // ─── Card collection (permanent) ───
  addCardToCollection: (cardId) => {
    const { globalStats } = get();
    const collection = [...(globalStats.cardCollection || [])];
    if (collection.includes(cardId)) return;
    collection.push(cardId);
    const newGS = { ...globalStats, cardCollection: collection };
    set({ globalStats: newGS });
    saveGlobalStats(newGS);
  },

  // ─── Save curse mastery progress globally ───
  saveCurseMasteryProgress: () => {
    const { game, globalStats } = get();
    const progress = { ...(globalStats.curseMasteryProgress || {}) };
    for (const curse of (game.curses || [])) {
      progress[curse.id] = Math.max(progress[curse.id] || 0, curse.masteryProgress || 0);
    }
    const newGS = { ...globalStats, curseMasteryProgress: progress };
    set({ globalStats: newGS });
    saveGlobalStats(newGS);
  },

  // ─── Immortalize Player (Death Screen: choose 1 player for Hall of Fame) ───
  immortalizePlayer: (player) => {
    const { globalStats } = get();
    const gs = { ...globalStats };
    const lg = LEAGUES[get().game.league || 0];
    const entry = {
      name: player.name, pos: player.pos, ovr: calcOvr(player),
      atk: player.atk, def: player.def, spd: player.spd, sav: player.sav || 1,
      trait: player.trait?.n, league: lg.n, run: (gs.totalRuns || 0) + 1,
    };
    gs.hallOfFame = [...(gs.hallOfFame || []), entry].slice(-20);
    set({ globalStats: gs });
    saveGlobalStats(gs);
  },

  // ─── Run Tracker ───
  saveRunSnapshot: (extras = {}) => {
    const { game, globalStats } = get();
    const snapshot = buildRunSnapshot(game, globalStats, extras);
    const newGS = addRunToHistory(globalStats, snapshot);
    set({ globalStats: newGS });
    saveGlobalStats(newGS);
    return snapshot;
  },

  abandonRun: () => {
    const { game, globalStats, setGlobalStats, checkAchievements } = get();
    const cs = game.careerStats || {};
    const lg = LEAGUES[game.league] || LEAGUES[0];
    const sorted = [...(game.table || [])].sort((a, b) => (b.w * 3 + b.d) - (a.w * 3 + a.d));
    const myPos = sorted.findIndex(t => t.you);

    // Save global stats (same as death but with abandoned endType)
    const newGS = { ...globalStats };
    newGS.totalRuns = (newGS.totalRuns || 0) + 1;
    newGS.totalMatches = (newGS.totalMatches || 0) + (cs.matchesPlayed || 0);
    newGS.totalWins = (newGS.totalWins || 0) + (cs.wins || 0);
    newGS.totalGoals = (newGS.totalGoals || 0) + (cs.goalsFor || 0);
    newGS.totalConceded = (newGS.totalConceded || 0) + (cs.goalsAgainst || 0);
    newGS.bestStreak = Math.max(newGS.bestStreak || 0, cs.bestStreak || 0);
    newGS.totalCoins = (newGS.totalCoins || 0) + (game.coins || 0);
    if (game.league > (newGS.bestLeague || 0)) { newGS.bestLeague = game.league; newGS.bestLeagueName = lg.n; }
    newGS.allTimeScorers = { ...(newGS.allTimeScorers || {}) };
    Object.entries(cs.scorers || {}).forEach(([n, g]) => { newGS.allTimeScorers[n] = (newGS.allTimeScorers[n] || 0) + g; });
    newGS.allTimeAssisters = { ...(newGS.allTimeAssisters || {}) };
    Object.entries(cs.assisters || {}).forEach(([n, a]) => { newGS.allTimeAssisters[n] = (newGS.allTimeAssisters[n] || 0) + a; });
    newGS.allTimeCleanSheets = { ...(newGS.allTimeCleanSheets || {}) };
    Object.entries(cs.cleanSheets || {}).forEach(([n, c]) => { newGS.allTimeCleanSheets[n] = (newGS.allTimeCleanSheets[n] || 0) + c; });
    // ── Merge in-run achievement flags ──
    if (cs.hadGoleada) newGS.hadGoleada = true;
    if (cs.hadRemontada) newGS.hadRemontada = true;
    if (cs.hadHumillacion) newGS.hadHumillacion = true;
    if (cs.hadHatTrick) newGS.hadHatTrick = true;
    if (cs.hadLastMinuteWinner) newGS.hadLastMinuteWinner = true;
    if (cs.hadMassInjury) newGS.hadMassInjury = true;
    if (cs.hadBancarrota) newGS.hadBancarrota = true;
    if ((cs.bestCleanStreak || 0) >= 5) newGS.hadCleanStreak5 = true;
    if ((cs.narrowLosses || 0) >= 3) newGS.hadNarrowLosses3 = true;
    if ((cs.worstLoseStreak || 0) >= 3) newGS.hadLoseStreak3 = true;
    newGS.maxSimultaneousCurses = Math.max(newGS.maxSimultaneousCurses || 0, cs.maxSimultaneousCurses || 0);
    if (cs.losses === 0 && cs.matchesPlayed >= 8) newGS.hadUndefeatedLeague = true;
    const topGoals = Math.max(...Object.values(cs.scorers || {}), 0);
    if (topGoals > 0 && cs.goalsFor > 0 && topGoals / cs.goalsFor >= 0.8) newGS.hadOneManArmy = true;
    if ((game.playersBought || 0) === 0 && game.archetype !== 'cantera' && cs.matchesPlayed >= 8) newGS.hadNoMarketWin = true;
    if ((game.coins || 0) >= 100) newGS.hadTacano = true;
    if ((game.playersBought || 0) + (game.playersSold || 0) >= 10) newGS.hadComerciante = true;

    // Build and save run snapshot
    const snapshot = buildRunSnapshot(game, newGS, {
      endType: 'abandoned', leagueName: lg.n, leagueIcon: lg.i,
      finalPosition: myPos >= 0 ? myPos + 1 : null,
    });
    const withHistory = addRunToHistory(newGS, snapshot);
    const finalGS = checkAchievements(withHistory);
    setGlobalStats(finalGS);
    saveGlobalStats(finalGS);

    // Delete save and go to title
    deleteSave();
    set({ hasSave: false });
    get().go('title');
  },

  // ─── Save/Load ───
  handleDeleteSave: () => {
    deleteSave();
    set({ hasSave: false });
  },

  initFromStorage: () => {
    const data = loadGame();
    const gs = loadGlobalStats();
    if (gs) set({ globalStats: gs });
    const cgs = loadCareerGlobalStats();
    if (cgs) set({ careerGlobalStats: cgs });
    if (data) set({ game: data.game, hasSave: true });
    set({ storageReady: true });
  },

  // ─── Start new run ───
  // ─── Debug actions ───
  debugStartAtLeague: (leagueIdx) => {
    const { autoSave } = get();
    _usedNames.clear();
    const league = LEAGUES[leagueIdx] || LEAGUES[0];
    const [minLv, maxLv] = league.lv;
    const coach = COACHES[0]; // Don Miguel
    const starterPositions = ['GK','DEF','DEF','MID','MID','FWD','FWD'];
    const reservePositions = ['DEF','MID','FWD'];
    const roster = [
      ...starterPositions.map(p => { const pl = genPlayer(p, minLv, maxLv); pl.role = 'st'; return pl; }),
      ...reservePositions.map(p => { const pl = genPlayer(p, minLv, Math.max(1, maxLv - 1)); pl.role = 'rs'; return pl; }),
    ];
    const rns = RIVAL_NAMES[leagueIdx] || RIVAL_NAMES[0];
    const table = [
      { name: 'Halcones', you: true, w: 0, d: 0, l: 0, gf: 0, ga: 0 },
      ...rns.map(n => ({ name: n, you: false, w: 0, d: 0, l: 0, gf: 0, ga: 0 })),
    ];
    const newG = {
      ...INITIAL_GAME, roster, captain: roster[0].id, table, league: leagueIdx, matchNum: 0,
      coins: 500, coach, ascension: 0, formation: 'clasica', relics: [],
      chemistry: 10, curses: [], coachAbility: COACH_ABILITIES[coach.id] || COACH_ABILITIES.miguel,
      careerStats: { wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0, matchesPlayed: 0, bestStreak: 0, scorers: {}, assisters: {}, cleanSheets: {} },
      rivalMemory: {}, streak: 0, trainedIds: [],
      archetype: null, cardLoadout: [], cardCooldowns: {}, activeMutators: [], blessings: [], matchBet: 0,
    };
    set({ game: newG, hasSave: true });
    autoSave(newG);
    get().go('table');
  },
  debugAddCoins: (amount) => {
    const { game, autoSave } = get();
    const newG = { ...game, coins: (game.coins || 0) + amount };
    set({ game: newG });
    autoSave(newG);
  },
  debugUnlockAllLegacy: () => {
    const { globalStats } = get();
    const allIds = Object.keys(LEGACY_TREE);
    const newGs = { ...globalStats, legacyUnlocks: allIds };
    set({ globalStats: newGs });
    saveGlobalStats(newGs);
  },
  debugMaxAscension: () => {
    const { globalStats } = get();
    const newGs = { ...globalStats, ascensionLevel: 6 };
    set({ globalStats: newGs });
    saveGlobalStats(newGs);
  },
  debugToggleAutoPlay: () => {
    set((state) => ({ debugAutoPlay: !state.debugAutoPlay }));
  },
  debugStartCareer: (pos, startAge = 16, startTeam = 0, startBars = null) => {
    const { careerGlobalStats } = get();
    const legacyUnlocks = careerGlobalStats?.careerUnlocks || [];
    const unlockedNpcs = [];
    // Check which NPCs are unlocked via legacy (cc1 = +1 NPC)
    if (legacyUnlocks.includes('cc1')) {
      const available = CAREER_CAST_UNLOCKABLE.filter(n => !unlockedNpcs.includes(n.id));
      if (available.length) unlockedNpcs.push(available[0].id);
    }
    const career = initCareer(`Debug ${pos}`, pos, legacyUnlocks, unlockedNpcs);
    if (startAge !== 16) { career.age = startAge; career.season = Math.max(1, startAge - 15); }
    if (startTeam) career.team = Math.min(startTeam, 6);
    if (startBars) career.bars = { ...startBars };
    career.cardQueue = getCareerCards(career);
    set({ career, careerScreen: 'cards', screen: 'career' });
  },
  debugExportState: () => {
    const { game, globalStats, career, careerScreen, careerGlobalStats, screen } = get();
    return JSON.stringify({ game, globalStats, career, careerScreen, careerGlobalStats, screen, _v: 2 });
  },
  debugImportState: (json) => {
    try {
      const data = JSON.parse(json);
      const updates = {};
      if (data.game) updates.game = data.game;
      if (data.globalStats) { updates.globalStats = data.globalStats; saveGlobalStats(data.globalStats); }
      if (data.career !== undefined) updates.career = data.career;
      if (data.careerScreen) updates.careerScreen = data.careerScreen;
      if (data.careerGlobalStats) { updates.careerGlobalStats = data.careerGlobalStats; saveCareerGlobalStats(data.careerGlobalStats); }
      if (data.screen) updates.screen = data.screen;
      if (data.game?.coach) updates.hasSave = true;
      set(updates);
      if (data.game?.coach) saveGame(data.game, 'table');
      return true;
    } catch { return false; }
  },

  // ─── Start new run ───
  confirmStart: (coach, startRelic, selectedAsc, { archetype: archetypeId, cardLoadout, activeMutators } = {}) => {
    const { game, globalStats, autoSave } = get();
    const maxAsc = globalStats.ascensionLevel || 0;
    _usedNames.clear();
    const ascLevel = Math.min(selectedAsc, maxAsc);
    const ascMods = ASCENSION_MODS[Math.min(ascLevel, ASCENSION_MODS.length - 1)].mods;
    const archetype = archetypeId ? MANAGER_ARCHETYPES.find(a => a.id === archetypeId) : null;
    const ability = COACH_ABILITIES[coach.id] || COACH_ABILITIES.miguel;
    const isAlien = coach.fx === 'alien';
    const starterPositions = isAlien ? ['DEF','DEF','DEF','MID','FWD','FWD','FWD'] : ['GK','DEF','DEF','MID','MID','FWD','FWD'];
    const reservePositions = ['DEF','MID','FWD'];
    let roster = [
      ...starterPositions.map(p => { const pl = genPlayer(p, 1, 3); pl.role = 'st'; if (coach.fx === 'boost') pl.lv++; return pl; }),
      ...reservePositions.map(p => { const pl = genPlayer(p, 1, 2); pl.role = 'rs'; return pl; }),
    ];
    const rns = RIVAL_NAMES[0];
    const table = [{ name: 'Halcones', you: true, w: 0, d: 0, l: 0, gf: 0, ga: 0 }, ...rns.map(n => ({ name: n, you: false, w: 0, d: 0, l: 0, gf: 0, ga: 0 }))];
    let startCoins = 50 + (ability.extraCoins || 0) + (archetype?.startMods?.extraCoins || 0);
    if (coach.fx === 'cheap') startCoins = 80;
    if (isAlien) startCoins = 100;
    if (ascMods.includes('poor_start')) startCoins = Math.max(10, startCoins - 20);
    const startRelics = startRelic ? [startRelic.id] : [];
    if (startRelic?.fx === 'cursed_start') {
      startCoins = Math.max(0, startCoins - 10);
      roster = roster.map(p => p.role === 'st' ? { ...p, atk: p.atk + startRelic.val, def: p.def + startRelic.val, spd: p.spd + startRelic.val } : p);
    }
    if (startRelic?.fx === 'cursed_steal') startCoins += startRelic.val;
    // ── Apply Coach Abilities ──
    // Bestia: ATK boost to all starters
    if (ability.startBonus === 'atk_boost') {
      roster = roster.map(p => p.role === 'st' ? { ...p, atk: p.atk + 3, def: Math.max(1, p.def - 2) } : p);
    }
    // Lupe: 3 starters get Promesa trait
    if (ability.startBonus === 'cantera_3') {
      const starters = roster.filter(p => p.role === 'st' && p.pos !== 'GK');
      const chosen = starters.sort(() => Math.random() - 0.5).slice(0, 3);
      chosen.forEach(p => { p.trait = { n: 'Promesa', d: '+50% XP', fx: 'xp' }; });
    }
    // Chispa: SPD boost to all
    if (ability.startBonus === 'spd_boost') {
      roster = roster.map(p => p.role === 'st' ? { ...p, spd: p.spd + 4, def: Math.max(1, p.def - 3) } : p);
    }
    // Fantasma: add 1 legendary from Hall of Fame
    if (ability.legendaryStart) {
      const hof = globalStats.hallOfFame || [];
      if (hof.length > 0) {
        const legend = pick(hof);
        const lg = LEAGUES[0];
        const lp = genPlayer(legend.pos || 'MID', lg.lv[0] + 1, lg.lv[1] + 2);
        lp.name = '⭐ ' + legend.name; lp.atk = legend.atk || lp.atk; lp.def = legend.def || lp.def;
        lp.spd = legend.spd || lp.spd; lp.legendary = true;
        lp.story = `Leyenda del run #${legend.run}.`;
        lp.role = 'rs';
        roster.push(lp);
      }
    }
    // ── Apply Legacy Tree bonuses ──
    const gs = globalStats;
    // Sponsor branch: extra starting coins
    if (hasLegacy(gs, 'sponsor_3')) startCoins += 30;
    else if (hasLegacy(gs, 'sponsor_2')) startCoins += 20;
    else if (hasLegacy(gs, 'sponsor_1')) startCoins += 10;
    // Cantera branch: stat boost to starters
    if (hasLegacy(gs, 'cantera_1')) {
      roster = roster.map(p => {
        if (p.role !== 'st') return p;
        const stat = pick(['atk', 'def', 'spd']);
        return { ...p, [stat]: p[stat] + 1 };
      });
    }
    // Cantera 2: wonderkid chance
    if (hasLegacy(gs, 'cantera_2') && Math.random() < 0.10) {
      const wkIdx = rnd(1, roster.filter(p => p.role === 'st').length - 1);
      const wk = roster.filter(p => p.role === 'st')[wkIdx];
      if (wk) { wk.atk += 3; wk.def += 2; wk.spd += 3; wk.trait = { n: 'Promesa', d: '+50% XP', fx: 'xp' }; }
    }
    // Cantera 3: extra reserve
    if (hasLegacy(gs, 'cantera_3')) {
      const extraPos = pick(['DEF', 'MID', 'FWD']);
      const extra = genPlayer(extraPos, 1, 2);
      extra.role = 'rs';
      roster.push(extra);
    }
    // Charisma branch
    let startChem = (ability.chemMod || 0) + (archetype?.startMods?.chemBonus || 0);
    if (hasLegacy(gs, 'charisma_1')) startChem += 5;
    // Archetype stat mods to starters
    if (archetype?.startMods) {
      const { atkBonus, defPenalty } = archetype.startMods;
      if (atkBonus || defPenalty) {
        roster = roster.map(p => p.role === 'st' ? {
          ...p,
          atk: Math.max(1, p.atk + (atkBonus || 0)),
          def: Math.max(1, p.def + (defPenalty || 0)),
        } : p);
      }
    }
    // Místico: start with a random curse
    const startCurses = [];
    if (archetype?.startMods?.startWithCurse) {
      const randomCurse = pick(CURSES);
      if (randomCurse) startCurses.push({ ...randomCurse, remaining: randomCurse.duration, masteryProgress: 0 });
    }
    // Maldición Eterna mutator: start with 2 extra curses
    if ((activeMutators || []).includes('maldicion_eterna')) {
      const available = CURSES.filter(c => !startCurses.some(sc => sc.id === c.id));
      for (let i = 0; i < 2 && available.length > 0; i++) {
        const idx = rnd(0, available.length - 1);
        const c = available.splice(idx, 1)[0];
        startCurses.push({ ...c, remaining: c.duration, masteryProgress: 0 });
      }
    }
    const newG = {
      ...INITIAL_GAME, roster, captain: roster[0].id, table, league: 0, matchNum: 0,
      coins: startCoins, coach, ascension: ascLevel, formation: 'clasica', relics: startRelics,
      chemistry: startChem, curses: startCurses,
      coachAbility: ability,
      careerStats: { wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0, matchesPlayed: 0, bestStreak: 0, scorers: {}, assisters: {}, cleanSheets: {} },
      rivalMemory: {}, streak: 0, trainedIds: [], curseFreeRemoves: ability.curseFreeRemove || 0,
      // Metaprogression v2
      archetype: archetypeId || null,
      cardLoadout: cardLoadout || [],
      cardCooldowns: {},
      activeMutators: activeMutators || [],
      blessings: [],
      matchBet: 0,
    };
    set({ game: newG, hasSave: true });
    autoSave(newG);
    get().go('table');
  },
}));

// ── Auto-save: whenever game state changes AND there's an active save, persist automatically ──
let autoSaveTimer = null;
useGameStore.subscribe(
  (state) => state.game,
  (game) => {
    const { hasSave } = useGameStore.getState();
    if (!hasSave || !game.coach) return;
    // Debounce: wait 500ms after last change to avoid saving on every keystroke
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      saveGame(game, 'table');
    }, 500);
  },
);

export default useGameStore;
