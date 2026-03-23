import useGameStore from '@/game/store';
import { POS_ORDER, POS_COLORS, T, FORMATIONS, calcOvr } from '@/game/data';
import { PlayerCard } from '@/game/components';

export default function RosterScreen() {
  const { game, setGame, go, setDetailPlayer } = useGameStore();

  const starters = game.roster.filter(p => p.role === 'st').sort((a, b) => POS_ORDER[a.pos] - POS_ORDER[b.pos]);
  const reserves = game.roster.filter(p => p.role === 'rs').sort((a, b) => POS_ORDER[a.pos] - POS_ORDER[b.pos]);

  function handleAction(action, player) {
    setGame(g => {
      const roster = g.roster.map(p => ({ ...p }));
      const p = roster.find(x => x.id === player.id);
      if (!p) return g;
      if (action === 'promote' && roster.filter(x => x.role === 'st').length < 6) p.role = 'st';
      else if (action === 'demote') { p.role = 'rs'; p.tempGK = false; }
      else if (action === 'captain') return { ...g, captain: player.id, roster };
      else if (action === 'tempGK') { roster.forEach(x => { if (x.id !== player.id) x.tempGK = false; }); p.tempGK = !p.tempGK; }
      return { ...g, roster };
    });
  }

  function optimizeRoster() {
    setGame(g => {
      const formation = FORMATIONS.find(f => f.id === g.formation) || FORMATIONS[1];
      const roster = [...g.roster];
      roster.forEach(p => p.role = 'rs');
      const sorted = [...roster].sort((a, b) => calcOvr(b) - calcOvr(a));
      const picked = [];
      for (const pos of formation.slots) {
        const best = sorted.find(p => p.pos === pos && !picked.includes(p));
        if (best) { best.role = 'st'; picked.push(best); }
      }
      // Fill remaining slots with best available if not enough positional matches
      if (picked.length < 6) sorted.filter(p => p.role === 'rs').slice(0, 6 - picked.length).forEach(p => { p.role = 'st'; });
      return { ...g, roster };
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg }}>
      <div style={{ flexShrink: 0, padding: '8px 10px', background: T.bg, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', gap: 4, maxWidth: 420, margin: '4px auto 0', flexWrap: 'wrap' }}>
          <button className="fw-btn fw-btn-outline" onClick={optimizeRoster} style={{ flex: 1, fontSize: 11, padding: '5px 8px', color: T.purple }}>⚡ Optimizar</button>
          <button className="fw-btn fw-btn-outline" onClick={() => go('table')} style={{ fontSize: 11, padding: '5px 12px', color: T.tx2 }}>Tabla</button>
          <button className={`fw-btn ${starters.length === 6 ? 'fw-btn-green' : 'fw-btn-outline'}`} onClick={() => starters.length === 6 && go('prematch')} disabled={starters.length < 6} style={{ fontSize: 11, padding: '5px 12px' }}>Previa</button>
        </div>
        {starters.length < 6 && <div style={{ fontSize: 11, color: T.lose, textAlign: 'center', marginTop: 3 }}>⚠ Necesitas 6 titulares ({starters.length}/6)</div>}
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '6px 10px 16px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, color: T.win, textTransform: 'uppercase', padding: '4px 8px', borderLeft: `3px solid ${T.win}`, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Titulares</span><span style={{ color: T.tx3 }}>{starters.length}/6</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{starters.map(p => (<PlayerCard key={p.id} player={p} isCaptain={p.id === game.captain} onAction={handleAction} onDetail={setDetailPlayer} compact />))}</div>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, color: T.tx3, textTransform: 'uppercase', padding: '6px 8px 4px', borderLeft: '3px solid #455a64', display: 'flex', justifyContent: 'space-between', marginTop: 8 }}><span>Reserva</span><span>{reserves.length}</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{reserves.map(p => (<PlayerCard key={p.id} player={p} isCaptain={p.id === game.captain} onAction={handleAction} onDetail={setDetailPlayer} compact />))}</div>
        </div>
      </div>
    </div>
  );
}
