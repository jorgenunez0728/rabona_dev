import { useState } from 'react';
import { SFX } from '@/game/audio';
import { T } from '@/game/data';
import { MANAGER_ARCHETYPES, isArchetypeUnlocked, hasArchetypeSynergy } from '@/game/data/archetypes.js';

export default function ArchetypeScreen({ globalStats, onSelect, selectedCoachId }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 420, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 16, color: T.purple, textTransform: 'uppercase', letterSpacing: 1 }}>Filosofía de Juego</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3, marginTop: 2 }}>Define cómo será tu run</div>
      </div>
      {MANAGER_ARCHETYPES.map((a, i) => {
        const unlocked = isArchetypeUnlocked(globalStats, a.id);
        const isOpen = expanded === a.id;
        const hasSynergy = selectedCoachId && hasArchetypeSynergy(a.id, selectedCoachId);
        return (
          <div key={a.id} className={`fw-anim-${Math.min(i + 1, 5)}`} style={{
            borderRadius: 8, overflow: 'hidden',
            border: `1px solid ${isOpen ? T.purple + '50' : !unlocked ? T.tx3 + '20' : T.border}`,
            background: isOpen ? 'linear-gradient(145deg,#1a1030,#2d1a4a)' : !unlocked ? 'rgba(20,20,30,0.5)' : 'linear-gradient(145deg,#141e3a,#1a2744)',
          }}>
            <div
              onClick={() => { if (unlocked) { SFX.play('click'); setExpanded(isOpen ? null : a.id); } }}
              style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', cursor: unlocked ? 'pointer' : 'not-allowed', opacity: unlocked ? 1 : 0.45 }}
            >
              <div style={{ fontSize: 28, minWidth: 36, textAlign: 'center' }}>{unlocked ? a.i : '🔒'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 14, color: unlocked ? T.tx : T.tx3, textTransform: 'uppercase' }}>
                  {a.n} {hasSynergy && unlocked && <span style={{ color: T.gold, fontSize: 11 }}>✦</span>}
                </div>
                <div style={{ fontFamily: T.fontBody, fontSize: 11, color: unlocked ? T.purple : T.tx3 }}>
                  {unlocked ? a.d : `🔒 ${a.unlockDesc}`}
                </div>
              </div>
              <div style={{ fontFamily: T.fontHeading, fontSize: 12, color: T.tx3 }}>{isOpen ? '▲' : '▼'}</div>
            </div>
            {isOpen && unlocked && (
              <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${T.purple}15` }}>
                <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx2, fontStyle: 'italic', lineHeight: 1.4, margin: '8px 0' }}>
                  "{a.story}"
                </div>
                <div style={{ background: `${T.purple}10`, border: `1px solid ${T.purple}20`, borderRadius: 6, padding: '6px 10px', marginBottom: 8 }}>
                  <div style={{ fontFamily: T.fontHeading, fontSize: 10, color: T.purple, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                    {a.i} {a.mechanic.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx, lineHeight: 1.3 }}>{a.mechanicDesc}</div>
                </div>
                {/* Card slots preview */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                  {Object.entries(a.cardSlots).map(([cat, count]) => count > 0 && (
                    <div key={cat} style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 10, fontFamily: T.fontBody,
                      background: cat === 'offensive' ? 'rgba(244,67,54,0.1)' : cat === 'defensive' ? 'rgba(33,150,243,0.1)' : cat === 'economic' ? 'rgba(255,214,0,0.1)' : 'rgba(156,39,176,0.1)',
                      color: cat === 'offensive' ? '#f44336' : cat === 'defensive' ? '#2196f3' : cat === 'economic' ? '#ffd600' : '#9c27b0',
                      border: `1px solid ${cat === 'offensive' ? '#f4433620' : cat === 'defensive' ? '#2196f320' : cat === 'economic' ? '#ffd60020' : '#9c27b020'}`,
                    }}>
                      {count}x {cat === 'offensive' ? 'Ofensiva' : cat === 'defensive' ? 'Defensiva' : cat === 'economic' ? 'Económica' : 'Caótica'}
                    </div>
                  ))}
                </div>
                {/* Start mods */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
                  {a.startMods.atkBonus > 0 && <span style={{ fontSize: 10, color: T.win, fontFamily: T.fontBody }}>+{a.startMods.atkBonus} ATK</span>}
                  {a.startMods.defPenalty < 0 && <span style={{ fontSize: 10, color: T.loss, fontFamily: T.fontBody }}>{a.startMods.defPenalty} DEF</span>}
                  {a.startMods.extraCoins > 0 && <span style={{ fontSize: 10, color: T.gold, fontFamily: T.fontBody }}>+{a.startMods.extraCoins} 💰</span>}
                  {a.startMods.extraCoins < 0 && <span style={{ fontSize: 10, color: T.loss, fontFamily: T.fontBody }}>{a.startMods.extraCoins} 💰</span>}
                  {a.startMods.chemBonus > 0 && <span style={{ fontSize: 10, color: T.info, fontFamily: T.fontBody }}>+{a.startMods.chemBonus} Quím</span>}
                  {a.startMods.chemBonus < 0 && <span style={{ fontSize: 10, color: T.loss, fontFamily: T.fontBody }}>{a.startMods.chemBonus} Quím</span>}
                </div>
                <button
                  className="fw-btn fw-btn-primary"
                  onClick={() => { SFX.play('reward'); onSelect(a); }}
                  style={{ width: '100%', fontSize: 13 }}
                >
                  Elegir {a.n}
                </button>
              </div>
            )}
          </div>
        );
      })}
      {/* Skip option */}
      <button
        onClick={() => { SFX.play('click'); onSelect(null); }}
        style={{
          fontFamily: T.fontHeading, fontWeight: 600, fontSize: 11, padding: '8px 16px',
          border: `1px solid ${T.tx3}`, background: 'transparent', color: T.tx3,
          borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', marginTop: 4,
        }}
      >
        Sin filosofía (clásico)
      </button>
    </div>
  );
}
