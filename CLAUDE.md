# Rabona - Roguelike Football Manager

PWA football manager con metaprogresión roguelike profunda. React + Vite, client-side only.
Dos modos: **Mi Club** (roguelike 7v7 manager) y **Mi Leyenda** (carrera individual tipo Reigns).
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
│   ├── store.js             # Zustand store (estado global, acciones, legacy tree, curses, blessings, careerGlobalStats)
│   ├── save.js              # Checksum save system (v3.5) with migrations + career stats persistence
│   ├── audio.js             # SFX via Tone.js
│   ├── haptics.js           # Vibration API wrapper (light/medium/heavy/double/success/warning)
│   ├── components.jsx       # Shared UI (cards, buttons, bars, RelationshipBar, TraitBadge, MomentCard, CareerLegacyNode)
│   ├── CareerScreens.jsx    # Mi Leyenda: 7 screens (Create, Card, Match, SeasonEnd, End, Timeline, Legacy)
│   ├── careerLogic.js       # Mi Leyenda: 13 functions (relationships, traits, moments, legacy, Reigns game-over)
│   ├── data.js              # Re-exports from data/ (legacy, use specific imports)
│   ├── data/
│   │   ├── helpers.js       # rnd(), pick(), roll(), clamp(), fmtMoney()
│   │   ├── players.js       # Player generation, stats, positions
│   │   ├── items.js         # 6 formations, relics, traits, training options
│   │   ├── events.js        # Tactical events, personalities, board events, objectives
│   │   ├── leagues.js       # 8 leagues (Barrio → Intergaláctica), rival names, kits
│   │   ├── progression.js   # Legacy tree (6 branches), curses w/ mastery, coaches, ascension, achievements
│   │   ├── visuals.js       # Sprites, colors, social media generators
│   │   ├── career.js        # Mi Leyenda: 10 NPCs, 90 cards, 12 traits, 15 moments, 18 legacy nodes, 32 match cards
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
│   │   ├── TitleScreen.jsx      # Main menu ("Mi Club" + "Mi Leyenda")
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
- Key slices: `game` (Mi Club run state), `globalStats` (Mi Club persistent meta), `match`, `rewards`, `career` (Mi Leyenda run), `careerGlobalStats` (Mi Leyenda persistent meta)
- **Mi Club** slices:
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
- **Mi Leyenda** slices:
  - `career` — full career run state (bars, NPC relations, traits, moments, history)
  - `career.npcRelations{}` — NPC id → rel (0-100) with arc transitions
  - `career.traits[]` — active personality trait ids (max 4 per career)
  - `career.momentsTriggered[]` — signature moment ids already seen
  - `career.legacyUnlocks[]` — passed from careerGlobalStats at init
  - `careerGlobalStats.legendPoints` — currency for Career Legacy Tree
  - `careerGlobalStats.careerUnlocks[]` — permanent Career Legacy Tree unlocks
  - `careerGlobalStats.hallOfLegends[]` — best completed careers
  - `careerGlobalStats.traitsDiscovered[]` — traits found across all careers
  - `careerGlobalStats.momentsWitnessed[]` — moments seen across all careers
  - `careerGlobalStats.npcArcsCompleted[]` — NPC arcs completed across careers
  - Actions: `endCareerRun`, `unlockCareerLegacy`, `loadCareerGlobalStats`

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

### Mi Leyenda — Carrera Individual (`career.js`, `careerLogic.js`, `CareerScreens.jsx`)

Reigns-style individual career mode. Control a footballer from age 16 to retirement.

#### Card System (90 narrative cards)
- **Design principle**: NO obviously correct option. Both options move 2-3 bars in opposite directions. Effects ±3 to ±8.
- 5 bars: Rendimiento, Físico, Relaciones, Fama, Mental (range 0-100)
- **Game over at both 0 AND 100** for all bars (Reigns-style)
- Categories: Vida Personal (15), Profesional (15), Cancha (15), Fama (15), NPC Arc (20), Don Miguel (10)
- Cards have `condition` for age/team/NPC arc/bar/trait gating

#### NPC Relationship System (10 NPCs)
- 6 base NPCs + 4 unlockable via Career Legacy Tree
- Each NPC has `startRel`, `arcThresholds{ally, rival}`, `arcDesc{neutral, ally, rival, betrayer}`
- Relationship 0-100 with arc transitions at thresholds
- Arc-specific cards appear when NPC enters ally/rival state
- `updateNpcRelation()` handles arc transitions + Ídolo legacy speed bonus

#### Traits (12 personality traits, max 4 per career)
- Triggered by bar states + decision patterns + signature moments + NPC arcs
- Effects: modify aging, card effects, match bonuses, bar floors
- Examples: Líder, Solitario, Mediático, Resiliente, Cerebral, Rebelde, Zen, Guerrero

#### Signature Moments (15 irrepetible events)
- Career-defining events triggered by bar/season/team/goal conditions
- Each can grant a trait, shown as "Momento Estelar" cards
- Examples: debut, primer_gol, primera_lesion, capitan, final_historica

#### Career Legacy Tree (6 branches × 3 tiers = 18 nodes)
- Separate from Mi Club legacy. Persists in `careerGlobalStats` (localStorage `rabona-career-stats`)
- Branches: Dinastía, Carisma, Físico, Ambición, Sabiduría, Colección
- Legend Points: +1/career, +NPC arcs, +moments, +traits, +2 if top team
- Unlocks modify: starting bars, aging, card count, NPC speed, effect previews

#### Career Screens (7 total)
- `CareerCreateScreen` — name, position, legacy preview
- `CareerCardScreen` — narrative decisions with NPC arc display, trait toast, effect preview (Visión)
- `CareerMatchScreen` — in-match decisions with trait bonuses (guerrero, showman)
- `CareerSeasonEnd` — stats, NPC relationship summary, traits, promotion/demotion
- `CareerEndScreen` — epic summary with LP earned, arcs, traits, moments + saves to careerGlobalStats
- `CareerTimelineScreen` — career history, NPC relationships, traits
- `CareerLegacyScreen` — Career Legacy Tree with node unlocking, Hall of Legends

#### Career Logic Functions (`careerLogic.js`)
```js
initCareer(name, pos, legacyUnlocks, unlockedNpcs)  // career init with legacy bonuses
getCareerCards(c)              // condition-filtered card selection + Don Miguel + moments
applyCardChoice(c, card, opt)  // unified: bars + NPC rel + trait progress + moment tracking
checkCareerEnd(c)              // Reigns-style game-over (min 0 + max 100 for all bars)
applyAging(c)                  // trait/legacy modifiers (resiliente, zen, genética, etc.)
updateNpcRelation(c, npcId, d) // relationship + arc transitions
checkTraitUnlocks(c)           // evaluates all 12 trait triggers
getNextSignatureMoment(c)      // finds next unplayed moment
calcCareerLegacyPoints(c)      // end-of-career LP calculation
resetSeasonCards(c)             // season reset helper
```

### Mi Club — Game Flow
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

### Mi Leyenda — Game Flow
```
Title ("Mi Leyenda") → CareerCreate (name + pos + legacy preview) → Cards → Match → SeasonEnd → loop
  │                                                                                        │
  │   Each season: 2-6 narrative cards → 8 match decisions → season summary                │
  │   NPC arcs advance via card choices (ally/rival/betrayer)                               │
  │   Traits unlock when bar/decision conditions met (max 4)                                │
  │   Signature Moments appear once per career when triggered                               │
  │                                                                                        │
  │   Career End (bar=0, bar=100, or age): LP earned → save to careerGlobalStats → Title   │
  │                                                                                        │
  └── Career Legacy Screen: spend LP on permanent bonuses for next career                   │
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

// Mi Leyenda data
import { CAREER_CAST, CAREER_CAST_UNLOCKABLE, CAREER_TRAITS, SIGNATURE_MOMENTS,
  CAREER_LEGACY_TREE, ALL_CAREER_CARDS, BAR_GAME_OVER } from './data/career.js';

// Mi Leyenda logic
import { initCareer, getCareerCards, applyCardChoice, checkCareerEnd,
  applyAging, calcCareerLegacyPoints } from './careerLogic';

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
- **Save version**: 3.5 (Mi Club). Mi Leyenda uses separate `rabona-career-stats` localStorage key
- **Archetype hooks** are passed to engine via `simulateMatch(config)` — pure data, no DOM
- **Card triggers** yield `card_trigger` events — UI handles flash/toast in Rabona.jsx
- **Mutator effects** merged into single object via `getMutatorEngineEffects(ids)`
