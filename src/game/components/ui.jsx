import { T, POS_COLORS, PN } from '@/game/data';
import { Haptics } from '@/game/haptics';
import { useRef, useEffect, useState } from 'react';

// ═══════════════════════════════════════════════════════
//  Rabona v4.0 — Game UI Component Library
// ═══════════════════════════════════════════════════════

// ── GameButton ──
// Variants: primary, green, danger, glass, outline
export function GameButton({ children, variant = 'primary', size = 'md', disabled, onClick, style, className = '', ...props }) {
  const handleClick = (e) => {
    if (disabled) return;
    Haptics.light();
    onClick?.(e);
  };
  const sizeClass = size === 'sm' ? ' fw-btn-sm' : size === 'lg' ? ' fw-btn-lg' : '';
  return (
    <button
      className={`fw-btn fw-btn-${variant}${sizeClass} ${className}`}
      disabled={disabled}
      onClick={handleClick}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}

// ── GlassCard ──
// Variants: default, light, heavy, gold, purple
export function GlassCard({ children, variant = 'default', onClick, style, className = '', animate, ...props }) {
  const classMap = {
    default: 'glass',
    light: 'glass-light',
    heavy: 'glass-heavy',
    gold: 'card-gold',
    purple: 'card-purple',
  };
  const animClass = animate ? ` ${animate}` : '';
  return (
    <div
      className={`${classMap[variant] || 'glass'}${animClass} ${className}`}
      onClick={onClick}
      style={{ borderRadius: T.r3, padding: T.sp4, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

// ── SectionHeader ──
export function SectionHeader({ label, count, icon, style }) {
  return (
    <div className="section-header" style={style}>
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      <span>{label}</span>
      {count != null && (
        <span style={{
          fontSize: 10, fontFamily: T.fontBody, fontWeight: 600,
          background: 'rgba(255,255,255,0.06)', padding: '2px 6px',
          borderRadius: T.r1, color: T.tx3, letterSpacing: 0,
          textTransform: 'none',
        }}>
          {count}
        </span>
      )}
    </div>
  );
}

// ── StatBar ──
// Animated horizontal stat bar with label and value
export function StatBar({ label, value, max = 99, color, showValue = true, thick, style }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color || T.gold;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...style }}>
      {label && (
        <span style={{
          fontFamily: T.fontHeading, fontWeight: 600, fontSize: 10,
          color: barColor, minWidth: 28, letterSpacing: 0.3,
        }}>
          {label}
        </span>
      )}
      <div className={`stat-bar stat-bar-animated${thick ? ' stat-bar-thick' : ''}`} style={{ flex: 1 }}>
        <div className="stat-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      {showValue && (
        <span style={{
          fontFamily: T.fontHeading, fontWeight: 700, fontSize: 11,
          color: T.tx, minWidth: 20, textAlign: 'right',
        }}>
          {value}
        </span>
      )}
    </div>
  );
}

// ── TabBar ──
// Horizontal scrollable tab bar with gold underline indicator
export function TabBar({ tabs, activeTab, onTabChange, style }) {
  return (
    <div style={{
      display: 'flex', gap: 0, overflowX: 'auto', overflowY: 'hidden',
      borderBottom: `1px solid ${T.border}`,
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none',
      ...style,
    }}>
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => {
              Haptics.light();
              onTabChange(tab.id);
            }}
            style={{
              flex: tab.flex ? 1 : undefined,
              padding: '10px 14px', minWidth: 0, whiteSpace: 'nowrap',
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: T.fontHeading, fontWeight: active ? 700 : 500,
              fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8,
              color: active ? T.gold : T.tx3,
              borderBottom: active ? `2px solid ${T.gold}` : '2px solid transparent',
              transition: `color ${T.transQuick}, border-color ${T.transQuick}`,
              touchAction: 'manipulation',
            }}
          >
            {tab.icon && <span style={{ marginRight: 4 }}>{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Badge ──
// Small pill badge for positions, rarity, status
export function Badge({ children, color, bg, size = 'sm', glow, style }) {
  const sizeStyles = {
    xs: { fontSize: 8, padding: '1px 4px' },
    sm: { fontSize: 10, padding: '2px 6px' },
    md: { fontSize: 12, padding: '3px 8px' },
    lg: { fontSize: 14, padding: '4px 10px' },
  };
  return (
    <span style={{
      fontFamily: T.fontHeading, fontWeight: 700, letterSpacing: 0.5,
      borderRadius: T.r1, textTransform: 'uppercase',
      color: color || '#fff', background: bg || 'rgba(255,255,255,0.1)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: size === 'xs' ? 20 : 28,
      boxShadow: glow || 'none',
      ...sizeStyles[size],
      ...style,
    }}>
      {children}
    </span>
  );
}

// ── PosBadge — Position-specific badge ──
export function PosBadge({ pos, size = 'sm' }) {
  const color = POS_COLORS[pos];
  return <Badge color="#fff" bg={color} size={size}>{PN[pos]}</Badge>;
}

// ── OvrBadge — Overall rating circle ──
export function OvrBadge({ value, size = 36, glow }) {
  const tier = value >= 85 ? 'legendary' : value >= 70 ? 'rare' : 'normal';
  const borderColor = tier === 'legendary' ? 'rgba(240,192,64,0.4)' :
    tier === 'rare' ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.12)';
  const textColor = tier === 'legendary' ? T.gold : tier === 'rare' ? T.purple : T.tx;
  return (
    <div style={{
      width: size, height: size, borderRadius: T.r2,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: T.fontHeading, fontWeight: 700, fontSize: size * 0.44,
      color: textColor,
      background: `linear-gradient(145deg, ${borderColor.replace(/[\d.]+\)$/, '0.15)')}, ${borderColor.replace(/[\d.]+\)$/, '0.05)')})`,
      border: `1px solid ${borderColor}`,
      boxShadow: glow ? `0 0 16px ${borderColor}` : 'none',
    }}>
      {value}
    </div>
  );
}

// ── ResourceBar ──
// Compact header bar showing resources (coins, XP, league, etc.)
export function ResourceBar({ items, style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: T.sp3, padding: `${T.sp2}px ${T.sp3}px`,
      background: 'rgba(255,255,255,0.03)', borderRadius: T.r2,
      border: `1px solid ${T.border}`,
      ...style,
    }}>
      {items.map((item, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontFamily: T.fontBody, fontWeight: 600, fontSize: 12, color: T.tx2,
        }}>
          <span style={{ fontSize: 14 }}>{item.icon}</span>
          <span style={{ color: item.color || T.tx }}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── EmptyState ──
export function EmptyState({ icon = '📭', title, message, action, style }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: `${T.sp10}px ${T.sp6}px`,
      textAlign: 'center', ...style,
    }}>
      <span style={{ fontSize: 40, marginBottom: T.sp4, opacity: 0.5 }}>{icon}</span>
      {title && (
        <span style={{
          fontFamily: T.fontHeading, fontWeight: 700, fontSize: 16,
          color: T.tx2, marginBottom: T.sp2,
        }}>
          {title}
        </span>
      )}
      {message && (
        <span style={{
          fontFamily: T.fontBody, fontSize: 13, color: T.tx3, maxWidth: 260,
          lineHeight: 1.5,
        }}>
          {message}
        </span>
      )}
      {action && <div style={{ marginTop: T.sp4 }}>{action}</div>}
    </div>
  );
}

// ── NumberCounter ──
// Animated number that rolls up/down on value change
export function NumberCounter({ value, prefix = '', suffix = '', color, size = 'md', style }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [animating, setAnimating] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setAnimating(false);
      }, 50);
      prevRef.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  const sizeStyles = {
    sm: { fontSize: 14, fontWeight: 600 },
    md: { fontSize: 20, fontWeight: 700 },
    lg: { fontSize: 28, fontWeight: 700 },
    xl: { fontSize: 36, fontWeight: 700 },
  };

  return (
    <span
      className={animating ? 'anim-number-roll' : ''}
      style={{
        fontFamily: T.fontHeading, color: color || T.tx,
        display: 'inline-block', overflow: 'hidden',
        ...sizeStyles[size],
        ...style,
      }}
    >
      {prefix}{typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}{suffix}
    </span>
  );
}

// ── ScreenHeader ──
// Consistent header for sub-screens with back button
export function ScreenHeader({ title, subtitle, onBack, right, style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: T.sp3,
      padding: `${T.sp3}px ${T.sp4}px`,
      ...style,
    }}>
      {onBack && (
        <button
          onClick={() => { Haptics.light(); onBack(); }}
          style={{
            background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`,
            borderRadius: T.r2, width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: T.tx2, fontSize: 16,
            transition: `all ${T.transQuick}`,
          }}
        >
          ←
        </button>
      )}
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: T.fontHeading, fontWeight: 700, fontSize: 16,
          color: T.tx, textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.tx3, marginTop: 1 }}>
            {subtitle}
          </div>
        )}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

// ── Divider ──
export function Divider({ variant = 'subtle', style }) {
  return <hr className={variant === 'gold' ? 'divider-gold' : 'divider-subtle'} style={{ margin: `${T.sp3}px 0`, ...style }} />;
}
