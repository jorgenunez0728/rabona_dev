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
    <div onClick={ensureMusic} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, textAlign: 'center', background: `radial-gradient(ellipse at 50% 20%, rgba(240,192,64,0.06) 0%, ${T.bg} 60%)`, position: 'relative', overflow: 'hidden' }}>
      <div className="fw-anim-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{
          fontFamily: T.fontTitle, fontWeight: 700,
          fontSize: 'clamp(32px,10vw,48px)', letterSpacing: 6,
          background: T.gradientPrimary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          textShadow: 'none', lineHeight: 1.1,
        }}>RABONA</div>
        <div style={{ fontFamily: T.fontBody, fontWeight: 400, fontSize: 'clamp(11px,2.5vw,14px)', color: T.tx2, letterSpacing: 3, textTransform: 'uppercase' }}>Del Barrio a las Estrellas</div>
      </div>
      <div className="fw-anim-2 divider-gold" style={{ width: 60 }} />
      <div className="fw-anim-3" style={{ fontFamily: T.fontBody, fontSize: 'clamp(11px,2.5vw,14px)', color: T.tx3, maxWidth: 300, lineHeight: 1.5, padding: '0 20px' }}>Arma tu equipo en una cancha llanera. Llévalo hasta conquistar la galaxia.</div>
      <div className="fw-anim-4" style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', marginTop: 4 }}>
        {hasSave && <button className="fw-btn fw-btn-green" onClick={() => { SFX.play('click'); go('table'); }}>Continuar Mi Club</button>}
        <button className={`fw-btn ${hasSave ? 'fw-btn-glass' : 'fw-btn-primary'}`} onClick={() => { if (hasSave && !confirm('¿Borrar partida guardada?')) return; handleDeleteSave(); go('tutorial'); }} style={hasSave ? { fontSize: 12, padding: '8px 20px' } : {}}>Mi Club</button>
      </div>
      <div className="fw-anim-5" style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {(globalStats.totalRuns || 0) > 0 && <button className="fw-btn fw-btn-glass" onClick={() => go('stats')} style={{ fontSize: 12, padding: '6px 16px' }}>Compendio</button>}
        <button className="fw-btn fw-btn-glass" onClick={() => { setCareer(null); setCareerScreen('create'); go('career'); }} style={{ fontSize: 12, padding: '6px 16px' }}>Mi Leyenda</button>
      </div>
      {/* Music controls */}
      {MUSIC_TRACKS.length > 0 && (
        <div className="fw-anim-5" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <button onClick={(e) => { e.stopPropagation(); Music.prev(); }} style={{ background: 'none', border: 'none', color: T.tx3, fontSize: 14, cursor: 'pointer', padding: '4px 6px' }}>⏮</button>
          <button onClick={(e) => { e.stopPropagation(); const on = Music.toggle(); setMusicEnabled(on); }} style={{ background: musicEnabled ? 'rgba(240,192,64,0.08)' : 'transparent', border: `1px solid ${musicEnabled ? T.gold + '40' : T.border}`, color: musicEnabled ? T.gold : T.tx3, fontSize: 12, cursor: 'pointer', padding: '4px 10px', borderRadius: 6, fontFamily: T.fontBody }}>{musicEnabled ? '♫ ON' : '♫ OFF'}</button>
          <button onClick={(e) => { e.stopPropagation(); Music.next(); }} style={{ background: 'none', border: 'none', color: T.tx3, fontSize: 14, cursor: 'pointer', padding: '4px 6px' }}>⏭</button>
        </div>
      )}
      {currentTrack && musicEnabled && (
        <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.tx3, opacity: 0.7 }}>
          {currentTrack.title}{currentTrack.artist ? ` — ${currentTrack.artist}` : ''}
        </div>
      )}
      <div onClick={(e) => { e.stopPropagation(); tapCount.current++; clearTimeout(tapTimer.current); tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 2000); if (tapCount.current >= 5) { setDebugVisible(true); tapCount.current = 0; } }} style={{ fontFamily: T.fontBody, fontSize: 11, color: debugVisible ? '#ff4444' : T.tx4, marginTop: 8, cursor: 'pointer', userSelect: 'none' }}>Rabona v3.1 · Base44</div>
      {debugVisible && <button className="fw-btn fw-btn-outline" onClick={(e) => { e.stopPropagation(); go('debug'); }} style={{ fontSize: 11, padding: '4px 14px', color: '#ff4444', borderColor: '#ff444440', marginTop: 4 }}>Debug Menu</button>}
    </div>
  );
}
