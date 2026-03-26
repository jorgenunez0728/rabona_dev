import { useEffect } from 'react';
import useGameStore from '@/game/store';
import { POS_COLORS, T, PN, calcOvr } from '@/game/data';
import { SFX } from '@/game/audio';

export default function MarketScreen() {
  const { game, setGame, market, setMarket, go, markVisited } = useGameStore();

  useEffect(() => { markVisited('market'); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'auto', background: T.bg }}>
      {/* Header with stadium atmosphere */}
      <div className="stadium-glow" style={{ width: '100%', padding: '20px 14px 16px', textAlign: 'center', borderBottom: `1px solid ${T.border}`, marginBottom: 8 }}>
        <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 22, color: T.tx, textTransform: 'uppercase', letterSpacing: 2 }}>Mercado de Fichajes</div>
        {/* Balance display */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '6px 16px', borderRadius: 20, background: 'linear-gradient(135deg, rgba(240,192,64,0.15), rgba(212,160,23,0.08))', border: '1px solid rgba(240,192,64,0.25)' }}>
          <span style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 18, background: T.gradientPrimary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{game.coins}</span>
          <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.gold, textTransform: 'uppercase', letterSpacing: 0.5 }}>monedas</span>
        </div>
      </div>

      {/* Player list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 420, padding: '0 14px 14px' }}>
        {market.players.map((p, idx) => {
          const canBuy = game.coins >= p.price && game.roster.length < 12;
          return (
            <div key={p.id} className="card-premium anim-stagger-1" style={{
              background: T.bg1,
              border: `1px solid ${T.glassBorder}`,
              borderRadius: 10,
              padding: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              position: 'relative',
              overflow: 'hidden',
              animationDelay: `${idx * 60}ms`
            }}>
              {/* Position color accent */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: POS_COLORS[p.pos], borderRadius: '10px 0 0 10px' }} />

              {/* Position badge */}
              <div style={{
                fontFamily: T.fontHeading, fontWeight: 700, fontSize: 11,
                color: '#fff',
                background: POS_COLORS[p.pos],
                padding: '3px 8px',
                borderRadius: 4,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                minWidth: 32,
                textAlign: 'center'
              }}>{PN[p.pos]}</div>

              {/* Player info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 14, color: T.tx, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name}
                </div>
                <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.purple, marginTop: 1 }}>{p.trait.n}</div>
                {/* Stat badges */}
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  <span style={{
                    fontFamily: T.fontBody, fontWeight: 600, fontSize: 10,
                    color: T.lose, background: 'rgba(239,68,68,0.12)',
                    padding: '2px 6px', borderRadius: 4
                  }}>ATK {p.atk}</span>
                  <span style={{
                    fontFamily: T.fontBody, fontWeight: 600, fontSize: 10,
                    color: T.info, background: 'rgba(59,130,246,0.12)',
                    padding: '2px 6px', borderRadius: 4
                  }}>DEF {p.def}</span>
                  <span style={{
                    fontFamily: T.fontBody, fontWeight: 600, fontSize: 10,
                    color: T.win, background: 'rgba(34,197,94,0.12)',
                    padding: '2px 6px', borderRadius: 4
                  }}>VEL {p.spd}</span>
                  {p.pos === 'GK' && <span style={{
                    fontFamily: T.fontBody, fontWeight: 600, fontSize: 10,
                    color: T.goldLight, background: 'rgba(240,192,64,0.12)',
                    padding: '2px 6px', borderRadius: 4
                  }}>PAR {p.sav}</span>}
                </div>
              </div>

              {/* OVR + Buy */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 22, color: T.gold, lineHeight: 1 }}>{calcOvr(p)}</div>
                <div style={{ fontFamily: T.fontBody, fontSize: 9, color: T.tx3, textTransform: 'uppercase', letterSpacing: 0.5 }}>OVR</div>
                {/* Price tag button */}
                <button onClick={() => {
                  if (!canBuy) return;
                  SFX.play('reward');
                  const bought = { ...p, role: 'rs' };
                  setGame(g => ({ ...g, roster: [...g.roster, bought], coins: g.coins - p.price, playersBought: (g.playersBought || 0) + 1 }));
                  setMarket(m => ({ ...m, players: m.players.filter(mp => mp.id !== p.id) }));
                }} style={{
                  fontFamily: T.fontHeading, fontWeight: 700, fontSize: 12,
                  padding: '5px 14px',
                  border: 'none',
                  background: canBuy ? T.gradientPrimary : T.bg3,
                  color: canBuy ? T.bg : T.tx4,
                  cursor: canBuy ? 'pointer' : 'not-allowed',
                  borderRadius: 6,
                  marginTop: 6,
                  boxShadow: canBuy ? T.glowGold : 'none',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  letterSpacing: 0.5
                }}>
                  {p.price}
                </button>
              </div>
            </div>
          );
        })}

        {market.players.length === 0 && (
          <div className="glass" style={{ borderRadius: 10, padding: 20, textAlign: 'center' }}>
            <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx3 }}>No hay jugadores disponibles</div>
          </div>
        )}

        {game.roster.length >= 12 && (
          <div style={{
            fontFamily: T.fontBody, fontSize: 12,
            color: T.lose,
            textAlign: 'center',
            padding: '8px 12px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 8
          }}>
            Plantilla completa (12/12)
          </div>
        )}
      </div>

      {/* Back button */}
      <div style={{ padding: '8px 14px 16px' }}>
        <button className="fw-btn fw-btn-outline" onClick={() => go('table')} style={{
          fontFamily: T.fontHeading, fontWeight: 600, fontSize: 12,
          padding: '8px 20px',
          textTransform: 'uppercase',
          letterSpacing: 1
        }}>
          Volver
        </button>
      </div>
    </div>
  );
}
