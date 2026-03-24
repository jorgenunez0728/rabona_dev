import { useState } from 'react';
import { SFX } from '@/game/audio';
import { T } from '@/game/data';
import { TACTICAL_CARDS, CARD_RARITIES, CARD_CATEGORIES, getCollectionCards, validateCardLoadout } from '@/game/data/cards.js';
import { hasLegacy } from '@/game/data/progression.js';

const CAT_COLORS = {
  offensive: { bg: 'rgba(244,67,54,0.08)', border: '#f4433630', text: '#f44336', label: 'Ofensiva' },
  defensive: { bg: 'rgba(33,150,243,0.08)', border: '#2196f330', text: '#2196f3', label: 'Defensiva' },
  economic:  { bg: 'rgba(255,214,0,0.08)', border: '#ffd60030', text: '#ffd600', label: 'Económica' },
  chaotic:   { bg: 'rgba(156,39,176,0.08)', border: '#9c27b030', text: '#9c27b0', label: 'Caótica' },
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
      <div style={{ textAlign: 'center', padding: 20 }}>
        <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 16, color: T.tx3, marginBottom: 8 }}>Sin Cartas</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx3, marginBottom: 16 }}>
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
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 16, color: T.gold, textTransform: 'uppercase' }}>Cartas Tácticas</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3, marginTop: 2 }}>
          {usedTotal}/{totalSlots} slots usados
        </div>
      </div>

      {/* Slot overview */}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
        {CARD_CATEGORIES.map(cat => {
          const max = archetypeSlots?.[cat] || 0;
          if (max === 0) return null;
          return (
            <div key={cat} style={{
              padding: '3px 8px', borderRadius: 4, fontSize: 10, fontFamily: T.fontBody,
              background: CAT_COLORS[cat].bg, border: `1px solid ${CAT_COLORS[cat].border}`,
              color: CAT_COLORS[cat].text,
            }}>
              {CAT_COLORS[cat].label}: {usedCounts[cat]}/{max}
            </div>
          );
        })}
        {bonusSlots > 0 && (
          <div style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontFamily: T.fontBody, background: `${T.gold}10`, border: `1px solid ${T.gold}30`, color: T.gold }}>
            +{bonusSlots} Libre
          </div>
        )}
      </div>

      {/* Card list by category */}
      {CARD_CATEGORIES.map(cat => {
        const catCards = collection.filter(c => c.cat === cat);
        if (catCards.length === 0) return null;
        return (
          <div key={cat} style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: T.fontHeading, fontSize: 10, color: CAT_COLORS[cat].text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, paddingLeft: 4 }}>
              {CAT_COLORS[cat].label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {catCards.map(card => {
                const isSelected = loadout.includes(card.id);
                const rarity = CARD_RARITIES[card.rarity];
                const catMax = archetypeSlots?.[card.cat] || 0;
                const canAdd = isSelected || usedTotal < totalSlots;
                return (
                  <div
                    key={card.id}
                    onClick={() => canAdd && toggleCard(card.id)}
                    style={{
                      display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px',
                      background: isSelected ? `${CAT_COLORS[cat].text}10` : 'rgba(255,255,255,0.02)',
                      border: `1.5px solid ${isSelected ? CAT_COLORS[cat].text : T.border}`,
                      borderRadius: 6, cursor: canAdd ? 'pointer' : 'not-allowed',
                      opacity: canAdd ? 1 : 0.4,
                    }}
                  >
                    <div style={{ fontSize: 22, minWidth: 28, textAlign: 'center' }}>{card.i}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 12, color: T.tx }}>{card.n}</span>
                        <span style={{ fontSize: 8, color: rarity.color, fontFamily: T.fontBody, border: `1px solid ${rarity.color}30`, padding: '0 4px', borderRadius: 3 }}>{rarity.n}</span>
                      </div>
                      <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3, lineHeight: 1.3, marginTop: 1 }}>{card.d}</div>
                    </div>
                    {isSelected && <div style={{ color: CAT_COLORS[cat].text, fontSize: 16, fontWeight: 700 }}>✓</div>}
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
        style={{ width: '100%', fontSize: 13, marginTop: 8 }}
      >
        {loadout.length > 0 ? `Confirmar ${loadout.length} carta${loadout.length > 1 ? 's' : ''}` : 'Sin cartas'}
      </button>
    </div>
  );
}
