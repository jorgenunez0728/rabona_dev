import useGameStore from '@/game/store';
import {
  LEAGUES, FORMATIONS, RELICS, POS_ORDER, POS_COLORS, T, PN,
  getBoardEvents, effectiveOvr, COPA_NAMES,
} from '@/game/data';

export default function TableScreen() {
  const {
    game, go, openMarket, setDetailPlayer,
    setBoardEvents, setBoardEventIdx, setBoardPhase, setBoardResultData,
    setPendingLeague, setGame,
  } = useGameStore();

  const lg = LEAGUES[game.league];
  const done = game.matchNum >= lg.m;
  const sorted = [...game.table].sort((a, b) => (b.w * 3 + b.d) - (a.w * 3 + a.d) || (b.gf - b.ga) - (a.gf - a.ga));
  const myPos = sorted.findIndex(t => t.you);
  const starters = game.roster.filter(p => p.role === 'st').sort((a, b) => POS_ORDER[a.pos] - POS_ORDER[b.pos]);
  const currentFormation = FORMATIONS.find(f => f.id === game.formation) || FORMATIONS[1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg }}>
      <div style={{ flexShrink: 0, padding: '8px 10px 6px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto', background: T.bg1, borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.border}` }}>
          <div style={{ background: 'linear-gradient(135deg,#141e3a,#1a2844)', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 13, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>{lg.i} {lg.n}</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx2 }}>💰{game.coins} · J{game.matchNum}/{lg.m}</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Barlow Condensed'" }}>
            <thead><tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {['#', 'Equipo', 'G', 'E', 'P', 'DG', 'PTS'].map(h => (<th key={h} style={{ fontWeight: 600, fontSize: 11, color: T.tx3, padding: '3px 2px', textAlign: h === 'Equipo' ? 'left' : 'center', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>))}
            </tr></thead>
            <tbody>{sorted.map((t, i) => {
              const pts = t.w * 3 + t.d, dg = t.gf - t.ga;
              return (
                <tr key={t.name} style={{ background: t.you ? 'rgba(41,121,255,0.05)' : 'transparent', borderBottom: `1px solid rgba(255,255,255,0.02)` }}>
                  <td style={{ padding: '3px 2px', textAlign: 'center', fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, color: i < 2 ? T.win : T.tx3 }}>{i + 1}</td>
                  <td style={{ padding: '3px 2px', fontWeight: t.you ? 700 : 500, color: t.you ? T.info : T.tx, fontSize: 12 }}>{t.you ? '⭐' : ''}{t.name}</td>
                  <td style={{ padding: '3px 2px', textAlign: 'center', fontSize: 11, color: T.tx3 }}>{t.w}</td>
                  <td style={{ padding: '3px 2px', textAlign: 'center', fontSize: 11, color: T.tx3 }}>{t.d}</td>
                  <td style={{ padding: '3px 2px', textAlign: 'center', fontSize: 11, color: T.tx3 }}>{t.l}</td>
                  <td style={{ padding: '3px 2px', textAlign: 'center', fontSize: 11, color: dg > 0 ? T.win : dg < 0 ? T.lose : T.tx3 }}>{dg > 0 ? '+' : ''}{dg}</td>
                  <td style={{ padding: '3px 2px', textAlign: 'center', fontFamily: "'Oswald'", fontWeight: 700, fontSize: 13, color: T.gold }}>{pts}</td>
                </tr>
              );
            })}</tbody>
          </table>
          <div style={{ padding: '4px 10px', background: `${T.purple}08`, borderTop: `1px solid ${T.purple}15`, fontSize: 11, color: T.purple, textAlign: 'center' }}>
            {done ? (myPos < 2 ? '🎉 ¡Clasificado!' : '💀 ELIMINADOS') : `Top 2 ascienden · ${lg.m - game.matchNum} restantes`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 420, margin: '6px auto 0' }}>
          <button onClick={() => go('roster')} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, padding: '7px 14px', border: `1.5px solid ${starters.length < 6 ? T.lose : T.tx3}`, background: starters.length < 6 ? `${T.lose}10` : 'transparent', color: starters.length < 6 ? T.lose : T.tx, borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase' }}>{starters.length < 6 ? '⚠ ' : ''}Roster</button>
          <button onClick={() => go('training')} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, padding: '7px 14px', border: `1.5px solid ${T.win}`, background: `${T.win}0F`, color: T.win, borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase' }}>🏋️ Entrenar</button>
          <button onClick={openMarket} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, padding: '7px 14px', border: `1.5px solid ${T.gold}`, background: `${T.gold}0F`, color: T.gold, borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase' }}>🏪 Mercado</button>
          <button onClick={() => {
            if (starters.length < 6 && !done) return;
            if (done) {
              if (myPos < 2) { const nL = game.league + 1; if (nL >= LEAGUES.length) { go('champion'); return; } setPendingLeague(nL); go('ascension'); }
              else go('death');
            } else {
              const evs = getBoardEvents(game);
              if (evs.length > 0) { setBoardEvents(evs); setBoardEventIdx(0); setBoardPhase('choose'); setBoardResultData(null); go('boardEvent'); }
              else go('prematch');
            }
          }} style={{
            fontFamily: "'Oswald'", fontWeight: 600, fontSize: 12, padding: '8px 20px', border: 'none',
            background: (starters.length < 6 && !done) ? '#333' : done ? (myPos < 2 ? 'linear-gradient(135deg,#d4a017,#f0c040)' : 'linear-gradient(135deg,#c62828,#ff1744)') : 'linear-gradient(135deg,#00c853,#00e676)',
            color: (starters.length < 6 && !done) ? '#666' : done && myPos >= 2 ? '#fff' : '#0b1120',
            clipPath: 'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)',
            cursor: (starters.length < 6 && !done) ? 'not-allowed' : 'pointer', textTransform: 'uppercase',
            opacity: (starters.length < 6 && !done) ? 0.4 : 1,
          }}>
            {starters.length < 6 && !done ? `⚠ ${starters.length}/6` : done ? (myPos < 2 ? 'Ascender' : '💀 Resumen') : 'Siguiente'}
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '6px 10px 16px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          {game.coach && (
            <div style={{ background: T.bg1, borderRadius: 8, padding: 10, border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 12, color: T.tx }}>{game.coach?.i} {game.coach?.n}</div>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.win }}>✦ {game.coach?.a}</div>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.info, marginTop: 1 }}>{currentFormation.i} {currentFormation.n} <span style={{ color: T.tx3 }}>· {currentFormation.tag}</span></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx2 }}>🔗 Química: <span style={{ color: T.gold, fontFamily: "'Oswald'", fontWeight: 700 }}>{game.chemistry}</span></div>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: game.streak > 0 ? T.win : game.streak < 0 ? T.lose : T.tx3 }}>{game.streak > 0 ? `🔥 Racha: ${game.streak}` : game.streak < 0 ? `💀 ${Math.abs(game.streak)}` : '—'}</div>
                  {(game.relics||[]).length > 0 && (
                    <div style={{ display: 'flex', gap: 3, marginTop: 3, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {(game.relics||[]).map(rid => { const r = RELICS.find(x=>x.id===rid); return r ? (
                        <div key={rid} title={r.d} style={{ display:'flex', alignItems:'center', gap:2, background:`rgba(168,85,247,0.1)`, border:`1px solid rgba(168,85,247,0.2)`, borderRadius:4, padding:'2px 6px', fontSize:11 }}>
                          <span>{r.i}</span><span style={{ fontFamily:"'Oswald'", fontSize:11, color:T.purple, letterSpacing:0.5 }}>{r.n.split(' ').slice(0,2).join(' ')}</span>
                        </div>
                      ) : null; })}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                {starters.map(p => (
                  <div key={p.id} onClick={() => setDetailPlayer(p)} style={{ background: `${POS_COLORS[p.pos]}10`, border: `1px solid ${POS_COLORS[p.pos]}25`, borderRadius: 4, padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                    <span style={{ fontFamily: "'Oswald'", fontSize: 11, color: POS_COLORS[p.pos], letterSpacing: 0.5 }}>{PN[p.pos]}</span>
                    <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx }}>{p.name.split(' ').pop()}</span>
                    <span style={{ fontFamily: "'Oswald'", fontSize: 11, color: T.gold }}>{effectiveOvr(p)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {game.copa?.active && !game.copa?.eliminated && (
            <div style={{ background: T.bg1, borderRadius: 8, padding: 10, border: `1px solid ${T.gold}20`, marginTop: 6 }}>
              <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 12, color: T.gold, textTransform: 'uppercase', marginBottom: 2 }}>🏆 {COPA_NAMES[Math.min(game.league, 6)]}</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.lose, marginBottom: 6 }}>💀 Perder en Copa = Fin de la Carrera</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(game.copa.bracket || []).map((r, i) => (
                  <div key={i} style={{ flex: 1, background: r.beaten ? `${T.win}10` : i === game.copa.round ? `${T.gold}10` : T.bg2, border: `1px solid ${r.beaten ? T.win + '30' : i === game.copa.round ? T.gold + '30' : T.border}`, borderRadius: 4, padding: '4px 6px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: T.tx3, letterSpacing: 0.5 }}>{i === 0 ? 'Cuartos' : i === 1 ? 'Semi' : 'Final'}</div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: r.beaten ? T.win : i === game.copa.round ? T.gold : T.tx3 }}>{r.beaten ? '✓' : r.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
