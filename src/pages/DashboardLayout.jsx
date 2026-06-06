import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Gift, Megaphone, Bell,
  Users, CheckSquare, Share2, UserCog, Settings, Menu, X, ChevronRight, Zap, Ticket
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Overview', exact: true },
  { path: '/dashboard/events', icon: Calendar, label: 'Events' },
  { path: '/dashboard/rewards', icon: Gift, label: 'Rewards' },
  { path: '/dashboard/announcements', icon: Megaphone, label: 'Announcements' },
  { path: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
  { path: '/dashboard/users', icon: Users, label: 'Users' },
  { path: '/dashboard/rsvps', icon: Ticket, label: 'RSVPs' },
  { path: '/dashboard/checkins', icon: CheckSquare, label: 'Check-Ins' },
  { path: '/dashboard/referrals', icon: Share2, label: 'Referrals' },
  { path: '/dashboard/staff', icon: UserCog, label: 'Staff' },
  { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({ user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (item) => item.exact
    ? location.pathname === item.path
    : location.pathname.startsWith(item.path) && item.path !== '/dashboard';

  const NavLink = ({ item, onClick }) => {
    const Icon = item.icon;
    const active = item.exact
      ? location.pathname === item.path
      : location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium"
        style={{
          background: active ? 'rgba(57,255,20,0.1)' : 'transparent',
          color: active ? '#39FF14' : 'rgba(255,255,255,0.5)',
          border: active ? '1px solid rgba(57,255,20,0.2)' : '1px solid transparent',
        }}
      >
        <Icon size={16} />
        {item.label}
        {active && <ChevronRight size={12} className="ml-auto" />}
      </Link>
    );
  };

  const Sidebar = ({ onClose }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b" style={{ borderColor: ' rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: ' rgba(57,255,20,0.15)', border: '1px solid  rgba(57,255,20,0.3)' }}>
            <Zap size={16} style={{ color: ' #39FF14' }} fill=" #39FF14" />
          </div>
          <div>
            <p className="font-space font-black text-white text-sm tracking-wide">NeonValley</p>
            <p className="text-[10px] font-inter" style={{ color: ' rgba(57,255,20,0.6)' }}>Staff Dashboard</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink key={item.path} item={item} onClick={onClose} />
        ))}
      </nav>

      {/* Staff info */}
      <div className="px-4 py-4 border-t" style={{ borderColor: ' rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-space font-black"
            style={{ background: ' rgba(191,0,255,0.2)', color: ' #BF00FF', border: '1px solid  rgba(191,0,255,0.3)' }}>
            {(user?.full_name || user?.email || 'S').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-space font-semibold text-white truncate">{user?.full_name || 'Staff'}</p>
            <p className="text-[10px] font-inter truncate" style={{ color: ' rgba(191,0,255,0.7)' }}>{user?.role || 'admin'}</p>
          </div>
        </div>
        <Link to="/" className="mt-3 block text-center text-[10px] font-inter py-1.5 rounded-lg transition-all"
          style={{ background: ' rgba(255,255,255,0.04)', color: ' rgba(255,255,255,0.3)', border: '1px solid  rgba(255,255,255,0.06)' }}>
          ← Back to App
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen font-inter overflow-hidden" style={{ background: ' #0A0A0A' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 border-r" style={{ background: ' #0D0D0D', borderColor: ' rgba(255,255,255,0.06)' }}>
        <Sidebar onClose={() => {}} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 flex flex-col border-r z-10" style={{ background: ' #0D0D0D', borderColor: ' rgba(255,255,255,0.06)' }}>
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg"
              style={{ background: ' rgba(255,255,255,0.07)' }}>
              <X size={13} color="white" />
            </button>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-5 py-3.5 border-b flex-shrink-0" style={{ background: ' #0D0D0D', borderColor: ' rgba(255,255,255,0.06)' }}>
          <button className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg"
            style={{ background: ' rgba(255,255,255,0.07)' }}
            onClick={() => setSidebarOpen(true)}>
            <Menu size={15} color="white" />
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-space font-bold text-white">
              {navItems.find(i => i.exact ? location.pathname === i.path : location.pathname === i.path)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: ' rgba(57,255,20,0.08)', border: '1px solid  rgba(57,255,20,0.2)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: ' #39FF14', boxShadow: '0 0 6px  #39FF14' }} />
            <span className="text-[11px] font-space font-semibold" style={{ color: ' #39FF14' }}>Live</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
