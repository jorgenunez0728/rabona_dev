import { useState } from "react";
import { T, PN, POS_COLORS, ACHIEVEMENTS } from "@/game/data";
import { LEGACY_TREE, LEGACY_BRANCHES, calcLegacyPoints, calcSpentLegacy, canUnlockLegacy, hasLegacy } from "@/game/data/progression.js";
import { AchIcon } from "@/game/data/chibiAssets";
import useGameStore from "@/game/store";

export default function StatsScreen() {
  const { globalStats, go, unlockLegacy } = useGameStore();

  const gs = globalStats;
  const topScorers = Object.entries(gs.allTimeScorers || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const [tab, setTab] = useState('stats');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'auto', background: T.bg }}>
      <div style={{ width: '100%', padding: '12px 16px', textAlign: 'center' }}>
        <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 22, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>📖 Compendio</div>
      </div>
      <div style={{ display: 'flex', width: '100%', maxWidth: 440, background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
        {[{ k: 'stats', l: '📊' }, { k: 'legacy', l: '🌳' }, { k: 'fame', l: '🌟' }, { k: 'achieve', l: '🏆' }].map(t => (
          <div key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, padding: '8px 4px', textAlign: 'center', fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, color: tab === t.k ? T.gold : T.tx3, cursor: 'pointer', borderBottom: tab === t.k ? `2px solid ${T.gold}` : '2px solid transparent' }}>{t.l}</div>
        ))}
      </div>
      <div style={{ width: '100%', maxWidth: 440, padding: 10, flex: 1 }}>
        {tab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ background: T.bg1, borderRadius: 8, padding: 12, border: `1px solid ${T.border}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                {[{ l: 'Runs', v: gs.totalRuns || 0, c: T.tx }, { l: 'Victorias', v: gs.totalWins || 0, c: T.win }, { l: 'Goles', v: gs.totalGoals || 0, c: T.info }, { l: 'Mejor liga', v: gs.bestLeagueName || '—', c: T.purple }, { l: 'Racha', v: (gs.bestStreak || 0) + '🔥', c: T.draw }, { l: 'Ascensión', v: (gs.ascensionLevel || 0) + '/7', c: T.gold }].map((s, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 4, padding: '6px 4px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 16, color: s.c }}>{s.v}</div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            {topScorers.length > 0 && (
              <div style={{ background: T.bg1, borderRadius: 8, padding: 10, border: `1px solid ${T.border}` }}>
                <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: T.gold, textTransform: 'uppercase', marginBottom: 4, textAlign: 'center' }}>⚽ Goleadores</div>
                {topScorers.map(([name, goals], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 4px', fontFamily: "'Barlow Condensed'", fontSize: 12, borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ color: i === 0 ? T.gold : T.tx }}>{i === 0 ? '👑 ' : ''}{i + 1}. {name}</span>
                    <span style={{ fontFamily: "'Oswald'", fontWeight: 700, color: T.gold }}>{goals}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === 'legacy' && (() => {
          const totalPts = calcLegacyPoints(gs);
          const spentPts = calcSpentLegacy(gs);
          const availPts = totalPts - spentPts;
          const branchNames = { scouting: '🔭 Scouting', cantera: '🌱 Cantera', sponsor: '💰 Sponsor', tactics: '📋 Táctica', charisma: '🗣 Carisma' };
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: T.bg1, borderRadius: 8, padding: 10, border: `1px solid ${T.border}`, textAlign: 'center' }}>
                <div style={{ fontFamily: T.fontHeading, fontSize: 11, color: T.gold, textTransform: 'uppercase', letterSpacing: 1 }}>Puntos de Legado</div>
                <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 28, color: T.gold }}>{availPts}</div>
                <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3 }}>Ganados: {totalPts} · Gastados: {spentPts}</div>
              </div>
              {LEGACY_BRANCHES.map(branch => {
                const nodes = Object.values(LEGACY_TREE).filter(n => n.branch === branch).sort((a, b) => a.tier - b.tier);
                return (
                  <div key={branch} style={{ background: T.bg1, borderRadius: 8, padding: 10, border: `1px solid ${T.border}` }}>
                    <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 13, color: T.tx, marginBottom: 6 }}>{branchNames[branch] || branch}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {nodes.map(node => {
                        const owned = hasLegacy(gs, node.id);
                        const canBuy = canUnlockLegacy(gs, node.id);
                        return (
                          <div key={node.id} onClick={() => { if (canBuy) { unlockLegacy(node.id); } }} style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                            background: owned ? `${T.win}10` : canBuy ? 'rgba(255,215,0,0.05)' : 'rgba(255,255,255,0.01)',
                            border: `1px solid ${owned ? T.win + '30' : canBuy ? T.gold + '30' : T.border}`,
                            borderRadius: 6, cursor: canBuy ? 'pointer' : 'default', opacity: owned || canBuy ? 1 : 0.4,
                            touchAction: 'manipulation', minHeight: 48,
                          }}>
                            <div style={{ fontSize: 20, minWidth: 28, textAlign: 'center' }}>{node.i}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 12, color: owned ? T.win : canBuy ? T.gold : T.tx3 }}>{node.n}</div>
                              <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3 }}>{node.d}</div>
                            </div>
                            <div style={{ textAlign: 'right', minWidth: 30 }}>
                              {owned ? <span style={{ color: T.win, fontFamily: T.fontHeading, fontSize: 12 }}>✓</span>
                                : <span style={{ color: canBuy ? T.gold : T.tx3, fontFamily: T.fontHeading, fontSize: 11 }}>{node.cost}pt</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
        {tab === 'fame' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(gs.hallOfFame || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: T.tx3, fontSize: 13 }}>Completa tu primer run para añadir leyendas.</div>
            ) : (gs.hallOfFame || []).slice().reverse().map((p, i) => (
              <div key={i} style={{ background: 'linear-gradient(145deg,#2a2510,#3a3215)', borderRadius: 8, padding: 10, border: `1px solid ${T.gold}20`, display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ textAlign: 'center', minWidth: 36 }}>
                  <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 22, color: T.gold }}>{p.ovr}</div>
                  <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: POS_COLORS[p.pos] || T.tx2, letterSpacing: 0.5 }}>{PN[p.pos] || p.pos}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 14, color: T.tx }}>⭐ {p.name}</div>
                  {p.trait && <div style={{ fontSize: 11, color: T.purple, marginTop: 1 }}>✦ {p.trait}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx2 }}>Run #{p.run}</div>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.gold }}>{p.league}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'achieve' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontFamily: "'Oswald'", fontSize: 12, color: T.gold, textAlign: 'center' }}>{(gs.achievements || []).length}/{ACHIEVEMENTS.length} Completados</div>
            {ACHIEVEMENTS.map(a => {
              const done = (gs.achievements || []).includes(a.id);
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: done ? `${T.win}08` : T.bg1, borderRadius: 6, border: `1px solid ${done ? T.win + '20' : T.border}` }}>
                  <div style={{ minWidth: 28, textAlign: 'center', opacity: done ? 1 : 0.3 }}><AchIcon id={a.id} size={28} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, color: done ? T.tx : T.tx3 }}>{a.n}</div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: done ? T.tx2 : T.tx3 }}>{a.d}</div>
                  </div>
                  {done && <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: T.win }}>✓</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ padding: '10px 16px', width: '100%', maxWidth: 440 }}>
        <button onClick={() => go('title')} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, padding: '10px 28px', border: `1.5px solid ${T.tx3}`, background: 'transparent', color: T.tx, borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', width: '100%' }}>Volver</button>
      </div>
    </div>
  );
}
