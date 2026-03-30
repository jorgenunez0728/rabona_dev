import { useEffect, useState } from 'react';
import useGameStore from '@/game/store';
import { POS_ORDER, POS_COLORS, T, FORMATIONS, calcOvr, KIT_COLORS } from '@/game/data';
import { PlayerCard } from '@/game/components';

export default function RosterScreen() {
  const { game, setGame, go, setDetailPlayer, markVisited } = useGameStore();

  useEffect(() => { markVisited('roster'); }, []);

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

  const [kitOpen, setKitOpen] = useState(false);
  const emptySlots = Math.max(0, 6 - starters.length);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg }}>
      {/* Top bar */}
      <div style={{ flexShrink: 0, padding: '10px 12px', background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', gap: 6, maxWidth: 420, margin: '4px auto 0', flexWrap: 'wrap' }}>
          <button className="fw-btn fw-btn-glass" onClick={optimizeRoster} style={{ flex: 1, fontFamily: T.fontHeading, fontSize: 11, padding: '6px 10px', color: T.purple, letterSpacing: 0.5, textTransform: 'uppercase' }}>Optimizar</button>
          <button className="fw-btn fw-btn-outline" onClick={() => go('table')} style={{ fontFamily: T.fontHeading, fontSize: 11, padding: '6px 14px', color: T.tx2, letterSpacing: 0.5, textTransform: 'uppercase' }}>Tabla</button>
          <button className={`fw-btn ${starters.length === 6 ? 'fw-btn-green' : 'fw-btn-outline'}`} onClick={() => starters.length === 6 && go('prematch')} disabled={starters.length < 6} style={{ fontFamily: T.fontHeading, fontSize: 11, padding: '6px 14px', letterSpacing: 0.5, textTransform: 'uppercase' }}>Previa</button>
        </div>
        {starters.length < 6 && <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.lose, textAlign: 'center', marginTop: 6 }}>Necesitas 6 titulares ({starters.length}/6)</div>}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '10px 12px 20px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>

          {/* Kit customization */}
          <KitCustomizer game={game} setGame={setGame} />

          {/* Starters section */}
          <div className="glass-light" style={{ borderRadius: 10, padding: '10px 10px 12px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: `1px solid ${T.glassBorder}`, marginBottom: 8 }}>
              <span style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 12, color: T.win, textTransform: 'uppercase', letterSpacing: 1 }}>Titulares</span>
              <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3 }}>{starters.length}/6</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {starters.map(p => (
                <PlayerCard key={p.id} player={p} isCaptain={p.id === game.captain} onAction={handleAction} onDetail={setDetailPlayer} compact />
              ))}
              {/* Empty slot placeholders */}
              {Array.from({ length: emptySlots }).map((_, i) => (
                <div key={`empty-${i}`} style={{ height: 40, borderRadius: 8, border: `1.5px dashed ${T.tx4}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx4 }}>Slot vacio</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reserves section */}
          <div className="glass-light" style={{ borderRadius: 10, padding: '10px 10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: `1px solid ${T.glassBorder}`, marginBottom: 8 }}>
              <span style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 12, color: T.tx3, textTransform: 'uppercase', letterSpacing: 1 }}>Reserva</span>
              <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx4 }}>{reserves.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {reserves.map(p => (
                <PlayerCard key={p.id} player={p} isCaptain={p.id === game.captain} onAction={handleAction} onDetail={setDetailPlayer} compact />
              ))}
              {reserves.length === 0 && (
                <div style={{ padding: '12px 0', textAlign: 'center' }}>
                  <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx4 }}>Sin reservas</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function KitCustomizer({ game, setGame }) {
  const [open, setOpen] = useState(false);
  const kit = KIT_COLORS.find(k => k.id === game.kitColorId) || KIT_COLORS[0];
  const shorts = KIT_COLORS.find(k => k.id === game.shortsColorId) || KIT_COLORS[0];

  return (
    <div className="glass-light" style={{ borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
      <div onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        {/* Mini kit preview */}
        <div style={{ position: 'relative', width: 32, height: 38 }}>
          <div style={{ width: 28, height: 22, borderRadius: '6px 6px 2px 2px', background: kit.primary, border: `1px solid ${kit.accent}` }} />
          <div style={{ width: 24, height: 12, borderRadius: '0 0 4px 4px', background: shorts.primary, border: `1px solid ${shorts.accent}`, margin: '1px auto 0' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 13, color: T.tx }}>{game.teamName}</div>
          <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx4 }}>Playera: {kit.label} · Short: {shorts.label}</div>
        </div>
        <span style={{ fontSize: 12, color: T.tx4, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </div>
      {open && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.glassBorder}` }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontFamily: T.fontHeading, fontSize: 10, color: T.tx3, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Playera</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {KIT_COLORS.map(c => (
                <div key={c.id} onClick={() => setGame(g => ({ ...g, kitColorId: c.id }))}
                  style={{ width: 28, height: 28, borderRadius: 6, background: c.primary, border: game.kitColorId === c.id ? `2px solid ${T.gold}` : `1px solid ${c.accent}`, cursor: 'pointer', boxShadow: game.kitColorId === c.id ? `0 0 8px ${T.gold}40` : 'none', transition: 'all 0.15s' }} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: T.fontHeading, fontSize: 10, color: T.tx3, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Short</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {KIT_COLORS.map(c => (
                <div key={c.id} onClick={() => setGame(g => ({ ...g, shortsColorId: c.id }))}
                  style={{ width: 28, height: 28, borderRadius: 6, background: c.primary, border: game.shortsColorId === c.id ? `2px solid ${T.gold}` : `1px solid ${c.accent}`, cursor: 'pointer', boxShadow: game.shortsColorId === c.id ? `0 0 8px ${T.gold}40` : 'none', transition: 'all 0.15s' }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
