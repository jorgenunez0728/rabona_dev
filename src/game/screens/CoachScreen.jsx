import { useState } from 'react';
import { SFX } from '@/game/audio';
import { COACHES, ASCENSION_MODS, T, STARTING_RELIC_PAIRS, COACH_ABILITIES } from '@/game/data';
import { RelicIcon } from '@/game/data/chibiAssets';
import { CoachPortrait } from '@/game/components';
import useGameStore from '@/game/store';

export default function CoachScreen() {
  const { globalStats, isCoachUnlocked, confirmStart } = useGameStore();
  const maxAsc = globalStats.ascensionLevel || 0;
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedAsc, setSelectedAsc] = useState(maxAsc);
  const [pendingCoach, setPendingCoach] = useState(null);
  const [startingRelicPair, setStartingRelicPair] = useState(null);

  function startRun(coach) {
    const pair = STARTING_RELIC_PAIRS[Math.floor(Math.random() * STARTING_RELIC_PAIRS.length)];
    setPendingCoach(coach);
    setStartingRelicPair(pair);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: `linear-gradient(180deg,${T.bg},#0f1730)`, position: 'relative' }}>
      <div style={{ padding: '14px 16px 8px', textAlign: 'center' }}>
        <div className="fw-anim-1" style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 20, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>Elige Entrenador</div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '0 14px 14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 420, margin: '0 auto' }}>
          {COACHES.map((c, ci) => {
            const unlocked = isCoachUnlocked(c);
            const isOpen = selectedCoach === c.id;
            return (
              <div key={c.id} className={`fw-anim-${Math.min(ci + 1, 5)}`} style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${isOpen ? T.gold + '40' : !unlocked ? T.tx3 + '20' : T.border}`, background: isOpen ? 'linear-gradient(145deg,#2a2510,#3a3215)' : !unlocked ? 'rgba(20,20,30,0.5)' : 'linear-gradient(145deg,#141e3a,#1a2744)' }}>
                <div onClick={() => { if (unlocked) setSelectedCoach(isOpen ? null : c.id); }} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', cursor: unlocked ? 'pointer' : 'not-allowed', opacity: unlocked ? 1 : 0.45 }}>
                  <div style={{ minWidth: 34 }}>{unlocked ? <CoachPortrait id={c.id} size={34} /> : <span style={{ fontSize: 28 }}>🔒</span>}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, color: unlocked ? T.tx : T.tx3, textTransform: 'uppercase' }}>{c.n}</div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: unlocked ? T.win : T.tx3 }}>{unlocked ? `✦ ${c.a}` : `🔒 ${c.unlockReq}`}</div>
                  </div>
                  <div style={{ fontFamily: "'Oswald'", fontSize: 12, color: T.tx3 }}>{isOpen ? '▲' : '▼'}</div>
                </div>
                {isOpen && unlocked && (() => {
                  const ab = COACH_ABILITIES[c.id];
                  return (
                  <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${T.gold}15` }}>
                    <div style={{ fontFamily: "'Barlow'", fontSize: 12, color: T.tx2, fontStyle: 'italic', lineHeight: 1.4, margin: '8px 0' }}>"{c.story}"</div>
                    {ab && <div style={{ background: `${T.purple}10`, border: `1px solid ${T.purple}20`, borderRadius: 6, padding: '6px 10px', marginBottom: 8 }}>
                      <div style={{ fontFamily: "'Oswald'", fontSize: 10, color: T.purple, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Habilidad Especial</div>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: T.tx, lineHeight: 1.3 }}>{ab.desc}</div>
                    </div>}
                    {maxAsc > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: T.gold, textTransform: 'uppercase', marginBottom: 4 }}>⬆ Dificultad</div>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          {ASCENSION_MODS.filter(a => a.lv <= maxAsc).map(a => (
                            <div key={a.lv} onClick={() => setSelectedAsc(a.lv)} style={{ padding: '4px 10px', borderRadius: 4, cursor: 'pointer', background: selectedAsc === a.lv ? `${T.gold}20` : T.bg2, border: `1px solid ${selectedAsc === a.lv ? T.gold : T.border}`, fontFamily: "'Oswald'", fontSize: 11, color: selectedAsc === a.lv ? T.gold : T.tx3 }}>{a.lv}{a.lv === maxAsc && <span style={{ fontSize: 11, color: T.win, marginLeft: 2 }}>MAX</span>}</div>
                          ))}
                        </div>
                        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx2, marginTop: 4 }}>{ASCENSION_MODS[selectedAsc]?.d}</div>
                      </div>
                    )}
                    <button className="fw-btn fw-btn-primary" onClick={() => startRun(c)} style={{ width: '100%', fontSize: 13 }}>⚽ Comenzar{selectedAsc > 0 ? ` · Asc ${selectedAsc}` : ''}</button>
                  </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      </div>
      {startingRelicPair && pendingCoach && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.93)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <div style={{ background: 'linear-gradient(135deg,#1a1030,#2d1a4a)', borderRadius: 14, maxWidth: 380, width: '100%', border: `1px solid ${T.purple}40`, padding: 22 }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 22, color: T.purple, textTransform: 'uppercase' }}>📿 Reliquia Inicial</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 14, color: T.tx3, marginTop: 4 }}>Elige tu ventaja para este run</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {startingRelicPair.map((relic, i) => relic ? (
                <div key={i} onClick={() => { SFX.play('reward'); const c = pendingCoach; setStartingRelicPair(null); setPendingCoach(null); confirmStart(c, relic, selectedAsc); }} style={{ background: `${T.gold}08`, border: `1.5px solid ${T.gold}30`, borderRadius: 10, padding: '14px 16px', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ minWidth: 40, textAlign: 'center' }}><RelicIcon id={relic.id} size={36} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 16, color: T.gold, textTransform: 'uppercase' }}>{relic.n}</div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, color: T.tx, lineHeight: 1.3, marginTop: 2 }}>{relic.d}</div>
                  </div>
                </div>
              ) : null)}
              <button onClick={() => { SFX.play('click'); const c = pendingCoach; setStartingRelicPair(null); setPendingCoach(null); confirmStart(c, null, selectedAsc); }} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, padding: '10px', border: `1px solid ${T.tx3}`, background: 'transparent', color: T.tx2, borderRadius: 8, cursor: 'pointer', marginTop: 4 }}>Sin reliquia →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
