import { SFX } from '@/game/audio';
import { T } from '@/game/data';
import useGameStore from '@/game/store';

export default function TitleScreen() {
  const { hasSave, globalStats, go, handleDeleteSave, setCareer, setCareerScreen } = useGameStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14, textAlign: 'center', background: 'radial-gradient(ellipse at 50% 70%,#15250e 0%,#0b1120 70%)', position: 'relative', overflow: 'hidden' }}>
      <div className="fw-anim-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 'clamp(36px,12vw,72px)', color: T.gold, letterSpacing: 4, textShadow: `0 0 40px ${T.gold}40` }}>RABONA</div>
        <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 500, fontSize: 'clamp(13px,3.5vw,18px)', color: '#c8a84e', letterSpacing: 4, textTransform: 'uppercase' }}>Del Barrio a las Estrellas</div>
      </div>
      <div className="fw-anim-2" style={{ width: 60, height: 2, background: `linear-gradient(90deg,transparent,${T.gold},transparent)`, borderRadius: 1 }} />
      <div className="fw-anim-3" style={{ fontSize: 'clamp(11px,2.5vw,14px)', color: '#455a64', maxWidth: 300, lineHeight: 1.5, padding: '0 20px' }}>Arma tu equipo en una cancha llanera. Llévalo hasta conquistar la galaxia.</div>
      <div className="fw-anim-4" style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', marginTop: 4 }}>
        {hasSave && <button className="fw-btn fw-btn-green" onClick={() => { SFX.play('click'); go('table'); }}>▶ Continuar Carrera</button>}
        <button className={`fw-btn ${hasSave ? 'fw-btn-outline' : 'fw-btn-primary'}`} onClick={() => { if (hasSave && !confirm('¿Borrar partida guardada?')) return; handleDeleteSave(); go('tutorial'); }} style={hasSave ? { fontSize: 12, padding: '8px 20px', color: T.tx2 } : {}}>Nueva Carrera</button>
      </div>
      <div className="fw-anim-5" style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {(globalStats.totalRuns || 0) > 0 && <button className="fw-btn fw-btn-outline" onClick={() => go('stats')} style={{ fontSize: 12, padding: '6px 16px', color: T.purple }}>📖 Compendio</button>}
        <button className="fw-btn fw-btn-outline" onClick={() => { setCareer(null); setCareerScreen('create'); go('career'); }} style={{ fontSize: 12, padding: '6px 16px', color: T.win }}>🏃 Carrera Jugador</button>
      </div>
      <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: '#333', marginTop: 8 }}>Rabona v3.1 · Base44</div>
    </div>
  );
}
