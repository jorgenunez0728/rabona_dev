import { useState, useMemo } from 'react';
import useGameStore from '@/game/store';
import { FormIcon, RelicIcon } from '@/game/data/chibiAssets';
import {
  LEAGUES, FORMATIONS, RELICS, POS_ORDER, POS_COLORS, T, PN,
  getBoardEvents, effectiveOvr, COPA_NAMES, rnd, pick,
} from '@/game/data';

// ─── Generate matchday results from table ───
function generateMatchResults(table, matchNum) {
  if (!table || table.length < 4) return [];
  const teams = table.filter(t => !t.you);
  const results = [];
  const used = new Set();
  for (let i = 0; i < teams.length - 1 && results.length < 3; i += 2) {
    if (used.has(i) || used.has(i + 1)) continue;
    used.add(i); used.add(i + 1);
    const h = teams[i], a = teams[i + 1];
    const hStr = (h.w * 3 + h.d) / Math.max(1, h.w + h.d + h.l);
    const aStr = (a.w * 3 + a.d) / Math.max(1, a.w + a.d + a.l);
    results.push({
      home: h.name, away: a.name,
      homeGoals: Math.round(Math.random() * 2 + (hStr > aStr ? 0.5 : 0)),
      awayGoals: Math.round(Math.random() * 2 + (aStr > hStr ? 0.5 : 0)),
    });
  }
  return results;
}

// ─── Generate top scorers ───
const SCORER_FIRST = ['Carlos','Raúl','Diego','Andrés','Luis','Javier','Sergio','Miguel','Pablo','Omar','Marcos','Felipe','Bruno','Dante','Erik'];
const SCORER_LAST = ['Hernández','López','García','Martínez','Rodríguez','González','Torres','Ramírez','Díaz','Morales','Salcedo','Vargas','Reyes','Rivas'];
function generateTopScorers(table, playerRoster) {
  const scorers = [];
  // Add player's top scorer if exists
  if (playerRoster?.length) {
    const best = [...playerRoster].sort((a, b) => (b.goals || 0) - (a.goals || 0))[0];
    if (best && (best.goals || 0) > 0) {
      scorers.push({ name: best.name, team: 'Halcones', goals: best.goals, you: true });
    }
  }
  // Generate rival scorers
  const rivals = (table || []).filter(t => !t.you);
  for (const r of rivals) {
    const goals = Math.max(0, Math.round(r.gf * 0.4 + Math.random() * 2));
    if (goals > 0) {
      scorers.push({ name: `${pick(SCORER_FIRST)} ${pick(SCORER_LAST)}`, team: r.name, goals, you: false });
    }
  }
  return scorers.sort((a, b) => b.goals - a.goals).slice(0, 8);
}

// ─── Tournament social feed ───
const SOCIAL_ACCOUNTS = {
  low: [
    { n: '@FutbolBarrial', av: '⚽' }, { n: '@MemesDelBarrio', av: '😂' },
    { n: '@ElChismoso_FC', av: '🗣' }, { n: '@DonPepeNoticias', av: '📢' },
  ],
  mid: [
    { n: '@DeporteLocal', av: '📰' }, { n: '@FutbolZona', av: '🏟' },
    { n: '@GolYGol', av: '⚡' }, { n: '@TácticaTotal', av: '📋' },
  ],
  high: [
    { n: '@ESPN_Rabona', av: '📺' }, { n: '@MarcaDeportiva', av: '🏆' },
    { n: '@FOXSportsLiga', av: '🎙' }, { n: '@AnálisisFC', av: '📊' },
  ],
};

function generateTournamentFeed(league, table, matchNum, myPos) {
  const tier = league <= 1 ? 'low' : league <= 4 ? 'mid' : 'high';
  const accounts = SOCIAL_ACCOUNTS[tier];
  const sorted = [...(table || [])].sort((a, b) => (b.w * 3 + b.d) - (a.w * 3 + a.d) || (b.gf - b.ga) - (a.gf - a.ga));
  const leader = sorted[0];
  const last = sorted[sorted.length - 1];
  const myTeam = sorted.find(t => t.you);
  const posts = [];

  const templates = {
    low: [
      () => `${leader?.name} sigue invicto y no para de golear, ¿quién los detiene? 🔥`,
      () => `Mi abuela juega mejor que el portero de ${last?.name} 💀`,
      () => `Se arma la carnita asada para ver el próximo partido de ${myTeam?.name || 'Halcones'} 🥩⚽`,
      () => `${last?.name} ya hasta da lástima, llevan ${last?.l || 0} derrotas 😭`,
      () => myPos < 2 ? `Halcones viene volando alto, ¿serán los que ascienden? 👀` : `Halcones necesita reaccionar o se queda en el barrio 😬`,
    ],
    mid: [
      () => `TABLA | ${leader?.name} lidera con ${leader ? leader.w * 3 + leader.d : 0} puntos tras ${matchNum} jornadas`,
      () => `Análisis: La defensa de ${sorted[1]?.name || 'segundo'} ha sido clave en su campaña`,
      () => myPos < 2 ? `Halcones se consolida en zona de ascenso, gran trabajo táctico` : `¿Alcanzará Halcones para meterse al top 2? Quedan ${(LEAGUES[league]?.m || 10) - matchNum} jornadas`,
      () => `Sorpresa: ${sorted[Math.min(3, sorted.length - 1)]?.name} ha dado la campanada esta jornada`,
      () => `Golazo de la jornada cortesía de un jugador de ${pick(sorted)?.name || 'un equipo local'}`,
    ],
    high: [
      () => `BREAKING: ${leader?.name} encabeza la clasificación con ${leader ? leader.w * 3 + leader.d : 0} pts. Análisis completo →`,
      () => myPos < 2 ? `Halcones se posiciona como serio candidato al ascenso. Cifras impresionantes.` : `Halcones debe mejorar números si quiere pelear el ascenso. Análisis táctico en vivo.`,
      () => `Estadística: ${sorted[0]?.name} promedia ${sorted[0] ? (sorted[0].gf / Math.max(1, matchNum)).toFixed(1) : '?'} goles por partido`,
      () => `Debate: ¿Es esta la liga más competitiva en años? Solo ${(sorted[0]?.w * 3 + sorted[0]?.d) - (sorted[sorted.length - 1]?.w * 3 + sorted[sorted.length - 1]?.d)} pts separan al primero del último`,
      () => `Panel de expertos coincide: la jornada ${matchNum} fue de las más emocionantes del torneo`,
    ],
  };

  const tpls = templates[tier];
  const usedIdx = new Set();
  const count = Math.min(4, tpls.length);
  while (posts.length < count) {
    const idx = Math.floor(Math.random() * tpls.length);
    if (usedIdx.has(idx)) continue;
    usedIdx.add(idx);
    const acc = accounts[posts.length % accounts.length];
    posts.push({
      acc, text: tpls[idx](),
      time: `hace ${rnd(1, 12)}h`,
      likes: rnd(5, 200 + league * 100),
      comments: rnd(1, 30 + league * 10),
    });
  }
  return posts;
}

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
  const [statsOpen, setStatsOpen] = useState(false);
  const [statsTab, setStatsTab] = useState('goals'); // 'goals' | 'assists' | 'cleanSheets'
  const [socialOpen, setSocialOpen] = useState(true);
  const [showIncomplete, setShowIncomplete] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  // Matchday results, top scorers, social feed (memoized per matchNum)
  const matchResults = useMemo(() => generateMatchResults(game.table, game.matchNum), [game.matchNum, game.table?.length]);
  const topScorers = useMemo(() => generateTopScorers(game.table, game.roster), [game.matchNum, game.table?.length]);
  const socialFeed = useMemo(() => generateTournamentFeed(game.league, game.table, game.matchNum, myPos), [game.matchNum, game.league]);

  // Use tracked stats from store (accumulated across matches)
  const liveScorers = (game.topScorers || []).length > 0 ? game.topScorers : topScorers;
  const liveAssisters = game.topAssisters || [];
  const liveCleanSheets = game.topCleanSheets || [];

  const visits = game.betweenMatchVisits || { roster: false, training: false, market: false };

  const proceedToNext = () => {
    if (done) {
      if (myPos < 2) { const nL = game.league + 1; if (nL >= LEAGUES.length) { go('champion'); return; } setPendingLeague(nL); go('ascension'); }
      else go('death');
    } else {
      const evs = getBoardEvents(game);
      if (evs.length > 0) { setBoardEvents(evs); setBoardEventIdx(0); setBoardPhase('choose'); setBoardResultData(null); go('boardEvent'); }
      else go('map');
    }
  };

  const handleNext = () => {
    // Hard block: fewer than 7 starters
    if (starters.length < 7 && !done) {
      setShowIncomplete(true);
      return;
    }
    // Soft reminder: unvisited screens (only for non-done matches)
    if (!done && (!visits.roster || !visits.training || !visits.market)) {
      setShowReminder(true);
      return;
    }
    proceedToNext();
  };

  const ctaDisabled = starters.length < 7 && !done;
  const ctaLabel = ctaDisabled ? `${starters.length}/7` : done ? (myPos < 2 ? 'Ascender' : 'Resumen') : 'Siguiente';
  const ctaClass = ctaDisabled ? '' : done ? (myPos < 2 ? 'fw-btn-primary' : 'fw-btn-danger') : '';

  // Visit indicator dot
  const VisitDot = ({ visited }) => (
    <span style={{
      display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
      background: visited ? T.win : 'rgba(245,158,11,0.8)',
      boxShadow: visited ? `0 0 4px ${T.win}60` : '0 0 4px rgba(245,158,11,0.4)',
      marginLeft: 6, verticalAlign: 'middle', flexShrink: 0,
    }} />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg }}>
      {/* Stadium glow overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, background: T.gradientStadium, pointerEvents: 'none', zIndex: 0 }} />

      {/* Scrollable content */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 420, margin: '0 auto', padding: '8px 10px 16px' }}>

          {/* League header card */}
          <div className="glass bg-metallic-shine" style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.glassBorder}`, marginBottom: 8 }}>
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

          {/* Hub navigation row with visit indicators */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 10 }}>
            <button className="fw-btn fw-btn-glass" onClick={() => go('roster')} style={{ flex: 1, fontSize: 11, padding: '8px 10px', color: starters.length < 7 ? T.lose : T.tx, borderColor: starters.length < 7 ? T.lose : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Roster<VisitDot visited={visits.roster} />
            </button>
            <button className="fw-btn fw-btn-glass" onClick={() => go('training')} style={{ flex: 1, fontSize: 11, padding: '8px 10px', color: T.win, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Entrenar<VisitDot visited={visits.training} />
            </button>
            <button className="fw-btn fw-btn-glass" onClick={openMarket} style={{ flex: 1, fontSize: 11, padding: '8px 10px', color: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Mercado<VisitDot visited={visits.market} />
            </button>
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
            <div className="glass" style={{ borderRadius: 10, padding: 12, border: `1px solid ${T.gold}20`, marginBottom: 8 }}>
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

          {/* ─── Resultados de la Jornada ─── */}
          {matchResults.length > 0 && game.matchNum > 0 && (
            <div className="glass" style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.glassBorder}`, marginBottom: 8 }}>
              <div style={{ padding: '7px 12px', borderBottom: `1px solid ${T.border}`, background: T.gradientDark }}>
                <span style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 11, color: T.tx2, textTransform: 'uppercase', letterSpacing: 1 }}>Resultados Jornada {game.matchNum}</span>
              </div>
              {matchResults.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '5px 12px', borderBottom: i < matchResults.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <span style={{ flex: 1, fontFamily: T.fontBody, fontSize: 11, color: T.tx2, textAlign: 'right', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{r.home}</span>
                  <span style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 13, color: T.tx, minWidth: 40, textAlign: 'center', padding: '0 6px' }}>{r.homeGoals} - {r.awayGoals}</span>
                  <span style={{ flex: 1, fontFamily: T.fontBody, fontSize: 11, color: T.tx2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{r.away}</span>
                </div>
              ))}
            </div>
          )}

          {/* ─── Estadísticas de Liga (tabbed accordion) ─── */}
          <div className="glass" style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.glassBorder}`, marginBottom: 8 }}>
            <div
              onClick={() => setStatsOpen(o => !o)}
              style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', touchAction: 'manipulation' }}
            >
              <span style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 11, color: T.tx2, textTransform: 'uppercase', letterSpacing: 1 }}>📊 Estadísticas</span>
              <span style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx3, transform: statsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', display: 'inline-block' }}>▾</span>
            </div>
            <div style={{ maxHeight: statsOpen ? 400 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              {/* Tab selector */}
              <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${T.border}` }}>
                {[
                  { id: 'goals', label: '⚽ Goles' },
                  { id: 'assists', label: '👟 Asist.' },
                  { id: 'cleanSheets', label: '🧤 P. Limpia' },
                ].map(tab => (
                  <button key={tab.id} onClick={(e) => { e.stopPropagation(); setStatsTab(tab.id); }} style={{
                    flex: 1, padding: '6px 4px', border: 'none', cursor: 'pointer',
                    fontFamily: T.fontHeading, fontSize: 10, fontWeight: 600, letterSpacing: 0.5,
                    color: statsTab === tab.id ? T.gold : T.tx3,
                    background: statsTab === tab.id ? 'rgba(240,192,64,0.06)' : 'transparent',
                    borderBottom: statsTab === tab.id ? `2px solid ${T.gold}` : '2px solid transparent',
                    transition: 'all 0.2s ease', touchAction: 'manipulation',
                  }}>{tab.label}</button>
                ))}
              </div>
              {/* Goals tab */}
              {statsTab === 'goals' && liveScorers.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px',
                  borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
                  background: s.you || s.team === 'Halcones' ? 'rgba(240,192,64,0.04)' : 'transparent',
                }}>
                  <span style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 12, color: i < 3 ? T.gold : T.tx3, minWidth: 18, textAlign: 'center' }}>{i + 1}.</span>
                  <span style={{ flex: 1, fontFamily: T.fontBody, fontSize: 11, color: s.you || s.team === 'Halcones' ? T.gold : T.tx, fontWeight: s.you || s.team === 'Halcones' ? 700 : 400 }}>{s.name}</span>
                  <span style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3 }}>{s.team}</span>
                  <span style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 12, color: T.tx, minWidth: 24, textAlign: 'right' }}>{s.goals}</span>
                </div>
              ))}
              {statsTab === 'goals' && liveScorers.length === 0 && (
                <div style={{ padding: '12px', textAlign: 'center', fontFamily: T.fontBody, fontSize: 11, color: T.tx3 }}>Sin goles aún</div>
              )}
              {/* Assists tab */}
              {statsTab === 'assists' && liveAssisters.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px',
                  borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
                  background: s.team === 'Halcones' ? 'rgba(240,192,64,0.04)' : 'transparent',
                }}>
                  <span style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 12, color: i < 3 ? T.info : T.tx3, minWidth: 18, textAlign: 'center' }}>{i + 1}.</span>
                  <span style={{ flex: 1, fontFamily: T.fontBody, fontSize: 11, color: s.team === 'Halcones' ? T.gold : T.tx, fontWeight: s.team === 'Halcones' ? 700 : 400 }}>{s.name}</span>
                  <span style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3 }}>{s.team}</span>
                  <span style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 12, color: T.info, minWidth: 24, textAlign: 'right' }}>{s.assists}</span>
                </div>
              ))}
              {statsTab === 'assists' && liveAssisters.length === 0 && (
                <div style={{ padding: '12px', textAlign: 'center', fontFamily: T.fontBody, fontSize: 11, color: T.tx3 }}>Sin asistencias registradas</div>
              )}
              {/* Clean sheets tab */}
              {statsTab === 'cleanSheets' && liveCleanSheets.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px',
                  borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
                  background: s.team === 'Halcones' ? 'rgba(240,192,64,0.04)' : 'transparent',
                }}>
                  <span style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 12, color: i < 3 ? T.win : T.tx3, minWidth: 18, textAlign: 'center' }}>{i + 1}.</span>
                  <span style={{ flex: 1, fontFamily: T.fontBody, fontSize: 11, color: s.team === 'Halcones' ? T.gold : T.tx, fontWeight: s.team === 'Halcones' ? 700 : 400 }}>{s.name}</span>
                  <span style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3 }}>{s.team} · {s.pos}</span>
                  <span style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 12, color: T.win, minWidth: 24, textAlign: 'right' }}>{s.cleanSheets}</span>
                </div>
              ))}
              {statsTab === 'cleanSheets' && liveCleanSheets.length === 0 && (
                <div style={{ padding: '12px', textAlign: 'center', fontFamily: T.fontBody, fontSize: 11, color: T.tx3 }}>Sin porterías limpias aún</div>
              )}
            </div>
          </div>

          {/* ─── Social Feed del Torneo ─── */}
          <div className="glass" style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.glassBorder}`, marginBottom: 8 }}>
            <div
              onClick={() => setSocialOpen(o => !o)}
              style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', touchAction: 'manipulation' }}
            >
              <span style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 11, color: T.tx2, textTransform: 'uppercase', letterSpacing: 1 }}>📱 Social</span>
              <span style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx3, transform: socialOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', display: 'inline-block' }}>▾</span>
            </div>
            <div style={{ maxHeight: socialOpen ? 400 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              <div style={{ padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {socialFeed.map((p, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '8px 10px', border: `1px solid ${T.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{p.acc.av}</span>
                      <span style={{ fontFamily: T.fontHeading, fontSize: 11, color: T.tx2, flex: 1, fontWeight: 500 }}>{p.acc.n}</span>
                      <span style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3 }}>{p.time}</span>
                    </div>
                    <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx, lineHeight: 1.4 }}>{p.text}</div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4, fontFamily: T.fontBody, fontSize: 10, color: T.tx3 }}>
                      <span>❤ {p.likes}</span><span>💬 {p.comments}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Hard block overlay: Incomplete roster */}
      {showIncomplete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        }}>
          <div style={{
            maxWidth: 340, width: '90%', padding: '24px 20px',
            background: 'rgba(20,24,36,0.95)', border: `1px solid rgba(239,68,68,0.3)`,
            borderRadius: 16, textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>&#9888;&#65039;</div>
            <div style={{
              fontFamily: T.fontHeading, fontWeight: 700, fontSize: 18, color: T.lose,
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
            }}>Plantilla Incompleta</div>
            <div style={{
              fontFamily: T.fontBody, fontSize: 14, color: T.tx2, lineHeight: 1.5, marginBottom: 16,
            }}>
              Necesitas al menos 7 titulares para jugar. Tienes <span style={{ fontWeight: 700, color: T.lose }}>{starters.length}/7</span>.
            </div>
            <button className="fw-btn fw-btn-danger" onClick={() => { setShowIncomplete(false); go('roster'); }} style={{
              fontFamily: T.fontHeading, fontWeight: 700, fontSize: 14,
              padding: '12px 28px', textTransform: 'uppercase', letterSpacing: 1,
              borderRadius: 8, width: '100%',
            }}>Ir al Roster</button>
            <button className="fw-btn fw-btn-outline" onClick={() => setShowIncomplete(false)} style={{
              fontFamily: T.fontHeading, fontSize: 12, padding: '8px 20px',
              marginTop: 8, color: T.tx3, width: '100%',
            }}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Soft reminder overlay: Unvisited screens */}
      {showReminder && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        }}>
          <div style={{
            maxWidth: 360, width: '90%', padding: '24px 20px',
            background: 'rgba(20,24,36,0.92)', border: `1px solid ${T.glassBorder}`,
            borderRadius: 16, textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>&#128203;</div>
            <div style={{
              fontFamily: T.fontHeading, fontWeight: 700, fontSize: 16, color: T.gold,
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
            }}>Recordatorio</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, textAlign: 'left' }}>
              {[
                { key: 'roster', label: 'Roster', visited: visits.roster },
                { key: 'training', label: 'Entrenamiento', visited: visits.training },
                { key: 'market', label: 'Mercado', visited: visits.market },
              ].map(item => (
                <div key={item.key} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 8,
                  background: item.visited ? 'rgba(34,197,94,0.06)' : 'rgba(245,158,11,0.06)',
                  border: `1px solid ${item.visited ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)'}`,
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{item.visited ? '\u2705' : '\u274C'}</span>
                  <span style={{
                    fontFamily: T.fontBody, fontSize: 13,
                    color: item.visited ? T.win : 'rgba(245,158,11,0.9)',
                    fontWeight: 500,
                  }}>
                    {item.label} {item.visited ? '(visitado)' : '(no visitado)'}
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              fontFamily: T.fontBody, fontSize: 12, color: T.tx3, marginBottom: 16, lineHeight: 1.4,
            }}>
              Deseas continuar al partido de todos modos?
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="fw-btn fw-btn-outline" onClick={() => setShowReminder(false)} style={{
                flex: 1, fontFamily: T.fontHeading, fontSize: 12, padding: '10px 12px',
                color: T.tx2, letterSpacing: 0.5,
              }}>Revisar primero</button>
              <button className="fw-btn" onClick={() => { setShowReminder(false); proceedToNext(); }} style={{
                flex: 1, fontFamily: T.fontHeading, fontWeight: 700, fontSize: 12,
                padding: '10px 12px', letterSpacing: 0.5,
                background: 'linear-gradient(135deg, #F0C040, #D4A017)',
                color: '#1a1a2e', border: '1px solid rgba(240,192,64,0.6)',
                borderRadius: 8,
              }}>Continuar &rarr;</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
