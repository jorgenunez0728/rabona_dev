import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("github");

    // First, find the Rabona repo
    const reposRes = await fetch('https://api.github.com/user/repos?per_page=100&sort=created&direction=desc', {
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    const repos = await reposRes.json();
    const rabona = repos.find(r => r.name.toLowerCase() === 'rabona');

    if (!rabona) {
      return Response.json({ error: 'No se encontró el repo "Rabona". Repos disponibles: ' + repos.map(r => r.name).join(', ') }, { status: 404 });
    }

    const owner = rabona.owner.login;
    const repo = rabona.name;

    const { action } = await req.json().catch(() => ({ action: 'list' }));

    if (action === 'create') {
      // Known bugs from code review
      const bugs = [
        {
          title: "🐛 CoachScreen: startRun no guarda referencia al coach seleccionado",
          body: "## Descripción\nAl presionar 'Comenzar' en la pantalla de selección de entrenador, la función `startRun(coach)` no guardaba la referencia del coach, impidiendo que el flujo de selección de reliquia inicial y posterior `confirmStart` funcionaran.\n\n## Severidad\n🔴 **Crítica** — Bloquea el inicio de una nueva partida.\n\n## Archivo\n`pages/Rabona.jsx` — `CoachScreen` component\n\n## Estado\nCorregido — se añadió `pendingCoach` state.",
          labels: ["bug", "critical", "fixed"]
        },
        {
          title: "🐛 CoachScreen: Overlay de selección de reliquia inicial no se renderiza",
          body: "## Descripción\nEl overlay para elegir la reliquia inicial (safe vs cursed) no existía en el JSX del `CoachScreen`. El state `startingRelicPair` se seteaba pero no había UI para mostrarlo.\n\n## Severidad\n🔴 **Crítica** — Sin el overlay, no hay forma de avanzar después de elegir coach.\n\n## Archivo\n`pages/Rabona.jsx` — `CoachScreen` return JSX\n\n## Estado\nCorregido — se añadió overlay de selección de reliquia.",
          labels: ["bug", "critical", "fixed"]
        },
        {
          title: "🐛 Match Simulation: xpGain variable no definida en scope de LevelUp modal",
          body: "## Descripción\nEn el overlay de `pendingLevelUp` (línea ~1798), se referencia `xpGain` pero esta variable solo existe dentro del scope de `RewardsScreen`/`runSim`. El modal de level-up está en el render principal, donde `xpGain` no está definido.\n\n## Severidad\n🟡 **Media** — Puede causar NaN en cálculos de XP al subir de nivel.\n\n## Archivo\n`pages/Rabona.jsx` — `pendingLevelUp` overlay\n\n## Reproducción\n1. Jugar un partido\n2. Un jugador sube de nivel\n3. Elegir mejora → XP puede calcularse mal",
          labels: ["bug", "medium"]
        },
        {
          title: "🐛 Archivo Rabona.jsx demasiado grande (~1800 líneas) — difícil de mantener",
          body: "## Descripción\n`pages/Rabona.jsx` contiene TODO el juego en un solo archivo de ~1800 líneas. Esto hace el código muy difícil de mantener, debuggear y modificar.\n\n## Recomendación\nRefactorizar en componentes separados:\n- `CoachScreen.jsx`\n- `TableScreen.jsx`\n- `MatchScreen.jsx`\n- `RewardsScreen.jsx`\n- `PrematchScreen.jsx`\n- etc.\n\n## Severidad\n🔵 **Baja (tech debt)** — No es un bug funcional pero afecta la mantenibilidad.",
          labels: ["enhancement", "tech-debt"]
        },
        {
          title: "🐛 Copa: Perder en Copa mata el run pero no verifica roster mínimo",
          body: "## Descripción\nCuando pierdes en Copa, el juego va directo a `death` screen sin verificar si el roster tiene suficientes jugadores. Si `cursed_steal` roba jugadores al perder Y es Copa, podrían eliminarse jugadores antes de ir a la pantalla de muerte, causando posibles errores en el cálculo de stats finales.\n\n## Severidad\n🟡 **Media** — Edge case que puede causar errores en estadísticas finales.\n\n## Archivo\n`pages/Rabona.jsx` — línea ~1120-1123",
          labels: ["bug", "medium"]
        },
        {
          title: "🐛 Training: No valida que el jugador seleccionado siga existiendo en el roster",
          body: "## Descripción\nEn `TrainingScreen`, después de seleccionar un jugador para entrenar, si por algún state race condition el roster cambia, `game.roster.find(x => x.id === selected)` podría retornar undefined, causando un crash.\n\n## Severidad\n🟢 **Baja** — Muy poco probable pero posible.\n\n## Archivo\n`pages/Rabona.jsx` — `TrainingScreen` component",
          labels: ["bug", "low"]
        },
        {
          title: "🐛 Market: Comprar jugador no genera nuevo ID único",
          body: "## Descripción\nCuando compras un jugador del mercado, el objeto del jugador se añade directamente al roster. Si el mismo jugador aparece en dos mercados diferentes (poco probable pero posible con el sistema de generación), podrían existir IDs duplicados.\n\n## Severidad\n🟢 **Baja** — El generador de IDs usa `Math.random().toString(36)` que tiene baja probabilidad de colisión.\n\n## Archivo\n`pages/Rabona.jsx` — `MarketScreen` buy handler",
          labels: ["bug", "low"]
        },
        {
          title: "🐛 Save/Load: No hay validación de versión del save file",
          body: "## Descripción\nEl sistema de guardado no valida la versión del esquema. Si se añaden nuevos campos al game state (ej: relics, copa), un save antiguo puede causar errores al cargar porque faltan propiedades esperadas.\n\n## Recomendación\nAñadir `version` al save y migrar datos antiguos al cargar.\n\n## Severidad\n🟡 **Media** — Afecta a usuarios que actualizan el juego con partida guardada.\n\n## Archivo\n`game/save.js`",
          labels: ["bug", "medium"]
        }
      ];

      const created = [];
      for (const bug of bugs) {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: bug.title,
            body: bug.body,
            labels: bug.labels
          })
        });
        const issue = await res.json();
        created.push({ number: issue.number, title: issue.title, url: issue.html_url, status: res.status });
      }

      return Response.json({ success: true, repo: `${owner}/${repo}`, created });
    }

    // Default: list existing issues
    const issuesRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=50`, {
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    const issues = await issuesRes.json();

    return Response.json({
      repo: `${owner}/${repo}`,
      repoUrl: rabona.html_url,
      openIssues: issues.map(i => ({
        number: i.number,
        title: i.title,
        labels: i.labels?.map(l => l.name) || [],
        url: i.html_url,
        created: i.created_at
      })),
      count: issues.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});