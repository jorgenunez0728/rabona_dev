import { T } from '@/game/data';
import { SFX } from '@/game/audio';
import { Haptics } from '@/game/haptics';
import useGameStore from '@/game/store';
import { Trophy, Users, Dumbbell, ShoppingBag, Dog, Star } from 'lucide-react';

// Screens that show the bottom nav (hub screens only, not during match/events)
const NAV_SCREENS = new Set(['table', 'roster', 'training', 'market', 'stats', 'mascot']);

const TABS = [
  { screen: 'table',    label: 'Tabla',   Icon: Trophy },
  { screen: 'roster',   label: 'Roster',  Icon: Users },
  { screen: 'training', label: 'Entreno', Icon: Dumbbell },
  { screen: 'market',   label: 'Mercado', Icon: ShoppingBag },
  { screen: 'mascot',   label: 'Rufus',   Icon: Dog },
  { screen: 'stats',    label: 'Legado',  Icon: Star },
];

export default function BottomNav() {
  const { screen, go } = useGameStore();

  if (!NAV_SCREENS.has(screen)) return null;

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: T.zNav,
      display: 'flex', alignItems: 'stretch',
      background: 'rgba(8,12,20,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      paddingBottom: 'var(--sab, 0px)',
    }}>
      {TABS.map(tab => {
        const active = screen === tab.screen;
        const Icon = tab.Icon;
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
              justifyContent: 'center', gap: 3, position: 'relative',
              padding: '8px 4px', minHeight: 56,
              background: active ? 'rgba(240,192,64,0.06)' : 'transparent',
              border: 'none',
              cursor: active ? 'default' : 'pointer',
              touchAction: 'manipulation',
              transition: `all ${T.transBase}`,
            }}
          >
            {/* Active glow dot indicator */}
            {active && (
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: 24, height: 3, borderRadius: 2,
                background: T.gradientPrimary,
                boxShadow: '0 2px 8px rgba(240,192,64,0.3)',
              }} />
            )}
            <Icon
              size={20}
              strokeWidth={active ? 2.5 : 1.8}
              color={active ? T.gold : T.tx3}
              fill={active ? 'rgba(240,192,64,0.15)' : 'none'}
              style={{ transition: `all ${T.transBase}` }}
            />
            <span style={{
              fontFamily: T.fontHeading, fontWeight: active ? 700 : 500,
              fontSize: 9, color: active ? T.gold : T.tx3,
              textTransform: 'uppercase', letterSpacing: 1,
              transition: `color ${T.transBase}`,
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
