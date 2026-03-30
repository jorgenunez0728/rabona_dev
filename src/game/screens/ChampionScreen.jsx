import { useEffect } from "react";
import { SFX } from "@/game/audio";
import { T, calcOvr, ACHIEVEMENTS } from "@/game/data";
import { saveGlobalStats } from "@/game/save";
import useGameStore from "@/game/store";

export default function ChampionScreen() {
  const { game, globalStats, setGlobalStats, checkAchievements, handleDeleteSave, go, saveRunSnapshot, saveRufusPhoto } = useGameStore();

  const cs = game.careerStats || {};
  const bestPlayer = game.roster.length > 0 ? [...game.roster].sort((a, b) => calcOvr(b) - calcOvr(a))[0] : null;
  useEffect(() => { SFX.play('victory'); }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', overflow: 'auto', background: `radial-gradient(ellipse at 50% 20%, rgba(240,192,64,0.08) 0%, ${T.bg} 60%)`, padding: 16, textAlign: 'center' }}>
      <div className="stadium-glow" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, pointerEvents: 'none' }} />
      <div style={{ fontSize: 60, filter: 'drop-shadow(0 0 24px rgba(240,192,64,0.4))', animation: 'pulse 2s ease-in-out infinite' }}>🏆</div>
      <div className="text-gradient-gold" style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 32, textTransform: 'uppercase', textShadow: T.glowGold, marginTop: 8, letterSpacing: 2 }}>¡¡CAMPEONES!!</div>
      <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 22, color: T.tx, textTransform: 'uppercase', marginTop: 4 }}>Liga Intergaláctica</div>
      {globalStats.rufus && <div className="fw-bounceIn" style={{ fontSize: 36, marginTop: 4 }}>🐕🎉</div>}
      <div style={{ maxWidth: 340, margin: '16px 0' }}>
        <div style={{ fontSize: 36 }}>👴</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 17, color: T.tx, lineHeight: 1.5, fontStyle: 'italic', marginTop: 6 }}>"Lo logramos, mijo. Desde la cancha llanera hasta las estrellas."</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, maxWidth: 340, width: '100%', margin: '8px 0' }}>
        {[{ l: 'Partidos', v: cs.matchesPlayed || 0 }, { l: 'Victorias', v: cs.wins || 0 }, { l: 'Goles', v: cs.goalsFor || 0 }].map((s, i) => (
          <div key={i} className="glass" style={{ borderRadius: 10, padding: '10px 6px', textAlign: 'center', border: `1px solid ${T.gold}25`, boxShadow: T.glowGold }}>
            <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 22, color: T.gold }}>{s.v}</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3, letterSpacing: 0.5 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <button className="fw-btn fw-btn-primary" onClick={async () => {
        const newGS = { ...globalStats, totalRuns: (globalStats.totalRuns || 0) + 1, totalWins: (globalStats.totalWins || 0) + (cs.wins || 0), totalGoals: (globalStats.totalGoals || 0) + (cs.goalsFor || 0), bestLeague: 7, bestLeagueName: '🏆 CAMPEÓN GALÁCTICO', ascensionLevel: Math.min(7, (globalStats.ascensionLevel || 0) + 1) };
        newGS.allTimeAssisters = { ...(newGS.allTimeAssisters || {}) };
        Object.entries(cs.assisters || {}).forEach(([n, a]) => { newGS.allTimeAssisters[n] = (newGS.allTimeAssisters[n] || 0) + a; });
        newGS.allTimeCleanSheets = { ...(newGS.allTimeCleanSheets || {}) };
        Object.entries(cs.cleanSheets || {}).forEach(([n, c]) => { newGS.allTimeCleanSheets[n] = (newGS.allTimeCleanSheets[n] || 0) + c; });
        if (bestPlayer) newGS.hallOfFame = [...(newGS.hallOfFame || []), { name: bestPlayer.name, pos: bestPlayer.pos, ovr: calcOvr(bestPlayer), atk: bestPlayer.atk, def: bestPlayer.def, spd: bestPlayer.spd, sav: bestPlayer.sav || 1, trait: bestPlayer.trait?.n, league: '🏆 CAMPEÓN', run: newGS.totalRuns }].slice(-20);
        // ── Merge in-run achievement flags ──
        if (cs.hadGoleada) newGS.hadGoleada = true;
        if (cs.hadRemontada) newGS.hadRemontada = true;
        if (cs.hadHumillacion) newGS.hadHumillacion = true;
        if (cs.hadHatTrick) newGS.hadHatTrick = true;
        if (cs.hadLastMinuteWinner) newGS.hadLastMinuteWinner = true;
        if (cs.hadMassInjury) newGS.hadMassInjury = true;
        if (cs.hadBancarrota) newGS.hadBancarrota = true;
        if ((cs.bestCleanStreak || 0) >= 5) newGS.hadCleanStreak5 = true;
        if ((cs.narrowLosses || 0) >= 3) newGS.hadNarrowLosses3 = true;
        if ((cs.worstLoseStreak || 0) >= 3) newGS.hadLoseStreak3 = true;
        newGS.maxSimultaneousCurses = Math.max(newGS.maxSimultaneousCurses || 0, cs.maxSimultaneousCurses || 0);
        if (cs.losses === 0 && cs.matchesPlayed >= 8) newGS.hadUndefeatedLeague = true;
        const topGoals = Math.max(...Object.values(cs.scorers || {}), 0);
        if (topGoals > 0 && cs.goalsFor > 0 && topGoals / cs.goalsFor >= 0.8) newGS.hadOneManArmy = true;
        if ((game.playersBought || 0) === 0 && game.archetype !== 'cantera' && cs.matchesPlayed >= 8) newGS.hadNoMarketWin = true;
        if ((game.coins || 0) >= 100) newGS.hadTacano = true;
        if ((game.playersBought || 0) + (game.playersSold || 0) >= 10) newGS.hadComerciante = true;
        if (cs.matchesPlayed <= 8) newGS.hadSpeedrun = true;
        // Track archetype champion win
        if (game.archetype) { newGS.archetypeWins = { ...(newGS.archetypeWins || {}) }; newGS.archetypeWins[game.archetype] = true; }
        const finalGS = checkAchievements(newGS);
        setGlobalStats(finalGS); saveGlobalStats(finalGS);
        // Save run to history
        saveRunSnapshot({ endType: 'champion', leagueName: 'Liga Intergaláctica', leagueIcon: '🛸', finalPosition: 1, immortalizedPlayer: bestPlayer ? { name: bestPlayer.name, pos: bestPlayer.pos, ovr: calcOvr(bestPlayer) } : null });
        // Rufus trophy photo
        if (finalGS.rufus) {
          saveRufusPhoto({ runNum: finalGS.totalRuns, leagueName: 'Liga Intergaláctica', teamName: game.teamName || 'Mi equipo', accessories: { ...(finalGS.rufus.equipped || {}) }, timestamp: Date.now() });
        }
        handleDeleteSave(); go('title');
      }} style={{ fontFamily: T.fontTitle, fontWeight: 600, fontSize: 16, padding: '14px 40px', background: T.gradientPrimary, color: T.bg, borderRadius: 10, cursor: 'pointer', textTransform: 'uppercase', marginTop: 16, boxShadow: T.glowGold, border: 'none', letterSpacing: 1 }}>🏆 Al Salón de la Fama</button>
    </div>
  );
}
