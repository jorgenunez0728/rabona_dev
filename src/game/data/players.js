import { TRAITS } from './items.js';
import { PERSONALITIES } from './events.js';
import { rnd, pick } from './helpers.js';

export const FN='Memo,Chuy,Beto,Nacho,Paco,Rafa,Toño,Pipe,Lalo,Hugo,Iker,Leo,Gael,Said,Omar,Diego,Alan,Erik,Joel,Ivan,Santiago,Patricio,Emilio,Rodrigo,Fernando,Arturo,Salvador,Margarito,Valentín,Ulises,Néstor,Damián,Rubén,Gonzalo,Édgar,Adrián,Ismael,Saúl,Gerardo,Ezequiel,Armando,Raúl,Víctor,Gilberto,Sebastián,Mateo,Dante,Héctor,Cristian,Josué,Esteban,Ramiro,Tadeo,Fabian,Marcelo,Octavio,Renato,Bruno,Axel,Aldo,Benito,Camilo,Darío,Elías'.split(',');
export const LN='García,López,Hernández,Martínez,Rodríguez,Pérez,Sánchez,Ramírez,Torres,Flores,Cruz,Reyes,Morales,Ortiz,Vargas,Castillo,Fernández,Estrella,De la Rosa,Mendoza,Ríos,Fuentes,Acosta,Aguilar,Navarro,Ponce,Guerrero,Medina,Delgado,Romero,Salazar,Vega,Ibarra,Orozco,Contreras,Cervantes,Domínguez,Ávila,Montes,Espinosa,Valencia,Paredes,Lozano,Herrera,Solís,Villanueva,Cisneros,Cárdenas,Bravo,Luna,Ángeles,Barrera,Trejo,Sandoval,Pineda,Rosas,Bautista,Carrillo,Duarte,Quiroz,De León,Nava,Chávez,Pacheco'.split(',');
export const NK='El Tanque,Flash,El Mago,Chuletón,Pared,Máquina,Fantasma,El Jefe,Cohete,Pulga,Toro,Gato,Halcón,Rayo,Muralla,Tigre,La Bala,Pirata,El Poeta,Dinamita,Zurdo,Turbo,El Ruso,Pantera,Cometa,Misil,El Flaco,Cacique,Manos de Seda,Pitbull,Locomotora,Trueno,Terremoto,El Científico,Volcán,Torpedo,Vikingo,Samurái,Cañón,Relámpago'.split(',');

export const _usedNames = new Set();

export function genPlayer(pos, minLv, maxLv) {
  const lv = rnd(minLv, maxLv);
  let name;
  let tries = 0;
  do { name = `${pick(FN)} ${pick(LN)}`; tries++; } while (_usedNames.has(name) && tries < 20);
  _usedNames.add(name);
  const trait = pick(TRAITS);
  const personality = pick(PERSONALITIES);
  const base = lv * 3 + rnd(2, 6);
  const isGK = pos === 'GK';
  return {
    id: Math.random().toString(36).slice(2),
    name, pos, lv,
    atk: isGK ? rnd(1, 3) : base + rnd(-2, 4),
    def: isGK ? base + rnd(0, 3) : base + rnd(-2, 4),
    spd: base + rnd(-3, 3),
    sav: isGK ? base + rnd(2, 6) : rnd(1, 3),
    xp: 0, xpNext: lv * 10 + 20,
    trait, evo: false, role: 'rs',
    personality, fatigue: 0, injuredFor: 0,
    consecutiveGames: 0, consecutiveBench: 0, gamesPlayed: 0,
  };
}
