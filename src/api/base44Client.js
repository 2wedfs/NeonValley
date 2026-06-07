import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { isDemoMode, demoUser, readDemoStore, writeDemoStore } from '@/lib/demoMode';

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

const STORE_KEYS = {
  Event: 'events',
  Ticket: 'tickets',
  RSVP: 'rsvps',
  UserProfile: 'profiles',
  PointsTransaction: 'pointsTransactions',
  RewardRedemption: 'rewardRedemptions',
  Payment: 'payments',
  PromoCode: 'promoCodes',
  CheckIn: 'checkIns',
  Referral: 'referrals',
  Reward: 'rewards',
  Announcement: 'announcements',
  Notification: 'notifications',
};

function storeKey(name) {
  return STORE_KEYS[name] || (name.charAt(0).toLowerCase() + name.slice(1) + 's');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function matchesFilter(item, filter = {}) {
  return Object.entries(filter || {}).every(([key, value]) => {
    if (value == null) return item[key] == null;
    return item[key] === value;
  });
}

function sortRows(rows, sort) {
  if (!sort || typeof sort !== 'string') return rows;
  const desc = sort.startsWith('-');
  const key = desc ? sort.slice(1) : sort;
  return [...rows].sort((a, b) => {
    const av = a[key] || '';
    const bv = b[key] || '';
    if (av === bv) return 0;
    return (av > bv ? 1 : -1) * (desc ? -1 : 1);
  });
}

function entityRows(name, store) {
  const key = storeKey(name);
  if (!Array.isArray(store[key])) store[key] = [];
  return store[key];
}

function demoEntity(name) {
  return {
    async list(sort, limit) {
      const store = readDemoStore();
      let rows = sortRows(entityRows(name, store), sort);
      if (limit) rows = rows.slice(0, limit);
      return clone(rows);
    },
    async filter(filter = {}, sort, limit) {
      const store = readDemoStore();
      let rows = entityRows(name, store).filter(item => matchesFilter(item, filter));
      rows = sortRows(rows, sort);
      if (limit) rows = rows.slice(0, limit);
      return clone(rows);
    },
    async create(payload = {}) {
      const store = readDemoStore();
      const rows = entityRows(name, store);
      const created = {
        id: payload.id || 'demo-' + name.toLowerCase() + '-' + Date.now(),
        is_demo: true,
        created_date: payload.created_date || new Date().toISOString(),
        ...payload,
      };
      rows.unshift(created);
      writeDemoStore(store);
      return clone(created);
    },
    async update(id, payload = {}) {
      const store = readDemoStore();
      const rows = entityRows(name, store);
      const index = rows.findIndex(item => item.id === id);
      if (index >= 0) {
        rows[index] = { ...rows[index], ...payload, is_demo: true };
        writeDemoStore(store);
        return clone(rows[index]);
      }
      const created = { id, is_demo: true, created_date: new Date().toISOString(), ...payload };
      rows.unshift(created);
      writeDemoStore(store);
      return clone(created);
    },
    async delete(id) {
      const store = readDemoStore();
      const rows = entityRows(name, store);
      const index = rows.findIndex(item => item.id === id);
      if (index >= 0) rows.splice(index, 1);
      writeDemoStore(store);
      return { id, deleted: true, is_demo: true };
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
      async resetPassword() { return { ok: true, is_demo: true }; },
      async requestPasswordReset() { return { ok: true, is_demo: true }; },
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
