const isBrowser = typeof window !== 'undefined';

export const DEMO_USER = {
  id: 'demo-user-aviel',
  full_name: 'Aviel Levsky',
  email: 'demo@neonvalley.app',
  role: 'user',
  created_date: '2026-01-01T00:00:00.000Z',
};

export const DEMO_PROFILE = {
  id: 'demo-profile-aviel',
  user_email: 'demo@neonvalley.app',
  full_name: 'Aviel Levsky',
  role: 'user',
  staff_role: 'none',
  redeemable_points: 12500,
  points_balance: 12500,
  total_lifetime_points: 25000,
  total_points_earned: 25000,
  membership_tier: 'Rhythm Rider',
  neon_status: 'Rhythm Rider Member',
  referral_code: 'a7k29z',
  selected_theme: 'Midnight Eclipse',
  onboarding_completed: true,
  visit_count: 7,
  referral_used: false,
  referral_bonus_received: false,
  referral_bonus_given_count: 3,
  member_id: 'NV-DEMO-AV',
  qr_code_value: 'NV-DEMO-AV',
  is_18_verified: true,
  created_date: '2026-01-01T00:00:00.000Z',
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

export function demoUser() {
  return { ...DEMO_USER };
}

export function demoProfile(overrides = {}) {
  return { ...DEMO_PROFILE, ...overrides };
}

export function demoPath(path) {
  return path + (path.includes('?') ? '&demo=true' : '?demo=true');
}
