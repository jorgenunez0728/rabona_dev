import { useState } from 'react';
import { SFX } from '@/game/audio';
import { T } from '@/game/data';
import useGameStore from '@/game/store';
import { pick, rnd } from '@/game/data/helpers.js';
import { CURSES } from '@/game/data/progression.js';
import { hasLegacy } from '@/game/data/progression.js';

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
        const cost = rnd(10, 20);
        if (coins >= cost) {
          const curse = curses[0];
          removeCurse(curse.id);
          setGame(g => ({ ...g, coins: g.coins - cost }));
          return { text: `Maldición "${curse.n}" removida por ${cost} monedas.`, icon: '🧹' };
        }
        return { text: 'No tienes monedas suficientes para el curandero.', icon: '🧹' };
      }
      return { text: 'No tienes maldiciones activas.', icon: '🧹' };
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
  };

  const handleContinue = () => {
    SFX.play('click');
    go('prematch');
  };

  const curses = game.curses || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'auto', background: 'linear-gradient(180deg,#0b1120 0%,#1a1030 100%)' }}>
      {/* Header */}
      <div style={{ width: '100%', padding: '16px', textAlign: 'center' }}>
        <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 20, color: T.tx, textTransform: 'uppercase', letterSpacing: 2 }}>
          Entre Jornadas
        </div>
        <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.tx3, marginTop: 4 }}>
          Jornada {game.matchNum + 1} · Elige tu camino
        </div>
      </div>

      {/* Active Curses */}
      {curses.length > 0 && (
        <div style={{ width: '100%', maxWidth: 380, padding: '0 16px', marginBottom: 8 }}>
          <div style={{ fontFamily: T.fontHeading, fontSize: 10, color: '#ef5350', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            Maldiciones Activas
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {curses.map((c, i) => (
              <div key={i} style={{ background: 'rgba(239,83,80,0.1)', border: '1px solid rgba(239,83,80,0.2)', borderRadius: 4, padding: '3px 8px', fontSize: 10, color: '#ef5350', fontFamily: T.fontBody }}>
                {c.i} {c.n} {c.remaining > 0 ? `(${c.remaining})` : ''}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Nodes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 16px', width: '100%', maxWidth: 380 }}>
        {/* Visual: connecting lines */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
          {nodes.map((_, i) => (
            <div key={i} style={{ width: 2, height: 20, background: 'rgba(255,255,255,0.08)' }} />
          ))}
        </div>

        {nodes.map((node, i) => {
          const isChosen = chosen === node.id;
          const disabled = chosen && !isChosen;
          return (
            <div
              key={i}
              onClick={() => !disabled && handleChoose(node)}
              style={{
                background: isChosen ? `${node.color}20` : disabled ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${isChosen ? node.color : disabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8,
                padding: '14px 12px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.3 : 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                minHeight: 56,
                touchAction: 'manipulation',
              }}
            >
              <div style={{ fontSize: 28, minWidth: 36, textAlign: 'center' }}>{node.i}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 15, color: isChosen ? node.color : T.tx, textTransform: 'uppercase' }}>
                  {node.n}
                </div>
                <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx3, lineHeight: 1.3, marginTop: 2 }}>
                  {node.d}
                </div>
              </div>
              {!chosen && (
                <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.2)' }}>→</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Result */}
      {result && (
        <div style={{ width: '100%', maxWidth: 380, padding: '12px 16px', marginTop: 12 }}>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '14px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>{result.icon}</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx, lineHeight: 1.4 }}>
              {result.text}
            </div>
          </div>
          <button
            onClick={handleContinue}
            style={{
              width: '100%', marginTop: 12, fontFamily: T.fontHeading, fontWeight: 600, fontSize: 14,
              padding: '12px 24px', border: 'none',
              background: 'linear-gradient(135deg,#00c853,#00e676)', color: '#0b1120',
              clipPath: 'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)',
              cursor: 'pointer', textTransform: 'uppercase', touchAction: 'manipulation',
            }}
          >
            Continuar al Partido →
          </button>
        </div>
      )}

      {/* Skip option */}
      {!chosen && (
        <button
          onClick={() => { SFX.play('click'); go('prematch'); }}
          style={{
            marginTop: 16, fontFamily: T.fontHeading, fontWeight: 600, fontSize: 11,
            padding: '8px 16px', border: `1px solid ${T.tx3}`, background: 'transparent',
            color: T.tx3, borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase',
            touchAction: 'manipulation',
          }}
        >
          Saltar directo al partido
        </button>
      )}
    </div>
  );
}
