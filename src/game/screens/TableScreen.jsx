import { useState } from 'react';
import useGameStore from '@/game/store';
import { FormIcon, RelicIcon } from '@/game/data/chibiAssets';
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

  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleNext = () => {
    if (starters.length < 6 && !done) return;
    if (done) {
      if (myPos < 2) { const nL = game.league + 1; if (nL >= LEAGUES.length) { go('champion'); return; } setPendingLeague(nL); go('ascension'); }
      else go('death');
    } else {
      const evs = getBoardEvents(game);
      if (evs.length > 0) { setBoardEvents(evs); setBoardEventIdx(0); setBoardPhase('choose'); setBoardResultData(null); go('boardEvent'); }
      else go('map');
    }
  };

  const ctaDisabled = starters.length < 6 && !done;
  const ctaLabel = ctaDisabled ? `${starters.length}/6` : done ? (myPos < 2 ? 'Ascender' : 'Resumen') : 'Siguiente';
  const ctaClass = ctaDisabled ? '' : done ? (myPos < 2 ? 'fw-btn-primary' : 'fw-btn-danger') : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg }}>
      {/* Stadium glow overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, background: T.gradientStadium, pointerEvents: 'none', zIndex: 0 }} />

      {/* Scrollable content */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 420, margin: '0 auto', padding: '8px 10px 16px' }}>

          {/* League header card */}
          <div className="glass" style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.glassBorder}`, marginBottom: 8 }}>
            <div style={{ background: T.gradientDark, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 13, color: T.tx, textTransform: 'uppercase', letterSpacing: 1 }}>{lg.i} {lg.n}</div>
              <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx2 }}>{game.coins} monedas · J{game.matchNum}/{lg.m}</div>
            </div>
            {/* My position summary inside header */}
            <div style={{ padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(240,192,64,0.03)' }}>
              <div style={{ fontFamily: T.fontHeading, fontSize: 12, color: T.gold, fontWeight: 700 }}>#{myPos + 1} Halcones</div>
              <div style={{ fontFamily: T.fontHeading, fontSize: 12, color: T.tx2 }}>{sorted[myPos]?.w * 3 + sorted[myPos]?.d} pts</div>
              <div style={{ fontFamily: T.fontBody, fontSize: 11, color: done ? (myPos < 2 ? T.win : T.lose) : T.purple }}>
                {done ? (myPos < 2 ? 'Clasificado' : 'ELIMINADOS') : `${lg.m - game.matchNum} restantes`}
              </div>
            </div>
          </div>

          {/* Primary CTA - Siguiente button - prominent, above everything */}
          <button onClick={handleNext} className={`fw-btn ${ctaClass}`} style={{
            width: '100%', marginBottom: 8, fontFamily: T.fontHeading, fontWeight: 700, fontSize: 16,
            padding: '14px 24px', textTransform: 'uppercase', letterSpacing: 1.5, borderRadius: 10,
            background: ctaDisabled ? T.bg3 : done ? undefined : 'linear-gradient(135deg, #F0C040, #D4A017)',
            color: ctaDisabled ? T.tx4 : done ? undefined : '#1a1a2e',
            border: ctaDisabled ? `1px solid ${T.border}` : done ? undefined : '1px solid rgba(240,192,64,0.6)',
            boxShadow: ctaDisabled ? 'none' : done ? undefined : '0 4px 20px rgba(240,192,64,0.25)',
            opacity: ctaDisabled ? 0.5 : 1,
            cursor: ctaDisabled ? 'not-allowed' : 'pointer',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
          }}>
            {ctaLabel}
          </button>

          {/* Hub navigation row */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 10 }}>
            <button className="fw-btn fw-btn-glass" onClick={() => go('roster')} style={{ flex: 1, fontSize: 11, padding: '8px 10px', color: starters.length < 6 ? T.lose : T.tx, borderColor: starters.length < 6 ? T.lose : undefined }}>Roster</button>
            <button className="fw-btn fw-btn-glass" onClick={() => go('training')} style={{ flex: 1, fontSize: 11, padding: '8px 10px', color: T.win }}>Entrenar</button>
            <button className="fw-btn fw-btn-glass" onClick={openMarket} style={{ flex: 1, fontSize: 11, padding: '8px 10px', color: T.gold }}>Mercado</button>
          </div>

          {/* League table */}
          <div className="glass" style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.glassBorder}`, marginBottom: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {['#', 'Equipo', 'G', 'E', 'P', 'DG', 'PTS'].map(h => (<th key={h} style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 11, color: T.tx3, padding: '5px 2px', textAlign: h === 'Equipo' ? 'left' : 'center', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>))}
              </tr></thead>
              <tbody>{sorted.map((t, i) => {
                const pts = t.w * 3 + t.d, dg = t.gf - t.ga;
                const totalTeams = sorted.length;
                const isBottom = i >= totalTeams - 2;
                const isTop = i < 2;
                const leftBorder = t.you ? `3px solid ${T.gold}` : isTop ? `3px solid ${T.win}` : isBottom ? `3px solid ${T.lose}` : '3px solid transparent';
                const rowBg = t.you ? 'rgba(240,192,64,0.04)' : i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent';
                return (
                  <tr key={t.name} style={{ background: rowBg, borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                    <td style={{ padding: '4px 2px', textAlign: 'center', fontFamily: T.fontHeading, fontWeight: 600, fontSize: 11, color: isTop ? T.win : isBottom ? T.lose : T.tx3, borderLeft: leftBorder }}>{i + 1}</td>
                    <td style={{ padding: '4px 2px', fontFamily: T.fontHeading, fontWeight: t.you ? 700 : 500, color: t.you ? T.gold : T.tx, fontSize: 12 }}>{t.name}</td>
                    <td style={{ padding: '4px 2px', textAlign: 'center', fontFamily: T.fontBody, fontSize: 11, color: T.tx3 }}>{t.w}</td>
                    <td style={{ padding: '4px 2px', textAlign: 'center', fontFamily: T.fontBody, fontSize: 11, color: T.tx3 }}>{t.d}</td>
                    <td style={{ padding: '4px 2px', textAlign: 'center', fontFamily: T.fontBody, fontSize: 11, color: T.tx3 }}>{t.l}</td>
                    <td style={{ padding: '4px 2px', textAlign: 'center', fontFamily: T.fontBody, fontSize: 11, color: dg > 0 ? T.win : dg < 0 ? T.lose : T.tx3 }}>{dg > 0 ? '+' : ''}{dg}</td>
                    <td style={{ padding: '4px 2px', textAlign: 'center', fontFamily: T.fontHeading, fontWeight: 700, fontSize: 13, color: t.you ? T.gold : T.tx }}>{pts}</td>
                  </tr>
                );
              })}</tbody>
            </table>
            <div style={{ padding: '5px 10px', background: `${T.purple}08`, borderTop: `1px solid ${T.purple}15`, fontFamily: T.fontBody, fontSize: 11, color: T.purple, textAlign: 'center' }}>
              {done ? (myPos < 2 ? 'Clasificado para ascenso' : 'ELIMINADOS') : `Top 2 ascienden · ${lg.m - game.matchNum} restantes`}
            </div>
          </div>

          {/* Accordion: Detalles del equipo */}
          {game.coach && (
            <div className="glass" style={{ borderRadius: 10, border: `1px solid ${T.glassBorder}`, marginBottom: 8, overflow: 'hidden' }}>
              <div
                onClick={() => setDetailsOpen(o => !o)}
                style={{
                  padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer', touchAction: 'manipulation',
                  background: detailsOpen ? 'rgba(255,255,255,0.02)' : 'transparent',
                  transition: 'background 0.2s ease',
                }}
              >
                <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 12, color: T.tx2, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Detalles del Equipo
                </div>
                <div style={{
                  fontFamily: T.fontBody, fontSize: 16, color: T.tx3,
                  transform: detailsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease',
                }}>
                  ▾
                </div>
              </div>
              <div style={{
                maxHeight: detailsOpen ? 500 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
              }}>
                <div style={{ padding: '0 12px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 12, color: T.tx }}>{game.coach?.i} {game.coach?.n}</div>
                      <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.win }}>✦ {game.coach?.a}</div>
                      <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.info, marginTop: 2 }}><FormIcon id={currentFormation.id} size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />{currentFormation.n} <span style={{ color: T.tx3 }}>· {currentFormation.tag}</span></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx2 }}>Quimica: <span style={{ color: T.gold, fontFamily: T.fontHeading, fontWeight: 700 }}>{game.chemistry}</span></div>
                      <div style={{ fontFamily: T.fontBody, fontSize: 11, color: game.streak > 0 ? T.win : game.streak < 0 ? T.lose : T.tx3 }}>{game.streak > 0 ? `Racha: ${game.streak}` : game.streak < 0 ? `${Math.abs(game.streak)} derrotas` : '—'}</div>
                      {(game.relics||[]).length > 0 && (
                        <div style={{ display: 'flex', gap: 3, marginTop: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {(game.relics||[]).map(rid => { const r = RELICS.find(x=>x.id===rid); return r ? (
                            <div key={rid} title={r.d} style={{ display:'flex', alignItems:'center', gap:2, background:`rgba(139,92,246,0.08)`, border:`1px solid rgba(139,92,246,0.15)`, borderRadius:6, padding:'2px 6px', fontSize:11 }}>
                              <RelicIcon id={r.id} size={18} /><span style={{ fontFamily: T.fontHeading, fontSize:11, color:T.purple, letterSpacing:0.5 }}>{r.n.split(' ').slice(0,2).join(' ')}</span>
                            </div>
                          ) : null; })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                    {starters.map(p => (
                      <div key={p.id} onClick={(e) => { e.stopPropagation(); setDetailPlayer(p); }} style={{ background: `${POS_COLORS[p.pos]}08`, border: `1px solid ${POS_COLORS[p.pos]}20`, borderRadius: 6, padding: '3px 6px', display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer', transition: 'border-color 0.2s ease' }}>
                        <span style={{ fontFamily: T.fontHeading, fontSize: 11, color: POS_COLORS[p.pos], letterSpacing: 0.5 }}>{PN[p.pos]}</span>
                        <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx }}>{p.name.split(' ').pop()}</span>
                        <span style={{ fontFamily: T.fontHeading, fontSize: 11, color: T.gold }}>{effectiveOvr(p)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Copa section */}
          {game.copa?.active && !game.copa?.eliminated && (
            <div className="glass" style={{ borderRadius: 10, padding: 12, border: `1px solid ${T.gold}20` }}>
              <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 12, color: T.gold, textTransform: 'uppercase', marginBottom: 3, letterSpacing: 1 }}>{COPA_NAMES[Math.min(game.league, 6)]}</div>
              <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.lose, marginBottom: 8 }}>Perder en Copa = Fin de la Carrera</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {(game.copa.bracket || []).map((r, i) => (
                  <div key={i} style={{ flex: 1, background: r.beaten ? `${T.win}08` : i === game.copa.round ? `${T.gold}08` : T.bg2, border: `1px solid ${r.beaten ? T.win + '25' : i === game.copa.round ? T.gold + '25' : T.border}`, borderRadius: 8, padding: '5px 6px', textAlign: 'center' }}>
                    <div style={{ fontFamily: T.fontHeading, fontSize: 11, color: T.tx3, letterSpacing: 0.5 }}>{i === 0 ? 'Cuartos' : i === 1 ? 'Semi' : 'Final'}</div>
                    <div style={{ fontFamily: T.fontBody, fontSize: 11, color: r.beaten ? T.win : i === game.copa.round ? T.gold : T.tx3 }}>{r.beaten ? '✓' : r.name}</div>
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
