# Rabona — Estado del Proyecto y Roadmap

## Branch activo: `claude/modern-football-ui-design-pHfwV`
## Save version: 3.5

---

## COMPLETADO

### UI Redesign
- Premium FIFA-like design system (theme.css, T.* tokens, glass-morphism)
- All screens and overlays restyled
- Loading screen with 4-stage progress bars
- Metallic shine CSS backgrounds, accordion sections

### Match Screen Overhaul
- Canvas 45vh, match info bar, live matchday results
- Projected mini table with position arrows
- Social feed expanded to 170px

### TableScreen Enhancements
- Matchday results, tabbed stats (Goals/Assists/CleanSheets)
- Tournament social feed (league-tier accounts)
- "Abandonar Carrera" button with confirmation

### Pre-match Reminder System
- Visit indicators (green/orange dots), hard block <7 starters, soft reminder overlay

### Run Tracker Data Layer
- `runTracker.js` — snapshot, history, records, archetype analytics
- `store.js` — runsHistory[], allTimeAssisters/CleanSheets, runLog[], mapChoices[]
- DeathScreen + ChampionScreen save snapshots

### StatsScreen — 8-Tab Overhaul
- Scrollable 8-tab bar (General, Runs, Records, Arquetipos, Legado, Cartas, Fama, Logros)
- General: 9 metrics + top scorers/assisters/clean sheets leaderboards
- Runs: Hades-style expandable run history with W/D/L dot strips
- Records: 8 gold-bordered all-time record cards
- Arquetipos: per-archetype analytics with win rate bars

### TutorialScreen — Enhanced
- Gold progress bar at top
- TipBox per slide (7 contextual tips)
- 7 mini-preview mockups (table, roster, match, relics, legacy, cards, flow)

### MapScreen — mapChoices tracking + Easter Egg Nodes
- mapChoices tracked on node selection for run history
- El Fantasma del 94 (rare, weight 0.3, league 2+): Don Miguel flashback + free rare relic
- El Coleccionista (rare, weight 0.4, 3+ relics): Trade 2 cheapest relics for 1 rare/uncommon

### Achievements Expansion (17 → 52)
- 35 new achievements across 6 categories
- **Gameplay positivo** (8): goleada, invicto, remontada, clean5, gol_90, hat_trick, runs20, goals500
- **Gameplay negativo** (8): racha_negra, humillacion, sin_gol_3, final_perdida, descenso_epico, bancarrota, lesion_masiva, abandono
- **Economía** (2): tacano, comerciante
- **Secretos/Meta** (7): el_94, maldito_triple, maestro_oscuro, no_mercado, one_man_army, mutador_total, speedrun
- **Maestría arquetipos** (7): filosofo + 6 archetype-specific champion wins
- **Colección** (3): hall_full, arbol_completo, todas_cartas
- In-run tracking in Rabona.jsx (goleada, remontada, clean streak, lose streak, hat trick, etc.)
- Flag merging at run-end in DeathScreen, ChampionScreen, and abandonRun
- maxSimultaneousCurses tracked in addCurse action
- playersBought tracked in MarketScreen
- chibiAssets fallbacks for all 36 new entries
- Save migration 3.4 → 3.5

### Secret Narrations
- 3 categories in narration.js: claseMagistral, remontadaEpica, ultimoSuspiro (9 templates)

### Hidden Easter Egg Players
- 0.5% chance to generate special named players with stat bonuses
- Hugo Sánchez Jr. (FWD +3 ATK), El Niño del 94 (+1 all), Fantasma Reyes (+3 SPD), Memo Ochoa III (GK +4 SAV), Rafa Márquez Jr. (DEF +3 DEF)

---

## INVENTARIO ACTUAL DEL JUEGO

| Sistema | Cantidad | Estado |
|---------|----------|--------|
| Ligas | 7 (Barrio → Intergaláctica) | Completo |
| Formaciones | 6 (Muro, Clásica, Diamante, Blitz, Tridente, Cadena) | Completo |
| Coaches | 8 (Don Miguel + 7 desbloqueables) | Completo |
| Arquetipos | 6 (Caudillo, Arquitecto, Mercenario, Místico, Cantera, Apostador) | Completo |
| Reliquias | 24 (8 common, 7 uncommon, 6 rare, 3 cursed) | Completo |
| Cartas Tácticas | 28 (8 off, 8 def, 6 eco, 6 chaos) | Completo |
| Maldiciones | 6 (con sistema mastery → bendiciones) | Completo |
| Mutadores | 10 (ascension-gated) | Completo |
| Legacy Tree | 18 nodos (6 ramas × 3 tiers) | Completo |
| Achievements | 52 (17 base + 35 new) | Completo |
| Easter Eggs | 2 map nodes + 5 hidden players + 3 secret narrations | Completo |
| Cutscenes | 6 (promoción entre ligas) | Completo |
| Board Events | 10 | Completo |
| Map Nodes | 8 tipos | Completo |
| Rival AI Strategies | 5 | Completo |
| Pantallas | 19 | Completo |

---

## LO QUE FALTA — Roadmap por Prioridad

### PRIORIDAD ALTA — Core Roguelike Depth

#### 1. ~~MÁS ACHIEVEMENTS~~ ✅ COMPLETADO (52 achievements)

#### ~~2. SECRETOS Y EASTER EGGS~~ ✅ COMPLETADO (map nodes + hidden players + narrations)

#### 3. MODO HISTORIA / NARRATIVA EXPANDIDA (SIGUIENTE PRIORIDAD)
Los roguelikes top tienen 50-100 achievements. Solo tenemos 17, la mayoría son "alcanza X número".
Faltan achievements de:

**Estilo de juego:**
- `goleada` — Ganar 5-0 o más
- `invicto` — Completar una liga sin perder
- `remontada_epica` — Ganar un partido después de ir 0-3 abajo
- `portero_imbatible` — 5 clean sheets consecutivos
- `empate_maestro` — 3 empates seguidos (irónico)
- `sin_gol` — Perder 0-1 en 3 partidos seguidos de un run

**Económicos:**
- `tacano` — Terminar un run con 100+ monedas sin gastar
- `bancarrota` — Llegar a 0 monedas y ganar el siguiente partido
- `comerciante` — Comprar y vender 10 jugadores en un run

**Secretos / Easter Eggs:**
- `el_94` — Ganar la final con el coach Don Miguel en Intergaláctica (callback a la historia)
- `maldito` — Tener 3 maldiciones activas simultáneamente
- `maestro_oscuro` — Dominar las 6 maldiciones (todas las bendiciones)
- `speedrun` — Ascender con menos de X partidos jugados
- `no_mercado` — Ganar una liga sin comprar jugadores (no siendo La Cantera)
- `one_man_army` — Tu goleador anota el 80%+ de goles del equipo

**Arquetipos:**
- Un achievement secreto por cada arquetipo (ganar intergaláctica con cada uno)
- `coleccionista` — Jugar al menos 1 run con cada arquetipo

**Meta:**
- `hall_full` — Llenar el Hall of Fame (20 legendarios)
- `arbol_completo` — Desbloquear todo el Legacy Tree
- `todas_las_cartas` — Coleccionar las 28 cartas tácticas

#### 2. SECRETOS Y EASTER EGGS
Los roguelikes viven de descubrimientos ocultos. Rabona tiene CERO easter eggs. Necesita:

- **Encuentros raros en el Mapa** (~5% chance): Un nodo "???" especial con outcomes únicos
  - "El fantasma del 94" — aparece Don Miguel joven, te regala reliquia legendaria
  - "Portal dimensional" — un partido amistoso vs tu propio equipo de un run anterior
  - "El coleccionista" — te ofrece intercambiar 2 reliquias por 1 legendaria
- **Combinaciones secretas**: Si equipas ciertas reliquias + cartas juntas, efecto hidden bonus
  - Ej: Botines del 94 + La Maldición del 94 + Don Miguel = "El Run del 94" (achievement + bonus)
- **Rival secreto**: En Liga Intergaláctica, 5% chance de enfrentar "Los Inmortales" (equipo de tu Hall of Fame)
- **Nombres de jugadores**: Rarísimamente (~0.5%) generar un jugador con nombre legendario real (referencia)
- **Diálogos ocultos de Don Miguel** según combinaciones específicas de arquetipo + coach

#### 3. MODO HISTORIA / NARRATIVA EXPANDIDA
Las cutscenes existen (6) pero la narrativa es mínima. Falta:

- **Narrativa de Don Miguel**: Un arco que se revela poco a poco entre runs
  - Flashbacks del torneo del 94 (desbloquean con achievements)
  - Cada liga nueva revela un capítulo (qué pasó en ese torneo)
  - El twist: el rival final de Intergaláctica tiene conexión con el 94
- **Rival Nemesis narrativo**: No solo stats boost, sino diálogos pre/post match
- **Eventos de vestuario con consecuencias a largo plazo** (actualmente son one-shot)

### PRIORIDAD MEDIA — Modos y Rejugabilidad

#### 4. MODOS DE JUEGO ADICIONALES
Solo hay 1 modo (run estándar). Los roguelikes exitosos tienen:

- **Daily Challenge**: Seed fijo del día, todos juegan el mismo run, compare results
  - Mismo roster inicial, mismas reliquias disponibles, mismos rivales
  - Leaderboard local (no necesita backend — score basado en liga alcanzada + goles + monedas)
- **Modo Desafío Semanal**: Restricciones rotativas
  - "Solo defensores pueden anotar"
  - "Sin portero"
  - "Presupuesto 0 — solo jugadores gratis"
  - "Speedrun — 3 minutos por partido"
- **Modo Endless / Ascensión Infinita**: Después de ganar Intergaláctica, sigue subiendo dificultad
  - Liga ??? con rivales cada vez más fuertes
  - Cuántas jornadas sobrevives
  - Leaderboard: "mayor cantidad de jornadas en endless"

#### 5. MASCOTA / COMPANION SYSTEM
Idea muy roguelike (como el perro de Hades):

- **El Perro del Barrio** 🐕 — Mascota que encuentras en tu primer run
  - Aparece en pantallas (title, table, death)
  - Sube de nivel entre runs (como Cerbero en Hades)
  - Le puedes dar monedas para alimentarlo → desbloquea micro-bonos
  - Diferentes reacciones según resultado (celebra victorias, te consuela en derrotas)
  - Skins desbloqueables: bandana del equipo, corona, gafas de sol
- **Evolución**: Con suficientes runs → el perro "evoluciona" visualmente
- **Easter egg**: Si lo nombras "Pelé" o "Maradona", efecto especial

#### 6. SISTEMA DE SINERGIAS VISIBLES
Las sinergias entre reliquias/cartas/arquetipos existen en data pero NO se muestran al jugador:

- Mostrar "Sinergia activa!" cuando combinas relic + archetype que hacen match
- Tooltip en reliquias mostrando "Combina con: El Caudillo, carta Presión Final"
- Panel de sinergias descubiertas en StatsScreen (como un codex)

### PRIORIDAD BAJA — Polish y Social

#### 7. COMPARTIR / SOCIAL REAL
- **Share run summary** como imagen (canvas → PNG)
  - "#RabonaRun42 | 🦅 Caudillo | Liga Mundial | 24W 3D 5L | 👑 Martínez (18 goles)"
- **Export/Import save** para backup/transferir dispositivos
- **Códigos de seed**: "Juega mi mismo run" — compartir la seed de generación

#### 8. SONIDO Y AMBIENTACIÓN
- Más SFX para eventos (actualmente básico con Tone.js)
- Música de ambiente por liga (8-bit barrio → épica intergaláctica)
- Crowd noise durante partidos

#### 9. PERSONALIZACIÓN
- **Nombre del equipo** personalizable
- **Kit colors** elegibles
- **Escudo** generador simple (forma + color + símbolo)
- **Celebración de gol** personalizable

---

## ESTADO DE TESTS
```bash
npm test  # 116 tests (helpers, save, careerLogic, engine)
```
Todos los cambios recientes son UI/persistencia — no deberían romper tests.

## ARQUITECTURA CLAVE
- Client-side only, localStorage saves
- Zustand store, generator-based match engine
- Canvas rendering con steering behaviors
- PWA standalone portrait
