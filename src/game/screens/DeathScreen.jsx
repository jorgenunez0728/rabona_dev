import { useEffect } from "react";
import { SFX } from "@/game/audio";
import { T, LEAGUES, PN, POS_COLORS, calcOvr } from "@/game/data";
import { saveGlobalStats } from "@/game/save";
import useGameStore from "@/game/store";

export default function DeathScreen() {
  const { game, globalStats, setGlobalStats, checkAchievements, handleDeleteSave, go } = useGameStore();

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
}
