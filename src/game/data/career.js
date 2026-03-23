export const CAREER_CAST = [
  {id:'manos',n:'Manos',role:'Agente',i:'🤝'},
  {id:'depredador',n:'El Depredador',role:'Rival',i:'⚔️'},
  {id:'doctora',n:'Doctora Méndez',role:'Médico',i:'🏥'},
  {id:'buitre',n:'El Buitre',role:'Periodista',i:'📰'},
  {id:'familia',n:'La Familia',role:'Apoyo',i:'❤️'},
  {id:'miguel',n:'Don Miguel',role:'Mentor',i:'👴'},
];

export const CAREER_TEAMS = [
  'Barrio FC', 'Municipal Atlético', 'Club Estatal', 'Nacional United',
  'Continental Stars', 'World FC', 'Galactic Legends',
];

export const ALL_CAREER_CARDS = [
  {who:'🤝 Manos',text:'"Hay una oferta del equipo Municipal. No es mucho, pero es profesional."',cast:'manos',a:{l:'Aceptar',e:{rel:5,fam:10}},b:{l:'Esperar mejor oferta',e:{rel:-5}},minAge:17},
  {who:'⚔️ El Depredador',text:'"En el próximo partido, voy a anularte. Disfruta el último partido como titular."',cast:'depredador',a:{l:'Ignorarlo',e:{men:5}},b:{l:'Responderle',e:{fam:8,men:-3}},minAge:16},
  {who:'🏥 Doctora Méndez',text:'"Necesitas descanso. Tu cuerpo habla."',cast:'doctora',a:{l:'Escucharla',e:{fis:15,rend:-10}},b:{l:'Seguir jugando',e:{fis:-10,rend:5}},minAge:16},
  {who:'📰 El Buitre',text:'"¿Cómo te sientes con el entrenador? ¿Hay tensión?"',cast:'buitre',a:{l:'Sin comentarios',e:{rel:3}},b:{l:'Hablar claro',e:{fam:15,rel:-8}},minAge:17},
  {who:'❤️ La Familia',text:'"Llevas semanas sin visitarnos. ¿Todo bien?"',cast:'familia',a:{l:'Ir a verlos',e:{men:12,rend:-5}},b:{l:'Más adelante',e:{men:-8,fis:3}},minAge:16},
  {who:'👴 Don Miguel',text:'"¿Recuerdas por qué empezaste a jugar, mijo?"',cast:'miguel',a:{l:'"Por amor al juego"',e:{men:15,rend:5}},minAge:16},
  {who:'⚽ El Desafío',text:'Un rival te reta 1vs1 antes del partido. Humillarlo o no.',a:{l:'Aceptar',e:{fam:10,fis:-5}},b:{l:'Declinar',e:{rel:5}},minAge:16},
  {who:'💊 Oferta Sospechosa',text:'Un "representante" te ofrece una sustancia para mejorar el rendimiento.',a:{l:'Rechazar',e:{men:5,rel:5}},b:{l:'¿Y si...?',e:{rend:15,rel:-20}},minAge:18},
  {who:'🎯 Entrenamiento Extra',text:'El entrenador propone sesiones dobles. Más rendimiento, más desgaste.',a:{l:'Aceptar',e:{rend:8,fis:-10}},b:{l:'Solo lo necesario',e:{fis:5}},minAge:16},
  {who:'🌟 Oportunidad Grande',text:'Invitación a un torneo internacional. Tu equipo no quiere dejarte ir.',a:{l:'Ir igual',e:{fam:20,rel:-10}},b:{l:'Quedarse',e:{rel:10,men:-5}},minAge:18},
];

export const CAREER_CARDS_MIGUEL = [
  {who:'👴 Don Miguel',text:'"Mijo, llevas mucho tiempo en esto. ¿Sigues disfrutándolo?"',a:{l:'"Más que nunca"',e:{men:20,rend:5}},minAge:16},
  {who:'👴 Don Miguel',text:'"A veces hay que saber cuándo dar un paso atrás para dar dos hacia adelante."',a:{l:'Entendido',e:{men:10,fis:10}},minAge:18},
  {who:'👴 Don Miguel',text:'"La gente del barrio te sigue. Eso es lo que de verdad importa."',a:{l:'"Lo sé, Don Miguel"',e:{men:15,fam:5}},minAge:16},
];

export const MATCH_CARDS = {
  FWD: [
    {text:'Mano a mano con el portero, ¿qué haces?',a:{l:'Disparo potente',e:{rend:5},goal:0.6},b:{l:'Colocado',e:{},goal:0.45}},
    {text:'Pase de gol para un compañero o intentas el gol tú.',a:{l:'Asistencia',e:{rel:5},goal:0.3},b:{l:'Rematar',e:{fam:3},goal:0.55}},
    {text:'El defensa te hace falta brutal. ¿Cómo reaccionas?',a:{l:'Levantarte y seguir',e:{men:5}},b:{l:'Protestar',e:{fam:5,rel:-3}}},
    {text:'Última jugada, empate y solo tú en el área.',a:{l:'Definir tranquilo',e:{rend:8},goal:0.5},b:{l:'Picar al portero',e:{fam:10},goal:0.35}},
  ],
  DEF: [
    {text:'Delantero veloz en tu espalda, ¿lo cortas?',a:{l:'Entrada fuerte',e:{fis:-5},goal:-0.4},b:{l:'Posición',e:{rend:3},goal:-0.25}},
    {text:'El árbitro te llama la atención.',a:{l:'Aceptarlo',e:{rel:3}},b:{l:'Discutir',e:{fam:8,rel:-5}}},
    {text:'Tu portero sale mal. ¿Cubres tú?',a:{l:'Cubrir el arco',e:{rend:8},goal:-0.3},b:{l:'Esperar',e:{fis:3},goal:-0.1}},
    {text:'Penal a favor, ¿quién patea?',a:{l:'Yo lo pateo',e:{fam:5},goal:0.35},b:{l:'El delantero',e:{rel:5},goal:0.5}},
  ],
  MID: [
    {text:'Control de balón en zona peligrosa, ¿qué haces?',a:{l:'Filtrar pase',e:{rel:5},goal:0.3},b:{l:'Disparar desde fuera',e:{fam:5},goal:0.2}},
    {text:'El equipo está nervioso, ¿cómo lideras?',a:{l:'Hablar en cancha',e:{men:5,rend:3}},b:{l:'Con juego',e:{rend:8}}},
    {text:'Contragolpe 3vs2. ¿Aceleras o organizas?',a:{l:'Acelerar',e:{fis:-3},goal:0.45},b:{l:'Organizar',e:{rend:5},goal:0.25}},
    {text:'Falta táctica, te puede costar tarjeta.',a:{l:'Hacerla',e:{fis:-2},goal:-0.2},b:{l:'Dejar ir',e:{rel:3}}},
  ],
  GK: [
    {text:'Disparo al ángulo, ¿cómo reaccionas?',a:{l:'Vuelo completo',e:{fis:-5},goal:-0.5},b:{l:'Posición base',e:{rend:3},goal:-0.3}},
    {text:'Penal en contra.',a:{l:'Leer al rival',e:{rend:5},goal:-0.45},b:{l:'Adivinar',e:{fis:2},goal:-0.25}},
    {text:'Centro peligroso al área.',a:{l:'Salir a cortar',e:{rend:8,fis:-3},goal:-0.4},b:{l:'Quedarte en línea',e:{},goal:-0.2}},
    {text:'Error del defensa que deja solo al rival.',a:{l:'Cerrar el ángulo',e:{rend:5},goal:-0.35},b:{l:'Esperar el disparo',e:{fis:3},goal:-0.2}},
  ],
};

export const BAR_NAMES = ['Rendimiento', 'Físico', 'Relaciones', 'Fama', 'Mental'];
export const BAR_ICONS = ['⚽', '💪', '🤝', '⭐', '🧠'];
export const BAR_COLORS = ['#00e676', '#42a5f5', '#ff9800', '#ffd600', '#a78bfa'];
