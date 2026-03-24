// ── Haptic Feedback utility ──
// Thin wrapper around Vibration API with graceful fallback

const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

export const Haptics = {
  /** Light tap — button press, selection */
  light() {
    if (canVibrate) navigator.vibrate(10);
  },

  /** Medium tap — goal, important action */
  medium() {
    if (canVibrate) navigator.vibrate(25);
  },

  /** Heavy — goal scored, penalty, game over */
  heavy() {
    if (canVibrate) navigator.vibrate(50);
  },

  /** Double pulse — rival goal, bad event */
  double() {
    if (canVibrate) navigator.vibrate([30, 50, 30]);
  },

  /** Success pattern — win, achievement */
  success() {
    if (canVibrate) navigator.vibrate([15, 40, 15, 40, 30]);
  },

  /** Error/warning — card, injury */
  warning() {
    if (canVibrate) navigator.vibrate([40, 30, 40]);
  },
};
