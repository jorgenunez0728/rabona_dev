import { SFX } from '@/game/audio';
import { T } from '@/game/data';
import useGameStore from '@/game/store';

export default function RelicDraftOverlay() {
  const { pendingRelicDraft, setPendingRelicDraft, setGame } = useGameStore();
  if (!pendingRelicDraft) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.93)', zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16, backdropFilter: 'blur(8px)' }}>
      <div style={{ background: 'linear-gradient(135deg,#1a1030,#2d1a4a)', borderRadius: 14, maxWidth: 380, width: '100%', border: `1px solid ${T.purple}40`, padding: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 24, color: T.purple, textTransform: 'uppercase' }}>📿 Elige Reliquia</div>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: T.tx3, marginTop: 2 }}>Cada run define tu colección única</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(pendingRelicDraft.options || []).map((relic, i) => {
            const rarityColor = relic.rarity === 'rare' ? T.gold : relic.rarity === 'uncommon' ? T.info : T.tx2;
            return (
              <div key={i} onClick={() => {
                SFX.play('reward');
                setGame(g => ({ ...g, relics: [...(g.relics || []), relic.id] }));
                setPendingRelicDraft(null);
              }} style={{ background: `${rarityColor}08`, border: `1.5px solid ${rarityColor}30`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 28, minWidth: 36, textAlign: 'center' }}>{relic.i}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
                    <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 14, color: rarityColor, textTransform: 'uppercase' }}>{relic.n}</div>
                    <span style={{ fontFamily: "'Oswald'", fontSize: 8, color: rarityColor, background: `${rarityColor}15`, padding: '1px 5px', borderRadius: 3, textTransform: 'uppercase' }}>{relic.rarity}</span>
                  </div>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: T.tx, lineHeight: 1.3 }}>{relic.d}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
