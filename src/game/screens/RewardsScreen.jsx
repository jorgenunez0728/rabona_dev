import { useEffect } from "react";
import { SFX } from "@/game/audio";
import { T, PN, POS_COLORS, RELICS, calcOvr, rnd } from "@/game/data";
import useGameStore from "@/game/store";

export default function RewardsScreen() {
  const { game, rewards, setRewards, rewardsTab, setRewardsTab, go } = useGameStore();

  const r = rewards.result; if (!r) return null;
  const xpGain = rewards.xpGain || 0;
  const resultColor = r.won ? T.win : r.drew ? T.draw : T.lose;
  const resultLabel = r.won ? 'VICTORIA' : r.drew ? 'EMPATE' : 'DERROTA';
  const [tab, setTab] = [rewardsTab, setRewardsTab];
  useEffect(() => { if (r.won) SFX.play('victory'); else if (r.lost) SFX.play('defeat'); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'auto', background: T.bg }}>
      <div style={{ width: '100%', background: 'linear-gradient(135deg,#1565c0 0%,#0d47a1 50%,#c62828 100%)', padding: '16px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 28, color: resultColor, textTransform: 'uppercase', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{resultLabel}</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, margin: '4px 0' }}>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 14, color: '#fff', textTransform: 'uppercase' }}>HALCONES</div>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 48, color: '#fff' }}>{r.ps} - {r.rs}</div>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 14, color: '#fff', textTransform: 'uppercase' }}>{r.rivalName}</div>
        </div>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>+{r.xpGain} XP · +{r.coinGain || 0} 💰</div>
      </div>
      {rewards.stolen && (
        <div style={{ background: 'rgba(255,23,68,0.08)', borderBottom: '1px solid rgba(255,23,68,0.2)', padding: '8px 16px', width: '100%', textAlign: 'center' }}>
          <span style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 12, color: '#ff1744', textTransform: 'uppercase' }}>💀 {r.rivalName} se lleva a {rewards.stolen.name} ({PN[rewards.stolen.pos]})</span>
        </div>
      )}
      <div style={{ display: 'flex', width: '100%', maxWidth: 420, background: T.bg1, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {[{ k: 'summary', l: '📊 Resumen' }, { k: 'social', l: '📱 Redes' }, { k: 'roster', l: '📋 Roster' }, { k: 'rewards', l: '🎁 Recomp.' }].map(t => (
          <div key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, padding: '8px 4px', textAlign: 'center', fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, color: tab === t.k ? '#f0c040' : '#607d8b', cursor: 'pointer', borderBottom: tab === t.k ? '2px solid #f0c040' : '2px solid transparent' }}>{t.l}</div>
        ))}
      </div>
      <div style={{ width: '100%', maxWidth: 420, padding: 8, flex: 1 }}>
        {tab === 'summary' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ background: T.bg1, borderRadius: 6, padding: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, color: '#607d8b', textTransform: 'uppercase', marginBottom: 4 }}>Estadísticas</div>
              {[{ l: 'Posesión', h: `${r.possPct || 50}%`, a: `${100 - (r.possPct || 50)}%`, hp: r.possPct || 50 }, { l: 'Tiros', h: r.shots || 0, a: rnd(2, 6), hp: 60 }, { l: 'Moral final', h: r.morale || 50, a: '-', hp: r.morale || 50 }].map((s, i) => (
                <div key={i} style={{ marginBottom: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Barlow Condensed'", fontSize: 11, color: '#e8eaf6', marginBottom: 2 }}><span>{s.h}</span><span style={{ color: '#607d8b', fontSize: 10 }}>{s.l}</span><span>{s.a}</span></div>
                  <div style={{ display: 'flex', height: 3, borderRadius: 2, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ width: `${s.hp}%`, background: '#42a5f5', borderRadius: 2 }} /><div style={{ flex: 1, background: 'rgba(239,83,80,0.3)', borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
            {r.injuryList?.length > 0 && (
              <div style={{ background: 'rgba(255,23,68,0.04)', borderRadius: 6, padding: 10, border: '1px solid rgba(255,23,68,0.1)' }}>
                <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, color: '#ff1744', textTransform: 'uppercase', marginBottom: 4 }}>🏥 Lesiones</div>
                {r.injuryList.map((inj, i) => (<div key={i} style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: '#ff1744', padding: '1px 0' }}>🏥 {inj.name} — fuera {inj.games} partido(s)</div>))}
              </div>
            )}
            {r.objResults?.length > 0 && (
              <div style={{ background: T.bg1, borderRadius: 6, padding: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, color: T.gold, textTransform: 'uppercase', marginBottom: 4 }}>🎯 Objetivos</div>
                {r.objResults.map((o, i) => (<div key={i} style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: o.completed ? '#00e676' : '#607d8b', padding: '1px 0' }}>{o.completed ? '✅' : '❌'} {o.n} {o.completed ? `(+${o.r.coins}💰)` : ''}</div>))}
              </div>
            )}
            {(game.relics||[]).length > 0 && (
              <div style={{ background: `rgba(168,85,247,0.05)`, borderRadius: 6, padding: 10, border: `1px solid rgba(168,85,247,0.15)` }}>
                <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, color: T.purple, textTransform: 'uppercase', marginBottom: 5 }}>📿 Reliquias Activas</div>
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  {(game.relics||[]).map(rid => { const r = RELICS.find(x=>x.id===rid); return r ? (
                    <div key={rid} style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:16 }}>{r.i}</span>
                      <div>
                        <div style={{ fontFamily:"'Oswald'", fontSize:11, color:T.tx }}>{r.n}</div>
                        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:10, color:T.tx3 }}>{r.d}</div>
                      </div>
                    </div>
                  ) : null; })}
                </div>
              </div>
            )}
          </div>
        )}
        {tab === 'social' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(r.socialPosts || []).map((post, i) => (
              <div key={i} style={{ background: T.bg1, borderRadius: 10, border: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{post.account.av}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, color: T.tx }}>{post.account.n}{post.account.v && <span style={{ color: '#1DA1F2', fontSize: 11, marginLeft: 4 }}>✓</span>}</div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: T.tx3 }}>{post.account.f} · {post.time}</div>
                  </div>
                </div>
                <div style={{ padding: '0 12px 10px', fontFamily: "'Barlow'", fontSize: 14, color: T.tx, lineHeight: 1.5 }}>{post.text}</div>
                <div style={{ display: 'flex', gap: 16, padding: '6px 12px 10px', borderTop: `1px solid ${T.border}` }}>
                  <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx2 }}>❤️ {post.likes}</span>
                  <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx2 }}>💬 {post.comments}</span>
                  <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx2 }}>🔄 {post.retweets}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'roster' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {(r.rosterSnapshot || []).sort((a, b) => (a.role === 'st' ? 0 : 1) - (b.role === 'st' ? 0 : 1)).map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 8px', background: T.bg1, borderRadius: 3, border: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 10, color: POS_COLORS[p.pos], minWidth: 26, textAlign: 'center' }}>{PN[p.pos]}</span>
                <span style={{ flex: 1, fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 13, color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.role === 'st' ? '⚽ ' : ''}{p.name}</span>
                <span style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 14, color: '#f0c040' }}>{calcOvr(p)}</span>
              </div>
            ))}
          </div>
        )}
        {tab === 'rewards' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, color: '#fff', textTransform: 'uppercase', textAlign: 'center', marginBottom: 2 }}>Elige Recompensa</div>
            {rewards.options.map((rw, i) => (
              <div key={i} onClick={() => {
                if (rewards.selected === i) { SFX.play('click'); setRewards(rv => ({ ...rv, selected: null })); }
                else if (rewards.selected === null) { SFX.play('reward'); rw.fn(); setRewards(rv => ({ ...rv, selected: i })); }
              }} style={{ background: rewards.selected === i ? 'rgba(0,200,83,0.04)' : 'linear-gradient(135deg,rgba(20,30,58,0.95),rgba(26,39,68,0.95))', border: `1px solid ${rewards.selected === i ? 'rgba(0,230,118,0.3)' : 'rgba(255,255,255,0.06)'}`, borderLeft: `4px solid ${rewards.selected === i ? '#00e676' : '#455a64'}`, borderRadius: 4, padding: 10, cursor: rewards.selected !== null && rewards.selected !== i ? 'not-allowed' : 'pointer', opacity: rewards.selected !== null && rewards.selected !== i ? .3 : 1 }}>
                <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, color: '#f0c040', textTransform: 'uppercase' }}>{rw.title}</div>
                <div style={{ fontSize: 13, color: '#e8eaf6', lineHeight: 1.2, marginTop: 2 }}>{rw.desc}</div>
                <div style={{ fontSize: 10, color: '#607d8b', marginTop: 2 }}>{rw.detail}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: '8px 16px', width: '100%', maxWidth: 420 }}>
        {tab === 'rewards' ? (
          <button onClick={() => { if (rewards.selected !== null) go('table'); }} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, padding: '10px 28px', border: 'none', background: rewards.selected !== null ? 'linear-gradient(135deg,#d4a017,#f0c040)' : '#333', color: rewards.selected !== null ? '#1a1a2e' : '#666', clipPath: 'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)', cursor: rewards.selected !== null ? 'pointer' : 'not-allowed', textTransform: 'uppercase', opacity: rewards.selected !== null ? 1 : .4, width: '100%', marginBottom: 12 }}>Ver Tabla</button>
        ) : (
          <button onClick={() => setTab('rewards')} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, padding: '10px 28px', border: 'none', background: 'linear-gradient(135deg,#d4a017,#f0c040)', color: '#1a1a2e', clipPath: 'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)', cursor: 'pointer', textTransform: 'uppercase', width: '100%', marginBottom: 12 }}>🎁 Elegir Recompensa →</button>
        )}
      </div>
    </div>
  );
}
