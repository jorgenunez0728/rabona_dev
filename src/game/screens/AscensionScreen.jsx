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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', overflow: 'auto', background: 'radial-gradient(ellipse at 50% 40%,#1a2a10 0%,#0b1120 70%)', padding: 16, textAlign: 'center' }}>
      <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 13, color: '#00e676', textTransform: 'uppercase', letterSpacing: 3 }}>🎉 ¡ASCENSO!</div>
      <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 24, color: '#f0c040', textTransform: 'uppercase', marginTop: 6, letterSpacing: 1 }}>{cs.title}</div>
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 16, color: '#607d8b', marginTop: 4 }}>{cs.sub}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '6px 14px', textAlign: 'center' }}><div style={{ fontSize: 20 }}>{fromLg.i}</div><div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: '#607d8b' }}>{fromLg.n}</div></div>
        <div style={{ fontFamily: "'Oswald'", fontSize: 20, color: '#f0c040' }}>→</div>
        <div style={{ background: 'rgba(240,192,64,0.06)', borderRadius: 6, padding: '6px 14px', border: '1px solid rgba(240,192,64,0.15)', textAlign: 'center' }}><div style={{ fontSize: 20 }}>{toLg.i}</div><div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: '#f0c040' }}>{toLg.n}</div></div>
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
}
