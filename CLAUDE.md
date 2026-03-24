# Rabona - Roguelike Football Manager

PWA football manager con metaprogresión roguelike profunda. React + Vite, client-side only.
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
│   ├── store.js             # Zustand store (estado global, acciones, legacy tree, curses, blessings)
│   ├── save.js              # Checksum save system (v3.2) with migrations
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
│   │   ├── progression.js   # Legacy tree (6 branches), curses w/ mastery, coaches, ascension, achievements
│   │   ├── visuals.js       # Sprites, colors, social media generators
│   │   ├── career.js        # Career mode constants
│   │   ├── archetypes.js    # 6 manager archetypes (Filosofías de Juego)
│   │   ├── cards.js         # 28 tactical cards, loadout system, rewards
│   │   └── mutators.js      # 10 ascension mutators
│   ├── engine/              # Match sim (pure, no React/DOM)
│   │   ├── matchEngine.js   # Generator-based simulator (function*) + card/archetype/mutator hooks
│   │   ├── momentum.js      # [-100,+100] with decay, goal surges
│   │   ├── possession.js    # Zone-based (DEF/MID/ATK) with counter-attacks
│   │   ├── chances.js       # Chance generation + goal resolution + cardMod
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
│   │   ├── MapScreen.jsx        # Between-matchday event nodes (8 types incl. Carta Táctica)
│   │   ├── BoardEventScreen.jsx # Narrative board events
│   │   ├── PrematchScreen.jsx   # Formation + tactics pre-match
│   │   ├── RewardsScreen.jsx    # Post-match rewards + relic draft
│   │   ├── StatsScreen.jsx      # Compendio: stats, Hall of Fame, achievements, Legacy Tree, Cards, Mastery
│   │   ├── CoachScreen.jsx      # Multi-step run setup wizard (Archetype→Coach→Cards→Relic→Ascension+Mutators)
│   │   ├── ArchetypeScreen.jsx  # Manager archetype selection UI
│   │   ├── CardLoadoutScreen.jsx # Pre-run tactical card loadout builder
│   │   ├── AscensionScreen.jsx  # League promotion
│   │   ├── ChampionScreen.jsx   # Win screen
│   │   ├── DeathScreen.jsx      # Game over + card reward + mutator bonus + globalStats save
│   │   ├── TitleScreen.jsx      # Main menu
│   │   ├── TutorialScreen.jsx   # Visual guided tour (7 slides covering all systems)
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
- `game.archetype` — selected manager archetype id for current run
- `game.cardLoadout[]` — tactical card ids equipped for current run
- `game.activeMutators[]` — active mutator ids for current run
- `game.curses[]` — active curses with duration + masteryProgress
- `game.blessings[]` — transformed curses (positive effects)
- `globalStats.legacyUnlocks[]` — permanent Legacy Tree unlocks
- `globalStats.cardCollection[]` — permanently unlocked card ids
- `globalStats.curseMasteryProgress{}` — cross-run mastery tracking
- `globalStats.mutatorBonusTotal` — cumulative legacy bonus from mutators
- Actions: `confirmStart`, `unlockLegacy`, `addCurse`, `tickCurses`, `removeCurse`, `addCardToCollection`, `saveCurseMasteryProgress`, `saveMutatorBonus`, `tickCardCooldowns`

### Match Engine (`engine/`)
- **Generator pattern**: `simulateMatch(config)` yields events, UI consumes via `engine.next(choice)`
- Config accepts: `tacticalCards[]`, `archetypeHooks{}`, `mutatorEffects{}`, `blessings[]`
- Events: `kickoff`, `tick`, `chance_approach`, `chance_shot`, `goal`, `miss`, `save`, `halftime`, `tactical_event`, `penalty`, `card`, `steal`, `injury`, `whistle`, `card_trigger`, `relic_effect`
- **Canvas rendering** in `Rabona.jsx`: steering behaviors (seek/arrive/separation/wander), bezier ball, fut7 formations, contextual animations
- Card triggers checked at: chance resolution, goal events, match start/end
- Archetype hooks modify: morale, ATK when losing, tactical events
- Mutator effects modify: match length, injury rate, substitutions, card chance

### Metaprogression (4 Systems)

#### 1. Manager Archetypes (`archetypes.js`)
6 Filosofías de Juego that fundamentally change each run:
- **El Caudillo** 🦅 — Empates = derrota. +25% ATK cuando vas perdiendo. Goles dan doble moral
- **El Arquitecto** 📐 — Ve formación rival. +1 evento táctico. 4a opción secreta en eventos
- **El Mercenario** 💰 — +30 monedas. -30% precios mercado. Debut bonus +20% stats × 3 partidos. Venta 150%
- **El Místico** 🔮 — Empieza con curse. Curses +50% efecto pero bono oculto. Maestría 50% más rápida
- **La Cantera** 🌱 — Sin mercado. XP 2x. 4 training slots. Canterano gratis cada 3 partidos
- **El Apostador** 🎲 — Victoria doble reward. Derrota doble loss. Opción apostar pre-partido

Each has: `startMods`, `engineHooks`, `cardSlots{}`, `synergies{coaches, relics}`

#### 2. Curse Mastery (`progression.js` CURSES)
Curses have mastery bars. Play through a curse → transforms into a blessing:
- `masteryThreshold` — matches needed to master
- `masteryProgress` — advances each tick (faster for Místico)
- `blessing{}` — the positive effect gained on completion
- **Curandero node** shows mastery bars — player decides: cure (lose progress) or endure (earn blessing)
- Global mastery progress persists across runs (30% carried over)

#### 3. Tactical Cards (`cards.js`)
28 cards in 4 categories (offensive/defensive/economic/chaotic):
- Permanently collected via post-run rewards (pick 1 of 3)
- Pre-run loadout limited by archetype `cardSlots` + legacy bonus slots
- Each card has: `trigger` (engine event), `triggerCondition`, `effect`
- Engine yields `card_trigger` events → UI shows flash notification
- New map node "Carta Táctica" adds temporary card for current run
- Legacy Tree branch "Maestría" adds +1/+1/choose card slots

#### 4. Ascension Mutators (`mutators.js`)
10 optional modifiers toggled before a run (max 3):
- Each grants legacy point bonus (multiplied by ascension level)
- Effects injected into engine via `mutatorEffects{}` config
- Examples: extended match (120min), no subs, 3x injuries, hidden table, karma goals

### Game Flow
```
Title → Tutorial (7-slide guided tour) → Run Setup Wizard → Table (hub)
  │
  ├── Run Setup: Archetype → Coach → Cards → Relic → Ascension+Mutators → Start
  │
  ├── Roster / Training / Market (via BottomNav)
  │
  └── Play: Table → BoardEvent? → MapScreen → Prematch → Match → Rewards → Table
      │                              │                      │
      │                     Curse mastery advances    Cards trigger
      │                     "Carta Táctica" node      Archetype hooks apply
      │                     Curandero: cure/endure    Mutator effects apply
      │
      Season end: Ascension (top 2) or Death (bottom)
                                       │
                              Post-run: Immortalize → Card Reward → Mutator Bonus → Stats
```

### MapScreen (roguelike nodes)
8 node types: Vestuario, Mercado Negro, Entrenamiento, Descanso, Curandero (with mastery bars), Sponsor, Misterio, Carta Táctica.
2-3 random weighted nodes per matchday. Skip option available.
Místico archetype doubles mystery node options.

### Legacy Tree (`progression.js`)
6 branches × 3 tiers = 18 permanent unlocks:
- 🔭 Scouting (rival info)
- 🌱 Cantera (starter boosts)
- 💰 Sponsor (coins)
- 📋 Tactics (formations)
- 🗣 Charisma (chemistry/morale)
- 🎴 Maestría (card slots + curse mastery speed) ← NEW

Points: +1/run, +1/achievement, +2/ascension level, +mutator bonus

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
import { LEGACY_TREE, hasLegacy, CURSES } from './data/progression.js';
import { FORMATIONS, RELICS } from './data/items.js';
import { MANAGER_ARCHETYPES, getArchetypeCardSlots } from './data/archetypes.js';
import { TACTICAL_CARDS, generateCardReward } from './data/cards.js';
import { ASCENSION_MUTATORS, getMutatorEngineEffects } from './data/mutators.js';

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
- **Save version**: 3.2 (migration from 3.1 adds metaprogression v2 fields)
- **Archetype hooks** are passed to engine via `simulateMatch(config)` — pure data, no DOM
- **Card triggers** yield `card_trigger` events — UI handles flash/toast in Rabona.jsx
- **Mutator effects** merged into single object via `getMutatorEngineEffects(ids)`
