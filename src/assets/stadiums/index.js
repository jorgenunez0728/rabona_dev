// Stadium image assets - one front view + one pitch (aerial) view per league level
// Images are named: stadium_{level}_front.png and stadium_{level}_pitch.png
// Level 0 = Liga Barrio, Level 6 = Liga Intergaláctica

const modules = import.meta.glob('./*.png', { eager: true, query: '?url', import: 'default' });

function img(name) {
  const key = `./${name}`;
  return modules[key] || null;
}

export const STADIUM_IMGS = Array.from({ length: 7 }, (_, i) => ({
  front: img(`stadium_${i}_front.png`),
  pitch: img(`stadium_${i}_pitch.png`),
}));

export function getStadiumFront(league) {
  return STADIUM_IMGS[league]?.front || null;
}

export function getStadiumPitch(league) {
  return STADIUM_IMGS[league]?.pitch || null;
}
