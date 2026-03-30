import { useEffect, useState } from 'react';
import useGameStore from '@/game/store';
import { POS_ORDER, POS_COLORS, T, FORMATIONS, calcOvr, KIT_COLORS, PN, effectiveOvr } from '@/game/data';
import { PlayerCard } from '@/game/components';
import { SectionHeader, GlassCard, GameButton, EmptyState } from '@/game/components/ui';
import { Haptics } from '@/game/haptics';

// ── Position placement on pitch diagram ──
// Returns { top%, left% } for each slot in a formation
function getPitchPositions(formation) {
  const slots = formation.slots;
  // Group by position zone (exclude GK at index 0)
  const zones = { GK: [], DEF: [], MID: [], FWD: [] };
  slots.forEach((pos, i) => { zones[pos].push(i); });

  const positions = {};
  // GK always at bottom center
  zones.GK.forEach((idx, i) => {
    positions[idx] = { top: 88, left: 50 };
  });
  // DEF row
  const defCount = zones.DEF.length;
  zones.DEF.forEach((idx, i) => {
    positions[idx] = { top: 68, left: spreadAcross(defCount, i) };
  });
  // MID row
  const midCount = zones.MID.length;
  zones.MID.forEach((idx, i) => {
    positions[idx] = { top: 44, left: spreadAcross(midCount, i) };
  });
  // FWD row
  const fwdCount = zones.FWD.length;
  zones.FWD.forEach((idx, i) => {
    positions[idx] = { top: 20, left: spreadAcross(fwdCount, i) };
  });

  return positions;
}

function spreadAcross(count, index) {
  if (count === 0) return 50;
  if (count === 1) return 50;
  if (count === 2) return 30 + index * 40;
  if (count === 3) return 20 + index * 30;
  if (count === 4) return 15 + index * 23.3;
  return 15 + index * (70 / (count - 1));
}

export default function RosterScreen() {
  const { game, setGame, go, setDetailPlayer, markVisited } = useGameStore();

  useEffect(() => { markVisited('roster'); }, []);

  const formation = FORMATIONS.find(f => f.id === game.formation) || FORMATIONS[1];
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
    Haptics.medium();
    setGame(g => {
      const fm = FORMATIONS.find(f => f.id === g.formation) || FORMATIONS[1];
      const roster = [...g.roster];
      roster.forEach(p => p.role = 'rs');
      const sorted = [...roster].sort((a, b) => calcOvr(b) - calcOvr(a));
      const picked = [];
      for (const pos of fm.slots) {
        const best = sorted.find(p => p.pos === pos && !picked.includes(p));
        if (best) { best.role = 'st'; picked.push(best); }
      }
      if (picked.length < 6) sorted.filter(p => p.role === 'rs').slice(0, 6 - picked.length).forEach(p => { p.role = 'st'; });
      return { ...g, roster };
    });
  }

  // Map starters to formation slots
  const pitchPositions = getPitchPositions(formation);
  const startersBySlot = {};
  const usedStarters = [];
  formation.slots.forEach((pos, slotIdx) => {
    const match = starters.find(p => p.pos === pos && !usedStarters.includes(p.id));
    if (match) {
      startersBySlot[slotIdx] = match;
      usedStarters.push(match.id);
    }
  });

  const emptySlots = Math.max(0, 6 - starters.length);

  // Formation selector
  const [showFormations, setShowFormations] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg }}>
      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 0 20px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>

          {/* ── Pitch Formation Diagram ── */}
          <div className="pitch-diagram anim-stagger-1" style={{
            margin: '10px 12px', height: 240, position: 'relative',
          }}>
            {/* Center line */}
            <div style={{
              position: 'absolute', top: '50%', left: '10%', right: '10%',
              height: 1, background: T.fieldLine,
            }} />

            {/* Formation slots */}
            {formation.slots.map((pos, slotIdx) => {
              const coords = pitchPositions[slotIdx];
              if (!coords) return null;
              const player = startersBySlot[slotIdx];
              const posColor = POS_COLORS[pos];

              return (
                <div
                  key={slotIdx}
                  className="pitch-dot"
                  style={{ top: `${coords.top}%`, left: `${coords.left}%` }}
                  onClick={() => player && setDetailPlayer(player)}
                >
                  {player ? (
                    <>
                      {/* Player circle */}
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: `linear-gradient(145deg, ${posColor}30, ${posColor}10)`,
                        border: `2px solid ${posColor}80`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: T.fontHeading, fontWeight: 700, fontSize: 14,
                        color: '#fff',
                        boxShadow: `0 2px 8px ${posColor}30`,
                      }}>
                        {effectiveOvr(player)}
                      </div>
                      {/* Name label */}
                      <span style={{
                        fontFamily: T.fontBody, fontWeight: 600, fontSize: 9,
                        color: 'rgba(255,255,255,0.85)', maxWidth: 60,
                        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                      }}>
                        {player.name.split(' ').pop()}
                      </span>
                    </>
                  ) : (
                    <div className="pitch-dot-empty">
                      <span style={{ fontSize: 12 }}>+</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Formation label */}
            <div
              onClick={() => setShowFormations(!showFormations)}
              style={{
                position: 'absolute', bottom: 8, right: 12,
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                borderRadius: T.r2, padding: '4px 10px',
                fontFamily: T.fontHeading, fontSize: 11, fontWeight: 600,
                color: T.gold, cursor: 'pointer', letterSpacing: 0.5,
                border: `1px solid ${T.gold}20`,
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {formation.i} {formation.n}
            </div>
          </div>

          {/* Formation selector dropdown */}
          {showFormations && (
            <div className="glass-heavy anim-scale-in" style={{
              margin: '0 12px 12px', borderRadius: T.r3, padding: T.sp3,
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              {FORMATIONS.map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    Haptics.light();
                    setGame(g => ({ ...g, formation: f.id }));
                    setShowFormations(false);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', borderRadius: T.r2,
                    background: f.id === game.formation ? `${T.gold}10` : 'transparent',
                    border: f.id === game.formation ? `1px solid ${T.gold}25` : `1px solid transparent`,
                    cursor: 'pointer', textAlign: 'left',
                    transition: `all ${T.transQuick}`,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{f.i}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: T.fontHeading, fontSize: 12, fontWeight: 600, color: f.id === game.formation ? T.gold : T.tx }}>{f.n}</div>
                    <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3 }}>{f.tag}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Kit customization */}
          <div style={{ padding: '0 12px' }}>
            <KitCustomizer game={game} setGame={setGame} />
          </div>

          {/* ── Action bar ── */}
          <div style={{ padding: '0 12px 8px', display: 'flex', gap: 6 }}>
            <GameButton variant="glass" onClick={optimizeRoster} style={{ flex: 1, fontSize: 11, padding: '8px 10px', color: T.purple }}>
              ⚡ Optimizar
            </GameButton>
            {starters.length === 6 && (
              <GameButton variant="green" onClick={() => go('prematch')} style={{ flex: 1, fontSize: 11, padding: '8px 10px' }}>
                Previa →
              </GameButton>
            )}
          </div>

          {starters.length < 6 && (
            <div style={{ padding: '0 12px 8px', fontFamily: T.fontBody, fontSize: 11, color: T.lose, textAlign: 'center' }}>
              Necesitas 6 titulares ({starters.length}/6)
            </div>
          )}

          {/* ── Reserves section ── */}
          <div style={{ padding: '0 12px' }}>
            <SectionHeader label="Reserva" count={reserves.length} icon="🪑" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {reserves.map((p, i) => (
                <div key={p.id} className={`anim-stagger-${Math.min(i + 1, 6)}`}>
                  <PlayerCard player={p} isCaptain={p.id === game.captain} onAction={handleAction} onDetail={setDetailPlayer} compact />
                </div>
              ))}
              {reserves.length === 0 && (
                <EmptyState icon="📋" title="Sin reservas" message="Ficha jugadores en el mercado" />
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
    <div className="glass-light" style={{ borderRadius: T.r3, padding: '10px 12px', marginBottom: T.sp3 }}>
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
        <span style={{ fontSize: 12, color: T.tx4, transition: `transform ${T.transQuick}`, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </div>
      {open && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.glassBorder}` }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontFamily: T.fontHeading, fontSize: 10, color: T.tx3, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Playera</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {KIT_COLORS.map(c => (
                <div key={c.id} onClick={() => setGame(g => ({ ...g, kitColorId: c.id }))}
                  style={{ width: 28, height: 28, borderRadius: 6, background: c.primary, border: game.kitColorId === c.id ? `2px solid ${T.gold}` : `1px solid ${c.accent}`, cursor: 'pointer', boxShadow: game.kitColorId === c.id ? `0 0 8px ${T.gold}40` : 'none', transition: `all ${T.transQuick}` }} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: T.fontHeading, fontSize: 10, color: T.tx3, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Short</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {KIT_COLORS.map(c => (
                <div key={c.id} onClick={() => setGame(g => ({ ...g, shortsColorId: c.id }))}
                  style={{ width: 28, height: 28, borderRadius: 6, background: c.primary, border: game.shortsColorId === c.id ? `2px solid ${T.gold}` : `1px solid ${c.accent}`, cursor: 'pointer', boxShadow: game.shortsColorId === c.id ? `0 0 8px ${T.gold}40` : 'none', transition: `all ${T.transQuick}` }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
