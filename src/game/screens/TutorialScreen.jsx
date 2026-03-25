import { useState, useEffect } from 'react';
import { SFX } from '@/game/audio';
import { T } from '@/game/data';
import { CoachPortrait } from '@/game/components';
import { Haptics } from '@/game/haptics';
import useGameStore from '@/game/store';

// ── Animated dot indicator ──
function Dots({ total, current }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '8px 0' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 6, height: 6, borderRadius: 3,
          background: i === current ? T.gold : i < current ? T.win : 'rgba(255,255,255,0.15)',
          transition: 'all 0.3s ease',
        }} />
      ))}
    </div>
  );
}

// ── Visual card component for the tutorial ──
function MiniCard({ icon, title, desc, color, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px',
      background: `${color}08`, border: `1.5px solid ${color}25`,
      borderRadius: 8, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'all 0.4s ease',
    }}>
      <div style={{ fontSize: 28, minWidth: 36, textAlign: 'center' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 13, color }}>{title}</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx2, lineHeight: 1.3, marginTop: 1 }}>{desc}</div>
      </div>
    </div>
  );
}

// ── Animated progress bar ──
function AnimBar({ pct, color, label, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(pct), delay); return () => clearTimeout(t); }, []);
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx2 }}>{label}</span>
        <span style={{ fontFamily: T.fontBody, fontSize: 10, color }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${width}%`, background: color, borderRadius: 3, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

// ── Slot visualization ──
function SlotRow({ slots, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, []);
  const colors = { offensive: '#f44336', defensive: '#2196f3', economic: '#F0C040', chaotic: '#9c27b0' };
  const labels = { offensive: 'ATK', defensive: 'DEF', economic: 'ECO', chaotic: 'CAO' };
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>
      {Object.entries(slots).map(([cat, count]) => (
        Array.from({ length: count }, (_, i) => (
          <div key={`${cat}-${i}`} style={{
            width: 32, height: 32, borderRadius: 6,
            background: `${colors[cat]}15`, border: `1.5px solid ${colors[cat]}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: T.fontHeading, fontSize: 8, color: colors[cat], fontWeight: 700,
          }}>
            {labels[cat]}
          </div>
        ))
      ))}
    </div>
  );
}

export default function TutorialScreen() {
  const { go } = useGameStore();
  const [step, setStep] = useState(0);
  const TOTAL = 7;

  function next() {
    SFX.play('click');
    Haptics.light();
    if (step < TOTAL - 1) setStep(step + 1);
    else go('coach');
  }

  function prev() {
    SFX.play('click');
    if (step > 0) setStep(step - 1);
  }

  function skip() {
    SFX.play('click');
    go('coach');
  }

  const wrap = (bg, children) => (
    <div className="stadium-glow" style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: bg, position: 'relative', overflow: 'hidden',
    }}>
      {/* Skip button */}
      <div style={{ position: 'absolute', top: 12, right: 16, zIndex: 10 }}>
        <button onClick={skip} className="fw-btn-glass" style={{
          fontFamily: T.fontBody, fontSize: 11, color: T.tx3,
          background: 'rgba(15,25,35,0.6)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '5px 14px',
          cursor: 'pointer', transition: 'all 0.2s ease',
        }}>
          Saltar →
        </button>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', gap: 14, textAlign: 'center' }}>
        {children}
      </div>
      {/* Navigation */}
      <div style={{ padding: '8px 20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Dots total={TOTAL} current={step} />
        <div style={{ display: 'flex', gap: 8 }}>
          {step > 0 && (
            <button onClick={prev} className="fw-btn fw-btn-outline" style={{
              flex: 1, fontSize: 13, padding: '12px', borderRadius: 8,
            }}>
              ← Atrás
            </button>
          )}
          <button onClick={next} className="fw-btn fw-btn-primary" style={{
            flex: 2, fontSize: 14, padding: '13px', borderRadius: 8,
          }}>
            {step < TOTAL - 1 ? 'Siguiente →' : 'Comenzar'}
          </button>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  // SLIDE 0: Welcome / Intro
  // ═══════════════════════════════════════
  if (step === 0) return wrap(
    'radial-gradient(ellipse at 50% 40%, #1a2a10 0%, #080C14 70%)',
    <>
      <CoachPortrait id="miguel" size={56} />
      <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 26, color: T.gold, textTransform: 'uppercase' }}>
        Don Miguel
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 16, color: T.tx, maxWidth: 340, lineHeight: 1.7 }}>
        "Mijo, ¿te conté del torneo del 94? Teníamos un equipo de barrio... puros chavos de la colonia. Nadie nos daba un peso."
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx2, maxWidth: 340, lineHeight: 1.5, marginTop: 4 }}>
        "Pero ahora es diferente. Ahora tú decides <span style={{ color: T.gold }}>cómo</span> se juega."
      </div>
      <div style={{
        display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {['🦅', '📐', '💰', '🔮', '🌱', '🎲'].map((e, i) => (
          <div key={i} style={{
            fontSize: 24, width: 40, height: 40, borderRadius: 8,
            background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: `fadeIn 0.3s ease ${i * 0.1}s both`,
          }}>{e}</div>
        ))}
      </div>
    </>
  );

  // ═══════════════════════════════════════
  // SLIDE 1: The Run (Core Loop)
  // ═══════════════════════════════════════
  if (step === 1) return wrap(
    'radial-gradient(ellipse at 50% 60%, #0b1830 0%, #080C14 70%)',
    <>
      <div style={{ fontSize: 48 }}>🔄</div>
      <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 22, color: '#fff', textTransform: 'uppercase' }}>
        Cada Run es Único
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx2, maxWidth: 340, lineHeight: 1.6 }}>
        Cada partida es una carrera completa — del <span style={{ color: '#22C55E' }}>Barrio</span> hasta las <span style={{ color: '#F0C040' }}>Estrellas</span>.
        Si pierdes, empiezas de nuevo. Pero lo que aprendes y desbloqueas <span style={{ color: T.gold }}>se queda para siempre</span>.
      </div>
      {/* Visual flow */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 300, width: '100%', marginTop: 8 }}>
        {[
          { icon: '🏠', label: 'Liga Barrio', color: '#4caf50' },
          { icon: '⬇', label: '', color: T.tx3 },
          { icon: '🏟', label: 'Liga Estatal', color: '#2196f3' },
          { icon: '⬇', label: '', color: T.tx3 },
          { icon: '🌍', label: 'Liga Mundial', color: '#ff9800' },
          { icon: '⬇', label: '', color: T.tx3 },
          { icon: '🛸', label: 'Liga Intergaláctica', color: '#F0C040' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            justifyContent: item.label ? 'flex-start' : 'center',
            padding: item.label ? '4px 12px' : '0',
            opacity: 0, animation: `slideUp 0.3s ease ${i * 0.08}s forwards`,
          }}>
            <span style={{ fontSize: item.label ? 20 : 14 }}>{item.icon}</span>
            {item.label && <span style={{ fontFamily: T.fontHeading, fontSize: 12, color: item.color, fontWeight: 600 }}>{item.label}</span>}
          </div>
        ))}
      </div>
    </>
  );

  // ═══════════════════════════════════════
  // SLIDE 2: Manager Archetypes
  // ═══════════════════════════════════════
  if (step === 2) return wrap(
    'radial-gradient(ellipse at 50% 30%, #2d1a4a 0%, #080C14 70%)',
    <>
      <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 18, color: T.purple, textTransform: 'uppercase', letterSpacing: 1 }}>
        Filosofía de Juego
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx2, maxWidth: 340, lineHeight: 1.5 }}>
        Antes de cada run, elige una <span style={{ color: T.purple, fontWeight: 700 }}>filosofía de manager</span> que cambia <span style={{ color: '#fff' }}>todo</span>: tu economía, tu estilo, tus opciones tácticas.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 340, width: '100%' }}>
        <MiniCard icon="🦅" title="El Caudillo" desc="Empates = derrota. Pero +25% ATK cuando vas perdiendo." color="#f44336" delay={100} />
        <MiniCard icon="📐" title="El Arquitecto" desc="Ve la formación rival. Eventos tácticos con opción secreta." color="#2196f3" delay={250} />
        <MiniCard icon="💰" title="El Mercenario" desc="+30 monedas. -30% precios. Jugadores nuevos llegan con boost." color="#F0C040" delay={400} />
        <MiniCard icon="🔮" title="El Místico" desc="Maldiciones más fuertes... pero dan bonos ocultos." color="#9c27b0" delay={550} />
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3, marginTop: 4 }}>
        + La Cantera 🌱 y El Apostador 🎲 (desbloqueables)
      </div>
    </>
  );

  // ═══════════════════════════════════════
  // SLIDE 3: Tactical Cards
  // ═══════════════════════════════════════
  if (step === 3) return wrap(
    'radial-gradient(ellipse at 50% 40%, #1a1030 0%, #080C14 70%)',
    <>
      <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 18, color: T.gold, textTransform: 'uppercase', letterSpacing: 1 }}>
        🎴 Cartas Tácticas
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx2, maxWidth: 340, lineHeight: 1.5 }}>
        Colecciona <span style={{ color: T.gold }}>cartas permanentes</span> entre runs. Antes de jugar, arma tu <span style={{ color: '#fff' }}>loadout</span> — las cartas se activan solas durante los partidos.
      </div>
      {/* Card examples */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 340, width: '100%' }}>
        <MiniCard icon="⏰" title="Presión Final" desc="Después del min 75, +20% chance de gol." color="#f44336" delay={100} />
        <MiniCard icon="🧱" title="Muro Humano" desc="Primera chance rival: -15% probabilidad de gol." color="#2196f3" delay={250} />
        <MiniCard icon="💵" title="Bono por Gol" desc="+5 monedas por cada gol que anotes." color="#F0C040" delay={400} />
        <MiniCard icon="🌑" title="Pacto Oscuro" desc="+30% gol... pero ganas maldición cada 3 partidos." color="#9c27b0" delay={550} />
      </div>
      {/* Slot preview */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3, marginBottom: 4 }}>Tu filosofía define los slots disponibles:</div>
        <SlotRow slots={{ offensive: 3, defensive: 1, economic: 1, chaotic: 1 }} delay={700} />
      </div>
    </>
  );

  // ═══════════════════════════════════════
  // SLIDE 4: Curse Mastery
  // ═══════════════════════════════════════
  if (step === 4) return wrap(
    'radial-gradient(ellipse at 50% 50%, #2a0a0a 0%, #080C14 70%)',
    <>
      <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 18, color: '#ef5350', textTransform: 'uppercase', letterSpacing: 1 }}>
        Dominio de Maldiciones
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx2, maxWidth: 340, lineHeight: 1.5 }}>
        Las maldiciones ya no son solo malas. <span style={{ color: '#ef5350' }}>Aguanta el sufrimiento</span> y la maldición se transforma en <span style={{ color: T.gold }}>bendición</span>.
      </div>
      {/* Transformation visual */}
      <div style={{ maxWidth: 320, width: '100%', background: 'rgba(239,83,80,0.06)', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(239,83,80,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 24 }}>💸</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.fontHeading, fontSize: 12, color: '#ef5350' }}>Deuda con el Barrio</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3 }}>-10 monedas por jornada</div>
          </div>
        </div>
        <AnimBar pct={75} color="#ef5350" label="Maestría" delay={300} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '6px 0' }}>
          <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: 10, color: T.tx3 }}>se transforma en</span>
          <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0, animation: 'fadeIn 0.5s ease 1s forwards' }}>
          <span style={{ fontSize: 24 }}>💸</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.fontHeading, fontSize: 12, color: T.gold }}>Mecenas del Barrio</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.gold }}>+15 monedas/jornada permanente</div>
          </div>
        </div>
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx2, maxWidth: 320, lineHeight: 1.4, marginTop: 4 }}>
        En el <span style={{ color: '#ef5350' }}>Curandero</span> puedes curar la maldición... pero pierdes el progreso de maestría. <span style={{ color: T.gold }}>¿Curar o aguantar?</span>
      </div>
    </>
  );

  // ═══════════════════════════════════════
  // SLIDE 5: Ascension Mutators
  // ═══════════════════════════════════════
  if (step === 5) return wrap(
    'radial-gradient(ellipse at 50% 60%, #1a1010 0%, #080C14 70%)',
    <>
      <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 18, color: '#ff9800', textTransform: 'uppercase', letterSpacing: 1 }}>
        Mutadores de Ascensión
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx2, maxWidth: 340, lineHeight: 1.5 }}>
        ¿Quieres más <span style={{ color: '#ff9800' }}>desafío</span>? Activa hasta 3 mutadores antes de tu run. Más difícil = más <span style={{ color: T.gold }}>puntos de legado</span>.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 340, width: '100%' }}>
        <MiniCard icon="⏰" title="Reloj Maldito" desc="Partidos de 120 min. Más ticks, más chances. +1 LP" color="#ff9800" delay={100} />
        <MiniCard icon="🪟" title="Cristal" desc="Lesiones 3x más probables. +2 LP" color="#ff9800" delay={250} />
        <MiniCard icon="☠️" title="Maldición Eterna" desc="Empiezas con 2 maldiciones aleatorias. +3 LP" color="#ff9800" delay={400} />
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '8px 14px',
        background: `${T.gold}08`, border: `1px solid ${T.gold}20`, borderRadius: 8,
        opacity: 0, animation: 'fadeIn 0.5s ease 0.6s forwards',
      }}>
        <span style={{ fontSize: 20 }}>🌳</span>
        <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.gold, lineHeight: 1.3 }}>
          Los puntos de legado desbloquean mejoras <strong>permanentes</strong> en el Árbol de Legado.
        </div>
      </div>
    </>
  );

  // ═══════════════════════════════════════
  // SLIDE 6: Setup Flow + Go
  // ═══════════════════════════════════════
  if (step === 6) return wrap(
    'radial-gradient(ellipse at 50% 40%, #1a2510 0%, #080C14 70%)',
    <>
      <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 18, color: T.win, textTransform: 'uppercase', letterSpacing: 1 }}>
        Tu Run, Tus Reglas
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx2, maxWidth: 340, lineHeight: 1.5 }}>
        Antes de cada carrera, personaliza todo:
      </div>
      {/* Setup flow visual */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 300, width: '100%' }}>
        {[
          { n: '1', icon: '🦅', label: 'Filosofía de Juego', sub: 'Elige tu estilo', color: T.purple },
          { n: '2', icon: '👴', label: 'Entrenador', sub: '8 coaches con habilidades únicas', color: T.gold },
          { n: '3', icon: '🎴', label: 'Cartas Tácticas', sub: 'Arma tu loadout', color: '#9c27b0' },
          { n: '4', icon: '📿', label: 'Reliquia Inicial', sub: '¿Segura o maldita?', color: '#ff9800' },
          { n: '5', icon: '⬆', label: 'Dificultad + Mutadores', sub: 'Riesgo vs recompensa', color: '#ef5350' },
        ].map((item, i) => (
          <div key={i}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
              opacity: 0, animation: `slideUp 0.3s ease ${i * 0.12}s forwards`,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: `${item.color}15`, border: `1.5px solid ${item.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 13, color: item.color }}>{item.label}</div>
                <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3 }}>{item.sub}</div>
              </div>
            </div>
            {i < 4 && (
              <div style={{ display: 'flex', justifyContent: 'center', height: 8 }}>
                <div style={{ width: 1, height: '100%', background: 'rgba(255,255,255,0.08)' }} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{
        fontFamily: T.fontBody, fontSize: 13, color: T.tx, maxWidth: 320, lineHeight: 1.5, marginTop: 8,
        opacity: 0, animation: 'fadeIn 0.5s ease 0.8s forwards',
      }}>
        Cada combinación crea una experiencia <span style={{ color: T.gold, fontWeight: 700 }}>completamente distinta</span>. No hay dos runs iguales.
      </div>
    </>
  );

  return null;
}
