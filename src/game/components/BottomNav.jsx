import { T } from '@/game/data';
import { SFX } from '@/game/audio';
import { Haptics } from '@/game/haptics';
import useGameStore from '@/game/store';

// Screens that show the bottom nav (hub screens only, not during match/events)
const NAV_SCREENS = new Set(['table', 'roster', 'training', 'market', 'stats']);

const TABS = [
  { screen: 'table',    icon: '📋', label: 'Tabla' },
  { screen: 'roster',   icon: '👥', label: 'Roster' },
  { screen: 'training', icon: '💪', label: 'Entreno' },
  { screen: 'market',   icon: '🏪', label: 'Mercado' },
  { screen: 'stats',    icon: '📖', label: 'Legado' },
];

export default function BottomNav() {
  const { screen, go } = useGameStore();

  if (!NAV_SCREENS.has(screen)) return null;

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40,
      display: 'flex', alignItems: 'stretch',
      background: 'rgba(11,17,32,0.95)', backdropFilter: 'blur(8px)',
      borderTop: `1px solid ${T.border}`,
      paddingBottom: 'var(--sab, 0px)',
    }}>
      {TABS.map(tab => {
        const active = screen === tab.screen;
        return (
          <button
            key={tab.screen}
            onClick={() => {
              if (!active) {
                SFX.play('click');
                Haptics.light();
                go(tab.screen);
              }
            }}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 1,
              padding: '8px 4px', minHeight: 52,
              background: active ? 'rgba(255,255,255,0.04)' : 'transparent',
              border: 'none', borderTop: active ? `2px solid ${T.gold}` : '2px solid transparent',
              cursor: active ? 'default' : 'pointer',
              touchAction: 'manipulation',
              transition: 'background 0.15s ease',
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{tab.icon}</span>
            <span style={{
              fontFamily: "'Oswald'", fontWeight: active ? 700 : 400,
              fontSize: 9, color: active ? T.gold : T.tx3,
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
