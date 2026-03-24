# Rabona - Roguelike Football Manager

PWA football manager con metaprogresión roguelike. React + Vite, client-side only.
Fut7 (7v7), motor de partidos por generador, sistema de legado permanente entre runs.

## Quick Start

```bash
npm install && npm run dev    # Dev server
npm run build                 # Production build
npm test                      # 116 tests
```

## Project Structure

```
public/
├── manifest.json            # PWA manifest (standalone, portrait)
├── sw.js                    # Service worker (cache-first assets, network-first nav)
└── icon-192.svg             # App icon placeholder
src/
├── game/
│   ├── store.js             # Zustand store (estado global, acciones, legacy tree, curses)
│   ├── save.js              # LZ-string + SHA-256 checksum save system
│   ├── audio.js             # SFX via Tone.js
│   ├── haptics.js           # Vibration API wrapper (light/medium/heavy/double/success/warning)
│   ├── components.jsx       # Shared UI (cards, buttons, bars)
│   ├── careerLogic.js       # Career mode progression
│   ├── data.js              # Re-exports from data/ (legacy, use specific imports)
│   ├── data/
│   │   ├── helpers.js       # rnd(), pick(), roll(), clamp(), fmtMoney()
│   │   ├── players.js       # Player generation, stats, positions
│   │   ├── items.js         # 6 formations, relics, traits, training options
│   │   ├── events.js        # Tactical events, personalities, board events, objectives
│   │   ├── leagues.js       # 8 leagues (Barrio → Intergaláctica), rival names, kits
│   │   ├── progression.js   # Legacy tree, curses, archetypes, coaches, ascension, achievements
│   │   ├── visuals.js       # Sprites, colors, social media generators
│   │   └── career.js        # Career mode constants
│   ├── engine/              # Match sim (pure, no React/DOM)
│   │   ├── matchEngine.js   # Generator-based simulator (function*)
│   │   ├── momentum.js      # [-100,+100] with decay, goal surges
│   │   ├── possession.js    # Zone-based (DEF/MID/ATK) with counter-attacks
│   │   ├── chances.js       # Chance generation + goal resolution
│   │   ├── tactics.js       # Play styles, intensities, formation matchups
│   │   ├── rivalAI.js       # 5 adaptive strategies
│   │   ├── matchStats.js    # Stats + Man of the Match
│   │   ├── substitutions.js # In-match subs with fatigue
│   │   └── narration.js     # Contextual narration
│   ├── screens/
│   │   ├── TableScreen.jsx      # League table + hub navigation
│   │   ├── RosterScreen.jsx     # Squad management (drag starter/reserve)
│   │   ├── TrainingScreen.jsx   # Stat training per player
│   │   ├── MarketScreen.jsx     # Buy/sell players
│   │   ├── MapScreen.jsx        # Between-matchday event nodes (roguelike map)
│   │   ├── BoardEventScreen.jsx # Narrative board events
│   │   ├── PrematchScreen.jsx   # Formation + tactics pre-match
│   │   ├── RewardsScreen.jsx    # Post-match rewards + relic draft
│   │   ├── StatsScreen.jsx      # Compendio: stats, Hall of Fame, achievements, Legacy Tree UI
│   │   ├── CoachScreen.jsx      # Coach selection (8 coaches, unlock via achievements)
│   │   ├── AscensionScreen.jsx  # League promotion
│   │   ├── ChampionScreen.jsx   # Win screen
│   │   ├── DeathScreen.jsx      # Game over + globalStats save
│   │   ├── TitleScreen.jsx      # Main menu
│   │   ├── TutorialScreen.jsx   # First-run tutorial
│   │   └── LoadingScreen.jsx    # Init
│   ├── components/
│   │   └── BottomNav.jsx        # 5-tab mobile nav (Tabla/Roster/Entreno/Mercado/Legado)
│   └── overlays/
│       ├── LevelUpModal.jsx     # Post-match level up choices
│       └── RelicDraftOverlay.jsx # Relic selection after elite matches
├── pages/
│   └── Rabona.jsx           # Main page: screen router, match canvas, engine loop
└── App.jsx                  # Router setup
```

## Architecture

### State (`store.js`)
- **Zustand** single store. Screens read state + call actions.
- Key slices: `game` (run state), `globalStats` (persistent meta), `match`, `rewards`
- `game.curses[]` — active curses with duration countdown
- `globalStats.legacyUnlocks[]` — permanent Legacy Tree unlocks
- Actions: `confirmStart`, `unlockLegacy`, `addCurse`, `tickCurses`, `removeCurse`

### Match Engine (`engine/`)
- **Generator pattern**: `simulateMatch(config)` yields events, UI consumes via `engine.next(choice)`
- Events: `kickoff`, `tick`, `chance_approach`, `chance_shot`, `goal`, `miss`, `save`, `halftime`, `tactical_event`, `penalty`, `card`, `steal`, `injury`, `whistle`
- **Canvas rendering** in `Rabona.jsx`: steering behaviors (seek/arrive/separation/wander), bezier ball, fut7 formations, contextual animations (celebration, pressing, runs, pass trail)
- Haptic feedback on goal/card/whistle via `haptics.js`

### Metaprogression
- **Legacy Tree** (`progression.js`): 5 branches × 3 tiers = 15 permanent unlocks
  - Scouting (rival info), Cantera (starter boosts), Sponsor (coins), Tactics (formations), Charisma (chemistry/morale)
  - Points: +1/run, +1/achievement, +2/ascension level
- **Curses**: 6 types with duration (chem penalty, stat loss, coin drain, rival boost, morale cap, no events)
- **Archetypes**: 5 player types (El Crack, El Muro, El Motor, El Líder, El Pibe)
- **Ascension**: 8 difficulty levels (0-7), each adds modifiers

### Game Flow
```
Title → Tutorial → Coach → Table (hub)
  ├── Roster / Training / Market (via BottomNav)
  └── Play: Table → BoardEvent? → MapScreen → Prematch → Match → Rewards → Table
      Season end: Ascension (top 2) or Death (bottom)
```

### MapScreen (roguelike nodes)
7 node types: Vestuario, Mercado Negro, Entrenamiento, Descanso, Curandero, Sponsor, Misterio.
2-3 random weighted nodes per matchday. Skip option available.

### PWA
- `public/manifest.json` — standalone, portrait, dark theme
- `public/sw.js` — cache-first assets, network-first navigation
- `index.html` — viewport-fit=cover, apple-mobile-web-app, safe-area insets
- `BottomNav.jsx` — respects `env(safe-area-inset-bottom)`

## Testing

```bash
npm test              # 116 tests (vitest)
npm run test:watch    # Watch mode
```

4 test suites: `helpers` (24), `save` (25), `careerLogic` (11), `engine` (56).

## Key Imports

```js
// Data (use specific modules, not data.js)
import { rnd, pick, clamp } from './data/helpers.js';
import { LEGACY_TREE, hasLegacy, CURSES, ARCHETYPES } from './data/progression.js';
import { FORMATIONS, RELICS } from './data/items.js';

// Engine (pure, no React)
import { simulateMatch, PLAY_STYLES } from './engine';

// Haptics
import { Haptics } from './haptics.js';
```

## Dev Notes

- **Formations**: 6 fut7 formations in `items.js` (Muro, Clásica, Diamante, Blitz, Tridente, Cadena)
- **Engine** is pure generator — no DOM, no SFX. UI layer in `Rabona.jsx` handles rendering
- **Canvas**: steering behaviors + bezier ball. Player sprites via `drawSprite()` in `visuals.js`
- **`data.js`** re-exports all data/ modules. New code should import specific files
- **`@base44/sdk`** and **`@base44/vite-plugin`** are platform deps
- Client-side only. No backend. Saves in localStorage
