import { useState } from 'react';
import { SFX } from '@/game/audio';
import { COACHES, ASCENSION_MODS, T, STARTING_RELIC_PAIRS, COACH_ABILITIES } from '@/game/data';
import { RelicIcon } from '@/game/data/chibiAssets';
import { CoachPortrait } from '@/game/components';
import { getAvailableMutators, MAX_ACTIVE_MUTATORS } from '@/game/data/mutators.js';
import { hasArchetypeSynergy, getArchetypeCardSlots } from '@/game/data/archetypes.js';
import useGameStore from '@/game/store';
import ArchetypeScreen from './ArchetypeScreen';
import CardLoadoutScreen from './CardLoadoutScreen';

// Steps: 1=coach, 2=archetype, 3=cards, 4=relic, 5=ascension+mutators → start
const STEPS = [
  { id: 'coach', label: 'Entrenador' },
  { id: 'archetype', label: 'Filosofia' },
  { id: 'cards', label: 'Cartas' },
  { id: 'relic', label: 'Reliquia' },
  { id: 'ascension', label: 'Dificultad' },
];

export default function CoachScreen() {
  const { globalStats, isCoachUnlocked, confirmStart } = useGameStore();
  const maxAsc = globalStats.ascensionLevel || 0;

  // Wizard state
  const [step, setStep] = useState(0);
  const [chosenArchetype, setChosenArchetype] = useState(null);
  const [chosenCoach, setChosenCoach] = useState(null);
  const [chosenCards, setChosenCards] = useState([]);
  const [chosenRelic, setChosenRelic] = useState(undefined); // undefined = not chosen yet
  const [selectedAsc, setSelectedAsc] = useState(maxAsc);
  const [activeMutators, setActiveMutators] = useState([]);
  const [selectedCoachOpen, setSelectedCoachOpen] = useState(null);
  const [startingRelicPair, setStartingRelicPair] = useState(null);

  const hasCards = (globalStats.cardCollection || []).length > 0;
  const archetypeSlots = chosenArchetype ? getArchetypeCardSlots(chosenArchetype.id) : { offensive: 1, defensive: 1, economic: 1, chaotic: 1 };

  function goNext() {
    SFX.play('click');
    const nextStep = step + 1;
    // Skip cards step (2) if no cards in collection
    if (nextStep === 2 && !hasCards) {
      setStep(3); // skip cards, go to relic
    } else {
      setStep(nextStep);
    }
  }

  function goBack() {
    SFX.play('click');
    const prevStep = step - 1;
    // Skip cards step (2) when going back if no cards
    if (prevStep === 2 && !hasCards) {
      setStep(1); // skip back over cards to archetype
    } else {
      setStep(prevStep);
    }
  }

  function handleCoachSelect(coach) {
    setChosenCoach(coach);
    goNext();
  }

  function handleArchetypeSelect(arch) {
    setChosenArchetype(arch);
    // Generate relic pair for step 3
    const pair = STARTING_RELIC_PAIRS[Math.floor(Math.random() * STARTING_RELIC_PAIRS.length)];
    setStartingRelicPair(pair);
    goNext();
  }

  function handleCardConfirm(loadout) {
    setChosenCards(loadout);
    goNext();
  }

  function handleRelicSelect(relic) {
    setChosenRelic(relic);
    goNext();
  }

  function handleFinalStart() {
    SFX.play('reward');
    confirmStart(chosenCoach, chosenRelic || null, selectedAsc, {
      archetype: chosenArchetype?.id || null,
      cardLoadout: chosenCards,
      activeMutators,
    });
  }

  function toggleMutator(id) {
    SFX.play('click');
    if (activeMutators.includes(id)) {
      setActiveMutators(activeMutators.filter(m => m !== id));
    } else if (activeMutators.length < MAX_ACTIVE_MUTATORS) {
      setActiveMutators([...activeMutators, id]);
    }
  }

  return (
    <div className="stadium-glow" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, position: 'relative' }}>
      {/* Step indicator — connected dots with gold progress line */}
      <div className="fw-anim-1" style={{ padding: '16px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
        {STEPS.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Dot */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 48 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: T.fontHeading, fontWeight: 700, fontSize: 12,
                background: i < step ? T.gradientPrimary : i === step ? `${T.gold}20` : T.bg2,
                color: i < step ? T.bg : i === step ? T.gold : T.tx4,
                border: `2px solid ${i <= step ? T.gold : T.border}`,
                boxShadow: i === step ? `${T.glowGold}, 0 0 0 4px rgba(240,192,64,0.08)` : 'none',
                transition: `all ${T.transBase}`,
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{
                fontFamily: T.fontBody, fontSize: 9, fontWeight: 600, letterSpacing: 0.3,
                color: i === step ? T.gold : i < step ? T.win : T.tx4,
                textTransform: 'uppercase',
              }}>{s.label}</span>
            </div>
            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div style={{
                width: 24, height: 2, marginBottom: 16,
                background: i < step ? T.gradientPrimary : T.border,
                borderRadius: 1, transition: 'background 0.3s ease',
              }} />
            )}
          </div>
        ))}
      </div>

      <div className="divider-subtle" style={{ margin: '0 16px' }} />

      <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px 14px' }}>
        {/* STEP 0: COACH */}
        {step === 0 && (
          <div>
            <div className="anim-stagger-1" style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 20, color: T.tx, textTransform: 'uppercase', letterSpacing: 1.5 }}>Elige Entrenador</div>
              {chosenArchetype && (
                <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.purple, marginTop: 4 }}>
                  {chosenArchetype.i} {chosenArchetype.n}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420, margin: '0 auto' }}>
              {COACHES.map((c, ci) => {
                const unlocked = isCoachUnlocked(c);
                const isOpen = selectedCoachOpen === c.id;
                const synergy = chosenArchetype && hasArchetypeSynergy(chosenArchetype.id, c.id);
                return (
                  <div key={c.id} className={`anim-stagger-${Math.min(ci + 1, 6)}`} style={{
                    borderRadius: 10, overflow: 'hidden',
                    border: `1px solid ${isOpen ? T.gold + '50' : !unlocked ? T.tx4 + '15' : synergy ? T.gold + '30' : T.glassBorder}`,
                    background: isOpen ? 'linear-gradient(145deg,#2A2008,#3A2D10)' : !unlocked ? T.bg1 : T.gradientDark,
                    boxShadow: isOpen ? T.glowGold : T.shadow,
                    transition: 'all 0.2s ease',
                  }}>
                    <div onClick={() => { if (unlocked) setSelectedCoachOpen(isOpen ? null : c.id); }} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 16px', cursor: unlocked ? 'pointer' : 'not-allowed', opacity: unlocked ? 1 : 0.4 }}>
                      <div style={{ minWidth: 38 }}>{unlocked ? <CoachPortrait id={c.id} size={38} /> : <span style={{ fontSize: 28 }}>🔒</span>}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 15, color: unlocked ? T.tx : T.tx3, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {c.n} {synergy && unlocked && <span style={{ color: T.gold, fontSize: 11, fontWeight: 600 }}>✦ Sinergia</span>}
                        </div>
                        <div style={{ fontFamily: T.fontBody, fontSize: 12, color: unlocked ? T.accent : T.tx4 }}>{unlocked ? `✦ ${c.a}` : `🔒 ${c.unlockReq}`}</div>
                      </div>
                      <div style={{ fontFamily: T.fontHeading, fontSize: 14, color: T.tx3, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▼</div>
                    </div>
                    {isOpen && unlocked && (() => {
                      const ab = COACH_ABILITIES[c.id];
                      return (
                        <div style={{ padding: '0 16px 16px' }}>
                          <div className="divider-gold" style={{ marginBottom: 10 }} />
                          <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.tx2, fontStyle: 'italic', lineHeight: 1.5, margin: '8px 0' }}>"{c.story}"</div>
                          {ab && <div className="glass" style={{ borderRadius: 8, padding: '8px 12px', marginBottom: 10, borderColor: T.purple + '25' }}>
                            <div style={{ fontFamily: T.fontHeading, fontSize: 10, color: T.purple, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3, fontWeight: 700 }}>Habilidad Especial</div>
                            <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx, lineHeight: 1.4 }}>{ab.desc}</div>
                          </div>}
                          <button className="fw-btn fw-btn-primary" onClick={() => handleCoachSelect(c)} style={{ width: '100%', fontSize: 14, borderRadius: 8, padding: '12px' }}>Elegir {c.n}</button>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 1: ARCHETYPE */}
        {step === 1 && (
          <div>
            <ArchetypeScreen
              globalStats={globalStats}
              onSelect={handleArchetypeSelect}
              selectedCoachId={chosenCoach?.id}
            />
            <button className="fw-btn fw-btn-outline" onClick={goBack} style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 12, padding: '10px 20px', border: `1px solid ${T.tx4}`, background: 'transparent', color: T.tx3, borderRadius: 8, cursor: 'pointer', textTransform: 'uppercase', marginTop: 12, display: 'block', margin: '12px auto 0' }}>
              ← Volver
            </button>
          </div>
        )}

        {/* STEP 2: CARDS */}
        {step === 2 && (
          <div>
            <CardLoadoutScreen
              globalStats={globalStats}
              archetypeSlots={archetypeSlots}
              onConfirm={handleCardConfirm}
            />
            <button className="fw-btn fw-btn-outline" onClick={goBack} style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 12, padding: '10px 20px', border: `1px solid ${T.tx4}`, background: 'transparent', color: T.tx3, borderRadius: 8, cursor: 'pointer', textTransform: 'uppercase', marginTop: 12, display: 'block', margin: '12px auto 0' }}>
              ← Volver
            </button>
          </div>
        )}

        {/* STEP 3: RELIC */}
        {step === 3 && startingRelicPair && (
          <div style={{ maxWidth: 380, margin: '0 auto' }}>
            <div className="anim-stagger-1" style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 22, textTransform: 'uppercase', letterSpacing: 1 }}>
                <span className="text-gradient-gold">Reliquia Inicial</span>
              </div>
              <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.tx3, marginTop: 6 }}>Elige tu ventaja para este run</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {startingRelicPair.map((relic, i) => relic ? (
                <div key={i} className={`card-gold anim-stagger-${i + 2}`} onClick={() => handleRelicSelect(relic)} style={{ padding: '16px 18px', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
                  <div style={{ minWidth: 44, textAlign: 'center' }}><RelicIcon id={relic.id} size={40} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 17, color: T.gold, textTransform: 'uppercase', letterSpacing: 0.5 }}>{relic.n}</div>
                    <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.tx2, lineHeight: 1.4, marginTop: 3 }}>{relic.d}</div>
                  </div>
                </div>
              ) : null)}
              <button className="fw-btn fw-btn-glass anim-stagger-4" onClick={() => handleRelicSelect(null)} style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 13, padding: '12px', border: `1px solid ${T.tx4}`, background: T.glass, color: T.tx2, borderRadius: 10, cursor: 'pointer', marginTop: 4 }}>Sin reliquia →</button>
            </div>
            <button className="fw-btn fw-btn-outline" onClick={goBack} style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 12, padding: '10px 20px', border: `1px solid ${T.tx4}`, background: 'transparent', color: T.tx3, borderRadius: 8, cursor: 'pointer', textTransform: 'uppercase', marginTop: 16, display: 'block', margin: '16px auto 0' }}>
              ← Volver
            </button>
          </div>
        )}

        {/* STEP 4: ASCENSION + MUTATORS */}
        {step === 4 && (
          <div style={{ maxWidth: 420, margin: '0 auto' }}>
            {/* Summary of choices */}
            <div className="glass anim-stagger-1" style={{ borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12, fontFamily: T.fontBody, color: T.tx2 }}>
                {chosenArchetype && <span>{chosenArchetype.i} {chosenArchetype.n}</span>}
                {chosenCoach && <span>· {chosenCoach.i} {chosenCoach.n}</span>}
                {chosenCards.length > 0 && <span>· 🎴 {chosenCards.length} carta{chosenCards.length > 1 ? 's' : ''}</span>}
                {chosenRelic && <span>· 📿 {chosenRelic.n}</span>}
              </div>
            </div>

            {/* Ascension */}
            {maxAsc > 0 && (
              <div className="anim-stagger-2" style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 16, textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 }}>
                  <span className="text-gradient-gold">⬆ Ascension</span>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {ASCENSION_MODS.filter(a => a.lv <= maxAsc).map(a => (
                    <div key={a.lv} onClick={() => { SFX.play('click'); setSelectedAsc(a.lv); }} style={{
                      padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                      background: selectedAsc === a.lv ? `${T.gold}20` : T.bg2,
                      border: `1.5px solid ${selectedAsc === a.lv ? T.gold : T.border}`,
                      fontFamily: T.fontHeading, fontWeight: 700, fontSize: 13,
                      color: selectedAsc === a.lv ? T.gold : T.tx3,
                      boxShadow: selectedAsc === a.lv ? T.glowGold : 'none',
                      transition: 'all 0.2s ease',
                    }}>
                      {a.lv}{a.lv === maxAsc && <span style={{ fontSize: 10, color: T.win, marginLeft: 4, fontWeight: 700 }}>MAX</span>}
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx2, marginTop: 6, textAlign: 'center' }}>{ASCENSION_MODS[selectedAsc]?.d}</div>
              </div>
            )}

            {/* Mutators */}
            {selectedAsc > 0 && (() => {
              const available = getAvailableMutators(selectedAsc);
              if (available.length === 0) return null;
              return (
                <div className="anim-stagger-3" style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 15, color: T.lose, textTransform: 'uppercase', textAlign: 'center', marginBottom: 6 }}>
                    Mutadores ({activeMutators.length}/{MAX_ACTIVE_MUTATORS})
                  </div>
                  <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3, textAlign: 'center', marginBottom: 8 }}>
                    Opcionales. Mas dificil = mas puntos de legado.
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {available.map(m => {
                      const isActive = activeMutators.includes(m.id);
                      const canToggle = isActive || activeMutators.length < MAX_ACTIVE_MUTATORS;
                      return (
                        <div key={m.id} className="glass" onClick={() => canToggle && toggleMutator(m.id)} style={{
                          display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px',
                          borderRadius: 10,
                          borderColor: isActive ? T.lose + '60' : T.glassBorder,
                          background: isActive ? `rgba(239,68,68,0.08)` : undefined,
                          cursor: canToggle ? 'pointer' : 'not-allowed',
                          opacity: canToggle ? 1 : 0.35,
                          boxShadow: isActive ? '0 0 16px rgba(239,68,68,0.1)' : T.shadow,
                          transition: 'all 0.2s ease',
                        }}>
                          <div style={{ fontSize: 24, minWidth: 30, textAlign: 'center' }}>{m.i}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 13, color: T.tx }}>{m.n}</div>
                            <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3, lineHeight: 1.4 }}>{m.d}</div>
                          </div>
                          <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 12, color: T.gold }}>+{m.legacyBonus} LP</div>
                          {isActive && <div style={{ color: T.lose, fontSize: 16, fontWeight: 700 }}>✓</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Start button */}
            <button className="fw-btn fw-btn-primary anim-stagger-4" onClick={handleFinalStart} style={{
              width: '100%', fontSize: 16, padding: '16px', borderRadius: 10,
              fontFamily: T.fontHeading, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
              background: T.gradientPrimary, color: T.bg, border: 'none', cursor: 'pointer',
              boxShadow: T.glowGold,
            }}>
              ⚽ Comenzar{selectedAsc > 0 ? ` · Asc ${selectedAsc}` : ''}{activeMutators.length > 0 ? ` · ${activeMutators.length} mutador${activeMutators.length > 1 ? 'es' : ''}` : ''}
            </button>

            <button className="fw-btn fw-btn-outline" onClick={goBack} style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 12, padding: '10px 20px', border: `1px solid ${T.tx4}`, background: 'transparent', color: T.tx3, borderRadius: 8, cursor: 'pointer', textTransform: 'uppercase', marginTop: 12, display: 'block', margin: '12px auto 0' }}>
              ← Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
