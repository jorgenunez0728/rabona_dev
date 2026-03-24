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
} from '@/game/data';
import { MANAGER_ARCHETYPES } from '@/game/data/archetypes.js';
import { TACTICAL_CARDS } from '@/game/data/cards.js';
import { calcMutatorLegacyBonus } from '@/game/data/mutators.js';
import {
  saveGame, loadGame, saveGlobalStats, loadGlobalStats, deleteSave,
} from '@/game/save';

// ── Initial state shapes ──

const INITIAL_GAME = {
  coach: null, roster: [], league: 0, matchNum: 0,
  table: [], captain: null, chemistry: 0, matchesTogether: 0, lastLineup: null, coins: 0,
  rivalMemory: {}, streak: 0, currentObjectives: [], trainedIds: [],
  formation: 'clasica', relics: [], ascension: 0, copa: null, curses: [],
  careerStats: { wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0, matchesPlayed: 0, bestStreak: 0, scorers: {} },
  // Metaprogression v2
  archetype: null,          // manager archetype id
  cardLoadout: [],          // array of tactical card ids for this run
  cardCooldowns: {},        // { cardId: matchesRemaining }
  activeMutators: [],       // array of mutator ids
  blessings: [],            // transformed curses (blessing objects)
  matchBet: 0,              // coins wagered on current match (apostador)
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
    set({ game: { ...game, curses } });
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
      careerStats: { wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0, matchesPlayed: 0, bestStreak: 0, scorers: {} },
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
      careerStats: { wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0, matchesPlayed: 0, bestStreak: 0, scorers: {} },
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
