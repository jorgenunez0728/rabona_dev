import { useState } from 'react';
import { SFX } from '@/game/audio';
import { T } from '@/game/data';
import { TACTICAL_CARDS, CARD_RARITIES, CARD_CATEGORIES, getCollectionCards, validateCardLoadout } from '@/game/data/cards.js';
import { hasLegacy } from '@/game/data/progression.js';

const CAT_COLORS = {
  offensive: { bg: 'rgba(239,68,68,0.08)', border: T.lose + '30', text: T.lose, label: 'Ofensiva' },
  defensive: { bg: 'rgba(59,130,246,0.08)', border: T.info + '30', text: T.info, label: 'Defensiva' },
  economic:  { bg: 'rgba(240,192,64,0.08)', border: T.gold + '30', text: T.gold, label: 'Económica' },
  chaotic:   { bg: 'rgba(139,92,246,0.08)', border: T.purple + '30', text: T.purple, label: 'Caótica' },
};

export default function CardLoadoutScreen({ globalStats, archetypeSlots, onConfirm }) {
  const collection = getCollectionCards(globalStats);
  const [loadout, setLoadout] = useState([]);

  // Calculate bonus slots from legacy tree
  let bonusSlots = 0;
  if (hasLegacy(globalStats, 'maestria_1')) bonusSlots++;
  if (hasLegacy(globalStats, 'maestria_2')) bonusSlots++;

  // Current slot counts
  const usedCounts = { offensive: 0, defensive: 0, economic: 0, chaotic: 0 };
  for (const cardId of loadout) {
    const card = TACTICAL_CARDS.find(c => c.id === cardId);
    if (card) usedCounts[card.cat]++;
  }

  const totalSlots = Object.values(archetypeSlots || {}).reduce((s, v) => s + v, 0) + bonusSlots;
  const usedTotal = loadout.length;

  function toggleCard(cardId) {
    const card = TACTICAL_CARDS.find(c => c.id === cardId);
    if (!card) return;
    if (loadout.includes(cardId)) {
      SFX.play('click');
      setLoadout(loadout.filter(id => id !== cardId));
    } else {
      // Check category slot limit
      const catLimit = (archetypeSlots?.[card.cat] || 0) + (bonusSlots > usedTotal - Object.values(usedCounts).reduce((s, v) => s + v, 0) + loadout.length ? 0 : 0);
      if (usedCounts[card.cat] >= (archetypeSlots?.[card.cat] || 0)) {
        // Check if we have bonus slots available
        const totalUsed = loadout.length;
        if (totalUsed >= totalSlots) return;
        // Bonus slot can be any category
      }
      if (usedTotal >= totalSlots) return;
      SFX.play('click');
      setLoadout([...loadout, cardId]);
    }
  }

  if (collection.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 24 }}>
        <div style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 18, color: T.tx3, marginBottom: 10 }}>Sin Cartas</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.tx3, marginBottom: 20 }}>
          Desbloquearás cartas al completar runs.
        </div>
        <button className="fw-btn fw-btn-primary" onClick={() => onConfirm([])} style={{ fontSize: 13 }}>
          Continuar sin cartas
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 18, color: T.gold, textTransform: 'uppercase', textShadow: T.glowGold }}>Cartas Tácticas</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx3, marginTop: 2 }}>
          {usedTotal}/{totalSlots} slots usados
        </div>
      </div>

      {/* Slot overview */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        {CARD_CATEGORIES.map(cat => {
          const max = archetypeSlots?.[cat] || 0;
          if (max === 0) return null;
          return (
            <div key={cat} style={{
              padding: '4px 10px', borderRadius: 12, fontSize: 10, fontFamily: T.fontBody, fontWeight: 600,
              background: CAT_COLORS[cat].bg, border: `1px solid ${CAT_COLORS[cat].border}`,
              color: CAT_COLORS[cat].text,
            }}>
              {CAT_COLORS[cat].label}: {usedCounts[cat]}/{max}
            </div>
          );
        })}
        {bonusSlots > 0 && (
          <div style={{ padding: '4px 10px', borderRadius: 12, fontSize: 10, fontFamily: T.fontBody, fontWeight: 600, background: `${T.gold}10`, border: `1px solid ${T.gold}30`, color: T.gold }}>
            +{bonusSlots} Libre
          </div>
        )}
      </div>

      {/* Card list by category */}
      {CARD_CATEGORIES.map(cat => {
        const catCards = collection.filter(c => c.cat === cat);
        if (catCards.length === 0) return null;
        return (
          <div key={cat} style={{ marginBottom: 12 }}>
            <div className="divider-subtle" style={{ fontFamily: T.fontHeading, fontSize: 10, color: CAT_COLORS[cat].text, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, paddingLeft: 4 }}>
              {CAT_COLORS[cat].label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {catCards.map(card => {
                const isSelected = loadout.includes(card.id);
                const rarity = CARD_RARITIES[card.rarity];
                const catMax = archetypeSlots?.[card.cat] || 0;
                const canAdd = isSelected || usedTotal < totalSlots;
                return (
                  <div
                    key={card.id}
                    onClick={() => canAdd && toggleCard(card.id)}
                    className={isSelected ? 'card-gold' : 'glass'}
                    style={{
                      display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px',
                      border: `1.5px solid ${isSelected ? T.gold + '60' : T.glassBorder}`,
                      borderRadius: 10, cursor: canAdd ? 'pointer' : 'not-allowed',
                      opacity: canAdd ? 1 : 0.4,
                      boxShadow: isSelected ? T.glowGold : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: 22, minWidth: 28, textAlign: 'center' }}>{card.i}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 12, color: T.tx }}>{card.n}</span>
                        <span style={{ fontSize: 8, color: rarity.color, fontFamily: T.fontBody, border: `1px solid ${rarity.color}30`, padding: '1px 5px', borderRadius: 4, background: `${rarity.color}10` }}>{rarity.n}</span>
                      </div>
                      <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3, lineHeight: 1.3, marginTop: 2 }}>{card.d}</div>
                    </div>
                    {isSelected && <div style={{ color: T.gold, fontSize: 16, fontWeight: 700 }}>✓</div>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <button
        className="fw-btn fw-btn-primary"
        onClick={() => { SFX.play('reward'); onConfirm(loadout); }}
        style={{ width: '100%', fontSize: 13, marginTop: 8, background: T.gradientPrimary, color: T.bg, boxShadow: T.glowGold }}
      >
        {loadout.length > 0 ? `Confirmar ${loadout.length} carta${loadout.length > 1 ? 's' : ''}` : 'Sin cartas'}
      </button>
    </div>
  );
}
