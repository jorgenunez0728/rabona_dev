import { useState, useEffect, useRef } from "react";
import { SFX, Crowd } from "@/game/audio";
import {
  COACHES, ASCENSION_MODS, ACHIEVEMENTS, STADIUMS, LEAGUES, RIVAL_NAMES, RIVAL_COACHES,
  NEMESIS, getNemesis, COPA_NAMES, initCopaState, CUTSCENES, EVENTS, TACTICS,
  PN, POS_ORDER, POS_COLORS, T, CARD_TIERS, TRAINING_OPTIONS, PERSONALITIES,
  MATCH_OBJECTIVES, BOARD_EVENTS, getBoardEvents, applyBoardEffect,
  genPlayer, rnd, pick, calcOvr, effectiveStats, effectiveOvr,
  avgStat, teamGKRating, teamPower, narrate, randomizeEvent,
  generateLivePosts, generateSocialPosts, getRivalKit, drawSprite,
  LEGENDS, CAREER_CAST, CAREER_TEAMS, ALL_CAREER_CARDS, CAREER_CARDS_MIGUEL,
  MATCH_CARDS, BAR_NAMES, BAR_ICONS, BAR_COLORS, CUP_RIVAL_NAMES, TRAITS,
  FN, LN, _usedNames, FORMATIONS, RELICS, getLevelUpChoices, applyRelicEffects,
  getRelicDraftOptions, STARTING_RELIC_PAIRS, NODE_TYPES, generateNodeChoice,
} from "@/game/data";
import {
  saveGame, loadGame, saveGlobalStats, loadGlobalStats, deleteSave,
} from "@/game/save";
import {
  CoachPortrait, NemesisPortrait, PosIcon, PlayerCard, PlayerDetailModal,
  CareerBars, ParticleSystem,
} from "@/game/components";

export default function Rabona() {
  const [screen, setScreen] = useState('loading');
  const [game, setGame] = useState({
    coach: null, roster: [], league: 0, matchNum: 0,
    table: [], captain: null, chemistry: 0, matchesTogether: 0, lastLineup: null, coins: 0,
    rivalMemory: {}, streak: 0, currentObjectives: [], trainedIds: [],
    formation: 'clasica', relics: [],
    careerStats: { wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0, matchesPlayed: 0, bestStreak: 0, scorers: {} },
  });
  const [pendingLevelUp, setPendingLevelUp] = useState(null); // { player, choices }
  const [match, setMatch] = useState({ ps: 0, rs: 0, minute: 0, speed: 2, running: false, rival: null, rivalPlayers: [], rivalCoach: null, ballX: .5, ballY: .5, possession: true, log: [], eventPopup: null });
  const [rewards, setRewards] = useState({ options: [], selected: null, stolen: null, xpGain: 0 });
  const [rewardsTab, setRewardsTab] = useState('summary');
  const [market, setMarket] = useState({ players: [], open: false });
  const [hasSave, setHasSave] = useState(false);
  const [globalStats, setGlobalStats] = useState({ totalRuns: 0, bestLeague: 0, bestLeagueName: '—', totalMatches: 0, totalWins: 0, totalGoals: 0, totalConceded: 0, bestStreak: 0, totalCoins: 0, hallOfFame: [], ascensionLevel: 0, achievements: [], allTimeScorers: {} });
  const [boardEvents, setBoardEvents] = useState([]);
  const [boardEventIdx, setBoardEventIdx] = useState(0);
  const [boardPhase, setBoardPhase] = useState('choose');
  const [boardSlideDir, setBoardSlideDir] = useState(null);
  const [boardResultData, setBoardResultData] = useState(null);
  const [matchType, setMatchType] = useState('league');
  const [detailPlayer, setDetailPlayer] = useState(null);
  const [pendingLeague, setPendingLeague] = useState(null);
  const [career, setCareer] = useState(null);
  const [careerScreen, setCareerScreen] = useState('create');
  const [transState, setTransState] = useState('in');

  function checkAchievements(gs) {
    const newAchs = [...(gs.achievements || [])];
    let changed = false;
    ACHIEVEMENTS.forEach(a => { if (!newAchs.includes(a.id) && a.check(gs)) { newAchs.push(a.id); changed = true; } });
    return changed ? { ...gs, achievements: newAchs } : gs;
  }
  function isCoachUnlocked(coach) { if (coach.unlocked) return true; if (coach.unlockCheck) return coach.unlockCheck(globalStats); return false; }

  function navigateTo(newScreen) {
    SFX.play('click');
    setTransState('out');
    setTimeout(() => { setScreen(newScreen); setTransState('in'); }, 180);
  }
  const go = (s) => s === 'match' ? (SFX.play('whistle'), setScreen(s)) : navigateTo(s);
  function autoSave(gameState) { saveGame(gameState, 'table'); setHasSave(true); }

  useEffect(() => {
    const data = loadGame();
    const gs = loadGlobalStats();
    if (gs) setGlobalStats(gs);
    if (data) { setGame(data.game); setHasSave(true); }
    setScreen('title');
  }, []);

  function handleDeleteSave() { deleteSave(); setHasSave(false); }

  function openMarket() {
    const lg = LEAGUES[game.league];
    const players = ['GK', 'DEF', 'MID', 'FWD'].map(pos => {
      const p = genPlayer(pos, lg.lv[0], lg.lv[1]);
      p.price = Math.floor(calcOvr(p) * 3 + rnd(5, 20) + (pos === 'GK' ? 5 : 0));
      return p;
    });
    const hof = globalStats.hallOfFame || [];
    if (hof.length > 0 && Math.random() < 0.15) {
      const legend = pick(hof);
      const lp = genPlayer(legend.pos || 'MID', lg.lv[0] + 1, lg.lv[1] + 2);
      lp.name = '⭐ ' + legend.name; lp.atk = legend.atk || lp.atk; lp.def = legend.def || lp.def;
      lp.legendary = true; lp.story = `Leyenda del run #${legend.run}.`;
      lp.price = Math.floor(calcOvr(lp) * 4 + 30);
      players.push(lp);
    }
    setMarket({ players, open: true }); go('market');
  }

  // Career helpers
  function initCareer(name, pos) {
    return { name, pos, age: 16, season: 1, bars: { rend: 50, fis: 55, rel: 50, fam: 20, men: 55 }, team: 0, matchNum: 0, matchesThisSeason: 0, totalMatches: 0, goals: 0, ratings: [], cardQueue: [], seasonGoals: 0, cast: JSON.parse(JSON.stringify(CAREER_CAST)), history: [], retired: false, retireReason: '' };
  }
  function getCareerCards(c) {
    const numCards = Math.min(5, 2 + Math.floor((c.bars.fam || 0) / 30));
    const eligible = ALL_CAREER_CARDS.filter(card => { if (card.minAge && c.age < card.minAge) return false; return true; });
    const pool = [];
    const castCards = eligible.filter(card => card.cast);
    if (castCards.length > 0) pool.push(castCards[Math.floor(Math.random() * castCards.length)]);
    const shuffled = [...eligible.filter(card => !card.cast)].sort(() => Math.random() - 0.5);
    for (let i = 0; pool.length < numCards && i < shuffled.length; i++) pool.push(shuffled[i]);
    if (c.season % 3 === 0) { const dm = CAREER_CARDS_MIGUEL.filter(card => !card.minAge || c.age >= card.minAge); if (dm.length) pool.push(dm[Math.floor(Math.random() * dm.length)]); }
    return pool.sort(() => Math.random() - 0.5);
  }
  function getMatchCards(pos) { const cards = MATCH_CARDS[pos] || MATCH_CARDS.MID; return [...cards].sort(() => Math.random() - 0.5).slice(0, 4 + Math.floor(Math.random() * 2)); }
  function applyBarEffects(c, effects) {
    const b = { ...c.bars };
    if (effects.rend) b.rend = Math.max(0, Math.min(100, b.rend + effects.rend));
    if (effects.fis) b.fis = Math.max(0, Math.min(100, b.fis + effects.fis));
    if (effects.rel) b.rel = Math.max(0, Math.min(100, b.rel + effects.rel));
    if (effects.fam) b.fam = Math.max(0, Math.min(100, b.fam + effects.fam));
    if (effects.men) b.men = Math.max(0, Math.min(100, b.men + effects.men));
    return b;
  }
  function checkCareerEnd(c) {
    if (c.bars.fis <= 0) return 'Lesión grave. Tu cuerpo dijo basta.';
    if (c.bars.rend <= 0) return 'Sin rendimiento. Tu carrera se apagó.';
    if (c.bars.rel <= 0) return 'Nadie te quiere. Rescisión.';
    if (c.bars.men <= 0) return '"El fútbol ya no me llena." Retiro por burnout.';
    if (c.bars.fam >= 100) return 'La fama te consumió.';
    if (c.age >= 36) return 'A los 36, incluso las leyendas cuelgan los botines.';
    return null;
  }
  function applyAging(c) {
    const b = { ...c.bars };
    if (c.age <= 22) b.fis = Math.min(100, b.fis + 3);
    else if (c.age >= 29 && c.age <= 34) { b.fis = Math.max(0, b.fis - 5); b.rend = Math.max(0, b.rend - 3); b.men = Math.min(100, b.men + 2); }
    else if (c.age >= 35) { b.fis = Math.max(0, b.fis - 8); b.rend = Math.max(0, b.rend - 5); }
    if (b.fam > 70) b.men = Math.max(0, b.men - 2);
    if (b.men < 30) b.rend = Math.max(0, b.rend - 2);
    return b;
  }

  // ─── SCREENS ───

  const LoadingScreen = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: T.bg, gap: 12 }}>
      <div className="fw-float" style={{ fontSize: 48 }}>⚽</div>
      <div className="fw-pulse" style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 18, color: T.gold, textTransform: 'uppercase', letterSpacing: 3 }}>Cargando</div>
    </div>
  );

  const TitleScreen = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14, textAlign: 'center', background: 'radial-gradient(ellipse at 50% 70%,#15250e 0%,#0b1120 70%)', position: 'relative', overflow: 'hidden' }}>
      <div className="fw-anim-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 'clamp(36px,12vw,72px)', color: T.gold, letterSpacing: 4, textShadow: `0 0 40px ${T.gold}40` }}>RABONA</div>
        <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 500, fontSize: 'clamp(13px,3.5vw,18px)', color: '#c8a84e', letterSpacing: 4, textTransform: 'uppercase' }}>Del Barrio a las Estrellas</div>
      </div>
      <div className="fw-anim-2" style={{ width: 60, height: 2, background: `linear-gradient(90deg,transparent,${T.gold},transparent)`, borderRadius: 1 }} />
      <div className="fw-anim-3" style={{ fontSize: 'clamp(11px,2.5vw,14px)', color: '#455a64', maxWidth: 300, lineHeight: 1.5, padding: '0 20px' }}>Arma tu equipo en una cancha llanera. Llévalo hasta conquistar la galaxia.</div>
      <div className="fw-anim-4" style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', marginTop: 4 }}>
        {hasSave && <button className="fw-btn fw-btn-green" onClick={() => { SFX.play('click'); go('table'); }}>▶ Continuar Carrera</button>}
        <button className={`fw-btn ${hasSave ? 'fw-btn-outline' : 'fw-btn-primary'}`} onClick={() => { if (hasSave && !confirm('¿Borrar partida guardada?')) return; handleDeleteSave(); go('tutorial'); }} style={hasSave ? { fontSize: 12, padding: '8px 20px', color: T.tx2 } : {}}>Nueva Carrera</button>
      </div>
      <div className="fw-anim-5" style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {(globalStats.totalRuns || 0) > 0 && <button className="fw-btn fw-btn-outline" onClick={() => go('stats')} style={{ fontSize: 12, padding: '6px 16px', color: T.purple }}>📖 Compendio</button>}
        <button className="fw-btn fw-btn-outline" onClick={() => { setCareer(null); setCareerScreen('create'); go('career'); }} style={{ fontSize: 12, padding: '6px 16px', color: T.win }}>🏃 Carrera Jugador</button>
      </div>
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: '#333', marginTop: 8 }}>Rabona v3.0 · Base44</div>
    </div>
  );

  const TutorialScreen = () => {
    const [step, setStep] = useState(0);
    const wrap = (children) => <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, background: 'radial-gradient(ellipse at 50% 60%,#1a2a10 0%,#0b1120 70%)', padding: 16, textAlign: 'center', overflow: 'auto' }}>{children}</div>;
    const steps = [
      () => wrap(<>
        <CoachPortrait id="miguel" size={48} />
        <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 26, color: T.gold, textTransform: 'uppercase' }}>Don Miguel</div>
        <div style={{ fontFamily: "'Barlow'", fontSize: 16, color: T.tx, maxWidth: 360, lineHeight: 1.6 }}>"Mijo, ¿te conté del torneo del 94? Teníamos un equipo de barrio... puros chavos de la colonia. Nadie nos daba un peso... Pero tenían algo que el dinero no compra: corazón."</div>
        <button className="fw-btn fw-btn-primary" onClick={() => { SFX.play('click'); setStep(1); }}>Continuar</button>
      </>),
      () => wrap(<>
        <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 26, color: T.gold, textTransform: 'uppercase' }}>🎮 Cómo Funciona</div>
        <div style={{ fontFamily: "'Barlow'", fontSize: 16, color: T.tx, maxWidth: 360, lineHeight: 1.6 }}>Cada partida es un "run" — una carrera completa desde el Barrio hasta las Estrellas. Pierde y empieza de nuevo. Gana y desbloquea más.</div>
        <button className="fw-btn fw-btn-primary" onClick={() => { SFX.play('click'); go('coach'); }}>Elegir Entrenador →</button>
      </>),
    ];
    return steps[step] ? steps[step]() : null;
  };

  const CoachScreen = () => {
    const maxAsc = globalStats.ascensionLevel || 0;
    const [selectedCoach, setSelectedCoach] = useState(null);
    const [selectedAsc, setSelectedAsc] = useState(maxAsc);

    function startRun(coach) {
      _usedNames.clear();
      const ascLevel = Math.min(selectedAsc, maxAsc);
      const ascMods = ASCENSION_MODS[Math.min(ascLevel, ASCENSION_MODS.length - 1)].mods;
      const isAlien = coach.fx === 'alien';
      // Fut 7: 7 starters (GK + 6), 3 reserves = 10 total
      const starterPositions = isAlien ? ['DEF','DEF','DEF','MID','FWD','FWD','FWD'] : ['GK','DEF','DEF','MID','MID','FWD','FWD'];
      const reservePositions = ['DEF','MID','FWD'];
      const roster = [
        ...starterPositions.map(p => { const pl = genPlayer(p, 1, 3); pl.role = 'st'; if (coach.fx === 'boost') pl.lv++; return pl; }),
        ...reservePositions.map(p => { const pl = genPlayer(p, 1, 2); pl.role = 'rs'; return pl; }),
      ];
      const rns = RIVAL_NAMES[0];
      const table = [{ name: 'Halcones', you: true, w: 0, d: 0, l: 0, gf: 0, ga: 0 }, ...rns.map(n => ({ name: n, you: false, w: 0, d: 0, l: 0, gf: 0, ga: 0 }))];
      let startCoins = 50;
      if (coach.fx === 'cheap') startCoins = 80;
      if (isAlien) startCoins = 100;
      if (ascMods.includes('poor_start')) startCoins = Math.max(10, startCoins - 20);
      const newG = { ...game, roster, captain: roster[0].id, table, league: 0, matchNum: 0, coins: startCoins, coach, ascension: ascLevel, formation: 'clasica', relics: [], careerStats: { wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0, matchesPlayed: 0, bestStreak: 0, scorers: {} }, rivalMemory: {}, streak: 0, trainedIds: [] };
      setGame(newG); autoSave(newG); setHasSave(true); go('table');
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: `linear-gradient(180deg,${T.bg},#0f1730)` }}>
        <div style={{ padding: '14px 16px 8px', textAlign: 'center' }}>
          <div className="fw-anim-1" style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 24, color: '#fff', textTransform: 'uppercase' }}>Elige Entrenador</div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '0 14px 14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 420, margin: '0 auto' }}>
            {COACHES.map((c, ci) => {
              const unlocked = isCoachUnlocked(c);
              const isOpen = selectedCoach === c.id;
              return (
                <div key={c.id} className={`fw-anim-${Math.min(ci + 1, 5)}`} style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${isOpen ? T.gold + '40' : !unlocked ? T.tx3 + '20' : T.border}`, background: isOpen ? 'linear-gradient(145deg,#2a2510,#3a3215)' : !unlocked ? 'rgba(20,20,30,0.5)' : 'linear-gradient(145deg,#141e3a,#1a2744)' }}>
                  <div onClick={() => { if (unlocked) setSelectedCoach(isOpen ? null : c.id); }} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', cursor: unlocked ? 'pointer' : 'not-allowed', opacity: unlocked ? 1 : 0.45 }}>
                    <div style={{ minWidth: 34 }}>{unlocked ? <CoachPortrait id={c.id} size={34} /> : <span style={{ fontSize: 28 }}>🔒</span>}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, color: unlocked ? T.tx : T.tx3, textTransform: 'uppercase' }}>{c.n}</div>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: unlocked ? T.win : T.tx3 }}>{unlocked ? `✦ ${c.a}` : `🔒 ${c.unlockReq}`}</div>
                    </div>
                    <div style={{ fontFamily: "'Oswald'", fontSize: 10, color: T.tx3 }}>{isOpen ? '▲' : '▼'}</div>
                  </div>
                  {isOpen && unlocked && (
                    <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${T.gold}15` }}>
                      <div style={{ fontFamily: "'Barlow'", fontSize: 12, color: T.tx2, fontStyle: 'italic', lineHeight: 1.4, margin: '8px 0' }}>"{c.story}"</div>
                      {maxAsc > 0 && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: T.gold, textTransform: 'uppercase', marginBottom: 4 }}>⬆ Dificultad</div>
                          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                            {ASCENSION_MODS.filter(a => a.lv <= maxAsc).map(a => (
                              <div key={a.lv} onClick={() => setSelectedAsc(a.lv)} style={{ padding: '4px 10px', borderRadius: 4, cursor: 'pointer', background: selectedAsc === a.lv ? `${T.gold}20` : T.bg2, border: `1px solid ${selectedAsc === a.lv ? T.gold : T.border}`, fontFamily: "'Oswald'", fontSize: 11, color: selectedAsc === a.lv ? T.gold : T.tx3 }}>{a.lv}{a.lv === maxAsc && <span style={{ fontSize: 8, color: T.win, marginLeft: 2 }}>MAX</span>}</div>
                            ))}
                          </div>
                          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: T.tx2, marginTop: 4 }}>{ASCENSION_MODS[selectedAsc]?.d}</div>
                        </div>
                      )}
                      <button className="fw-btn fw-btn-primary" onClick={() => startRun(c)} style={{ width: '100%', fontSize: 13 }}>⚽ Comenzar{selectedAsc > 0 ? ` · Asc ${selectedAsc}` : ''}</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const TableScreen = () => {
    const lg = LEAGUES[game.league];
    const done = game.matchNum >= lg.m;
    const sorted = [...game.table].sort((a, b) => (b.w * 3 + b.d) - (a.w * 3 + a.d) || (b.gf - b.ga) - (a.gf - a.ga));
    const myPos = sorted.findIndex(t => t.you);
    const starters = game.roster.filter(p => p.role === 'st').sort((a, b) => POS_ORDER[a.pos] - POS_ORDER[b.pos]);
    const currentFormation = FORMATIONS.find(f => f.id === game.formation) || FORMATIONS[1];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg }}>
        <div style={{ flexShrink: 0, padding: '8px 10px 6px' }}>
          <div style={{ maxWidth: 420, margin: '0 auto', background: T.bg1, borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.border}` }}>
            <div style={{ background: 'linear-gradient(135deg,#141e3a,#1a2844)', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 14, color: '#fff', textTransform: 'uppercase' }}>{lg.i} {lg.n}</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx2 }}>💰{game.coins} · J{game.matchNum}/{lg.m}</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Barlow Condensed'" }}>
              <thead><tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {['#', 'Equipo', 'G', 'E', 'P', 'DG', 'PTS'].map(h => (<th key={h} style={{ fontWeight: 600, fontSize: 9, color: T.tx3, padding: '3px 2px', textAlign: h === 'Equipo' ? 'left' : 'center', textTransform: 'uppercase' }}>{h}</th>))}
              </tr></thead>
              <tbody>{sorted.map((t, i) => {
                const pts = t.w * 3 + t.d, dg = t.gf - t.ga;
                return (
                  <tr key={t.name} style={{ background: t.you ? 'rgba(41,121,255,0.05)' : 'transparent', borderBottom: `1px solid rgba(255,255,255,0.02)` }}>
                    <td style={{ padding: '3px 2px', textAlign: 'center', fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, color: i < 2 ? T.win : T.tx3 }}>{i + 1}</td>
                    <td style={{ padding: '3px 2px', fontWeight: t.you ? 700 : 500, color: t.you ? T.info : T.tx, fontSize: 12 }}>{t.you ? '⭐' : ''}{t.name}</td>
                    <td style={{ padding: '3px 2px', textAlign: 'center', fontSize: 11, color: T.tx3 }}>{t.w}</td>
                    <td style={{ padding: '3px 2px', textAlign: 'center', fontSize: 11, color: T.tx3 }}>{t.d}</td>
                    <td style={{ padding: '3px 2px', textAlign: 'center', fontSize: 11, color: T.tx3 }}>{t.l}</td>
                    <td style={{ padding: '3px 2px', textAlign: 'center', fontSize: 11, color: dg > 0 ? T.win : dg < 0 ? T.lose : T.tx3 }}>{dg > 0 ? '+' : ''}{dg}</td>
                    <td style={{ padding: '3px 2px', textAlign: 'center', fontFamily: "'Oswald'", fontWeight: 700, fontSize: 13, color: T.gold }}>{pts}</td>
                  </tr>
                );
              })}</tbody>
            </table>
            <div style={{ padding: '4px 10px', background: `${T.purple}08`, borderTop: `1px solid ${T.purple}15`, fontSize: 10, color: T.purple, textAlign: 'center' }}>
              {done ? (myPos < 2 ? '🎉 ¡Clasificado!' : '💀 ELIMINADOS') : `Top 2 ascienden · ${lg.m - game.matchNum} restantes`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 420, margin: '6px auto 0' }}>
            <button onClick={() => go('roster')} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, padding: '7px 14px', border: `1.5px solid ${starters.length < 6 ? T.lose : T.tx3}`, background: starters.length < 6 ? `${T.lose}10` : 'transparent', color: starters.length < 6 ? T.lose : T.tx, borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase' }}>{starters.length < 6 ? '⚠ ' : ''}Roster</button>
            <button onClick={() => go('training')} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, padding: '7px 14px', border: `1.5px solid ${T.win}`, background: `${T.win}0F`, color: T.win, borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase' }}>🏋️ Entrenar</button>
            <button onClick={openMarket} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, padding: '7px 14px', border: `1.5px solid ${T.gold}`, background: `${T.gold}0F`, color: T.gold, borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase' }}>🏪 Mercado</button>
            <button onClick={() => {
              if (starters.length < 6 && !done) return;
              if (done) {
                if (myPos < 2) { const nL = game.league + 1; if (nL >= LEAGUES.length) { go('champion'); return; } setPendingLeague(nL); go('ascension'); }
                else go('death');
              } else {
                const evs = getBoardEvents(game);
                if (evs.length > 0) { setBoardEvents(evs); setBoardEventIdx(0); setBoardPhase('choose'); setBoardResultData(null); go('boardEvent'); }
                else go('prematch');
              }
            }} style={{
              fontFamily: "'Oswald'", fontWeight: 600, fontSize: 12, padding: '8px 20px', border: 'none',
              background: (starters.length < 6 && !done) ? '#333' : done ? (myPos < 2 ? 'linear-gradient(135deg,#d4a017,#f0c040)' : 'linear-gradient(135deg,#c62828,#ff1744)') : 'linear-gradient(135deg,#00c853,#00e676)',
              color: (starters.length < 6 && !done) ? '#666' : done && myPos >= 2 ? '#fff' : '#0b1120',
              clipPath: 'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)',
              cursor: (starters.length < 6 && !done) ? 'not-allowed' : 'pointer', textTransform: 'uppercase',
              opacity: (starters.length < 6 && !done) ? 0.4 : 1,
            }}>
              {starters.length < 6 && !done ? `⚠ ${starters.length}/6` : done ? (myPos < 2 ? 'Ascender' : '💀 Resumen') : 'Siguiente'}
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '6px 10px 16px' }}>
          <div style={{ maxWidth: 420, margin: '0 auto' }}>
            {game.coach && (
              <div style={{ background: T.bg1, borderRadius: 8, padding: 10, border: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 12, color: T.tx }}>{game.coach?.i} {game.coach?.n}</div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.win }}>✦ {game.coach?.a}</div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.info, marginTop: 1 }}>{currentFormation.i} {currentFormation.n} <span style={{ color: T.tx3 }}>· {currentFormation.tag}</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx2 }}>🔗 Química: <span style={{ color: T.gold, fontFamily: "'Oswald'", fontWeight: 700 }}>{game.chemistry}</span></div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: game.streak > 0 ? T.win : game.streak < 0 ? T.lose : T.tx3 }}>{game.streak > 0 ? `🔥 Racha: ${game.streak}` : game.streak < 0 ? `💀 ${Math.abs(game.streak)}` : '—'}</div>
                    {(game.relics||[]).length > 0 && (
                      <div style={{ display: 'flex', gap: 3, marginTop: 3, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {(game.relics||[]).map(rid => { const r = RELICS.find(x=>x.id===rid); return r ? (
                          <div key={rid} title={r.d} style={{ display:'flex', alignItems:'center', gap:2, background:`rgba(168,85,247,0.1)`, border:`1px solid rgba(168,85,247,0.2)`, borderRadius:4, padding:'1px 5px', fontSize:9 }}>
                            <span>{r.i}</span><span style={{ fontFamily:"'Oswald'", fontSize:8, color:T.purple }}>{r.n.split(' ').slice(0,2).join(' ')}</span>
                          </div>
                        ) : null; })}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                  {starters.map(p => (
                    <div key={p.id} onClick={() => setDetailPlayer(p)} style={{ background: `${POS_COLORS[p.pos]}10`, border: `1px solid ${POS_COLORS[p.pos]}25`, borderRadius: 4, padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 3, cursor: 'pointer' }}>
                      <span style={{ fontFamily: "'Oswald'", fontSize: 8, color: POS_COLORS[p.pos] }}>{PN[p.pos]}</span>
                      <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: T.tx }}>{p.name.split(' ').pop()}</span>
                      <span style={{ fontFamily: "'Oswald'", fontSize: 10, color: T.gold }}>{effectiveOvr(p)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {game.copa?.active && !game.copa?.eliminated && (
              <div style={{ background: T.bg1, borderRadius: 8, padding: 10, border: `1px solid ${T.gold}20`, marginTop: 6 }}>
                <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 12, color: T.gold, textTransform: 'uppercase', marginBottom: 2 }}>🏆 {COPA_NAMES[Math.min(game.league, 6)]}</div>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: T.lose, marginBottom: 6 }}>💀 Perder en Copa = Fin de la Carrera</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(game.copa.bracket || []).map((r, i) => (
                    <div key={i} style={{ flex: 1, background: r.beaten ? `${T.win}10` : i === game.copa.round ? `${T.gold}10` : T.bg2, border: `1px solid ${r.beaten ? T.win + '30' : i === game.copa.round ? T.gold + '30' : T.border}`, borderRadius: 4, padding: '4px 6px', textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Oswald'", fontSize: 8, color: T.tx3 }}>{i === 0 ? 'Cuartos' : i === 1 ? 'Semi' : 'Final'}</div>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: r.beaten ? T.win : i === game.copa.round ? T.gold : T.tx3 }}>{r.beaten ? '✓' : r.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const RosterScreen = () => {
    const starters = game.roster.filter(p => p.role === 'st').sort((a, b) => POS_ORDER[a.pos] - POS_ORDER[b.pos]);
    const reserves = game.roster.filter(p => p.role === 'rs').sort((a, b) => POS_ORDER[a.pos] - POS_ORDER[b.pos]);

    function handleAction(action, player) {
      setGame(g => {
        const roster = g.roster.map(p => ({ ...p }));
        const p = roster.find(x => x.id === player.id);
        if (!p) return g;
        if (action === 'promote' && roster.filter(x => x.role === 'st').length < 6) p.role = 'st';
        else if (action === 'demote') { p.role = 'rs'; p.tempGK = false; }
        else if (action === 'captain') return { ...g, captain: player.id, roster };
        else if (action === 'tempGK') { roster.forEach(x => { if (x.id !== player.id) x.tempGK = false; }); p.tempGK = !p.tempGK; }
        return { ...g, roster };
      });
    }

    function optimizeRoster() {
      setGame(g => {
        const formation = FORMATIONS.find(f => f.id === g.formation) || FORMATIONS[1];
        const roster = [...g.roster];
        roster.forEach(p => p.role = 'rs');
        const sorted = [...roster].sort((a, b) => calcOvr(b) - calcOvr(a));
        const picked = [];
        for (const pos of formation.slots) {
          const best = sorted.find(p => p.pos === pos && !picked.includes(p));
          if (best) { best.role = 'st'; picked.push(best); }
        }
        // Fill remaining slots with best available if not enough positional matches
        if (picked.length < 6) sorted.filter(p => p.role === 'rs').slice(0, 6 - picked.length).forEach(p => { p.role = 'st'; });
        return { ...g, roster };
      });
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg }}>
        <div style={{ flexShrink: 0, padding: '8px 10px', background: T.bg, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', gap: 4, maxWidth: 420, margin: '4px auto 0', flexWrap: 'wrap' }}>
            <button className="fw-btn fw-btn-outline" onClick={optimizeRoster} style={{ flex: 1, fontSize: 10, padding: '5px 8px', color: T.purple }}>⚡ Optimizar</button>
            <button className="fw-btn fw-btn-outline" onClick={() => go('table')} style={{ fontSize: 10, padding: '5px 12px', color: T.tx2 }}>Tabla</button>
            <button className={`fw-btn ${starters.length === 6 ? 'fw-btn-green' : 'fw-btn-outline'}`} onClick={() => starters.length === 6 && go('prematch')} disabled={starters.length < 6} style={{ fontSize: 10, padding: '5px 12px' }}>Previa</button>
          </div>
          {starters.length < 6 && <div style={{ fontSize: 10, color: T.lose, textAlign: 'center', marginTop: 3 }}>⚠ Necesitas 6 titulares ({starters.length}/6)</div>}
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '6px 10px 16px' }}>
          <div style={{ maxWidth: 420, margin: '0 auto' }}>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, color: T.win, textTransform: 'uppercase', padding: '4px 8px', borderLeft: `3px solid ${T.win}`, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Titulares</span><span style={{ color: T.tx3 }}>{starters.length}/6</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{starters.map(p => (<PlayerCard key={p.id} player={p} isCaptain={p.id === game.captain} onAction={handleAction} onDetail={setDetailPlayer} compact />))}</div>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, color: T.tx3, textTransform: 'uppercase', padding: '6px 8px 4px', borderLeft: '3px solid #455a64', display: 'flex', justifyContent: 'space-between', marginTop: 8 }}><span>Reserva</span><span>{reserves.length}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{reserves.map(p => (<PlayerCard key={p.id} player={p} isCaptain={p.id === game.captain} onAction={handleAction} onDetail={setDetailPlayer} compact />))}</div>
          </div>
        </div>
      </div>
    );
  };

  const MarketScreen = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 14, gap: 8, height: '100%', overflow: 'auto', background: T.bg }}>
      <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 24, color: '#fff', textTransform: 'uppercase' }}>🏪 Mercado</div>
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 14, color: '#f0c040' }}>💰 {game.coins} monedas</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', maxWidth: 400 }}>
        {market.players.map((p, i) => {
          const canBuy = game.coins >= p.price && game.roster.length < 12;
          return (
            <div key={i} style={{ background: 'linear-gradient(135deg,rgba(20,30,58,0.95),rgba(26,39,68,0.95))', border: `1px solid rgba(255,255,255,0.06)`, borderLeft: `4px solid ${POS_COLORS[p.pos]}`, borderRadius: 6, padding: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 14, color: T.tx }}>{p.pos === 'GK' ? '🧤 ' : ''}{p.name}</div>
                <div style={{ fontSize: 10, color: T.purple }}>✦ {p.trait.n} · {PN[p.pos]}</div>
                <div style={{ display: 'flex', gap: 5, fontSize: 11, fontFamily: "'Barlow Condensed'", fontWeight: 600, marginTop: 2 }}>
                  <span style={{ color: T.lose }}>⚔{p.atk}</span><span style={{ color: T.info }}>🛡{p.def}</span><span style={{ color: T.win }}>⚡{p.spd}</span>
                  {p.pos === 'GK' && <span style={{ color: '#ffc107' }}>🧤{p.sav}</span>}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 20, color: T.gold }}>{calcOvr(p)}</div>
                <button onClick={() => { if (!canBuy) return; SFX.play('reward'); p.role = 'rs'; setGame(g => ({ ...g, roster: [...g.roster, p], coins: g.coins - p.price })); setMarket(m => ({ ...m, players: m.players.filter((_, j) => j !== i) })); }} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 10, padding: '4px 12px', border: 'none', background: canBuy ? 'linear-gradient(135deg,#d4a017,#f0c040)' : '#333', color: canBuy ? '#1a1a2e' : '#666', cursor: canBuy ? 'pointer' : 'not-allowed', borderRadius: 3, marginTop: 4 }}>💰 {p.price}</button>
              </div>
            </div>
          );
        })}
        {game.roster.length >= 12 && <div style={{ fontSize: 12, color: '#ff1744', textAlign: 'center' }}>Roster lleno (12/12).</div>}
      </div>
      <button onClick={() => go('table')} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 12, padding: '8px 16px', border: '1.5px solid #607d8b', background: 'transparent', color: '#e8eaf6', borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase' }}>Volver</button>
    </div>
  );

  const TrainingScreen = () => {
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
  };

  const BoardEventScreen = () => {
    const ev = boardEvents[boardEventIdx];
    const phase = boardPhase;
    if (!ev) { setTimeout(() => go('prematch'), 50); return null; }

    function previewEffects(opt) {
      const parts = [];
      if (opt?.e?.coins > 0) parts.push({ t: `+${opt.e.coins} 💰`, c: T.win });
      if (opt?.e?.coins < 0) parts.push({ t: `${opt.e.coins} 💰`, c: T.lose });
      if (opt?.e?.chem > 0) parts.push({ t: `+${opt.e.chem} 🔗`, c: T.win });
      if (opt?.e?.chem < 0) parts.push({ t: `${opt.e.chem} 🔗`, c: T.lose });
      const f = opt?.fx;
      if (f === 'startCopa') parts.push({ t: '🏆 Inicia Copa', c: T.gold });
      if (f === 'sellWorstReserve') parts.push({ t: '📤 Vende reserva', c: T.draw });
      if (f === 'boostRandom') parts.push({ t: '📈 +stats titular', c: T.win });
      if (f === 'fatigueAll5') parts.push({ t: '😓 +fatiga todos', c: T.lose });
      return parts;
    }

    function choose(option) {
      if (phase !== 'choose') return;
      const chosen = ev[option]; if (!chosen) return;
      SFX.play('click'); setBoardPhase('sliding'); setBoardSlideDir(option === 'a' ? 'left' : 'right');
      const effects = previewEffects(chosen);
      setTimeout(() => {
        setGame(g => applyBoardEffect(g, chosen.e || {}, chosen.fx));
        setBoardSlideDir(null);
        setBoardResultData({ label: chosen.l, effects, narrative: `Elegiste: "${chosen.l}"` });
        setBoardPhase('result');
      }, 400);
    }

    function advance() {
      setBoardPhase('choose'); setBoardResultData(null);
      if (boardEventIdx + 1 < boardEvents.length) setBoardEventIdx(boardEventIdx + 1);
      else { setBoardEvents([]); setBoardEventIdx(0); go('prematch'); }
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <div style={{ fontFamily: "'Oswald'", fontSize: 10, color: T.tx3, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Entre Jornadas · {boardEventIdx + 1}/{boardEvents.length}</div>
        {phase === 'result' && boardResultData && (
          <div style={{ width: '100%', maxWidth: 360, background: 'linear-gradient(145deg,#141e3a,#1a2744)', border: `1px solid ${T.gold}25`, borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>📋</div>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 16, color: T.tx, marginBottom: 4 }}>"{boardResultData.label}"</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginBottom: 12 }}>
              {boardResultData.effects.map((e, i) => (<span key={i} style={{ fontFamily: "'Oswald'", fontSize: 12, color: e.c, background: `${e.c}12`, padding: '3px 10px', borderRadius: 10, border: `1px solid ${e.c}25` }}>{e.t}</span>))}
            </div>
            <button onClick={advance} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, padding: '10px 32px', border: 'none', background: `linear-gradient(135deg,${T.accent},#00e676)`, color: T.bg, borderRadius: 6, cursor: 'pointer', textTransform: 'uppercase' }}>Continuar</button>
          </div>
        )}
        {phase !== 'result' && (
          <div style={{ width: '100%', maxWidth: 360, background: 'linear-gradient(145deg,#141e3a,#1a2744)', border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, textAlign: 'center', transform: boardSlideDir === 'left' ? 'translateX(-120%) rotate(-8deg)' : boardSlideDir === 'right' ? 'translateX(120%) rotate(8deg)' : 'translateX(0)', opacity: boardSlideDir ? 0 : 1, transition: 'transform 0.35s ease, opacity 0.3s ease' }}>
            <div style={{ fontSize: 36, marginBottom: 4 }}>{ev.who.split(' ')[0]}</div>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, color: T.gold, textTransform: 'uppercase' }}>{ev.who}</div>
            <div style={{ fontFamily: "'Barlow'", fontSize: 15, color: T.tx, lineHeight: 1.5, margin: '12px 0', minHeight: 50 }}>{ev.text}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button onClick={() => choose('a')} disabled={phase !== 'choose'} style={{ width: '100%', padding: '12px', background: `${T.win}08`, border: `1.5px solid ${T.win}30`, borderRadius: 8, cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, color: T.win }}>{ev.a.l}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>{previewEffects(ev.a).map((p, i) => (<span key={i} style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: p.c, background: `${p.c}10`, padding: '1px 6px', borderRadius: 6 }}>{p.t}</span>))}</div>
              </button>
              {ev.b && (
                <button onClick={() => choose('b')} disabled={phase !== 'choose'} style={{ width: '100%', padding: '12px', background: `${T.lose}08`, border: `1.5px solid ${T.lose}30`, borderRadius: 8, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, color: T.lose }}>{ev.b.l}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>{previewEffects(ev.b).map((p, i) => (<span key={i} style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: p.c, background: `${p.c}10`, padding: '1px 6px', borderRadius: 6 }}>{p.t}</span>))}</div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const PrematchScreen = () => {
    const lg = LEAGUES[game.league], st = STADIUMS[game.league], rns = RIVAL_NAMES[game.league] || RIVAL_NAMES[0];
    const nem = getNemesis(game.coach?.id);
    const isNemesisMatch = matchType === 'nemesis';
    const isCopaMatch = matchType === 'copa';
    const copa = game.copa;
    const rivalName = isCopaMatch ? (copa?.bracket[copa.round]?.name || 'Copa FC') : isNemesisMatch ? nem.n : rns[game.matchNum % rns.length];
    const rpRef = useRef(null), rcRef = useRef(null), objRef = useRef(null);
    const currentFormation = FORMATIONS.find(f => f.id === game.formation) || FORMATIONS[1];

    if (!rpRef.current) {
      const ascLv = game.ascension || 0;
      const ascMods = ASCENSION_MODS[Math.min(ascLv, ASCENSION_MODS.length - 1)].mods;
      const rlvBonus = ascMods.includes('rival_lv_up') ? 1 : 0;
      // Rival also has 6 outfield + GK = 7
      rpRef.current = ['GK','DEF','DEF','MID','MID','FWD','FWD'].map(p => {
        const rp = genPlayer(p, Math.max(1, lg.rb - 2 + rlvBonus), lg.rb + 2 + rlvBonus);
        if (ascMods.includes('killer_fwd') && p === 'FWD') rp.atk += 5;
        if (isNemesisMatch && nem.boost) { rp.atk += (nem.boost.atk || 0); rp.def += (nem.boost.def || 0); rp.spd += (nem.boost.spd || 0); }
        if (isCopaMatch) { rp.atk += 1; rp.def += 1; }
        return rp;
      });
      rcRef.current = isNemesisMatch ? { n: nem.n, i: nem.i, a: nem.a } : pick(RIVAL_COACHES);
      objRef.current = [...MATCH_OBJECTIVES].sort(() => Math.random() - .5).slice(0, 2);
    }

    const starters = game.roster.filter(p => p.role === 'st');
    const tp = teamPower(starters, currentFormation?.mods), rtp = teamPower(rpRef.current);
    const injuredStarters = starters.filter(p => p.injuredFor > 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto', background: T.bg }}>
        <div style={{ background: isNemesisMatch ? 'linear-gradient(135deg,#4a148c,#880e4f)' : isCopaMatch ? 'linear-gradient(135deg,#f9a825,#e65100)' : 'linear-gradient(135deg,#1565c0,#c62828)', padding: '14px 16px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Oswald'", fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
            {isCopaMatch ? `🏆 Copa · Ronda ${(copa?.round || 0) + 1}` : isNemesisMatch ? '⚔️ DUELO DE RIVALES' : `${lg.i} Jornada ${game.matchNum + 1}`}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14 }}>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 22, color: '#fff', textTransform: 'uppercase' }}>HALCONES</div>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 16, color: 'rgba(255,255,255,0.25)' }}>VS</div>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 22, color: '#fff', textTransform: 'uppercase' }}>{rivalName}</div>
          </div>
          {isCopaMatch && <div style={{ fontSize: 12, color: '#fff', marginTop: 4, background: 'rgba(255,0,0,0.3)', padding: '3px 10px', borderRadius: 4, fontWeight: 700 }}>💀 PERDER = FIN DE LA CARRERA</div>}
        </div>
        <div style={{ background: T.bg1, padding: '8px 16px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, color: st.c, textTransform: 'uppercase' }}>{st.n}</div>
        </div>
        {/* Formation Selector */}
        <div style={{ padding: '8px 12px', background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: "'Oswald'", fontSize: 10, color: T.tx3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>Formación</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {FORMATIONS.map(f => {
              const active = game.formation === f.id;
              return (
                <div key={f.id} onClick={() => setGame(g => ({ ...g, formation: f.id }))} style={{ flex: 1, padding: '6px 4px', background: active ? `${T.info}15` : T.bg2, border: `1px solid ${active ? T.info + '60' : T.border}`, borderRadius: 5, cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 14 }}>{f.i}</div>
                  <div style={{ fontFamily: "'Oswald'", fontSize: 8, color: active ? T.info : T.tx3, textTransform: 'uppercase', marginTop: 1, lineHeight: 1.2 }}>{f.n.split('(')[1]?.replace(')','') || f.id}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 7, color: f.mods.atkMult > 1 ? T.win : f.mods.atkMult < 1 ? T.lose : T.tx3 }}>ATK {f.mods.atkMult > 1 ? '▲' : f.mods.atkMult < 1 ? '▼' : '—'}</span>
                    <span style={{ fontSize: 7, color: f.mods.defMult > 1 ? T.win : f.mods.defMult < 1 ? T.lose : T.tx3 }}>DEF {f.mods.defMult > 1 ? '▲' : f.mods.defMult < 1 ? '▼' : '—'}</span>
                    <span style={{ fontSize: 7, color: f.mods.spdMult > 1 ? T.win : f.mods.spdMult < 1 ? T.lose : T.tx3 }}>VEL {f.mods.spdMult > 1 ? '▲' : f.mods.spdMult < 1 ? '▼' : '—'}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {currentFormation && <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: T.tx2, marginTop: 4, textAlign: 'center' }}>{currentFormation.desc}</div>}
        </div>
        {injuredStarters.length > 0 && <div style={{ padding: '10px 14px', background: 'rgba(248,81,73,0.06)', borderBottom: `1px solid rgba(248,81,73,0.15)` }}><div style={{ fontSize: 14, color: T.lose, fontFamily: "'Oswald'", fontWeight: 600 }}>🏥 {injuredStarters.length} LESIONADO(S) — ¡no pueden jugar!</div></div>}
        <div style={{ display: 'flex', gap: 3, padding: 8, flex: 1 }}>
          {[{ t: '🔵 Halcones', p: starters, c: game.coach, h: true }, { t: `🔴 ${rivalName}`, p: rpRef.current, c: rcRef.current, h: false }].map((team, ti) => (
            <div key={ti} style={{ flex: 1, padding: 6, background: T.bg1, borderRadius: 6 }}>
              <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, color: team.h ? T.info : '#ef5350', textTransform: 'uppercase', paddingBottom: 3, borderBottom: `2px solid ${T.border}`, marginBottom: 4 }}>{team.t}</div>
              {team.p.map((p, i) => (
                <div key={i} style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, padding: '2px 0', display: 'flex', justifyContent: 'space-between', color: p.injuredFor > 0 ? T.lose : (p.fatigue || 0) > 70 ? T.draw : T.tx }}>
                  <span style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{PN[p.pos]} {p.name}</span>
                  <span style={{ fontWeight: 700, color: T.gold, fontSize: 12 }}>{effectiveOvr(p)}</span>
                </div>
              ))}
              <div style={{ marginTop: 4, paddingTop: 4, borderTop: `1px solid ${T.border}` }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 11, color: T.win }}>{team.c?.i} {team.c?.n}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, padding: 8, background: '#141e3a' }}>
          <div style={{ textAlign: 'center' }}><div style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, color: '#607d8b', textTransform: 'uppercase' }}>Halcones</div><div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 28, color: '#42a5f5' }}>{tp}</div></div>
          <div style={{ fontFamily: "'Oswald'", fontSize: 12, color: '#455a64' }}>VS</div>
          <div style={{ textAlign: 'center' }}><div style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, color: '#607d8b', textTransform: 'uppercase' }}>{rivalName}</div><div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 28, color: '#ef5350' }}>{rtp}</div></div>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '8px 16px', justifyContent: 'center', background: T.bg }}>
          <button onClick={() => go('roster')} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 12, padding: '8px 16px', border: '1.5px solid #607d8b', background: 'transparent', color: '#e8eaf6', borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase' }}>Roster</button>
          <button onClick={() => {
            const objs = objRef.current || [];
            setGame(g => ({ ...g, currentObjectives: objs }));
            setMatch({ ps: 0, rs: 0, minute: 0, speed: 2, running: true, rival: { name: rivalName }, rivalPlayers: rpRef.current, rivalCoach: rcRef.current, ballX: .5, ballY: .5, possession: true, log: [], eventPopup: null });
            rpRef.current = null; rcRef.current = null; objRef.current = null;
            SFX.play('whistle'); setScreen('match');
          }} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, padding: '10px 28px', border: 'none', background: injuredStarters.length > 0 ? 'linear-gradient(135deg,#c62828,#ff1744)' : 'linear-gradient(135deg,#00c853,#00e676)', color: injuredStarters.length > 0 ? '#fff' : '#0b1120', clipPath: 'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)', cursor: 'pointer', textTransform: 'uppercase' }}>⚽ Jugar</button>
        </div>
      </div>
    );
  };

  // ─── MATCH SCREEN ───
  const MatchScreen = () => {
    const simRef = useRef(false);
    const canvasRef = useRef(null);
    const frameRef = useRef(0);
    const particlesRef = useRef(new ParticleSystem());
    const hTrailRef = useRef(Array.from({ length: 5 }, () => []));
    const aTrailRef = useRef(Array.from({ length: 5 }, () => []));
    const shakeRef = useRef(0);
    const hpxRef = useRef([]), hpyRef = useRef([]), apxRef = useRef([]), apyRef = useRef([]);
    const eventResolveRef = useRef(null);
    const penaltyResolveRef = useRef(null);
    const sim = useRef({ ps: 0, rs: 0, minute: 0, speed: 2, ballX: .5, ballY: .5, possession: true, log: [], done: false, rivalName: '', rivalPlayers: [], morale: 50, strategy: 'balanced', shots: 0, possCount: 0, totalTicks: 0, pendingEvent: null, halftimeShown: false, goalEffect: 0, pendingPenalty: null });
    const [display, setDisplay] = useState({ ps: 0, rs: 0, minute: 0, speed: 2, log: [], done: false, morale: 50, pendingEvent: null, strategy: 'balanced', pendingPenalty: null });

    const formation = FORMATIONS.find(f => f.id === game.formation) || FORMATIONS[1];
    const formMods = formation.mods;

    useEffect(() => {
      if (!match.running || simRef.current) return;
      simRef.current = true;
      sim.current = { ps: 0, rs: 0, minute: 0, speed: 2, ballX: .5, ballY: .5, possession: true, log: [{ type: 'normal', text: `⚽ Arranca — Halcones vs ${match.rival?.name} [${formation.n}]` }], done: false, rivalName: match.rival?.name || 'Rival', rivalPlayers: match.rivalPlayers || [], morale: 50 + (applyRelicEffects(game, 'match_morale_bonus').moraleBonus || 0), strategy: 'balanced', shots: 0, possCount: 0, totalTicks: 0, pendingEvent: null, halftimeShown: false, goalEffect: 0, pendingPenalty: null };
      hpxRef.current = []; hpyRef.current = []; apxRef.current = []; apyRef.current = [];
      Crowd.start();
      const di = setInterval(() => { const s = sim.current; setDisplay({ ps: s.ps, rs: s.rs, minute: s.minute, speed: s.speed, log: [...s.log.slice(-4)], done: s.done, morale: s.morale, pendingEvent: s.pendingEvent, strategy: s.strategy, pendingPenalty: s.pendingPenalty }); }, 150);
      const ci = setInterval(() => { const s = sim.current; Crowd.setIntensity(s.morale / 100); }, 1000);
      let animId; function dl() { frameRef.current++; drawPitch(); animId = requestAnimationFrame(dl); } dl();
      runSim().then(() => { clearInterval(di); clearInterval(ci); cancelAnimationFrame(animId); const s = sim.current; setDisplay({ ps: s.ps, rs: s.rs, minute: s.minute, speed: s.speed, log: [...s.log.slice(-4)], done: true, morale: s.morale, pendingEvent: null, strategy: s.strategy }); });
      return () => { clearInterval(di); clearInterval(ci); cancelAnimationFrame(animId); Crowd.stop(); };
    }, [match.running]);

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
    function waitForChoice() { return new Promise(resolve => { eventResolveRef.current = resolve; }); }
    function handleEventChoice(optionIndex) { if (eventResolveRef.current) { eventResolveRef.current(optionIndex); eventResolveRef.current = null; } }
    function waitForPenalty() { return new Promise(resolve => { penaltyResolveRef.current = resolve; }); }

    async function showTacticalEvent(ev) {
      SFX.play('event');
      sim.current.pendingEvent = ev;
      const choice = await waitForChoice();
      sim.current.pendingEvent = null;
      return choice;
    }

    // mode: 'shoot' (you attack) or 'save' (you defend)
    async function showPenaltyMinigame(mode = 'shoot') {
      SFX.play('event');
      sim.current.pendingPenalty = { phase: 'aim', mode, shootDir: null, keeperDir: null, result: null };
      const result = await waitForPenalty();
      sim.current.pendingPenalty = null;
      return result;
    }

    function handlePenaltyShoot(dir) {
      const S = sim.current;
      if (!S.pendingPenalty || S.pendingPenalty.phase !== 'aim') return;
      const mode = S.pendingPenalty.mode || 'shoot';
      SFX.play('kick');
      if (mode === 'shoot') {
        // Player chooses where to shoot, keeper guesses
        const keeperDir = pick(['left', 'center', 'right']);
        const scored = dir !== keeperDir || (dir === 'center' && Math.random() < 0.3);
        S.pendingPenalty = { ...S.pendingPenalty, phase: 'result', shootDir: dir, keeperDir, result: scored };
        setTimeout(() => {
          if (scored) SFX.play('goal'); else SFX.play('card');
          setTimeout(() => { if (penaltyResolveRef.current) { penaltyResolveRef.current({ scored }); penaltyResolveRef.current = null; } }, 1200);
        }, 600);
      } else {
        // 'save' mode: player chooses corner to dive, rival shoots randomly
        const shootDir = pick(['left', 'center', 'right']);
        const saved = dir === shootDir || (shootDir === 'center' && Math.random() < 0.35);
        S.pendingPenalty = { ...S.pendingPenalty, phase: 'result', shootDir, keeperDir: dir, result: saved };
        setTimeout(() => {
          if (saved) SFX.play('goal'); else SFX.play('goal_rival');
          setTimeout(() => { if (penaltyResolveRef.current) { penaltyResolveRef.current({ scored: !saved }); penaltyResolveRef.current = null; } }, 1200);
        }, 600);
      }
    }

    async function runSim() {
      const S = sim.current;
      const starters = game.roster.filter(p => p.role === 'st');
      const allRoster = game.roster.map(p => ({ ...p, trait: { ...p.trait } }));
      const stealBonus = game.coach?.fx === 'steal' ? .15 : 0;
      const noFouls = game.coach?.fx === 'nofoul';
      const simRelics = game.relics || [];
      const moraleFloor = simRelics.includes('megafono') ? 40 : 0;
      const chemFloor = simRelics.includes('vestuario') ? 30 : 0;
      const hasGkLastMin = simRelics.includes('guantes');   // GK relic: block final goal
      const hasScoutRival = simRelics.includes('cuaderno'); // Scout relic: +5% possession
      const chemBonus = game.chemistry * .001;
      const diffMod = game.league <= 1 ? 0.005 : game.league * 0.008;
      let lastEventMin = -10;
      let tacticalEventsShown = 0;
      const MAX_TACTICAL_EVENTS = 2;
      const sp = () => S.speed;
      function addLog(t, x) { S.log.push({ type: t, text: x }); if (S.log.length > 25) S.log.shift(); }

      while (S.minute < 90) {
        S.minute += rnd(2, 4); if (S.minute > 90) S.minute = 90; S.totalTicks++;

        // Halftime — simplified, no prompt: auto apply balanced, show in log
        if (S.minute >= 45 && !S.halftimeShown) {
          S.halftimeShown = true;
          SFX.play('halftime');
          addLog('event', `🕐 Descanso: ${S.ps}-${S.rs} · Elige táctica para 2ª parte`);
          // Show halftime strategy picker inline (via pending event with isHalftime flag)
          const htEvent = { n: '🕐 MEDIO TIEMPO', d: `${S.ps}-${S.rs} · ¿Cómo encaras la 2ª parte?`, isHalftime: true, o: [{ n: 'Ofensiva', d: '+Ataque, -Defensa', i: '⚔' }, { n: 'Equilibrada', d: 'Balance', i: '⚖' }, { n: 'Defensiva', d: '+Defensa, -Ataque', i: '🛡' }] };
          const choice = await showTacticalEvent(htEvent);
          S.strategy = ['offensive', 'balanced', 'defensive'][choice] || 'balanced';
          S.morale = Math.min(99, S.morale + 5);
          await sleep(200);
        }

        // Tactical events: max MAX_TACTICAL_EVENTS per match (excluding halftime and penalties)
        if (tacticalEventsShown < MAX_TACTICAL_EVENTS && S.minute - lastEventMin >= rnd(20, 30) && sp() > 0 && S.minute < 85 && S.minute > 10) {
          lastEventMin = S.minute;
          tacticalEventsShown++;
          const ev = randomizeEvent(pick(TACTICS.filter(e => !e.n.includes('PENAL') && !e.n.includes('LESIÓN'))));
          const choice = await showTacticalEvent(ev);
          const eff = ev.o[choice]?.e || {};
          S.morale = Math.max(0, Math.min(99, S.morale + (eff.morale || 0)));
          if (eff.cardRisk && Math.random() < eff.cardRisk) { SFX.play('card'); addLog('card', `🟨 ${S.minute}' ¡Tarjeta!`); }
          const atkB = eff.atkBonus || 0; const defP = eff.defPenalty || 0;
          if (atkB > 0 && Math.random() < atkB) { S.ps++; S.goalEffect = 1; shakeRef.current = 15; S.ballY = .05; SFX.play('goal'); addLog('goal', `⚽ ${S.minute}' ${narrate('goalHome', 'Halcones', S.rivalName, starters)}`); S.morale = Math.min(99, S.morale + 10); await sleep(sp() >= 2 ? 2500 : 200); S.ballX = .5; S.ballY = .5; }
          else if (defP > 0 && Math.random() < defP) { S.rs++; S.goalEffect = -1; shakeRef.current = 10; S.ballY = .95; SFX.play('goal_rival'); addLog('goalRival', `💀 ${S.minute}' ${narrate('goalAway', 'Halcones', S.rivalName, starters)}`); S.morale = Math.max(0, S.morale - 8); await sleep(sp() >= 2 ? 2500 : 200); S.ballX = .5; S.ballY = .5; }
          await sleep(sp() >= 2 ? 400 : 100);
          continue;
        }

        const moraleMod = ((Math.max(moraleFloor, S.morale) - 50) / 200);
        const stratMod = S.strategy === 'offensive' ? .03 : S.strategy === 'defensive' ? -.02 : 0;
        const tM = avgStat(starters, 'spd', formMods) + avgStat(starters, 'atk', formMods) * .5 + chemBonus * 10;
        const rM = avgStat(S.rivalPlayers, 'spd') + avgStat(S.rivalPlayers, 'atk') * .5;
        const scoutBonus = hasScoutRival ? 0.05 : 0;
        S.possession = Math.random() < (tM / (tM + rM) + stealBonus + moraleMod + stratMod + scoutBonus);
        if (S.possession) S.possCount++;
        const clutch = S.ps < S.rs && starters.some(p => p.trait.fx === 'clutch');
        const stratAtk = S.strategy === 'offensive' ? .015 : S.strategy === 'defensive' ? -.01 : 0;
        const stratDef = S.strategy === 'defensive' ? .015 : S.strategy === 'offensive' ? -.008 : 0;

        if (S.possession) {
          const aP = avgStat(starters, 'atk', formMods) + (clutch ? 5 : 0);
          const rD = avgStat(S.rivalPlayers, 'def');
          const gc = (aP - rD * .6) * .015 + .03 + moraleMod * .02 + stratAtk - diffMod * .5;
          S.shots++;
          if (Math.random() < Math.max(.02, Math.min(.14, gc))) {
            S.ps++; S.goalEffect = 1; shakeRef.current = 15; S.ballX = .5; S.ballY = .05; S.morale = Math.min(99, S.morale + 10);
            SFX.play('goal'); addLog('goal', `⚽ ${S.minute}' ${narrate('goalHome', 'Halcones', S.rivalName, starters)}`);
            await sleep(sp() >= 2 ? 2500 : sp() === 1 ? 800 : 200); S.ballX = .5; S.ballY = .5;
          } else if (sp() >= 2 && Math.random() < .3) { SFX.play('kick'); addLog('normal', `${S.minute}' ${narrate('atkBuild', 'Halcones', S.rivalName, starters)}`); await sleep(700); }
        } else {
          const rA = avgStat(S.rivalPlayers, 'atk');
          const tD = avgStat(starters, 'def', formMods) + (noFouls ? 2 : 0);
          const gkRating = teamGKRating(starters);
          const gkPenalty = gkRating < 3 ? 0.04 : gkRating < 5 ? 0.02 : 0;
          const gc = (rA - tD * .6) * .015 + .02 - moraleMod * .01 - stratDef + diffMod + gkPenalty;
          if (Math.random() < Math.max(.015, Math.min(.13, gc))) {
            S.rs++; S.goalEffect = -1; shakeRef.current = 10; S.ballX = .5; S.ballY = .95; S.morale = Math.max(0, S.morale - 8);
            SFX.play('goal_rival'); addLog('goalRival', `💀 ${S.minute}' ${narrate('goalAway', 'Halcones', S.rivalName, starters)}`);
            await sleep(sp() >= 2 ? 2500 : sp() === 1 ? 800 : 200); S.ballX = .5; S.ballY = .5;
          } else if (sp() >= 2 && Math.random() < .2) { SFX.play('kick'); addLog('normal', `${S.minute}' ${narrate('defGood', 'Halcones', S.rivalName, starters)}`); await sleep(600); }
        }
        // Random penalty event (attack or defense)
        if (Math.random() < .025 && sp() > 0) {
          if (S.possession) {
            addLog('event', `‼ ${S.minute}' ¡PENAL a favor!`);
            const penResult = await showPenaltyMinigame('shoot');
            if (penResult.scored) { S.ps++; S.goalEffect = 1; shakeRef.current = 15; SFX.play('goal'); addLog('goal', `⚽ ${S.minute}' ¡GOOOL de penal!`); S.morale = Math.min(99, S.morale + 12); }
            else { addLog('normal', `${S.minute}' Penal fallado...`); S.morale = Math.max(0, S.morale - 5); }
          } else {
            addLog('event', `‼ ${S.minute}' ¡Penal en contra!`);
            const penResult = await showPenaltyMinigame('save');
            if (!penResult.scored) { S.rs++; S.goalEffect = -1; shakeRef.current = 10; SFX.play('goal_rival'); addLog('goalRival', `💀 ${S.minute}' Penal encajado.`); S.morale = Math.max(0, S.morale - 10); }
            else { addLog('event', `🧤 ${S.minute}' ¡¡ATAJADA HEROICA!!`); S.morale = Math.min(99, S.morale + 8); }
          }
          await sleep(sp() >= 2 ? 600 : 150); S.ballX = .5; S.ballY = .5;
        }
        if (sp() >= 2 && Math.random() < .04) { SFX.play('card'); addLog('card', `🟨 ${S.minute}' Tarjeta`); }
        if (sp() >= 2 && Math.random() < .05) { SFX.play('tick'); addLog('steal', `🔥 ${S.minute}' ${narrate('steal', 'Halcones', S.rivalName, starters)}`); S.morale = Math.min(99, S.morale + 2); }
        await sleep(sp() >= 2 ? 600 : sp() === 1 ? 180 : 100);
      }

      // gk_last_min relic: if losing by 1 at 90', block the final concede chance
      if (hasGkLastMin && S.ps < S.rs && S.rs - S.ps === 1) {
        addLog('event', `🧤 ¡Los Guantes de Hierro salvan el marcador al final!`);
        S.rs = Math.max(S.ps, S.rs - 1);
      }
      SFX.play('whistle_double'); addLog('event', `🏁 ¡Final! Halcones ${S.ps}-${S.rs} ${S.rivalName}`);
      Crowd.stop();
      await sleep(sp() === 0 ? 600 : 2500); S.done = true;

      // End of match processing
      const ps = S.ps, rs = S.rs;
      const won = ps > rs, drew = ps === rs, lost = ps < rs;
      const streakBonus = Math.max(0, game.streak) * 3;
      const leagueBonus = Math.floor(game.league * 4);
      const relicCoinBonus = (won && simRelics.includes('botines94') ? 3 : 0)
        + (won && simRelics.includes('trofeo') ? 2 * Math.max(0, game.streak) : 0)
        + (simRelics.includes('prensa') ? 5 : 0);
      const coinGain = (won ? 25 : drew ? 12 : 5) + streakBonus + leagueBonus + relicCoinBonus;
      const xpGain = won ? 18 : drew ? 12 : 8;
      const possPct = Math.round(S.possCount / Math.max(1, S.totalTicks) * 100);
      const objData = { wentBehind: S.log.some(e => e.type === 'goalRival'), fatiguedCount: 0, finalMorale: S.morale, possPct };
      const objResults = (game.currentObjectives || []).map(o => ({ ...o, completed: o.check ? o.check(ps, rs, objData) : false }));
      const objCoins = objResults.filter(o => o.completed).reduce((s, o) => s + (o.r?.coins || 0), 0);
      const injuryList = [];
      const personalityEvents = [];

      setGame(g => {
        const table = [...g.table]; const me = table.find(t => t.you); me.gf += ps; me.ga += rs;
        if (won) me.w++; else if (drew) me.d++; else me.l++;
        table.filter(t => !t.you).forEach(t => { if (Math.random() < .7) { const gf = rnd(0, 3), ga = rnd(0, 2); t.gf += gf; t.ga += ga; if (gf > ga) t.w++; else if (gf === ga) t.d++; else t.l++; } });
        const roster = g.roster.map(p => ({ ...p, trait: { ...p.trait }, personality: p.personality || pick(PERSONALITIES) }));
        roster.filter(p => p.role === 'st').forEach(p => {
          let xp = xpGain; if (p.trait.fx === 'xp') xp = Math.floor(xp * 1.5);
          p.xp += xp;
          // No auto-level — level up is handled via choice modal after match
        });
        roster.forEach(p => {
          if (p.role === 'st') { p.fatigue = Math.min(100, (p.fatigue || 0) + rnd(20, 30)); p.gamesPlayed = (p.gamesPlayed || 0) + 1; }
          else p.fatigue = Math.max(0, (p.fatigue || 0) - rnd(12, 18));
        });
        const hasAmuleto = (g.relics || []).includes('amuleto');
        const hasMendez = (g.relics || []).includes('mendez');
        roster.filter(p => p.role === 'st').forEach(p => {
          const baseRisk = p.fatigue > 90 ? .25 : p.fatigue > 70 ? .1 : .02;
          const risk = hasAmuleto ? baseRisk * 0.9 : baseRisk;
          if (Math.random() < risk && (p.injuredFor || 0) <= 0) {
            p.injuredFor = hasMendez ? 1 : rnd(1, 3);
            p.role = 'rs'; injuryList.push({ name: p.name, pos: p.pos, games: p.injuredFor });
          }
        });
        roster.forEach(p => { if ((p.injuredFor || 0) > 0) p.injuredFor--; });
        const lineupKey = roster.filter(p => p.role === 'st').slice(0, 6).map(p => p.id).sort().join(',');
        let mt = g.matchesTogether, chem = g.chemistry;
        if (g.lastLineup === lineupKey) { mt++; chem = Math.min(99, mt * 5 + 10); } else { mt = Math.max(0, mt - 2); chem = Math.max(5, mt * 5 + 10); }
        const newStreak = won ? (Math.max(0, g.streak) + 1) : (lost ? Math.min(0, g.streak) - 1 : 0);
        const rivalMem = { ...g.rivalMemory }; rivalMem[S.rivalName] = { result: `${ps}-${rs}`, gdiff: ps - rs };
        const cs = { ...g.careerStats || { wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0, matchesPlayed: 0, bestStreak: 0, scorers: {} } };
        cs.matchesPlayed++; cs.goalsFor += ps; cs.goalsAgainst += rs;
        if (won) cs.wins++; else if (drew) cs.draws++; else cs.losses++;
        cs.bestStreak = Math.max(cs.bestStreak, newStreak);
        const scorers = { ...cs.scorers || {} };
        const fwdMid = roster.filter(p => p.role === 'st' && (p.pos === 'FWD' || p.pos === 'MID'));
        for (let i = 0; i < ps; i++) { const scorer = fwdMid.length ? fwdMid[Math.floor(Math.random() * fwdMid.length)] : roster[0]; if (scorer) scorers[scorer.name] = (scorers[scorer.name] || 0) + 1; }
        cs.scorers = scorers;
        const newState = { ...g, table, roster, matchNum: g.matchNum + 1, matchesTogether: mt, chemistry: chem, lastLineup: lineupKey, coins: g.coins + coinGain + objCoins, streak: newStreak, rivalMemory: rivalMem, careerStats: cs, trainedIds: [] };
        setTimeout(() => autoSave(newState), 100);
        return newState;
      });

      // Rewards — Level-up with choice (deferred), relic, recruit
      const rwOptions = [];

      // Level up with CHOICE — use post-XP roster from setGame snapshot
      // We need to read the updated roster, so defer via a small timeout after setGame settles
      // For now, detect from allRoster (pre-setGame XP add) — will trigger if xp+xpGain >= xpNext
      const levelUpPlayers = allRoster
        .filter(p => p.role === 'st' && p.lv < 20)
        .filter(p => {
          const gainedXp = p.trait?.fx === 'xp' ? Math.floor(xpGain * 1.5) : xpGain;
          return (p.xp + gainedXp) >= (p.xpNext || 20);
        });
      if (levelUpPlayers.length > 0) {
        const t = levelUpPlayers[0];
        const choices = getLevelUpChoices(t);
        rwOptions.push({
          title: `⬆ ${t.name} sube de nivel`,
          desc: `Nivel ${t.lv} → ${t.lv + 1} · Elige mejora`,
          detail: choices.map(c => c.d).join(' / '),
          isLevelUp: true,
          player: t,
          choices,
          fn: () => { setPendingLevelUp({ player: t, choices }); },
        });
      }

      // Relic reward (if won/drew and has < 3 relics)
      const currentRelics = game.relics || [];
      if ((won || drew) && currentRelics.length < 3) {
        const available = RELICS.filter(r => !currentRelics.includes(r.id));
        if (available.length >= 2) {
          const relic = pick(available);
          rwOptions.push({
            title: `${relic.i} ${relic.n}`,
            desc: relic.d,
            detail: `Reliquia · ${relic.rarity}`,
            fn: () => { setGame(g => ({ ...g, relics: [...(g.relics||[]), relic.id] })); },
          });
        }
      }

      // Evolve
      if ((won || drew) && allRoster.some(p => p.lv >= 5 && !p.evo)) {
        const evs = allRoster.filter(p => p.lv >= 5 && !p.evo);
        const t = pick(evs); const nt = pick(TRAITS);
        rwOptions.push({ title: '🌟 Evolucionar', desc: `${t.name} → +${nt.n}`, detail: `${nt.d} + ⚔+3 🛡+3 ⚡+2`, fn: () => { t.evo = true; t.trait = { n: t.trait.n + '+' + nt.n, d: t.trait.d + '|' + nt.d, fx: t.trait.fx }; t.atk += 3; t.def += 3; t.spd += 2; } });
      }

      // Recruit / free agent
      if (won && allRoster.length < 14) { const r = pick(S.rivalPlayers); rwOptions.push({ title: '🔄 Reclutar', desc: `${r.name} (${PN[r.pos]} OVR${calcOvr(r)})`, detail: `⚔${r.atk} 🛡${r.def} ⚡${r.spd}`, fn: () => { r.role = 'rs'; setGame(g => ({ ...g, roster: [...g.roster, r] })); } }); }
      else if (allRoster.length < 14) { const lg2 = LEAGUES[game.league]; const fa = genPlayer(pick(['GK', 'DEF', 'MID', 'FWD']), lg2.lv[0], lg2.lv[0] + 2); rwOptions.push({ title: '🆕 Agente Libre', desc: `${fa.name} (${PN[fa.pos]} OVR${calcOvr(fa)})`, detail: `⚔${fa.atk} 🛡${fa.def} ⚡${fa.spd}`, fn: () => { fa.role = 'rs'; setGame(g => ({ ...g, roster: [...g.roster, fa] })); } }); }

      let stolen = null;
      if (lost) { const stealable = allRoster.filter(p => p.id !== game.captain && p.role === 'st'); if (stealable.length) { stolen = pick(stealable); setGame(g => ({ ...g, roster: g.roster.filter(p => p.id !== stolen.id) })); } }
      const snapRoster = allRoster.filter(p => !stolen || p.id !== stolen.id);
      const goals = S.log.filter(e => e.type === 'goal' || e.type === 'goalRival');
      const cards = S.log.filter(e => e.type === 'card');
      const socialPosts = generateSocialPosts(game.league, won, drew, S.rivalName, ps, rs, game.streak);

      if (matchType === 'copa' && game.copa) {
        if (won) { setGame(g => { const copa = { ...g.copa }; copa.bracket[copa.round].beaten = true; copa.round++; if (copa.round >= copa.maxRounds) { copa.won = true; copa.active = false; } return { ...g, copa, coins: g.coins + 15 * copa.round }; }); }
        else { setGame(g => ({ ...g, copa: { ...g.copa, eliminated: true, active: false } })); setTimeout(() => go('death'), 1500); return; }
      }

      setRewards({ options: rwOptions, selected: null, stolen, xpGain, result: { ps, rs, won, drew, lost, xpGain, coinGain: coinGain + objCoins, rivalName: S.rivalName, rosterSnapshot: snapRoster, rivalPlayers: S.rivalPlayers, starters: allRoster.filter(p => p.role === 'st'), goals, cards, possPct, shots: S.shots, morale: S.morale, objResults, personalityEvents, injuryList, socialPosts, matchType } });
      setMatch(m => ({ ...m, running: false })); simRef.current = false; setRewardsTab('summary'); setScreen('rewards');
    }

    function drawPitch() {
      const canvas = canvasRef.current; if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const rect = canvas.parentElement.getBoundingClientRect();
      if (canvas.width !== Math.floor(rect.width) || canvas.height !== Math.floor(rect.height)) { canvas.width = Math.floor(rect.width); canvas.height = Math.floor(rect.height); }
      const W = canvas.width, H = canvas.height, f = frameRef.current, S = sim.current;
      if (!W || !H) return;
      ctx.save();
      if (shakeRef.current > 0) { const s = shakeRef.current; ctx.translate(Math.sin(f * 0.5) * s * 0.3, Math.cos(f * 0.7) * s * 0.2); shakeRef.current = Math.max(0, shakeRef.current - 0.5); }
      for (let i = 0; i < 16; i++) {
        const t = i / 16;
        ctx.fillStyle = i % 2 === 0 ? `rgb(${Math.floor(38 + t * 12)},${Math.floor(96 + t * 20)},${Math.floor(21 + t * 10)})` : `rgb(${Math.floor(43 + t * 12)},${Math.floor(104 + t * 20)},${Math.floor(26 + t * 10)})`;
        ctx.fillRect(0, i * H / 16, W, H / 16 + 1);
      }
      const m = 10, fw = W - m * 2, fh = H - m * 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1.5;
      ctx.strokeRect(m, m, fw, fh);
      ctx.beginPath(); ctx.moveTo(m, H / 2); ctx.lineTo(W - m, H / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(fw, fh) * .08, 0, Math.PI * 2); ctx.stroke();
      const gpw = fw * .14, gph = 4;
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(W / 2 - gpw / 2, m - 1, gpw, gph); ctx.fillRect(W / 2 - gpw / 2, H - m - gph + 1, gpw, gph);
      const bpx = m + fw * S.ballX, bpy = m + fh * S.ballY;
      const homeFormation = [{ bx: .5, by: .88, pull: .005, minY: .78, maxY: .95 }, { bx: .25, by: .70, pull: .02, minY: .55, maxY: .82 }, { bx: .75, by: .70, pull: .02, minY: .55, maxY: .82 }, { bx: .5, by: .52, pull: .06, minY: .35, maxY: .70 }, { bx: .5, by: .35, pull: .08, minY: .15, maxY: .60 }];
      const awayFormation = [{ bx: .5, by: .12, pull: .005, minY: .05, maxY: .22 }, { bx: .3, by: .28, pull: .02, minY: .18, maxY: .45 }, { bx: .7, by: .28, pull: .02, minY: .18, maxY: .45 }, { bx: .5, by: .42, pull: .06, minY: .30, maxY: .60 }, { bx: .5, by: .55, pull: .08, minY: .35, maxY: .80 }];
      const homeSpreadX = [0, -0.22, 0.22, 0, 0], awaySpreadX = [0, -0.18, 0.18, 0, 0];
      if (!hpxRef.current.length) {
        homeFormation.forEach((p, i) => { hpxRef.current[i] = m + fw * (p.bx + homeSpreadX[i]); hpyRef.current[i] = m + fh * p.by; });
        awayFormation.forEach((p, i) => { apxRef.current[i] = m + fw * (p.bx + awaySpreadX[i]); apyRef.current[i] = m + fh * p.by; });
      }
      homeFormation.forEach((pos, i) => {
        const baseX = m + fw * (pos.bx + homeSpreadX[i]), baseY = m + fh * pos.by;
        const pull = S.possession ? pos.pull : pos.pull * 0.4;
        const pushY = S.possession ? -fh * 0.06 : fh * 0.04;
        const targetX = baseX + (bpx - baseX) * pull * 2;
        const targetY = Math.max(m + fh * pos.minY, Math.min(m + fh * pos.maxY, baseY + pushY + (bpy - baseY) * pull));
        hpxRef.current[i] += (targetX - hpxRef.current[i]) * .045;
        hpyRef.current[i] += (targetY - hpyRef.current[i]) * .045;
        hpxRef.current[i] += Math.sin(f * .008 + i * 2.1) * 0.3;
      });
      awayFormation.forEach((pos, i) => {
        const baseX = m + fw * (pos.bx + awaySpreadX[i]), baseY = m + fh * pos.by;
        const pull = S.possession ? pos.pull * 0.4 : pos.pull;
        const pushY = S.possession ? fh * 0.04 : -fh * 0.06;
        const targetX = baseX + (bpx - baseX) * pull * 2;
        const targetY = Math.max(m + fh * pos.minY, Math.min(m + fh * pos.maxY, baseY + pushY + (bpy - baseY) * pull));
        apxRef.current[i] += (targetX - apxRef.current[i]) * .04;
        apyRef.current[i] += (targetY - apyRef.current[i]) * .04;
        apxRef.current[i] += Math.sin(f * .009 + i * 1.7) * 0.3;
      });
      if (S.goalEffect !== 0) {
        const gx = W / 2, gy = S.goalEffect > 0 ? m + 20 : H - m - 20;
        const col = S.goalEffect > 0 ? ['#f0c040', '#ffd600', '#fff'] : ['#ff1744', '#ef5350'];
        for (let c = 0; c < 3; c++) particlesRef.current.emit(gx, gy, 8, pick(col), { spread: 6, upforce: 4, type: 'confetti', size: 3 });
        S.goalEffect = 0;
      }
      const hStarters = game.roster.filter(p => p.role === 'st').sort((a, b) => POS_ORDER[a.pos] - POS_ORDER[b.pos]);
      const rKit = getRivalKit(game.league || 0);
      for (let i = 0; i < 5; i++) {
        const px = hpxRef.current[i] + Math.sin(f * .016 + i * 1.3) * 1.5, py = hpyRef.current[i] + Math.sin(f * .013 + i) * 1.2;
        const isGK = i === 0 || (hStarters[i] && hStarters[i].pos === 'GK');
        ctx.globalAlpha = 1;
        drawSprite(ctx, px, py, '#1565c0', '#0d47a1', f, i + 100, isGK);
        ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(hStarters[i] ? hStarters[i].name.split(' ').pop().substring(0, 8) : '', px, py + 22);
        ctx.textAlign = 'left';
      }
      for (let i = 0; i < 5; i++) {
        const px = apxRef.current[i] + Math.sin(f * .018 + i * 1.5) * 1.5, py = apyRef.current[i] + Math.sin(f * .015 + i * 1.1) * 1.2;
        ctx.globalAlpha = 1;
        drawSprite(ctx, px, py, rKit[0], rKit[1], f, i + 200, i === 0);
        ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(S.rivalPlayers[i] ? S.rivalPlayers[i].name.split(' ').pop().substring(0, 8) : '', px, py + 22);
        ctx.textAlign = 'left';
      }
      const bs = 12;
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(bpx + 1, bpy + bs * 0.6, bs * 0.6, bs * 0.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bpx, bpy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(bpx, bpy, 1.5, 0, Math.PI * 2); ctx.fill();
      particlesRef.current.update(ctx);
      if (shakeRef.current > 5) { ctx.fillStyle = shakeRef.current > 12 ? 'rgba(240,192,64,0.15)' : 'rgba(255,23,68,0.1)'; ctx.fillRect(0, 0, W, H); }
      ctx.restore();
    }

    const LC = { goal: T.gold, goalRival: T.lose, event: T.purple, steal: T.draw, card: '#ffd600', normal: 'rgba(230,237,243,0.4)' };
    const ev = display.pendingEvent;
    const moraleColor = display.morale > 65 ? T.win : display.morale > 35 ? T.draw : T.lose;
    const starters = game.roster.filter(p => p.role === 'st');
    const tp = teamPower(starters), rtp = teamPower(match.rivalPlayers || []);
    const winProb = Math.min(95, Math.max(5, Math.round((tp / (tp + rtp + 1) * 50 + 25 + ((display.ps - display.rs) * 12) + (display.morale - 50) * 0.15))));
    const socialCacheRef = useRef({ posts: [], lastUpdate: 0, lastMinute: 0 });
    const nowTime = Date.now();
    if (nowTime - socialCacheRef.current.lastUpdate > 3000 || display.minute !== socialCacheRef.current.lastMinute) {
      socialCacheRef.current = { posts: generateLivePosts(game.league, display.minute, display.log, display.ps, display.rs, matchType), lastUpdate: nowTime, lastMinute: display.minute };
    }
    const livePosts = socialCacheRef.current.posts;

    return (
      <div style={{ display: 'flex', flexDirection: 'row', height: '100%', background: '#000', position: 'relative' }}>
        {/* Social Feed */}
        <div style={{ flex: '0 0 28%', display: 'flex', flexDirection: 'column', background: T.bg, borderRight: `1px solid ${T.bg3}`, overflow: 'hidden' }}>
          <div style={{ padding: '4px 6px', background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontFamily: "'Oswald'", fontSize: 8, color: T.tx3, textTransform: 'uppercase', letterSpacing: 1 }}>📱 En vivo</div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {livePosts.map((p, i) => (
              <div key={i} style={{ background: T.bg1, borderRadius: 5, padding: '4px 5px', border: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2 }}>
                  <div style={{ fontSize: 9, flexShrink: 0 }}>{p.acc?.av || '👤'}</div>
                  <span style={{ fontFamily: "'Oswald'", fontSize: 7, color: T.tx2, flex: 1 }}>{p.acc?.n}</span>
                  <span style={{ fontSize: 6, color: T.tx3 }}>{p.t}</span>
                </div>
                <div style={{ fontFamily: "'Barlow'", fontSize: 10, color: T.tx, lineHeight: 1.3 }}>{p.text}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 2, fontFamily: "'Barlow Condensed'", fontSize: 7, color: T.tx3 }}>
                  <span>❤ {p.likes}</span><span>💬 {p.comments}</span>
                </div>
              </div>
            ))}
            {livePosts.length === 0 && <div style={{ textAlign: 'center', padding: 8, color: T.tx3, fontSize: 9, fontStyle: 'italic' }}>Esperando...</div>}
          </div>
          <div style={{ padding: '4px 6px', background: T.bg1, borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Oswald'", fontSize: 7, color: T.tx3, marginBottom: 1 }}>
              <span style={{ color: '#4DABF7' }}>HAL {winProb}%</span><span style={{ color: '#FF6B6B' }}>{100 - winProb}%</span>
            </div>
            <div style={{ display: 'flex', height: 3, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${winProb}%`, background: 'linear-gradient(90deg,#1565c0,#4DABF7)', transition: 'width 0.5s' }} />
              <div style={{ flex: 1, background: 'linear-gradient(90deg,#FF6B6B,#c62828)' }} />
            </div>
          </div>
        </div>
        {/* Pitch */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 15, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.7)', padding: '3px 6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ padding: '2px 6px', background: '#1565c0', fontFamily: "'Oswald'", fontWeight: 700, fontSize: 11, color: '#fff' }}>HAL</div>
                <div style={{ padding: '2px 8px', background: '#222', fontFamily: "'Oswald'", fontWeight: 700, fontSize: 16, color: '#fff', minWidth: 40, textAlign: 'center' }}>{display.ps}-{display.rs}</div>
                <div style={{ padding: '2px 6px', background: '#c62828', fontFamily: "'Oswald'", fontWeight: 700, fontSize: 11, color: '#fff' }}>{match.rival?.name?.substring(0, 4) || 'RIV'}</div>
                <div style={{ padding: '2px 5px', background: T.accent, fontFamily: "'Oswald'", fontWeight: 700, fontSize: 11, color: '#000' }}>{display.minute}'</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <div style={{ width: 36, height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }}><div style={{ width: `${display.morale}%`, height: '100%', background: moraleColor, borderRadius: 2 }} /></div>
                <span style={{ fontSize: 9, color: moraleColor, fontFamily: "'Oswald'", fontWeight: 700 }}>{display.morale}</span>
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {[{ l: '⏩', s: 0 }, { l: '▶', s: 1 }, { l: '▶▶', s: 2 }].map(({ l, s }) => (
                  <button key={s} onClick={() => { sim.current.speed = s; setDisplay(d => ({ ...d, speed: s })); }} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 8, padding: '2px 5px', border: `1px solid ${display.speed === s ? T.win : 'rgba(255,255,255,0.15)'}`, background: display.speed === s ? `${T.win}25` : 'transparent', color: display.speed === s ? T.win : 'rgba(255,255,255,0.4)', borderRadius: 3, cursor: 'pointer' }}>{l}</button>
                ))}
                <button onClick={() => { SFX._muted = !SFX._muted; if (SFX._muted) Crowd.stop(); else if (sim.current && !sim.current.done) Crowd.start(); setDisplay(d => ({ ...d })); }} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 8, padding: '2px 5px', border: `1px solid ${SFX._muted ? 'rgba(239,83,80,0.4)' : 'rgba(255,255,255,0.15)'}`, background: SFX._muted ? 'rgba(239,83,80,0.1)' : 'transparent', color: SFX._muted ? '#ef5350' : 'rgba(255,255,255,0.4)', borderRadius: 3, cursor: 'pointer', marginLeft: 3 }}>{SFX._muted ? '🔇' : '🔊'}</button>
              </div>
            </div>
          </div>
          <div style={{ flex: '0 0 auto', maxHeight: 70, overflow: 'auto', background: T.bg, borderTop: `1px solid ${T.bg3}`, padding: 4 }}>
            {[...display.log].reverse().slice(0, 4).map((e, i) => (
              <div key={i} style={{ display: 'flex', padding: '1px 4px', borderLeft: `2px solid ${LC[e.type] || 'transparent'}`, marginBottom: 1 }}>
                <span style={{ fontFamily: "'Barlow'", fontSize: 11, color: LC[e.type] || T.tx2, fontWeight: (e.type === 'goal' || e.type === 'goalRival') ? 700 : 400, lineHeight: 1.2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{e.text}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Tactical Event */}
        {ev && !display.pendingPenalty && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50, padding: 12, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'linear-gradient(135deg,#141e3a,#1a2744)', border: '1px solid rgba(213,0,249,0.15)', borderRadius: 8, padding: 16, maxWidth: 340, width: '100%' }}>
              <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 18, color: '#fff', textAlign: 'center', textTransform: 'uppercase' }}>{ev.n}</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: '#607d8b', textAlign: 'center' }}>{display.minute}'</div>
              <div style={{ fontSize: 14, color: '#e8eaf6', textAlign: 'center', lineHeight: 1.3, whiteSpace: 'pre-line', margin: '8px 0' }}>{ev.d}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {ev.o.map((opt, i) => (
                  <div key={i} onClick={() => { SFX.play('click'); handleEventChoice(i); }} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {opt.i && <div style={{ fontSize: 18, minWidth: 24, textAlign: 'center' }}>{opt.i}</div>}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, color: '#fff', textTransform: 'uppercase' }}>{opt.n}</div>
                      <div style={{ fontSize: 11, color: '#607d8b' }}>{opt.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Penalty Mini-Game */}
        {display.pendingPenalty && (() => {
          const pk = display.pendingPenalty;
          const isSave = pk.mode === 'save';
          const resultLabel = isSave
            ? (pk.result ? '❌ ¡GOL EN CONTRA!' : '🧤 ¡¡ATAJADA!!')
            : (pk.result ? '⚽ ¡¡GOOOL!!' : '❌ ¡ATAJADO!');
          const resultColor = isSave ? (pk.result ? '#ff1744' : '#f0c040') : (pk.result ? '#f0c040' : '#ff1744');
          return (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 55, padding: 16 }}>
              <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 24, color: isSave ? '#ef5350' : '#f0c040', textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 }}>
                {isSave ? '‼ PENAL EN CONTRA' : '‼ PENAL A FAVOR'}
              </div>
              <div style={{ width: '100%', maxWidth: 280, height: 90, position: 'relative', marginBottom: 16 }}>
                <div style={{ position: 'absolute', top: 0, left: '10%', width: '80%', height: '100%', background: 'rgba(255,255,255,0.03)', border: '3px solid #fff', borderBottom: 'none', borderRadius: '4px 4px 0 0' }}>
                  {pk.phase === 'result' && pk.shootDir && (
                    <div style={{ position: 'absolute', top: isSave ? (pk.result ? '30%' : '15%') : (pk.result ? '15%' : '30%'), left: pk.shootDir === 'left' ? '15%' : pk.shootDir === 'right' ? '60%' : '40%', fontSize: 20, opacity: 0.9 }}>⚽</div>
                  )}
                  <div style={{ position: 'absolute', bottom: 4, left: pk.phase === 'result' ? (pk.keeperDir === 'left' ? '5%' : pk.keeperDir === 'right' ? '60%' : '35%') : '35%', fontSize: 22, transition: 'left 0.3s' }}>🧤</div>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 4, background: '#2d7018' }} />
              </div>
              {pk.phase === 'aim' ? (
                <div style={{ width: '100%', maxWidth: 280 }}>
                  <div style={{ fontFamily: "'Barlow'", fontSize: 13, color: '#e8eaf6', textAlign: 'center', marginBottom: 8 }}>
                    {isSave ? '¿A qué lado te tiras?' : '¿A dónde disparas?'}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['left', 'center', 'right'].map(d => (
                      <button key={d} onClick={() => handlePenaltyShoot(d)} style={{ flex: 1, padding: '12px 6px', background: isSave ? 'rgba(40,10,10,0.95)' : 'rgba(20,30,58,0.95)', border: `1px solid ${isSave ? 'rgba(255,50,50,0.2)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <div style={{ fontSize: 20 }}>{isSave ? (d === 'left' ? '↖' : d === 'center' ? '⬆' : '↗') : (d === 'left' ? '↙' : d === 'center' ? '⬆' : '↘')}</div>
                        <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 10, color: '#fff', textTransform: 'uppercase' }}>{d === 'left' ? 'Izq' : d === 'center' ? 'Centro' : 'Der'}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 36, color: resultColor, textTransform: 'uppercase' }}>{resultLabel}</div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    );
  };

  // ─── REWARDS SCREEN ───
  const RewardsScreen = () => {
    const r = rewards.result; if (!r) return null;
    const xpGain = rewards.xpGain || 0;
    const resultColor = r.won ? T.win : r.drew ? T.draw : T.lose;
    const resultLabel = r.won ? 'VICTORIA' : r.drew ? 'EMPATE' : 'DERROTA';
    const [tab, setTab] = [rewardsTab, setRewardsTab];
    useEffect(() => { if (r.won) SFX.play('victory'); else if (r.lost) SFX.play('defeat'); }, []);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'auto', background: T.bg }}>
        <div style={{ width: '100%', background: 'linear-gradient(135deg,#1565c0 0%,#0d47a1 50%,#c62828 100%)', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 28, color: resultColor, textTransform: 'uppercase', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{resultLabel}</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, margin: '4px 0' }}>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 14, color: '#fff', textTransform: 'uppercase' }}>HALCONES</div>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 48, color: '#fff' }}>{r.ps} - {r.rs}</div>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 14, color: '#fff', textTransform: 'uppercase' }}>{r.rivalName}</div>
          </div>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>+{r.xpGain} XP · +{r.coinGain || 0} 💰</div>
        </div>
        {rewards.stolen && (
          <div style={{ background: 'rgba(255,23,68,0.08)', borderBottom: '1px solid rgba(255,23,68,0.2)', padding: '8px 16px', width: '100%', textAlign: 'center' }}>
            <span style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 12, color: '#ff1744', textTransform: 'uppercase' }}>💀 {r.rivalName} se lleva a {rewards.stolen.name} ({PN[rewards.stolen.pos]})</span>
          </div>
        )}
        <div style={{ display: 'flex', width: '100%', maxWidth: 420, background: T.bg1, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {[{ k: 'summary', l: '📊 Resumen' }, { k: 'social', l: '📱 Redes' }, { k: 'roster', l: '📋 Roster' }, { k: 'rewards', l: '🎁 Recomp.' }].map(t => (
            <div key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, padding: '8px 4px', textAlign: 'center', fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, color: tab === t.k ? '#f0c040' : '#607d8b', cursor: 'pointer', borderBottom: tab === t.k ? '2px solid #f0c040' : '2px solid transparent' }}>{t.l}</div>
          ))}
        </div>
        <div style={{ width: '100%', maxWidth: 420, padding: 8, flex: 1 }}>
          {tab === 'summary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ background: T.bg1, borderRadius: 6, padding: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, color: '#607d8b', textTransform: 'uppercase', marginBottom: 4 }}>Estadísticas</div>
                {[{ l: 'Posesión', h: `${r.possPct || 50}%`, a: `${100 - (r.possPct || 50)}%`, hp: r.possPct || 50 }, { l: 'Tiros', h: r.shots || 0, a: rnd(2, 6), hp: 60 }, { l: 'Moral final', h: r.morale || 50, a: '-', hp: r.morale || 50 }].map((s, i) => (
                  <div key={i} style={{ marginBottom: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Barlow Condensed'", fontSize: 11, color: '#e8eaf6', marginBottom: 2 }}><span>{s.h}</span><span style={{ color: '#607d8b', fontSize: 10 }}>{s.l}</span><span>{s.a}</span></div>
                    <div style={{ display: 'flex', height: 3, borderRadius: 2, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                      <div style={{ width: `${s.hp}%`, background: '#42a5f5', borderRadius: 2 }} /><div style={{ flex: 1, background: 'rgba(239,83,80,0.3)', borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
              {r.injuryList?.length > 0 && (
                <div style={{ background: 'rgba(255,23,68,0.04)', borderRadius: 6, padding: 10, border: '1px solid rgba(255,23,68,0.1)' }}>
                  <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, color: '#ff1744', textTransform: 'uppercase', marginBottom: 4 }}>🏥 Lesiones</div>
                  {r.injuryList.map((inj, i) => (<div key={i} style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: '#ff1744', padding: '1px 0' }}>🏥 {inj.name} — fuera {inj.games} partido(s)</div>))}
                </div>
              )}
              {r.objResults?.length > 0 && (
                <div style={{ background: T.bg1, borderRadius: 6, padding: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, color: T.gold, textTransform: 'uppercase', marginBottom: 4 }}>🎯 Objetivos</div>
                  {r.objResults.map((o, i) => (<div key={i} style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: o.completed ? '#00e676' : '#607d8b', padding: '1px 0' }}>{o.completed ? '✅' : '❌'} {o.n} {o.completed ? `(+${o.r.coins}💰)` : ''}</div>))}
                </div>
              )}
              {(game.relics||[]).length > 0 && (
                <div style={{ background: `rgba(168,85,247,0.05)`, borderRadius: 6, padding: 10, border: `1px solid rgba(168,85,247,0.15)` }}>
                  <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 11, color: T.purple, textTransform: 'uppercase', marginBottom: 5 }}>📿 Reliquias Activas</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {(game.relics||[]).map(rid => { const r = RELICS.find(x=>x.id===rid); return r ? (
                      <div key={rid} style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ fontSize:16 }}>{r.i}</span>
                        <div>
                          <div style={{ fontFamily:"'Oswald'", fontSize:11, color:T.tx }}>{r.n}</div>
                          <div style={{ fontFamily:"'Barlow Condensed'", fontSize:10, color:T.tx3 }}>{r.d}</div>
                        </div>
                      </div>
                    ) : null; })}
                  </div>
                </div>
              )}
            </div>
          )}
          {tab === 'social' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(r.socialPosts || []).map((post, i) => (
                <div key={i} style={{ background: T.bg1, borderRadius: 10, border: `1px solid ${T.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{post.account.av}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, color: T.tx }}>{post.account.n}{post.account.v && <span style={{ color: '#1DA1F2', fontSize: 11, marginLeft: 4 }}>✓</span>}</div>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: T.tx3 }}>{post.account.f} · {post.time}</div>
                    </div>
                  </div>
                  <div style={{ padding: '0 12px 10px', fontFamily: "'Barlow'", fontSize: 14, color: T.tx, lineHeight: 1.5 }}>{post.text}</div>
                  <div style={{ display: 'flex', gap: 16, padding: '6px 12px 10px', borderTop: `1px solid ${T.border}` }}>
                    <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx2 }}>❤️ {post.likes}</span>
                    <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx2 }}>💬 {post.comments}</span>
                    <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx2 }}>🔄 {post.retweets}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === 'roster' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {(r.rosterSnapshot || []).sort((a, b) => (a.role === 'st' ? 0 : 1) - (b.role === 'st' ? 0 : 1)).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 8px', background: T.bg1, borderRadius: 3, border: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 10, color: POS_COLORS[p.pos], minWidth: 26, textAlign: 'center' }}>{PN[p.pos]}</span>
                  <span style={{ flex: 1, fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 13, color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.role === 'st' ? '⚽ ' : ''}{p.name}</span>
                  <span style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 14, color: '#f0c040' }}>{calcOvr(p)}</span>
                </div>
              ))}
            </div>
          )}
          {tab === 'rewards' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, color: '#fff', textTransform: 'uppercase', textAlign: 'center', marginBottom: 2 }}>Elige Recompensa</div>
              {rewards.options.map((rw, i) => (
                <div key={i} onClick={() => {
                  if (rewards.selected === i) { SFX.play('click'); setRewards(rv => ({ ...rv, selected: null })); }
                  else if (rewards.selected === null) { SFX.play('reward'); rw.fn(); setRewards(rv => ({ ...rv, selected: i })); }
                }} style={{ background: rewards.selected === i ? 'rgba(0,200,83,0.04)' : 'linear-gradient(135deg,rgba(20,30,58,0.95),rgba(26,39,68,0.95))', border: `1px solid ${rewards.selected === i ? 'rgba(0,230,118,0.3)' : 'rgba(255,255,255,0.06)'}`, borderLeft: `4px solid ${rewards.selected === i ? '#00e676' : '#455a64'}`, borderRadius: 4, padding: 10, cursor: rewards.selected !== null && rewards.selected !== i ? 'not-allowed' : 'pointer', opacity: rewards.selected !== null && rewards.selected !== i ? .3 : 1 }}>
                  <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, color: '#f0c040', textTransform: 'uppercase' }}>{rw.title}</div>
                  <div style={{ fontSize: 13, color: '#e8eaf6', lineHeight: 1.2, marginTop: 2 }}>{rw.desc}</div>
                  <div style={{ fontSize: 10, color: '#607d8b', marginTop: 2 }}>{rw.detail}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: '8px 16px', width: '100%', maxWidth: 420 }}>
          {tab === 'rewards' ? (
            <button onClick={() => { if (rewards.selected !== null) go('table'); }} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, padding: '10px 28px', border: 'none', background: rewards.selected !== null ? 'linear-gradient(135deg,#d4a017,#f0c040)' : '#333', color: rewards.selected !== null ? '#1a1a2e' : '#666', clipPath: 'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)', cursor: rewards.selected !== null ? 'pointer' : 'not-allowed', textTransform: 'uppercase', opacity: rewards.selected !== null ? 1 : .4, width: '100%', marginBottom: 12 }}>Ver Tabla</button>
          ) : (
            <button onClick={() => setTab('rewards')} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, padding: '10px 28px', border: 'none', background: 'linear-gradient(135deg,#d4a017,#f0c040)', color: '#1a1a2e', clipPath: 'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)', cursor: 'pointer', textTransform: 'uppercase', width: '100%', marginBottom: 12 }}>🎁 Elegir Recompensa →</button>
          )}
        </div>
      </div>
    );
  };

  // ─── ASCENSION, CHAMPION, DEATH, STATS, CAREER SCREENS ───
  const AscensionScreen = () => {
    const nL = pendingLeague;
    useEffect(() => { SFX.play('ascend'); }, []);
    if (nL === null) return null;
    const cs = CUTSCENES[Math.min(nL - 1, CUTSCENES.length - 1)];
    const fromLg = LEAGUES[nL - 1], toLg = LEAGUES[nL], st = STADIUMS[nL];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', overflow: 'auto', background: 'radial-gradient(ellipse at 50% 40%,#1a2a10 0%,#0b1120 70%)', padding: 16, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 13, color: '#00e676', textTransform: 'uppercase', letterSpacing: 3 }}>🎉 ¡ASCENSO!</div>
        <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 32, color: '#f0c040', textTransform: 'uppercase', marginTop: 6 }}>{cs.title}</div>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 16, color: '#607d8b', marginTop: 4 }}>{cs.sub}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '6px 14px', textAlign: 'center' }}><div style={{ fontSize: 20 }}>{fromLg.i}</div><div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: '#607d8b' }}>{fromLg.n}</div></div>
          <div style={{ fontFamily: "'Oswald'", fontSize: 20, color: '#f0c040' }}>→</div>
          <div style={{ background: 'rgba(240,192,64,0.06)', borderRadius: 6, padding: '6px 14px', border: '1px solid rgba(240,192,64,0.15)', textAlign: 'center' }}><div style={{ fontSize: 20 }}>{toLg.i}</div><div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: '#f0c040' }}>{toLg.n}</div></div>
        </div>
        <div style={{ maxWidth: 340, margin: '8px 0' }}>
          <div style={{ fontSize: 36 }}><CoachPortrait id="miguel" size={40} /></div>
          <div style={{ fontFamily: "'Barlow'", fontSize: 17, color: '#e8eaf6', lineHeight: 1.5, fontStyle: 'italic', marginTop: 6 }}>{cs.quote}</div>
          <div style={{ fontFamily: "'Barlow'", fontSize: 14, color: '#607d8b', lineHeight: 1.4, marginTop: 8 }}>{cs.detail}</div>
        </div>
        <button onClick={() => {
          SFX.play('reward');
          const rns = RIVAL_NAMES[nL] || RIVAL_NAMES[0];
          const table = [{ name: 'Halcones', you: true, w: 0, d: 0, l: 0, gf: 0, ga: 0 }, ...rns.map(n => ({ name: n, you: false, w: 0, d: 0, l: 0, gf: 0, ga: 0 }))];
          setGame(g => ({ ...g, league: nL, matchNum: 0, table }));
          setPendingLeague(null); go('table');
        }} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, padding: '12px 32px', border: 'none', background: 'linear-gradient(135deg,#d4a017,#f0c040)', color: '#1a1a2e', clipPath: 'polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)', cursor: 'pointer', textTransform: 'uppercase', marginTop: 14 }}>Comenzar {toLg.n}</button>
      </div>
    );
  };

  const ChampionScreen = () => {
    const cs = game.careerStats || {};
    const bestPlayer = game.roster.length > 0 ? [...game.roster].sort((a, b) => calcOvr(b) - calcOvr(a))[0] : null;
    useEffect(() => { SFX.play('victory'); }, []);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', overflow: 'auto', background: 'radial-gradient(ellipse at 50% 30%,#2a2510 0%,#0b1120 60%)', padding: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 60 }}>🏆</div>
        <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 42, color: '#f0c040', textTransform: 'uppercase', textShadow: '0 0 30px rgba(240,192,64,0.3)', marginTop: 8 }}>¡¡CAMPEONES!!</div>
        <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 22, color: '#fff', textTransform: 'uppercase', marginTop: 4 }}>Liga Intergaláctica</div>
        <div style={{ maxWidth: 340, margin: '16px 0' }}>
          <div style={{ fontSize: 36 }}>👴</div>
          <div style={{ fontFamily: "'Barlow'", fontSize: 17, color: '#e8eaf6', lineHeight: 1.5, fontStyle: 'italic', marginTop: 6 }}>"Lo logramos, mijo. Desde la cancha llanera hasta las estrellas."</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, maxWidth: 340, width: '100%', margin: '8px 0' }}>
          {[{ l: 'Partidos', v: cs.matchesPlayed || 0 }, { l: 'Victorias', v: cs.wins || 0 }, { l: 'Goles', v: cs.goalsFor || 0 }].map((s, i) => (
            <div key={i} style={{ background: 'rgba(240,192,64,0.06)', borderRadius: 4, padding: '6px', textAlign: 'center', border: '1px solid rgba(240,192,64,0.15)' }}>
              <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 20, color: '#f0c040' }}>{s.v}</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, color: '#607d8b' }}>{s.l}</div>
            </div>
          ))}
        </div>
        <button onClick={async () => {
          const newGS = { ...globalStats, totalRuns: (globalStats.totalRuns || 0) + 1, totalWins: (globalStats.totalWins || 0) + (cs.wins || 0), totalGoals: (globalStats.totalGoals || 0) + (cs.goalsFor || 0), bestLeague: 7, bestLeagueName: '🏆 CAMPEÓN GALÁCTICO', ascensionLevel: Math.min(7, (globalStats.ascensionLevel || 0) + 1) };
          if (bestPlayer) newGS.hallOfFame = [...(newGS.hallOfFame || []), { name: bestPlayer.name, pos: bestPlayer.pos, ovr: calcOvr(bestPlayer), atk: bestPlayer.atk, def: bestPlayer.def, spd: bestPlayer.spd, sav: bestPlayer.sav || 1, trait: bestPlayer.trait?.n, league: '🏆 CAMPEÓN', run: newGS.totalRuns }].slice(-20);
          const finalGS = checkAchievements(newGS);
          setGlobalStats(finalGS); saveGlobalStats(finalGS);
          handleDeleteSave(); go('title');
        }} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 16, padding: '12px 32px', border: 'none', background: 'linear-gradient(135deg,#d4a017,#f0c040)', color: '#1a1a2e', clipPath: 'polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)', cursor: 'pointer', textTransform: 'uppercase', marginTop: 16 }}>🏆 Al Salón de la Fama</button>
      </div>
    );
  };

  const DeathScreen = () => {
    const cs = game.careerStats || { wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0, matchesPlayed: 0, bestStreak: 0, scorers: {} };
    const lg = LEAGUES[game.league];
    const bestPlayer = game.roster.length > 0 ? [...game.roster].sort((a, b) => calcOvr(b) - calcOvr(a))[0] : null;
    useEffect(() => {
      SFX.play('defeat');
      const newGS = { ...globalStats };
      newGS.totalRuns = (newGS.totalRuns || 0) + 1;
      newGS.totalMatches = (newGS.totalMatches || 0) + (cs.matchesPlayed || 0);
      newGS.totalWins = (newGS.totalWins || 0) + (cs.wins || 0);
      newGS.totalGoals = (newGS.totalGoals || 0) + (cs.goalsFor || 0);
      newGS.totalConceded = (newGS.totalConceded || 0) + (cs.goalsAgainst || 0);
      newGS.bestStreak = Math.max(newGS.bestStreak || 0, cs.bestStreak || 0);
      newGS.totalCoins = (newGS.totalCoins || 0) + (game.coins || 0);
      if (game.league > (newGS.bestLeague || 0)) { newGS.bestLeague = game.league; newGS.bestLeagueName = lg.n; }
      if (bestPlayer) newGS.hallOfFame = [...(newGS.hallOfFame || []), { name: bestPlayer.name, pos: bestPlayer.pos, ovr: calcOvr(bestPlayer), atk: bestPlayer.atk, def: bestPlayer.def, spd: bestPlayer.spd, sav: bestPlayer.sav || 1, trait: bestPlayer.trait?.n, league: lg.n, run: newGS.totalRuns }].slice(-20);
      newGS.allTimeScorers = { ...(newGS.allTimeScorers || {}) };
      Object.entries(cs.scorers || {}).forEach(([name, goals]) => { newGS.allTimeScorers[name] = (newGS.allTimeScorers[name] || 0) + goals; });
      const finalGS = checkAchievements(newGS);
      setGlobalStats(finalGS); saveGlobalStats(finalGS);
    }, []);

    const donMiguelQuote = game.league === 0 ? '"No siempre se gana, mijo. Pero lo que importa es que lo intentamos."' : '"Estuvimos tan cerca de las estrellas que casi las tocamos. No es el final... es solo el descanso."';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'auto', background: 'linear-gradient(180deg,#1a0a0a 0%,#0b1120 30%)' }}>
        <div style={{ width: '100%', padding: '24px 16px', textAlign: 'center', background: 'linear-gradient(180deg,rgba(255,23,68,0.08) 0%,transparent 100%)' }}>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 36, color: '#ff1744', textTransform: 'uppercase', letterSpacing: 2 }}>Fin de la Carrera</div>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 18, color: '#607d8b', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{lg.i} {lg.n}</div>
        </div>
        <div style={{ padding: '12px 20px', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ fontSize: 36 }}>👴</div>
          <div style={{ fontFamily: "'Barlow'", fontSize: 16, color: '#e8eaf6', lineHeight: 1.5, fontStyle: 'italic', marginTop: 8 }}>{donMiguelQuote}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 360, width: '100%', padding: '0 16px', margin: '8px 0' }}>
          {[{ l: 'Partidos', v: cs.matchesPlayed, c: '#fff' }, { l: 'Victorias', v: cs.wins, c: '#00e676' }, { l: 'Goles', v: cs.goalsFor, c: '#42a5f5' }, { l: 'Liga máxima', v: lg.n, c: '#d500f9' }].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 4, padding: '6px 8px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 24, color: s.c }}>{s.v}</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: '#607d8b', textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 16px', width: '100%', maxWidth: 400 }}>
          <button onClick={() => { handleDeleteSave(); go('tutorial'); }} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 16, padding: '12px 32px', border: 'none', background: 'linear-gradient(135deg,#d4a017,#f0c040)', color: '#1a1a2e', clipPath: 'polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)', cursor: 'pointer', textTransform: 'uppercase', width: '100%' }}>🔄 Nueva Carrera</button>
          <button onClick={() => go('title')} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 12, padding: '8px 16px', border: '1.5px solid #607d8b', background: 'transparent', color: '#e8eaf6', borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', width: '100%' }}>Menú Principal</button>
        </div>
      </div>
    );
  };

  const StatsScreen = () => {
    const gs = globalStats;
    const topScorers = Object.entries(gs.allTimeScorers || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const [tab, setTab] = useState('stats');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'auto', background: T.bg }}>
        <div style={{ width: '100%', padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 28, color: '#fff', textTransform: 'uppercase' }}>📖 Compendio</div>
        </div>
        <div style={{ display: 'flex', width: '100%', maxWidth: 440, background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
          {[{ k: 'stats', l: '📊' }, { k: 'fame', l: '🌟 HOF' }, { k: 'achieve', l: '🏆' }].map(t => (
            <div key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, padding: '8px 4px', textAlign: 'center', fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, color: tab === t.k ? T.gold : T.tx3, cursor: 'pointer', borderBottom: tab === t.k ? `2px solid ${T.gold}` : '2px solid transparent' }}>{t.l}</div>
          ))}
        </div>
        <div style={{ width: '100%', maxWidth: 440, padding: 10, flex: 1 }}>
          {tab === 'stats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ background: T.bg1, borderRadius: 8, padding: 12, border: `1px solid ${T.border}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                  {[{ l: 'Runs', v: gs.totalRuns || 0, c: T.tx }, { l: 'Victorias', v: gs.totalWins || 0, c: T.win }, { l: 'Goles', v: gs.totalGoals || 0, c: T.info }, { l: 'Mejor liga', v: gs.bestLeagueName || '—', c: T.purple }, { l: 'Racha', v: (gs.bestStreak || 0) + '🔥', c: T.draw }, { l: 'Ascensión', v: (gs.ascensionLevel || 0) + '/7', c: T.gold }].map((s, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 4, padding: '6px 4px', textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 16, color: s.c }}>{s.v}</div>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 8, color: T.tx3, textTransform: 'uppercase' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
              {topScorers.length > 0 && (
                <div style={{ background: T.bg1, borderRadius: 8, padding: 10, border: `1px solid ${T.border}` }}>
                  <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: T.gold, textTransform: 'uppercase', marginBottom: 4, textAlign: 'center' }}>⚽ Goleadores</div>
                  {topScorers.map(([name, goals], i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 4px', fontFamily: "'Barlow Condensed'", fontSize: 12, borderBottom: `1px solid ${T.border}` }}>
                      <span style={{ color: i === 0 ? T.gold : T.tx }}>{i === 0 ? '👑 ' : ''}{i + 1}. {name}</span>
                      <span style={{ fontFamily: "'Oswald'", fontWeight: 700, color: T.gold }}>{goals}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {tab === 'fame' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(gs.hallOfFame || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: T.tx3, fontSize: 13 }}>Completa tu primer run para añadir leyendas.</div>
              ) : (gs.hallOfFame || []).slice().reverse().map((p, i) => (
                <div key={i} style={{ background: 'linear-gradient(145deg,#2a2510,#3a3215)', borderRadius: 8, padding: 10, border: `1px solid ${T.gold}20`, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', minWidth: 36 }}>
                    <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 22, color: T.gold }}>{p.ovr}</div>
                    <div style={{ fontFamily: "'Oswald'", fontSize: 9, color: POS_COLORS[p.pos] || T.tx2 }}>{PN[p.pos] || p.pos}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 14, color: T.tx }}>⭐ {p.name}</div>
                    {p.trait && <div style={{ fontSize: 9, color: T.purple, marginTop: 1 }}>✦ {p.trait}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: T.tx2 }}>Run #{p.run}</div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.gold }}>{p.league}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === 'achieve' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontFamily: "'Oswald'", fontSize: 12, color: T.gold, textAlign: 'center' }}>{(gs.achievements || []).length}/{ACHIEVEMENTS.length} Completados</div>
              {ACHIEVEMENTS.map(a => {
                const done = (gs.achievements || []).includes(a.id);
                return (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: done ? `${T.win}08` : T.bg1, borderRadius: 6, border: `1px solid ${done ? T.win + '20' : T.border}` }}>
                    <div style={{ fontSize: 20, minWidth: 28, textAlign: 'center', opacity: done ? 1 : 0.3 }}>{a.i}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, color: done ? T.tx : T.tx3 }}>{a.n}</div>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: done ? T.tx2 : T.tx3 }}>{a.d}</div>
                    </div>
                    {done && <div style={{ fontFamily: "'Oswald'", fontSize: 10, color: T.win }}>✓</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div style={{ padding: '10px 16px', width: '100%', maxWidth: 440 }}>
          <button onClick={() => go('title')} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, padding: '10px 28px', border: `1.5px solid ${T.tx3}`, background: 'transparent', color: T.tx, borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', width: '100%' }}>Volver</button>
        </div>
      </div>
    );
  };

  // ─── CAREER SCREENS ───
  const CareerCreateScreen = () => {
    const [name, setName] = useState('');
    const [pos, setPos] = useState(null);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, background: 'radial-gradient(ellipse at 50% 60%,#1a2a10 0%,#0b1120 70%)', padding: 16, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 32, color: '#fff', textTransform: 'uppercase' }}>Modo Carrera</div>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 14, color: '#607d8b' }}>Crea tu jugador. De chamaco a leyenda.</div>
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
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={() => { setCareer(null); go('title'); }} style={{ fontFamily: "'Oswald'", fontSize: 12, padding: '8px 16px', border: '1px solid #607d8b', background: 'transparent', color: '#e8eaf6', borderRadius: 4, cursor: 'pointer' }}>Volver</button>
          <button onClick={() => { if (!name || !pos) return; const c = initCareer(name, pos); c.cardQueue = getCareerCards(c); setCareer(c); setCareerScreen('cards'); SFX.play('whistle'); }} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, padding: '10px 28px', border: 'none', background: (name && pos) ? 'linear-gradient(135deg,#d4a017,#f0c040)' : '#333', color: (name && pos) ? '#1a1a2e' : '#666', clipPath: 'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)', cursor: (name && pos) ? 'pointer' : 'not-allowed' }}>Comenzar</button>
        </div>
      </div>
    );
  };

  const CareerCardScreen = () => {
    const c = career;
    if (!c) return null;
    const [slideDir, setSlideDir] = useState(null);
    const currentCard = c.cardQueue[0];
    if (!currentCard) { setTimeout(() => setCareerScreen('match'), 100); return null; }
    if (c.retired) { setTimeout(() => setCareerScreen('careerEnd'), 100); return null; }

    function chooseOption(option) {
      const effects = currentCard[option]?.e || {};
      SFX.play('click'); setSlideDir(option === 'a' ? 'left' : 'right');
      setTimeout(() => {
        setCareer(prev => {
          const next = { ...prev, bars: applyBarEffects(prev, effects), cardQueue: prev.cardQueue.slice(1) };
          const end = checkCareerEnd(next);
          if (end) { next.retired = true; next.retireReason = end; }
          return next;
        });
        setSlideDir(null);
      }, 400);
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg }}>
        <CareerBars bars={c.bars} />
        <div style={{ padding: '4px 12px', display: 'flex', justifyContent: 'space-between', fontFamily: "'Barlow Condensed'", fontSize: 11, color: '#607d8b' }}>
          <span>{c.name} · {c.age} años · {PN[c.pos]}</span>
          <span>{CAREER_TEAMS[Math.min(c.team, CAREER_TEAMS.length - 1)]} · Temp {c.season}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflow: 'hidden' }}>
          <div style={{ width: '100%', maxWidth: 340, background: 'linear-gradient(135deg,#141e3a,#1a2744)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, textAlign: 'center', transform: slideDir === 'left' ? 'translateX(-120%) rotate(-8deg)' : slideDir === 'right' ? 'translateX(120%) rotate(8deg)' : 'translateX(0)', opacity: slideDir ? 0 : 1, transition: 'transform 0.35s ease, opacity 0.3s ease' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{currentCard.who?.split(' ')[0]}</div>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, color: '#f0c040', textTransform: 'uppercase' }}>{currentCard.who}</div>
            <div style={{ fontFamily: "'Barlow'", fontSize: 16, color: '#e8eaf6', lineHeight: 1.5, margin: '12px 0', minHeight: 60 }}>{currentCard.text}</div>
            <div style={{ display: 'flex', flexDirection: !currentCard.b ? 'column' : 'row', gap: 8, marginTop: 12 }}>
              <button onClick={() => chooseOption('a')} style={{ flex: 1, padding: '12px 8px', background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)', borderRadius: 6, cursor: 'pointer', fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, color: '#00e676', textTransform: 'uppercase' }}>{currentCard.a?.l || 'OK'}</button>
              {currentCard.b && (<button onClick={() => chooseOption('b')} style={{ flex: 1, padding: '12px 8px', background: 'rgba(255,23,68,0.06)', border: '1px solid rgba(255,23,68,0.2)', borderRadius: 6, cursor: 'pointer', fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, color: '#ff1744', textTransform: 'uppercase' }}>{currentCard.b?.l || 'No'}</button>)}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: 6, fontFamily: "'Barlow Condensed'", fontSize: 10, color: '#455a64' }}>{c.cardQueue.length - 1} decisiones restantes</div>
      </div>
    );
  };

  const CareerMatchScreen = () => {
    const c = career;
    if (!c) return null;
    const [matchCards] = useState(() => getMatchCards(c.pos));
    const [cardIdx, setCardIdx] = useState(0);
    const [matchScore, setMatchScore] = useState({ yours: 0, rival: 0, rating: 5.0, events: [] });
    const [slideDir, setSlideDir] = useState(null);
    const [done, setDone] = useState(false);
    const teamName = CAREER_TEAMS[Math.min(c.team, CAREER_TEAMS.length - 1)];
    const rivalName = pick(RIVAL_NAMES[Math.min(c.team, RIVAL_NAMES.length - 1)] || RIVAL_NAMES[0]);
    const currentCard = matchCards[cardIdx];

    function chooseMatchOption(option) {
      const opt = currentCard[option];
      const effects = opt?.e || {};
      const goalChance = opt?.goal || 0;
      SFX.play('click'); setSlideDir(option === 'a' ? 'left' : 'right');
      setTimeout(() => {
        let newScore = { ...matchScore };
        let ratingDelta = (effects.rend || 0) * 0.08;
        if (goalChance > 0 && Math.random() < goalChance) { newScore.yours++; ratingDelta += 1.0; newScore.events.push(`⚽ ¡Gol de ${c.name}!`); SFX.play('goal'); }
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
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, background: T.bg, padding: 16, textAlign: 'center', overflow: 'auto' }}>
          <CareerBars bars={career.bars} />
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 26, color: won ? '#00e676' : drew ? '#ffd600' : '#ff1744' }}>{won ? 'VICTORIA' : drew ? 'EMPATE' : 'DERROTA'}</div>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 48, color: '#fff' }}>{matchScore.yours} - {matchScore.rival}</div>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 28, color: finalRating >= 7 ? '#00e676' : finalRating >= 5 ? '#ffd600' : '#ff1744' }}>Rating: {finalRating}</div>
          {matchScore.events.map((e, i) => (<div key={i} style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: '#e8eaf6' }}>{e}</div>))}
          <button onClick={() => {
            SFX.play('click');
            setCareer(prev => {
              const next = { ...prev };
              next.totalMatches++; next.matchNum++; next.matchesThisSeason++;
              next.seasonGoals += matchScore.yours; next.ratings.push(finalRating); next.goals += matchScore.yours;
              if (next.matchesThisSeason >= 8) return next;
              next.cardQueue = getCareerCards(next);
              const end = checkCareerEnd(next);
              if (end) { next.retired = true; next.retireReason = end; }
              return next;
            });
            if (career.matchesThisSeason + 1 >= 8) setCareerScreen('seasonEnd');
            else if (career.retired) setCareerScreen('careerEnd');
            else setCareerScreen('cards');
          }} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, padding: '10px 28px', border: 'none', background: 'linear-gradient(135deg,#d4a017,#f0c040)', color: '#1a1a2e', clipPath: 'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)', cursor: 'pointer', textTransform: 'uppercase', marginTop: 8 }}>Continuar</button>
        </div>
      );
    }
    if (!currentCard) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'linear-gradient(180deg,#132010 0%,#0b1120 40%)' }}>
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
        <div style={{ textAlign: 'center', padding: 6, fontFamily: "'Barlow Condensed'", fontSize: 10, color: '#455a64' }}>Decisión {cardIdx + 1}/{matchCards.length} · Rating: {Math.round(matchScore.rating * 10) / 10}</div>
      </div>
    );
  };

  const CareerSeasonEnd = () => {
    const c = career;
    if (!c) return null;
    const avgRating = c.ratings.length ? Math.round(c.ratings.reduce((a, b) => a + b, 0) / c.ratings.length * 10) / 10 : 5.0;
    const canAscend = avgRating >= 6.5 && c.team < CAREER_TEAMS.length - 1;
    const mustDescend = avgRating < 4.0 && c.team > 0;
    const teamName = CAREER_TEAMS[Math.min(c.team, CAREER_TEAMS.length - 1)];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, background: T.bg, padding: 16, textAlign: 'center', overflow: 'auto' }}>
        <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 28, color: '#f0c040', textTransform: 'uppercase' }}>Fin de Temporada {c.season}</div>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 14, color: '#607d8b' }}>{c.name} · {c.age} años · {teamName}</div>
        <CareerBars bars={c.bars} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, maxWidth: 300, width: '100%' }}>
          {[{ l: 'Rating prom.', v: avgRating, c: avgRating >= 7 ? '#00e676' : '#ffd600' }, { l: 'Goles', v: c.seasonGoals, c: '#42a5f5' }, { l: 'Partidos', v: c.matchesThisSeason, c: '#fff' }].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 4, padding: '8px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 22, color: s.c }}>{s.v}</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, color: '#607d8b' }}>{s.l}</div>
            </div>
          ))}
        </div>
        {canAscend && <div style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.15)', borderRadius: 6, padding: 10, maxWidth: 320 }}><div style={{ fontFamily: "'Oswald'", fontSize: 13, color: '#00e676' }}>🎉 ¡{CAREER_TEAMS[c.team + 1]} te quiere fichar!</div></div>}
        {mustDescend && <div style={{ background: 'rgba(255,23,68,0.06)', border: '1px solid rgba(255,23,68,0.15)', borderRadius: 6, padding: 10, maxWidth: 320 }}><div style={{ fontFamily: "'Oswald'", fontSize: 13, color: '#ff1744' }}>💀 Rating bajo. Te bajan.</div></div>}
        <button onClick={() => {
          SFX.play('reward');
          setCareer(prev => {
            const next = { ...prev };
            next.history.push({ season: next.season, age: next.age, team: teamName, rating: avgRating, goals: next.seasonGoals });
            next.season++; next.age++; next.matchesThisSeason = 0; next.matchNum = 0; next.seasonGoals = 0; next.ratings = [];
            if (canAscend) next.team = Math.min(CAREER_TEAMS.length - 1, next.team + 1);
            if (mustDescend) next.team = Math.max(0, next.team - 1);
            next.bars = applyAging(next);
            const end = checkCareerEnd(next);
            if (end) { next.retired = true; next.retireReason = end; }
            next.cardQueue = getCareerCards(next);
            return next;
          });
          if (career.retired) setCareerScreen('careerEnd');
          else setCareerScreen('cards');
        }} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, padding: '10px 28px', border: 'none', background: 'linear-gradient(135deg,#d4a017,#f0c040)', color: '#1a1a2e', clipPath: 'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)', cursor: 'pointer', textTransform: 'uppercase', marginTop: 8 }}>
          {canAscend ? `Fichar por ${CAREER_TEAMS[c.team + 1]}` : 'Siguiente Temporada'}
        </button>
      </div>
    );
  };

  const CareerEndScreen = () => {
    const c = career;
    if (!c) return null;
    const avgRating = c.history.length ? Math.round(c.history.reduce((a, h) => a + h.rating, 0) / c.history.length * 10) / 10 : 5.0;
    const maxTeam = Math.max(...c.history.map(h => CAREER_TEAMS.indexOf(h.team)).filter(i => i >= 0), c.team);
    const legendLevel = maxTeam >= 6 ? 'LEYENDA INMORTAL' : maxTeam >= 5 ? 'Estrella Mundial' : maxTeam >= 3 ? 'Seleccionado' : 'Crack del Barrio';
    const legendColor = maxTeam >= 6 ? '#f0c040' : maxTeam >= 5 ? '#d500f9' : maxTeam >= 3 ? '#42a5f5' : '#607d8b';
    useEffect(() => { maxTeam >= 5 ? SFX.play('victory') : SFX.play('defeat'); }, []);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'auto', background: 'linear-gradient(180deg,#1a0a0a 0%,#0b1120 30%)' }}>
        <div style={{ width: '100%', padding: '20px 16px', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 32, color: '#ff1744', textTransform: 'uppercase' }}>Fin de la Carrera</div>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 22, color: legendColor, marginTop: 4 }}>"{legendLevel}"</div>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 14, color: '#607d8b', marginTop: 4 }}>{c.name} · Retirado a los {c.age} · {c.retireReason}</div>
        </div>
        <div style={{ padding: '8px 20px', maxWidth: 360, textAlign: 'center' }}>
          <div style={{ fontSize: 32 }}>👴</div>
          <div style={{ fontFamily: "'Barlow'", fontSize: 14, color: '#e8eaf6', lineHeight: 1.5, fontStyle: 'italic', marginTop: 6 }}>
            {maxTeam >= 5 ? '"Lo lograste, mijo. Desde El Potrero hasta el mundo."' : '"Llegaste lejos, mijo. Más lejos de lo que cualquiera esperaba."'}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, maxWidth: 340, width: '100%', padding: '0 16px', margin: '8px 0' }}>
          {[{ l: 'Temporadas', v: c.season - 1, c: '#fff' }, { l: 'Goles', v: c.goals, c: '#42a5f5' }, { l: 'Rating prom.', v: avgRating, c: '#f0c040' }].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 4, padding: '6px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 18, color: s.c }}>{s.v}</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 8, color: '#607d8b', textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px', width: '100%', maxWidth: 340 }}>
          <button onClick={() => { setCareer(null); setCareerScreen('create'); go('title'); }} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, padding: '10px 28px', border: 'none', background: 'linear-gradient(135deg,#d4a017,#f0c040)', color: '#1a1a2e', clipPath: 'polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)', cursor: 'pointer', textTransform: 'uppercase', width: '100%' }}>Volver al Menú</button>
        </div>
      </div>
    );
  };

  // ─── RENDER ───
  const transStyle = { opacity: transState === 'out' ? 0 : 1, transform: transState === 'out' ? 'scale(0.97)' : 'scale(1)', transition: 'opacity 0.22s ease, transform 0.22s ease' };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: T.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@400;500;600&display=swap');
        @keyframes fw-fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fw-pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes fw-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fw-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        .fw-anim-1{animation:fw-fadeUp .4s ease .05s both}.fw-anim-2{animation:fw-fadeUp .4s ease .12s both}.fw-anim-3{animation:fw-fadeUp .4s ease .2s both}.fw-anim-4{animation:fw-fadeUp .4s ease .28s both}.fw-anim-5{animation:fw-fadeUp .4s ease .36s both}
        .fw-float{animation:fw-float 3s ease-in-out infinite}.fw-pulse{animation:fw-pulse 2s ease infinite}
        .fw-shimmer{background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.06) 50%,transparent 100%);background-size:200% 100%;animation:fw-shimmer 2.5s linear infinite}
        .fw-btn{font-family:'Oswald';font-weight:600;font-size:14px;padding:11px 28px;border:none;border-radius:6px;cursor:pointer;text-transform:uppercase;letter-spacing:1px;transition:transform .12s,filter .1s;}
        .fw-btn:active{transform:scale(.93)!important;filter:brightness(.9)}.fw-btn:disabled{opacity:.4;cursor:not-allowed}
        .fw-btn-primary{background:linear-gradient(135deg,#d4a017,#f0c040);color:#0b1120}.fw-btn-green{background:linear-gradient(135deg,#00c853,#00e676);color:#0b1120}.fw-btn-outline{background:transparent;border:1.5px solid currentColor}
        *{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px}
      `}</style>
      <div style={{ ...transStyle, width: '100%', height: '100%', position: 'relative' }}>
        {screen === 'loading' && <LoadingScreen />}
        {screen === 'title' && <TitleScreen />}
        {screen === 'tutorial' && <TutorialScreen />}
        {screen === 'coach' && <CoachScreen />}
        {screen === 'table' && <TableScreen />}
        {screen === 'market' && <MarketScreen />}
        {screen === 'roster' && <RosterScreen />}
        {screen === 'training' && <TrainingScreen />}
        {screen === 'boardEvent' && <BoardEventScreen />}
        {screen === 'prematch' && <PrematchScreen />}
        {screen === 'match' && <MatchScreen />}
        {screen === 'rewards' && <RewardsScreen />}
        {screen === 'ascension' && <AscensionScreen />}
        {screen === 'champion' && <ChampionScreen />}
        {screen === 'death' && <DeathScreen />}
        {screen === 'stats' && <StatsScreen />}
        {screen === 'career' && (
          careerScreen === 'create' ? <CareerCreateScreen /> :
            careerScreen === 'cards' ? <CareerCardScreen /> :
              careerScreen === 'match' ? <CareerMatchScreen /> :
                careerScreen === 'seasonEnd' ? <CareerSeasonEnd /> :
                  careerScreen === 'careerEnd' ? <CareerEndScreen /> :
                    <CareerCreateScreen />
        )}
        {detailPlayer && <PlayerDetailModal player={detailPlayer} onClose={() => setDetailPlayer(null)} captainId={game.captain} />}
        {pendingLevelUp && (
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
                        const gainedXp = p.trait?.fx === 'xp' ? Math.floor(xpGain * 1.5) : xpGain;
                        const newXp = (p.xp || 0) + gainedXp;
                        const newXpNext = p.xpNext || 20;
                        return { ...choice.apply({ ...p }), lv: p.lv + 1, xp: Math.max(0, newXp - newXpNext), xpNext: (p.lv + 1) * 10 + 20 };
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
        )}
      </div>
    </div>
  );
}