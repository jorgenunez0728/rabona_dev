import { useEffect } from "react";
import { SFX } from "@/game/audio";
import { T, calcOvr, ACHIEVEMENTS } from "@/game/data";
import { saveGlobalStats } from "@/game/save";
import useGameStore from "@/game/store";

export default function ChampionScreen() {
  const { game, globalStats, setGlobalStats, checkAchievements, handleDeleteSave, go } = useGameStore();

  const cs = game.careerStats || {};
  const bestPlayer = game.roster.length > 0 ? [...game.roster].sort((a, b) => calcOvr(b) - calcOvr(a))[0] : null;
  useEffect(() => { SFX.play('victory'); }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', overflow: 'auto', background: 'radial-gradient(ellipse at 50% 30%,#2a2510 0%,#0b1120 60%)', padding: 16, textAlign: 'center' }}>
      <div style={{ fontSize: 60 }}>🏆</div>
      <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 32, color: '#f0c040', textTransform: 'uppercase', textShadow: '0 0 30px rgba(240,192,64,0.3)', marginTop: 8, letterSpacing: 2 }}>¡¡CAMPEONES!!</div>
      <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 22, color: '#fff', textTransform: 'uppercase', marginTop: 4 }}>Liga Intergaláctica</div>
      <div style={{ maxWidth: 340, margin: '16px 0' }}>
        <div style={{ fontSize: 36 }}>👴</div>
        <div style={{ fontFamily: "'Barlow'", fontSize: 17, color: '#e8eaf6', lineHeight: 1.5, fontStyle: 'italic', marginTop: 6 }}>"Lo logramos, mijo. Desde la cancha llanera hasta las estrellas."</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, maxWidth: 340, width: '100%', margin: '8px 0' }}>
        {[{ l: 'Partidos', v: cs.matchesPlayed || 0 }, { l: 'Victorias', v: cs.wins || 0 }, { l: 'Goles', v: cs.goalsFor || 0 }].map((s, i) => (
          <div key={i} style={{ background: 'rgba(240,192,64,0.06)', borderRadius: 4, padding: '6px', textAlign: 'center', border: '1px solid rgba(240,192,64,0.15)' }}>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 20, color: '#f0c040' }}>{s.v}</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: '#607d8b', letterSpacing: 0.5 }}>{s.l}</div>
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
}
