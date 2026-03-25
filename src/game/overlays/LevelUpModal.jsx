import { SFX } from '@/game/audio';
import { T } from '@/game/data';
import useGameStore from '@/game/store';

export default function LevelUpModal() {
  const { pendingLevelUp, setPendingLevelUp, setGame } = useGameStore();
  if (!pendingLevelUp) return null;

  return (
    <div className="glass-heavy" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.92)', zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16, backdropFilter: 'blur(8px)' }}>
      <div className="fw-bounceIn" style={{ background: T.gradientDark, borderRadius: 14, maxWidth: 360, width: '100%', border: `1px solid ${T.gold}30`, padding: 24, boxShadow: T.glowGold }}>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div className="text-gradient-gold" style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 }}>⬆ Subida de Nivel</div>
          <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx, marginTop: 6 }}>{pendingLevelUp.player.name}</div>
          <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3, marginTop: 2 }}>Nivel {pendingLevelUp.player.lv} → {pendingLevelUp.player.lv + 1} · Elige una mejora</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pendingLevelUp.choices.map((choice, i) => (
            <button key={i} className="glass" onClick={() => {
              SFX.play('reward');
              setGame(g => ({
                ...g,
                roster: g.roster.map(p => {
                  if (p.id !== pendingLevelUp.player.id) return p;
                  const newXpNext = p.xpNext || 20;
                  return { ...choice.apply({ ...p }), lv: p.lv + 1, xp: Math.max(0, (p.xp || 0) - newXpNext), xpNext: (p.lv + 1) * 10 + 20 };
                })
              }));
              setPendingLevelUp(null);
            }} style={{ padding: '16px', background: `${T.gold}06`, border: `1.5px solid ${T.gold}25`, borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease', boxShadow: 'none' }}>
              <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 15, color: T.gold }}>{choice.n}</div>
              <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx, marginTop: 4, lineHeight: 1.3 }}>{choice.d}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
