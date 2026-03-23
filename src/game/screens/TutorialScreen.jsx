import { useState } from 'react';
import { SFX } from '@/game/audio';
import { T } from '@/game/data';
import { CoachPortrait } from '@/game/components';
import useGameStore from '@/game/store';

export default function TutorialScreen() {
  const { go } = useGameStore();
  const [step, setStep] = useState(0);
  const wrap = (children) => <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, background: 'radial-gradient(ellipse at 50% 60%,#1a2a10 0%,#0b1120 70%)', padding: 16, textAlign: 'center', overflow: 'auto' }}>{children}</div>;
  const steps = [
    () => wrap(<>
      <CoachPortrait id="miguel" size={48} />
      <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 26, color: T.gold, textTransform: 'uppercase' }}>Don Miguel</div>
      <div style={{ fontFamily: "'Barlow'", fontSize: 16, color: T.tx, maxWidth: 360, lineHeight: 1.6 }}>"Mijo, ¿te conté del torneo del 94? Teníamos un equipo de barrio... puros chavos de la colonia. Nadie nos daba un peso... Pero tenían algo que el dinero no compra: corazón."</div>
      <button className="fw-btn fw-btn-primary" onClick={() => { SFX.play('click'); setStep(1); }}>Continuar</button>
    </>),
    () => wrap(<>
      <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 26, color: T.gold, textTransform: 'uppercase' }}>🎮 Cómo Funciona</div>
      <div style={{ fontFamily: "'Barlow'", fontSize: 16, color: T.tx, maxWidth: 360, lineHeight: 1.6 }}>Cada partida es un "run" — una carrera completa desde el Barrio hasta las Estrellas. Pierde y empieza de nuevo. Gana y desbloquea más.</div>
      <button className="fw-btn fw-btn-primary" onClick={() => { SFX.play('click'); go('coach'); }}>Elegir Entrenador →</button>
    </>),
  ];
  return steps[step] ? steps[step]() : null;
}
