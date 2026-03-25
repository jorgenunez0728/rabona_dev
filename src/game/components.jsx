import { COACHES, COACH_PORTRAIT_IDX, NEMESIS, PN, POS_COLORS, T, CARD_TIERS, TRAITS, PERSONALITIES, TRAINING_OPTIONS, ACHIEVEMENTS, CAREER_TEAMS, calcOvr, effectiveStats, effectiveOvr, pick, BAR_NAMES, BAR_ICONS, BAR_COLORS } from "./data";
import { CHIBI, ChibiImg } from "./data/chibiAssets.jsx";

// ── Icon components ──
export function CoachPortrait({ id, size = 32 }) {
  const asset = CHIBI.coaches[id];
  return (
    <div style={{
      width: size, height: size, display: 'flex',
      alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
      background: `${T.bg2}`, border: `1px solid ${T.border}`, flexShrink: 0,
      overflow: 'hidden',
    }}>
      <ChibiImg asset={asset} size={size} />
    </div>
  );
}

export function NemesisPortrait({ coachId, size = 32 }) {
  const nem = NEMESIS[coachId];
  if (!nem) return null;
  const asset = CHIBI.nemesis[coachId];
  return (
    <div style={{
      width: size, height: size, display: 'flex',
      alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
      background: `${T.bg2}`, border: `1px solid ${T.purple}30`, flexShrink: 0,
      overflow: 'hidden',
    }}>
      <ChibiImg asset={asset || { fallback: nem.i }} size={size} />
    </div>
  );
}

export function PosIcon({ pos, size = 12 }) {
  const asset = CHIBI.positions[pos];
  return <ChibiImg asset={asset} size={size} style={{ color: POS_COLORS[pos] }} />;
}

export function UIIcon({ name, size = 20 }) {
  const icons = {
    gamepad: '🎮', football: '⚽', skull: '💀', arrow: '➡️', table: '📋',
    whistle: '🎵', phone: '📱', fatigue: '😓', medic: '🏥', clipboard: '📋',
    dumbbell: '💪', shopbag: '🛍',
  };
  return <span style={{ fontSize: size }}>{icons[name] || '⚽'}</span>;
}

// ── PlayerCard — FIFA Ultimate Team style ──
export function PlayerCard({ player, isCaptain, onAction, onDetail, compact = false }) {
  const ovr = effectiveOvr(player);
  const posColor = POS_COLORS[player.pos];
  const fatigued = (player.fatigue || 0) > 70;
  const injured = (player.injuredFor || 0) > 0;
  const es = effectiveStats(player);
  const isSpecial = player.legendary || player.evo;

  const actionBtnStyle = (color, active = false) => ({
    fontFamily: T.fontHeading, fontSize: 12, fontWeight: 600,
    padding: '4px 8px', minWidth: 36, minHeight: 36,
    border: `1px solid ${active ? color : T.border}`,
    background: active ? `${color}12` : 'rgba(255,255,255,0.02)',
    color: active ? color : T.tx3, borderRadius: 6,
    cursor: 'pointer', touchAction: 'manipulation',
    transition: 'all 0.2s ease',
  });

  return (
    <div onClick={() => onDetail && onDetail(player)} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: compact ? '6px 10px' : '10px 12px',
      background: injured ? `${T.lose}06` : fatigued ? `${T.draw}06` : T.bg1,
      border: `1px solid ${injured ? T.lose + '18' : fatigued ? T.draw + '18' : T.border}`,
      borderLeft: `3px solid ${posColor}`,
      borderRadius: 8, cursor: 'pointer',
      boxShadow: isSpecial ? `0 0 16px ${player.legendary ? 'rgba(240,192,64,0.08)' : 'rgba(139,92,246,0.08)'}` : T.shadow,
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      backdropFilter: 'blur(8px)',
    }}>
      {/* Position Badge */}
      <span style={{
        fontFamily: T.fontHeading, fontWeight: 700, fontSize: 10, color: '#fff',
        background: posColor, padding: '2px 6px', borderRadius: 4,
        minWidth: 30, textAlign: 'center', letterSpacing: 0.5,
      }}>{PN[player.pos]}</span>
      {/* Player Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontHeading, fontWeight: 600, fontSize: 13, color: T.tx, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {isCaptain ? '© ' : ''}{player.legendary ? '★ ' : ''}{player.name}{player.evo ? ' ✦' : ''}{player.tempGK ? ' GK' : ''}
        </div>
        {!compact && (
          <div style={{ display: 'flex', gap: 6, fontSize: 11, fontFamily: T.fontBody, fontWeight: 600, marginTop: 2 }}>
            {[
              { v: es.atk, l: 'ATK', c: T.lose },
              { v: es.def, l: 'DEF', c: T.info },
              { v: es.spd, l: 'VEL', c: T.win },
              ...(player.pos === 'GK' ? [{ v: es.sav, l: 'PAR', c: POS_COLORS.GK }] : []),
            ].map(({ v, l, c }) => (
              <span key={l} style={{ color: c, background: `${c}10`, padding: '1px 4px', borderRadius: 3, fontSize: 10, letterSpacing: 0.3 }}>{l} {v}</span>
            ))}
          </div>
        )}
      </div>
      {/* OVR Badge */}
      <div style={{
        fontFamily: T.fontHeading, fontWeight: 700, fontSize: 18, color: player.legendary ? T.gold : player.evo ? T.purple : T.tx,
        background: player.legendary ? 'rgba(240,192,64,0.1)' : player.evo ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.04)',
        padding: '4px 8px', borderRadius: 6, minWidth: 38, textAlign: 'center',
        border: `1px solid ${player.legendary ? T.gold + '25' : player.evo ? T.purple + '25' : 'rgba(255,255,255,0.06)'}`,
      }}>{ovr}</div>
      {/* Status */}
      {injured && <span style={{ fontSize: 10, color: T.lose, fontFamily: T.fontHeading, fontWeight: 600, background: `${T.lose}10`, padding: '2px 6px', borderRadius: 4 }}>INJ</span>}
      {!injured && fatigued && <span style={{ fontSize: 10, color: T.draw, fontFamily: T.fontHeading, fontWeight: 600 }}>{player.fatigue}%</span>}
      {/* Action Buttons */}
      {onAction && (
        <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
          {player.role === 'rs' && (
            <button onClick={() => onAction('promote', player)} style={actionBtnStyle(T.win, true)}>▲</button>
          )}
          {player.role === 'st' && (
            <button onClick={() => onAction('demote', player)} style={actionBtnStyle(T.tx3)}>▼</button>
          )}
          {player.pos !== 'GK' && player.role === 'rs' && (
            <button onClick={() => onAction('tempGK', player)} style={actionBtnStyle(POS_COLORS.GK, player.tempGK)}>GK</button>
          )}
          <button onClick={() => onAction('captain', player)} style={actionBtnStyle(T.gold, isCaptain)}>C</button>
        </div>
      )}
    </div>
  );
}

// ── Player Detail Modal — Premium FIFA card style ──
export function PlayerDetailModal({ player, onClose, captainId }) {
  if (!player) return null;
  const isCaptain = player.id === captainId;
  const tier = player.legendary ? CARD_TIERS.legendary : player.evo ? CARD_TIERS.rare : CARD_TIERS.normal;
  const es = effectiveStats(player);
  const posColor = POS_COLORS[player.pos];
  const accentColor = player.legendary ? T.gold : player.evo ? T.purple : T.info;

  return (
    <div onClick={onClose} className="glass-heavy" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} className="anim-scale-in" style={{
        background: tier.bg, borderRadius: 16, maxWidth: 360, width: '100%',
        border: `1px solid ${player.legendary ? T.gold + '35' : player.evo ? T.purple + '30' : tier.border}`,
        boxShadow: tier.glow !== 'none' ? `${tier.glow}, ${T.shadowXl}` : T.shadowXl,
        overflow: 'hidden',
      }}>
        {/* Header with OVR + Position */}
        <div style={{ padding: '24px 24px 16px', textAlign: 'center', position: 'relative' }}>
          {/* Position badge top-left */}
          <div style={{ position: 'absolute', top: 16, left: 20 }}>
            <span style={{
              fontFamily: T.fontHeading, fontWeight: 700, fontSize: 11, color: '#fff',
              background: posColor, padding: '3px 10px', borderRadius: 4, letterSpacing: 0.5,
            }}>{PN[player.pos]}</span>
          </div>
          {/* Level badge top-right */}
          <div style={{ position: 'absolute', top: 16, right: 20 }}>
            <span style={{ fontFamily: T.fontBody, fontWeight: 600, fontSize: 11, color: T.tx3 }}>Nv.{player.lv}</span>
          </div>
          {/* OVR */}
          <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 56, color: accentColor, lineHeight: 1, letterSpacing: -1 }}>{effectiveOvr(player)}</div>
          <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 18, color: T.tx, marginTop: 6, letterSpacing: 0.5 }}>
            {isCaptain ? '© ' : ''}{player.legendary ? '★ ' : ''}{player.name}{player.evo ? ' ✦' : ''}
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.tx3, marginTop: 2 }}>
            {player.role === 'st' ? 'Titular' : 'Reserva'}
          </div>
        </div>
        {/* Divider */}
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${accentColor}30, transparent)`, margin: '0 20px' }} />
        {/* Stats Grid */}
        <div style={{ padding: '16px 20px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginBottom: 14 }}>
            {[{ s: es.atk, l: 'ATK', c: T.lose }, { s: es.def, l: 'DEF', c: T.info }, { s: es.spd, l: 'VEL', c: T.win }, { s: es.sav, l: 'PAR', c: POS_COLORS.GK }].map(({ s, l, c }, i) => (
              <div key={i} style={{ background: `${c}08`, borderRadius: 8, padding: '8px 4px', textAlign: 'center', border: `1px solid ${c}12` }}>
                <div style={{ fontFamily: T.fontHeading, fontWeight: 700, fontSize: 24, color: c }}>{s}</div>
                <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3, letterSpacing: 0.8, fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
          {/* Fatigue Bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: T.fontBody, fontSize: 11, color: T.tx2, marginBottom: 4, fontWeight: 500 }}>
              <span>Fatiga</span><span style={{ color: (player.fatigue || 0) > 70 ? T.lose : T.win, fontWeight: 600 }}>{player.fatigue || 0}%</span>
            </div>
            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
              <div style={{ width: `${player.fatigue || 0}%`, height: '100%', background: (player.fatigue || 0) > 70 ? T.gradientDanger : T.gradientGreen, borderRadius: 2, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
            </div>
          </div>
          {/* Trait */}
          <div style={{ background: `${T.purple}08`, borderRadius: 8, padding: '10px 12px', marginBottom: 6, border: `1px solid ${T.purple}15` }}>
            <div style={{ fontFamily: T.fontHeading, fontSize: 12, fontWeight: 600, color: player.legendary ? T.gold : T.purple }}>✦ {player.trait.n}</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx2, marginTop: 3 }}>{player.trait.d}</div>
          </div>
          {/* Personality */}
          {player.personality && (
            <div style={{ background: `${T.info}06`, borderRadius: 8, padding: '10px 12px', marginBottom: 6, border: `1px solid ${T.info}12` }}>
              <div style={{ fontFamily: T.fontHeading, fontSize: 12, fontWeight: 600, color: T.info }}>{player.personality.i} {player.personality.n}</div>
              <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx2, marginTop: 3 }}>{player.personality.d}</div>
            </div>
          )}
          {/* Close Button */}
          <button onClick={onClose} className="fw-btn fw-btn-outline" style={{ width: '100%', marginTop: 8, fontSize: 13, padding: '11px', borderRadius: 8, color: T.tx2, borderColor: T.border }}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ── Career Bars ──
export function CareerBars({ bars }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 2, padding: '6px 8px', background: '#0a0e1a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      {BAR_NAMES.map((name, i) => {
        const key = ['rend', 'fis', 'rel', 'fam', 'men'][i];
        const val = bars[key] || 0;
        const danger = val < 20 || val > 90;
        return (
          <div key={i} style={{ flex: 1, textAlign: 'center', maxWidth: 60 }}>
            <div style={{ fontSize: 14 }}>{BAR_ICONS[i]}</div>
            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 2 }}>
              <div style={{ width: `${val}%`, height: '100%', background: danger ? '#ff1744' : BAR_COLORS[i], borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontFamily: "'Oswald'", fontSize: 11, color: danger ? '#ff1744' : '#607d8b', letterSpacing: 0.5, marginTop: 1 }}>{val}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Particle System ──
export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = (typeof navigator !== 'undefined' && navigator.deviceMemory && navigator.deviceMemory <= 4) ? 30 : 80;
  }
  emit(x, y, count, color, opts = {}) {
    const effectiveCount = Math.min(count, this.maxParticles - this.particles.length);
    for (let i = 0; i < effectiveCount; i++) {
      this.particles.push({
        x, y, vx: (Math.random() - 0.5) * (opts.spread || 4), vy: -Math.random() * (opts.upforce || 3) - 1,
        life: 1, decay: 0.01 + Math.random() * 0.02, size: opts.size || (2 + Math.random() * 3),
        color, gravity: opts.gravity || 0.05, type: opts.type || 'circle',
      });
    }
  }
  update(ctx) {
    this.particles = this.particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.life -= p.decay;
      if (p.life <= 0) return false;
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      if (p.type === 'confetti') {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.vx * 10);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      } else {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      return true;
    });
  }
}