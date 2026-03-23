import {
  CAREER_CAST, ALL_CAREER_CARDS, CAREER_CARDS_MIGUEL, MATCH_CARDS,
} from '@/game/data';

export function initCareer(name, pos) {
  return { name, pos, age: 16, season: 1, bars: { rend: 50, fis: 55, rel: 50, fam: 20, men: 55 }, team: 0, matchNum: 0, matchesThisSeason: 0, totalMatches: 0, goals: 0, ratings: [], cardQueue: [], seasonGoals: 0, cast: JSON.parse(JSON.stringify(CAREER_CAST)), history: [], retired: false, retireReason: '' };
}

export function getCareerCards(c) {
  const numCards = Math.min(5, 2 + Math.floor((c.bars.fam || 0) / 30));
  const eligible = ALL_CAREER_CARDS.filter(card => { if (card.minAge && c.age < card.minAge) return false; return true; });
  const pool = [];
  const castCards = eligible.filter(card => card.cast);
  if (castCards.length > 0) pool.push(castCards[Math.floor(Math.random() * castCards.length)]);
  const shuffled = [...eligible.filter(card => !card.cast)].sort(() => Math.random() - 0.5);
  for (let i = 0; pool.length < numCards && i < shuffled.length; i++) pool.push(shuffled[i]);
  if (c.season % 3 === 0) { const dm = CAREER_CARDS_MIGUEL.filter(card => !card.minAge || c.age >= card.minAge); if (dm.length) pool.push(dm[Math.floor(Math.random() * dm.length)]); }
  return pool.sort(() => Math.random() - 0.5);
}

export function getMatchCards(pos) {
  const cards = MATCH_CARDS[pos] || MATCH_CARDS.MID;
  return [...cards].sort(() => Math.random() - 0.5).slice(0, 4 + Math.floor(Math.random() * 2));
}

export function applyBarEffects(c, effects) {
  const b = { ...c.bars };
  if (effects.rend) b.rend = Math.max(0, Math.min(100, b.rend + effects.rend));
  if (effects.fis) b.fis = Math.max(0, Math.min(100, b.fis + effects.fis));
  if (effects.rel) b.rel = Math.max(0, Math.min(100, b.rel + effects.rel));
  if (effects.fam) b.fam = Math.max(0, Math.min(100, b.fam + effects.fam));
  if (effects.men) b.men = Math.max(0, Math.min(100, b.men + effects.men));
  return b;
}

export function checkCareerEnd(c) {
  if (c.bars.fis <= 0) return 'Lesión grave. Tu cuerpo dijo basta.';
  if (c.bars.rend <= 0) return 'Sin rendimiento. Tu carrera se apagó.';
  if (c.bars.rel <= 0) return 'Nadie te quiere. Rescisión.';
  if (c.bars.men <= 0) return '"El fútbol ya no me llena." Retiro por burnout.';
  if (c.bars.fam >= 100) return 'La fama te consumió.';
  if (c.age >= 36) return 'A los 36, incluso las leyendas cuelgan los botines.';
  return null;
}

export function applyAging(c) {
  const b = { ...c.bars };
  if (c.age <= 22) b.fis = Math.min(100, b.fis + 3);
  else if (c.age >= 29 && c.age <= 34) { b.fis = Math.max(0, b.fis - 5); b.rend = Math.max(0, b.rend - 3); b.men = Math.min(100, b.men + 2); }
  else if (c.age >= 35) { b.fis = Math.max(0, b.fis - 8); b.rend = Math.max(0, b.rend - 5); }
  if (b.fam > 70) b.men = Math.max(0, b.men - 2);
  if (b.men < 30) b.rend = Math.max(0, b.rend - 2);
  return b;
}
