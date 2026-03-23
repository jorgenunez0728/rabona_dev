import { SFX } from '@/game/audio';
import { T } from '@/game/data';
import useGameStore from '@/game/store';

export default function LevelUpModal() {
  const { pendingLevelUp, setPendingLevelUp, setGame } = useGameStore();
  if (!pendingLevelUp) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.92)', zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16, backdropFilter: 'blur(6px)' }}>
      <div style={{ background: 'linear-gradient(135deg,#141e3a,#1a2744)', borderRadius: 12, maxWidth: 340, width: '100%', border: `1px solid ${T.gold}30`, padding: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 22, color: T.gold, textTransform: 'uppercase' }}>⬆ Subida de Nivel</div>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 14, color: T.tx, marginTop: 4 }}>{pendingLevelUp.player.name}</div>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx3 }}>Nivel {pendingLevelUp.player.lv} → {pendingLevelUp.player.lv + 1} · Elige una mejora</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pendingLevelUp.choices.map((choice, i) => (
            <button key={i} onClick={() => {
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
            }} style={{ padding: '14px', background: `${T.gold}08`, border: `1.5px solid ${T.gold}30`, borderRadius: 8, cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 15, color: T.gold }}>{choice.n}</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: T.tx, marginTop: 2 }}>{choice.d}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
