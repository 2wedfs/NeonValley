import { useState, useEffect } from 'react';
import { Users, Zap, TrendingUp, Gift, Search, ChevronRight, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import StatsCards from '@/components/dashboard/StatsCards';
import UsersTable from '@/components/dashboard/UsersTable';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import PointsAdjuster from '@/components/dashboard/PointsAdjuster';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me.role !== 'admin') {
          setUnauthorized(true);
          setLoading(false);
          return;
        }
        const [profs, txns] = await Promise.all([
          base44.entities.UserProfile.list('-created_date', 100),
          base44.entities.PointsTransaction.list('-created_date', 50),
        ]);
        setProfiles(profs);
        setTransactions(txns);
      } catch (e) {
        setUnauthorized(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function refreshData() {
    const [profs, txns] = await Promise.all([
      base44.entities.UserProfile.list('-created_date', 100),
      base44.entities.PointsTransaction.list('-created_date', 50),
    ]);
    setProfiles(profs);
    setTransactions(txns);
  }

  const filteredProfiles = profiles.filter(p =>
    !search || p.user_email?.toLowerCase().includes(search.toLowerCase()) || p.member_id?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="w-8 h-8 border-4 border-transparent rounded-full animate-spin"
        style={{ borderTopColor: ' #00F5D4', boxShadow: '0 0 20px  rgba(0,245,212,0.5)' }} />
    </div>
  );

  if (unauthorized) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black px-8 text-center">
      <div className="text-4xl mb-4">🚫</div>
      <h2 className="text-2xl font-space font-bold text-white mb-2">Admin Only</h2>
      <p className="text-white/50 font-inter text-sm">Your account needs the <span className="text-neon-cyan font-semibold">admin</span> role to access this dashboard. Ask your platform owner to update your role.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black px-4 pt-10 pb-10 font-inter max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-xs font-space font-semibold tracking-[0.2em] uppercase mb-1" style={{ color: ' #00F5D4' }}>NeonValley</p>
        <h1 className="text-3xl font-space font-bold text-white">Staff Dashboard</h1>
        <p className="text-sm text-white/40 font-inter mt-1">Welcome, {user?.full_name || user?.email}</p>
      </motion.div>

      {/* Stats */}
      <StatsCards profiles={profiles} transactions={transactions} />

      {/* Points Adjuster */}
      {selectedProfile && (
        <PointsAdjuster
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onDone={() => { setSelectedProfile(null); refreshData(); }}
        />
      )}

      {/* Recent Transactions */}
      <RecentTransactions transactions={transactions} />

      {/* Users Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-space font-bold text-white">Members</h2>
          <span className="text-xs text-white/40 font-inter">{profiles.length} total</span>
        </div>
        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: ' rgba(255,255,255,0.3)' }} />
          <input
            type="text"
            placeholder="Search by email or member ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-inter text-white placeholder-white/25 outline-none"
            style={{ background: ' rgba(255,255,255,0.05)', border: '1px solid  rgba(255,255,255,0.1)' }}
          />
        </div>
        <UsersTable profiles={filteredProfiles} onSelect={setSelectedProfile} />
      </motion.div>
    </div>
  );
}
