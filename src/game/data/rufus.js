// ═══════════════════════════════════════
// RUFUS — Mascota del Barrio
// 56 accesorios en 7 categorías + helpers
// ═══════════════════════════════════════

export const RUFUS_ACCESSORIES = [
  // HEAD (12)
  { id: 'lentes_sol',    slot: 'head', n: 'Lentes de Sol',        i: '🕶️', rarity: 'common',    d: 'Para los días soleados en la cancha' },
  { id: 'gorra',         slot: 'head', n: 'Gorra del Barrio',     i: '🧢', rarity: 'common',    d: 'La gorra oficial del potrero' },
  { id: 'monoculo',      slot: 'head', n: 'Monóculo Distinguido', i: '🧐', rarity: 'uncommon',  d: 'Un perro de clase, sin duda' },
  { id: 'casco',         slot: 'head', n: 'Casco de Portero',     i: '⛑️', rarity: 'uncommon',  d: 'Protección ante balones perdidos' },
  { id: 'moño',          slot: 'head', n: 'Moño Elegante',        i: '🎀', rarity: 'uncommon',  d: 'Para las galas del ascenso' },
  { id: 'sombrero_vaq',  slot: 'head', n: 'Sombrero Vaquero',     i: '🤠', rarity: 'common',    d: 'Rufus del rancho' },
  { id: 'cinta_ninja',   slot: 'head', n: 'Cinta Ninja',          i: '🥷', rarity: 'uncommon',  d: 'Rufus sigiloso' },
  { id: 'corona',        slot: 'head', n: 'Corona de Campeón',    i: '👑', rarity: 'rare',      d: 'Solo los reyes la merecen' },
  { id: 'antenas',       slot: 'head', n: 'Antenas Alien',        i: '👽', rarity: 'rare',      d: 'Recuerdo de la Liga Intergaláctica' },
  { id: 'gorro_chef',    slot: 'head', n: 'Gorro de Chef',        i: '👨‍🍳', rarity: 'common',    d: 'Rufus cocina los goles' },
  { id: 'aureola',       slot: 'head', n: 'Aureola',              i: '😇', rarity: 'rare',      d: 'San Rufus del Potrero' },
  { id: 'lentes_pixel',  slot: 'head', n: 'Lentes Pixel',         i: '🤓', rarity: 'legendary', d: 'Deal with it' },

  // BODY (10)
  { id: 'short_verde',   slot: 'body', n: 'Short Verde',          i: '🩳', rarity: 'common',    d: 'El clásico short verde de Rufus' },
  { id: 'playera',       slot: 'body', n: 'Playera del Equipo',   i: '👕', rarity: 'common',    d: 'Con el escudo del equipo' },
  { id: 'chaleco',       slot: 'body', n: 'Chaleco Táctico',      i: '🦺', rarity: 'uncommon',  d: 'Rufus está listo para el análisis' },
  { id: 'punk',          slot: 'body', n: 'Outfit Punk',          i: '🎸', rarity: 'uncommon',  d: 'Cadenas, parches y actitud' },
  { id: 'hiphop',        slot: 'body', n: 'Outfit Hip-Hop',       i: '🎤', rarity: 'uncommon',  d: 'Rufus MC del Barrio' },
  { id: 'traje_sastre',  slot: 'body', n: 'Traje Sastre',         i: '🤵', rarity: 'rare',      d: 'Rufus de gala para la premiación' },
  { id: 'capa',          slot: 'body', n: 'Capa de Héroe',        i: '🦸', rarity: 'rare',      d: 'Cada barrio necesita un héroe' },
  { id: 'kimono',        slot: 'body', n: 'Kimono',               i: '🥋', rarity: 'uncommon',  d: 'Rufus-san, maestro del balón' },
  { id: 'astronauta',    slot: 'body', n: 'Traje Espacial',       i: '🧑‍🚀', rarity: 'legendary', d: 'Listo para la Liga Intergaláctica' },
  { id: 'hawaiana',      slot: 'body', n: 'Camisa Hawaiana',      i: '🌺', rarity: 'common',    d: 'Rufus en vacaciones' },

  // NECK (7)
  { id: 'collar_punk',   slot: 'neck', n: 'Collar Punk',          i: '⛓️', rarity: 'common',    d: 'Actitud callejera pura' },
  { id: 'bufanda',       slot: 'neck', n: 'Bufanda de Hincha',    i: '🧣', rarity: 'common',    d: 'Animando desde la tribuna' },
  { id: 'corbata',       slot: 'neck', n: 'Corbata Ejecutiva',    i: '👔', rarity: 'uncommon',  d: 'Rufus CEO del club' },
  { id: 'medalla',       slot: 'neck', n: 'Medalla MVP',          i: '🏅', rarity: 'uncommon',  d: 'El verdadero MVP del barrio' },
  { id: 'collar_oro',    slot: 'neck', n: 'Cadena de Oro',        i: '📿', rarity: 'rare',      d: 'Bling bling perruno' },
  { id: 'silbato',       slot: 'neck', n: 'Silbato de DT',        i: '📯', rarity: 'uncommon',  d: 'Rufus dirige el equipo' },
  { id: 'collar_diamante', slot: 'neck', n: 'Collar Diamante',    i: '💎', rarity: 'legendary', d: 'El collar más exclusivo del universo' },

  // HELD (8)
  { id: 'balon',         slot: 'held', n: 'Balón de Fútbol',      i: '⚽', rarity: 'common',    d: 'Su juguete favorito' },
  { id: 'baston',        slot: 'held', n: 'Bastón Elegante',      i: '🦯', rarity: 'uncommon',  d: 'Un perro refinado' },
  { id: 'hueso',         slot: 'held', n: 'Hueso Dorado',         i: '🦴', rarity: 'uncommon',  d: 'El tesoro más preciado' },
  { id: 'bandera',       slot: 'held', n: 'Bandera del Equipo',   i: '🚩', rarity: 'common',    d: 'Rufus hincha #1' },
  { id: 'trofeo_mini',   slot: 'held', n: 'Trofeo Miniatura',     i: '🏆', rarity: 'rare',      d: 'Recuerdo del campeonato' },
  { id: 'rosa',          slot: 'held', n: 'Rosa en la Boca',      i: '🌹', rarity: 'uncommon',  d: 'Un galán perruno' },
  { id: 'periodico',     slot: 'held', n: 'Periódico Deportivo',  i: '📰', rarity: 'common',    d: 'Leyendo las notas del partido' },
  { id: 'varita',        slot: 'held', n: 'Varita Mágica',        i: '🪄', rarity: 'rare',      d: 'Rufus el Místico' },

  // FEET (5)
  { id: 'botines',       slot: 'feet', n: 'Botines de Fútbol',    i: '👟', rarity: 'uncommon',  d: 'Listos para el kickoff' },
  { id: 'pantuflas',     slot: 'feet', n: 'Pantuflas',            i: '🥿', rarity: 'common',    d: 'Post-partido relax' },
  { id: 'patines',       slot: 'feet', n: 'Patines Locos',        i: '⛸️', rarity: 'rare',      d: '¿Un perro en patines? Por qué no' },
  { id: 'botas_lluvia',  slot: 'feet', n: 'Botas de Lluvia',      i: '🥾', rarity: 'common',    d: 'Para los días de charcos' },
  { id: 'zapatos_brillo', slot: 'feet', n: 'Zapatos Brillantes',  i: '👞', rarity: 'uncommon',  d: 'Elegancia hasta en las patas' },

  // BACKGROUND (8)
  { id: 'bg_potrero',    slot: 'bg', n: 'El Potrero',             i: '🏠', rarity: 'common',    d: 'La cancha llanera donde todo empezó' },
  { id: 'bg_dia',        slot: 'bg', n: 'Día Soleado',            i: '☀️', rarity: 'common',    d: 'Un día perfecto para jugar' },
  { id: 'bg_lluvia',     slot: 'bg', n: 'Día Lluvioso',           i: '🌧️', rarity: 'uncommon',  d: 'Charcos y balones mojados' },
  { id: 'bg_noche',      slot: 'bg', n: 'Noche de Reflectores',   i: '🌙', rarity: 'uncommon',  d: 'Bajo las luces del estadio' },
  { id: 'bg_estadio',    slot: 'bg', n: 'El Gran Estadio',        i: '🏟️', rarity: 'rare',      d: 'Rufus en las grandes ligas' },
  { id: 'bg_playa',      slot: 'bg', n: 'Playa Tropical',         i: '🏖️', rarity: 'uncommon',  d: 'Rufus de vacaciones' },
  { id: 'bg_espacio',    slot: 'bg', n: 'Estación Orbital',       i: '🛸', rarity: 'rare',      d: 'Gravedad artificial y estrellas' },
  { id: 'bg_podio',      slot: 'bg', n: 'Podio de Campeones',     i: '🏆', rarity: 'legendary', d: 'El escenario definitivo de gloria' },

  // PET (6) — la mascota de Rufus
  { id: 'pet_pez',       slot: 'pet', n: 'Pez Dorado',            i: '🐠', rarity: 'uncommon',  d: 'Nada en círculos igual que tu mediocampo' },
  { id: 'pet_gato',      slot: 'pet', n: 'Gato Callejero',        i: '🐱', rarity: 'common',    d: 'Némesis natural de Rufus... o mejor amigo' },
  { id: 'pet_pajaro',    slot: 'pet', n: 'Pájaro Cantor',         i: '🐦', rarity: 'common',    d: 'Le canta los goles a Rufus' },
  { id: 'pet_tortuga',   slot: 'pet', n: 'Tortuga Sabia',         i: '🐢', rarity: 'uncommon',  d: 'Lenta pero estratégica' },
  { id: 'pet_hamster',   slot: 'pet', n: 'Hámster en Rueda',      i: '🐹', rarity: 'uncommon',  d: 'Genera energía para el equipo' },
  { id: 'pet_alien',     slot: 'pet', n: 'Alien Bebé',            i: '👾', rarity: 'rare',      d: 'Recuerdo de la Liga Intergaláctica' },
];

export const RUFUS_SLOT_LABELS = {
  head: { n: 'Cabeza', i: '🎩' },
  body: { n: 'Cuerpo', i: '👕' },
  neck: { n: 'Cuello', i: '📿' },
  held: { n: 'Objeto', i: '🦴' },
  feet: { n: 'Patas',  i: '🐾' },
  bg:   { n: 'Fondo',  i: '🖼️' },
  pet:  { n: 'Mascota', i: '🐾' },
};

export const RUFUS_SLOT_ORDER = ['head', 'body', 'neck', 'held', 'feet', 'bg', 'pet'];

export const RUFUS_LEVEL_XP = [0, 10, 25, 50, 80, 120, 170, 230, 300, 400, 500];

export const INITIAL_RUFUS = {
  name: 'Rufus',
  level: 0,
  xp: 0,
  equipped: { head: null, body: null, neck: null, held: null, feet: null, bg: null, pet: null },
  inventory: ['short_verde'], // starts with the iconic green shorts
  photos: [],
  totalPets: 0,
  totalBalls: 0,
  bestBallStreak: 0,
  mood: 'happy',
};

export function getRufusMood(lastResult) {
  if (!lastResult) return 'happy';
  if (lastResult === 'champion') return 'excited';
  if (lastResult === 'win') return 'happy';
  if (lastResult === 'draw') return 'sleepy';
  return 'sad';
}

export function generateAccessoryReward(inventory) {
  const available = RUFUS_ACCESSORIES.filter(a => !(inventory || []).includes(a.id));
  if (available.length === 0) return null;
  const weights = available.map(a =>
    a.rarity === 'common' ? 6 : a.rarity === 'uncommon' ? 3 : a.rarity === 'rare' ? 1 : 0.3
  );
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < available.length; i++) {
    r -= weights[i];
    if (r <= 0) return available[i];
  }
  return available[available.length - 1];
}

export function getRufusLevelForXP(xp) {
  for (let i = RUFUS_LEVEL_XP.length - 1; i >= 0; i--) {
    if (xp >= RUFUS_LEVEL_XP[i]) return i;
  }
  return 0;
}

// Rarity colors for UI
export const RUFUS_RARITY_COLORS = {
  common: '#94a3b8',
  uncommon: '#3b82f6',
  rare: '#f0c040',
  legendary: '#e040fb',
};
