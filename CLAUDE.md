# Rabona - Football Manager Game

Browser-based football manager built with React + Vite. Single-player career mode
where you manage a team through seasons, training, transfers, and matches.

## Quick Start

```bash
npm install
npm run dev      # Dev server
npm run build    # Production build
npm test         # Run 116 tests
npm run lint     # ESLint
```

## Project Structure

```
src/
├── game/                    # Core game logic
│   ├── store.js             # Zustand state management (single source of truth)
│   ├── save.js              # Save/load system with LZ compression + checksum
│   ├── audio.js             # Sound effects via Tone.js
│   ├── components.jsx       # Shared UI components (cards, buttons, bars)
│   ├── careerLogic.js       # Career mode progression logic
│   ├── data.js              # Re-exports from data/ modules (legacy entry point)
│   │
│   ├── data/                # Game data & utilities (pure functions, no side effects)
│   │   ├── helpers.js       # rnd(), pick(), roll(), clamp(), fmtMoney(), etc.
│   │   ├── players.js       # Player generation, stats, positions
│   │   ├── items.js         # Relics, consumables, item effects
│   │   ├── events.js        # Random events, board events
│   │   ├── leagues.js       # League structures, team names, kits
│   │   ├── progression.js   # XP, leveling, skill trees
│   │   ├── visuals.js       # Sprites, colors, social media generators
│   │   └── career.js        # Career mode constants, card definitions
│   │
│   ├── engine/              # Match simulation engine (pure, no React)
│   │   ├── index.js         # Public API re-exports
│   │   ├── matchEngine.js   # Generator-based match simulator
│   │   ├── momentum.js      # Momentum system [-100, +100]
│   │   ├── possession.js    # Zone-based possession (defense/midfield/attack)
│   │   ├── chances.js       # Chance generation & goal resolution
│   │   ├── tactics.js       # Play styles, intensities, formation matchups
│   │   ├── rivalAI.js       # Adaptive rival strategy state machine
│   │   ├── matchStats.js    # Stats tracking + Man of the Match
│   │   ├── substitutions.js # Substitution system with in-match fatigue
│   │   ├── narration.js     # Contextual match narration
│   │   └── utils.js         # Shared helpers (re-exports from data/)
│   │
│   ├── screens/             # Game screens (one per file)
│   │   ├── TitleScreen.jsx
│   │   ├── RosterScreen.jsx
│   │   ├── MarketScreen.jsx
│   │   ├── TrainingScreen.jsx
│   │   ├── PrematchScreen.jsx
│   │   ├── TableScreen.jsx
│   │   ├── StatsScreen.jsx
│   │   ├── CoachScreen.jsx
│   │   ├── RewardsScreen.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── TutorialScreen.jsx
│   │   ├── AscensionScreen.jsx
│   │   ├── BoardEventScreen.jsx
│   │   ├── ChampionScreen.jsx
│   │   └── DeathScreen.jsx
│   │
│   ├── overlays/            # Modal overlays
│   │   ├── LevelUpModal.jsx
│   │   └── RelicDraftOverlay.jsx
│   │
│   └── __tests__/           # Test files
│       ├── helpers.test.js  # 24 tests - utility functions
│       ├── save.test.js     # 25 tests - save/load + checksum integrity
│       ├── careerLogic.test.js  # 11 tests - career progression
│       └── engine.test.js   # 56 tests - match engine (all modules)
│
├── components/ui/           # Radix-based UI primitives (shadcn/ui)
├── lib/                     # App utilities (cn, query client)
├── pages/
│   └── Rabona.jsx           # Main game page (renders screens via store.phase)
└── App.jsx                  # Router setup
```

## Architecture

### State Management
- **Zustand store** (`store.js`): All game state lives here. Screens read state
  and call store actions. No prop drilling.
- Key state: `phase` (current screen), `roster`, `budget`, `season`, `league`, etc.
- Store actions handle all game logic: `buyPlayer`, `train`, `playMatch`, etc.

### Save System
- **LZ-string compression** for localStorage saves
- **SHA-256 checksum** to detect save corruption
- Auto-save on phase transitions
- `save.js` exports: `saveGame()`, `loadGame()`, `deleteSave()`, `hasSave()`

### Match Engine
- **Generator pattern** (`engine/matchEngine.js`): `simulateMatch(config)` yields
  event descriptors (goals, chances, tactical prompts, penalties). The engine never
  touches the DOM or plays sounds — it returns events for the UI to interpret.
- **Rabona.jsx** `runEngineLoop()` consumes the generator, plays SFX, updates canvas,
  and passes user choices back via `engine.next(choice)`.
- **Momentum** (`momentum.js`): Float value [-100, +100] with decay, goal surges,
  halftime reset. Affects goal chance (±3%) and possession (±5%).
- **Zone possession** (`possession.js`): Defense/midfield/attack zones with
  position-aware stat calculations and counter-attack mechanics.
- **Rival AI** (`rivalAI.js`): 5 strategies that adapt based on score, minute,
  and league level.
- **6 formations** in `items.js`: Muro, Clásica, Diamante, Blitz, Tridente, Cadena.
  Formation matchup table in `tactics.js`.
- Import engine modules directly:
```js
import { simulateMatch, PLAY_STYLES } from './engine';
```

### Game Flow
```
TitleScreen → TutorialScreen → RosterScreen → TrainingScreen
    → PrematchScreen → (match sim) → RewardsScreen
    → TableScreen → (next round or season end)
    → AscensionScreen (promotion) or DeathScreen (relegation)
```

### Data Modules
All in `src/game/data/`. Pure data and functions, no React dependencies.
Import specific modules directly:
```js
import { rnd, pick, clamp } from './data/helpers.js';
import { generatePlayer } from './data/players.js';
```

## Testing

```bash
npm test              # Run all 116 tests
npm run test:watch    # Watch mode
```

Tests cover:
- `helpers.js` - Random utilities, formatting, clamping
- `save.js` - Compression, checksum validation, migration, error handling
- `careerLogic.js` - Career card selection, season progression
- `engine.js` - Momentum, possession, chances, tactics, rival AI, stats, substitutions, match integration

## Key Dependencies

| Package | Purpose |
|---------|---------|
| react 18 | UI framework |
| zustand | State management |
| tone | Sound effects |
| vite | Build tool |
| vitest | Test runner |
| tailwindcss | Styling |
| lucide-react | Icons |
| radix-ui | UI primitives |
| recharts | Stats charts |

## Dev Notes

- `data.js` in game root re-exports everything from `data/` modules for
  backward compatibility. New code should import from specific modules.
- `engine/` modules are pure functions — no React, no DOM. Import from
  `engine/index.js`. The engine uses a generator pattern (`function*`).
- `items.js` has 6 formations (Muro, Clásica, Diamante, Blitz, Tridente,
  Cadena) and includes the `pizarron` relic for extra substitutions.
- The game runs entirely client-side. No backend required.
- `@base44/sdk` and `@base44/vite-plugin` are platform dependencies.
- Build output goes to `dist/`.
