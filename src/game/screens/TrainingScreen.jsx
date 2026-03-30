import { useState, useEffect } from "react";
import { SFX } from "@/game/audio";
import { T, POS_COLORS, PN, TRAINING_OPTIONS, calcOvr, rnd } from "@/game/data";
import useGameStore from "@/game/store";
import { Haptics } from "@/game/haptics";
import { SectionHeader, EmptyState } from '@/game/components/ui';

export default function TrainingScreen() {
  const { game, setGame, go, markVisited } = useGameStore();

  useEffect(() => { markVisited('training'); }, []);

  const trained = game.trainedIds || [];
  const slotsLeft = 2 - trained.length;
  const reserves = game.roster.filter(p => p.role === 'rs' && (p.injuredFor || 0) <= 0 && !trained.includes(p.id)).sort((a, b) => calcOvr(b) - calcOvr(a));
  const [selected, setSelected] = useState(null);
  const [training, setTraining] = useState(null);
  const [result, setResult] = useState(null);

  function doTrain() {
    if (!selected || !training) return;
    const opt = TRAINING_OPTIONS.find(t => t.id === training);
    if (!opt || opt.cost > game.coins) { setResult('Sin monedas suficientes'); return; }
    const playerExists = game.roster.some(p => p.id === selected);
    if (!playerExists) { setResult('Jugador no encontrado'); setSelected(null); setTraining(null); return; }
    SFX.play('reward');
    let resultText = '';
    setGame(g => {
      const roster = g.roster.map(p => {
        if (p.id !== selected) return p;
        const p2 = { ...p };
        if (opt.stat === 'rest') { p2.fatigue = Math.max(0, (p2.fatigue || 0) - 30); resultText = `${p2.name} descansó y recuperó energía.`; }
        else if (opt.stat === 'all') {
          const gain = rnd(opt.range[0], opt.range[1]);
          p2.atk += gain; p2.def += gain; p2.spd += gain;
          p2.fatigue = Math.min(100, (p2.fatigue || 0) + (opt.fatigueCost || 0));
          resultText = `${p2.name}: +${gain} ATK/DEF/VEL`;
        } else {
          const gain = rnd(opt.range[0], opt.range[1]);
          const lucky = Math.random() < 0.15;
          const finalGain = lucky ? gain + 2 : gain;
          p2[opt.stat] = (p2[opt.stat] || 1) + finalGain;
          const statName = opt.stat === 'atk' ? 'ATK' : opt.stat === 'def' ? 'DEF' : opt.stat === 'sav' ? 'PAR' : 'VEL';
          resultText = `${lucky ? 'Sesion brillante! ' : ''}${p2.name}: +${finalGain} ${statName}`;
        }
        return p2;
      });
      return { ...g, roster, coins: g.coins - opt.cost, trainedIds: [...(g.trainedIds || []), selected] };
    });
    setSelected(null); setTraining(null);
    setTimeout(() => setResult(resultText), 50);
  }

  const statBadge = (label, value, color) => (
    <span style={{
      fontFamily: T.fontBody, fontWeight: 600, fontSize: 10,
      color, background: `${color}1A`,
      padding: '2px 6px', borderRadius: 4
    }}>{label} {value}</span>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'auto', background: T.bg }}>
      {/* Header */}
      <div className="fw-anim-1" style={{ width: '100%', padding: '18px 14px 14px', textAlign: 'center', borderBottom: `1px solid ${T.border}`, marginBottom: 8 }}>
        <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 22, color: T.tx, textTransform: 'uppercase', letterSpacing: 2 }}>Entrenamiento</div>
        <div style={{
          fontFamily: T.fontBody, fontSize: 12, marginTop: 6,
          color: slotsLeft > 0 ? T.win : T.lose,
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '4px 12px', borderRadius: 12,
          background: slotsLeft > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${slotsLeft > 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`
        }}>
          {slotsLeft > 0 ? `${slotsLeft} sesion(es) disponible(s)` : 'Sin sesiones hoy'}
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 420, padding: '0 14px 14px' }}>
        {/* Result notification */}
        {result && (
          <div className="glass" style={{
            borderRadius: 10,
            padding: 14,
            marginBottom: 10,
            textAlign: 'center',
            border: `1px solid rgba(34,197,94,0.25)`,
            background: 'rgba(34,197,94,0.08)'
          }}>
            <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx, fontWeight: 500 }}>{result}</div>
            <button className="fw-btn fw-btn-outline" onClick={() => setResult(null)} style={{
              fontFamily: T.fontHeading, fontSize: 11,
              padding: '5px 18px',
              marginTop: 8
            }}>OK</button>
          </div>
        )}

        {/* No sessions state */}
        {slotsLeft <= 0 && !result ? (
          <div className="glass" style={{ borderRadius: 10, padding: 20, textAlign: 'center' }}>
            <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx3 }}>Juega el siguiente partido para mas sesiones.</div>
          </div>
        ) : reserves.length === 0 && !result ? (
          <div className="glass" style={{ borderRadius: 10, padding: 20, textAlign: 'center' }}>
            <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx3 }}>No hay reservas disponibles.</div>
          </div>
        ) : (slotsLeft > 0 && !result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

            {/* Player selector */}
            {!selected && reserves.map((p, idx) => (
              <div key={p.id} onClick={() => { Haptics.light(); setSelected(p.id); }} className={`card-premium anim-stagger-${Math.min(idx + 1, 6)}`} style={{
                background: T.bg1,
                border: `1px solid ${T.glassBorder}`,
                borderRadius: T.r3,
                padding: 10,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                position: 'relative',
                overflow: 'hidden',
                transition: `border-color ${T.transQuick}`,
              }}>
                {/* Position accent */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: POS_COLORS[p.pos], borderRadius: '10px 0 0 10px' }} />

                {/* Position badge */}
                <div style={{
                  fontFamily: T.fontHeading, fontWeight: 700, fontSize: 11,
                  color: '#fff',
                  background: POS_COLORS[p.pos],
                  padding: '3px 8px',
                  borderRadius: T.r1,
                  minWidth: 32,
                  textAlign: 'center',
                  textTransform: 'uppercase'
                }}>{PN[p.pos]}</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 14, color: T.tx, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  {/* Stat bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                    {[
                      { v: p.atk, l: 'ATK', c: T.lose },
                      { v: p.def, l: 'DEF', c: T.info },
                      { v: p.spd, l: 'VEL', c: T.win },
                      ...(p.pos === 'GK' ? [{ v: p.sav, l: 'PAR', c: T.goldLight }] : []),
                    ].map(({ v, l, c }) => (
                      <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontFamily: T.fontHeading, fontSize: 9, fontWeight: 600, color: c, minWidth: 22 }}>{l}</span>
                        <div className="stat-bar stat-bar-animated" style={{ flex: 1, height: 3 }}>
                          <div className="stat-bar-fill" style={{ width: `${Math.min(100, v)}%`, background: c }} />
                        </div>
                        <span style={{ fontFamily: T.fontHeading, fontSize: 9, fontWeight: 700, color: T.tx, minWidth: 16, textAlign: 'right' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* OVR */}
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 22, color: T.gold, lineHeight: 1 }}>{calcOvr(p)}</div>
                  <div style={{ fontFamily: T.fontBody, fontSize: 9, color: T.tx3, textTransform: 'uppercase', letterSpacing: 0.5 }}>OVR</div>
                </div>
              </div>
            ))}

            {/* Training options */}
            {selected && !training && (() => {
              const p = game.roster.find(x => x.id === selected);
              return (
                <>
                  {/* Selected player header */}
                  <div className="glass" style={{
                    borderRadius: 10, padding: 12, textAlign: 'center',
                    border: `1px solid rgba(240,192,64,0.2)`,
                    background: 'rgba(240,192,64,0.06)'
                  }}>
                    <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx3, textTransform: 'uppercase', letterSpacing: 1 }}>Entrenando</div>
                    <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 18, color: T.gold, marginTop: 2 }}>{p?.name}</div>
                  </div>

                  {/* Training option cards */}
                  {TRAINING_OPTIONS.map((opt, idx) => {
                    const canAfford = game.coins >= opt.cost;
                    return (
                      <div key={opt.id} onClick={() => { if (canAfford) { Haptics.light(); setTraining(opt.id); } }} className={`card-premium anim-stagger-${Math.min(idx + 1, 6)}`} style={{
                        background: canAfford ? T.bg1 : T.bg2,
                        border: `1px solid ${canAfford ? T.glassBorder : T.border}`,
                        borderRadius: T.r3,
                        padding: 14,
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        opacity: canAfford ? 1 : 0.4,
                        transition: `border-color ${T.transQuick}, transform ${T.transQuick}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 15, color: T.gold }}>{opt.name}</div>
                          {/* Cost badge */}
                          <div style={{
                            fontFamily: T.fontHeading, fontWeight: 600, fontSize: 11,
                            padding: '3px 10px', borderRadius: 12,
                            background: opt.cost > 0 ? 'rgba(240,192,64,0.12)' : 'rgba(34,197,94,0.12)',
                            color: opt.cost > 0 ? T.gold : T.win,
                            border: `1px solid ${opt.cost > 0 ? 'rgba(240,192,64,0.2)' : 'rgba(34,197,94,0.2)'}`
                          }}>
                            {opt.cost > 0 ? `${opt.cost}` : 'Gratis'}
                          </div>
                        </div>
                        <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx2, marginTop: 4 }}>{opt.desc}</div>
                      </div>
                    );
                  })}

                  <button className="fw-btn fw-btn-outline" onClick={() => setSelected(null)} style={{
                    fontFamily: T.fontHeading, fontSize: 11,
                    padding: '6px 16px',
                    alignSelf: 'center'
                  }}>Volver</button>
                </>
              );
            })()}

            {/* Confirm dialog */}
            {selected && training && (() => {
              const p = game.roster.find(x => x.id === selected);
              const opt = TRAINING_OPTIONS.find(t => t.id === training);
              return (
                <div className="glass" style={{
                  borderRadius: 12, padding: 20, textAlign: 'center',
                  border: `1px solid rgba(240,192,64,0.2)`,
                  background: 'rgba(240,192,64,0.05)',
                  boxShadow: T.glowGold
                }}>
                  <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 18, color: T.tx, textTransform: 'uppercase', letterSpacing: 1 }}>Confirmar</div>
                  <div className="divider-subtle" style={{ margin: '10px auto', width: 60 }} />
                  <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 15, color: T.gold, marginTop: 8 }}>{p?.name}</div>
                  <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.tx2, marginTop: 4 }}>{opt?.name}</div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
                    <button className="fw-btn fw-btn-green" onClick={doTrain} style={{
                      fontFamily: T.fontHeading, fontWeight: 700, fontSize: 14,
                      padding: '10px 28px',
                      letterSpacing: 0.5
                    }}>Entrenar</button>
                    <button className="fw-btn fw-btn-outline" onClick={() => { setTraining(null); setSelected(null); }} style={{
                      fontFamily: T.fontHeading, fontSize: 12,
                      padding: '10px 20px'
                    }}>Cancelar</button>
                  </div>
                </div>
              );
            })()}
          </div>
        ))}
      </div>

      {/* Back button */}
      <div style={{ padding: '8px 14px 16px' }}>
        <button className="fw-btn fw-btn-outline" onClick={() => go('table')} style={{
          fontFamily: T.fontHeading, fontWeight: 600, fontSize: 12,
          padding: '8px 20px',
          textTransform: 'uppercase',
          letterSpacing: 1
        }}>
          Volver a la Tabla
        </button>
      </div>
    </div>
  );
}
