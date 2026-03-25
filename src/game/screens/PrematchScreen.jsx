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

  const matchBadgeBg = isNemesisMatch
    ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
    : isCopaMatch
      ? T.gradientPrimary
      : 'linear-gradient(135deg, #3B82F6, #2563EB)';
  const matchBadgeColor = isCopaMatch ? T.bg : '#fff';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto', background: T.bg }}>

      {/* Stadium glow background + VS header */}
      <div style={{ position: 'relative', background: T.gradientDark, borderBottom: `1px solid ${T.glassBorder}` }}>
        {/* Stadium atmosphere */}
        <div style={{ position: 'absolute', inset: 0, background: T.gradientStadium, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', padding: '18px 16px 14px', textAlign: 'center' }}>
          {/* Match type badge */}
          <div style={{ display: 'inline-block', marginBottom: 10 }}>
            <span style={{
              fontFamily: T.fontHeading, fontSize: 11, color: matchBadgeColor,
              letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600,
              background: matchBadgeBg, padding: '4px 14px', borderRadius: 20,
              boxShadow: T.shadow
            }}>
              {isCopaMatch ? `Copa \u00B7 Ronda ${(copa?.round || 0) + 1}` : isNemesisMatch ? 'Duelo de Rivales' : `${lg.i} Jornada ${game.matchNum + 1}`}
            </span>
          </div>

          {/* VS layout */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 24, color: T.tx, textTransform: 'uppercase', lineHeight: 1.1 }}>HALCONES</div>
            </div>
            <div style={{
              fontFamily: T.fontHeading, fontWeight: 700, fontSize: 28, color: T.tx4,
              width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${T.glassBorder}`, borderRadius: 8,
              background: T.glass
            }}>VS</div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 24, color: T.tx, textTransform: 'uppercase', lineHeight: 1.1 }}>{rivalName}</div>
            </div>
          </div>

          {isCopaMatch && (
            <div style={{
              fontFamily: T.fontHeading, fontSize: 11, color: '#fff', marginTop: 10,
              background: 'rgba(239,68,68,0.25)', padding: '5px 12px', borderRadius: 6,
              fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
              border: '1px solid rgba(239,68,68,0.3)', display: 'inline-block'
            }}>Perder = Fin de la Carrera</div>
          )}

          {/* Primary CTA - Jugar button right after VS */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14 }}>
            <button className="fw-btn fw-btn-outline" onClick={() => go('roster')} style={{
              fontFamily: T.fontHeading, fontWeight: 600, fontSize: 12,
              padding: '9px 18px', color: T.tx2, textTransform: 'uppercase',
              letterSpacing: 0.8, borderRadius: 8
            }}>Roster</button>
            <button className={`fw-btn ${injuredStarters.length > 0 ? 'fw-btn-danger' : ''}`} onClick={() => {
              const objs = objRef.current || [];
              setGame(g => ({ ...g, currentObjectives: objs }));
              setMatch({ ps: 0, rs: 0, minute: 0, speed: 2, running: true, rival: { name: rivalName }, rivalPlayers: rpRef.current, rivalCoach: rcRef.current, ballX: .5, ballY: .5, possession: true, log: [], eventPopup: null });
              rpRef.current = null; rcRef.current = null; objRef.current = null;
              SFX.play('whistle'); setScreen('match');
            }} style={{
              fontFamily: T.fontHeading, fontWeight: 700, fontSize: 15,
              padding: '11px 40px', textTransform: 'uppercase',
              letterSpacing: 1.5, borderRadius: 8,
              background: injuredStarters.length > 0 ? undefined : 'linear-gradient(135deg, #22C55E, #16A34A)',
              color: injuredStarters.length > 0 ? undefined : '#fff',
              border: injuredStarters.length > 0 ? undefined : '1px solid rgba(34,197,94,0.6)',
              boxShadow: '0 4px 20px rgba(34,197,94,0.3)',
              touchAction: 'manipulation',
            }}>Jugar</button>
          </div>
        </div>
      </div>

      {/* Stadium image */}
      {getStadiumFront(game.league) ? (
        <div style={{ position: 'relative', overflow: 'hidden', maxHeight: 140, background: T.bg1 }}>
          <img src={getStadiumFront(game.league)} alt={st.n} style={{ width: '100%', display: 'block', objectFit: 'cover', objectPosition: 'top' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: `linear-gradient(transparent, ${T.bg})`, padding: '16px 16px 8px' }}>
            <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 14, color: st.c, textTransform: 'uppercase', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{st.n}</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3 }}>{st.d}</div>
          </div>
        </div>
      ) : (
        <div style={{ background: T.bg1, padding: '8px 16px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 14, color: st.c, textTransform: 'uppercase' }}>{st.n}</div>
        </div>
      )}

      {/* Formation Selector */}
      <div className="glass-light" style={{ margin: '8px 10px', borderRadius: 10, padding: '10px 12px' }}>
        <div style={{ fontFamily: T.fontHeading, fontSize: 11, color: T.tx3, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, fontWeight: 600 }}>Formacion</div>
        <div style={{ display: 'flex', gap: 5 }}>
          {FORMATIONS.map(f => {
            const active = game.formation === f.id;
            return (
              <div key={f.id} onClick={() => setGame(g => ({ ...g, formation: f.id }))} style={{
                flex: 1, padding: '8px 4px',
                background: active ? `${T.gold}10` : T.bg2,
                border: `1.5px solid ${active ? T.gold + '80' : T.border}`,
                borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                boxShadow: active ? T.glowGold : 'none',
                transition: 'all 0.2s ease'
              }}>
                <FormIcon id={f.id} size={28} />
                <div style={{ fontFamily: T.fontHeading, fontSize: 10, color: active ? T.gold : T.tx3, textTransform: 'uppercase', marginTop: 2, lineHeight: 1.2, letterSpacing: 0.5 }}>{f.n.split('(')[1]?.replace(')','') || f.id}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: T.fontBody, fontSize: 9, color: f.mods.atkMult > 1 ? T.win : f.mods.atkMult < 1 ? T.lose : T.tx4 }}>ATK {f.mods.atkMult > 1 ? '+' : f.mods.atkMult < 1 ? '-' : '='}</span>
                  <span style={{ fontFamily: T.fontBody, fontSize: 9, color: f.mods.defMult > 1 ? T.win : f.mods.defMult < 1 ? T.lose : T.tx4 }}>DEF {f.mods.defMult > 1 ? '+' : f.mods.defMult < 1 ? '-' : '='}</span>
                  <span style={{ fontFamily: T.fontBody, fontSize: 9, color: f.mods.spdMult > 1 ? T.win : f.mods.spdMult < 1 ? T.lose : T.tx4 }}>VEL {f.mods.spdMult > 1 ? '+' : f.mods.spdMult < 1 ? '-' : '='}</span>
                </div>
              </div>
            );
          })}
        </div>
        {currentFormation && <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx2, marginTop: 6, textAlign: 'center' }}>{currentFormation.desc}</div>}
      </div>

      {/* Injured warning */}
      {injuredStarters.length > 0 && (
        <div style={{ margin: '0 10px 8px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ fontSize: 13, color: T.lose, fontFamily: T.fontHeading, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{injuredStarters.length} Lesionado(s) -- no pueden jugar</div>
        </div>
      )}

      {/* Team comparison panels */}
      <div style={{ display: 'flex', gap: 8, padding: '0 10px 8px', flex: 1 }}>
        {[{ t: 'Halcones', p: starters, c: game.coach, h: true }, { t: rivalName, p: rpRef.current, c: rcRef.current, h: false }].map((team, ti) => (
          <div key={ti} className="glass" style={{ flex: 1, padding: 8, borderRadius: 10, border: `1px solid ${T.glassBorder}` }}>
            <div style={{
              fontFamily: T.fontHeading, fontWeight: 600, fontSize: 11,
              color: team.h ? T.info : T.lose, textTransform: 'uppercase',
              paddingBottom: 6, borderBottom: `1px solid ${T.glassBorder}`, marginBottom: 6,
              letterSpacing: 0.8
            }}>{team.t}</div>
            {team.p.map((p, i) => (
              <div key={i} style={{
                fontFamily: T.fontBody, fontSize: 12, padding: '3px 0',
                display: 'flex', justifyContent: 'space-between',
                color: p.injuredFor > 0 ? T.lose : (p.fatigue || 0) > 70 ? T.draw : T.tx
              }}>
                <span style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{PN[p.pos]} {p.name}</span>
                <span style={{ fontWeight: 700, color: T.gold, fontSize: 12, fontFamily: T.fontHeading }}>{effectiveOvr(p)}</span>
              </div>
            ))}
            <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${T.glassBorder}` }}>
              <div style={{ fontFamily: T.fontBody, fontWeight: 600, fontSize: 11, color: T.accent }}>{team.c?.i} {team.c?.n}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Power comparison bar */}
      <div className="glass" style={{ margin: '0 10px 8px', borderRadius: 10, padding: '10px 0', border: `1px solid ${T.glassBorder}` }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Halcones</div>
            <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 30, color: T.info }}>{tp}</div>
          </div>
          <div style={{
            fontFamily: T.fontHeading, fontSize: 12, color: T.tx4,
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${T.border}`, borderRadius: 6, background: T.bg2
          }}>VS</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{rivalName}</div>
            <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 30, color: T.lose }}>{rtp}</div>
          </div>
        </div>
      </div>

      {/* Bottom spacer */}
      <div style={{ height: 12 }} />
    </div>
  );
}
