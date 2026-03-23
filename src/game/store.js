// ═══════════════════════════════════════
// GAME STORE — Zustand centralized state
// ═══════════════════════════════════════
import { create } from 'zustand';
import { SFX } from '@/game/audio';
import {
  COACHES, ASCENSION_MODS, ACHIEVEMENTS, LEAGUES, RIVAL_NAMES,
  FORMATIONS, RELICS, STARTING_RELIC_PAIRS,
  _usedNames, genPlayer, rnd, pick, calcOvr,
} from '@/game/data';
import {
  saveGame, loadGame, saveGlobalStats, loadGlobalStats, deleteSave,
} from '@/game/save';

// ── Initial state shapes ──

const INITIAL_GAME = {
  coach: null, roster: [], league: 0, matchNum: 0,
  table: [], captain: null, chemistry: 0, matchesTogether: 0, lastLineup: null, coins: 0,
  rivalMemory: {}, streak: 0, currentObjectives: [], trainedIds: [],
  formation: 'clasica', relics: [], ascension: 0, copa: null,
  careerStats: { wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0, matchesPlayed: 0, bestStreak: 0, scorers: {} },
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
  transState: 'in',
  pendingRelicDraft: null,
  pendingLevelUp: null,

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

  // ─── Save/Load ───
  handleDeleteSave: () => {
    deleteSave();
    set({ hasSave: false });
  },

  initFromStorage: () => {
    const data = loadGame();
    const gs = loadGlobalStats();
    if (gs) set({ globalStats: gs });
    if (data) set({ game: data.game, hasSave: true });
    set({ screen: 'title' });
  },

  // ─── Start new run ───
  confirmStart: (coach, startRelic, selectedAsc) => {
    const { game, globalStats, autoSave } = get();
    const maxAsc = globalStats.ascensionLevel || 0;
    _usedNames.clear();
    const ascLevel = Math.min(selectedAsc, maxAsc);
    const ascMods = ASCENSION_MODS[Math.min(ascLevel, ASCENSION_MODS.length - 1)].mods;
    const isAlien = coach.fx === 'alien';
    const starterPositions = isAlien ? ['DEF','DEF','DEF','MID','FWD','FWD','FWD'] : ['GK','DEF','DEF','MID','MID','FWD','FWD'];
    const reservePositions = ['DEF','MID','FWD'];
    let roster = [
      ...starterPositions.map(p => { const pl = genPlayer(p, 1, 3); pl.role = 'st'; if (coach.fx === 'boost') pl.lv++; return pl; }),
      ...reservePositions.map(p => { const pl = genPlayer(p, 1, 2); pl.role = 'rs'; return pl; }),
    ];
    const rns = RIVAL_NAMES[0];
    const table = [{ name: 'Halcones', you: true, w: 0, d: 0, l: 0, gf: 0, ga: 0 }, ...rns.map(n => ({ name: n, you: false, w: 0, d: 0, l: 0, gf: 0, ga: 0 }))];
    let startCoins = 50;
    if (coach.fx === 'cheap') startCoins = 80;
    if (isAlien) startCoins = 100;
    if (ascMods.includes('poor_start')) startCoins = Math.max(10, startCoins - 20);
    const startRelics = startRelic ? [startRelic.id] : [];
    if (startRelic?.fx === 'cursed_start') {
      startCoins = Math.max(0, startCoins - 10);
      roster = roster.map(p => p.role === 'st' ? { ...p, atk: p.atk + startRelic.val, def: p.def + startRelic.val, spd: p.spd + startRelic.val } : p);
    }
    if (startRelic?.fx === 'cursed_steal') startCoins += startRelic.val;
    const newG = {
      ...INITIAL_GAME, roster, captain: roster[0].id, table, league: 0, matchNum: 0,
      coins: startCoins, coach, ascension: ascLevel, formation: 'clasica', relics: startRelics,
      careerStats: { wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0, matchesPlayed: 0, bestStreak: 0, scorers: {} },
      rivalMemory: {}, streak: 0, trainedIds: [],
    };
    set({ game: newG, hasSave: true });
    autoSave(newG);
    get().go('table');
  },
}));

export default useGameStore;
