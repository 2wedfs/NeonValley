import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, User, ShieldCheck, Crown, Plus, RotateCcw, Ticket, Gift, ScanLine, Zap } from 'lucide-react';
import { isDemoMode, getDemoRole, setDemoRole, demoPath, resetDemoStore, readDemoStore, writeDemoStore } from '@/lib/demoMode';
import { getMembershipTier } from '@/lib/theme';

function futureDate() {
  const date = new Date();
  date.setDate(date.getDate() + 21);
  return date.toISOString().slice(0, 10);
}

function updateDemoUser(mutator) {
  const store = readDemoStore();
  const index = store.profiles.findIndex(p => p.user_email === 'demo-user@neonvalley.app');
  if (index >= 0) store.profiles[index] = mutator(store.profiles[index]);
  writeDemoStore(store);
  return store;
}

export default function DevTestingPanel() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(getDemoRole());
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState('');

  if (!isDemoMode()) return null;

  function go(path, nextRole = role) {
    navigate(demoPath(path, nextRole));
  }

  function switchRole(nextRole) {
    setDemoRole(nextRole);
    setRole(nextRole);
    setMessage('Viewing as ' + nextRole);
    const target = nextRole === 'staff' ? '/staff' : nextRole === 'admin' ? '/dashboard' : '/home';
    go(target, nextRole);
  }

  function addTestEvent() {
    const store = readDemoStore();
    const id = 'demo-event-test-' + Date.now();
    store.events.unshift({
      id,
      is_demo: true,
      title: 'NeonValley Test Drop',
      event_title: 'NeonValley Test Drop',
      date: futureDate(),
      time: '9:00 PM',
      location: 'Bay Area',
      venue: 'Bay Area',
      price: 10,
      ticket_price: 10,
      status: 'published',
      alcohol_free: true,
      free_rsvp_enabled: true,
      featured: true,
      theme: 'Midnight Eclipse',
      description: 'Demo event created from the NeonValley Test Console.',
      image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      event_start_time: new Date(futureDate() + 'T21:00:00').toISOString(),
      created_date: new Date().toISOString(),
    });
    writeDemoStore(store);
    setMessage('Added NeonValley Test Drop');
  }

  function givePoints() {
    updateDemoUser(profile => {
      const redeemable = (profile.redeemable_points || 0) + 10000;
      const lifetime = (profile.total_lifetime_points || 0) + 10000;
      return { ...profile, redeemable_points: redeemable, points_balance: redeemable, total_lifetime_points: lifetime, total_points_earned: lifetime, membership_tier: getMembershipTier(lifetime) };
    });
    const store = readDemoStore();
    store.pointsTransactions.unshift({ id: 'demo-txn-' + Date.now(), is_demo: true, user_email: 'demo-user@neonvalley.app', type: 'admin_adjustment', points: 10000, description: 'Dev console grant: 10,000 points', created_date: new Date().toISOString() });
    writeDemoStore(store);
    setMessage('Added 10,000 user points');
  }

  function createTicket() {
    const store = readDemoStore();
    store.tickets.unshift({ id: 'demo-ticket-created-' + Date.now(), is_demo: true, event_id: 'demo-event-1', event_name: 'NeonValley Test Drop', user_email: 'demo-user@neonvalley.app', ticket_status: 'active', payment_status: 'paid', final_amount_paid: 10, points_awarded: 1000, ticket_barcode: 'NV-TICKET-DEMO001', created_date: new Date().toISOString() });
    writeDemoStore(store);
    setMessage('Created demo ticket');
  }

  function createReward() {
    const store = readDemoStore();
    store.rewardRedemptions.unshift({ id: 'demo-reward-created-' + Date.now(), is_demo: true, user_email: 'demo-user@neonvalley.app', reward_name: '25% Discount', points_spent: 10000, status: 'active', barcode_value: 'NV-REWARD-DEMO001', redeemed_at: new Date().toISOString(), expires_at: new Date(Date.now() + 30 * 86400000).toISOString(), created_date: new Date().toISOString() });
    writeDemoStore(store);
    setMessage('Created demo reward');
  }

  function simulateStaffScan() {
    const raw = window.prompt('Amount paid for NV-1001-AD?', '10');
    if (raw == null) return;
    const amount = Number(raw || 0);
    const points = Math.floor(amount) * 100;
    updateDemoUser(profile => {
      const redeemable = (profile.redeemable_points || 0) + points;
      const lifetime = (profile.total_lifetime_points || 0) + points;
      return { ...profile, redeemable_points: redeemable, points_balance: redeemable, total_lifetime_points: lifetime, total_points_earned: lifetime, membership_tier: getMembershipTier(lifetime), visit_count: (profile.visit_count || 0) + 1 };
    });
    const store = readDemoStore();
    store.checkIns.unshift({ id: 'demo-checkin-' + Date.now(), is_demo: true, user_email: 'demo-user@neonvalley.app', user_name: 'Aviel Demo', member_id: 'NV-1001-AD', amount_paid: amount, points_earned: points, entry_type: 'member_pass', check_in_time: new Date().toISOString(), created_date: new Date().toISOString() });
    store.pointsTransactions.unshift({ id: 'demo-txn-scan-' + Date.now(), is_demo: true, user_email: 'demo-user@neonvalley.app', type: 'check_in', points, description: 'Staff scan: $' + amount + ' paid', created_date: new Date().toISOString() });
    writeDemoStore(store);
    setMessage('Simulated scan: +' + points + ' points');
  }

  function doReset() {
    resetDemoStore();
    setConfirmReset(false);
    setMessage('Demo data reset');
  }

  const roleButtons = [
    ['user', User, 'View as User'],
    ['staff', ShieldCheck, 'View as Staff'],
    ['admin', Crown, 'View as Admin'],
  ];
  const pages = [
    ['Home', '/home'], ['Events', '/events'], ['Tickets', '/tickets'], ['Rewards', '/rewards'], ['Referrals', '/referrals'], ['Profile', '/profile'], ['Staff Scanner', '/staff'], ['Admin Dashboard', '/dashboard'],
  ];

  return (
    <div className="fixed bottom-24 right-4 z-[90] font-inter md:bottom-5">
      {!open && (
        <button onClick={() => setOpen(true)} className="rounded-full px-4 py-3 text-sm font-bold text-white shadow-2xl" style={{ background: 'linear-gradient(135deg,#3A0CA3,#9D4EDD,#F72585)' }}>
          Dev Mode
        </button>
      )}
      {open && (
        <div className="w-[min(92vw,360px)] rounded-3xl border border-white/15 bg-black/85 p-4 text-white shadow-2xl backdrop-blur-2xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/45">NeonValley Test Console</p>
              <p className="text-sm text-white/70">Current: {role.charAt(0).toUpperCase() + role.slice(1)}</p>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full bg-white/10 px-3 py-1 text-xs">Close</button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {roleButtons.map(([value, Icon, label]) => (
              <button key={value} onClick={() => switchRole(value)} className="rounded-2xl border p-2 text-[11px] font-bold" style={{ borderColor: role === value ? '#9D4EDD' : 'rgba(255,255,255,.12)', background: role === value ? 'rgba(157,78,221,.18)' : 'rgba(255,255,255,.06)' }}>
                <Icon size={16} className="mx-auto mb-1" /> {label.replace('View as ', '')}
              </button>
            ))}
          </div>

          <p className="mt-4 mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white/45">Quick Pages</p>
          <div className="grid grid-cols-2 gap-2">
            {pages.map(([label, path]) => <button key={path} onClick={() => go(path)} className="rounded-xl bg-white/[0.07] px-3 py-2 text-xs text-white/80">{label}</button>)}
          </div>

          <p className="mt-4 mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white/45">Quick Test Actions</p>
          <div className="grid grid-cols-1 gap-2">
            <button onClick={addTestEvent} className="rounded-xl bg-white/[0.07] px-3 py-2 text-left text-xs"><Plus size={13} className="mr-2 inline" />Add Test Event</button>
            <button onClick={givePoints} className="rounded-xl bg-white/[0.07] px-3 py-2 text-left text-xs"><Zap size={13} className="mr-2 inline" />Give User 10,000 Points</button>
            <button onClick={createTicket} className="rounded-xl bg-white/[0.07] px-3 py-2 text-left text-xs"><Ticket size={13} className="mr-2 inline" />Create Test Ticket</button>
            <button onClick={createReward} className="rounded-xl bg-white/[0.07] px-3 py-2 text-left text-xs"><Gift size={13} className="mr-2 inline" />Create Test Reward</button>
            <button onClick={simulateStaffScan} className="rounded-xl bg-white/[0.07] px-3 py-2 text-left text-xs"><ScanLine size={13} className="mr-2 inline" />Simulate Staff Scan</button>
          </div>

          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-3">
            {!confirmReset ? (
              <button onClick={() => setConfirmReset(true)} className="text-xs font-bold text-red-200"><RotateCcw size={13} className="mr-2 inline" />Reset Demo Data</button>
            ) : (
              <div>
                <p className="mb-2 text-xs text-red-100">Reset demo data? This will only affect test data.</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmReset(false)} className="rounded-lg bg-white/10 px-3 py-1 text-xs">Cancel</button>
                  <button onClick={doReset} className="rounded-lg bg-red-400 px-3 py-1 text-xs font-bold text-black">Reset Demo Data</button>
                </div>
              </div>
            )}
          </div>
          {message && <p className="mt-3 text-xs text-white/55">{message}</p>}
        </div>
      )}
    </div>
  );
}
