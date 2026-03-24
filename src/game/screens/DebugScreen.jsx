import { useState } from 'react';
import { T, LEAGUES } from '@/game/data';
import { CAREER_TEAMS } from '@/game/data/career.js';
import useGameStore from '@/game/store';

const SCREENS = ['title','table','roster','training','market','stats','prematch','match','rewards','ascension','champion','death','map','boardEvent','coach'];
const CAREER_SCREENS = ['create','cards','match','seasonEnd','careerEnd'];
const POSITIONS = ['GK','DEF','MID','FWD'];

export default function DebugScreen() {
  const {
    game, hasSave, go, career, careerScreen,
    debugStartAtLeague, debugAddCoins, debugUnlockAllLegacy, debugMaxAscension,
    debugToggleAutoPlay, debugAutoPlay, debugStartCareer,
    debugExportState, debugImportState,
    setCareerScreen, setCareer,
  } = useGameStore();

  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState(null);
  const [exportText, setExportText] = useState('');
  const [careerAge, setCareerAge] = useState(16);
  const [careerTeam, setCareerTeam] = useState(0);

  const sectionStyle = { marginBottom: 16, padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 8 };
  const labelStyle = { fontFamily: T.fontPixel, fontSize: 12, color: T.gold, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 };
  const gridStyle = { display: 'flex', flexWrap: 'wrap', gap: 6 };
  const btnStyle = { fontSize: 11, padding: '6px 10px', color: T.tx1, cursor: 'pointer' };

  return (
    <div style={{ padding: '16px 12px', height: '100%', overflow: 'auto', background: '#0d1117', fontFamily: T.fontBody }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontFamily: T.fontPixel, fontSize: 18, color: '#ff4444', letterSpacing: 2 }}>DEBUG MENU</div>
        <button className="fw-btn fw-btn-outline" onClick={() => go('title')} style={{ fontSize: 11, padding: '4px 12px', color: T.tx2 }}>Volver</button>
      </div>

      {/* Auto-Play Toggle */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Auto-Play</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="fw-btn fw-btn-outline" onClick={debugToggleAutoPlay}
            style={{ ...btnStyle, color: debugAutoPlay ? '#00e676' : '#ff4444', border: `1px solid ${debugAutoPlay ? '#00e676' : '#ff4444'}` }}>
            {debugAutoPlay ? 'ON' : 'OFF'}
          </button>
          <span style={{ fontSize: 11, color: T.tx3 }}>
            Auto-responde decisiones en Carrera y partidos
          </span>
        </div>
      </div>

      {/* Career Quick Start */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Iniciar Carrera Rapida</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: T.tx3 }}>Edad:</span>
          <input type="number" min={16} max={35} value={careerAge} onChange={e => setCareerAge(+e.target.value)}
            style={{ width: 50, padding: '4px 6px', background: '#141e3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, color: '#fff', fontSize: 12 }} />
          <span style={{ fontSize: 10, color: T.tx3 }}>Equipo:</span>
          <select value={careerTeam} onChange={e => setCareerTeam(+e.target.value)}
            style={{ padding: '4px 6px', background: '#141e3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, color: '#fff', fontSize: 11 }}>
            {CAREER_TEAMS.map((t, i) => <option key={i} value={i}>{t}</option>)}
          </select>
        </div>
        <div style={gridStyle}>
          {POSITIONS.map(pos => (
            <button key={pos} className="fw-btn fw-btn-outline" onClick={() => debugStartCareer(pos, careerAge, careerTeam)}
              style={{ ...btnStyle, color: '#42a5f5', flex: '1 1 22%', textAlign: 'center' }}>
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Career Jump */}
      {career && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Carrera: Ir a Pantalla</div>
          <div style={{ fontSize: 10, color: T.tx3, marginBottom: 6 }}>
            {career.name} · {career.age}a · {CAREER_TEAMS[career.team]} · Screen: {careerScreen}
          </div>
          <div style={gridStyle}>
            {CAREER_SCREENS.map(s => (
              <button key={s} className="fw-btn fw-btn-outline"
                onClick={() => { setCareerScreen(s); go('career'); }}
                style={{ ...btnStyle, fontSize: 10, color: s === careerScreen ? '#f0c040' : T.tx2 }}>
                {s}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <button className="fw-btn fw-btn-outline" onClick={() => {
              setCareer(prev => prev ? { ...prev, bars: { rend: 50, fis: 50, rel: 50, fam: 50, men: 50 } } : prev);
            }} style={{ ...btnStyle, color: '#a78bfa', fontSize: 10 }}>Reset Bars a 50</button>
            <button className="fw-btn fw-btn-outline" onClick={() => {
              setCareer(prev => prev ? { ...prev, matchesThisSeason: 7 } : prev);
            }} style={{ ...btnStyle, color: '#ff9800', fontSize: 10, marginLeft: 6 }}>Forzar Fin Temporada</button>
            <button className="fw-btn fw-btn-outline" onClick={() => {
              setCareer(prev => prev ? { ...prev, bars: { ...prev.bars, fis: 5 } } : prev);
            }} style={{ ...btnStyle, color: '#ff1744', fontSize: 10, marginLeft: 6 }}>Fis a 5 (near death)</button>
          </div>
        </div>
      )}

      {/* Start at League */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Iniciar en Liga (Roguelike)</div>
        <div style={gridStyle}>
          {LEAGUES.map((lg, i) => (
            <button key={i} className="fw-btn fw-btn-outline" onClick={() => debugStartAtLeague(i)}
              style={{ ...btnStyle, flex: '1 1 45%', textAlign: 'left' }}>
              {lg.i} {lg.n} <span style={{ color: T.tx3, fontSize: 10 }}>(Lv {lg.lv[0]}-{lg.lv[1]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Acciones Rapidas</div>
        <div style={gridStyle}>
          <button className="fw-btn fw-btn-outline" onClick={() => debugAddCoins(500)} style={{ ...btnStyle, color: T.win }}>+500 Monedas</button>
          <button className="fw-btn fw-btn-outline" onClick={() => debugUnlockAllLegacy()} style={{ ...btnStyle, color: T.purple }}>Unlock Legado</button>
          <button className="fw-btn fw-btn-outline" onClick={() => debugMaxAscension()} style={{ ...btnStyle, color: T.gold }}>Max Ascension</button>
        </div>
      </div>

      {/* Jump to Screen */}
      {hasSave && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Ir a Pantalla (Roguelike)</div>
          <div style={gridStyle}>
            {SCREENS.map(s => (
              <button key={s} className="fw-btn fw-btn-outline" onClick={() => go(s)}
                style={{ fontSize: 10, padding: '4px 8px', color: T.tx2 }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* State Export/Import */}
      <div style={sectionStyle}>
        <div style={labelStyle}>State Snapshot</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <button className="fw-btn fw-btn-outline" onClick={() => {
            const json = debugExportState();
            setExportText(json);
            if (navigator.clipboard) navigator.clipboard.writeText(json).catch(() => {});
          }} style={{ ...btnStyle, color: '#42a5f5' }}>Exportar (copiar)</button>
        </div>
        {exportText && (
          <textarea readOnly value={exportText} style={{
            width: '100%', height: 60, background: '#141e3a', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4, color: '#7f8c9b', fontSize: 9, padding: 6, resize: 'vertical', fontFamily: 'monospace',
          }} />
        )}
        <div style={{ marginTop: 8 }}>
          <textarea placeholder="Pegar JSON aquí para importar..." value={importText}
            onChange={e => setImportText(e.target.value)}
            style={{
              width: '100%', height: 50, background: '#141e3a', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4, color: '#fff', fontSize: 10, padding: 6, resize: 'vertical', fontFamily: 'monospace',
            }} />
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <button className="fw-btn fw-btn-outline" onClick={() => {
              const ok = debugImportState(importText);
              setImportStatus(ok ? 'OK' : 'Error en JSON');
              if (ok) setImportText('');
            }} style={{ ...btnStyle, color: '#00e676' }}>Importar</button>
            {importStatus && <span style={{ fontSize: 10, color: importStatus === 'OK' ? '#00e676' : '#ff1744', alignSelf: 'center' }}>{importStatus}</span>}
          </div>
        </div>
      </div>

      {/* Current State Info */}
      {hasSave && game.coach && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Estado Roguelike</div>
          <div style={{ fontSize: 11, color: T.tx2, lineHeight: 1.8 }}>
            Liga: {LEAGUES[game.league]?.i} {LEAGUES[game.league]?.n || '?'} (idx {game.league})<br/>
            Jornada: {game.matchNum}<br/>
            Monedas: {game.coins}<br/>
            Roster: {game.roster?.length || 0} jugadores<br/>
            Coach: {game.coach?.n}
          </div>
        </div>
      )}

      {career && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Estado Carrera</div>
          <div style={{ fontSize: 11, color: T.tx2, lineHeight: 1.8 }}>
            {career.name} · {career.pos} · {career.age} años<br/>
            Equipo: {CAREER_TEAMS[career.team]} · Temp {career.season}<br/>
            Partidos: {career.totalMatches} · Goles: {career.goals}<br/>
            Bars: R{career.bars.rend} F{career.bars.fis} Re{career.bars.rel} Fa{career.bars.fam} M{career.bars.men}<br/>
            Cards en cola: {career.cardQueue?.length || 0} · Screen: {careerScreen}
          </div>
        </div>
      )}
    </div>
  );
}
