const isBrowser = typeof window !== 'undefined';
export const DEMO_STORAGE_KEY = 'neonvalley_demo_store_v2';
export const DEMO_ROLE_KEY = 'neonvalley_demo_role';

export const DEMO_ACCOUNTS = {
  user: {
    id: 'demo-user-001',
    full_name: 'Aviel Demo',
    email: 'demo-user@neonvalley.app',
    role: 'user',
    member_id: 'NV-1001-AD',
    qr_code_value: 'NV-1001-AD',
    redeemable_points: 12500,
    total_lifetime_points: 25000,
    membership_tier: 'Rhythm Rider',
    referral_code: 'a7k29z',
    referral_used: false,
    selected_theme: 'Midnight Eclipse',
    onboarding_completed: true,
  },
  staff: {
    id: 'demo-staff-001',
    full_name: 'Neon Staff',
    email: 'demo-staff@neonvalley.app',
    role: 'staff',
    staff_role: 'staff',
    member_id: 'NV-2001-NS',
    qr_code_value: 'NV-2001-NS',
    redeemable_points: 0,
    total_lifetime_points: 0,
    membership_tier: 'Neon Newbie',
    referral_code: 's7aff1',
    selected_theme: 'Cyber Noir',
    onboarding_completed: true,
  },
  admin: {
    id: 'demo-admin-001',
    full_name: 'Neon Admin',
    email: 'demo-admin@neonvalley.app',
    role: 'admin',
    staff_role: 'admin',
    member_id: 'NV-3001-NA',
    qr_code_value: 'NV-3001-NA',
    redeemable_points: 0,
    total_lifetime_points: 0,
    membership_tier: 'Neon Newbie',
    referral_code: 'adm1n1',
    selected_theme: 'Black Gold',
    onboarding_completed: true,
  },
};

export function isDemoMode() {
  if (!isBrowser) return import.meta.env.VITE_DEMO_MODE === 'true';
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('demo') === 'true';
  const explicitEnv = import.meta.env.VITE_DEMO_MODE === 'true';
  const devHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  const githubPreview = window.location.hostname.endsWith('github.io');
  return explicitEnv || ((devHost || githubPreview) && requested);
}

export function normalizeDemoRole(role) {
  return ['user', 'staff', 'admin'].includes(role) ? role : 'user';
}

export function getDemoRole() {
  if (!isBrowser) return 'user';
  const params = new URLSearchParams(window.location.search);
  const urlRole = normalizeDemoRole(params.get('role'));
  if (params.has('role')) {
    window.localStorage.setItem(DEMO_ROLE_KEY, urlRole);
    return urlRole;
  }
  return normalizeDemoRole(window.localStorage.getItem(DEMO_ROLE_KEY));
}

export function setDemoRole(role) {
  if (!isBrowser) return normalizeDemoRole(role);
  const nextRole = normalizeDemoRole(role);
  window.localStorage.setItem(DEMO_ROLE_KEY, nextRole);
  window.dispatchEvent(new CustomEvent('neonvalley-demo-change', { detail: { role: nextRole } }));
  return nextRole;
}

export function demoUser(role = getDemoRole()) {
  const account = DEMO_ACCOUNTS[normalizeDemoRole(role)] || DEMO_ACCOUNTS.user;
  return { ...account, email: account.email, created_date: '2026-01-01T00:00:00.000Z' };
}

export function demoProfile(overrides = {}, role = getDemoRole()) {
  const account = DEMO_ACCOUNTS[normalizeDemoRole(role)] || DEMO_ACCOUNTS.user;
  return {
    ...account,
    id: account.id.replace('user', 'profile').replace('staff', 'profile-staff').replace('admin', 'profile-admin'),
    user_email: account.email,
    points_balance: account.redeemable_points,
    total_points_earned: account.total_lifetime_points,
    neon_status: account.membership_tier + ' Member',
    visit_count: role === 'user' ? 7 : 0,
    referral_bonus_received: false,
    referral_bonus_given_count: role === 'user' ? 3 : 0,
    is_18_verified: true,
    is_demo: true,
    created_date: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function defaultDemoStore() {
  const userProfile = demoProfile({}, 'user');
  const staffProfile = demoProfile({}, 'staff');
  const adminProfile = demoProfile({}, 'admin');
  return {
    version: 2,
    profiles: [userProfile, staffProfile, adminProfile],
    events: [
      {
        id: 'demo-event-1', is_demo: true, title: 'Midnight Eclipse: Rooftop Sessions', event_title: 'Midnight Eclipse: Rooftop Sessions',
        date: '2026-07-18', time: '9:00 PM', location: 'Bay Area', venue: 'The Valencia Loft', theme: 'Midnight Eclipse',
        djs: 'DJ Solara, Mina V', description: 'A premium 18+ alcohol-free night with house, amapiano, and club edits.',
        image_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
        featured: true, status: 'published', free_rsvp_enabled: true, price: 10, ticket_price: 10, alcohol_free: true,
        event_start_time: '2026-07-18T21:00:00.000Z', created_date: '2026-06-01T00:00:00.000Z',
      },
      {
        id: 'demo-event-2', is_demo: true, title: 'Miami Sunset Social', event_title: 'Miami Sunset Social',
        date: '2026-08-01', time: '8:30 PM', location: 'Bay Area', venue: 'Mission Sound Room', theme: 'Miami Sunset',
        djs: 'Nia Rose, Coastline', description: 'Warm lights, tropical edits, and a social dance-floor energy.',
        image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        featured: false, status: 'published', free_rsvp_enabled: true, price: 12, ticket_price: 12, alcohol_free: true,
        event_start_time: '2026-08-01T20:30:00.000Z', created_date: '2026-06-02T00:00:00.000Z',
      },
    ],
    tickets: [
      { id: 'demo-ticket-1', is_demo: true, event_id: 'demo-event-1', event_name: 'Midnight Eclipse: Rooftop Sessions', user_email: 'demo-user@neonvalley.app', ticket_status: 'active', payment_status: 'paid', final_amount_paid: 10, points_awarded: 1000, ticket_barcode: 'NV-TICKET-DEMO001', event_start_time: '2026-07-18T21:00:00.000Z', created_date: '2026-06-01T00:00:00.000Z' },
    ],
    rsvps: [
      { id: 'demo-rsvp-1', is_demo: true, event_id: 'demo-event-1', event_title: 'Midnight Eclipse: Rooftop Sessions', user_email: 'demo-user@neonvalley.app', status: 'confirmed', created_date: '2026-06-01T00:00:00.000Z' },
    ],
    pointsTransactions: [
      { id: 'demo-txn-1', is_demo: true, user_email: 'demo-user@neonvalley.app', type: 'ticket_purchase', points: 1000, description: 'Earn 100 Party Points per $1 spent.', created_date: '2026-06-01T00:00:00.000Z' },
      { id: 'demo-txn-2', is_demo: true, user_email: 'demo-user@neonvalley.app', type: 'referral_bonus', points: 1000, description: 'Referral bonus from a7k29z', created_date: '2026-05-28T00:00:00.000Z' },
    ],
    rewardRedemptions: [
      { id: 'demo-reward-redemption-1', is_demo: true, user_email: 'demo-user@neonvalley.app', reward_name: '25% Discount', points_spent: 10000, status: 'active', barcode_value: 'NV-REWARD-DEMO001', redeemed_at: '2026-06-03T00:00:00.000Z', expires_at: '2026-07-03T00:00:00.000Z', created_date: '2026-06-03T00:00:00.000Z' },
    ],
    payments: [], promoCodes: [], checkIns: [], referrals: [], rewards: [],
  };
}

export function readDemoStore() {
  if (!isBrowser) return defaultDemoStore();
  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return resetDemoStore();
    const parsed = JSON.parse(raw);
    if (parsed.version !== 2) return resetDemoStore();
    return parsed;
  } catch {
    return resetDemoStore();
  }
}

export function writeDemoStore(store) {
  if (!isBrowser) return store;
  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent('neonvalley-demo-change', { detail: { store } }));
  return store;
}

export function resetDemoStore() {
  const fresh = defaultDemoStore();
  if (isBrowser) writeDemoStore(fresh);
  return fresh;
}

export function demoPath(path, role = getDemoRole()) {
  const url = new URL(path, isBrowser ? window.location.origin : 'https://example.com');
  url.searchParams.set('demo', 'true');
  url.searchParams.set('role', normalizeDemoRole(role));
  return url.pathname + url.search;
}
