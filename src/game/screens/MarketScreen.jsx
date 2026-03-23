import useGameStore from '@/game/store';
import { POS_COLORS, T, PN, calcOvr } from '@/game/data';
import { SFX } from '@/game/audio';

export default function MarketScreen() {
  const { game, setGame, market, setMarket, go } = useGameStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 14, gap: 8, height: '100%', overflow: 'auto', background: T.bg }}>
      <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 24, color: '#fff', textTransform: 'uppercase' }}>🏪 Mercado</div>
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 14, color: '#f0c040' }}>💰 {game.coins} monedas</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', maxWidth: 400 }}>
        {market.players.map((p) => {
          const canBuy = game.coins >= p.price && game.roster.length < 12;
          return (
            <div key={p.id} style={{ background: 'linear-gradient(135deg,rgba(20,30,58,0.95),rgba(26,39,68,0.95))', border: `1px solid rgba(255,255,255,0.06)`, borderLeft: `4px solid ${POS_COLORS[p.pos]}`, borderRadius: 6, padding: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 14, color: T.tx }}>{p.pos === 'GK' ? '🧤 ' : ''}{p.name}</div>
                <div style={{ fontSize: 10, color: T.purple }}>✦ {p.trait.n} · {PN[p.pos]}</div>
                <div style={{ display: 'flex', gap: 5, fontSize: 11, fontFamily: "'Barlow Condensed'", fontWeight: 600, marginTop: 2 }}>
                  <span style={{ color: T.lose }}>⚔{p.atk}</span><span style={{ color: T.info }}>🛡{p.def}</span><span style={{ color: T.win }}>⚡{p.spd}</span>
                  {p.pos === 'GK' && <span style={{ color: '#ffc107' }}>🧤{p.sav}</span>}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 20, color: T.gold }}>{calcOvr(p)}</div>
                <button onClick={() => { if (!canBuy) return; SFX.play('reward'); const bought = { ...p, role: 'rs' }; setGame(g => ({ ...g, roster: [...g.roster, bought], coins: g.coins - p.price })); setMarket(m => ({ ...m, players: m.players.filter(mp => mp.id !== p.id) })); }} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 10, padding: '4px 12px', border: 'none', background: canBuy ? 'linear-gradient(135deg,#d4a017,#f0c040)' : '#333', color: canBuy ? '#1a1a2e' : '#666', cursor: canBuy ? 'pointer' : 'not-allowed', borderRadius: 3, marginTop: 4 }}>💰 {p.price}</button>
              </div>
            </div>
          );
        })}
        {game.roster.length >= 12 && <div style={{ fontSize: 12, color: '#ff1744', textAlign: 'center' }}>Roster lleno (12/12).</div>}
      </div>
      <button onClick={() => go('table')} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 12, padding: '8px 16px', border: '1.5px solid #607d8b', background: 'transparent', color: '#e8eaf6', borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase' }}>Volver</button>
    </div>
  );
}
