// Social emoji assets - pixel art replacements for Unicode emojis
const modules = import.meta.glob('./*.png', { eager: true, query: '?url', import: 'default' });

function img(name) {
  const key = `./${name}`;
  return modules[key] || null;
}

// Map emoji names to loaded image URLs
export const SOCIAL_EMOJI_URLS = {
  gamepad: img('social-gamepad.png'),
  soccer: img('social-soccer-ball.png'),
  checklist: img('social-checklist.png'),
  scoreboard: img('social-scoreboard.png'),
  skull: img('social-skull-1.png'),
  arrowUp: img('social-arrow-up.png'),
  whistle: img('social-whistle.png'),
  phone: img('social-phone.png'),
  angry: img('social-angry-face.png'),
  medical: img('social-medical-cross.png'),
  sad: img('social-sad-face.png'),
  dumbbell: img('social-dumbbell.png'),
  bag: img('social-shopping-bag.png'),
};

// Map Unicode emojis to social emoji URLs for replacement
export const EMOJI_MAP = {
  '⚽': SOCIAL_EMOJI_URLS.soccer,
  '💀': SOCIAL_EMOJI_URLS.skull,
  '📱': SOCIAL_EMOJI_URLS.phone,
  '🏥': SOCIAL_EMOJI_URLS.medical,
  '⬆️': SOCIAL_EMOJI_URLS.arrowUp,
  '📋': SOCIAL_EMOJI_URLS.checklist,
  '🎮': SOCIAL_EMOJI_URLS.gamepad,
  '😤': SOCIAL_EMOJI_URLS.angry,
  '😅': SOCIAL_EMOJI_URLS.sad,
  '🏋️': SOCIAL_EMOJI_URLS.dumbbell,
};

// Get an avatar URL for a social account (returns URL or null)
export function getSocialAvatar(key) {
  return SOCIAL_EMOJI_URLS[key] || null;
}
