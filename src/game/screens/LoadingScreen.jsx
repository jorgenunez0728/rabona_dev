import { T } from '@/game/data';

export default function LoadingScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: T.bg, gap: 12 }}>
      <div className="fw-float" style={{ fontSize: 48 }}>⚽</div>
      <div className="fw-pulse" style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 18, color: T.gold, textTransform: 'uppercase', letterSpacing: 3 }}>Cargando</div>
    </div>
  );
}
