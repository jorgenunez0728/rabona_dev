import { useEffect } from "react";
import { SFX } from "@/game/audio";
import { CUTSCENES, LEAGUES, STADIUMS, RIVAL_NAMES, T } from "@/game/data";
import { CoachPortrait } from "@/game/components";
import useGameStore from "@/game/store";

export default function AscensionScreen() {
  const { pendingLeague, setPendingLeague, game, setGame, go } = useGameStore();

  const nL = pendingLeague;
  useEffect(() => { SFX.play('ascend'); }, []);
  if (nL === null) return null;
  const cs = CUTSCENES[Math.min(nL - 1, CUTSCENES.length - 1)];
  const fromLg = LEAGUES[nL - 1], toLg = LEAGUES[nL], st = STADIUMS[nL];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', overflow: 'auto', background: `radial-gradient(ellipse at 50% 40%, rgba(34,197,94,0.06) 0%, ${T.bg} 70%)`, padding: 16, textAlign: 'center' }}>
      <div className="stadium-glow" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, pointerEvents: 'none' }} />
      <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 13, color: T.win, textTransform: 'uppercase', letterSpacing: 3 }}>🎉 ¡ASCENSO!</div>
      <div className="text-gradient-gold" style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 24, textTransform: 'uppercase', marginTop: 6, letterSpacing: 1 }}>{cs.title}</div>
      <div style={{ fontFamily: T.fontBody, fontSize: 16, color: T.tx3, marginTop: 4 }}>{cs.sub}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' }}>
        <div className="glass" style={{ borderRadius: 10, padding: '8px 16px', textAlign: 'center' }}><div style={{ fontSize: 20 }}>{fromLg.i}</div><div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3 }}>{fromLg.n}</div></div>
        <div style={{ fontFamily: T.fontHeading, fontSize: 20, color: T.gold }}>→</div>
        <div className="glass" style={{ borderRadius: 10, padding: '8px 16px', border: `1px solid ${T.gold}25`, textAlign: 'center', boxShadow: T.glowGold }}><div style={{ fontSize: 20 }}>{toLg.i}</div><div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.gold }}>{toLg.n}</div></div>
      </div>
      <div style={{ maxWidth: 340, margin: '8px 0' }}>
        <div style={{ fontSize: 36 }}><CoachPortrait id="miguel" size={40} /></div>
        <div style={{ fontFamily: T.fontBody, fontSize: 17, color: T.tx, lineHeight: 1.5, fontStyle: 'italic', marginTop: 6 }}>{cs.quote}</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx3, lineHeight: 1.4, marginTop: 8 }}>{cs.detail}</div>
      </div>
      <button className="fw-btn fw-btn-primary" onClick={() => {
        SFX.play('reward');
        const rns = RIVAL_NAMES[nL] || RIVAL_NAMES[0];
        const table = [{ name: game.teamName || 'Halcones FC', you: true, w: 0, d: 0, l: 0, gf: 0, ga: 0 }, ...rns.map(n => ({ name: n, you: false, w: 0, d: 0, l: 0, gf: 0, ga: 0 }))];
        setGame(g => ({ ...g, league: nL, matchNum: 0, table }));
        setPendingLeague(null); go('table');
      }} style={{ fontFamily: T.fontTitle, fontWeight: 600, fontSize: 14, padding: '14px 40px', background: T.gradientPrimary, color: T.bg, borderRadius: 10, cursor: 'pointer', textTransform: 'uppercase', marginTop: 14, boxShadow: T.glowGold, border: 'none', letterSpacing: 1 }}>Comenzar {toLg.n}</button>
    </div>
  );
}
