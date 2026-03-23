import { COACHES, COACH_PORTRAIT_IDX, NEMESIS, PN, POS_COLORS, T, CARD_TIERS, TRAITS, PERSONALITIES, TRAINING_OPTIONS, ACHIEVEMENTS, CAREER_TEAMS, calcOvr, effectiveStats, effectiveOvr, pick, BAR_NAMES, BAR_ICONS, BAR_COLORS } from "./data";

// ── Icon components ──
export function CoachPortrait({ id, size = 32 }) {
  const coach = COACHES.find(c => c.id === id);
  return (
    <div style={{
      width: size, height: size, fontSize: size * 0.7, display: 'flex',
      alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
      background: `${T.bg2}`, border: `1px solid ${T.border}`, flexShrink: 0,
    }}>
      {coach?.i || '🎓'}
    </div>
  );
}

export function NemesisPortrait({ coachId, size = 32 }) {
  const nem = NEMESIS[coachId];
  if (!nem) return null;
  return (
    <div style={{
      width: size, height: size, fontSize: size * 0.7, display: 'flex',
      alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
      background: `${T.bg2}`, border: `1px solid ${T.purple}30`, flexShrink: 0,
    }}>
      {nem.i}
    </div>
  );
}

export function PosIcon({ pos, size = 12 }) {
  return <span style={{ fontSize: size, color: POS_COLORS[pos] }}>{pos === 'GK' ? '🧤' : pos === 'DEF' ? '🛡' : pos === 'MID' ? '⚙' : '⚡'}</span>;
}

export function UIIcon({ name, size = 20 }) {
  const icons = {
    gamepad: '🎮', football: '⚽', skull: '💀', arrow: '➡️', table: '📋',
    whistle: '🎵', phone: '📱', fatigue: '😓', medic: '🏥', clipboard: '📋',
    dumbbell: '💪', shopbag: '🛍',
  };
  return <span style={{ fontSize: size }}>{icons[name] || '⚽'}</span>;
}

// ── PlayerCard ──
export function PlayerCard({ player, isCaptain, onAction, onDetail, compact = false }) {
  const ovr = effectiveOvr(player);
  const posColor = POS_COLORS[player.pos];
  const fatigued = (player.fatigue || 0) > 70;
  const injured = (player.injuredFor || 0) > 0;
  const es = effectiveStats(player);

  return (
    <div onClick={() => onDetail && onDetail(player)} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: compact ? '5px 8px' : '8px 10px',
      background: injured ? `${T.lose}08` : fatigued ? `${T.draw}08` : T.bg1,
      border: `1px solid ${injured ? T.lose + '20' : fatigued ? T.draw + '20' : T.border}`,
      borderLeft: `3px solid ${posColor}`, borderRadius: 4, cursor: 'pointer',
    }}>
      <span style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 10, color: posColor, minWidth: 26, textAlign: 'center' }}>{PN[player.pos]}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 600, fontSize: 13, color: T.tx, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {isCaptain ? '©️ ' : ''}{player.legendary ? '🌟 ' : ''}{player.name}{player.evo ? ' ⭐' : ''}{player.tempGK ? ' 🧤' : ''}
        </div>
        {!compact && (
          <div style={{ display: 'flex', gap: 5, fontSize: 11, fontFamily: "'Barlow Condensed'", fontWeight: 600, marginTop: 1 }}>
            <span style={{ color: T.lose }}>⚔{es.atk}</span>
            <span style={{ color: T.info }}>🛡{es.def}</span>
            <span style={{ color: T.win }}>⚡{es.spd}</span>
            {player.pos === 'GK' && <span style={{ color: '#ffc107' }}>🧤{es.sav}</span>}
          </div>
        )}
      </div>
      <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 16, color: T.gold }}>{ovr}</div>
      {injured && <span style={{ fontSize: 10 }}>🏥</span>}
      {!injured && fatigued && <span style={{ fontSize: 10, color: T.draw }}>{player.fatigue}%</span>}
      {onAction && (
        <div style={{ display: 'flex', gap: 2 }} onClick={e => e.stopPropagation()}>
          {player.role === 'rs' && (
            <button onClick={() => onAction('promote', player)} style={{ fontFamily: "'Oswald'", fontSize: 9, padding: '2px 5px', border: `1px solid ${T.win}`, background: `${T.win}15`, color: T.win, borderRadius: 3, cursor: 'pointer' }}>⬆</button>
          )}
          {player.role === 'st' && (
            <button onClick={() => onAction('demote', player)} style={{ fontFamily: "'Oswald'", fontSize: 9, padding: '2px 5px', border: `1px solid ${T.tx3}`, background: 'transparent', color: T.tx3, borderRadius: 3, cursor: 'pointer' }}>⬇</button>
          )}
          {player.pos !== 'GK' && player.role === 'rs' && (
            <button onClick={() => onAction('tempGK', player)} style={{ fontFamily: "'Oswald'", fontSize: 9, padding: '2px 5px', border: `1px solid ${player.tempGK ? '#ffc107' : T.tx3}`, background: player.tempGK ? 'rgba(255,193,7,0.12)' : 'transparent', color: player.tempGK ? '#ffc107' : T.tx3, borderRadius: 3, cursor: 'pointer' }}>🧤</button>
          )}
          <button onClick={() => onAction('captain', player)} style={{ fontFamily: "'Oswald'", fontSize: 9, padding: '2px 5px', border: `1px solid ${isCaptain ? T.gold : T.tx3}`, background: isCaptain ? `${T.gold}15` : 'transparent', color: isCaptain ? T.gold : T.tx3, borderRadius: 3, cursor: 'pointer' }}>©</button>
        </div>
      )}
    </div>
  );
}

// ── Player Detail Modal ──
export function PlayerDetailModal({ player, onClose, captainId }) {
  if (!player) return null;
  const isCaptain = player.id === captainId;
  const tier = player.legendary ? CARD_TIERS.legendary : player.evo ? CARD_TIERS.rare : CARD_TIERS.normal;
  const es = effectiveStats(player);

  return (
    <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16, backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: tier.bg, borderRadius: 12, maxWidth: 340, width: '100%', border: `1px solid ${player.legendary ? T.gold + '40' : tier.border}`, boxShadow: tier.glow !== 'none' ? tier.glow : '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 0', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 48, color: player.legendary ? T.gold : player.evo ? '#a78bfa' : T.tx, lineHeight: 1 }}>{effectiveOvr(player)}</div>
          <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 16, color: T.tx, marginTop: 4 }}>{isCaptain ? '©️ ' : ''}{player.legendary ? '🌟 ' : ''}{player.name}{player.evo ? ' ⭐' : ''}</div>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx2 }}>Nivel {player.lv} · {player.role === 'st' ? 'Titular' : 'Reserva'} · {PN[player.pos]}</div>
        </div>
        <div style={{ padding: '12px 16px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4, marginBottom: 10 }}>
            {[{ s: es.atk, l: 'ATK', c: T.lose }, { s: es.def, l: 'DEF', c: T.info }, { s: es.spd, l: 'VEL', c: T.win }, { s: es.sav, l: 'PAR', c: '#ffc107' }].map(({ s, l, c }, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 22, color: c }}>{s}</div>
                <div style={{ fontSize: 8, color: T.tx3 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx2, marginBottom: 3 }}>
              <span>Fatiga</span><span style={{ color: (player.fatigue || 0) > 70 ? T.lose : T.win }}>{player.fatigue || 0}%</span>
            </div>
            <div style={{ width: '100%', height: 6, background: T.bg2, borderRadius: 3 }}>
              <div style={{ width: `${player.fatigue || 0}%`, height: '100%', background: (player.fatigue || 0) > 70 ? T.lose : T.win, borderRadius: 3 }} />
            </div>
          </div>
          <div style={{ background: `${T.purple}10`, borderRadius: 6, padding: 8, marginBottom: 5, border: `1px solid ${T.purple}20` }}>
            <div style={{ fontFamily: "'Oswald'", fontSize: 12, color: player.legendary ? T.gold : T.purple }}>✦ {player.trait.n}</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx2, marginTop: 2 }}>{player.trait.d}</div>
          </div>
          {player.personality && (
            <div style={{ background: `${T.info}08`, borderRadius: 6, padding: 8, marginBottom: 5, border: `1px solid ${T.info}15` }}>
              <div style={{ fontFamily: "'Oswald'", fontSize: 12, color: T.info }}>{player.personality.i} {player.personality.n}</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: T.tx2, marginTop: 2 }}>{player.personality.d}</div>
            </div>
          )}
          <button onClick={onClose} style={{ width: '100%', fontFamily: "'Oswald'", fontWeight: 600, fontSize: 13, padding: '10px', border: `1px solid ${T.tx3}`, background: 'transparent', color: T.tx, borderRadius: 6, cursor: 'pointer', marginTop: 2 }}>Cerrar</button>
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
            <div style={{ fontFamily: "'Oswald'", fontSize: 9, color: danger ? '#ff1744' : '#607d8b', marginTop: 1 }}>{val}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Particle System ──
export class ParticleSystem {
  constructor() { this.particles = []; }
  emit(x, y, count, color, opts = {}) {
    for (let i = 0; i < count; i++) {
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