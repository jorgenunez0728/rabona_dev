import { useEffect, useState } from "react";
import { SFX } from "@/game/audio";
import { T, LEAGUES, PN, POS_COLORS, calcOvr } from "@/game/data";
import { Haptics } from "@/game/haptics";
import { saveGlobalStats } from "@/game/save";
import { generateCardReward, CARD_RARITIES } from "@/game/data/cards.js";
import { calcMutatorLegacyBonus } from "@/game/data/mutators.js";
import useGameStore from "@/game/store";

export default function DeathScreen() {
  const { game, globalStats, setGlobalStats, checkAchievements, handleDeleteSave, go, immortalizePlayer, addCardToCollection, saveCurseMasteryProgress, saveMutatorBonus, saveRunSnapshot } = useGameStore();
  const [immortalized, setImmortalized] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [cardReward, setCardReward] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardClaimed, setCardClaimed] = useState(false);

  const cs = game.careerStats || { wins: 0, losses: 0, draws: 0, goalsFor: 0, goalsAgainst: 0, matchesPlayed: 0, bestStreak: 0, scorers: {} };
  const lg = LEAGUES[game.league];
  const rosterSorted = [...game.roster].sort((a, b) => calcOvr(b) - calcOvr(a));

  useEffect(() => {
    SFX.play('defeat');
    // Save global stats (without Hall of Fame entry — that's now player-chosen)
    const newGS = { ...globalStats };
    newGS.totalRuns = (newGS.totalRuns || 0) + 1;
    newGS.totalMatches = (newGS.totalMatches || 0) + (cs.matchesPlayed || 0);
    newGS.totalWins = (newGS.totalWins || 0) + (cs.wins || 0);
    newGS.totalGoals = (newGS.totalGoals || 0) + (cs.goalsFor || 0);
    newGS.totalConceded = (newGS.totalConceded || 0) + (cs.goalsAgainst || 0);
    newGS.bestStreak = Math.max(newGS.bestStreak || 0, cs.bestStreak || 0);
    newGS.totalCoins = (newGS.totalCoins || 0) + (game.coins || 0);
    if (game.league > (newGS.bestLeague || 0)) { newGS.bestLeague = game.league; newGS.bestLeagueName = lg.n; }
    newGS.allTimeScorers = { ...(newGS.allTimeScorers || {}) };
    Object.entries(cs.scorers || {}).forEach(([name, goals]) => { newGS.allTimeScorers[name] = (newGS.allTimeScorers[name] || 0) + goals; });
    newGS.allTimeAssisters = { ...(newGS.allTimeAssisters || {}) };
    Object.entries(cs.assisters || {}).forEach(([name, assists]) => { newGS.allTimeAssisters[name] = (newGS.allTimeAssisters[name] || 0) + assists; });
    newGS.allTimeCleanSheets = { ...(newGS.allTimeCleanSheets || {}) };
    Object.entries(cs.cleanSheets || {}).forEach(([name, sheets]) => { newGS.allTimeCleanSheets[name] = (newGS.allTimeCleanSheets[name] || 0) + sheets; });
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
    if ((game.league || 0) === 0) newGS.hadDiedInBarrio = true;
    if (game.league >= 6) newGS.hadLostFinal = true;
    if (cs.matchesPlayed <= 8 && game.league > 0) newGS.hadSpeedrun = true;
    const finalGS = checkAchievements(newGS);
    setGlobalStats(finalGS); saveGlobalStats(finalGS);
    // Save run to history
    const sorted = [...(game.table || [])].sort((a, b) => (b.w * 3 + b.d) - (a.w * 3 + a.d));
    const myPos = sorted.findIndex(t => t.you);
    saveRunSnapshot({ endType: 'death', leagueName: lg.n, leagueIcon: lg.i, finalPosition: myPos >= 0 ? myPos + 1 : null });
    // Save curse mastery progress and mutator bonus
    saveCurseMasteryProgress();
    saveMutatorBonus();
    // Generate card reward
    const reward = generateCardReward(finalGS, game.league || 0);
    if (reward.length > 0) setCardReward(reward);
  }, []);

  function handleImmortalize(player) {
    setSelectedPlayer(player);
  }

  function confirmImmortalize() {
    if (!selectedPlayer) return;
    immortalizePlayer(selectedPlayer);
    setImmortalized(true);
    SFX.play('reward');
    Haptics.success();
  }

  const donMiguelQuote = game.league === 0 ? '"No siempre se gana, mijo. Pero lo que importa es que lo intentamos."' : '"Estuvimos tan cerca de las estrellas que casi las tocamos. No es el final... es solo el descanso."';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'auto',
      background: `radial-gradient(ellipse at 50% 20%, rgba(239,68,68,0.06) 0%, ${T.bg} 60%)`,
    }}>
      {/* Header */}
      <div className="anim-stagger-1" style={{ width: '100%', padding: '28px 16px 16px', textAlign: 'center' }}>
        <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 30, color: T.lose, textTransform: 'uppercase', letterSpacing: 3 }}>Fin de la Carrera</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 16, color: T.tx3, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 6 }}>{lg.i} {lg.n}</div>
      </div>

      {/* Quote section — glass panel */}
      <div className="glass anim-stagger-2" style={{ borderRadius: 12, padding: '16px 24px', margin: '0 16px 12px', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>👴</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 15, color: T.tx2, lineHeight: 1.6, fontStyle: 'italic' }}>{donMiguelQuote}</div>
      </div>

      {/* Stats summary — glass cards grid */}
      <div className="anim-stagger-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 380, width: '100%', padding: '0 16px', margin: '4px 0 12px' }}>
        {[
          { l: 'Partidos', v: cs.matchesPlayed, c: T.tx },
          { l: 'Victorias', v: cs.wins, c: T.win },
          { l: 'Goles', v: cs.goalsFor, c: T.info },
          { l: 'Liga maxima', v: lg.n, c: T.purple },
        ].map((s, i) => (
          <div key={i} className="glass" style={{ borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 26, color: s.c }}>{s.v}</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Immortalize Player Section — premium gold-framed */}
      {!immortalized && rosterSorted.length > 0 && (
        <div className="anim-stagger-4" style={{ width: '100%', maxWidth: 400, padding: '4px 16px' }}>
          <div className="card-gold" style={{ padding: 16 }}>
            <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 15, textTransform: 'uppercase', textAlign: 'center', marginBottom: 6, letterSpacing: 1 }}>
              <span className="text-gradient-gold">Inmortalizar Jugador</span>
            </div>
            <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx3, textAlign: 'center', marginBottom: 12, lineHeight: 1.4 }}>
              Elige 1 jugador para el Hall of Fame. Aparecera en futuras runs.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflow: 'auto' }}>
              {rosterSorted.slice(0, 7).map((p) => {
                const ovr = calcOvr(p);
                const isSelected = selectedPlayer?.id === p.id;
                return (
                  <div key={p.id} onClick={() => handleImmortalize(p)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    background: isSelected ? `${T.gold}15` : T.bg1,
                    border: `1.5px solid ${isSelected ? T.gold : T.border}`,
                    borderRadius: 10, cursor: 'pointer', touchAction: 'manipulation',
                    boxShadow: isSelected ? T.glowGold : 'none',
                    transition: 'all 0.2s ease',
                  }}>
                    <div style={{ minWidth: 36, textAlign: 'center' }}>
                      <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 20, color: T.gold }}>{ovr}</div>
                      <div style={{ fontFamily: T.fontHeading, fontSize: 10, color: POS_COLORS[p.pos] || T.tx2, fontWeight: 600 }}>{PN[p.pos] || p.pos}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: T.fontBody, fontWeight: 600, fontSize: 14, color: T.tx }}>{p.name}</div>
                      {p.trait && <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.purple, marginTop: 1 }}>✦ {p.trait.n}</div>}
                    </div>
                    {isSelected && <div style={{ color: T.gold, fontSize: 18, fontWeight: 700 }}>✓</div>}
                  </div>
                );
              })}
            </div>
            {selectedPlayer && (
              <button onClick={confirmImmortalize} style={{
                fontFamily: T.fontHeading, fontWeight: 700, fontSize: 14, padding: '12px', marginTop: 10,
                border: 'none', background: T.gradientPrimary, color: T.bg,
                borderRadius: 10, cursor: 'pointer', textTransform: 'uppercase', width: '100%',
                boxShadow: T.glowGold, letterSpacing: 0.5,
              }}>
                Inmortalizar a {selectedPlayer.name.split(' ').pop()}
              </button>
            )}
          </div>
        </div>
      )}
      {immortalized && (
        <div className="anim-stagger-4" style={{ padding: '4px 16px', textAlign: 'center', width: '100%', maxWidth: 400 }}>
          <div className="card-gold" style={{ padding: 14 }}>
            <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 15 }}>
              <span className="text-gradient-gold">{selectedPlayer.name} entra al Hall of Fame</span>
            </div>
            <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx3, marginTop: 4 }}>
              Aparecera como legendario en futuras runs.
            </div>
          </div>
        </div>
      )}

      {/* Mutator Bonus */}
      {(game.activeMutators || []).length > 0 && (
        <div className="anim-stagger-5" style={{ padding: '6px 16px', width: '100%', maxWidth: 400 }}>
          <div className="glass" style={{ borderRadius: 10, padding: '10px 14px', textAlign: 'center', borderColor: T.lose + '25' }}>
            <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 11, color: T.lose, textTransform: 'uppercase', letterSpacing: 1 }}>Mutadores Activos</div>
            <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 20, color: T.gold, marginTop: 4 }}>
              +{calcMutatorLegacyBonus(game.activeMutators, game.ascension || 0)} Puntos de Legado
            </div>
          </div>
        </div>
      )}

      {/* Card Reward — purple glass container */}
      {cardReward && !cardClaimed && (
        <div className="anim-stagger-5" style={{ width: '100%', maxWidth: 400, padding: '6px 16px' }}>
          <div className="card-purple" style={{ padding: 16 }}>
            <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 15, color: T.purple, textTransform: 'uppercase', textAlign: 'center', marginBottom: 6, letterSpacing: 1 }}>
              🎴 Carta Tactica
            </div>
            <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx3, textAlign: 'center', marginBottom: 12 }}>
              Elige 1 carta para tu coleccion permanente.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {cardReward.map(card => {
                const rarity = CARD_RARITIES[card.rarity];
                const isSelected = selectedCard?.id === card.id;
                return (
                  <div key={card.id} onClick={() => setSelectedCard(card)} style={{
                    display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px',
                    background: isSelected ? `${T.purple}15` : T.bg1,
                    border: `1.5px solid ${isSelected ? T.purple : T.border}`,
                    borderRadius: 10, cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 16px rgba(139,92,246,0.15)' : 'none',
                    transition: 'all 0.2s ease',
                  }}>
                    <div style={{ fontSize: 24, minWidth: 30, textAlign: 'center' }}>{card.i}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 13, color: T.tx }}>{card.n}</span>
                        <span style={{ fontSize: 9, color: rarity.color, fontFamily: T.fontBody, fontWeight: 600, border: `1px solid ${rarity.color}30`, padding: '1px 6px', borderRadius: 4 }}>{rarity.n}</span>
                      </div>
                      <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3, lineHeight: 1.4, marginTop: 2 }}>{card.d}</div>
                    </div>
                    {isSelected && <div style={{ color: T.purple, fontSize: 18, fontWeight: 700 }}>✓</div>}
                  </div>
                );
              })}
            </div>
            {selectedCard && (
              <button onClick={() => { addCardToCollection(selectedCard.id); setCardClaimed(true); SFX.play('reward'); Haptics.success(); }} style={{
                fontFamily: T.fontHeading, fontWeight: 700, fontSize: 14, padding: '12px', marginTop: 10,
                border: 'none', background: T.gradientPurple, color: '#fff',
                borderRadius: 10, cursor: 'pointer', textTransform: 'uppercase', width: '100%',
                boxShadow: '0 0 20px rgba(139,92,246,0.2)', letterSpacing: 0.5,
              }}>
                Agregar {selectedCard.n} a coleccion
              </button>
            )}
          </div>
        </div>
      )}
      {cardClaimed && (
        <div style={{ padding: '6px 16px', textAlign: 'center', width: '100%', maxWidth: 400 }}>
          <div className="card-purple" style={{ padding: 12 }}>
            <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 13, color: T.purple }}>
              {selectedCard.i} {selectedCard.n} anadida a tu coleccion
            </div>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 16px 24px', width: '100%', maxWidth: 400 }}>
        <button onClick={() => { handleDeleteSave(); go('tutorial'); }} style={{
          fontFamily: T.fontHeading, fontWeight: 700, fontSize: 16, padding: '14px',
          border: 'none', borderRadius: 10, width: '100%',
          background: T.gradientPrimary, color: T.bg,
          cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1,
          boxShadow: T.glowGold,
        }}>Nueva Carrera</button>
        <button className="fw-btn fw-btn-outline" onClick={() => go('title')} style={{
          fontFamily: T.fontHeading, fontWeight: 600, fontSize: 13, padding: '10px 16px',
          border: `1.5px solid ${T.tx4}`, background: 'transparent', color: T.tx2,
          borderRadius: 10, cursor: 'pointer', textTransform: 'uppercase', width: '100%',
        }}>Menu Principal</button>
      </div>
    </div>
  );
}
