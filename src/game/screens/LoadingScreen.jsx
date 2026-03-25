import { T } from '@/game/data';

export default function LoadingScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: `radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%), ${T.bg}`, gap: 16 }}>
      <div className="fw-float" style={{ fontSize: 56, filter: 'drop-shadow(0 0 16px rgba(59,130,246,0.3))' }}>⚽</div>
      <div className="fw-pulse" style={{ fontFamily: T.fontTitle, fontWeight: 700, fontSize: 20, color: T.gold, textTransform: 'uppercase', letterSpacing: 4, textShadow: T.glowGold }}>Cargando</div>
      <div style={{ width: 120, height: 3, borderRadius: 2, background: T.bg2, overflow: 'hidden', marginTop: 4 }}>
        <div style={{ width: '40%', height: '100%', background: T.gradientPrimary, borderRadius: 2, animation: 'shimmer 1.5s ease-in-out infinite alternate' }} />
      </div>
    </div>
  );
}
