// ═══════════════════════════════════════
// GAME DATA — Barrel re-export v5 (cache-bust)
// All game data is now organized in src/game/data/
// This file re-exports everything so existing imports don't break.
// ═══════════════════════════════════════

export { TRAITS, FORMATIONS, RELICS, STARTING_RELIC_PAIRS, NODE_TYPES, TRAINING_OPTIONS } from './data/items.js';
export { COACHES, COACH_PORTRAIT_IDX, COACH_ABILITIES, ASCENSION_MODS, LEGACY_TREE, LEGACY_BRANCHES, calcLegacyPoints, calcSpentLegacy, canUnlockLegacy, hasLegacy, CURSES, ARCHETYPES, getAvailableArchetypes, ACHIEVEMENTS } from './data/progression.js';
export { STADIUMS, LEAGUES, CUP_STAGES, CUP_RIVAL_NAMES, initCupState, RIVAL_NAMES, RIVAL_COACHES, NEMESIS, NEMESIS_PORTRAIT_IDX, getNemesis, COPA_NAMES, COPA_RIVALS_PER_ROUND, initCopaState, CUTSCENES, TEAM_NAMES, KIT_COLORS } from './data/leagues.js';
export { RUFUS_ACCESSORIES, RUFUS_SLOT_LABELS, RUFUS_SLOT_ORDER, RUFUS_LEVEL_XP, INITIAL_RUFUS, generateAccessoryReward, getRufusLevelForXP, RUFUS_RARITY_COLORS } from './data/rufus.js';
export { EVENTS, TACTICS, PERSONALITIES, MATCH_OBJECTIVES, BOARD_EVENTS } from './data/events.js';
export { FN, LN, NK, _usedNames, genPlayer } from './data/players.js';
export { rnd, pick, calcOvr, effectiveStats, effectiveStatsWithFormation, effectiveOvr, avgStat, getRelicDraftOptions, generateNodeChoice, applyRelicEffects, teamGKRating, teamPower, getLevelUpChoices, getBoardEvents, applyBoardEffect, narrate, randomizeEvent } from './data/helpers.js';
export { CAREER_CAST, CAREER_CAST_UNLOCKABLE, CAREER_TEAMS, CAREER_TRAITS, SIGNATURE_MOMENTS, CAREER_LEGACY_TREE, ALL_CAREER_CARDS, CAREER_CARDS_MIGUEL, MATCH_CARDS, BAR_GAME_OVER, BAR_NAMES, BAR_ICONS, BAR_COLORS } from './data/career.js';
export { MANAGER_ARCHETYPES, getAvailableManagerArchetypes, isArchetypeUnlocked, getArchetypeCardSlots, hasArchetypeSynergy } from './data/archetypes.js';
export { CARD_CATEGORIES, CARD_RARITIES, TACTICAL_CARDS, getUnlockableCards, getCollectionCards, generateCardReward, validateCardLoadout, getTotalSlots } from './data/cards.js';
export { ASCENSION_MUTATORS, MAX_ACTIVE_MUTATORS, getAvailableMutators, calcMutatorLegacyBonus, getMutatorEngineEffects } from './data/mutators.js';
export {
  preloadAllSprites, allSpritesReady,
  getRivalSpriteVariant, getCanvasFormation, drawSprite,
  getRivalKit, generateLivePosts, generateSocialPosts,
  PN, PC, POS_ORDER, POS_COLORS, POS_ICON_IDX,
  T, CARD_TIERS, SOCIAL_EMOJIS, LEGENDS, _pitchImgs,
} from './data/visuals.js';