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
          width: i === current ? 22 : 6, height: 6, borderRadius: 3,
          background: i === current ? T.gold : i < current ? T.win : 'rgba(255,255,255,0.1)',
          boxShadow: i === current ? T.glowGold : 'none',
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
    <div className="glass" style={{
      display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px',
      border: `1.5px solid ${color}25`,
      borderRadius: 10, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'all 0.4s ease',
    }}>
      <div style={{ fontSize: 28, minWidth: 36, textAlign: 'center' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 13, color }}>{title}</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx2, lineHeight: 1.3, marginTop: 2 }}>{desc}</div>
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
      <div style={{ height: 6, background: T.bg2, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${width}%`, background: color, borderRadius: 3, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

// ── Tip box ──
function TipBox({ text }) {
  return (
    <div style={{
      display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 14px',
      background: `${T.gold}08`, border: `1.5px solid ${T.gold}25`,
      borderRadius: 10, maxWidth: 340, width: '100%', marginTop: 6,
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
      <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.gold, lineHeight: 1.4 }}>
        <span style={{ fontWeight: 700 }}>Consejo: </span>{text}
      </div>
    </div>
  );
}

// ── Slot visualization ──
function SlotRow({ slots, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, []);
  const colors = { offensive: T.lose, defensive: T.info, economic: T.gold, chaotic: T.purple };
  const labels = { offensive: 'ATK', defensive: 'DEF', economic: 'ECO', chaotic: 'CAO' };
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}>
      {Object.entries(slots).map(([cat, count]) => (
        Array.from({ length: count }, (_, i) => (
          <div key={`${cat}-${i}`} style={{
            width: 34, height: 34, borderRadius: 8,
            background: `${colors[cat]}12`, border: `1.5px solid ${colors[cat]}35`,
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

// ── Mini-preview container ──
function MiniPreview({ children }) {
  return (
    <div style={{
      width: 200, height: 140, borderRadius: 12, overflow: 'hidden',
      border: `1px solid ${T.glassBorder}`, background: T.bg1,
      boxShadow: '0 2px 12px rgba(0,0,0,0.3)', flexShrink: 0,
      padding: 8, display: 'flex', flexDirection: 'column', gap: 3,
      fontSize: 8, fontFamily: T.fontBody, color: T.tx3,
    }}>
      {children}
    </div>
  );
}

// ── Preview: Mini league table ──
function PreviewTable() {
  const rows = [
    { n: 'Águilas FC', p: 12, c: T.gold, you: true },
    { n: 'Tigres', p: 10, c: T.tx3 },
    { n: 'Lobos', p: 7, c: T.tx4 },
    { n: 'Coyotes', p: 5, c: T.tx4 },
    { n: 'Búhos FC', p: 3, c: T.lose },
  ];
  return (
    <MiniPreview>
      <div style={{ fontSize: 7, color: T.gold, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginBottom: 2 }}>Liga Barrio</div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 4px', background: r.you ? `${T.gold}15` : 'transparent', borderRadius: 3 }}>
          <span style={{ color: r.c || T.tx3 }}>{i + 1}. {r.n}</span>
          <span style={{ color: r.c || T.tx4, fontWeight: 600 }}>{r.p}pts</span>
        </div>
      ))}
    </MiniPreview>
  );
}

// ── Preview: Mini roster ──
function PreviewRoster() {
  const players = [
    { pos: 'POR', n: 'García', ovr: 62, c: '#42a5f5' },
    { pos: 'DEF', n: 'López', ovr: 58, c: '#66bb6a' },
    { pos: 'MED', n: 'Rodríguez', ovr: 65, c: '#ffa726' },
    { pos: 'DEL', n: 'Martínez', ovr: 70, c: '#ef5350' },
  ];
  return (
    <MiniPreview>
      <div style={{ fontSize: 7, color: T.info, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginBottom: 2 }}>Plantilla</div>
      {players.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 4px', background: T.bg2, borderRadius: 4, borderLeft: `2px solid ${p.c}` }}>
          <span style={{ fontSize: 7, color: p.c, fontWeight: 700, minWidth: 20 }}>{p.pos}</span>
          <span style={{ flex: 1, color: T.tx2 }}>{p.n}</span>
          <span style={{ fontWeight: 700, color: T.tx, fontSize: 9 }}>{p.ovr}</span>
        </div>
      ))}
    </MiniPreview>
  );
}

// ── Preview: Mini match ──
function PreviewMatch() {
  return (
    <MiniPreview>
      <div style={{ background: '#1a472a', borderRadius: 4, flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #2d5a3a' }}>
        <div style={{ width: '70%', height: '60%', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 2, position: 'relative' }}>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '3px 0' }}>
        <span style={{ color: T.tx, fontWeight: 700, fontSize: 9 }}>HAL</span>
        <span style={{ color: T.gold, fontWeight: 700, fontSize: 11 }}>2 - 1</span>
        <span style={{ color: T.tx3, fontSize: 9 }}>RIV</span>
      </div>
      <div style={{ fontSize: 7, color: T.tx4, textAlign: 'center' }}>⚽ 23' Martínez · ⚽ 67' López</div>
    </MiniPreview>
  );
}

// ── Preview: Mini relic draft ──
function PreviewRelics() {
  const relics = [
    { i: '👟', n: 'Botines del 94', active: false },
    { i: '❤️', n: 'Corazón de Barrio', active: true },
    { i: '📿', n: 'Amuleto', active: false },
  ];
  return (
    <MiniPreview>
      <div style={{ fontSize: 7, color: T.purple, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginBottom: 2 }}>Elige Reliquia</div>
      {relics.map((r, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px',
          background: r.active ? `${T.gold}15` : T.bg2, borderRadius: 4,
          border: r.active ? `1px solid ${T.gold}40` : '1px solid transparent',
        }}>
          <span style={{ fontSize: 12 }}>{r.i}</span>
          <span style={{ color: r.active ? T.gold : T.tx3, flex: 1 }}>{r.n}</span>
          {r.active && <span style={{ color: T.gold, fontSize: 9 }}>✓</span>}
        </div>
      ))}
    </MiniPreview>
  );
}

// ── Preview: Mini legacy tree ──
function PreviewLegacy() {
  const branches = [
    { i: '🔭', n: 'Scouting', nodes: [true, true, false] },
    { i: '🌱', n: 'Cantera', nodes: [true, false, false] },
    { i: '💰', n: 'Sponsor', nodes: [false, false, false] },
  ];
  return (
    <MiniPreview>
      <div style={{ fontSize: 7, color: T.gold, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginBottom: 3 }}>Árbol de Legado</div>
      {branches.map((b, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 4px' }}>
          <span style={{ fontSize: 10 }}>{b.i}</span>
          <span style={{ fontSize: 7, color: T.tx3, minWidth: 36 }}>{b.n}</span>
          <div style={{ display: 'flex', gap: 3 }}>
            {b.nodes.map((owned, ni) => (
              <div key={ni} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: owned ? T.win : T.bg2, border: `1px solid ${owned ? T.win : T.border}`,
              }} />
            ))}
          </div>
        </div>
      ))}
    </MiniPreview>
  );
}

// ── Preview: Mini tactical cards ──
function PreviewCards() {
  const cards = [
    { i: '⏰', n: 'Presión Final', cat: 'offensive', c: T.lose },
    { i: '🧱', n: 'Muro Humano', cat: 'defensive', c: T.info },
    { i: '💵', n: 'Bono por Gol', cat: 'economic', c: T.gold },
  ];
  return (
    <MiniPreview>
      <div style={{ fontSize: 7, color: T.purple, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginBottom: 2 }}>Cartas Tácticas</div>
      {cards.map((card, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', background: T.bg2, borderRadius: 4 }}>
          <span style={{ fontSize: 11 }}>{card.i}</span>
          <span style={{ flex: 1, color: T.tx2 }}>{card.n}</span>
          <span style={{ fontSize: 6, color: card.c, fontWeight: 700, textTransform: 'uppercase', background: `${card.c}15`, padding: '1px 4px', borderRadius: 3 }}>{card.cat.slice(0, 3)}</span>
        </div>
      ))}
    </MiniPreview>
  );
}

// ── Preview: Game flow diagram ──
function PreviewFlow() {
  const steps = ['Tabla', 'Mapa', 'Prematch', 'Partido', 'Rewards'];
  return (
    <MiniPreview>
      <div style={{ fontSize: 7, color: T.win, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginBottom: 4 }}>Flujo del Juego</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: `${T.gold}15`, border: `1px solid ${T.gold}30`, borderRadius: 4, padding: '2px 10px', fontSize: 8, color: T.gold, fontWeight: 600 }}>{s}</div>
            {i < steps.length - 1 && <div style={{ width: 1, height: 6, background: T.gold + '40' }} />}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 7, textAlign: 'center', color: T.tx4 }}>↺ Repite hasta ascender o caer</div>
    </MiniPreview>
  );
}

export default function TutorialScreen() {
  const { go } = useGameStore();
  const [step, setStep] = useState(0);
  const TOTAL = 7;

  const [slideDir, setSlideDir] = useState(1);

  function next() {
    SFX.play('click');
    Haptics.light();
    setSlideDir(1);
    if (step < TOTAL - 1) setStep(step + 1);
    else go('coach');
  }

  function prev() {
    SFX.play('click');
    setSlideDir(-1);
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
      {/* Progress bar */}
      <div style={{ width: '100%', height: 3, background: T.bg2, flexShrink: 0, zIndex: 10 }}>
        <div style={{ height: '100%', width: `${((step + 1) / TOTAL) * 100}%`, background: T.gold, borderRadius: '0 2px 2px 0', transition: 'width 0.4s ease' }} />
      </div>

      {/* Top section: Navigation + CTA in the first third */}
      <div style={{ flexShrink: 0, padding: '12px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        {step > 0 ? (
          <button onClick={prev} className="fw-btn-glass" style={{
            fontFamily: T.fontBody, fontSize: 11, color: T.tx3,
            background: T.glass, backdropFilter: 'blur(12px)',
            border: `1px solid ${T.glassBorder}`, borderRadius: 16, padding: '5px 14px',
            cursor: 'pointer', transition: 'all 0.2s ease',
          }}>
            ← Atrás
          </button>
        ) : <div />}
        <button onClick={skip} className="fw-btn-glass" style={{
          fontFamily: T.fontBody, fontSize: 11, color: T.tx3,
          background: T.glass, backdropFilter: 'blur(12px)',
          border: `1px solid ${T.glassBorder}`, borderRadius: 16, padding: '5px 14px',
          cursor: 'pointer', transition: 'all 0.2s ease',
        }}>
          Saltar →
        </button>
      </div>

      {/* Dots + CTA at top */}
      <div style={{ flexShrink: 0, padding: '8px 20px 6px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Dots total={TOTAL} current={step} />
        <button onClick={next} className="fw-btn fw-btn-primary" style={{
          width: '100%', fontSize: 15, padding: '13px', borderRadius: 10,
          fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
          touchAction: 'manipulation',
        }}>
          {step < TOTAL - 1 ? 'Siguiente →' : 'Comenzar'}
        </button>
      </div>

      {/* Content - scrollable, with slide transition */}
      <div style={{
        flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-start', padding: '10px 20px 16px',
        gap: 10, textAlign: 'center',
        animation: 'tutorialSlideIn 0.3s ease both',
      }}
        key={step}
      >
        {children}
      </div>
      <style>{`
        @keyframes tutorialSlideIn {
          from { opacity: 0; transform: translateX(${slideDir >= 0 ? '30' : '-30'}px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );

  // ═══════════════════════════════════════
  // SLIDE 0: Welcome / Intro
  // ═══════════════════════════════════════
  if (step === 0) return wrap(
    `radial-gradient(ellipse at 50% 40%, rgba(34,197,94,0.06) 0%, ${T.bg} 70%)`,
    <>
      <CoachPortrait id="miguel" size={56} />
      <div className="text-gradient-gold" style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 26, textTransform: 'uppercase' }}>
        Don Miguel
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 16, color: T.tx, maxWidth: 340, lineHeight: 1.7 }}>
        "Mijo, ¿te conté del torneo del 94? Teníamos un equipo de barrio... puros chavos de la colonia. Nadie nos daba un peso."
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx2, maxWidth: 340, lineHeight: 1.5, marginTop: 4 }}>
        "Pero ahora es diferente. Ahora tú decides <span style={{ color: T.gold }}>cómo</span> se juega."
      </div>
      <div style={{
        display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {['🦅', '📐', '💰', '🔮', '🌱', '🎲'].map((e, i) => (
          <div key={i} className="glass" style={{
            fontSize: 24, width: 42, height: 42, borderRadius: 10,
            border: `1px solid ${T.gold}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: `fadeIn 0.3s ease ${i * 0.1}s both`,
          }}>{e}</div>
        ))}
      </div>
      <PreviewTable />
      <TipBox text="Tu filosofía de juego define todo el run. Elige sabiamente." />
    </>
  );

  // ═══════════════════════════════════════
  // SLIDE 1: The Run (Core Loop)
  // ═══════════════════════════════════════
  if (step === 1) return wrap(
    `radial-gradient(ellipse at 50% 60%, rgba(59,130,246,0.06) 0%, ${T.bg} 70%)`,
    <>
      <div style={{ fontSize: 48 }}>🔄</div>
      <div style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 22, color: T.tx, textTransform: 'uppercase' }}>
        Cada Run es Único
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx2, maxWidth: 340, lineHeight: 1.6 }}>
        Cada partida es una carrera completa — del <span style={{ color: T.win }}>Barrio</span> hasta las <span style={{ color: T.gold }}>Estrellas</span>.
        Si pierdes, empiezas de nuevo. Pero lo que aprendes y desbloqueas <span style={{ color: T.gold }}>se queda para siempre</span>.
      </div>
      {/* Visual flow */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 300, width: '100%', marginTop: 8 }}>
        {[
          { icon: '🏠', label: 'Liga Barrio', color: T.win },
          { icon: '⬇', label: '', color: T.tx3 },
          { icon: '🏟', label: 'Liga Estatal', color: T.info },
          { icon: '⬇', label: '', color: T.tx3 },
          { icon: '🌍', label: 'Liga Mundial', color: T.draw },
          { icon: '⬇', label: '', color: T.tx3 },
          { icon: '🛸', label: 'Liga Intergaláctica', color: T.gold },
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
      <PreviewRoster />
      <TipBox text="Cada derrota es una lección. Los desbloqueos permanentes hacen tu siguiente run más fuerte." />
    </>
  );

  // ═══════════════════════════════════════
  // SLIDE 2: Manager Archetypes
  // ═══════════════════════════════════════
  if (step === 2) return wrap(
    `radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.08) 0%, ${T.bg} 70%)`,
    <>
      <div style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 18, color: T.purple, textTransform: 'uppercase', letterSpacing: 1 }}>
        Filosofía de Juego
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx2, maxWidth: 340, lineHeight: 1.5 }}>
        Antes de cada run, elige una <span style={{ color: T.purple, fontWeight: 700 }}>filosofía de manager</span> que cambia <span style={{ color: T.tx }}>todo</span>: tu economía, tu estilo, tus opciones tácticas.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 340, width: '100%' }}>
        <MiniCard icon="🦅" title="El Caudillo" desc="Empates = derrota. Pero +25% ATK cuando vas perdiendo." color={T.lose} delay={100} />
        <MiniCard icon="📐" title="El Arquitecto" desc="Ve la formación rival. Eventos tácticos con opción secreta." color={T.info} delay={250} />
        <MiniCard icon="💰" title="El Mercenario" desc="+30 monedas. -30% precios. Jugadores nuevos llegan con boost." color={T.gold} delay={400} />
        <MiniCard icon="🔮" title="El Místico" desc="Maldiciones más fuertes... pero dan bonos ocultos." color={T.purple} delay={550} />
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3, marginTop: 4 }}>
        + La Cantera 🌱 y El Apostador 🎲 (desbloqueables)
      </div>
      <PreviewMatch />
      <TipBox text="El Caudillo es agresivo pero arriesgado. El Arquitecto da control. Prueba todos." />
    </>
  );

  // ═══════════════════════════════════════
  // SLIDE 3: Tactical Cards
  // ═══════════════════════════════════════
  if (step === 3) return wrap(
    `radial-gradient(ellipse at 50% 40%, rgba(139,92,246,0.06) 0%, ${T.bg} 70%)`,
    <>
      <div className="text-gradient-gold" style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 }}>
        🎴 Cartas Tácticas
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx2, maxWidth: 340, lineHeight: 1.5 }}>
        Colecciona <span style={{ color: T.gold }}>cartas permanentes</span> entre runs. Antes de jugar, arma tu <span style={{ color: T.tx }}>loadout</span> — las cartas se activan solas durante los partidos.
      </div>
      {/* Card examples */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 340, width: '100%' }}>
        <MiniCard icon="⏰" title="Presión Final" desc="Después del min 75, +20% chance de gol." color={T.lose} delay={100} />
        <MiniCard icon="🧱" title="Muro Humano" desc="Primera chance rival: -15% probabilidad de gol." color={T.info} delay={250} />
        <MiniCard icon="💵" title="Bono por Gol" desc="+5 monedas por cada gol que anotes." color={T.gold} delay={400} />
        <MiniCard icon="🌑" title="Pacto Oscuro" desc="+30% gol... pero ganas maldición cada 3 partidos." color={T.purple} delay={550} />
      </div>
      {/* Slot preview */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3, marginBottom: 6 }}>Tu filosofía define los slots disponibles:</div>
        <SlotRow slots={{ offensive: 3, defensive: 1, economic: 1, chaotic: 1 }} delay={700} />
      </div>
      <PreviewCards />
      <TipBox text="Las cartas se activan solas durante el partido. Busca sinergias con tu arquetipo." />
    </>
  );

  // ═══════════════════════════════════════
  // SLIDE 4: Curse Mastery
  // ═══════════════════════════════════════
  if (step === 4) return wrap(
    `radial-gradient(ellipse at 50% 50%, rgba(239,68,68,0.06) 0%, ${T.bg} 70%)`,
    <>
      <div style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 18, color: T.lose, textTransform: 'uppercase', letterSpacing: 1 }}>
        Dominio de Maldiciones
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx2, maxWidth: 340, lineHeight: 1.5 }}>
        Las maldiciones ya no son solo malas. <span style={{ color: T.lose }}>Aguanta el sufrimiento</span> y la maldición se transforma en <span style={{ color: T.gold }}>bendición</span>.
      </div>
      {/* Transformation visual */}
      <div className="glass" style={{ maxWidth: 320, width: '100%', borderRadius: 12, padding: '16px 18px', border: `1px solid ${T.lose}20` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 24 }}>💸</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.fontHeading, fontSize: 12, color: T.lose }}>Deuda con el Barrio</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3 }}>-10 monedas por jornada</div>
          </div>
        </div>
        <AnimBar pct={75} color={T.lose} label="Maestría" delay={300} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '8px 0' }}>
          <div style={{ width: 40, height: 1, background: T.glassBorder }} />
          <span style={{ fontSize: 10, color: T.tx3 }}>se transforma en</span>
          <div style={{ width: 40, height: 1, background: T.glassBorder }} />
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
        En el <span style={{ color: T.lose }}>Curandero</span> puedes curar la maldición... pero pierdes el progreso de maestría. <span style={{ color: T.gold }}>¿Curar o aguantar?</span>
      </div>
      <PreviewRelics />
      <TipBox text="El Místico gana maestría 50% más rápido. Las bendiciones valen la pena." />
    </>
  );

  // ═══════════════════════════════════════
  // SLIDE 5: Ascension Mutators
  // ═══════════════════════════════════════
  if (step === 5) return wrap(
    `radial-gradient(ellipse at 50% 60%, rgba(245,158,11,0.06) 0%, ${T.bg} 70%)`,
    <>
      <div style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 18, color: T.draw, textTransform: 'uppercase', letterSpacing: 1 }}>
        Mutadores de Ascensión
      </div>
      <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.tx2, maxWidth: 340, lineHeight: 1.5 }}>
        ¿Quieres más <span style={{ color: T.draw }}>desafío</span>? Activa hasta 3 mutadores antes de tu run. Más difícil = más <span style={{ color: T.gold }}>puntos de legado</span>.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 340, width: '100%' }}>
        <MiniCard icon="⏰" title="Reloj Maldito" desc="Partidos de 120 min. Más ticks, más chances. +1 LP" color={T.draw} delay={100} />
        <MiniCard icon="🪟" title="Cristal" desc="Lesiones 3x más probables. +2 LP" color={T.draw} delay={250} />
        <MiniCard icon="☠️" title="Maldición Eterna" desc="Empiezas con 2 maldiciones aleatorias. +3 LP" color={T.draw} delay={400} />
      </div>
      <div className="glass" style={{
        display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '10px 16px',
        border: `1px solid ${T.gold}20`, borderRadius: 10,
        opacity: 0, animation: 'fadeIn 0.5s ease 0.6s forwards',
      }}>
        <span style={{ fontSize: 20 }}>🌳</span>
        <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.gold, lineHeight: 1.3 }}>
          Los puntos de legado desbloquean mejoras <strong>permanentes</strong> en el Árbol de Legado.
        </div>
      </div>
      <PreviewLegacy />
      <TipBox text="No actives mutadores en tu primer run. Cuando domines el juego, sube la dificultad." />
    </>
  );

  // ═══════════════════════════════════════
  // SLIDE 6: Setup Flow + Go
  // ═══════════════════════════════════════
  if (step === 6) return wrap(
    `radial-gradient(ellipse at 50% 40%, rgba(34,197,94,0.06) 0%, ${T.bg} 70%)`,
    <>
      <div style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 18, color: T.win, textTransform: 'uppercase', letterSpacing: 1 }}>
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
          { n: '3', icon: '🎴', label: 'Cartas Tácticas', sub: 'Arma tu loadout', color: T.purple },
          { n: '4', icon: '📿', label: 'Reliquia Inicial', sub: '¿Segura o maldita?', color: T.draw },
          { n: '5', icon: '⬆', label: 'Dificultad + Mutadores', sub: 'Riesgo vs recompensa', color: T.lose },
        ].map((item, i) => (
          <div key={i}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
              opacity: 0, animation: `slideUp 0.3s ease ${i * 0.12}s forwards`,
            }}>
              <div className="glass" style={{
                width: 34, height: 34, borderRadius: '50%',
                border: `1.5px solid ${item.color}35`,
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
                <div style={{ width: 1, height: '100%', background: T.glassBorder }} />
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
      <PreviewFlow />
      <TipBox text="Revisa tu roster y entrena jugadores entre partidos. No vayas directo al partido." />
    </>
  );

  return null;
}
