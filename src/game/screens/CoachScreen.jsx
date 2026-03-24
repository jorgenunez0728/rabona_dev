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
  { id: 'archetype', label: 'Filosofía' },
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: `linear-gradient(180deg,${T.bg},#0f1730)`, position: 'relative' }}>
      {/* Step indicator */}
      <div style={{ padding: '10px 16px 4px', display: 'flex', justifyContent: 'center', gap: 4 }}>
        {STEPS.map((s, i) => (
          <div key={s.id} style={{
            padding: '3px 8px', borderRadius: 10, fontSize: 9, fontFamily: T.fontBody,
            background: i === step ? `${T.gold}20` : i < step ? `${T.win}15` : 'rgba(255,255,255,0.03)',
            color: i === step ? T.gold : i < step ? T.win : T.tx3,
            border: `1px solid ${i === step ? T.gold + '40' : 'transparent'}`,
          }}>
            {i < step ? '✓' : i + 1}. {s.label}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 14px 14px' }}>
        {/* ═══ STEP 0: COACH ═══ */}
        {step === 0 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div className="fw-anim-1" style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 18, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>Elige Entrenador</div>
              {chosenArchetype && (
                <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.purple, marginTop: 2 }}>
                  {chosenArchetype.i} {chosenArchetype.n}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 420, margin: '0 auto' }}>
              {COACHES.map((c, ci) => {
                const unlocked = isCoachUnlocked(c);
                const isOpen = selectedCoachOpen === c.id;
                const synergy = chosenArchetype && hasArchetypeSynergy(chosenArchetype.id, c.id);
                return (
                  <div key={c.id} className={`fw-anim-${Math.min(ci + 1, 5)}`} style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${isOpen ? T.gold + '40' : !unlocked ? T.tx3 + '20' : synergy ? T.gold + '30' : T.border}`, background: isOpen ? 'linear-gradient(145deg,#2a2510,#3a3215)' : !unlocked ? 'rgba(20,20,30,0.5)' : 'linear-gradient(145deg,#141e3a,#1a2744)' }}>
                    <div onClick={() => { if (unlocked) setSelectedCoachOpen(isOpen ? null : c.id); }} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', cursor: unlocked ? 'pointer' : 'not-allowed', opacity: unlocked ? 1 : 0.45 }}>
                      <div style={{ minWidth: 34 }}>{unlocked ? <CoachPortrait id={c.id} size={34} /> : <span style={{ fontSize: 28 }}>🔒</span>}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 14, color: unlocked ? T.tx : T.tx3, textTransform: 'uppercase' }}>
                          {c.n} {synergy && unlocked && <span style={{ color: T.gold, fontSize: 11 }}>✦ Sinergia</span>}
                        </div>
                        <div style={{ fontFamily: T.fontBody, fontSize: 11, color: unlocked ? T.win : T.tx3 }}>{unlocked ? `✦ ${c.a}` : `🔒 ${c.unlockReq}`}</div>
                      </div>
                      <div style={{ fontFamily: T.fontHeading, fontSize: 12, color: T.tx3 }}>{isOpen ? '▲' : '▼'}</div>
                    </div>
                    {isOpen && unlocked && (() => {
                      const ab = COACH_ABILITIES[c.id];
                      return (
                        <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${T.gold}15` }}>
                          <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx2, fontStyle: 'italic', lineHeight: 1.4, margin: '8px 0' }}>"{c.story}"</div>
                          {ab && <div style={{ background: `${T.purple}10`, border: `1px solid ${T.purple}20`, borderRadius: 6, padding: '6px 10px', marginBottom: 8 }}>
                            <div style={{ fontFamily: T.fontHeading, fontSize: 10, color: T.purple, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Habilidad Especial</div>
                            <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx, lineHeight: 1.3 }}>{ab.desc}</div>
                          </div>}
                          <button className="fw-btn fw-btn-primary" onClick={() => handleCoachSelect(c)} style={{ width: '100%', fontSize: 13 }}>Elegir {c.n}</button>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ STEP 1: ARCHETYPE ═══ */}
        {step === 1 && (
          <div>
            <ArchetypeScreen
              globalStats={globalStats}
              onSelect={handleArchetypeSelect}
              selectedCoachId={chosenCoach?.id}
            />
            <button onClick={goBack} style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 11, padding: '8px 16px', border: `1px solid ${T.tx3}`, background: 'transparent', color: T.tx3, borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', marginTop: 8, display: 'block', margin: '8px auto 0' }}>
              ← Volver
            </button>
          </div>
        )}

        {/* ═══ STEP 2: CARDS ═══ */}
        {step === 2 && (
          <div>
            <CardLoadoutScreen
              globalStats={globalStats}
              archetypeSlots={archetypeSlots}
              onConfirm={handleCardConfirm}
            />
            <button onClick={goBack} style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 11, padding: '8px 16px', border: `1px solid ${T.tx3}`, background: 'transparent', color: T.tx3, borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', marginTop: 8, display: 'block', margin: '8px auto 0' }}>
              ← Volver
            </button>
          </div>
        )}

        {/* ═══ STEP 3: RELIC ═══ */}
        {step === 3 && startingRelicPair && (
          <div style={{ maxWidth: 380, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 20, color: T.purple, textTransform: 'uppercase' }}>📿 Reliquia Inicial</div>
              <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.tx3, marginTop: 4 }}>Elige tu ventaja para este run</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {startingRelicPair.map((relic, i) => relic ? (
                <div key={i} onClick={() => handleRelicSelect(relic)} style={{ background: `${T.gold}08`, border: `1.5px solid ${T.gold}30`, borderRadius: 10, padding: '14px 16px', cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ minWidth: 40, textAlign: 'center' }}><RelicIcon id={relic.id} size={36} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 16, color: T.gold, textTransform: 'uppercase' }}>{relic.n}</div>
                    <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.tx, lineHeight: 1.3, marginTop: 2 }}>{relic.d}</div>
                  </div>
                </div>
              ) : null)}
              <button onClick={() => handleRelicSelect(null)} style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 13, padding: '10px', border: `1px solid ${T.tx3}`, background: 'transparent', color: T.tx2, borderRadius: 8, cursor: 'pointer', marginTop: 4 }}>Sin reliquia →</button>
            </div>
            <button onClick={goBack} style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 11, padding: '8px 16px', border: `1px solid ${T.tx3}`, background: 'transparent', color: T.tx3, borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', marginTop: 12, display: 'block', margin: '12px auto 0' }}>
              ← Volver
            </button>
          </div>
        )}

        {/* ═══ STEP 4: ASCENSION + MUTATORS ═══ */}
        {step === 4 && (
          <div style={{ maxWidth: 420, margin: '0 auto' }}>
            {/* Summary of choices */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11, fontFamily: T.fontBody, color: T.tx2 }}>
                {chosenArchetype && <span>{chosenArchetype.i} {chosenArchetype.n}</span>}
                {chosenCoach && <span>· {chosenCoach.i} {chosenCoach.n}</span>}
                {chosenCards.length > 0 && <span>· 🎴 {chosenCards.length} carta{chosenCards.length > 1 ? 's' : ''}</span>}
                {chosenRelic && <span>· 📿 {chosenRelic.n}</span>}
              </div>
            </div>

            {/* Ascension */}
            {maxAsc > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 14, color: T.gold, textTransform: 'uppercase', textAlign: 'center', marginBottom: 6 }}>⬆ Ascensión</div>
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {ASCENSION_MODS.filter(a => a.lv <= maxAsc).map(a => (
                    <div key={a.lv} onClick={() => { SFX.play('click'); setSelectedAsc(a.lv); }} style={{ padding: '4px 10px', borderRadius: 4, cursor: 'pointer', background: selectedAsc === a.lv ? `${T.gold}20` : T.bg2, border: `1px solid ${selectedAsc === a.lv ? T.gold : T.border}`, fontFamily: T.fontHeading, fontSize: 11, color: selectedAsc === a.lv ? T.gold : T.tx3 }}>
                      {a.lv}{a.lv === maxAsc && <span style={{ fontSize: 11, color: T.win, marginLeft: 2 }}>MAX</span>}
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx2, marginTop: 4, textAlign: 'center' }}>{ASCENSION_MODS[selectedAsc]?.d}</div>
              </div>
            )}

            {/* Mutators */}
            {selectedAsc > 0 && (() => {
              const available = getAvailableMutators(selectedAsc);
              if (available.length === 0) return null;
              return (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 14, color: '#ef5350', textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 }}>
                    Mutadores ({activeMutators.length}/{MAX_ACTIVE_MUTATORS})
                  </div>
                  <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3, textAlign: 'center', marginBottom: 6 }}>
                    Opcionales. Más difícil = más puntos de legado.
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {available.map(m => {
                      const isActive = activeMutators.includes(m.id);
                      const canToggle = isActive || activeMutators.length < MAX_ACTIVE_MUTATORS;
                      return (
                        <div key={m.id} onClick={() => canToggle && toggleMutator(m.id)} style={{
                          display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px',
                          background: isActive ? 'rgba(239,83,80,0.08)' : 'rgba(255,255,255,0.02)',
                          border: `1.5px solid ${isActive ? '#ef5350' : T.border}`,
                          borderRadius: 6, cursor: canToggle ? 'pointer' : 'not-allowed',
                          opacity: canToggle ? 1 : 0.4,
                        }}>
                          <div style={{ fontSize: 22, minWidth: 28, textAlign: 'center' }}>{m.i}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 12, color: T.tx }}>{m.n}</div>
                            <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3, lineHeight: 1.3 }}>{m.d}</div>
                          </div>
                          <div style={{ fontFamily: T.fontHeading, fontSize: 11, color: T.gold }}>+{m.legacyBonus} LP</div>
                          {isActive && <div style={{ color: '#ef5350', fontSize: 14, fontWeight: 700 }}>✓</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Start button */}
            <button className="fw-btn fw-btn-primary" onClick={handleFinalStart} style={{ width: '100%', fontSize: 15, padding: '14px' }}>
              ⚽ Comenzar{selectedAsc > 0 ? ` · Asc ${selectedAsc}` : ''}{activeMutators.length > 0 ? ` · ${activeMutators.length} mutador${activeMutators.length > 1 ? 'es' : ''}` : ''}
            </button>

            <button onClick={goBack} style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 11, padding: '8px 16px', border: `1px solid ${T.tx3}`, background: 'transparent', color: T.tx3, borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', marginTop: 8, display: 'block', margin: '8px auto 0' }}>
              ← Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
