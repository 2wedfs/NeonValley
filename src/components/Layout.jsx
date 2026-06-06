import { Link, useLocation, Outlet } from 'react-router-dom';
import { Home, Calendar, Ticket, Gift, User } from 'lucide-react';

const tabs = [
  { path: '/',        icon: Home,     label: 'Home' },
  { path: '/events',  icon: Calendar, label: 'Events' },
  { path: '/scan',    icon: Ticket,   label: 'Pass',  hero: true },
  { path: '/rewards', icon: Gift,     label: 'Rewards' },
  { path: '/profile', icon: User,     label: 'Profile' },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative" style={{ background: '#08080C' }}>
      <main className="flex-1 overflow-y-auto pb-28">
        <Outlet />
      </main>

      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50"
        style={{
          background: 'rgba(8, 8, 12, 0.88)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(36px)',
          WebkitBackdropFilter: 'blur(36px)',
          boxShadow: '0 -1px 0 rgba(255,255,255,0.04), 0 -20px 60px rgba(0,0,0,0.7)',
        }}>

        <div className="flex items-end justify-around px-2 pt-3 pb-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;

            if (tab.hero) {
              return (
                <Link key={tab.path} to={tab.path} className="flex flex-col items-center -mt-7">
                  <div
                    className="w-[54px] h-[54px] rounded-full flex items-center justify-center transition-all duration-200"
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg,  #8A2BE2,  #FF2DAA)'
                        : ' rgba(255,255,255,0.10)',
                      border: isActive
                        ? '1.5px solid  rgba(138,43,226,0.7)'
                        : '1.5px solid  rgba(255,255,255,0.14)',
                      boxShadow: isActive
                        ? '0 0 24px  rgba(138,43,226,0.5), 0 8px 30px  rgba(0,0,0,0.5)'
                        : '0 4px 20px  rgba(0,0,0,0.4)',
                    }}>
                    <Icon size={22} color=" #fff" strokeWidth={2} />
                  </div>
                  <span
                    className="text-[10px] mt-1.5 font-space font-semibold tracking-wide"
                    style={{ color: isActive ? ' rgba(255,255,255,0.9)' : ' rgba(255,255,255,0.3)' }}>
                    {tab.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link key={tab.path} to={tab.path}
                className="flex flex-col items-center gap-1 py-0.5 px-3 min-w-[52px]">
                <Icon
                  size={21}
                  color={isActive ? ' #fff' : ' rgba(255,255,255,0.28)'}
                  strokeWidth={isActive ? 2.2 : 1.6}
                />
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-white opacity-80 -mt-0.5" />
                )}
                {!isActive && <div className="w-1 h-1 opacity-0" />}
                <span
                  className="text-[10px] font-space font-medium tracking-wide"
                  style={{ color: isActive ? ' rgba(255,255,255,0.9)' : ' rgba(255,255,255,0.28)' }}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
