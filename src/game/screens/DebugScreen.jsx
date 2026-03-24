import { T, LEAGUES } from '@/game/data';
import useGameStore from '@/game/store';

const SCREENS = ['title','table','roster','training','market','stats','prematch','match','rewards','ascension','champion','death','map','boardEvent','coach'];

export default function DebugScreen() {
  const { game, hasSave, go, debugStartAtLeague, debugAddCoins, debugUnlockAllLegacy, debugMaxAscension } = useGameStore();

  const sectionStyle = { marginBottom: 16, padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 8 };
  const labelStyle = { fontFamily: T.fontPixel, fontSize: 12, color: T.gold, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 };
  const gridStyle = { display: 'flex', flexWrap: 'wrap', gap: 6 };

  return (
    <div style={{ padding: '16px 12px', height: '100%', overflow: 'auto', background: '#0d1117', fontFamily: T.fontBody }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontFamily: T.fontPixel, fontSize: 18, color: '#ff4444', letterSpacing: 2 }}>DEBUG MENU</div>
        <button className="fw-btn fw-btn-outline" onClick={() => go('title')} style={{ fontSize: 11, padding: '4px 12px', color: T.tx2 }}>Volver</button>
      </div>

      {/* Start at League */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Iniciar en Liga</div>
        <div style={gridStyle}>
          {LEAGUES.map((lg, i) => (
            <button key={i} className="fw-btn fw-btn-outline" onClick={() => debugStartAtLeague(i)}
              style={{ fontSize: 11, padding: '6px 10px', color: T.tx1, flex: '1 1 45%', textAlign: 'left' }}>
              {lg.i} {lg.n} <span style={{ color: T.tx3, fontSize: 10 }}>(Lv {lg.lv[0]}-{lg.lv[1]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Acciones Rapidas</div>
        <div style={gridStyle}>
          <button className="fw-btn fw-btn-outline" onClick={() => debugAddCoins(500)} style={{ fontSize: 11, padding: '6px 10px', color: T.win }}>+500 Monedas</button>
          <button className="fw-btn fw-btn-outline" onClick={() => debugUnlockAllLegacy()} style={{ fontSize: 11, padding: '6px 10px', color: T.purple }}>Unlock Legado</button>
          <button className="fw-btn fw-btn-outline" onClick={() => debugMaxAscension()} style={{ fontSize: 11, padding: '6px 10px', color: T.gold }}>Max Ascension</button>
        </div>
      </div>

      {/* Jump to Screen */}
      {hasSave && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Ir a Pantalla</div>
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

      {/* Current State Info */}
      {hasSave && game.coach && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Estado Actual</div>
          <div style={{ fontSize: 11, color: T.tx2, lineHeight: 1.8 }}>
            Liga: {LEAGUES[game.league]?.i} {LEAGUES[game.league]?.n || '?'} (idx {game.league})<br/>
            Jornada: {game.matchNum}<br/>
            Monedas: {game.coins}<br/>
            Roster: {game.roster?.length || 0} jugadores<br/>
            Coach: {game.coach?.n}
          </div>
        </div>
      )}
    </div>
  );
}
