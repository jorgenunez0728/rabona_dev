# Rabona — Handoff / Estado del Proyecto

> Documento para continuar en una nueva conversación de Claude Code.
> Branch: `claude/enhance-ui-accessibility-0RamB`
> Fecha: 2026-03-23

---

## Resumen de lo hecho en esta sesión

### Commits en la rama (sobre `main`)
1. **`a618f0a`** — Sistema de imágenes de estadios (`stadiums/index.js`) con carga dinámica via `import.meta.glob`
2. **`2b0c2da`** — Sistema de chibi assets con emoji fallback, fuente Silkscreen, componentes `ChibiImg`, `CoachPortrait`, `NemesisPortrait`, `PosIcon`
3. **`9b7aece`** — 14 PNGs de estadios (niveles 0-6, front + pitch)

### Ya mergeado en `main` (PRs anteriores)
- Match engine completo (momentum, tactics, rival AI, stats, substitutions)
- Refactor: Zustand store, screens separados, data modules
- Save system con LZ compression + checksum
- 116 tests passing

---

## Assets: Estado actual

### Stadiums — COMPLETO
**Ubicación:** `src/assets/stadiums/`
**Estado:** 14/14 PNGs presentes
**Carga:** `import.meta.glob('./*.png')` en `index.js`
**Uso:**
- `PrematchScreen.jsx` → `getStadiumFront(league)` (fachada antes del partido)
- `Rabona.jsx` → `getStadiumPitch(league)` (vista aérea durante el match)

| Nivel | Nombre | front | pitch |
|-------|--------|-------|-------|
| 0 | Potrero (cancha barrial) | stadium_0_front.png | stadium_0_pitch.png |
| 1 | Liga Amateur | stadium_1_front.png | stadium_1_pitch.png |
| 2 | Liga Regional | stadium_2_front.png | stadium_2_pitch.png |
| 3 | El Coloso | stadium_3_front.png | stadium_3_pitch.png |
| 4 | Liga Nacional | stadium_4_front.png | stadium_4_pitch.png |
| 5 | Liga Continental | stadium_5_front.png | stadium_5_pitch.png |
| 6 | Arena Galáctica | stadium_6_front.png | stadium_6_pitch.png |

**Nota:** Todos los PNGs tienen fondo verde chroma (#00FF00). El código los muestra tal cual — si necesitas quitar el fondo, hay que procesarlos o hacerlo con CSS.

---

### Chibi Assets — PENDIENTES (todas las carpetas vacías)

**Registro:** `src/game/data/chibiAssets.jsx`
**Componentes:** `src/game/components.jsx` (`CoachPortrait`, `NemesisPortrait`, `PosIcon`)
**Fallback:** Emojis (el juego funciona 100% sin imágenes)
**Specs:** `src/assets/chibi/README.md`

#### Prioridad 1: Coaches (128x128px PNG transparente)
```
src/assets/chibi/coaches/
├── coach-miguel.png      👴 Don Miguel (elderly, wise)
├── coach-bestia.png      🦁 La Bestia (fierce, intense)
├── coach-lupe.png        👩‍🦳 Doña Lupe (grandmotherly, sharp)
├── coach-profeta.png     🔮 El Profeta (mystical, robed)
├── coach-chispa.png      ⚡ La Chispa (energetic, electric)
├── coach-fantasma.png    👻 El Fantasma (ghostly, hooded)
├── coach-moneda.png      🪙 La Moneda (wealthy, golden)
└── coach-zyx7.png        👽 Zyx-7 (alien, futuristic)
```

#### Prioridad 2: Nemesis (128x128px PNG transparente)
```
src/assets/chibi/coaches/
├── nemesis-cacique.png   🦅 El Cacique Paredes (eagle, warrior)
├── nemesis-cirujano.png  🔪 El Cirujano Delgado (precise, surgical)
├── nemesis-patron.png    🎩 El Patrón Sandoval (rich, top hat)
├── nemesis-chaman.png    🌀 El Chamán Orozco (mystical, swirling)
├── nemesis-tanque.png    🪖 El Tanque Ibarra (armored, tank-like)
├── nemesis-detective.png 🕵️ El Detective Mora (magnifying glass)
├── nemesis-jeque.png     💎 El Jeque Al-Rashid (luxury, diamonds)
└── nemesis-kx9.png       🤖 Kx-9 El Heraldo (robot, cybernetic)
```

#### Prioridad 3: Position Icons (64x64px PNG transparente)
```
src/assets/chibi/icons/
├── pos-gk.png    🧤 Goalkeeper (gloves, yellow)
├── pos-def.png   🛡 Defender (shield, blue)
├── pos-mid.png   ⚙ Midfielder (gear, green)
└── pos-fwd.png   ⚡ Forward (lightning, red)
```

#### Prioridad 4: Extras (opcionales para MVP)
```
src/assets/chibi/icons/
├── status-injured.png
├── status-fatigued.png
└── status-captain.png

src/assets/chibi/items/     → Relics & consumables (64x64)
src/assets/chibi/ui/        → Card frames, buttons (256x256 9-slice)
src/assets/chibi/backgrounds/ → Tileable patterns (512x512)
```

---

## Paleta de colores para assets

| Token | Hex | Uso |
|-------|-----|-----|
| bg | `#0D1117` | Fondo oscuro principal |
| win | `#3FB950` | Verde/éxito |
| lose | `#F85149` | Rojo/peligro |
| draw | `#D29922` | Amarillo/empate |
| info | `#58A6FF` | Azul/info |
| gold | `#FFD700` | Dorado/premium |
| purple | `#A855F7` | Morado/reliquias |

---

## Arquitectura de assets (cómo funciona)

### Stadiums
```
src/assets/stadiums/index.js
  → import.meta.glob('./*.png') carga todos los PNG
  → getStadiumFront(league) / getStadiumPitch(league)
  → Usado en PrematchScreen.jsx y Rabona.jsx
```

### Chibi
```
src/game/data/chibiAssets.jsx
  → CHIBI registry (paths + emoji fallbacks)
  → ChibiImg component (auto-fallback on load error)
  → Usado via CoachPortrait, NemesisPortrait, PosIcon en components.jsx
```

Solo hay que poner los PNGs en las carpetas correctas. No hace falta tocar código — el sistema ya está cableado.

---

## Archivos clave para referencia

| Archivo | Qué hace |
|---------|----------|
| `src/assets/stadiums/index.js` | Loader de imágenes de estadios |
| `src/game/data/chibiAssets.jsx` | Registry de assets chibi + componente ChibiImg |
| `src/assets/chibi/README.md` | Specs detalladas para generar assets |
| `src/game/components.jsx` | Componentes que usan chibi (CoachPortrait, etc.) |
| `src/game/screens/PrematchScreen.jsx` | Pantalla que muestra fachada del estadio |
| `src/pages/Rabona.jsx` | Match sim que muestra pitch del estadio |
| `src/game/data/visuals.js` | Sprites de jugadores (dibujados por código, no assets) |
| `src/game/store.js` | Zustand store (estado global) |

---

## MVP — Lo mínimo para que se vea completo

1. **Stadiums** — HECHO
2. **8 coach portraits** — Se muestran en selección de coach y pantallas de partido
3. **8 nemesis portraits** — Se muestran cuando enfrentas al rival especial
4. **4 position icons** — Se muestran en el roster junto a cada jugador

**Total MVP: 20 PNGs** (+ los 14 stadiums ya hechos = 34 total)

Todo lo demás (items, UI frames, backgrounds) es polish post-MVP.

---

## Para la próxima sesión

```
Contexto: Estoy trabajando en Rabona, un football manager en React+Vite.
Branch: claude/enhance-ui-accessibility-0RamB
Lee HANDOFF.md para el estado completo del proyecto.
```
