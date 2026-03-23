import { useState } from "react";
import { SFX } from "@/game/audio";
import { T, POS_COLORS, PN, TRAINING_OPTIONS, calcOvr, rnd } from "@/game/data";
import useGameStore from "@/game/store";

export default function TrainingScreen() {
  const { game, setGame, go } = useGameStore();

  const trained = game.trainedIds || [];
  const slotsLeft = 2 - trained.length;
  const reserves = game.roster.filter(p => p.role === 'rs' && (p.injuredFor || 0) <= 0 && !trained.includes(p.id)).sort((a, b) => calcOvr(b) - calcOvr(a));
  const [selected, setSelected] = useState(null);
  const [training, setTraining] = useState(null);
  const [result, setResult] = useState(null);

  function doTrain() {
    if (!selected || !training) return;
    const opt = TRAINING_OPTIONS.find(t => t.id === training);
    if (!opt || opt.cost > game.coins) { setResult('❌ Sin monedas'); return; }
    const playerExists = game.roster.some(p => p.id === selected);
    if (!playerExists) { setResult('❌ Jugador no encontrado'); setSelected(null); setTraining(null); return; }
    SFX.play('reward');
    let resultText = '';
    setGame(g => {
      const roster = g.roster.map(p => {
        if (p.id !== selected) return p;
        const p2 = { ...p };
        if (opt.stat === 'rest') { p2.fatigue = Math.max(0, (p2.fatigue || 0) - 30); resultText = `😴 ${p2.name} descansó.`; }
        else if (opt.stat === 'all') {
          const gain = rnd(opt.range[0], opt.range[1]);
          p2.atk += gain; p2.def += gain; p2.spd += gain;
          p2.fatigue = Math.min(100, (p2.fatigue || 0) + (opt.fatigueCost || 0));
          resultText = `🔥 ${p2.name}: +${gain} ATK/DEF/VEL`;
        } else {
          const gain = rnd(opt.range[0], opt.range[1]);
          const lucky = Math.random() < 0.15;
          const finalGain = lucky ? gain + 2 : gain;
          p2[opt.stat] = (p2[opt.stat] || 1) + finalGain;
          const statName = opt.stat === 'atk' ? 'ATK' : opt.stat === 'def' ? 'DEF' : opt.stat === 'sav' ? 'PAR' : 'VEL';
          resultText = `${lucky ? '🌟 ¡Sesión brillante!' : '✅'} ${p2.name}: +${finalGain} ${statName}`;
        }
        return p2;
      });
      return { ...g, roster, coins: g.coins - opt.cost, trainedIds: [...(g.trainedIds || []), selected] };
    });
    setSelected(null); setTraining(null);
    setTimeout(() => setResult(resultText), 50);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'auto', background: T.bg, padding: 12 }}>
      <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 24, color: '#fff', textTransform: 'uppercase' }}>🏋️ Entrenamiento</div>
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: slotsLeft > 0 ? T.win : T.lose, marginBottom: 8 }}>
        {slotsLeft > 0 ? `${slotsLeft} sesión(es) disponible(s)` : '❌ Sin sesiones hoy'}
      </div>
      {result && (
        <div style={{ background: `${T.win}0F`, border: `1px solid ${T.win}30`, borderRadius: 8, padding: 12, marginBottom: 8, width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 14, color: T.tx }}>{result}</div>
          <button onClick={() => setResult(null)} style={{ fontFamily: "'Oswald'", fontSize: 11, padding: '5px 16px', border: `1px solid ${T.tx3}`, background: 'transparent', color: T.tx2, borderRadius: 4, cursor: 'pointer', marginTop: 6 }}>OK</button>
        </div>
      )}
      {slotsLeft <= 0 && !result ? (
        <div style={{ textAlign: 'center', padding: 16, color: T.tx2, fontSize: 14 }}>Juega el siguiente partido para más sesiones.</div>
      ) : reserves.length === 0 && !result ? (
        <div style={{ textAlign: 'center', padding: 16, color: T.tx2, fontSize: 14 }}>No hay reservas disponibles.</div>
      ) : (slotsLeft > 0 && !result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', maxWidth: 400 }}>
          {!selected && reserves.map(p => (
            <div key={p.id} onClick={() => setSelected(p.id)} style={{ background: T.bg1, border: `1px solid ${T.border}`, borderLeft: `4px solid ${POS_COLORS[p.pos]}`, borderRadius: 6, padding: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 11, color: POS_COLORS[p.pos], minWidth: 28, textAlign: 'center' }}>{PN[p.pos]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 14, color: T.tx }}>{p.name}</div>
              </div>
              <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 20, color: T.gold }}>{calcOvr(p)}</div>
            </div>
          ))}
          {selected && !training && (() => {
            const p = game.roster.find(x => x.id === selected);
            return (
              <>
                <div style={{ background: T.bg1, borderRadius: 8, padding: 10, border: `1px solid ${T.border}`, textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, color: T.tx }}>Entrenando: <span style={{ color: T.gold }}>{p?.name}</span></div>
                </div>
                {TRAINING_OPTIONS.map(opt => {
                  const canAfford = game.coins >= opt.cost;
                  return (
                    <div key={opt.id} onClick={() => canAfford && setTraining(opt.id)} style={{ background: canAfford ? T.bg1 : 'rgba(30,30,30,0.5)', border: `1px solid ${T.border}`, borderRadius: 6, padding: 12, cursor: canAfford ? 'pointer' : 'not-allowed', opacity: canAfford ? 1 : 0.4 }}>
                      <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, color: T.gold }}>{opt.name}</div>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: T.tx }}>{opt.desc}</div>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx2, marginTop: 2 }}>{opt.cost > 0 ? `💰 ${opt.cost}` : 'Gratis'}</div>
                    </div>
                  );
                })}
                <button onClick={() => setSelected(null)} style={{ fontFamily: "'Oswald'", fontSize: 11, padding: '6px 14px', border: `1px solid ${T.tx3}`, background: 'transparent', color: T.tx2, borderRadius: 4, cursor: 'pointer', alignSelf: 'center' }}>← Volver</button>
              </>
            );
          })()}
          {selected && training && (() => {
            const p = game.roster.find(x => x.id === selected);
            const opt = TRAINING_OPTIONS.find(t => t.id === training);
            return (
              <div style={{ background: T.bg1, borderRadius: 8, padding: 16, border: `1px solid ${T.gold}25`, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 16, color: T.tx }}>¿Confirmar?</div>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 14, color: T.gold, marginTop: 4 }}>{p?.name} → {opt?.name}</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
                  <button onClick={doTrain} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, padding: '10px 28px', border: 'none', background: `linear-gradient(135deg,${T.accent},#00e676)`, color: T.bg, borderRadius: 6, cursor: 'pointer' }}>✅ Entrenar</button>
                  <button onClick={() => { setTraining(null); setSelected(null); }} style={{ fontFamily: "'Oswald'", fontSize: 12, padding: '10px 20px', border: `1px solid ${T.tx3}`, background: 'transparent', color: T.tx2, borderRadius: 6, cursor: 'pointer' }}>Cancelar</button>
                </div>
              </div>
            );
          })()}
        </div>
      ))}
      <button onClick={() => go('table')} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 12, padding: '8px 16px', border: `1.5px solid ${T.tx3}`, background: 'transparent', color: T.tx, borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', marginTop: 10 }}>Volver a la Tabla</button>
    </div>
  );
}
