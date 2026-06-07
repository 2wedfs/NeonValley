import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { isDemoMode, demoUser, demoProfile } from '@/lib/demoMode';

const { appId, token, functionsVersion, appBaseUrl } = appParams;
const isGitHubPagesPreview = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');

const realClient = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: !isGitHubPagesPreview && !isDemoMode(),
  appBaseUrl
});

const demoEvents = [
  {
    id: 'demo-event-1',
    title: 'Midnight Eclipse: Rooftop Sessions',
    event_title: 'Midnight Eclipse: Rooftop Sessions',
    date: '2026-07-18',
    time: '9:00 PM',
    venue: 'The Valencia Loft',
    location: 'San Francisco, CA',
    theme: 'Midnight Eclipse',
    djs: 'DJ Solara, Mina V',
    description: 'A premium 18+ alcohol-free night with house, amapiano, and club edits.',
    image_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    status: 'published',
    free_rsvp_enabled: true,
    ticket_price: 10,
    event_start_time: '2026-07-18T21:00:00.000Z',
  },
  {
    id: 'demo-event-2',
    title: 'Miami Sunset Social',
    event_title: 'Miami Sunset Social',
    date: '2026-08-01',
    time: '8:30 PM',
    venue: 'Mission Sound Room',
    location: 'San Francisco, CA',
    theme: 'Miami Sunset',
    djs: 'Nia Rose, Coastline',
    description: 'Warm lights, tropical edits, and a social dance-floor energy.',
    image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    status: 'published',
    free_rsvp_enabled: true,
    ticket_price: 12,
    event_start_time: '2026-08-01T20:30:00.000Z',
  },
];

const demoTickets = [
  {
    id: 'demo-ticket-1',
    event_id: 'demo-event-1',
    event_name: 'Midnight Eclipse: Rooftop Sessions',
    user_email: 'demo@neonvalley.app',
    ticket_status: 'active',
    payment_status: 'paid',
    final_amount_paid: 10,
    points_awarded: 1000,
    ticket_barcode: 'NV-DEMO-TICKET-001',
    event_start_time: '2026-07-18T21:00:00.000Z',
    created_date: '2026-06-01T00:00:00.000Z',
  },
];

const demoRsvps = [
  {
    id: 'demo-rsvp-1',
    event_id: 'demo-event-1',
    event_title: 'Midnight Eclipse: Rooftop Sessions',
    user_email: 'demo@neonvalley.app',
    status: 'confirmed',
    created_date: '2026-06-01T00:00:00.000Z',
  },
];

const demoTransactions = [
  { id: 'demo-txn-1', user_email: 'demo@neonvalley.app', type: 'ticket_purchase', points: 1000, description: 'Earn 100 Party Points per $1 spent.', created_date: '2026-06-01T00:00:00.000Z' },
  { id: 'demo-txn-2', user_email: 'demo@neonvalley.app', type: 'referral_bonus', points: 1000, description: 'Referral bonus from a7k29z', created_date: '2026-05-28T00:00:00.000Z' },
];

const demoRedemptions = [];

function entityList(name) {
  const data = {
    Event: demoEvents,
    Ticket: demoTickets,
    RSVP: demoRsvps,
    UserProfile: [demoProfile()],
    PointsTransaction: demoTransactions,
    RewardRedemption: demoRedemptions,
  };
  return data[name] || [];
}

function matchesFilter(item, filter = {}) {
  return Object.entries(filter || {}).every(([key, value]) => item[key] === value);
}

function demoEntity(name) {
  return {
    async list() {
      return entityList(name);
    },
    async filter(filter = {}) {
      return entityList(name).filter(item => matchesFilter(item, filter));
    },
    async create(payload = {}) {
      const created = { id: 'demo-' + name.toLowerCase() + '-' + Date.now(), created_date: new Date().toISOString(), ...payload };
      entityList(name).unshift(created);
      return created;
    },
    async update(id, payload = {}) {
      const list = entityList(name);
      const index = list.findIndex(item => item.id === id);
      if (index >= 0) {
        list[index] = { ...list[index], ...payload };
        return list[index];
      }
      return { id, ...payload };
    },
    async delete(id) {
      const list = entityList(name);
      const index = list.findIndex(item => item.id === id);
      if (index >= 0) list.splice(index, 1);
      return { id, deleted: true };
    },
  };
}

function demoClient() {
  return {
    auth: {
      async me() { return demoUser(); },
      async isAuthenticated() { return true; },
      async loginViaEmailPassword() { return demoUser(); },
      async loginWithProvider() { return demoUser(); },
      async resetPassword() { return { ok: true }; },
      async requestPasswordReset() { return { ok: true }; },
      logout() {},
      redirectToLogin() {},
    },
    entities: new Proxy({}, {
      get(target, prop) {
        if (typeof prop === 'string') return demoEntity(prop);
        return target[prop];
      },
    }),
  };
}

export const base44 = isDemoMode() ? demoClient() : realClient;
