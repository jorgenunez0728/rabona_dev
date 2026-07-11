# Rabona — Handoff UI/UX v4.0 → Continuación de Desarrollo

## Contexto para quien retome este trabajo

Este documento es un **handoff** para continuar la modernización de UI/UX de Rabona (PWA football manager roguelike, React + Vite, client-side only). Las Fases 0-6 del plan original ya están **implementadas y pusheadas** en la rama `claude/modernize-ui-v4-mkEYb`. Este documento describe qué se hizo, cómo está estructurado el sistema de diseño resultante, y qué queda pendiente para llevar el pulido visual al nivel de un juego móvil premium (referencia: FIFA Ultimate Team / eFootball / Football Manager Mobile).

**Repo**: `jorgenunez0728/rabona_dev`
**Rama activa**: `claude/modernize-ui-v4-mkEYb`
**Tests**: 146 pasando (`npm test`) — no romper ninguno
**Build**: `npm run build` debe compilar sin errores

---

## Qué se hizo (Fases 0-6, ya completado)

### Fase 0 — Fundación
- Extraídos los estilos inline (`fw-btn`, `fw-anim`, etc.) del `<style>` embebido en `Rabona.jsx` hacia `src/game/theme.css`.
- Extendido el objeto de design tokens `T` en `src/game/data/visuals.js` con:
  - Spacing scale (`sp1`-`sp12`, grid de 4px)
  - Border radius (`r1`-`r4`, `rFull`)
  - Z-index layers (`zNav`, `zOverlay`, `zModal`, `zToast`)
  - Transition presets (`transQuick`, `transBase`, `transSlow`)
  - Colores de identidad futbolística (`pitch`, `pitchLight`, `stadiumBlue`, `fieldLine`)
  - Elevation shadows (`elev1`-`elev4`)
- Nuevos keyframes CSS en `theme.css`: `cardFlip`, `numberRoll`, `slideInFromRight/Left`, clases `.skeleton-line`, `.card-collectible`, `.stat-bar-animated`, `.badge-glow`, `.section-header`.

### Fase 1 — Librería de componentes de juego
- **Nuevo archivo**: `src/game/components/ui.jsx` con 13 primitivas reutilizables:
  `GameButton`, `GlassCard`, `SectionHeader`, `StatBar`, `TabBar`, `Badge`, `PosBadge`, `OvrBadge`, `ResourceBar`, `EmptyState`, `NumberCounter`, `ScreenHeader`, `Divider`.
- `PlayerCard` en `components.jsx` mantiene variante horizontal (lista) + se preparó terreno para variante coleccionable vertical (**pendiente completar**, ver abajo).

### Fase 2 — Pantallas de alto impacto
- **RosterScreen**: diagrama de cancha (pitch) con gradiente verde y líneas de campo, avatares chibi en posiciones tácticas.
- **TableScreen**: dashboard hub mejorado.
- **BottomNav**: iconos Lucide React reemplazando símbolos Unicode, indicador de glow dorado en tab activo.

### Fase 3 — Pantallas emocionales
- **RewardsScreen**: celebración con confetti (ParticleSystem reutilizado), diseño gold para victorias.
- **PrematchScreen**: atmósfera de estadio con imagen de fondo, VS dramático.
- **TitleScreen**: fondo de estadio, jerarquía de botones mejorada.

### Fase 4 — Navegación y transiciones
- Transiciones direccionales entre pantallas (slide horizontal/vertical según contexto de navegación) vía `store.js` (`transDirection`).

### Fase 5 — Pantallas secundarias
- **MapScreen**: layout vertical de nodos con conectores de gradiente de color, círculos de icono más grandes (52px) con glow al elegir.
- **MarketScreen**: barras de stats visuales animadas reemplazando badges de texto, animaciones stagger.
- **TrainingScreen**: mismo tratamiento de barras de stats, haptics en selección.
- **CoachScreen**: indicador de pasos con dots más grandes (28px) y glow ring.
- **StatsScreen**: tab bar con highlight de fondo + escala en tab activo, Legacy Tree con animación number-roll.

### Fase 6 — Modo Carrera (Mi Leyenda)
- **CareerBars**: rediseñado con zonas de peligro visibles en 0 y 100 (estilo Reigns), pulso crítico bajo 8 / sobre 92.
- **RelationshipBar**: icono de NPC con badge de color por arco (Aliado/Rival/Traidor).
- **TraitBadge, MomentCard, CareerLegacyNode**: migrados de colores hardcodeados a tokens `T`.
- Las 7 pantallas de `CareerScreens.jsx` migradas a tokens de diseño consistentes.

---

## Estructura de archivos clave (dónde tocar)

```
src/game/data/visuals.js         # Objeto T — todos los design tokens (colores, spacing, sombras, fuentes)
src/game/theme.css                # Clases CSS reutilizables, keyframes, glassmorphism
src/game/components.jsx           # PlayerCard, PlayerDetailModal, CareerBars, RelationshipBar, etc.
src/game/components/ui.jsx        # Librería de primitivas UI (GameButton, GlassCard, StatBar, etc.)
src/game/components/BottomNav.jsx # Navegación inferior
src/game/CareerScreens.jsx        # 7 pantallas de Mi Leyenda
src/game/screens/*.jsx            # 15+ pantallas de Mi Club
src/pages/Rabona.jsx              # Router de pantallas, canvas de partido, transiciones
src/game/store.js                 # Estado global Zustand
```

---

## Qué queda pendiente (para que Fable continúe)

Esto es lo que **no** se alcanzó a hacer y que llevaría el pulido al siguiente nivel real de "juego premium":

### 1. `PlayerCardCollectible` — variante vertical FIFA UT (planeado, no implementado)
Actualmente `PlayerCard` solo tiene la variante horizontal de lista. Falta crear una variante vertical tipo carta coleccionable para usar en:
- RewardsScreen (Man of the Match)
- MarketScreen (grid 2-3 columnas en vez de lista)
- PlayerDetailModal (como header del modal)

Estructura sugerida:
- Header con gradiente por posición + glow de rareza
- Sprite chibi grande o número OVR prominente
- Barras de stats (ATK/DEF/VEL/PAR) visuales
- Borde con glow animado para legendary/evo
- Debe usar la clase `.card-collectible` ya definida en `theme.css` (Fase 0C) — falta darle contenido real en JSX.

### 2. Canvas del partido (`Rabona.jsx` — MatchScreen inline, ~1000+ líneas)
No se tocó. Es la pieza más compleja (steering behaviors, sprites, física de balón bezier, partículas). Podría beneficiarse de:
- Mejor UI overlay (marcador, minuto, momentum bar) con los nuevos tokens
- Transiciones más fluidas entre eventos de partido (gol, tarjeta, lesión)

### 3. RosterScreen — pulido del pitch diagram
El diagrama de cancha se agregó pero podría mejorar:
- Drag & drop real entre posiciones (actualmente es tap-based)
- Mejor feedback visual al arrastrar jugadores entre titular/reserva

### 4. Skeleton loading states
Definidos en CSS (`.skeleton-line`, `.skeleton-card`) pero no aplicados en ninguna pantalla real. Aplicar en StatsScreen y RewardsScreen en el primer frame de render (mientras se calculan datos pesados).

### 5. Auditoría de consistencia visual completa
Aunque se migraron las pantallas principales, vale la pena una pasada de QA:
- Buscar strings de color hardcodeados restantes (`#607d8b`, `rgba(...)` sueltos) fuera de `T` — sobre todo en pantallas menos visitadas (MascotScreen/Rufus, overlays, TutorialScreen)
- Verificar que todas las pantallas usan `T.fontHeading`/`T.fontBody` en vez de `'Oswald'`/`'Barlow'` literal
- Revisar `LevelUpModal.jsx` y `RelicDraftOverlay.jsx` — no fueron tocados en este pase

### 6. Rendimiento en dispositivos de gama baja
No se hizo profiling real. Verificar con Chrome DevTools throttling que las animaciones (glow, pulse, stagger) no generen jank en un Android de gama media.

### 7. Lighthouse / PWA audit
No se corrió. Verificar que el score de PWA se mantenga ≥90 después de todos los cambios visuales.

---

## Instrucciones de trabajo para Fable

1. Clonar/continuar sobre la rama `claude/modernize-ui-v4-mkEYb` (o crear una nueva rama a partir de ella si el flujo de trabajo lo requiere).
2. Antes de cualquier cambio, correr `npm test` (146 tests deben pasar) y `npm run build` para confirmar que el estado base es válido.
3. Priorizar en este orden:
   1. `PlayerCardCollectible` (impacto visual más alto, pieza que falta del sistema)
   2. Skeleton loading states (rápido, bajo riesgo)
   3. Auditoría de consistencia (`LevelUpModal`, `RelicDraftOverlay`, `TutorialScreen`, Rufus/Mascot)
   4. Pulido del canvas de partido (más complejo, dejar para el final)
4. Cada cambio visual debe:
   - Usar el objeto `T` de `src/game/data/visuals.js` — no colores hardcodeados nuevos
   - Reutilizar primitivas de `src/game/components/ui.jsx` cuando aplique, en vez de reinventar estilos inline
   - No usar Framer Motion ni otras libs nuevas de animación — todo CSS-only (`transform`/`opacity`, GPU-friendly)
   - Mantener touch targets ≥44px y `touchAction: 'manipulation'` en elementos interactivos
5. Verificar siempre: `npm test` (146 pass) + `npm run build` (exit 0) antes de considerar una tarea terminada.
6. Commits atómicos por sub-fase, mensajes descriptivos, sin mencionar modelos/IDs internos.

---

## Decisiones de diseño ya tomadas (no reabrir)

- **CSS-only, sin Framer Motion** — el bundle debe mantenerse liviano para mobile de gama baja.
- **Extender tokens `T`, no reemplazarlos** — cero breaking changes en pantallas no tocadas.
- **Librería de componentes propia** (`ui.jsx`), no Radix/shadcn — esos existen en el proyecto para otros fines pero el layer de juego tiene su propio sistema.
- **Estética**: dark premium (fondo `#080C14`), acentos dorados (`#F0C040`), glassmorphism ligero, inspiración FIFA Ultimate Team / Football Manager Mobile — no copiar literalmente referencias de otros géneros (RPG de equipo, etc.), solo el nivel de pulido.
