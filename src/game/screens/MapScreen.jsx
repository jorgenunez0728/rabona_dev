import { useState } from 'react';
import { SFX } from '@/game/audio';
import { T } from '@/game/data';
import useGameStore from '@/game/store';
import { pick, rnd } from '@/game/data/helpers.js';
import { CURSES } from '@/game/data/progression.js';
import { hasLegacy } from '@/game/data/progression.js';
import { TACTICAL_CARDS, getUnlockableCards } from '@/game/data/cards.js';
import { MANAGER_ARCHETYPES } from '@/game/data/archetypes.js';

// ── Node definitions for between-matchday events ──
const MAP_NODES = [
  {
    id: 'vestuario', n: 'Vestuario', i: '🚪', color: '#a855f7',
    d: 'Evento del vestuario. Decisiones con consecuencias.',
    weight: 3,
  },
  {
    id: 'mercado_negro', n: 'Mercado Negro', i: '🕶', color: '#ff9800',
    d: 'Compra/venta de jugadores con precios volátiles.',
    weight: 2,
  },
  {
    id: 'entrenamiento', n: 'Entrenamiento Extra', i: '💪', color: '#00e676',
    d: 'Sesión especial. Sube stats a 1-2 jugadores.',
    weight: 3,
  },
  {
    id: 'descanso', n: 'Descanso', i: '🏥', color: '#42a5f5',
    d: 'Recuperar fatiga y lesiones. Pierdes oportunidad.',
    weight: 2,
  },
  {
    id: 'curandero', n: 'Curandero', i: '🧹', color: '#ef5350',
    d: 'Elimina una maldición activa. Cuesta monedas.',
    weight: 1, requiresCurse: true,
  },
  {
    id: 'sponsor', n: 'Sponsor', i: '🤝', color: '#ffd600',
    d: 'Gana monedas a cambio de una restricción temporal.',
    weight: 2,
  },
  {
    id: 'misterio', n: '???', i: '❓', color: '#607d8b',
    d: 'Nodo ciego. Puede ser cualquier cosa.',
    weight: 1, blind: true,
  },
  {
    id: 'carta_tactica', n: 'Carta Táctica', i: '🎴', color: '#9c27b0',
    d: 'Encuentra una carta táctica temporal para este run.',
    weight: 1,
  },
];

function pickNodes(game, globalStats) {
  const hasCurses = (game.curses || []).length > 0;
  const pool = MAP_NODES.filter(n => {
    if (n.requiresCurse && !hasCurses) return false;
    return true;
  });
  // Weighted pick of 2-3 unique nodes
  const count = Math.random() < 0.4 ? 3 : 2;
  const result = [];
  const used = new Set();
  for (let i = 0; i < count && pool.length > 0; i++) {
    const weights = pool.filter(n => !used.has(n.id)).map(n => n.weight);
    const total = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * total;
    const available = pool.filter(n => !used.has(n.id));
    for (const node of available) {
      r -= node.weight;
      if (r <= 0) { result.push(node); used.add(node.id); break; }
    }
  }
  return result;
}

// ── Node resolution effects ──
function resolveNode(nodeId, game, setGame, go, addCurse, removeCurse, globalStats) {
  const roster = [...game.roster];
  const starters = roster.filter(p => p.role === 'st');
  let coins = game.coins;
  let chem = game.chemistry;

  switch (nodeId) {
    case 'entrenamiento': {
      // Boost 2 random starters
      const targets = [];
      const pool = [...starters];
      for (let i = 0; i < Math.min(2, pool.length); i++) {
        const idx = rnd(0, pool.length - 1);
        const p = pool.splice(idx, 1)[0];
        const stat = pick(['atk', 'def', 'spd']);
        const boost = rnd(1, 2);
        const rp = roster.find(r => r.id === p.id);
        if (rp) { rp[stat] += boost; rp.fatigue = Math.min(100, (rp.fatigue || 0) + 15); }
        targets.push({ name: p.name, stat, boost });
      }
      setGame(g => ({ ...g, roster: [...roster] }));
      return { text: `Entrenamiento completado: ${targets.map(t => `${t.name} +${t.boost} ${t.stat.toUpperCase()}`).join(', ')}`, icon: '💪' };
    }

    case 'descanso': {
      roster.filter(p => p.role === 'st').forEach(p => {
        p.fatigue = Math.max(0, (p.fatigue || 0) - 30);
        if ((p.injuredFor || 0) > 0) p.injuredFor = Math.max(0, p.injuredFor - 1);
      });
      setGame(g => ({ ...g, roster: [...roster] }));
      return { text: 'El equipo descansó. -30% fatiga, -1 turno de lesión.', icon: '🏥' };
    }

    case 'mercado_negro': {
      // Volatile price deal: sell a reserve for good money or lose coins
      const hasReserves = roster.filter(p => p.role === 'rs').length > 0;
      if (hasReserves && Math.random() < 0.6) {
        const bonus = rnd(15, 35);
        const worst = roster.filter(p => p.role === 'rs').sort((a, b) => (a.atk + a.def + a.spd) - (b.atk + b.def + b.spd))[0];
        setGame(g => ({ ...g, roster: g.roster.filter(p => p.id !== worst.id), coins: g.coins + bonus }));
        return { text: `Vendiste a ${worst.name} en el mercado negro por ${bonus} monedas.`, icon: '🕶' };
      }
      // Boost a random starter for a fee
      const cost = rnd(10, 20);
      if (coins >= cost) {
        const target = pick(starters.filter(p => p.pos !== 'GK'));
        if (target) {
          const stat = pick(['atk', 'def', 'spd']);
          const rp = roster.find(r => r.id === target.id);
          if (rp) rp[stat] += rnd(2, 3);
          setGame(g => ({ ...g, roster: [...roster], coins: g.coins - cost }));
          return { text: `Entrenador privado para ${target.name} por ${cost} monedas. +stats.`, icon: '🕶' };
        }
      }
      return { text: 'El mercado negro no tiene ofertas interesantes hoy.', icon: '🕶' };
    }

    case 'curandero': {
      const curses = game.curses || [];
      if (curses.length > 0) {
        // Pick the curse with highest mastery progress (most invested)
        const sorted = [...curses].sort((a, b) => (b.masteryProgress || 0) - (a.masteryProgress || 0));
        const curse = sorted[0];
        const cost = rnd(10, 20);
        const masteryPct = curse.masteryThreshold ? Math.floor(((curse.masteryProgress || 0) / curse.masteryThreshold) * 100) : 0;
        if (coins >= cost) {
          removeCurse(curse.id);
          setGame(g => ({ ...g, coins: g.coins - cost }));
          return { text: `Maldición "${curse.n}" removida por ${cost} monedas.${masteryPct > 50 ? ` (Perdiste ${masteryPct}% de maestría)` : ''}`, icon: '🧹' };
        }
        return { text: `No tienes ${cost} monedas para el curandero. (${curse.n}: ${masteryPct}% maestría)`, icon: '🧹' };
      }
      return { text: 'No tienes maldiciones activas.', icon: '🧹' };
    }

    case 'carta_tactica': {
      // Find a random card not already in loadout
      const currentLoadout = game.cardLoadout || [];
      const available = TACTICAL_CARDS.filter(c => !currentLoadout.includes(c.id));
      if (available.length === 0) {
        return { text: 'No hay cartas disponibles.', icon: '🎴' };
      }
      const card = pick(available);
      setGame(g => ({ ...g, cardLoadout: [...(g.cardLoadout || []), card.id] }));
      return { text: `Encontraste: ${card.i} ${card.n} — ${card.d} (solo este run)`, icon: '🎴' };
    }

    case 'sponsor': {
      const sponsorCoins = rnd(15, 30);
      // Random restriction
      const restrictions = [
        { text: `+${sponsorCoins} monedas, pero -5 química por 2 partidos.`, chem: -5 },
        { text: `+${sponsorCoins} monedas. El sponsor exige ganar el próximo partido.`, chem: 0 },
      ];
      const r = pick(restrictions);
      setGame(g => ({ ...g, coins: g.coins + sponsorCoins, chemistry: Math.max(0, g.chemistry + r.chem) }));
      return { text: r.text, icon: '🤝' };
    }

    case 'vestuario': {
      // Random vestuario event with possible curse
      const events = [
        { text: 'Charla motivacional. +8 química.', chem: 8, curse: null },
        { text: 'Pelea en el vestuario. -5 química, pero moral +10.', chem: -5, curse: null },
        { text: 'Un periodista filtró información privada.', chem: -3, curse: 'prensa_hostil' },
        { text: 'Sesión de video del rival. +3 química.', chem: 3, curse: null },
      ];
      const ev = pick(events);
      chem = Math.max(0, Math.min(99, chem + ev.chem));
      setGame(g => ({ ...g, chemistry: chem }));
      if (ev.curse) addCurse(ev.curse);
      return { text: ev.text, icon: '🚪' };
    }

    case 'misterio': {
      // Random: could be good or bad
      const outcomes = [
        { text: '¡Encuentras un botín! +20 monedas.', fx: () => setGame(g => ({ ...g, coins: g.coins + 20 })) },
        { text: 'Emboscada mediática. Maldición: Fatiga Mental.', fx: () => addCurse('fatiga_mental') },
        { text: 'Un viejo amigo de Don Miguel llega a ayudar. +10 química.', fx: () => setGame(g => ({ ...g, chemistry: Math.min(99, g.chemistry + 10) })) },
        { text: 'Nada especial. Solo silencio.', fx: () => {} },
      ];
      const outcome = pick(outcomes);
      outcome.fx();
      return { text: outcome.text, icon: '❓' };
    }

    default:
      return { text: 'Nada pasó.', icon: '⚽' };
  }
}

export default function MapScreen() {
  const { game, globalStats, go, setGame, addCurse, removeCurse } = useGameStore();
  const [nodes] = useState(() => pickNodes(game, globalStats));
  const [result, setResult] = useState(null);
  const [chosen, setChosen] = useState(null);

  const handleChoose = (node) => {
    if (chosen) return;
    SFX.play('click');
    setChosen(node.id);
    // Reveal blind nodes
    const actualNode = node.blind ? pick(MAP_NODES.filter(n => !n.blind && !n.requiresCurse)) : node;
    const res = resolveNode(actualNode.id, game, setGame, go, addCurse, removeCurse, globalStats);
    setResult({ ...res, nodeId: actualNode.id });
    // Track map choice for run history
    setGame(g => ({ ...g, mapChoices: [...(g.mapChoices || []), { matchNum: g.matchNum, nodeType: actualNode.id }] }));
  };

  const handleContinue = () => {
    SFX.play('click');
    go('prematch');
  };

  const curses = game.curses || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'auto', background: T.bg }}>
      {/* Stadium atmosphere glow */}
      <div className="stadium-glow" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <div style={{ width: '100%', padding: '20px 16px 12px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 22, color: T.tx, textTransform: 'uppercase', letterSpacing: 3 }}>
          Entre Jornadas
        </div>
        <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.tx3, marginTop: 6 }}>
          Jornada {game.matchNum + 1} · Elige tu camino
        </div>
        <div className="divider-subtle" style={{ marginTop: 12, maxWidth: 200, marginLeft: 'auto', marginRight: 'auto' }} />
      </div>

      {/* Active Curses with mastery bars */}
      {curses.length > 0 && (
        <div style={{ width: '100%', maxWidth: 400, padding: '0 16px', marginBottom: 10, position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: T.fontHeading, fontSize: 11, color: T.lose, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>
            Maldiciones Activas
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {curses.map((c, i) => {
              const masteryPct = c.masteryThreshold ? Math.min(100, Math.floor(((c.masteryProgress || 0) / c.masteryThreshold) * 100)) : 0;
              return (
                <div key={i} className="glass" style={{ borderRadius: 8, padding: '8px 12px', borderColor: 'rgba(239,68,68,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: T.lose, fontFamily: T.fontBody, fontWeight: 500 }}>
                      {c.i} {c.n} {c.remaining > 0 ? `(${c.remaining})` : ''}
                    </span>
                    {c.blessing && (
                      <span style={{ fontSize: 10, color: T.gold, fontFamily: T.fontBody }}>{masteryPct}% → {c.blessing.i}</span>
                    )}
                  </div>
                  {c.masteryThreshold && (
                    <div className="stat-bar" style={{ height: 4 }}>
                      <div className="stat-bar-fill" style={{ width: `${masteryPct}%`, background: masteryPct >= 100 ? T.gradientPrimary : 'linear-gradient(90deg,#EF4444,#F59E0B)' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Active Blessings */}
      {(game.blessings || []).length > 0 && (
        <div style={{ width: '100%', maxWidth: 400, padding: '0 16px', marginBottom: 10, position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: T.fontHeading, fontSize: 11, color: T.gold, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>
            Bendiciones
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(game.blessings || []).map((b, i) => (
              <div key={i} className="glass" style={{ borderRadius: 6, padding: '4px 10px', fontSize: 11, color: T.gold, fontFamily: T.fontBody, borderColor: `${T.gold}25` }}>
                {b.i} {b.n}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Nodes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 16px', width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        {/* Visual: connecting lines */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 4 }}>
          {nodes.map((_, i) => (
            <div key={i} style={{ width: 2, height: 24, background: T.border, borderRadius: 1 }} />
          ))}
        </div>

        {nodes.map((node, i) => {
          const isChosen = chosen === node.id;
          const disabled = chosen && !isChosen;
          return (
            <div
              key={i}
              onClick={() => !disabled && handleChoose(node)}
              className={isChosen ? 'card-gold' : 'glass'}
              style={{
                borderRadius: 10,
                padding: '16px 14px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.25 : 1,
                transition: 'all 0.25s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                minHeight: 64,
                touchAction: 'manipulation',
                transform: isChosen ? 'scale(1.02)' : 'scale(1)',
                borderColor: isChosen ? T.gold : disabled ? 'rgba(255,255,255,0.03)' : T.glassBorder,
                boxShadow: isChosen ? T.glowGold : T.shadow,
              }}
            >
              <div style={{
                fontSize: 30, minWidth: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${node.color}15`, borderRadius: 10, flexShrink: 0,
              }}>{node.i}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 15, color: isChosen ? T.gold : T.tx, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {node.n}
                </div>
                <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx3, lineHeight: 1.4, marginTop: 3 }}>
                  {node.d}
                </div>
              </div>
              {!chosen && (
                <div style={{ fontSize: 18, color: T.tx4, fontWeight: 300 }}>›</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Continue button - appears right after header when result is ready */}
      {result && (
        <div style={{ width: '100%', maxWidth: 400, padding: '0 16px 4px', position: 'relative', zIndex: 1 }}>
          <button
            onClick={handleContinue}
            className="fw-btn fw-btn-green"
            style={{
              width: '100%', fontFamily: T.fontHeading, fontWeight: 700, fontSize: 15,
              padding: '14px 24px', textTransform: 'uppercase', letterSpacing: 1.5,
              touchAction: 'manipulation', borderRadius: 10,
              boxShadow: '0 4px 20px rgba(34,197,94,0.25)',
            }}
          >
            Continuar al Partido →
          </button>
        </div>
      )}

      {/* Skip option - visible without scrolling */}
      {!chosen && (
        <div style={{ width: '100%', maxWidth: 400, padding: '0 16px 4px', position: 'relative', zIndex: 1 }}>
          <button
            onClick={() => { SFX.play('click'); go('prematch'); }}
            className="fw-btn fw-btn-outline"
            style={{
              width: '100%', fontFamily: T.fontHeading, fontWeight: 600, fontSize: 12,
              padding: '11px 20px', textTransform: 'uppercase', letterSpacing: 1,
              touchAction: 'manipulation', borderRadius: 10,
            }}
          >
            Saltar directo al partido →
          </button>
        </div>
      )}

      {/* Result display */}
      {result && (
        <div style={{ width: '100%', maxWidth: 400, padding: '8px 16px', position: 'relative', zIndex: 1 }}>
          <div className="glass-heavy" style={{
            borderRadius: 12,
            padding: '16px 18px',
            textAlign: 'center',
            borderColor: T.glassBorder,
          }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>{result.icon}</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx, lineHeight: 1.5 }}>
              {result.text}
            </div>
          </div>
        </div>
      )}

      {/* Bottom spacer */}
      <div style={{ height: 24 }} />
    </div>
  );
}
