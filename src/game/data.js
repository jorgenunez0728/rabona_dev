// ═══════════════════════════════════════
// GAME DATA — Barrel re-export v3
// All game data is now organized in src/game/data/
// This file re-exports everything so existing imports don't break.
// ═══════════════════════════════════════

export * from './data/items.js';
export * from './data/progression.js';
export * from './data/leagues.js';
export * from './data/events.js';
export * from './data/players.js';
export * from './data/helpers.js';
export * from './data/career.js';
export * from './data/archetypes.js';
export * from './data/cards.js';
export * from './data/mutators.js';

// Explicit re-exports from visuals.js to avoid export * resolution issues
export {
  preloadAllSprites, allSpritesReady,
  getRivalSpriteVariant, getCanvasFormation, drawSprite,
  getRivalKit, generateLivePosts, generateSocialPosts,
  PN, PC, POS_ORDER, POS_COLORS, POS_ICON_IDX,
  T, CARD_TIERS, SOCIAL_EMOJIS, LEGENDS, _pitchImgs,
} from './data/visuals.js';