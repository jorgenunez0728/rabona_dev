import { useState, useEffect, useRef } from "react";
import { SFX } from "@/game/audio";
import { T, PN, CAREER_TEAMS, RIVAL_NAMES, FN, LN, pick, CAREER_CAST_UNLOCKABLE, CAREER_LEGACY_TREE, SIGNATURE_MOMENTS } from "@/game/data";
import { CareerBars, RelationshipBar, TraitBadge, MomentCard, CareerLegacyNode } from "@/game/components";
import useGameStore from "@/game/store";

const GoldBtn = ({ onClick, children, disabled }) => (
  <button onClick={disabled ? undefined : onClick} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, padding: '10px 28px', border: 'none', background: disabled ? '#333' : 'linear-gradient(135deg,#d4a017,#f0c040)', color: disabled ? '#666' : '#1a1a2e', clipPath: 'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)', cursor: disabled ? 'not-allowed' : 'pointer', textTransform: 'uppercase', width: '100%' }}>{children}</button>
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, background: 'radial-gradient(ellipse at 50% 60%,#1a2a10 0%,#0b1120 70%)', padding: 16, textAlign: 'center' }}>
      <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 32, color: '#fff', textTransform: 'uppercase' }}>Mi Leyenda</div>
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 14, color: '#607d8b' }}>Crea tu jugador. De chamaco a leyenda.</div>
      {totalCareers > 0 && <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: '#a78bfa' }}>Carreras completadas: {totalCareers} · LP: {cgs?.legendPoints || 0}</div>}
      <div style={{ width: '100%', maxWidth: 340 }}>
        <div style={{ fontFamily: "'Oswald'", fontSize: 12, color: '#f0c040', textTransform: 'uppercase', marginBottom: 4 }}>Nombre</div>
        <div style={{ display: 'flex', gap: 4 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre..." style={{ flex: 1, padding: '8px 12px', background: '#141e3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, color: '#fff', fontFamily: "'Barlow'", fontSize: 14, outline: 'none' }} />
          <button onClick={() => setName(`${pick(FN)} ${pick(LN)}`)} style={{ padding: '8px 12px', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.2)', borderRadius: 4, color: '#f0c040', cursor: 'pointer', fontSize: 12 }}>🎲</button>
        </div>
      </div>
      <div style={{ width: '100%', maxWidth: 340 }}>
        <div style={{ fontFamily: "'Oswald'", fontSize: 12, color: '#f0c040', textTransform: 'uppercase', marginBottom: 4 }}>Posición</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[{ p: 'GK', n: 'Portero', i: '🧤' }, { p: 'DEF', n: 'Defensa', i: '🛡' }, { p: 'MID', n: 'Medio', i: '⚙️' }, { p: 'FWD', n: 'Delantero', i: '⚽' }].map(p => (
            <div key={p.p} onClick={() => setPos(p.p)} style={{ background: pos === p.p ? 'rgba(240,192,64,0.08)' : '#141e3a', border: `1px solid ${pos === p.p ? 'rgba(240,192,64,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, padding: 10, cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: 24 }}>{p.i}</div>
              <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, color: pos === p.p ? '#f0c040' : '#fff' }}>{p.n}</div>
            </div>
          ))}
        </div>
      </div>
      {legacyUnlocks.length > 0 && (
        <div style={{ width: '100%', maxWidth: 340, background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 6, padding: 8 }}>
          <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: '#a78bfa', textTransform: 'uppercase', marginBottom: 4 }}>Bonos de Legado Activos</div>
          <div style={{ fontFamily: "'Barlow'", fontSize: 11, color: '#9e9e9e' }}>{legacyUnlocks.length} desbloqueos activos</div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={() => { setCareer(null); go('title'); }} style={{ fontFamily: "'Oswald'", fontSize: 12, padding: '8px 16px', border: '1px solid #607d8b', background: 'transparent', color: '#e8eaf6', borderRadius: 4, cursor: 'pointer' }}>Volver</button>
        {totalCareers > 0 && <button onClick={() => setCareerScreen('legacy')} style={{ fontFamily: "'Oswald'", fontSize: 12, padding: '8px 16px', border: '1px solid #a78bfa40', background: 'rgba(167,139,250,0.06)', color: '#a78bfa', borderRadius: 4, cursor: 'pointer' }}>Legado</button>}
        <GoldBtn onClick={handleStart} disabled={!name || !pos}>Comenzar</GoldBtn>
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
      <div style={{ padding: '4px 12px', display: 'flex', justifyContent: 'space-between', fontFamily: "'Barlow Condensed'", fontSize: 11, color: '#607d8b' }}>
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
        <div style={{ width: '100%', maxWidth: 340, background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 20, textAlign: 'center', transform: slideDir === 'left' ? 'translateX(-120%) rotate(-8deg)' : slideDir === 'right' ? 'translateX(120%) rotate(8deg)' : 'translateX(0)', opacity: slideDir ? 0 : 1, transition: 'transform 0.35s ease, opacity 0.3s ease' }}>
          {isMoment && <div style={{ fontFamily: "'Oswald'", fontSize: 10, color: '#f0c040', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Momento Estelar</div>}
          <div style={{ fontSize: 36, marginBottom: 8 }}>{currentCard.who?.split(' ')[0]}</div>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, color: isMoment ? '#f0c040' : '#e8eaf6', textTransform: 'uppercase' }}>{currentCard.who}</div>
          {npc && <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: npc.arc === 'ally' ? '#00e676' : npc.arc === 'rival' ? '#ff1744' : '#607d8b', marginTop: 2 }}>{npc.role} · {npc.arc}</div>}
          <div style={{ fontFamily: "'Barlow'", fontSize: 16, color: '#e8eaf6', lineHeight: 1.5, margin: '12px 0', minHeight: 60 }}>{currentCard.text}</div>
          <div style={{ display: 'flex', flexDirection: !currentCard.b ? 'column' : 'row', gap: 8, marginTop: 12 }}>
            <button onClick={() => chooseOption('a')} style={{ flex: 1, padding: '12px 8px', background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)', borderRadius: 6, cursor: 'pointer', fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, color: '#00e676', textTransform: 'uppercase' }}>
              {currentCard.a?.l || 'OK'}
              {renderEffects(currentCard.a?.e)}
            </button>
            {currentCard.b && (<button onClick={() => chooseOption('b')} style={{ flex: 1, padding: '12px 8px', background: 'rgba(255,23,68,0.06)', border: '1px solid rgba(255,23,68,0.2)', borderRadius: 6, cursor: 'pointer', fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, color: '#ff1744', textTransform: 'uppercase' }}>
              {currentCard.b?.l || 'No'}
              {renderEffects(currentCard.b?.e)}
            </button>)}
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: 6, fontFamily: "'Barlow Condensed'", fontSize: 11, color: '#455a64' }}>{c.cardQueue.length - 1} decisiones restantes</div>
      {/* Trait unlock toast */}
      {lastTraitUnlock && (
        <div onClick={() => setLastTraitUnlock(null)} style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 8, padding: '8px 16px', zIndex: 100, cursor: 'pointer' }}>
          <div style={{ fontFamily: "'Oswald'", fontSize: 12, color: '#a78bfa', textTransform: 'uppercase' }}>Nuevo Trait Desbloqueado</div>
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
        <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 26, color: won ? '#00e676' : drew ? '#ffd600' : '#ff1744' }}>{won ? 'VICTORIA' : drew ? 'EMPATE' : 'DERROTA'}</div>
        <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 48, color: '#fff' }}>{matchScore.yours} - {matchScore.rival}</div>
        <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 28, color: finalRating >= 7 ? '#00e676' : finalRating >= 5 ? '#ffd600' : '#ff1744' }}>Rating: {finalRating}</div>
        {matchScore.events.map((e, i) => (<div key={i} style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: '#e8eaf6' }}>{e}</div>))}
        <GoldBtn onClick={handleContinue}>Continuar</GoldBtn>
      </div>
    );
  }
  if (!currentCard) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'linear-gradient(180deg,#132010 0%,#0b1120 40%)', position: 'relative' }}>
      <AutoPlayBanner />
      <CareerBars bars={career.bars} />
      <div style={{ padding: '6px 12px', display: 'flex', justifyContent: 'space-between', fontFamily: "'Barlow Condensed'", fontSize: 11 }}>
        <span style={{ color: '#42a5f5' }}>{teamName} {matchScore.yours}</span>
        <span style={{ color: '#607d8b' }}>Min {15 + cardIdx * 15}'</span>
        <span style={{ color: '#ef5350' }}>{matchScore.rival} {rivalName}</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflow: 'hidden' }}>
        <div style={{ width: '100%', maxWidth: 340, background: 'linear-gradient(135deg,#141e3a,#1a2744)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, textAlign: 'center', transform: slideDir === 'left' ? 'translateX(-120%) rotate(-8deg)' : slideDir === 'right' ? 'translateX(120%) rotate(8deg)' : 'translateX(0)', opacity: slideDir ? 0 : 1, transition: 'transform 0.35s ease, opacity 0.3s ease' }}>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 12, color: '#00e676', textTransform: 'uppercase', letterSpacing: 2 }}>⚽ En la cancha</div>
          <div style={{ fontFamily: "'Barlow'", fontSize: 16, color: '#e8eaf6', lineHeight: 1.5, margin: '12px 0' }}>{currentCard.text}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => chooseMatchOption('a')} style={{ flex: 1, padding: '12px 8px', background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)', borderRadius: 6, cursor: 'pointer', fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, color: '#00e676', textTransform: 'uppercase' }}>{currentCard.a?.l}</button>
            {currentCard.b && <button onClick={() => chooseMatchOption('b')} style={{ flex: 1, padding: '12px 8px', background: 'rgba(66,165,245,0.06)', border: '1px solid rgba(66,165,245,0.2)', borderRadius: 6, cursor: 'pointer', fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, color: '#42a5f5', textTransform: 'uppercase' }}>{currentCard.b?.l}</button>}
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: 6, fontFamily: "'Barlow Condensed'", fontSize: 11, color: '#455a64' }}>Decisión {cardIdx + 1}/{matchCards.length} · Rating: {Math.round(matchScore.rating * 10) / 10}</div>
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', gap: 8, background: T.bg, padding: 16, textAlign: 'center', overflow: 'auto' }}>
      <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 28, color: '#f0c040', textTransform: 'uppercase' }}>Fin de Temporada {c.season}</div>
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 14, color: '#607d8b' }}>{c.name} · {c.age} años · {teamName}</div>
      <CareerBars bars={c.bars} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, maxWidth: 300, width: '100%' }}>
        {[{ l: 'Rating', v: avgRating, c: avgRating >= 7 ? '#00e676' : '#ffd600' }, { l: 'Goles', v: c.seasonGoals, c: '#42a5f5' }, { l: 'Partidos', v: c.matchesThisSeason, c: '#fff' }].map((s, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 4, padding: '6px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 20, color: s.c }}>{s.v}</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: '#607d8b', letterSpacing: 0.5 }}>{s.l}</div>
          </div>
        ))}
      </div>
      {/* NPC relationship summary */}
      {activeNpcs.length > 0 && (
        <div style={{ width: '100%', maxWidth: 320 }}>
          <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: '#607d8b', textTransform: 'uppercase', marginBottom: 4 }}>Relaciones</div>
          {activeNpcs.slice(0, 3).map(npc => (
            <RelationshipBar key={npc.id} npc={npc} rel={c.npcRelations?.[npc.id] ?? npc.rel} />
          ))}
        </div>
      )}
      {/* Traits */}
      {(c.traits || []).length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          {(c.traits || []).map(t => <TraitBadge key={t} traitId={t} size="small" />)}
        </div>
      )}
      {canAscend && <div style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.15)', borderRadius: 6, padding: 8, maxWidth: 320 }}><div style={{ fontFamily: "'Oswald'", fontSize: 13, color: '#00e676' }}>🎉 ¡{CAREER_TEAMS[c.team + 1]} te quiere fichar!</div></div>}
      {mustDescend && <div style={{ background: 'rgba(255,23,68,0.06)', border: '1px solid rgba(255,23,68,0.15)', borderRadius: 6, padding: 8, maxWidth: 320 }}><div style={{ fontFamily: "'Oswald'", fontSize: 13, color: '#ff1744' }}>💀 Rating bajo. Te bajan.</div></div>}
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'auto', background: 'linear-gradient(180deg,#1a0a0a 0%,#0b1120 30%)', padding: '0 0 24px' }}>
      <div style={{ width: '100%', padding: '16px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 28, color: '#ff1744', textTransform: 'uppercase' }}>Fin de la Carrera</div>
        <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 20, color: legendColor, marginTop: 4 }}>"{legendLevel}"</div>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, color: '#607d8b', marginTop: 4 }}>{c.name} · Retirado a los {c.age} · {c.retireReason}</div>
      </div>
      {/* Don Miguel's words */}
      <div style={{ padding: '4px 20px', maxWidth: 340, textAlign: 'center' }}>
        <div style={{ fontSize: 28 }}>👴</div>
        <div style={{ fontFamily: "'Barlow'", fontSize: 13, color: '#e8eaf6', lineHeight: 1.5, fontStyle: 'italic', marginTop: 4 }}>
          {maxTeam >= 5 ? '"Lo lograste, mijo. Desde El Potrero hasta el mundo."' : '"Llegaste lejos, mijo. Más lejos de lo que cualquiera esperaba."'}
        </div>
      </div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, maxWidth: 320, width: '100%', padding: '0 16px', margin: '6px 0' }}>
        {[{ l: 'Temporadas', v: c.season - 1, c: '#fff' }, { l: 'Goles', v: c.goals, c: '#42a5f5' }, { l: 'Rating', v: avgRating, c: '#f0c040' }].map((s, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 4, padding: '5px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 16, color: s.c }}>{s.v}</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: '#607d8b', textTransform: 'uppercase' }}>{s.l}</div>
          </div>
        ))}
      </div>
      {/* Legacy Points earned */}
      <div style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 6, padding: '8px 16px', marginTop: 4, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: '#a78bfa', textTransform: 'uppercase' }}>Puntos de Leyenda Ganados</div>
        <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 24, color: '#a78bfa' }}>+{earnedLP} LP</div>
      </div>
      {/* Traits */}
      {(c.traits || []).length > 0 && (
        <div style={{ width: '100%', maxWidth: 320, padding: '0 16px', marginTop: 6 }}>
          <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: '#607d8b', textTransform: 'uppercase', marginBottom: 4 }}>Rasgos Desarrollados</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {(c.traits || []).map(t => <TraitBadge key={t} traitId={t} size="small" />)}
          </div>
        </div>
      )}
      {/* NPC Arcs */}
      {completedArcs.length > 0 && (
        <div style={{ width: '100%', maxWidth: 320, padding: '0 16px', marginTop: 6 }}>
          <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: '#607d8b', textTransform: 'uppercase', marginBottom: 4 }}>Arcos Narrativos</div>
          {completedArcs.map(npc => (
            <div key={npc.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
              <span style={{ fontSize: 14 }}>{npc.i}</span>
              <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: '#e8eaf6' }}>{npc.n}</span>
              <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: npc.arc === 'ally' ? '#00e676' : npc.arc === 'rival' ? '#ff1744' : '#9c27b0', textTransform: 'uppercase' }}>{npc.arc}</span>
            </div>
          ))}
        </div>
      )}
      {/* Moments */}
      {(c.momentsTriggered || []).length > 0 && (
        <div style={{ width: '100%', maxWidth: 320, padding: '0 16px', marginTop: 6 }}>
          <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: '#607d8b', textTransform: 'uppercase', marginBottom: 4 }}>Momentos Estelares ({(c.momentsTriggered || []).length})</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {(c.momentsTriggered || []).map(id => (
              <span key={id} style={{ fontSize: 10, background: 'rgba(240,192,64,0.08)', border: '1px solid rgba(240,192,64,0.15)', borderRadius: 4, padding: '2px 6px', color: '#f0c040', fontFamily: "'Barlow Condensed'" }}>{id.replace(/_/g, ' ')}</span>
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
      <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 22, color: '#f0c040', textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 }}>Timeline</div>
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: '#607d8b', textAlign: 'center', marginBottom: 12 }}>{c.name} · {c.pos}</div>
      {/* NPC relationships */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: '#607d8b', textTransform: 'uppercase', marginBottom: 6 }}>Relaciones</div>
        {(c.cast || []).map(npc => (
          <RelationshipBar key={npc.id} npc={npc} rel={c.npcRelations?.[npc.id] ?? npc.rel} />
        ))}
      </div>
      {/* Season history */}
      <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: '#607d8b', textTransform: 'uppercase', marginBottom: 6 }}>Historial</div>
      {(c.history || []).length === 0 && <div style={{ fontFamily: "'Barlow'", fontSize: 12, color: '#455a64' }}>Aún no hay temporadas completadas.</div>}
      {(c.history || []).map((h, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontFamily: "'Oswald'", fontSize: 14, color: '#f0c040', width: 28 }}>T{h.season}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: '#e8eaf6' }}>{h.team}</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: '#607d8b' }}>{h.age} años · {h.goals} goles · Rating {h.rating}</div>
          </div>
        </div>
      ))}
      {/* Traits */}
      {(c.traits || []).length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: '#607d8b', textTransform: 'uppercase', marginBottom: 4 }}>Rasgos</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{(c.traits || []).map(t => <TraitBadge key={t} traitId={t} />)}</div>
        </div>
      )}
      <button onClick={() => setCareerScreen('cards')} style={{ fontFamily: "'Oswald'", fontSize: 12, padding: '8px 16px', border: '1px solid #607d8b', background: 'transparent', color: '#e8eaf6', borderRadius: 4, cursor: 'pointer', marginTop: 12, alignSelf: 'center' }}>Volver</button>
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
      <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 22, color: '#a78bfa', textTransform: 'uppercase', textAlign: 'center' }}>Legado de Leyenda</div>
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: '#607d8b', textAlign: 'center', marginBottom: 4 }}>Desbloquea bonos permanentes entre carreras</div>
      <div style={{ fontFamily: "'Oswald'", fontSize: 16, color: '#a78bfa', textAlign: 'center', marginBottom: 12 }}>{points} LP disponibles</div>

      {/* Stats summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
        {[{ l: 'Carreras', v: cgs?.totalCareers || 0 }, { l: 'Goles', v: cgs?.totalGoals || 0 }, { l: 'Traits', v: (cgs?.traitsDiscovered || []).length }].map((s, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 4, padding: '5px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 14, color: '#fff' }}>{s.v}</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: '#607d8b' }}>{s.l}</div>
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
          <div key={branch.branch} style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: "'Oswald'", fontSize: 13, color: '#f0c040', textTransform: 'uppercase', marginBottom: 4 }}>{branch.i} {branch.branch}</div>
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
          <div style={{ fontFamily: "'Oswald'", fontSize: 13, color: '#f0c040', textTransform: 'uppercase', marginBottom: 4 }}>Salón de Leyendas</div>
          {(cgs.hallOfLegends || []).slice(-5).reverse().map((h, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 4, padding: '6px 8px', marginBottom: 4 }}>
              <div style={{ fontFamily: "'Oswald'", fontSize: 12, color: '#e8eaf6' }}>{h.name} ({h.pos})</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: '#607d8b' }}>{h.seasons} temp · {h.goals} goles · Rating {h.avgRating} · +{h.legendPoints}LP</div>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => setCareerScreen('create')} style={{ fontFamily: "'Oswald'", fontSize: 12, padding: '8px 16px', border: '1px solid #607d8b', background: 'transparent', color: '#e8eaf6', borderRadius: 4, cursor: 'pointer', marginTop: 12, alignSelf: 'center' }}>Volver</button>
    </div>
  );
}