import { useState, useEffect, useRef } from "react";
import { SFX } from "@/game/audio";
import { T, PN, CAREER_TEAMS, RIVAL_NAMES, FN, LN, pick, CAREER_CAST_UNLOCKABLE, CAREER_LEGACY_TREE, SIGNATURE_MOMENTS } from "@/game/data";
import { CareerBars, RelationshipBar, TraitBadge, MomentCard, CareerLegacyNode } from "@/game/components";
import useGameStore from "@/game/store";

const GoldBtn = ({ onClick, children, disabled }) => (
  <button onClick={disabled ? undefined : onClick} className={`fw-btn ${disabled ? '' : 'fw-btn-primary'}`} style={{
    width: '100%', fontFamily: T.fontHeading, fontWeight: 700, fontSize: 14,
    padding: '12px 28px', borderRadius: T.r2, letterSpacing: 1,
    background: disabled ? T.bg3 : undefined, color: disabled ? T.tx4 : undefined,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    boxShadow: disabled ? 'none' : '0 4px 16px rgba(240,192,64,0.25)',
  }}>{children}</button>
);

function AutoPlayBanner() {
  const autoPlay = useGameStore(s => s.debugAutoPlay);
  const toggle = useGameStore(s => s.debugToggleAutoPlay);
  if (!autoPlay) return null;
  return (
    <div onClick={toggle} style={{
      position: 'absolute', top: 4, right: 4, zIndex: 999,
      background: 'rgba(255,68,68,0.9)', color: '#fff', padding: '2px 8px',
      borderRadius: 4, fontSize: 10, fontFamily: "'Oswald'", cursor: 'pointer',
      letterSpacing: 1, textTransform: 'uppercase',
    }}>AUTO-PLAY (tap to stop)</div>
  );
}

export function CareerCreateScreen({ setCareer, setCareerScreen, go, initCareer, getCareerCards }) {
  const [name, setName] = useState('');
  const [pos, setPos] = useState(null);
  const cgs = useGameStore(s => s.careerGlobalStats);
  const legacyUnlocks = cgs?.careerUnlocks || [];
  const totalCareers = cgs?.totalCareers || 0;

  // Determine unlocked NPCs
  const unlockedNpcs = [];
  if (legacyUnlocks.includes('cc1')) {
    const available = CAREER_CAST_UNLOCKABLE.filter(n => !unlockedNpcs.includes(n.id));
    if (available.length) unlockedNpcs.push(available[0].id);
  }

  const handleStart = () => {
    if (!name || !pos) return;
    const c = initCareer(name, pos, legacyUnlocks, unlockedNpcs);
    c.cardQueue = getCareerCards(c);
    setCareer(c);
    setCareerScreen('cards');
    SFX.play('whistle');
  };

  return (
    <div className="bg-stadium-ambient" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14, background: `radial-gradient(ellipse at 50% 60%, ${T.pitch}20 0%, ${T.bg} 70%)`, padding: 16, textAlign: 'center' }}>
      <div className="fw-anim-1" style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 32, color: T.tx, textTransform: 'uppercase', letterSpacing: 3 }}>Mi Leyenda</div>
      <div className="fw-anim-2" style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx3 }}>Crea tu jugador. De chamaco a leyenda.</div>
      {totalCareers > 0 && <div className="fw-anim-2" style={{ fontFamily: T.fontBody, fontSize: 11, color: T.purple }}>Carreras: {totalCareers} · LP: {cgs?.legendPoints || 0}</div>}
      <div className="fw-anim-3" style={{ width: '100%', maxWidth: 340 }}>
        <div style={{ fontFamily: T.fontHeading, fontSize: 12, color: T.gold, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 1 }}>Nombre</div>
        <div style={{ display: 'flex', gap: 4 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre..." style={{ flex: 1, padding: '10px 12px', background: T.bg1, border: `1px solid ${T.border}`, borderRadius: T.r2, color: T.tx, fontFamily: T.fontBody, fontSize: 14, outline: 'none' }} />
          <button onClick={() => setName(`${pick(FN)} ${pick(LN)}`)} style={{ padding: '10px 12px', background: `${T.gold}10`, border: `1px solid ${T.gold}25`, borderRadius: T.r2, color: T.gold, cursor: 'pointer', fontSize: 14, touchAction: 'manipulation' }}>🎲</button>
        </div>
      </div>
      <div className="fw-anim-4" style={{ width: '100%', maxWidth: 340 }}>
        <div style={{ fontFamily: T.fontHeading, fontSize: 12, color: T.gold, textTransform: 'uppercase', marginBottom: 6, letterSpacing: 1 }}>Posición</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[{ p: 'GK', n: 'Portero', i: '🧤' }, { p: 'DEF', n: 'Defensa', i: '🛡' }, { p: 'MID', n: 'Medio', i: '⚙️' }, { p: 'FWD', n: 'Delantero', i: '⚽' }].map(p => (
            <div key={p.p} onClick={() => setPos(p.p)} style={{ background: pos === p.p ? `${T.gold}10` : T.bg1, border: `1.5px solid ${pos === p.p ? `${T.gold}40` : T.border}`, borderRadius: T.r3, padding: 12, cursor: 'pointer', textAlign: 'center', transition: `all ${T.transBase}`, boxShadow: pos === p.p ? T.glowGold : 'none', touchAction: 'manipulation' }}>
              <div style={{ fontSize: 28 }}>{p.i}</div>
              <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 13, color: pos === p.p ? T.gold : T.tx, marginTop: 4 }}>{p.n}</div>
            </div>
          ))}
        </div>
      </div>
      {legacyUnlocks.length > 0 && (
        <div className="fw-anim-5" style={{ width: '100%', maxWidth: 340, background: `${T.purple}08`, border: `1px solid ${T.purple}20`, borderRadius: T.r2, padding: '8px 12px' }}>
          <div style={{ fontFamily: T.fontHeading, fontSize: 11, color: T.purple, textTransform: 'uppercase', letterSpacing: 0.8 }}>Bonos de Legado: {legacyUnlocks.length} activos</div>
        </div>
      )}
      <div className="fw-anim-5" style={{ display: 'flex', gap: 8, marginTop: 4, width: '100%', maxWidth: 340 }}>
        <button className="fw-btn fw-btn-outline" onClick={() => { setCareer(null); go('title'); }} style={{ fontFamily: T.fontHeading, fontSize: 12, padding: '8px 16px' }}>Volver</button>
        {totalCareers > 0 && <button className="fw-btn fw-btn-glass" onClick={() => setCareerScreen('legacy')} style={{ fontFamily: T.fontHeading, fontSize: 12, padding: '8px 16px', color: T.purple, borderColor: `${T.purple}30` }}>Legado</button>}
        <div style={{ flex: 1 }}><GoldBtn onClick={handleStart} disabled={!name || !pos}>Comenzar</GoldBtn></div>
      </div>
    </div>
  );
}

export function CareerCardScreen({ career, setCareer, setCareerScreen, applyCardChoice, checkCareerEnd }) {
  const c = career;
  if (!c) return null;
  const [slideDir, setSlideDir] = useState(null);
  const [lastTraitUnlock, setLastTraitUnlock] = useState(null);
  const autoPlay = useGameStore(s => s.debugAutoPlay);
  const autoRef = useRef(false);
  const currentCard = c.cardQueue[0];
  const showEffects = (c.legacyUnlocks || []).includes('ca2'); // Visión legacy

  if (!currentCard) { setTimeout(() => setCareerScreen('match'), 100); return null; }
  if (c.retired) { setTimeout(() => setCareerScreen('careerEnd'), 100); return null; }

  useEffect(() => {
    if (!autoPlay || !currentCard || slideDir || autoRef.current) return;
    autoRef.current = true;
    const t = setTimeout(() => {
      chooseOption(currentCard.b && Math.random() > 0.5 ? 'b' : 'a');
      autoRef.current = false;
    }, 150);
    return () => { clearTimeout(t); autoRef.current = false; };
  }, [autoPlay, currentCard, slideDir]);

  function chooseOption(option) {
    SFX.play('click'); setSlideDir(option === 'a' ? 'left' : 'right');
    setTimeout(() => {
      setCareer(prev => {
        const prevTraits = [...(prev.traits || [])];
        const next = applyCardChoice(prev, currentCard, option);
        next.cardQueue = prev.cardQueue.slice(1);
        const end = checkCareerEnd(next);
        if (end) { next.retired = true; next.retireReason = end; }
        // Check for new trait unlock
        const newTrait = (next.traits || []).find(t => !prevTraits.includes(t));
        if (newTrait) setTimeout(() => setLastTraitUnlock(newTrait), 100);
        return next;
      });
      setSlideDir(null);
    }, 400);
  }

  const isMoment = currentCard._isMoment;
  const cardBg = isMoment ? 'linear-gradient(135deg,#2a1a0a,#1a2744)' : 'linear-gradient(135deg,#141e3a,#1a2744)';
  const cardBorder = isMoment ? 'rgba(240,192,64,0.25)' : 'rgba(255,255,255,0.08)';
  const npc = currentCard.cast ? (c.cast || []).find(n => n.id === currentCard.cast) : null;

  // Effect preview helper
  const renderEffects = (effects) => {
    if (!effects || !showEffects) return null;
    const barLabels = { rend: '⚽', fis: '💪', rel: '🤝', fam: '⭐', men: '🧠' };
    return (
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap', marginTop: 4 }}>
        {Object.entries(effects).map(([k, v]) => (
          <span key={k} style={{ fontSize: 10, color: v > 0 ? '#00e676' : '#ff1744' }}>{barLabels[k]}{v > 0 ? '+' : ''}{v}</span>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, position: 'relative' }}>
      <AutoPlayBanner />
      <CareerBars bars={c.bars} />
      <div style={{ padding: '4px 12px', display: 'flex', justifyContent: 'space-between', fontFamily: T.fontBody, fontSize: 11, color: T.tx3 }}>
        <span>{c.name} · {c.age} años · {PN[c.pos]}</span>
        <span>{CAREER_TEAMS[Math.min(c.team, CAREER_TEAMS.length - 1)]} · Temp {c.season}</span>
      </div>
      {/* Active traits display */}
      {(c.traits || []).length > 0 && (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', padding: '2px 8px', flexWrap: 'wrap' }}>
          {(c.traits || []).map(t => <TraitBadge key={t} traitId={t} size="small" />)}
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflow: 'hidden' }}>
        <div style={{ width: '100%', maxWidth: 340, background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: T.r3, padding: 20, textAlign: 'center', transform: slideDir === 'left' ? 'translateX(-120%) rotate(-8deg)' : slideDir === 'right' ? 'translateX(120%) rotate(8deg)' : 'translateX(0)', opacity: slideDir ? 0 : 1, transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease', boxShadow: isMoment ? `0 0 24px ${T.gold}15` : T.elev3 }}>
          {isMoment && <div style={{ fontFamily: T.fontHeading, fontSize: 10, color: T.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>✨ Momento Estelar</div>}
          <div style={{ fontSize: 36, marginBottom: 8 }}>{currentCard.who?.split(' ')[0]}</div>
          <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 13, color: isMoment ? T.gold : T.tx, textTransform: 'uppercase' }}>{currentCard.who}</div>
          {npc && <div style={{ fontFamily: T.fontBody, fontSize: 10, color: npc.arc === 'ally' ? T.win : npc.arc === 'rival' ? T.lose : T.tx3, marginTop: 2 }}>{npc.role} · {npc.arc}</div>}
          <div style={{ fontFamily: T.fontBody, fontSize: 16, color: T.tx, lineHeight: 1.6, margin: '14px 0', minHeight: 60 }}>{currentCard.text}</div>
          <div style={{ display: 'flex', flexDirection: !currentCard.b ? 'column' : 'row', gap: 8, marginTop: 12 }}>
            <button onClick={() => chooseOption('a')} style={{ flex: 1, padding: '12px 10px', background: `${T.win}08`, border: `1px solid ${T.win}25`, borderRadius: T.r2, cursor: 'pointer', fontFamily: T.fontHeading, fontWeight: 600, fontSize: 13, color: T.win, textTransform: 'uppercase', touchAction: 'manipulation', transition: `all ${T.transQuick}` }}>
              {currentCard.a?.l || 'OK'}
              {renderEffects(currentCard.a?.e)}
            </button>
            {currentCard.b && (<button onClick={() => chooseOption('b')} style={{ flex: 1, padding: '12px 10px', background: `${T.lose}08`, border: `1px solid ${T.lose}25`, borderRadius: T.r2, cursor: 'pointer', fontFamily: T.fontHeading, fontWeight: 600, fontSize: 13, color: T.lose, textTransform: 'uppercase', touchAction: 'manipulation', transition: `all ${T.transQuick}` }}>
              {currentCard.b?.l || 'No'}
              {renderEffects(currentCard.b?.e)}
            </button>)}
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: 6, fontFamily: T.fontBody, fontSize: 11, color: T.tx4 }}>{c.cardQueue.length - 1} decisiones restantes</div>
      {/* Trait unlock toast */}
      {lastTraitUnlock && (
        <div onClick={() => setLastTraitUnlock(null)} className="fw-bounceIn" style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: `${T.purple}18`, border: `1px solid ${T.purple}35`, borderRadius: T.r3, padding: '10px 18px', zIndex: T.zToast, cursor: 'pointer', boxShadow: `0 8px 24px ${T.purple}20`, backdropFilter: 'blur(12px)' }}>
          <div style={{ fontFamily: T.fontHeading, fontSize: 11, color: T.purple, textTransform: 'uppercase', letterSpacing: 1 }}>✦ Nuevo Trait</div>
          <div style={{ marginTop: 4 }}><TraitBadge traitId={lastTraitUnlock} /></div>
        </div>
      )}
    </div>
  );
}

export function CareerMatchScreen({ career, setCareer, setCareerScreen, applyBarEffects, getMatchCards }) {
  const c = career;
  if (!c) return null;
  const [matchCards] = useState(() => getMatchCards(c.pos));
  const [cardIdx, setCardIdx] = useState(0);
  const [matchScore, setMatchScore] = useState({ yours: 0, rival: 0, rating: 5.0, events: [] });
  const [slideDir, setSlideDir] = useState(null);
  const [done, setDone] = useState(false);
  const autoPlay = useGameStore(s => s.debugAutoPlay);
  const autoRef = useRef(false);
  const continueRef = useRef(null);
  const teamName = CAREER_TEAMS[Math.min(c.team, CAREER_TEAMS.length - 1)];
  const [rivalName] = useState(() => pick(RIVAL_NAMES[Math.min(c.team, RIVAL_NAMES.length - 1)] || RIVAL_NAMES[0]));
  const currentCard = matchCards[cardIdx];
  const hasGuerreroTrait = (c.traits || []).includes('guerrero');
  const hasShowmanTrait = (c.traits || []).includes('showman');

  useEffect(() => {
    if (!autoPlay || done || !currentCard || slideDir || autoRef.current) return;
    autoRef.current = true;
    const t = setTimeout(() => {
      chooseMatchOption(currentCard.b && Math.random() > 0.5 ? 'b' : 'a');
      autoRef.current = false;
    }, 100);
    return () => { clearTimeout(t); autoRef.current = false; };
  }, [autoPlay, cardIdx, done, slideDir]);

  useEffect(() => {
    if (!autoPlay || !done) return;
    const t = setTimeout(() => { if (continueRef.current) continueRef.current(); }, 200);
    return () => clearTimeout(t);
  }, [autoPlay, done]);

  function chooseMatchOption(option) {
    const opt = currentCard[option];
    const effects = { ...(opt?.e || {}) };
    const goalChance = opt?.goal || 0;

    // Guerrero trait: +1 to all positive match card effects
    if (hasGuerreroTrait) {
      for (const k of Object.keys(effects)) { if (effects[k] > 0) effects[k] += 1; }
    }

    SFX.play('click'); setSlideDir(option === 'a' ? 'left' : 'right');
    setTimeout(() => {
      let newScore = { ...matchScore };
      let ratingDelta = (effects.rend || 0) * 0.08;
      if (goalChance > 0 && Math.random() < goalChance) {
        newScore.yours++; ratingDelta += 1.0;
        newScore.events.push(`⚽ ¡Gol de ${c.name}!`);
        if (hasShowmanTrait) effects.fam = (effects.fam || 0) + 3; // Showman: +3 fam per goal
        SFX.play('goal');
      }
      if (Math.random() < 0.12) { newScore.rival++; ratingDelta -= 0.3; newScore.events.push(`💀 Gol del rival`); }
      newScore.rating = Math.max(1, Math.min(10, newScore.rating + ratingDelta));
      setMatchScore(newScore);
      setCareer(prev => ({ ...prev, bars: applyBarEffects(prev, effects) }));
      if (cardIdx + 1 >= matchCards.length) setDone(true);
      else setCardIdx(cardIdx + 1);
      setSlideDir(null);
    }, 400);
  }

  if (done) {
    const won = matchScore.yours > matchScore.rival;
    const drew = matchScore.yours === matchScore.rival;
    const finalRating = Math.round(matchScore.rating * 10) / 10;
    const handleContinue = () => {
      SFX.play('click');
      setCareer(prev => {
        const next = { ...prev };
        next.totalMatches++; next.matchNum++; next.matchesThisSeason++;
        next.seasonGoals += matchScore.yours; next.ratings.push(finalRating); next.goals += matchScore.yours;
        if (next.matchesThisSeason >= 8) return next;
        next.cardQueue = getMatchCards(next.pos);
        return next;
      });
      if (career.matchesThisSeason + 1 >= 8) setCareerScreen('seasonEnd');
      else setCareerScreen('cards');
    };
    continueRef.current = handleContinue;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, background: T.bg, padding: 16, textAlign: 'center', overflow: 'auto' }}>
        <CareerBars bars={career.bars} />
        <div className="fw-bounceIn" style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 28, color: won ? T.win : drew ? T.draw : T.lose, textTransform: 'uppercase', letterSpacing: 2 }}>{won ? 'VICTORIA' : drew ? 'EMPATE' : 'DERROTA'}</div>
        <div className="anim-number-roll" style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 52, color: T.tx, lineHeight: 1 }}>{matchScore.yours} - {matchScore.rival}</div>
        <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 24, color: finalRating >= 7 ? T.win : finalRating >= 5 ? T.draw : T.lose }}>Rating: {finalRating}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {matchScore.events.map((e, i) => (<div key={i} style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx }}>{e}</div>))}
        </div>
        <div style={{ width: '100%', maxWidth: 300, marginTop: 4 }}><GoldBtn onClick={handleContinue}>Continuar</GoldBtn></div>
      </div>
    );
  }
  if (!currentCard) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: `linear-gradient(180deg, ${T.pitch}15 0%, ${T.bg} 40%)`, position: 'relative' }}>
      <AutoPlayBanner />
      <CareerBars bars={career.bars} />
      {/* Scoreline */}
      <div style={{ padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: T.fontHeading, fontSize: 12 }}>
        <span style={{ color: T.info, fontWeight: 600 }}>{teamName} {matchScore.yours}</span>
        <span style={{ color: T.tx4, fontFamily: T.fontBody, fontSize: 11 }}>Min {15 + cardIdx * 15}'</span>
        <span style={{ color: T.lose, fontWeight: 600 }}>{matchScore.rival} {rivalName}</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflow: 'hidden' }}>
        <div style={{ width: '100%', maxWidth: 340, background: T.gradientDark, border: `1px solid ${T.border}`, borderRadius: T.r3, padding: 20, textAlign: 'center', transform: slideDir === 'left' ? 'translateX(-120%) rotate(-8deg)' : slideDir === 'right' ? 'translateX(120%) rotate(8deg)' : 'translateX(0)', opacity: slideDir ? 0 : 1, transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease', boxShadow: T.elev3 }}>
          <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 12, color: T.win, textTransform: 'uppercase', letterSpacing: 2 }}>⚽ En la cancha</div>
          <div style={{ fontFamily: T.fontBody, fontSize: 16, color: T.tx, lineHeight: 1.6, margin: '14px 0' }}>{currentCard.text}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => chooseMatchOption('a')} style={{ flex: 1, padding: '12px 10px', background: `${T.win}08`, border: `1px solid ${T.win}25`, borderRadius: T.r2, cursor: 'pointer', fontFamily: T.fontHeading, fontWeight: 600, fontSize: 13, color: T.win, textTransform: 'uppercase', touchAction: 'manipulation' }}>{currentCard.a?.l}</button>
            {currentCard.b && <button onClick={() => chooseMatchOption('b')} style={{ flex: 1, padding: '12px 10px', background: `${T.info}08`, border: `1px solid ${T.info}25`, borderRadius: T.r2, cursor: 'pointer', fontFamily: T.fontHeading, fontWeight: 600, fontSize: 13, color: T.info, textTransform: 'uppercase', touchAction: 'manipulation' }}>{currentCard.b?.l}</button>}
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: 6, fontFamily: T.fontBody, fontSize: 11, color: T.tx4 }}>Decisión {cardIdx + 1}/{matchCards.length} · Rating: {Math.round(matchScore.rating * 10) / 10}</div>
    </div>
  );
}

export function CareerSeasonEnd({ career, setCareer, setCareerScreen, applyAging, checkCareerEnd, getCareerCards, resetSeasonCards }) {
  const c = career;
  if (!c) return null;
  const autoPlay = useGameStore(s => s.debugAutoPlay);
  const avgRating = c.ratings.length ? Math.round(c.ratings.reduce((a, b) => a + b, 0) / c.ratings.length * 10) / 10 : 5.0;
  const canAscend = avgRating >= 6.5 && c.team < CAREER_TEAMS.length - 1;
  const mustDescend = avgRating < 4.0 && c.team > 0;
  const teamName = CAREER_TEAMS[Math.min(c.team, CAREER_TEAMS.length - 1)];
  const activeNpcs = (c.cast || []).filter(n => n.arc !== 'neutral');

  const handleNextSeason = () => {
    SFX.play('reward');
    setCareer(prev => {
      let next = { ...prev };
      next.history.push({ season: next.season, age: next.age, team: teamName, rating: avgRating, goals: next.seasonGoals, traits: [...(next.traits || [])], moments: [...(next.momentsTriggered || [])] });
      next.season++; next.age++;
      next = resetSeasonCards(next);
      if (canAscend) {
        next.team = Math.min(CAREER_TEAMS.length - 1, next.team + 1);
        // Ambicioso trait: +5 fam on team ascend
        if ((next.traits || []).includes('ambicioso')) next.bars = { ...next.bars, fam: Math.min(100, next.bars.fam + 5) };
      }
      if (mustDescend) next.team = Math.max(0, next.team - 1);
      next.bars = applyAging(next);
      const end = checkCareerEnd(next);
      if (end) { next.retired = true; next.retireReason = end; }
      next.cardQueue = getCareerCards(next);
      return next;
    });
    if (career.retired) setCareerScreen('careerEnd');
    else setCareerScreen('cards');
  };

  useEffect(() => {
    if (!autoPlay) return;
    const t = setTimeout(handleNextSeason, 200);
    return () => clearTimeout(t);
  }, [autoPlay]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', gap: 10, background: T.bg, padding: 16, textAlign: 'center', overflow: 'auto' }}>
      <div className="fw-anim-1" style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 28, color: T.gold, textTransform: 'uppercase', letterSpacing: 2 }}>Fin de Temporada {c.season}</div>
      <div className="fw-anim-2" style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx3 }}>{c.name} · {c.age} años · {teamName}</div>
      <CareerBars bars={c.bars} />
      <div className="fw-anim-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, maxWidth: 300, width: '100%' }}>
        {[{ l: 'Rating', v: avgRating, c: avgRating >= 7 ? T.win : T.draw }, { l: 'Goles', v: c.seasonGoals, c: T.info }, { l: 'Partidos', v: c.matchesThisSeason, c: T.tx }].map((s, i) => (
          <div key={i} className="glass-light" style={{ borderRadius: T.r2, padding: '8px', textAlign: 'center' }}>
            <div className="anim-number-roll" style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 22, color: s.c }}>{s.v}</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3, letterSpacing: 0.5, textTransform: 'uppercase' }}>{s.l}</div>
          </div>
        ))}
      </div>
      {/* NPC relationship summary */}
      {activeNpcs.length > 0 && (
        <div className="fw-anim-4" style={{ width: '100%', maxWidth: 320 }}>
          <div className="section-header" style={{ padding: '4px 0 6px' }}><span>Relaciones</span></div>
          {activeNpcs.slice(0, 3).map(npc => (
            <RelationshipBar key={npc.id} npc={npc} rel={c.npcRelations?.[npc.id] ?? npc.rel} />
          ))}
        </div>
      )}
      {/* Traits */}
      {(c.traits || []).length > 0 && (
        <div className="fw-anim-4" style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          {(c.traits || []).map(t => <TraitBadge key={t} traitId={t} size="small" />)}
        </div>
      )}
      {canAscend && <div className="fw-bounceIn" style={{ background: `${T.win}08`, border: `1px solid ${T.win}20`, borderRadius: T.r2, padding: '10px 14px', maxWidth: 320 }}><div style={{ fontFamily: T.fontHeading, fontSize: 13, color: T.win }}>🎉 ¡{CAREER_TEAMS[c.team + 1]} te quiere fichar!</div></div>}
      {mustDescend && <div style={{ background: `${T.lose}08`, border: `1px solid ${T.lose}20`, borderRadius: T.r2, padding: '10px 14px', maxWidth: 320 }}><div style={{ fontFamily: T.fontHeading, fontSize: 13, color: T.lose }}>💀 Rating bajo. Te bajan.</div></div>}
      <div style={{ maxWidth: 320, width: '100%', marginTop: 4 }}>
        <GoldBtn onClick={handleNextSeason}>{canAscend ? `Fichar por ${CAREER_TEAMS[c.team + 1]}` : 'Siguiente Temporada'}</GoldBtn>
      </div>
    </div>
  );
}

export function CareerEndScreen({ career, setCareer, setCareerScreen, go, calcCareerLegacyPoints }) {
  const c = career;
  if (!c) return null;
  const endCareerRun = useGameStore(s => s.endCareerRun);
  const [saved, setSaved] = useState(false);
  const avgRating = c.history.length ? Math.round(c.history.reduce((a, h) => a + h.rating, 0) / c.history.length * 10) / 10 : 5.0;
  const maxTeam = Math.max(...c.history.map(h => CAREER_TEAMS.indexOf(h.team)).filter(i => i >= 0), c.team);
  const legendLevel = maxTeam >= 6 ? 'LEYENDA INMORTAL' : maxTeam >= 5 ? 'Estrella Mundial' : maxTeam >= 3 ? 'Seleccionado' : 'Crack del Barrio';
  const legendColor = maxTeam >= 6 ? '#f0c040' : maxTeam >= 5 ? '#d500f9' : maxTeam >= 3 ? '#42a5f5' : '#607d8b';
  const earnedLP = calcCareerLegacyPoints(c);
  const completedArcs = (c.cast || []).filter(n => n.arc !== 'neutral');

  useEffect(() => {
    maxTeam >= 5 ? SFX.play('victory') : SFX.play('defeat');
    if (!saved) { endCareerRun(); setSaved(true); }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'auto', background: `linear-gradient(180deg, ${T.lose}08 0%, ${T.bg} 30%)`, padding: '0 0 24px' }}>
      <div className="fw-anim-1" style={{ width: '100%', padding: '16px', textAlign: 'center' }}>
        <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 28, color: T.lose, textTransform: 'uppercase', letterSpacing: 2 }}>Fin de la Carrera</div>
        <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 20, color: legendColor, marginTop: 6 }}>"{legendLevel}"</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.tx3, marginTop: 4 }}>{c.name} · Retirado a los {c.age} · {c.retireReason}</div>
      </div>
      {/* Don Miguel's words */}
      <div className="fw-anim-2 glass-light" style={{ padding: '12px 20px', maxWidth: 340, textAlign: 'center', borderRadius: T.r3, margin: '0 16px' }}>
        <div style={{ fontSize: 28 }}>👴</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.tx, lineHeight: 1.6, fontStyle: 'italic', marginTop: 4 }}>
          {maxTeam >= 5 ? '"Lo lograste, mijo. Desde El Potrero hasta el mundo."' : '"Llegaste lejos, mijo. Más lejos de lo que cualquiera esperaba."'}
        </div>
      </div>
      {/* Stats */}
      <div className="fw-anim-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, maxWidth: 320, width: '100%', padding: '0 16px', margin: '8px 0' }}>
        {[{ l: 'Temporadas', v: c.season - 1, c: T.tx }, { l: 'Goles', v: c.goals, c: T.info }, { l: 'Rating', v: avgRating, c: T.gold }].map((s, i) => (
          <div key={i} className="glass-light" style={{ borderRadius: T.r2, padding: '8px', textAlign: 'center' }}>
            <div className="anim-number-roll" style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 18, color: s.c }}>{s.v}</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3, textTransform: 'uppercase' }}>{s.l}</div>
          </div>
        ))}
      </div>
      {/* Legacy Points earned */}
      <div className="fw-anim-4 card-purple" style={{ padding: '12px 18px', marginTop: 4, textAlign: 'center' }}>
        <div style={{ fontFamily: T.fontHeading, fontSize: 11, color: T.purple, textTransform: 'uppercase', letterSpacing: 1 }}>Puntos de Leyenda Ganados</div>
        <div className="anim-number-roll" style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 28, color: T.purple, marginTop: 4 }}>+{earnedLP} LP</div>
      </div>
      {/* Traits */}
      {(c.traits || []).length > 0 && (
        <div className="fw-anim-5" style={{ width: '100%', maxWidth: 320, padding: '0 16px', marginTop: 6 }}>
          <div className="section-header" style={{ padding: '4px 0 6px' }}><span>Rasgos Desarrollados</span></div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {(c.traits || []).map(t => <TraitBadge key={t} traitId={t} size="small" />)}
          </div>
        </div>
      )}
      {/* NPC Arcs */}
      {completedArcs.length > 0 && (
        <div style={{ width: '100%', maxWidth: 320, padding: '0 16px', marginTop: 6 }}>
          <div className="section-header" style={{ padding: '4px 0 6px' }}><span>Arcos Narrativos</span></div>
          {completedArcs.map(npc => {
            const arcColor = npc.arc === 'ally' ? T.win : npc.arc === 'rival' ? T.lose : T.purple;
            return (
              <div key={npc.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <div style={{ fontSize: 16, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${arcColor}10`, borderRadius: T.r1, border: `1px solid ${arcColor}20` }}>{npc.i}</div>
                <span style={{ fontFamily: T.fontHeading, fontSize: 12, color: T.tx, fontWeight: 600, flex: 1 }}>{npc.n}</span>
                <span style={{ fontFamily: T.fontHeading, fontSize: 10, color: arcColor, textTransform: 'uppercase', fontWeight: 600, background: `${arcColor}10`, padding: '2px 6px', borderRadius: T.r1 }}>{npc.arc}</span>
              </div>
            );
          })}
        </div>
      )}
      {/* Moments */}
      {(c.momentsTriggered || []).length > 0 && (
        <div style={{ width: '100%', maxWidth: 320, padding: '0 16px', marginTop: 6 }}>
          <div className="section-header" style={{ padding: '4px 0 6px' }}><span>Momentos Estelares ({(c.momentsTriggered || []).length})</span></div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {(c.momentsTriggered || []).map(id => (
              <span key={id} style={{ fontSize: 10, background: `${T.gold}10`, border: `1px solid ${T.gold}20`, borderRadius: T.r1, padding: '2px 8px', color: T.gold, fontFamily: T.fontBody, fontWeight: 500 }}>✨ {id.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 16px', width: '100%', maxWidth: 340 }}>
        <GoldBtn onClick={() => { setCareer(null); setCareerScreen('create'); go('title'); }}>Volver al Menú</GoldBtn>
      </div>
    </div>
  );
}

// ═══ NEW SCREENS ═══

export function CareerTimelineScreen({ career, setCareerScreen }) {
  const c = career;
  if (!c) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, overflow: 'auto', padding: 16 }}>
      <div className="fw-anim-1" style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 22, color: T.gold, textTransform: 'uppercase', textAlign: 'center', marginBottom: 4, letterSpacing: 2 }}>Timeline</div>
      <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx3, textAlign: 'center', marginBottom: 12 }}>{c.name} · {c.pos}</div>
      {/* NPC relationships */}
      <div className="fw-anim-2" style={{ marginBottom: 12 }}>
        <div className="section-header"><span>Relaciones</span></div>
        {(c.cast || []).map(npc => (
          <RelationshipBar key={npc.id} npc={npc} rel={c.npcRelations?.[npc.id] ?? npc.rel} />
        ))}
      </div>
      {/* Season history */}
      <div className="fw-anim-3">
        <div className="section-header"><span>Historial</span></div>
        {(c.history || []).length === 0 && <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx4 }}>Aún no hay temporadas completadas.</div>}
        {(c.history || []).map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontFamily: T.fontHeading, fontSize: 14, fontWeight: 700, color: T.gold, minWidth: 28 }}>T{h.season}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.fontHeading, fontSize: 12, color: T.tx, fontWeight: 600 }}>{h.team}</div>
              <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3 }}>{h.age} años · {h.goals} goles · Rating {h.rating}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Traits */}
      {(c.traits || []).length > 0 && (
        <div className="fw-anim-4" style={{ marginTop: 12 }}>
          <div className="section-header"><span>Rasgos</span></div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{(c.traits || []).map(t => <TraitBadge key={t} traitId={t} />)}</div>
        </div>
      )}
      <button className="fw-btn fw-btn-outline" onClick={() => setCareerScreen('cards')} style={{ fontFamily: T.fontHeading, fontSize: 12, padding: '8px 16px', marginTop: 12, alignSelf: 'center' }}>Volver</button>
    </div>
  );
}

export function CareerLegacyScreen({ setCareerScreen }) {
  const cgs = useGameStore(s => s.careerGlobalStats);
  const unlock = useGameStore(s => s.unlockCareerLegacy);
  const unlocks = cgs?.careerUnlocks || [];
  const points = cgs?.legendPoints || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, overflow: 'auto', padding: 16 }}>
      <div className="fw-anim-1" style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 22, color: T.purple, textTransform: 'uppercase', textAlign: 'center', letterSpacing: 2 }}>Legado de Leyenda</div>
      <div className="fw-anim-1" style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx3, textAlign: 'center', marginBottom: 4 }}>Desbloquea bonos permanentes entre carreras</div>
      <div className="fw-anim-2 card-purple" style={{ textAlign: 'center', padding: '10px 16px', marginBottom: 12, borderRadius: T.r2 }}>
        <div style={{ fontFamily: T.fontHeading, fontSize: 11, color: T.purple, textTransform: 'uppercase', letterSpacing: 1 }}>LP Disponibles</div>
        <div className="anim-number-roll" style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 28, color: T.purple }}>{points}</div>
      </div>

      {/* Stats summary */}
      <div className="fw-anim-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[{ l: 'Carreras', v: cgs?.totalCareers || 0 }, { l: 'Goles', v: cgs?.totalGoals || 0 }, { l: 'Traits', v: (cgs?.traitsDiscovered || []).length }].map((s, i) => (
          <div key={i} className="glass-light" style={{ borderRadius: T.r2, padding: '8px', textAlign: 'center' }}>
            <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 16, color: T.tx }}>{s.v}</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3, textTransform: 'uppercase' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Legacy tree branches */}
      {CAREER_LEGACY_TREE.map(branch => {
        // Check tier prerequisites: must unlock tier N before tier N+1
        const canUnlockNode = (nodeIdx) => {
          if (nodeIdx === 0) return true;
          return unlocks.includes(branch.nodes[nodeIdx - 1].id);
        };
        return (
          <div key={branch.branch} style={{ marginBottom: 12 }}>
            <div className="section-header" style={{ padding: '4px 0 6px' }}><span>{branch.i} {branch.branch}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {branch.nodes.map((node, idx) => (
                <CareerLegacyNode
                  key={node.id}
                  node={node}
                  unlocked={unlocks.includes(node.id)}
                  canAfford={points >= node.cost && canUnlockNode(idx) && !unlocks.includes(node.id)}
                  onUnlock={(id) => { unlock(id); SFX.play('reward'); }}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Hall of Legends */}
      {(cgs?.hallOfLegends || []).length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div className="section-header"><span>🏛 Salón de Leyendas</span></div>
          {(cgs.hallOfLegends || []).slice(-5).reverse().map((h, i) => (
            <div key={i} className="glass-light" style={{ borderRadius: T.r2, padding: '8px 10px', marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: T.fontHeading, fontSize: 12, color: T.tx, fontWeight: 600 }}>{h.name} ({h.pos})</span>
                <span style={{ fontFamily: T.fontHeading, fontSize: 11, color: T.purple, fontWeight: 600 }}>+{h.legendPoints}LP</span>
              </div>
              <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3, marginTop: 2 }}>{h.seasons} temp · {h.goals} goles · Rating {h.avgRating}</div>
            </div>
          ))}
        </div>
      )}

      <button className="fw-btn fw-btn-outline" onClick={() => setCareerScreen('create')} style={{ fontFamily: T.fontHeading, fontSize: 12, padding: '8px 16px', marginTop: 12, alignSelf: 'center' }}>Volver</button>
    </div>
  );
}