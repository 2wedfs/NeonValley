import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Bell, Users, Ticket, ArrowRight, Shield, Star, CreditCard, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserProfile, getTierInfo } from '@/hooks/useUserProfile';
import { getTheme } from '@/lib/theme';
import { base44 } from '@/api/base44Client';

const TIER_ROWS = [
  { name: 'Neon Newbie',          range: '0 – 9,999',      floor: 0 },
  { name: 'Rhythm Rider',         range: '10K – 99,999',   floor: 10000 },
  { name: 'Boogie Boss',          range: '100K – 499,999', floor: 100000 },
  { name: 'Certified Toe-Tapper', range: '500K+',          floor: 500000 },
];

export default function Home() {
  const { user, profile, loading } = useUserProfile();
  const theme = getTheme(profile?.selected_theme);
  const [rsvps, setRsvps] = useState([]);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.RSVP.filter({ user_email: user.email, status: 'confirmed' }, '-created_date', 1)
      .then(setRsvps).catch(() => {});
  }, [user?.email]);

  const lifetime   = profile?.total_lifetime_points ?? profile?.total_points_earned ?? 0;
  const redeemable = profile?.redeemable_points ?? profile?.points_balance ?? 0;
  const visits     = profile?.visit_count ?? 0;
  const firstName  = (user?.full_name || user?.email?.split('@')[0] || 'there').split(' ')[0];
  const tier       = getTierInfo(lifetime);
  const progress   = tier.next ? Math.min(100, (lifetime - tier.floor) / (tier.nextPts - tier.floor) * 100) : 100;
  const ptsToNext  = tier.next ? tier.nextPts - lifetime : 0;

  return (
    <div className="min-h-screen px-4 pt-12 pb-6 font-inter" style={{ background: '#08080C' }}>

      {/* Subtle theme glow in background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ background: theme.bgGlow, position: 'absolute', inset: 0 }} />
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <p className="text-label mb-1">NEONVALLEY</p>
          <h1 className="text-[26px] font-space font-bold text-white leading-tight tracking-tight">
            Hey, {loading ? '…' : firstName}
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: ' rgba(255,255,255,0.4)' }}>
            18+ alcohol-free party experience
          </p>
        </div>
        <Link to="/notifications">
          <div className="w-10 h-10 rounded-full flex items-center justify-center card-subtle relative">
            <Bell size={17} color=" rgba(255,255,255,0.65)" strokeWidth={1.8} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full border-2"
              style={{ background: theme.primary, borderColor: ' #08080C' }} />
          </div>
        </Link>
      </motion.div>

      {/* Status Hero Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.06 }}
        className="rounded-3xl p-6 mb-4 relative overflow-hidden gradient-border-subtle z-10"
        style={{
          background: ' rgba(255,255,255,0.06)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          boxShadow: '0 24px 70px  rgba(0,0,0,0.55)',
        }}>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-label mb-1">Your NeonValley Status</p>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-space font-semibold" style={{ color: theme.primary }}>{tier.name}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: `${theme.primary}18`, border: `1px solid ${theme.primary}30` }}>
              <Star size={16} style={{ color: theme.primary }} />
            </div>
          </div>

          {/* Points */}
          <div className="mb-5">
            <p className="text-label mb-1.5">Redeemable Points</p>
            <p className="text-[44px] font-space font-bold leading-none text-white tracking-tight">
              {loading ? '—' : redeemable.toLocaleString()}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[12px] font-space font-medium" style={{ color: ' rgba(255,255,255,0.5)' }}>{tier.name}</span>
              {tier.next
                ? <span className="text-[12px]" style={{ color: ' rgba(255,255,255,0.35)' }}>{ptsToNext.toLocaleString()} to {tier.next}</span>
                : <span className="text-[12px]" style={{ color: theme.primary }}>Top tier reached</span>
              }
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: ' rgba(255,255,255,0.08)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                transition={{ duration: 1.1, delay: 0.5 }}
                className="h-full rounded-full"
                style={{ background: theme.gradient }} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-center pt-4"
            style={{ borderTop: '1px solid  rgba(255,255,255,0.07)' }}>
            {[
              { label: 'Redeemable', val: redeemable.toLocaleString() },
              { label: 'Lifetime',   val: lifetime.toLocaleString() },
              { label: 'Visits',     val: visits.toString() },
            ].map(s => (
              <div key={s.label}>
                <p className="text-[17px] font-space font-bold text-white">{loading ? '—' : s.val}</p>
                <p className="text-label mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* RSVP confirmation banner */}
      {rsvps.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="mb-4 relative z-10">
          <Link to="/my-rsvps">
            <div className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: ' rgba(74,222,128,0.07)', border: '1px solid  rgba(74,222,128,0.18)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: ' rgba(74,222,128,0.12)' }}>
                  <Ticket size={16} style={{ color: ' #4ade80' }} />
                </div>
                <div>
                  <p className="text-[14px] font-space font-semibold text-white">You're on the list</p>
                  <p className="text-[12px] mt-0.5 truncate max-w-[180px]" style={{ color: ' rgba(255,255,255,0.45)' }}>{rsvps[0].event_title}</p>
                </div>
              </div>
              <span className="badge-active">Confirmed</span>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-3 mb-4 relative z-10">
        {[
          { to: '/scan',       icon: QrCode,    label: 'Show Pass',   sub: 'Earn points at the door',  color: theme.primary },
          { to: '/events',     icon: Ticket,    label: 'Free RSVP',   sub: 'Reserve your spot',        color: theme.secondary },
          { to: '/my-tickets', icon: CreditCard,label: 'My Tickets',  sub: 'View & manage tickets',    color: ' rgba(255,255,255,0.7)' },
          { to: '/referral',   icon: Users,     label: 'Invite Crew', sub: 'Earn 1,000 pts/referral',  color: ' rgba(255,255,255,0.7)' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to}>
              <div className="card-subtle rounded-2xl p-4 h-full flex flex-col justify-between transition-all duration-150 active:scale-95">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${item.color}14`, border: `1px solid ${item.color}20` }}>
                  <Icon size={17} style={{ color: item.color }} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[14px] font-space font-semibold text-white leading-tight">{item.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: ' rgba(255,255,255,0.38)' }}>{item.sub}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </motion.div>

      {/* Membership Tiers */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="mb-4 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-space font-semibold text-white">Membership Tiers</h2>
          <Shield size={14} color=" rgba(255,255,255,0.2)" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {TIER_ROWS.map((t) => {
            const isCurrentTier = tier.name === t.name;
            const isPast = lifetime >= t.floor;
            return (
              <div key={t.name} className="rounded-2xl p-3.5"
                style={{
                  background: isCurrentTier ? `${theme.primary}10` : ' rgba(255,255,255,0.03)',
                  border: `1px solid ${isCurrentTier ? theme.primary + '30' : ' rgba(255,255,255,0.07)'}`,
                }}>
                {isCurrentTier && (
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full mb-1.5"
                    style={{ background: `${theme.primary}18`, border: `1px solid ${theme.primary}30` }}>
                    <span className="text-[9px] font-space font-bold uppercase tracking-wider" style={{ color: theme.primary }}>Current</span>
                  </div>
                )}
                <p className="text-[13px] font-space font-semibold leading-tight"
                  style={{ color: isPast ? ' rgba(255,255,255,0.85)' : ' rgba(255,255,255,0.25)' }}>{t.name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: ' rgba(255,255,255,0.3)' }}>{t.range}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Points info */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
        className="rounded-2xl p-4 flex items-center gap-3 mb-4 relative z-10 card-subtle">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${theme.primary}12`, border: `1px solid ${theme.primary}20` }}>
          <Zap size={16} style={{ color: theme.primary }} />
        </div>
        <div>
          <p className="text-[14px] font-space font-semibold text-white">100 Party Points per $1 spent</p>
          <p className="text-[12px] mt-0.5" style={{ color: ' rgba(255,255,255,0.4)' }}>Points are based on what you actually pay at the door.</p>
        </div>
      </motion.div>

    </div>
  );
}
