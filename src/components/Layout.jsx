import { Link, useLocation, Outlet } from 'react-router-dom';
import { Home, Calendar, Ticket, Gift, User } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getTheme } from '@/lib/theme';

const tabs = [
  { path: '/', icon: Home, label: 'Home', exact: true },
  { path: '/events', icon: Calendar, label: 'Events' },
  { path: '/my-tickets', icon: Ticket, label: 'Tickets' },
  { path: '/rewards', icon: Gift, label: 'Rewards' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Layout() {
  const location = useLocation();
  const { profile } = useUserProfile();
  const theme = getTheme(profile?.selected_theme);

  const isActive = (tab) => tab.exact
    ? location.pathname === tab.path
    : location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');

  return (
    <div
      className="app-shell-bg min-h-screen max-w-md mx-auto relative overflow-x-hidden"
      style={{
        '--theme-primary': theme.primary,
        '--theme-gradient': theme.gradient,
        '--theme-glow': theme.glow,
        '--theme-bg-glow': theme.bgGlow,
      }}
    >
      <div className="club-vignette" />
      <main className="relative z-10 min-h-screen pb-28">
        <Outlet />
      </main>

      <nav className="bottom-nav-shell" aria-label="Primary navigation">
        <div className="flex items-center justify-between gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={'bottom-nav-item ' + (active ? 'bottom-nav-item-active' : '')}
                style={active ? { '--theme-primary': theme.primary } : undefined}
              >
                <Icon size={20} strokeWidth={active ? 2.3 : 1.8} />
                <span className="text-[10px] font-semibold">{tab.label}</span>
                <span
                  className="h-0.5 w-4 rounded-full"
                  style={{ background: active ? theme.primary : 'transparent' }}
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
