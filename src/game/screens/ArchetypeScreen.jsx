import { useState } from 'react';
import { SFX } from '@/game/audio';
import { T } from '@/game/data';
import { MANAGER_ARCHETYPES, isArchetypeUnlocked, hasArchetypeSynergy } from '@/game/data/archetypes.js';

export default function ArchetypeScreen({ globalStats, onSelect, selectedCoachId }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 6 }}>
        <div style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 18, color: T.purple, textTransform: 'uppercase', letterSpacing: 1 }}>Filosofía de Juego</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx3, marginTop: 2 }}>Define cómo será tu run</div>
      </div>
      {MANAGER_ARCHETYPES.map((a, i) => {
        const unlocked = isArchetypeUnlocked(globalStats, a.id);
        const isOpen = expanded === a.id;
        const hasSynergy = selectedCoachId && hasArchetypeSynergy(a.id, selectedCoachId);
        return (
          <div key={a.id} className={`anim-stagger-${Math.min(i + 1, 5)}`} style={{
            borderRadius: 10, overflow: 'hidden',
            border: `1px solid ${isOpen ? T.gold + '50' : !unlocked ? T.tx4 + '20' : T.glassBorder}`,
            background: isOpen ? T.glass : !unlocked ? 'rgba(20,20,30,0.5)' : T.gradientDark,
            boxShadow: isOpen ? T.glowGold : T.shadow,
            transition: 'all 0.3s ease',
          }}>
            <div
              onClick={() => { if (unlocked) { SFX.play('click'); setExpanded(isOpen ? null : a.id); } }}
              style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '14px 16px', cursor: unlocked ? 'pointer' : 'not-allowed', opacity: unlocked ? 1 : 0.45 }}
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
              <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${T.glassBorder}` }}>
                <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx2, fontStyle: 'italic', lineHeight: 1.4, margin: '10px 0' }}>
                  "{a.story}"
                </div>
                <div className="glass" style={{ borderRadius: 8, padding: '8px 12px', marginBottom: 10, border: `1px solid ${T.purple}25` }}>
                  <div style={{ fontFamily: T.fontHeading, fontSize: 10, color: T.purple, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                    {a.i} {a.mechanic.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx, lineHeight: 1.3 }}>{a.mechanicDesc}</div>
                </div>
                {/* Card slots preview */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
                  {Object.entries(a.cardSlots).map(([cat, count]) => count > 0 && (
                    <div key={cat} style={{
                      padding: '3px 10px', borderRadius: 12, fontSize: 10, fontFamily: T.fontBody,
                      background: cat === 'offensive' ? 'rgba(239,68,68,0.1)' : cat === 'defensive' ? 'rgba(59,130,246,0.1)' : cat === 'economic' ? 'rgba(240,192,64,0.1)' : 'rgba(139,92,246,0.1)',
                      color: cat === 'offensive' ? T.lose : cat === 'defensive' ? T.info : cat === 'economic' ? T.gold : T.purple,
                      border: `1px solid ${cat === 'offensive' ? T.lose + '20' : cat === 'defensive' ? T.info + '20' : cat === 'economic' ? T.gold + '20' : T.purple + '20'}`,
                    }}>
                      {count}x {cat === 'offensive' ? 'Ofensiva' : cat === 'defensive' ? 'Defensiva' : cat === 'economic' ? 'Económica' : 'Caótica'}
                    </div>
                  ))}
                </div>
                {/* Start mods */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                  {a.startMods.atkBonus > 0 && <span style={{ fontSize: 10, color: T.win, fontFamily: T.fontBody }}>+{a.startMods.atkBonus} ATK</span>}
                  {a.startMods.defPenalty < 0 && <span style={{ fontSize: 10, color: T.lose, fontFamily: T.fontBody }}>{a.startMods.defPenalty} DEF</span>}
                  {a.startMods.extraCoins > 0 && <span style={{ fontSize: 10, color: T.gold, fontFamily: T.fontBody }}>+{a.startMods.extraCoins} 💰</span>}
                  {a.startMods.extraCoins < 0 && <span style={{ fontSize: 10, color: T.lose, fontFamily: T.fontBody }}>{a.startMods.extraCoins} 💰</span>}
                  {a.startMods.chemBonus > 0 && <span style={{ fontSize: 10, color: T.info, fontFamily: T.fontBody }}>+{a.startMods.chemBonus} Quím</span>}
                  {a.startMods.chemBonus < 0 && <span style={{ fontSize: 10, color: T.lose, fontFamily: T.fontBody }}>{a.startMods.chemBonus} Quím</span>}
                </div>
                <button
                  className="fw-btn fw-btn-primary"
                  onClick={() => { SFX.play('reward'); onSelect(a); }}
                  style={{ width: '100%', fontSize: 13, background: T.gradientPrimary, color: T.bg, boxShadow: T.glowGold }}
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
        className="fw-btn fw-btn-outline"
        onClick={() => { SFX.play('click'); onSelect(null); }}
        style={{
          fontFamily: T.fontHeading, fontWeight: 600, fontSize: 11, padding: '10px 16px',
          border: `1px solid ${T.tx4}`, background: 'transparent', color: T.tx3,
          borderRadius: 8, cursor: 'pointer', textTransform: 'uppercase', marginTop: 4,
        }}
      >
        Sin filosofía (clásico)
      </button>
    </div>
  );
}
