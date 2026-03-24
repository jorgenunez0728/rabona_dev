import { useState, useRef } from 'react';
import { SFX, Music, startAudio } from '@/game/audio';
import { T } from '@/game/data';
import MUSIC_TRACKS from '@/game/data/musicTracks';
import useGameStore from '@/game/store';

export default function TitleScreen() {
  const { hasSave, globalStats, go, handleDeleteSave, setCareer, setCareerScreen } = useGameStore();
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
    <div onClick={ensureMusic} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14, textAlign: 'center', background: 'radial-gradient(ellipse at 50% 70%,#15250e 0%,#0b1120 70%)', position: 'relative', overflow: 'hidden' }}>
      <div className="fw-anim-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ fontFamily: T.fontPixel, fontWeight: 700, fontSize: 'clamp(28px,10vw,56px)', color: T.gold, letterSpacing: 4, textShadow: `0 0 40px ${T.gold}40, 0 2px 0 #b8860b` }}>RABONA</div>
        <div style={{ fontFamily: T.fontPixel, fontWeight: 400, fontSize: 'clamp(10px,2.5vw,14px)', color: '#c8a84e', letterSpacing: 3, textTransform: 'uppercase' }}>Del Barrio a las Estrellas</div>
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
      {/* Music controls */}
      {MUSIC_TRACKS.length > 0 && (
        <div className="fw-anim-5" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <button onClick={(e) => { e.stopPropagation(); Music.prev(); }} style={{ background: 'none', border: 'none', color: T.tx3, fontSize: 14, cursor: 'pointer', padding: '4px 6px' }}>⏮</button>
          <button onClick={(e) => { e.stopPropagation(); const on = Music.toggle(); setMusicEnabled(on); }} style={{ background: 'none', border: `1px solid ${musicEnabled ? T.gold + '40' : 'rgba(255,255,255,0.1)'}`, color: musicEnabled ? T.gold : T.tx3, fontSize: 12, cursor: 'pointer', padding: '4px 10px', borderRadius: 4, fontFamily: T.fontBody }}>{musicEnabled ? '♫ ON' : '♫ OFF'}</button>
          <button onClick={(e) => { e.stopPropagation(); Music.next(); }} style={{ background: 'none', border: 'none', color: T.tx3, fontSize: 14, cursor: 'pointer', padding: '4px 6px' }}>⏭</button>
        </div>
      )}
      {currentTrack && musicEnabled && (
        <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3, opacity: 0.7 }}>
          {currentTrack.title}{currentTrack.artist ? ` — ${currentTrack.artist}` : ''}
        </div>
      )}
      <div onClick={(e) => { e.stopPropagation(); tapCount.current++; clearTimeout(tapTimer.current); tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 2000); if (tapCount.current >= 5) { setDebugVisible(true); tapCount.current = 0; } }} style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: debugVisible ? '#ff4444' : '#444', marginTop: 8, cursor: 'pointer', userSelect: 'none' }}>Rabona v3.1 · Base44</div>
      {debugVisible && <button className="fw-btn fw-btn-outline" onClick={(e) => { e.stopPropagation(); go('debug'); }} style={{ fontSize: 11, padding: '4px 14px', color: '#ff4444', borderColor: '#ff444440', marginTop: 4 }}>🐛 Debug Menu</button>}
    </div>
  );
}
