import { SFX } from '@/game/audio';
import { T } from '@/game/data';
import { RelicIcon } from '@/game/data/chibiAssets';
import useGameStore from '@/game/store';

export default function RelicDraftOverlay() {
  const { pendingRelicDraft, setPendingRelicDraft, setGame } = useGameStore();
  if (!pendingRelicDraft) return null;

  const tierGradients = {
    rare: { bg: `linear-gradient(145deg, rgba(240,192,64,0.08), rgba(212,160,23,0.04))`, border: T.gold + '40', glow: T.glowGold },
    uncommon: { bg: `linear-gradient(145deg, rgba(59,130,246,0.08), rgba(37,99,235,0.04))`, border: T.info + '40', glow: T.glow },
    common: { bg: `linear-gradient(145deg, rgba(148,163,184,0.06), rgba(100,116,139,0.03))`, border: T.tx3 + '30', glow: 'none' },
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.93)', zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16, backdropFilter: 'blur(10px)' }}>
      <div className="fw-scaleIn" style={{ background: T.gradientDark, borderRadius: 14, maxWidth: 380, width: '100%', border: `1px solid ${T.purple}30`, padding: 24, boxShadow: `0 0 30px rgba(139,92,246,0.15)` }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 20, color: T.purple, textTransform: 'uppercase', letterSpacing: 1 }}>📿 Elige Reliquia</div>
          <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx3, marginTop: 4 }}>Cada run define tu colección única</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(pendingRelicDraft.options || []).map((relic, i) => {
            const rarityColor = relic.rarity === 'rare' ? T.gold : relic.rarity === 'uncommon' ? T.info : T.tx2;
            const tier = tierGradients[relic.rarity] || tierGradients.common;
            return (
              <div key={i} onClick={() => {
                SFX.play('reward');
                setGame(g => ({ ...g, relics: [...(g.relics || []), relic.id] }));
                setPendingRelicDraft(null);
              }} className="card-premium" style={{ background: tier.bg, border: `1.5px solid ${tier.border}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', boxShadow: tier.glow, transition: 'all 0.2s ease' }}>
                <div style={{ minWidth: 40, textAlign: 'center' }}><RelicIcon id={relic.id} size={32} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 14, color: rarityColor, textTransform: 'uppercase' }}>{relic.n}</div>
                    <span style={{ fontFamily: T.fontHeading, fontSize: 10, color: rarityColor, background: `${rarityColor}15`, padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{relic.rarity}</span>
                  </div>
                  <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx, lineHeight: 1.3 }}>{relic.d}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
