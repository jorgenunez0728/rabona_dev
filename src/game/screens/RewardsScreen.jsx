import { useEffect } from "react";
import { SFX } from "@/game/audio";
import { T, PN, POS_COLORS, RELICS, calcOvr, rnd } from "@/game/data";
import { RelicIcon } from "@/game/data/chibiAssets";
import useGameStore from "@/game/store";

export default function RewardsScreen() {
  const { game, rewards, setRewards, rewardsTab, setRewardsTab, go } = useGameStore();

  const r = rewards.result; if (!r) return null;
  const xpGain = rewards.xpGain || 0;
  const resultColor = r.won ? T.win : r.drew ? T.draw : T.lose;
  const resultLabel = r.won ? 'VICTORIA' : r.drew ? 'EMPATE' : 'DERROTA';
  const resultGradient = r.won ? T.gradientGreen : r.drew ? 'linear-gradient(135deg,#F59E0B,#D97706)' : T.gradientDanger;
  const [tab, setTab] = [rewardsTab, setRewardsTab];
  useEffect(() => { if (r.won) SFX.play('victory'); else if (r.lost) SFX.play('defeat'); }, []);

  return (
    <div className="stadium-glow" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'auto', background: T.bg }}>
      {/* Hero header with stadium gradient */}
      <div style={{
        width: '100%',
        background: `${T.gradientStadium}, linear-gradient(180deg, ${T.bg1} 0%, ${T.bg} 100%)`,
        padding: '24px 16px 16px', textAlign: 'center', position: 'relative',
      }}>
        {/* Result badge */}
        <div className="anim-stagger-1" style={{
          display: 'inline-block', padding: '4px 20px', borderRadius: 20,
          background: resultGradient, marginBottom: 8,
        }}>
          <span style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 13, color: '#fff', textTransform: 'uppercase', letterSpacing: 2 }}>{resultLabel}</span>
        </div>
        {/* Score */}
        <div className="anim-stagger-2" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, margin: '4px 0' }}>
          <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 14, color: T.tx2, textTransform: 'uppercase', textAlign: 'right', minWidth: 80 }}>HALCONES</div>
          <div style={{
            fontFamily: T.fontHeading, fontWeight: 700, fontSize: 52, color: T.tx,
            textShadow: `0 0 30px ${resultColor}40`,
            letterSpacing: 4,
          }}>{r.ps} - {r.rs}</div>
          <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 14, color: T.tx2, textTransform: 'uppercase', textAlign: 'left', minWidth: 80 }}>{r.rivalName}</div>
        </div>
        <div className="anim-stagger-3" style={{ fontFamily: T.fontBody, fontSize: 13, color: T.tx3 }}>+{r.xpGain} XP · +{r.coinGain || 0} 💰</div>
      </div>

      {/* Stolen player alert */}
      {rewards.stolen && (
        <div className="glass" style={{ borderColor: T.lose + '30', borderRadius: 0, padding: '8px 16px', width: '100%', textAlign: 'center' }}>
          <span style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 12, color: T.lose, textTransform: 'uppercase' }}>💀 {r.rivalName} se lleva a {rewards.stolen.name} ({PN[rewards.stolen.pos]})</span>
        </div>
      )}

      {/* Tab bar with gold underline */}
      <div style={{ display: 'flex', width: '100%', maxWidth: 420, background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
        {[{ k: 'summary', l: '📊 Resumen' }, { k: 'social', l: '📱 Redes' }, { k: 'roster', l: '📋 Roster' }, { k: 'rewards', l: '🎁 Recomp.' }].map(t => (
          <div key={t.k} onClick={() => setTab(t.k)} style={{
            flex: 1, padding: '10px 4px', textAlign: 'center',
            fontFamily: T.fontHeading, fontWeight: 600, fontSize: 11, letterSpacing: 0.3,
            color: tab === t.k ? T.gold : T.tx4, cursor: 'pointer',
            borderBottom: tab === t.k ? `2px solid ${T.gold}` : '2px solid transparent',
            transition: 'color 0.2s ease, border-color 0.2s ease',
          }}>{t.l}</div>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 420, padding: 10, flex: 1 }}>
        {tab === 'summary' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Man of the Match — premium gold card */}
            {r.manOfTheMatch && (
              <div className="card-gold anim-stagger-1" style={{ padding: 14, textAlign: 'center' }}>
                <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>
                  <span className="text-gradient-gold">⭐ Figura del Partido</span>
                </div>
                <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 18, color: T.tx }}>{r.manOfTheMatch.name}</div>
                <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx3, marginTop: 2 }}>{PN[r.manOfTheMatch.pos]} · OVR {calcOvr(r.manOfTheMatch)}</div>
              </div>
            )}
            {/* Match Statistics — glass container with dual bars */}
            <div className="glass anim-stagger-2" style={{ borderRadius: 10, padding: 14 }}>
              <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 11, color: T.tx3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Estadisticas</div>
              {(() => {
                const es = r.engineStats;
                const statRows = es ? [
                  { l: 'Posesion', h: `${es.possessionPct?.home || 50}%`, a: `${es.possessionPct?.away || 50}%`, hp: es.possessionPct?.home || 50 },
                  { l: 'Tiros', h: es.shots?.home || 0, a: es.shots?.away || 0, hp: es.shots?.home ? Math.round(es.shots.home / Math.max(1, es.shots.home + es.shots.away) * 100) : 50 },
                  { l: 'A puerta', h: es.shotsOnTarget?.home || 0, a: es.shotsOnTarget?.away || 0, hp: es.shotsOnTarget?.home ? Math.round(es.shotsOnTarget.home / Math.max(1, es.shotsOnTarget.home + es.shotsOnTarget.away) * 100) : 50 },
                  { l: 'Corners', h: es.corners?.home || 0, a: es.corners?.away || 0, hp: 50 },
                  { l: 'Faltas', h: es.fouls?.home || 0, a: es.fouls?.away || 0, hp: 50 },
                  { l: 'Moral final', h: r.morale || 50, a: '-', hp: r.morale || 50 },
                ] : [
                  { l: 'Posesion', h: `${r.possPct || 50}%`, a: `${100 - (r.possPct || 50)}%`, hp: r.possPct || 50 },
                  { l: 'Tiros', h: r.shots || 0, a: rnd(2, 6), hp: 60 },
                  { l: 'Moral final', h: r.morale || 50, a: '-', hp: r.morale || 50 },
                ];
                return statRows.map((s, i) => (
                  <div key={i} style={{ marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: T.fontBody, fontSize: 12, color: T.tx, marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, minWidth: 28 }}>{s.h}</span>
                      <span style={{ color: T.tx3, fontSize: 11, fontFamily: T.fontHeading, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.l}</span>
                      <span style={{ fontWeight: 600, minWidth: 28, textAlign: 'right' }}>{s.a}</span>
                    </div>
                    <div style={{ display: 'flex', height: 5, borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', gap: 2 }}>
                      <div style={{ width: `${s.hp}%`, background: T.gradientBlue, borderRadius: 3, transition: 'width 0.6s ease' }} />
                      <div style={{ flex: 1, background: `rgba(239,68,68,0.35)`, borderRadius: 3 }} />
                    </div>
                  </div>
                ));
              })()}
            </div>
            {/* Scorers */}
            {r.engineStats?.goals?.filter(g => g.team === 'home').length > 0 && (
              <div className="glass anim-stagger-3" style={{ borderRadius: 10, padding: 14 }}>
                <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 11, color: T.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>⚽ Goles</div>
                {r.engineStats.goals.filter(g => g.team === 'home').map((g, i) => (
                  <div key={i} style={{ fontFamily: T.fontBody, fontSize: 13, color: T.tx, padding: '3px 0' }}>
                    ⚽ {g.minute}' {g.scorer || 'Gol'}{g.assister ? ` (asist. ${g.assister})` : ''}
                  </div>
                ))}
                {r.engineStats.goals.filter(g => g.team === 'away').map((g, i) => (
                  <div key={`a${i}`} style={{ fontFamily: T.fontBody, fontSize: 13, color: T.lose, padding: '3px 0' }}>
                    💀 {g.minute}' Gol rival
                  </div>
                ))}
              </div>
            )}
            {/* Injuries */}
            {r.injuryList?.length > 0 && (
              <div className="glass anim-stagger-4" style={{ borderRadius: 10, padding: 14, borderColor: T.lose + '20' }}>
                <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 11, color: T.lose, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>🏥 Lesiones</div>
                {r.injuryList.map((inj, i) => (<div key={i} style={{ fontFamily: T.fontBody, fontSize: 12, color: T.lose, padding: '2px 0' }}>🏥 {inj.name} — fuera {inj.games} partido(s)</div>))}
              </div>
            )}
            {/* Objectives */}
            {r.objResults?.length > 0 && (
              <div className="glass anim-stagger-5" style={{ borderRadius: 10, padding: 14 }}>
                <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 11, color: T.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>🎯 Objetivos</div>
                {r.objResults.map((o, i) => (<div key={i} style={{ fontFamily: T.fontBody, fontSize: 12, color: o.completed ? T.win : T.tx4, padding: '2px 0' }}>{o.completed ? '✅' : '❌'} {o.n} {o.completed ? `(+${o.r.coins}💰)` : ''}</div>))}
              </div>
            )}
            {/* Active Relics */}
            {(game.relics||[]).length > 0 && (
              <div className="card-purple anim-stagger-6" style={{ padding: 14 }}>
                <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 11, color: T.purple, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>📿 Reliquias Activas</div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {(game.relics||[]).map(rid => { const r = RELICS.find(x=>x.id===rid); return r ? (
                    <div key={rid} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <RelicIcon id={r.id} size={26} />
                      <div>
                        <div style={{ fontFamily: T.fontHeading, fontSize: 12, color: T.tx, fontWeight: 600 }}>{r.n}</div>
                        <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3 }}>{r.d}</div>
                      </div>
                    </div>
                  ) : null; })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Social tab */}
        {tab === 'social' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(r.socialPosts || []).map((post, i) => (
              <div key={i} className={`glass anim-stagger-${Math.min(i + 1, 6)}`} style={{ borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: T.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, border: `1px solid ${T.border}` }}>{post.account.av}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 13, color: T.tx }}>{post.account.n}{post.account.v && <span style={{ color: T.info, fontSize: 11, marginLeft: 4 }}>✓</span>}</div>
                    <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx4 }}>{post.account.f} · {post.time}</div>
                  </div>
                </div>
                <div style={{ padding: '0 14px 12px', fontFamily: T.fontBody, fontSize: 14, color: T.tx, lineHeight: 1.5 }}>{post.text}</div>
                <div style={{ display: 'flex', gap: 20, padding: '8px 14px 12px', borderTop: `1px solid ${T.border}` }}>
                  <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3 }}>❤️ {post.likes}</span>
                  <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3 }}>💬 {post.comments}</span>
                  <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3 }}>🔄 {post.retweets}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Roster tab */}
        {tab === 'roster' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {(r.rosterSnapshot || []).sort((a, b) => (a.role === 'st' ? 0 : 1) - (b.role === 'st' ? 0 : 1)).map((p, i) => (
              <div key={p.id} className={`anim-stagger-${Math.min(i + 1, 6)}`} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                background: T.bg1, borderRadius: 8, border: `1px solid ${T.border}`,
              }}>
                <span style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 11, color: POS_COLORS[p.pos], minWidth: 28, textAlign: 'center', letterSpacing: 0.5 }}>{PN[p.pos]}</span>
                <span style={{ flex: 1, fontFamily: T.fontBody, fontWeight: 600, fontSize: 13, color: T.tx, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.role === 'st' ? '⚽ ' : ''}{p.name}</span>
                <span style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 15, color: T.gold }}>{calcOvr(p)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Rewards tab */}
        {tab === 'rewards' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="anim-stagger-1" style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 16, color: T.tx, textTransform: 'uppercase', textAlign: 'center', marginBottom: 4, letterSpacing: 1 }}>Elige Recompensa</div>
            {rewards.options.map((rw, i) => (
              <div key={i} className={`card-premium anim-stagger-${Math.min(i + 2, 6)}`} onClick={() => {
                if (rewards.selected === i) { SFX.play('click'); setRewards(rv => ({ ...rv, selected: null })); }
                else if (rewards.selected === null) { SFX.play('reward'); rw.fn(); setRewards(rv => ({ ...rv, selected: i })); }
              }} style={{
                padding: 14, cursor: rewards.selected !== null && rewards.selected !== i ? 'not-allowed' : 'pointer',
                opacity: rewards.selected !== null && rewards.selected !== i ? .25 : 1,
                borderColor: rewards.selected === i ? T.win + '50' : undefined,
                borderLeft: `3px solid ${rewards.selected === i ? T.win : T.tx4}`,
                transition: 'all 0.2s ease',
              }}>
                <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 15, color: T.gold, textTransform: 'uppercase', letterSpacing: 0.5 }}>{rw.title}</div>
                <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.tx, lineHeight: 1.3, marginTop: 3 }}>{rw.desc}</div>
                <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx4, marginTop: 3 }}>{rw.detail}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div style={{ padding: '10px 16px 16px', width: '100%', maxWidth: 420 }}>
        {tab === 'rewards' ? (
          <button onClick={() => { if (rewards.selected !== null) go('table'); }} style={{
            fontFamily: T.fontHeading, fontWeight: 700, fontSize: 15, padding: '14px',
            border: 'none', borderRadius: 10, width: '100%',
            background: rewards.selected !== null ? T.gradientPrimary : T.bg2,
            color: rewards.selected !== null ? T.bg : T.tx4,
            cursor: rewards.selected !== null ? 'pointer' : 'not-allowed',
            textTransform: 'uppercase', letterSpacing: 1,
            opacity: rewards.selected !== null ? 1 : .4,
            boxShadow: rewards.selected !== null ? T.glowGold : 'none',
            transition: 'all 0.2s ease',
          }}>Ver Tabla</button>
        ) : (
          <button onClick={() => setTab('rewards')} style={{
            fontFamily: T.fontHeading, fontWeight: 700, fontSize: 15, padding: '14px',
            border: 'none', borderRadius: 10, width: '100%',
            background: T.gradientPrimary, color: T.bg,
            cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1,
            boxShadow: T.glowGold,
          }}>🎁 Elegir Recompensa →</button>
        )}
      </div>
    </div>
  );
}
