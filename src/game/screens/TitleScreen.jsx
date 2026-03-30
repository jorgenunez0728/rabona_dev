import { useState, useRef } from 'react';
import { SFX, Music, startAudio } from '@/game/audio';
import { T } from '@/game/data';
import MUSIC_TRACKS from '@/game/data/musicTracks';
import useGameStore from '@/game/store';

export default function TitleScreen() {
  const { hasSave, hasCareerSave, globalStats, go, handleDeleteSave, deleteCareerSave, setCareer, setCareerScreen, resumeCareer } = useGameStore();
  const [musicStarted, setMusicStarted] = useState(Music.isPlaying());
  const [musicEnabled, setMusicEnabled] = useState(Music._enabled);
  const [currentTrack, setCurrentTrack] = useState(Music.getCurrentTrack());
  const [debugVisible, setDebugVisible] = useState(false);
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  const ensureMusic = async () => {
    await startAudio();
    if (!Music._initialized && MUSIC_TRACKS.length > 0) {
      Music.init(MUSIC_TRACKS);
      Music.onTrackChange((t) => setCurrentTrack(t));
    }
    if (!Music.isPlaying() && Music._enabled && MUSIC_TRACKS.length > 0) {
      Music.play();
      setMusicStarted(true);
    }
  };

  return (
    <div onClick={ensureMusic} className="bg-stadium-ambient" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', gap: 16, textAlign: 'center',
      background: `radial-gradient(ellipse at 50% 15%, rgba(240,192,64,0.08) 0%, rgba(59,130,246,0.04) 30%, ${T.bg} 65%)`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle pitch lines behind */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 200, height: 200, borderRadius: '50%',
        border: `1px solid rgba(255,255,255,0.03)`, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 100, height: 100, borderRadius: '50%',
        border: `1px solid rgba(255,255,255,0.02)`, pointerEvents: 'none',
      }} />

      {/* Title */}
      <div className="fw-anim-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative', zIndex: 1 }}>
        <div style={{
          fontFamily: T.fontTitle, fontWeight: 700,
          fontSize: 'clamp(36px,12vw,56px)', letterSpacing: 8,
          background: 'linear-gradient(135deg, #F0C040, #FBBF24, #D4A017, #F0C040)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          textShadow: 'none', lineHeight: 1.1,
          filter: 'drop-shadow(0 2px 8px rgba(240,192,64,0.2))',
        }}>RABONA</div>
        <div style={{
          fontFamily: T.fontHeading, fontWeight: 500,
          fontSize: 'clamp(10px,2.2vw,13px)', color: T.tx3,
          letterSpacing: 4, textTransform: 'uppercase',
        }}>Del Barrio a las Estrellas</div>
      </div>

      <div className="fw-anim-2 divider-gold" style={{ width: 80 }} />

      {/* Mascot */}
      {globalStats.rufus && (
        <div className="fw-anim-2 fw-float" onClick={() => SFX.play('bark')} style={{ fontSize: 32, cursor: 'pointer', marginTop: 4, userSelect: 'none' }}>
          🐕{globalStats.rufus.equipped?.head ? ((() => { const a = (globalStats.rufus.inventory || []).includes(globalStats.rufus.equipped.head) ? globalStats.rufus.equipped.head : null; return a ? '' : ''; })()) : ''}
        </div>
      )}

      <div className="fw-anim-3" style={{
        fontFamily: T.fontBody, fontSize: 'clamp(11px,2.5vw,14px)', color: T.tx3,
        maxWidth: 280, lineHeight: 1.6, padding: '0 20px',
      }}>
        Arma tu equipo en una cancha llanera. Llévalo hasta conquistar la galaxia.
      </div>

      {/* ── Mi Club section ── */}
      <div className="fw-anim-4" style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', marginTop: 4, width: '100%', maxWidth: 280 }}>
        {hasSave ? (
          <>
            <button className="fw-btn fw-btn-primary fw-glow-pulse" onClick={() => { SFX.play('click'); go('table'); }} style={{
              width: '100%', fontSize: 16, padding: '16px 32px', borderRadius: T.r3,
              boxShadow: '0 4px 24px rgba(240,192,64,0.3)',
            }}>
              Continuar Mi Club
            </button>
            <button className="fw-btn fw-btn-glass" onClick={() => { if (!confirm('¿Borrar partida guardada?')) return; handleDeleteSave(); go('tutorial'); }} style={{ fontSize: 11, padding: '8px 20px' }}>
              Nueva Partida
            </button>
          </>
        ) : (
          <button className="fw-btn fw-btn-primary fw-glow-pulse" onClick={() => { handleDeleteSave(); go('tutorial'); }} style={{
            width: '100%', fontSize: 16, padding: '16px 32px', borderRadius: T.r3,
            boxShadow: '0 4px 24px rgba(240,192,64,0.3)',
          }}>
            Mi Club
          </button>
        )}
      </div>

      {/* ── Mi Leyenda section ── */}
      <div className="fw-anim-5" style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', marginTop: 2, width: '100%', maxWidth: 280 }}>
        {hasCareerSave && (
          <button className="fw-btn fw-btn-green" onClick={() => { SFX.play('click'); resumeCareer(); }} style={{ width: '100%', fontSize: 13, padding: '10px 20px', borderRadius: T.r2 }}>
            Continuar Mi Leyenda
          </button>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          {(globalStats.totalRuns || 0) > 0 && (
            <button className="fw-btn fw-btn-glass" onClick={() => go('stats')} style={{ fontSize: 11, padding: '6px 16px' }}>Compendio</button>
          )}
          <button className="fw-btn fw-btn-glass" onClick={() => { if (hasCareerSave && !confirm('Tienes una carrera en progreso. ¿Empezar una nueva?')) return; deleteCareerSave(); setCareer(null); setCareerScreen('create'); go('career'); }} style={{ fontSize: 11, padding: '6px 16px' }}>
            Mi Leyenda
          </button>
        </div>
      </div>

      {/* Music controls */}
      {MUSIC_TRACKS.length > 0 && (
        <div className="fw-anim-5" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, position: 'relative', zIndex: 1 }}>
          <button onClick={(e) => { e.stopPropagation(); Music.prev(); }} style={{ background: 'none', border: 'none', color: T.tx3, fontSize: 14, cursor: 'pointer', padding: '4px 6px' }}>⏮</button>
          <button onClick={(e) => { e.stopPropagation(); const on = Music.toggle(); setMusicEnabled(on); }} style={{
            background: musicEnabled ? 'rgba(240,192,64,0.08)' : 'transparent',
            border: `1px solid ${musicEnabled ? T.gold + '40' : T.border}`,
            color: musicEnabled ? T.gold : T.tx3, fontSize: 12, cursor: 'pointer',
            padding: '4px 10px', borderRadius: T.r1, fontFamily: T.fontBody,
            transition: `all ${T.transQuick}`,
          }}>{musicEnabled ? '♫ ON' : '♫ OFF'}</button>
          <button onClick={(e) => { e.stopPropagation(); Music.next(); }} style={{ background: 'none', border: 'none', color: T.tx3, fontSize: 14, cursor: 'pointer', padding: '4px 6px' }}>⏭</button>
        </div>
      )}
      {currentTrack && musicEnabled && (
        <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3, opacity: 0.6 }}>
          {currentTrack.title}{currentTrack.artist ? ` — ${currentTrack.artist}` : ''}
        </div>
      )}

      {/* Version + debug */}
      <div onClick={(e) => { e.stopPropagation(); tapCount.current++; clearTimeout(tapTimer.current); tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 2000); if (tapCount.current >= 5) { setDebugVisible(true); tapCount.current = 0; } }} style={{ fontFamily: T.fontBody, fontSize: 10, color: debugVisible ? '#ff4444' : T.tx4, marginTop: 8, cursor: 'pointer', userSelect: 'none', letterSpacing: 0.5 }}>
        Rabona v4.0 · Base44
      </div>
      {debugVisible && <button className="fw-btn fw-btn-outline" onClick={(e) => { e.stopPropagation(); go('debug'); }} style={{ fontSize: 11, padding: '4px 14px', color: '#ff4444', borderColor: '#ff444440', marginTop: 4 }}>Debug Menu</button>}
    </div>
  );
}
