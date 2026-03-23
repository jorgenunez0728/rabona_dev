# Chibi Pixel Art Assets — Rabona

## Specs for AI Generation

### General Requirements
- **Format**: PNG with transparency
- **Size**: 64x64px (icons, small elements) or 128x128px (portraits, characters)
- **Style**: Chibi pixel art — 2-4 head-to-body ratio, bold dark outlines (2px), clean shapes
- **Palette**: Bright, saturated colors on transparent background (will display on dark `#0D1117` bg)
- **Naming**: `lowercase-kebab-case.png` (e.g., `coach-miguel.png`)

### Asset Categories

#### `/coaches/` — Coach Portraits (128x128)
Full chibi portraits for each playable coach:
- `coach-miguel.png` — Don Miguel (👴 elderly man, warm, wise)
- `coach-bestia.png` — La Bestia (🦁 fierce, intense, lion-like)
- `coach-lupe.png` — Doña Lupe (👩‍🦳 elderly woman, grandmotherly, sharp)
- `coach-profeta.png` — El Profeta (🔮 mystical, crystal ball, robed)
- `coach-chispa.png` — La Chispa (⚡ energetic, electric, fast)
- `coach-fantasma.png` — El Fantasma (👻 ghostly, mysterious, hooded)
- `coach-moneda.png` — La Moneda (🪙 wealthy, coin motif, golden)
- `coach-zyx7.png` — Zyx-7 (👽 alien, futuristic, sci-fi)

#### `/coaches/` — Nemesis Portraits (128x128)
- `nemesis-cacique.png` — El Cacique Paredes (🦅 eagle, veteran warrior)
- `nemesis-cirujano.png` — El Cirujano Delgado (🔪 precise, surgical)
- `nemesis-patron.png` — El Patrón Sandoval (🎩 rich, top hat)
- `nemesis-chaman.png` — El Chamán Orozco (🌀 mystical, swirling)
- `nemesis-tanque.png` — El Tanque Ibarra (🪖 armored, tank-like)
- `nemesis-detective.png` — El Detective Mora (🕵️ detective, magnifying glass)
- `nemesis-jeque.png` — El Jeque Al-Rashid (💎 luxury, diamonds)
- `nemesis-kx9.png` — Kx-9 El Heraldo (🤖 robot, cybernetic)

#### `/icons/` — Position & Status Icons (64x64)
- `pos-gk.png` — Goalkeeper (gloves, yellow)
- `pos-def.png` — Defender (shield, blue)
- `pos-mid.png` — Midfielder (gear/compass, green)
- `pos-fwd.png` — Forward (lightning, red)
- `status-injured.png` — Injured indicator
- `status-fatigued.png` — Fatigue indicator
- `status-captain.png` — Captain armband

#### `/items/` — Relics & Consumables (64x64)
Pixel art icons for each in-game relic. Match their emoji themes.

#### `/ui/` — UI Elements (various sizes)
- `card-frame-normal.png` — Normal card border (256x256, 9-slice)
- `card-frame-rare.png` — Rare card border (purple glow)
- `card-frame-legendary.png` — Legendary card border (gold glow)
- `divider.png` — Section divider (256x8)
- `button-bg.png` — Button background (9-slice)

#### `/backgrounds/` — Screen Backgrounds (512x512, tileable)
- `bg-pitch.png` — Football pitch pattern
- `bg-stadium.png` — Stadium atmosphere
- `bg-stars.png` — Starfield (for intergalactic theme)

### Color Reference (Game Palette)
| Token | Hex | Usage |
|-------|-----|-------|
| bg | #0D1117 | Main background |
| win | #3FB950 | Success/green |
| lose | #F85149 | Danger/red |
| draw | #D29922 | Warning/yellow |
| info | #58A6FF | Info/blue |
| gold | #FFD700 | Premium/gold |
| purple | #A855F7 | Rare/relics |
