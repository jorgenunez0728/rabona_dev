import { useEffect, useState } from "react";
import { SFX } from "@/game/audio";
import { T, LEAGUES, PN, POS_COLORS, calcOvr } from "@/game/data";
import { Haptics } from "@/game/haptics";
import { saveGlobalStats } from "@/game/save";
import { generateCardReward, CARD_RARITIES } from "@/game/data/cards.js";
import { calcMutatorLegacyBonus } from "@/game/data/mutators.js";
import useGameStore from "@/game/store";

export default function DeathScreen() {
  const { game, globalStats, setGlobalStats, checkAchievements, handleDeleteSave, go, immortalizePlayer, addCardToCollection, saveCurseMasteryProgress, saveMutatorBonus } = useGameStore();
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
    const finalGS = checkAchievements(newGS);
    setGlobalStats(finalGS); saveGlobalStats(finalGS);
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflow: 'auto', background: 'linear-gradient(180deg,#1a0a0a 0%,#0b1120 30%)' }}>
      <div style={{ width: '100%', padding: '24px 16px', textAlign: 'center', background: 'linear-gradient(180deg,rgba(255,23,68,0.08) 0%,transparent 100%)' }}>
        <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 28, color: '#ff1744', textTransform: 'uppercase', letterSpacing: 2 }}>Fin de la Carrera</div>
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
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: '#607d8b', textTransform: 'uppercase' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── Immortalize Player Section ── */}
      {!immortalized && rosterSorted.length > 0 && (
        <div style={{ width: '100%', maxWidth: 400, padding: '8px 16px' }}>
          <div style={{ background: 'linear-gradient(145deg,#2a2510,#3a3215)', borderRadius: 10, padding: 12, border: `1px solid ${T.gold}30` }}>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 14, color: T.gold, textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 }}>
              Inmortalizar Jugador
            </div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: T.tx2, textAlign: 'center', marginBottom: 10, lineHeight: 1.3 }}>
              Elige 1 jugador para el Hall of Fame. Aparecerá en futuras runs.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 180, overflow: 'auto' }}>
              {rosterSorted.slice(0, 7).map((p) => {
                const ovr = calcOvr(p);
                const isSelected = selectedPlayer?.id === p.id;
                return (
                  <div key={p.id} onClick={() => handleImmortalize(p)} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                    background: isSelected ? `${T.gold}15` : 'rgba(255,255,255,0.02)',
                    border: `1.5px solid ${isSelected ? T.gold : T.border}`,
                    borderRadius: 6, cursor: 'pointer', touchAction: 'manipulation',
                  }}>
                    <div style={{ minWidth: 32, textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 18, color: T.gold }}>{ovr}</div>
                      <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: POS_COLORS[p.pos] || T.tx2 }}>{PN[p.pos] || p.pos}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 13, color: T.tx }}>{p.name}</div>
                      {p.trait && <div style={{ fontSize: 10, color: T.purple }}>✦ {p.trait.n}</div>}
                    </div>
                    {isSelected && <div style={{ color: T.gold, fontSize: 16 }}>✓</div>}
                  </div>
                );
              })}
            </div>
            {selectedPlayer && (
              <button onClick={confirmImmortalize} style={{
                fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, padding: '10px', marginTop: 8,
                border: 'none', background: `linear-gradient(135deg,${T.gold},#f0c040)`, color: '#1a1a2e',
                borderRadius: 6, cursor: 'pointer', textTransform: 'uppercase', width: '100%',
              }}>
                Inmortalizar a {selectedPlayer.name.split(' ').pop()}
              </button>
            )}
          </div>
        </div>
      )}
      {immortalized && (
        <div style={{ padding: '8px 16px', textAlign: 'center', width: '100%', maxWidth: 400 }}>
          <div style={{ background: `${T.gold}10`, border: `1px solid ${T.gold}30`, borderRadius: 8, padding: 12 }}>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 14, color: T.gold }}>
              {selectedPlayer.name} entra al Hall of Fame
            </div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: T.tx2, marginTop: 4 }}>
              Aparecerá como legendario en futuras runs.
            </div>
          </div>
        </div>
      )}

      {/* ── Mutator Bonus ── */}
      {(game.activeMutators || []).length > 0 && (
        <div style={{ padding: '4px 16px', width: '100%', maxWidth: 400 }}>
          <div style={{ background: 'rgba(239,83,80,0.06)', border: '1px solid rgba(239,83,80,0.15)', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: '#ef5350', textTransform: 'uppercase' }}>Mutadores Activos</div>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 18, color: T.gold, marginTop: 2 }}>
              +{calcMutatorLegacyBonus(game.activeMutators, game.ascension || 0)} Puntos de Legado
            </div>
          </div>
        </div>
      )}

      {/* ── Card Reward ── */}
      {cardReward && !cardClaimed && (
        <div style={{ width: '100%', maxWidth: 400, padding: '8px 16px' }}>
          <div style={{ background: 'linear-gradient(145deg,#1a1030,#2d1a4a)', borderRadius: 10, padding: 12, border: `1px solid ${T.purple}30` }}>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 14, color: T.purple, textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 }}>
              🎴 Carta Táctica
            </div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3, textAlign: 'center', marginBottom: 10 }}>
              Elige 1 carta para tu colección permanente.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {cardReward.map(card => {
                const rarity = CARD_RARITIES[card.rarity];
                const isSelected = selectedCard?.id === card.id;
                return (
                  <div key={card.id} onClick={() => setSelectedCard(card)} style={{
                    display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px',
                    background: isSelected ? `${T.purple}15` : 'rgba(255,255,255,0.02)',
                    border: `1.5px solid ${isSelected ? T.purple : T.border}`,
                    borderRadius: 6, cursor: 'pointer',
                  }}>
                    <div style={{ fontSize: 22, minWidth: 28, textAlign: 'center' }}>{card.i}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 12, color: T.tx }}>{card.n}</span>
                        <span style={{ fontSize: 8, color: rarity.color, fontFamily: T.fontBody, border: `1px solid ${rarity.color}30`, padding: '0 4px', borderRadius: 3 }}>{rarity.n}</span>
                      </div>
                      <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3, lineHeight: 1.3, marginTop: 1 }}>{card.d}</div>
                    </div>
                    {isSelected && <div style={{ color: T.purple, fontSize: 16 }}>✓</div>}
                  </div>
                );
              })}
            </div>
            {selectedCard && (
              <button onClick={() => { addCardToCollection(selectedCard.id); setCardClaimed(true); SFX.play('reward'); Haptics.success(); }} style={{
                fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, padding: '10px', marginTop: 8,
                border: 'none', background: `linear-gradient(135deg,${T.purple},#7c4dff)`, color: '#fff',
                borderRadius: 6, cursor: 'pointer', textTransform: 'uppercase', width: '100%',
              }}>
                Agregar {selectedCard.n} a colección
              </button>
            )}
          </div>
        </div>
      )}
      {cardClaimed && (
        <div style={{ padding: '4px 16px', textAlign: 'center', width: '100%', maxWidth: 400 }}>
          <div style={{ background: `${T.purple}10`, border: `1px solid ${T.purple}30`, borderRadius: 8, padding: 8 }}>
            <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 12, color: T.purple }}>
              {selectedCard.i} {selectedCard.n} añadida a tu colección
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 16px', width: '100%', maxWidth: 400 }}>
        <button onClick={() => { handleDeleteSave(); go('tutorial'); }} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 16, padding: '12px 32px', border: 'none', background: 'linear-gradient(135deg,#d4a017,#f0c040)', color: '#1a1a2e', clipPath: 'polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)', cursor: 'pointer', textTransform: 'uppercase', width: '100%' }}>Nueva Carrera</button>
        <button onClick={() => go('title')} style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: 12, padding: '8px 16px', border: '1.5px solid #607d8b', background: 'transparent', color: '#e8eaf6', borderRadius: 4, cursor: 'pointer', textTransform: 'uppercase', width: '100%' }}>Menú Principal</button>
      </div>
    </div>
  );
}
