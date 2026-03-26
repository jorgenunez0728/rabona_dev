# Handoff: Overhaul "Mi Leyenda" (Modo Carrera Individual)

**Branch:** `claude/overhaul-single-player-mode-hq1SV`
**Progreso:** Plan aprobado, 0% implementado. No se ha escrito código todavía.
**Plan detallado:** `/root/.claude/plans/wobbly-coalescing-conway.md`

---

## Qué es Rabona

PWA football manager con metaprogresión roguelike. React + Vite, Zustand, client-side only, localStorage saves. Fut7 (7v7). Todo en español.

Tiene dos modos de juego que se renombran:
- **"Mi Club"** — modo manager roguelike (maduro, 670 líneas de store, 7+ sistemas profundos)
- **"Mi Leyenda"** — modo carrera individual tipo Reigns (MUY delgado, es lo que se overhaula)

---

## Estado Actual de "Mi Leyenda" (lo que existe hoy)

**Archivos actuales (todos leídos y entendidos):**
- `src/game/data/career.js` — **63 líneas.** 6 NPCs planos, 7 teams, 22 cartas narrativas, 4 match cards/posición, constantes de barras
- `src/game/careerLogic.js` — **54 líneas.** 6 funciones puras: initCareer, getCareerCards, getMatchCards, applyBarEffects, checkCareerEnd, applyAging
- `src/game/CareerScreens.jsx` — **313 líneas.** 5 pantallas: CareerCreateScreen, CareerCardScreen, CareerMatchScreen, CareerSeasonEnd, CareerEndScreen
- `src/game/store.js` — **670 líneas.** Career state minimal: `{ name, pos, age, season, bars:{rend,fis,rel,fam,men}, team, matchNum, goals, ratings, cardQueue, cast, history, retired, retireReason }`
- `src/game/save.js` — **190 líneas.** Version 3.5, migrations 3.0→3.5. careerGlobalStats NO existe todavía
- `src/game/data.js` — Barrel re-export, ya exporta career.js
- `src/game/components.jsx` — Tiene CareerBars component

**Problema:** Temporadas repetitivas, 0 metaprogresión, NPCs planos, partidos simples, sin razón para rejugar.

---

## Qué se debe implementar (7 sistemas nuevos)

### 1. Arcos Narrativos de NPCs
- 6 NPCs base (ya existen: Manos, Depredador, Doctora, Buitre, Familia, Don Miguel)
- 4 NPCs nuevos desbloqueables via metaprogresión (Fantasma, Presidenta, Promesa, Sombra)
- Cada NPC: relación 0-100, arco con fases (neutral→aliado/traidor/rival/leyenda), cartas exclusivas por fase, clímax narrativo
- Umbrales de relación en 25/50/75 disparan cambios de fase

### 2. Momentos Estelares (Signature Moments)
- ~25 eventos irrepetibles por carrera
- Triggers condicionales (season, goals, bars, team tier)
- Algunos otorgan traits, otros desbloquean paths (selección nacional)
- Se coleccionan entre carreras para metaprogresión

### 3. Traits de Personalidad
- ~12 rasgos desbloqueables según decisiones y estado de barras
- Max 4 activos por carrera
- Modifican efectos de cartas/aging
- Ejemplos: Líder (+10% rel), Lobo Solitario (+rend -rel), Mediático (+fam), Resiliente (aging -50%)

### 4. Career Legacy Tree (separado del roguelike)
- 6 ramas × 3 tiers = 18 nodos permanentes
- Ramas: Dinastía, Carisma, Físico, Ambición, Sabiduría, Colección
- Legend Points: +1/carrera, +1/arco NPC, +1/momento estelar, +2/top-tier team
- Desbloquea: NPCs extra, bars bonuses, aging delay, ver efectos, Don Miguel frecuente, galería

### 5. 80+ Cartas Narrativas (vs 22 actuales)
- Categorías: Vida Personal (15), Profesional (15), Cancha (15), Fama (15), NPC-arc (20+), Don Miguel (10)
- Cada carta: `condition`, `npcRel`, `traitProgress`, `weight`, `chain` (mini-cadenas 2-3)

### 6. Partidos Mejorados
- 8+ cartas por posición (vs 4), contexto de partido, momentos clutch, lesiones

### 7. Timeline / Stats de Carrera
- Pantalla visual entre temporadas: timeline, relaciones NPC, traits, momentos

---

## 3 Principios de Diseño CLAVE (del usuario, NO negociables)

### 1. NO hay decisiones "correctas"
Ambas opciones son LATERALES — mueven 2-3 barras en direcciones diferentes. El jugador gestiona equilibrio.
```
MAL:  "Ser amable con prensa" (+rel) vs "Evadir agresivamente" (-rel, +fam)  ← hay "correcto" obvio
BIEN: "Elogiar compañeros" (+rel:5, -fam:3) vs "Elogiar entrenador" (+rend:4, -men:2)  ← ambas válidas
```

### 2. Game over por MAX de TODAS las barras (estilo Reigns)
No solo en 0, también en 100:
```js
// MÍNIMOS
rend <= 0: "Sin rendimiento. Tu carrera se apagó."
fis <= 0:  "Lesión grave. Tu cuerpo dijo basta."
rel <= 0:  "Nadie te quiere. Rescisión."
fam <= 0:  "Olvidado. Ni los del barrio te recuerdan."
men <= 0:  '"El fútbol ya no me llena." Retiro por burnout.'
// MÁXIMOS
rend >= 100: "Obsesionado con la perfección. Tu cuerpo colapsó."
fis >= 100:  "Adicto al gimnasio. Perdiste la técnica y el vestuario."
rel >= 100:  "Demasiado complaciente. Te volviste invisible en la cancha."
fam >= 100:  "La fama te consumió. Solo queda el personaje."
men >= 100:  "Desconectado de la realidad. Nadie puede alcanzarte."
// EDAD
age >= 36:   "A los 36, incluso las leyendas cuelgan los botines."
```

### 3. Efectos calibrados ±3 a ±8
No ±15/±20 como ahora. Cada opción mueve mínimo 2 barras. Bars iniciales balanceadas: `{ rend: 45, fis: 50, rel: 50, fam: 30, men: 50 }`

---

## Archivos a Modificar (NO crear archivos nuevos)

| Archivo | Qué hacer | De→A (aprox) |
|---------|-----------|--------------|
| `src/game/data/career.js` | EXPANSIÓN MASIVA: NPCs, arcos, traits, momentos, legacy tree, 80+ cartas | 63→700+ líneas |
| `src/game/careerLogic.js` | Nuevas funciones: relaciones, traits, momentos, card chaining, checkCareerEnd max stats | 54→200+ líneas |
| `src/game/store.js` | Nuevo slice `careerGlobalStats`, expandir career state, acciones de legado | +60 líneas |
| `src/game/save.js` | Migration 3.5→3.6 para persistir careerGlobalStats | +15 líneas |
| `src/game/CareerScreens.jsx` | Mejorar 5 pantallas + CareerTimelineScreen + CareerLegacyScreen | 313→600+ líneas |
| `src/game/components.jsx` | Nuevos: RelationshipBar, TraitBadge, MomentCard | +60 líneas |
| `src/game/data.js` | Re-exportar nuevos exports de career.js | +1-2 líneas |
| `src/pages/Rabona.jsx` | Routing para nuevas career screens | +10 líneas |
| `src/game/screens/TitleScreen.jsx` | Renombrar botones "Mi Club" / "Mi Leyenda" | ~2 líneas |

---

## Orden de Implementación

### Fase 1: career.js (dividir en sub-etapas, es enorme)
1. CAREER_CAST expandido + NPC_ARCS + CAREER_CAST_UNLOCKABLE
2. CAREER_TRAITS + SIGNATURE_MOMENTS
3. CAREER_LEGACY_TREE
4. ALL_CAREER_CARDS expandido (80+ cartas, escribir en bloques de ~20)
5. MATCH_CARDS expandidas (8+/pos) + CAREER_CARDS_MIGUEL expandido
6. Constantes (BAR_NAMES, etc.)

### Fase 2: careerLogic.js
- updateNpcRelation, checkTraitTriggers, checkMomentTriggers
- getCareerCards mejorado (condiciones, arcos, pesos)
- checkCareerEnd con max stats
- calcLegendPoints, applyTraitEffects
- initCareer con valores balanceados

### Fase 3: store.js + save.js
- INITIAL_CAREER_GLOBAL_STATS slice
- Expanded career state: npcRelations, traits, triggeredMoments, decisionTags
- Career legacy actions: unlockCareerLegacy, saveCareerEnd
- Save migration 3.5→3.6

### Fase 4: CareerScreens.jsx + components.jsx
- CareerCreateScreen: legacy bonuses, NPCs desbloqueados
- CareerCardScreen: relación NPC visible, chain cards, trait progress
- CareerMatchScreen: más variedad, contexto, momentos clutch
- CareerSeasonEnd: arcos progress, traits cercanos
- CareerEndScreen: resumen épico, legacy points ganados
- NUEVAS: CareerTimelineScreen, CareerLegacyScreen
- Componentes: RelationshipBar, TraitBadge, MomentCard

### Fase 5: Integración
- data.js re-exports
- Rabona.jsx routing
- TitleScreen.jsx renombrado

### Fase 6: Tests + build + push

---

## Patrones del Codebase a Seguir

- **Datos como constantes exportadas** (arrays/objects, no clases)
- **Lógica pura** en careerLogic.js (sin React, sin DOM, sin side effects)
- **Store Zustand** con `set/get` pattern, acciones como métodos del store
- **Save migrations** con version string incrementando (`'3.5' → '3.6'`)
- **Todo en español** (textos, nombres, UI, variables internas en inglés)
- **Estilo visual**: `T` theme object, glass morphism, gradients, Oswald/Barlow fonts, clipPath polygons
- **No crear archivos nuevos** — expandir existentes
- **Barrel re-exports** en `data.js` para imports desde `@/game/data`

## Tests
```bash
npm test    # 116 tests (helpers, save, careerLogic, engine)
npm run build  # Production build
```
El test `careerLogic.test.js` existe y habrá que actualizarlo con los nuevos sistemas.

## Arquitectura Clave
- Client-side only, localStorage saves, no backend
- Zustand single store, generator-based match engine
- Canvas rendering con steering behaviors para partidos
- PWA standalone portrait, safe-area insets
