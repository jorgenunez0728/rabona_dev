# Handoff: Remaining Work on Branch `claude/modern-football-ui-design-s42Z7`

## PR: https://github.com/jorgenunez0728/rabona_dev/pull/22

---

## What's Done (committed & pushed)

### UI Redesign (complete)
- Premium FIFA-like design system (theme.css, T.* tokens, glass-morphism)
- All screens and overlays restyled
- Loading screen with 4-stage progress bars
- Metallic shine CSS backgrounds (`bg-metallic-shine`)
- Button repositioning ("Siguiente" in first third of screen)
- Accordion/collapsible sections throughout

### Match Screen Overhaul (complete)
- Canvas reduced to 45vh, match info bar below
- Live matchday results (2-3 simultaneous matches)
- Projected mini table with position arrows (green up/red down)
- Social feed expanded to 170px default

### TableScreen Enhancements (complete)
- Matchday results section
- Tabbed stats: Goals / Assists / Clean Sheets
- Tournament social feed (league-tier accounts: memes in low leagues, real media in high)
- "Abandonar Carrera" button with confirmation modal

### Pre-match Reminder System (complete)
- `betweenMatchVisits` tracking in store
- Visit indicators (green/orange dots) on hub buttons
- Hard block modal when <7 starters
- Soft reminder overlay when screens not visited

### Run Tracker Data Layer (complete)
- `src/game/data/runTracker.js` — `buildRunSnapshot()`, `addRunToHistory()`, `computeRecords()`, `computeArchetypeAnalytics()`
- `store.js` — `runsHistory[]`, `allTimeAssisters{}`, `allTimeCleanSheets{}` in globalStats
- `store.js` — `runLog[]`, `cursesEncountered[]`, `mapChoices[]` in game state
- `store.js` — `saveRunSnapshot()` and `abandonRun()` actions
- `Rabona.jsx` — runLog entry accumulated after each match
- `DeathScreen.jsx` — saves run snapshot + all-time assisters/cleanSheets
- `ChampionScreen.jsx` — saves run snapshot (result='champion')
- `save.js` — migration 3.3 to 3.4, version bumped to 3.4

---

## What's NOT Done (needs implementation)

### 1. StatsScreen.jsx — Massive Overhaul (HIGHEST PRIORITY)

The current `src/game/screens/StatsScreen.jsx` has 5 tabs. It needs 8 tabs with a horizontally scrollable tab bar. The data layer (runTracker.js) is already built — this is purely UI work.

**New tab structure:**
```js
const tabs = [
  { k: 'stats',      l: '📊', label: 'General' },    // Enhanced with win rate, avg goals, assisters/cleanSheets leaderboards
  { k: 'runs',       l: '📜', label: 'Runs' },        // NEW — Hades-style run history list
  { k: 'records',    l: '🏅', label: 'Records' },     // NEW — all-time bests from computeRecords()
  { k: 'arquetipos', l: '🎭', label: 'Arquetipos' },  // NEW — per-archetype analytics
  { k: 'legacy',     l: '🌳', label: 'Legado' },      // Keep existing
  { k: 'cards',      l: '🎴', label: 'Cartas' },      // Keep existing
  { k: 'fame',       l: '🌟', label: 'Fama' },        // Keep existing
  { k: 'achieve',    l: '🏆', label: 'Logros' },      // Keep existing
];
```

**Tab bar must be horizontally scrollable** (8 tabs won't fit at 420px):
- `overflow-x: auto`, `scrollbar-width: none`, `WebkitOverflowScrolling: 'touch'`
- Each tab `min-width: 55px`, `flex: 0 0 auto`

#### 1a. Enhanced "General" tab
Add to existing 6-metric grid:
- Win Rate %: `((gs.totalWins || 0) / Math.max(1, gs.totalMatches || 0) * 100).toFixed(1) + '%'`
- Avg Goals/Match: `((gs.totalGoals || 0) / Math.max(1, gs.totalMatches || 0)).toFixed(1)`
- Total Matches (gs.totalMatches — currently tracked but not displayed)

Add leaderboard sections below grid:
- **Top Assisters**: `Object.entries(gs.allTimeAssisters || {}).sort((a,b) => b[1]-a[1]).slice(0,5)` — same format as existing Top Scorers
- **Top Clean Sheets**: `Object.entries(gs.allTimeCleanSheets || {}).sort((a,b) => b[1]-a[1]).slice(0,5)`

#### 1b. "Runs" tab (NEW — Hades-style run history)
**Imports needed:**
```js
import { computeRecords, computeArchetypeAnalytics } from '@/game/data/runTracker.js';
import { MANAGER_ARCHETYPES } from '@/game/data/archetypes.js';
import { LEAGUES } from '@/game/data';
```

**Data:** `(gs.runsHistory || []).slice().reverse()` (most recent first)

**Each run = expandable glass card:**
- Header row: `#${run.runNumber}` + archetype icon (from `MANAGER_ARCHETYPES.find(a => a.id === run.archetypeId)?.i`) + league icon (`LEAGUES[run.leagueReached]?.i`) + league name
- Stats row: `${run.careerStats.wins}W ${run.careerStats.draws}D ${run.careerStats.losses}L` + `⚽ ${run.careerStats.goalsFor}` + end type badge
- End type badges: 💀 death (color: T.lose), 🏆 champion (T.gold), 🚪 abandoned (T.draw)
- Top scorer: `run.topScorer?.name (${run.topScorer?.goals} goles)` if exists
- W/D/L dot strip from `run.runLog`: tiny colored circles — green=W, amber=D, red=L, in sequence
- **Tap to expand:** coach name, mutators, relics (IDs — look up from RELICS), curses, blessings, cards, coins earned
- Use `useState` with `expandedRun` ID to toggle expand

If no runs: show empty state "Completa tu primera carrera para ver el historial"

#### 1c. "Records" tab (NEW)
Call `computeRecords(gs.runsHistory || [])` and display gold-bordered cards:

```js
const RECORD_DEFS = [
  { key: 'mostGoals', label: 'Mas Goles en una Carrera', icon: '⚽', valueFn: r => r?.careerStats?.goalsFor },
  { key: 'highestLeague', label: 'Liga Mas Alta', icon: '🏟', valueFn: r => r?.leagueName },
  { key: 'longestStreak', label: 'Mejor Racha', icon: '🔥', valueFn: r => r?.careerStats?.bestStreak },
  { key: 'bestWinRate', label: 'Mejor Win Rate', icon: '📈', valueFn: r => r ? `${(r.careerStats.wins/r.careerStats.matchesPlayed*100).toFixed(0)}%` : null },
  { key: 'mostRelics', label: 'Mas Reliquias', icon: '💎', valueFn: r => r?.relicsCollected?.length },
  { key: 'longestRun', label: 'Carrera Mas Larga', icon: '📅', valueFn: r => r ? `${r.careerStats.matchesPlayed} partidos` : null },
  { key: 'fastestAscension', label: 'Ascension Rapida', icon: '⚡', valueFn: r => r ? `${r.careerStats.matchesPlayed} partidos` : null },
  { key: 'bestDefense', label: 'Mejor Defensa', icon: '🛡', valueFn: r => r ? `${(r.careerStats.goalsAgainst/r.careerStats.matchesPlayed).toFixed(1)} rec/P` : null },
];
```

Each record as `card-gold` style card showing: icon + label + value + "Run #X"
If record is null (no qualifying runs), show grayed out with "—"

#### 1d. "Arquetipos" tab (NEW)
Call `computeArchetypeAnalytics(gs.runsHistory || [])` and for each `MANAGER_ARCHETYPES`:

```
┌─────────────────────────────────────────┐
│ 🦅 El Caudillo                          │
│ 5 runs · Win Rate: ███████░░░ 62%       │
│ Avg Liga: 2.4 · 🏆 1 · 💀 4            │
└─────────────────────────────────────────┘
```

- Win rate as horizontal fill bar (width = percentage, background T.win)
- If no runs for archetype: grayed out, opacity 0.4, "Sin datos"

---

### 2. TutorialScreen.jsx — Enhanced with Mini-Previews

**File:** `src/game/screens/TutorialScreen.jsx`

The tutorial agent timed out. Read the current file first. The screen needs mini-preview mockup components that look like miniature screenshots of actual game screens.

**For each of the 7 tutorial slides, add a visual mini-preview:**

1. **Welcome slide**: Mini mockup of TableScreen (tiny league table with 4-5 rows, gold highlight on player row)
2. **Roster slide**: Mini mockup showing 3-4 PlayerCard-style boxes (colored position border, name, OVR number)
3. **Match slide**: Mini mockup of match view (tiny green rectangle "pitch", scoreboard "HAL 2-1 RIV", 2-3 event lines)
4. **Relics slide**: Mini mockup showing 3 relic choice cards (icon + name, one highlighted gold)
5. **Legacy Tree slide**: Mini mockup showing 3 branch rows with circle nodes (green=owned, gray=locked)
6. **Cards slide**: Mini mockup showing 3 tactical cards with category color pills
7. **Final slide**: Flow diagram: "Table -> Map -> Prematch -> Match -> Rewards -> Table"

**Mini-preview container:** ~200px wide, ~140px tall, borderRadius 12, border `1px solid ${T.glassBorder}`, background T.bg1, overflow hidden, subtle box-shadow

**Add tip boxes per slide:**
- Gold-bordered glass card: "💡 Consejo: [tip text]"

**Animation improvements:**
- Progress bar at top (thin gold bar filling left to right based on step/totalSteps)
- Smoother slide transitions (CSS translateX)

---

### 3. MapScreen — Track mapChoices (small change)

**File:** `src/game/screens/MapScreen.jsx`

Find the node selection handler (where `setGame` is called after choosing a node). Add `mapChoices` tracking:
```js
mapChoices: [...(g.mapChoices || []), { matchNum: g.matchNum, nodeType: chosenNode.type }]
```

This is ~1 line but needed for run history to show map decisions.

---

## Key Imports Reference

```js
// Run tracker (already created)
import { buildRunSnapshot, addRunToHistory, computeRecords, computeArchetypeAnalytics } from '@/game/data/runTracker.js';

// Archetypes (for display)
import { MANAGER_ARCHETYPES } from '@/game/data/archetypes.js';

// Theme + data
import { T, LEAGUES, PN, POS_COLORS, ACHIEVEMENTS, RELICS } from '@/game/data';
```

## Current save version: 3.4
## Branch: `claude/modern-football-ui-design-s42Z7`
## Tests: `npm test` (should pass — all changes are UI/persistence, no logic changes)
