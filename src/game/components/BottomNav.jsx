import { T } from '@/game/data';
import { SFX } from '@/game/audio';
import { Haptics } from '@/game/haptics';
import useGameStore from '@/game/store';

// Screens that show the bottom nav (hub screens only, not during match/events)
const NAV_SCREENS = new Set(['table', 'roster', 'training', 'market', 'stats', 'mascot']);

const TABS = [
  { screen: 'table',    label: 'Tabla',   icon: '⬡' },
  { screen: 'roster',   label: 'Roster',  icon: '◈' },
  { screen: 'training', label: 'Entreno', icon: '△' },
  { screen: 'market',   label: 'Mercado', icon: '◇' },
  { screen: 'mascot',   label: 'Rufus',   icon: '🐕' },
  { screen: 'stats',    label: 'Legado',  icon: '☆' },
];

export default function BottomNav() {
  const { screen, go } = useGameStore();

  if (!NAV_SCREENS.has(screen)) return null;

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40,
      display: 'flex', alignItems: 'stretch',
      background: 'rgba(8,12,20,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
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
              justifyContent: 'center', gap: 2, position: 'relative',
              padding: '10px 4px', minHeight: 56,
              background: active ? 'rgba(240,192,64,0.04)' : 'transparent',
              border: 'none', borderTop: active ? `3px solid ${T.gold}` : '3px solid transparent',
              cursor: active ? 'default' : 'pointer',
              touchAction: 'manipulation',
              transition: 'all 0.25s ease',
            }}
          >
            <span style={{
              fontSize: 16, lineHeight: 1,
              color: active ? T.gold : T.tx3,
              transition: 'color 0.25s ease',
            }}>{tab.icon}</span>
            <span style={{
              fontFamily: T.fontHeading, fontWeight: active ? 700 : 500,
              fontSize: 9, color: active ? T.gold : T.tx3,
              textTransform: 'uppercase', letterSpacing: 1,
              transition: 'color 0.25s ease',
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
