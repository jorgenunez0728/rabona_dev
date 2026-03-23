import { useState, useRef } from "react";
import { SFX } from "@/game/audio";
import { FormIcon } from "@/game/data/chibiAssets";
import {
  LEAGUES, STADIUMS, RIVAL_NAMES, RIVAL_COACHES, ASCENSION_MODS,
  FORMATIONS, MATCH_OBJECTIVES, getNemesis,
  PN, POS_COLORS, POS_ORDER, T,
  genPlayer, pick, effectiveOvr, teamPower,
} from "@/game/data";
import { getStadiumFront } from "@/assets/stadiums";
import useGameStore from "@/game/store";

export default function PrematchScreen() {
  const { game, setGame, match, setMatch, matchType, go, setScreen } = useGameStore();

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
      if (matchType === 'elite') { rp.atk += 3; rp.def += 3; rp.spd += 2; }
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
      <div style={{ background: isNemesisMatch ? 'linear-gradient(135deg,#4a148c,#880e4f)' : isCopaMatch ? 'linear-gradient(135deg,#f9a825,#e65100)' : 'linear-gradient(135deg,#4FC3F7,#0288D1)', padding: '14px 16px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Oswald'", fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
          {isCopaMatch ? `🏆 Copa · Ronda ${(copa?.round || 0) + 1}` : isNemesisMatch ? '⚔️ DUELO DE RIVALES' : `${lg.i} Jornada ${game.matchNum + 1}`}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14 }}>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 22, color: '#fff', textTransform: 'uppercase' }}>HALCONES</div>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 16, color: 'rgba(255,255,255,0.25)' }}>VS</div>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 22, color: '#fff', textTransform: 'uppercase' }}>{rivalName}</div>
        </div>
        {isCopaMatch && <div style={{ fontSize: 12, color: '#fff', marginTop: 4, background: 'rgba(255,0,0,0.3)', padding: '3px 10px', borderRadius: 4, fontWeight: 700 }}>💀 PERDER = FIN DE LA CARRERA</div>}
      </div>
      {getStadiumFront(game.league) ? (
        <div style={{ position: 'relative', overflow: 'hidden', maxHeight: 140 }}>
          <img src={getStadiumFront(game.league)} alt={st.n} style={{ width: '100%', display: 'block', objectFit: 'cover', objectPosition: 'top' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', padding: '16px 16px 6px' }}>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, color: st.c, textTransform: 'uppercase', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{st.n}</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{st.d}</div>
          </div>
        </div>
      ) : (
        <div style={{ background: T.bg1, padding: '8px 16px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 14, color: st.c, textTransform: 'uppercase' }}>{st.n}</div>
        </div>
      )}
      {/* Formation Selector */}
      <div style={{ padding: '8px 12px', background: T.bg1, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: "'Oswald'", fontSize: 12, color: T.tx3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>Formación</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {FORMATIONS.map(f => {
            const active = game.formation === f.id;
            return (
              <div key={f.id} onClick={() => setGame(g => ({ ...g, formation: f.id }))} style={{ flex: 1, padding: '6px 4px', background: active ? `${T.info}15` : T.bg2, border: `1px solid ${active ? T.info + '60' : T.border}`, borderRadius: 5, cursor: 'pointer', textAlign: 'center' }}>
                <FormIcon id={f.id} size={28} />
                <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: active ? T.info : T.tx3, textTransform: 'uppercase', marginTop: 1, lineHeight: 1.2, letterSpacing: 0.5 }}>{f.n.split('(')[1]?.replace(')','') || f.id}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 9, color: f.mods.atkMult > 1 ? T.win : f.mods.atkMult < 1 ? T.lose : T.tx3 }}>ATK {f.mods.atkMult > 1 ? '▲' : f.mods.atkMult < 1 ? '▼' : '—'}</span>
                  <span style={{ fontSize: 9, color: f.mods.defMult > 1 ? T.win : f.mods.defMult < 1 ? T.lose : T.tx3 }}>DEF {f.mods.defMult > 1 ? '▲' : f.mods.defMult < 1 ? '▼' : '—'}</span>
                  <span style={{ fontSize: 9, color: f.mods.spdMult > 1 ? T.win : f.mods.spdMult < 1 ? T.lose : T.tx3 }}>VEL {f.mods.spdMult > 1 ? '▲' : f.mods.spdMult < 1 ? '▼' : '—'}</span>
                </div>
              </div>
            );
          })}
        </div>
        {currentFormation && <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx2, marginTop: 4, textAlign: 'center' }}>{currentFormation.desc}</div>}
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
        <div style={{ textAlign: 'center' }}><div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: '#607d8b', textTransform: 'uppercase' }}>Halcones</div><div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 28, color: '#42a5f5' }}>{tp}</div></div>
        <div style={{ fontFamily: "'Oswald'", fontSize: 12, color: '#455a64' }}>VS</div>
        <div style={{ textAlign: 'center' }}><div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: '#607d8b', textTransform: 'uppercase' }}>{rivalName}</div><div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 28, color: '#ef5350' }}>{rtp}</div></div>
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
}
