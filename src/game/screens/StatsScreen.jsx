import { useState } from "react";
import { T, PN, POS_COLORS, ACHIEVEMENTS, LEAGUES, RELICS } from "@/game/data";
import { LEGACY_TREE, LEGACY_BRANCHES, calcLegacyPoints, calcSpentLegacy, canUnlockLegacy, hasLegacy, COACHES, COACH_ABILITIES, CURSES } from "@/game/data/progression.js";
import { AchIcon } from "@/game/data/chibiAssets";
import { SFX } from "@/game/audio";
import { Haptics } from "@/game/haptics";
import { TACTICAL_CARDS, CARD_RARITIES, getCollectionCards } from "@/game/data/cards.js";
import { computeRecords, computeArchetypeAnalytics } from "@/game/data/runTracker.js";
import { MANAGER_ARCHETYPES } from "@/game/data/archetypes.js";
import useGameStore from "@/game/store";

export default function StatsScreen() {
  const { globalStats, go, unlockLegacy } = useGameStore();

  const gs = globalStats;
  const topScorers = Object.entries(gs.allTimeScorers || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const [tab, setTab] = useState('stats');

  const tabs = [
    { k: 'stats',      l: '📊', label: 'General' },
    { k: 'runs',       l: '📜', label: 'Runs' },
    { k: 'records',    l: '🏅', label: 'Records' },
    { k: 'arquetipos', l: '🎭', label: 'Arquetipos' },
    { k: 'legacy',     l: '🌳', label: 'Legado' },
    { k: 'cards',      l: '🎴', label: 'Cartas' },
    { k: 'fame',       l: '🌟', label: 'Fama' },
    { k: 'achieve',    l: '🏆', label: 'Logros' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'auto', background: T.bg }}>
      {/* Stadium atmosphere */}
      <div className="stadium-glow" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <div style={{ width: '100%', padding: '16px 16px 8px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div className="text-gradient-gold" style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 24, textTransform: 'uppercase', letterSpacing: 2 }}>Compendio</div>
      </div>

      {/* Tab Bar - Horizontally scrollable */}
      <div style={{ display: 'flex', width: '100%', maxWidth: 440, position: 'relative', zIndex: 1, borderBottom: `1px solid ${T.border}`, overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {tabs.map(t => (
          <div key={t.k} onClick={() => setTab(t.k)} style={{
            flex: '0 0 auto', minWidth: 55, padding: '10px 6px 8px', textAlign: 'center', cursor: 'pointer',
            borderBottom: tab === t.k ? `2px solid ${T.gold}` : '2px solid transparent',
            transition: 'all 0.2s ease',
          }}>
            <div style={{ fontSize: 16, marginBottom: 2 }}>{t.l}</div>
            <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 10, color: tab === t.k ? T.gold : T.tx4, textTransform: 'uppercase', letterSpacing: 0.5, transition: 'color 0.2s' }}>{t.label}</div>
          </div>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 440, padding: 12, flex: 1, position: 'relative', zIndex: 1 }}>
        {tab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Stats Grid */}
            <div className="glass" style={{ borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { l: 'Runs', v: gs.totalRuns || 0, c: T.tx },
                  { l: 'Victorias', v: gs.totalWins || 0, c: T.win },
                  { l: 'Goles', v: gs.totalGoals || 0, c: T.info },
                  { l: 'Partidos', v: gs.totalMatches || 0, c: T.tx2 },
                  { l: 'Win Rate', v: ((gs.totalWins || 0) / Math.max(1, gs.totalMatches || 0) * 100).toFixed(1) + '%', c: T.win },
                  { l: 'Gol/Partido', v: ((gs.totalGoals || 0) / Math.max(1, gs.totalMatches || 0)).toFixed(1), c: T.info },
                  { l: 'Mejor liga', v: gs.bestLeagueName || '—', c: T.purple },
                  { l: 'Racha', v: (gs.bestStreak || 0) + '🔥', c: T.draw },
                  { l: 'Ascensión', v: (gs.ascensionLevel || 0) + '/7', c: T.gold },
                ].map((s, i) => (
                  <div key={i} className="glass-light" style={{ borderRadius: 8, padding: '10px 6px', textAlign: 'center' }}>
                    <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 20, color: s.c, lineHeight: 1.2 }}>{s.v}</div>
                    <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Scorers */}
            {topScorers.length > 0 && (
              <div className="glass" style={{ borderRadius: 12, padding: 12 }}>
                <div className="text-gradient-gold" style={{ fontFamily: T.fontHeading, fontSize: 12, textTransform: 'uppercase', marginBottom: 8, textAlign: 'center', letterSpacing: 1 }}>Goleadores Historicos</div>
                {topScorers.map(([name, goals], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 6px', fontFamily: T.fontBody, fontSize: 12, borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ color: i === 0 ? T.gold : T.tx }}>{i === 0 ? '👑 ' : `${i + 1}. `}{name}</span>
                    <span style={{ fontFamily: T.fontHeading, fontWeight: 700, color: i === 0 ? T.gold : T.tx2 }}>{goals}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Top Assisters */}
            {(() => {
              const topAssisters = Object.entries(gs.allTimeAssisters || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
              return topAssisters.length > 0 && (
                <div className="glass" style={{ borderRadius: 12, padding: 12 }}>
                  <div style={{ fontFamily: T.fontHeading, fontSize: 12, textTransform: 'uppercase', marginBottom: 8, textAlign: 'center', letterSpacing: 1, color: T.info }}>Asistidores Historicos</div>
                  {topAssisters.map(([name, assists], i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 6px', fontFamily: T.fontBody, fontSize: 12, borderBottom: `1px solid ${T.border}` }}>
                      <span style={{ color: i === 0 ? T.info : T.tx }}>{i === 0 ? '🎯 ' : `${i + 1}. `}{name}</span>
                      <span style={{ fontFamily: T.fontHeading, fontWeight: 700, color: i === 0 ? T.info : T.tx2 }}>{assists}</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Top Clean Sheets */}
            {(() => {
              const topClean = Object.entries(gs.allTimeCleanSheets || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
              return topClean.length > 0 && (
                <div className="glass" style={{ borderRadius: 12, padding: 12 }}>
                  <div style={{ fontFamily: T.fontHeading, fontSize: 12, textTransform: 'uppercase', marginBottom: 8, textAlign: 'center', letterSpacing: 1, color: T.win }}>Porteros Imbatidos</div>
                  {topClean.map(([name, sheets], i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 6px', fontFamily: T.fontBody, fontSize: 12, borderBottom: `1px solid ${T.border}` }}>
                      <span style={{ color: i === 0 ? T.win : T.tx }}>{i === 0 ? '🧤 ' : `${i + 1}. `}{name}</span>
                      <span style={{ fontFamily: T.fontHeading, fontWeight: 700, color: i === 0 ? T.win : T.tx2 }}>{sheets}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {tab === 'legacy' && (() => {
          const totalPts = calcLegacyPoints(gs);
          const spentPts = calcSpentLegacy(gs);
          const availPts = totalPts - spentPts;
          const branchNames = { scouting: '🔭 Scouting', cantera: '🌱 Cantera', sponsor: '💰 Sponsor', tactics: '📋 Táctica', charisma: '🗣 Carisma', maestria: '🎴 Maestría' };
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Points display */}
              <div className="card-gold" style={{ borderRadius: 12, padding: 14, textAlign: 'center' }}>
                <div style={{ fontFamily: T.fontHeading, fontSize: 11, color: T.gold, textTransform: 'uppercase', letterSpacing: 1.5 }}>Puntos de Legado</div>
                <div className="text-gradient-gold" style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 36, lineHeight: 1.2, marginTop: 4 }}>{availPts}</div>
                <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3, marginTop: 4 }}>Ganados: {totalPts} · Gastados: {spentPts}</div>
              </div>

              {/* Branch trees */}
              {LEGACY_BRANCHES.map(branch => {
                const nodes = Object.values(LEGACY_TREE).filter(n => n.branch === branch).sort((a, b) => a.tier - b.tier);
                return (
                  <div key={branch} className="glass" style={{ borderRadius: 12, padding: 12 }}>
                    <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 14, color: T.tx, marginBottom: 8, letterSpacing: 0.5 }}>{branchNames[branch] || branch}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {nodes.map((node, ni) => {
                        const owned = hasLegacy(gs, node.id);
                        const canBuy = canUnlockLegacy(gs, node.id);
                        return (
                          <div key={node.id}>
                            {/* Connector line between tiers */}
                            {ni > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'center', height: 18 }}>
                                <div style={{ width: 2, height: '100%', background: hasLegacy(gs, nodes[ni - 1].id) ? T.win : T.border, borderRadius: 1 }} />
                              </div>
                            )}
                            <div onClick={() => { if (canBuy) { unlockLegacy(node.id); SFX.play('reward'); Haptics.success(); } }} style={{
                              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                              background: owned ? `${T.win}12` : canBuy ? `${T.gold}0A` : T.bg2,
                              border: `1.5px solid ${owned ? T.win + '50' : canBuy ? T.gold + '50' : T.border}`,
                              borderRadius: 10, cursor: canBuy ? 'pointer' : 'default', opacity: owned || canBuy ? 1 : 0.35,
                              touchAction: 'manipulation', minHeight: 52,
                              boxShadow: owned ? `0 0 16px ${T.win}20` : canBuy ? T.glowGold : 'none',
                              transition: 'all 0.25s ease',
                            }}>
                              <div style={{ fontSize: 24, minWidth: 36, textAlign: 'center', filter: owned ? 'none' : 'grayscale(0.5)' }}>{node.i}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 13, color: owned ? T.win : canBuy ? T.gold : T.tx3 }}>{node.n}</div>
                                <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3, lineHeight: 1.3 }}>{node.d}</div>
                              </div>
                              <div style={{ textAlign: 'right', minWidth: 38 }}>
                                {owned ? <span style={{ color: T.win, fontFamily: T.fontHeading, fontSize: 16, fontWeight: 700 }}>✓</span>
                                  : <div style={{ background: canBuy ? `${T.gold}20` : 'transparent', borderRadius: 6, padding: '3px 8px' }}><span style={{ color: canBuy ? T.gold : T.tx4, fontFamily: T.fontHeading, fontSize: 12, fontWeight: 700 }}>{node.cost}pt</span></div>}
                              </div>
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

        {tab === 'cards' && (() => {
          const collection = getCollectionCards(gs);
          const masteryProgress = gs.curseMasteryProgress || {};
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Card Collection */}
              <div className="glass" style={{ borderRadius: 12, padding: 12 }}>
                <div style={{ fontFamily: T.fontHeading, fontSize: 13, color: T.purple, textTransform: 'uppercase', textAlign: 'center', marginBottom: 8, letterSpacing: 1 }}>
                  Coleccion: {collection.length}/{TACTICAL_CARDS.length}
                </div>
                {collection.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 16, color: T.tx3, fontSize: 12, fontFamily: T.fontBody }}>
                    Completa runs para desbloquear cartas.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {collection.map(card => {
                      const rarity = CARD_RARITIES[card.rarity];
                      return (
                        <div key={card.id} className="card-premium" style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px', borderRadius: 8 }}>
                          <span style={{ fontSize: 20 }}>{card.i}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: T.fontHeading, fontSize: 12, color: T.tx, fontWeight: 600 }}>{card.n}</div>
                            <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3, lineHeight: 1.3 }}>{card.d}</div>
                          </div>
                          <span style={{ fontSize: 9, color: rarity.color, fontFamily: T.fontHeading, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{rarity.n}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Curse Mastery Progress */}
              <div className="glass" style={{ borderRadius: 12, padding: 12 }}>
                <div style={{ fontFamily: T.fontHeading, fontSize: 13, color: T.lose, textTransform: 'uppercase', textAlign: 'center', marginBottom: 8, letterSpacing: 1 }}>
                  Maestria de Maldiciones
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {CURSES.map(curse => {
                    const progress = masteryProgress[curse.id] || 0;
                    const threshold = curse.masteryThreshold || 1;
                    const pct = Math.min(100, Math.floor((progress / threshold) * 100));
                    const mastered = pct >= 100;
                    return (
                      <div key={curse.id} style={{
                        padding: '8px 10px',
                        background: mastered ? `${T.gold}0C` : T.bg2,
                        borderRadius: 8,
                        border: `1px solid ${mastered ? T.gold + '40' : T.border}`,
                        boxShadow: mastered ? T.glowGold : 'none',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: mastered ? T.gold : T.lose, fontFamily: T.fontBody, fontWeight: 500 }}>
                            {curse.i} {curse.n}
                          </span>
                          <span style={{ fontSize: 10, color: mastered ? T.gold : T.tx3, fontFamily: T.fontHeading, fontWeight: 600 }}>
                            {mastered ? `→ ${curse.blessing?.n}` : `${pct}%`}
                          </span>
                        </div>
                        <div className="stat-bar" style={{ height: 4 }}>
                          <div className="stat-bar-fill" style={{ width: `${pct}%`, background: mastered ? T.gradientPrimary : T.lose }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {tab === 'fame' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(gs.hallOfFame || []).length === 0 ? (
              <div className="glass" style={{ textAlign: 'center', padding: 28, borderRadius: 12 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🌟</div>
                <div style={{ color: T.tx2, fontSize: 13, lineHeight: 1.6, fontFamily: T.fontBody }}>
                  Completa tu primer run e inmortaliza a un jugador para añadirlo al Hall of Fame.
                </div>
                <div style={{ fontSize: 11, color: T.tx4, marginTop: 10, fontFamily: T.fontBody }}>Los legendarios aparecerán en el mercado de futuras runs.</div>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: 6 }}>
                  <div className="text-gradient-gold" style={{ fontFamily: T.fontHeading, fontSize: 13, letterSpacing: 1 }}>{(gs.hallOfFame || []).length}/20 Legendarios</div>
                </div>
                {(gs.hallOfFame || []).slice().reverse().map((p, i) => (
                  <div key={i} className="card-gold" style={{
                    borderRadius: 12, padding: 14, display: 'flex', gap: 12, alignItems: 'center',
                  }}>
                    <div style={{ textAlign: 'center', minWidth: 44 }}>
                      <div style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 28, color: T.gold, textShadow: `0 0 12px ${T.gold}50` }}>{p.ovr}</div>
                      <div style={{ fontFamily: T.fontHeading, fontSize: 10, color: POS_COLORS[p.pos] || T.tx2, letterSpacing: 0.5, textTransform: 'uppercase' }}>{PN[p.pos] || p.pos}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 15, color: T.tx }}>{p.name}</div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <span style={{ fontFamily: T.fontHeading, fontSize: 11, color: T.tx3 }}>ATK {p.atk}</span>
                        <span style={{ fontFamily: T.fontHeading, fontSize: 11, color: T.tx3 }}>DEF {p.def}</span>
                        <span style={{ fontFamily: T.fontHeading, fontSize: 11, color: T.tx3 }}>VEL {p.spd}</span>
                      </div>
                      {p.trait && <div style={{ fontSize: 10, color: T.purple, marginTop: 3, fontFamily: T.fontBody }}>✦ {p.trait}</div>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3 }}>Run #{p.run}</div>
                      <div style={{ fontFamily: T.fontHeading, fontSize: 11, color: T.gold, fontWeight: 600 }}>{p.league}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {tab === 'achieve' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
              <div className="text-gradient-gold" style={{ fontFamily: T.fontHeading, fontSize: 13, letterSpacing: 1 }}>
                {(gs.achievements || []).length}/{ACHIEVEMENTS.length} Completados
              </div>
            </div>
            {ACHIEVEMENTS.map(a => {
              const done = (gs.achievements || []).includes(a.id);
              return (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  background: done ? `${T.win}0A` : T.bg1,
                  borderRadius: 10,
                  border: `1px solid ${done ? T.win + '30' : T.border}`,
                  boxShadow: done ? `0 0 12px ${T.win}10` : 'none',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ minWidth: 32, textAlign: 'center', opacity: done ? 1 : 0.3 }}><AchIcon id={a.id} size={28} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 13, color: done ? T.tx : T.tx3 }}>{a.n}</div>
                    <div style={{ fontFamily: T.fontBody, fontSize: 11, color: done ? T.tx2 : T.tx4, lineHeight: 1.3 }}>{a.d}</div>
                  </div>
                  {done && <div style={{ fontFamily: T.fontHeading, fontSize: 14, color: T.win, fontWeight: 700 }}>✓</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Back button */}
      <div style={{ padding: '12px 16px 16px', width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <button onClick={() => go('title')} className="fw-btn fw-btn-outline" style={{
          fontFamily: T.fontHeading, fontWeight: 600, fontSize: 13, padding: '12px 28px',
          textTransform: 'uppercase', width: '100%', letterSpacing: 1,
        }}>Volver</button>
      </div>
    </div>
  );
}
