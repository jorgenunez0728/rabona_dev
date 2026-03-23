// Re-export helpers used by engine modules
// Engine modules should import from here, not directly from data/helpers
export { rnd, pick, avgStat, effectiveStats, teamGKRating, calcOvr } from '../data/helpers.js';

export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

export function weightedPick(items, weightFn) {
  const weights = items.map(weightFn);
  const total = weights.reduce((s, w) => s + w, 0);
  if (total <= 0) return items[0];
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}
