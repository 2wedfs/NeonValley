import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ChevronRight, Bell, Shield, HelpCircle, LogOut, Star, Ticket, TrendingUp, BookOpen, Check, Gift, QrCode, X, CreditCard, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getTheme, DISPLAY_THEMES, THEMES, getTierInfo } from '@/lib/theme';
import { base44 } from '@/api/base44Client';
import { QRCodeSVG } from 'qrcode.react';

const TIER_THRESHOLDS = [
  { name: 'Neon Newbie',          threshold: 0,      pts: '0–9,999' },
  { name: 'Rhythm Rider',         threshold: 10000,  pts: '10K–99,999' },
  { name: 'Boogie Boss',          threshold: 100000, pts: '100K–499,999' },
  { name: 'Certified Toe-Tapper', threshold: 500000, pts: '500K+' },
];

function BarcodeModal({ redemption, onClose, theme }) {
  const expiresDate = redemption.expires_at
    ? new Date(redemption.expires_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—';
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.85)' }} onClick={onClose}>
      <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        className="w-full max-w-md rounded-t-3xl p-6 relative"
        style={{ background: '#111116', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 -20px 60px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-6" />
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center card-subtle">
          <X size={14} color="rgba(255,255,255,0.6)" />
        </button>
        <p className="font-space font-semibold text-white text-[16px] mb-5 pr-10">{redemption.reward_name}</p>
        <div className="flex justify-center mb-4">
          <div className="rounded-2xl p-4 bg-white">
            <QRCodeSVG value={redemption.barcode_value} size={180} bgColor="#ffffff" fgColor="#000000" level="M" />
          </div>
        </div>
        <p className="text-center text-[12px] font-mono mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>{redemption.barcode_value}</p>
        <div className="rounded-2xl p-3.5 text-center card-subtle">
          <p className="text-[13px] font-space font-semibold text-white">Show this to staff at the door.</p>
          <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Expires: {expiresDate}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Profile() {
  const { user, profile, loading, updateTheme } = useUserProfile();
  const [signingOut, setSigningOut] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [showBarcode, setShowBarcode] = useState(null);

  const theme = getTheme(selectedTheme || profile?.selected_theme);
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Member';
  const initials = displayName.slice(0, 2).toUpperCase();
  const lifetime   = profile?.total_lifetime_points ?? profile?.total_points_earned ?? 0;
  const redeemable = profile?.redeemable_points ?? profile?.points_balance ?? 0;
  const visits     = profile?.visit_count ?? 0;
  const memberId   = profile?.member_id ?? '—';
  const tier       = getTierInfo(lifetime);
  const ptsToNext  = tier.next ? tier.nextPts - lifetime : 0;
  const progress   = tier.next ? Math.min(100, ((lifetime - tier.floor) / (tier.nextPts - tier.floor)) * 100) : 100;
  const memberSince = user?.created_date
    ? new Date(user.created_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  useEffect(() => { if (profile?.selected_theme) setSelectedTheme(profile.selected_theme); }, [profile?.selected_theme]);

  useEffect(() => {
    if (!user?.email || historyLoaded) return;
    Promise.all([
      base44.entities.PointsTransaction.filter({ user_email: user.email }, '-created_date', 30),
      base44.entities.RewardRedemption.filter({ user_email: user.email }, '-created_date', 30),
    ]).then(([txns, reds]) => { setPointsHistory(txns); setRedemptions(reds); setHistoryLoaded(true); });
  }, [user?.email]);

  async function handleThemeSelect(name) {
    setSelectedTheme(name);
    setSavingTheme(true);
    await updateTheme(name);
    setSavingTheme(false);
  }

  async function handleSignOut() { setSigningOut(true); base44.auth.logout('/login'); }

  const activeRedemptions = redemptions.filter(r => r.status === 'active');
  const pastRedemptions   = redemptions.filter(r => r.status !== 'active');

  function isEarnType(type) {
    return ['earn', 'check_in', 'ticket_purchase', 'referral_bonus', 'reward_restored', 'admin_adjustment'].includes(type);
  }
  function pointsSign(item) {
    return ['reward_redemption', 'ticket_refund', 'redeem'].includes(item.type) ? '-' : '+';
  }
  function pointsColor(item) {
    return ['reward_redemption', 'ticket_refund', 'redeem'].includes(item.type) ? ' #f87171' : theme.primary;
  }

  const themesToShow = DISPLAY_THEMES.map(n => THEMES[n]).filter(Boolean);

  return (
    <div className="min-h-screen px-4 pt-12 pb-6 font-inter" style={{ background: ' #08080C' }}>
      <AnimatePresence>
        {showBarcode && <BarcodeModal redemption={showBarcode} onClose={() => setShowBarcode(null)} theme={theme} />}
      </AnimatePresence>

      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ background: theme.bgGlow, position: 'absolute', inset: 0 }} />
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <p className="text-label mb-1">NEONVALLEY</p>
          <h1 className="text-[26px] font-space font-bold text-white tracking-tight">Profile</h1>
        </div>
      </motion.div>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.06 }}
        className="rounded-3xl p-6 mb-4 relative overflow-hidden gradient-border-subtle z-10 card-glass-elevated">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${theme.primary}14`, border: `1px solid ${theme.primary}28` }}>
            <span className="text-[20px] font-space font-bold" style={{ color: theme.primary }}>
              {loading ? '…' : initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-space font-bold text-white">{loading ? '…' : displayName}</h2>
            <p className="text-[12px] mt-0.5 truncate" style={{ color: ' rgba(255,255,255,0.4)' }}>{user?.email || '—'}</p>
            <p className="text-[11px] font-mono mt-0.5" style={{ color: ' rgba(255,255,255,0.25)' }}>{memberId}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <Star size={11} style={{ color: theme.primary }} />
              <span className="text-[12px] font-space font-medium" style={{ color: theme.primary }}>{tier.name}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-5" style={{ borderTop: '1px solid  rgba(255,255,255,0.07)' }}>
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div>
              <p className="text-[17px] font-space font-bold text-white">{loading ? '—' : redeemable.toLocaleString()}</p>
              <p className="text-label mt-0.5">Redeemable</p>
            </div>
            <div>
              <p className="text-[17px] font-space font-bold text-white">{loading ? '—' : lifetime.toLocaleString()}</p>
              <p className="text-label mt-0.5">Lifetime</p>
            </div>
            <div>
              <p className="text-[17px] font-space font-bold text-white">{loading ? '—' : visits}</p>
              <p className="text-label mt-0.5">Visits</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[12px] mb-1.5" style={{ color: ' rgba(255,255,255,0.4)' }}>
              <span>{tier.name}</span>
              {tier.next
                ? <span>{ptsToNext.toLocaleString()} pts to {tier.next}</span>
                : <span style={{ color: theme.primary }}>Top tier reached</span>
              }
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: ' rgba(255,255,255,0.08)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                transition={{ duration: 1, delay: 0.4 }} className="h-full rounded-full"
                style={{ background: theme.gradient }} />
            </div>
            <p className="text-[11px] mt-1.5" style={{ color: ' rgba(255,255,255,0.2)' }}>
              Redeeming rewards never lowers your tier.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tiers */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card-subtle rounded-2xl p-5 mb-4 relative z-10">
        <p className="text-[14px] font-space font-semibold text-white mb-4">Membership Tiers</p>
        <div className="grid grid-cols-2 gap-2">
          {TIER_THRESHOLDS.map(t => {
            const isCurrent = t.name === tier.name;
            const isPast = lifetime >= t.threshold;
            return (
              <div key={t.name} className="rounded-xl py-2.5 px-3"
                style={{
                  background: isCurrent ? `${theme.primary}10` : ' rgba(255,255,255,0.03)',
                  border: `1px solid ${isCurrent ? theme.primary + '28' : ' rgba(255,255,255,0.06)'}`,
                }}>
                <p className="text-[12px] font-space font-semibold"
                  style={{ color: isPast ? ' rgba(255,255,255,0.85)' : ' rgba(255,255,255,0.2)' }}>{t.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: ' rgba(255,255,255,0.25)' }}>{t.pts}</p>
                {isCurrent && <div className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: theme.primary }} />}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Referral */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="card-subtle rounded-2xl p-4 mb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${theme.primary}10`, border: `1px solid ${theme.primary}20` }}>
              <Users size={15} style={{ color: theme.primary }} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[14px] font-space font-semibold text-white">Referrals</p>
              <p className="text-[11px] mt-0.5" style={{ color: ' rgba(255,255,255,0.35)' }}>
                Code: <span className="font-mono">{profile?.referral_code || '—'}</span>
                {' · '}{profile?.referral_bonus_given_count ?? 0} referrals
              </p>
            </div>
          </div>
          <Link to="/referral">
            <button className="px-3 py-1.5 rounded-xl text-[12px] font-space font-semibold btn-secondary">View</button>
          </Link>
        </div>
      </motion.div>

      {/* Theme picker */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
        className="mb-4 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-space font-semibold text-white">App Theme</h2>
          {savingTheme && <span className="text-label">Saving…</span>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {themesToShow.map(t => {
            const isSelected = (selectedTheme || profile?.selected_theme) === t.name;
            return (
              <button key={t.name} onClick={() => handleThemeSelect(t.name)}
                className="rounded-2xl p-4 flex items-center gap-3 transition-all text-left"
                style={{
                  background: isSelected ? `${t.primary}10` : ' rgba(255,255,255,0.04)',
                  border: `1.5px solid ${isSelected ? t.primary + '40' : ' rgba(255,255,255,0.08)'}`,
                }}>
                <div className="w-8 h-8 rounded-xl flex-shrink-0" style={{ background: t.gradient }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-space font-semibold leading-tight"
                    style={{ color: isSelected ? t.primary : ' rgba(255,255,255,0.75)' }}>{t.name}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: t.primary }}>
                    <Check size={11} color=" #000" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Meta info */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="card-subtle rounded-2xl px-4 py-4 mb-4 space-y-3 relative z-10">
        {[
          { icon: MapPin,    text: 'San Francisco Bay Area, CA' },
          { icon: Calendar, text: `Member since ${memberSince}` },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3">
            <Icon size={14} color=" rgba(255,255,255,0.28)" strokeWidth={1.8} />
            <span className="text-[13px] font-inter" style={{ color: ' rgba(255,255,255,0.5)' }}>{text}</span>
          </div>
        ))}
      </motion.div>

      {/* Activity & History */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="mb-4 relative z-10">
        <h2 className="text-[15px] font-space font-semibold text-white mb-4">Activity & History</h2>

        {activeRedemptions.length > 0 && (
          <div className="mb-4">
            <p className="text-label mb-2">Active Rewards</p>
            <div className="space-y-2">
              {activeRedemptions.map(r => {
                const expires = r.expires_at ? new Date(r.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
                return (
                  <div key={r.id} className="card-subtle rounded-xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${theme.primary}10` }}>
                        <Ticket size={14} style={{ color: theme.primary }} strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-[13px] font-space font-semibold text-white">{r.reward_name}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: ' rgba(255,255,255,0.35)' }}>Expires {expires}</p>
                      </div>
                    </div>
                    <button onClick={() => setShowBarcode(r)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-space font-semibold btn-secondary">
                      <QrCode size={11} /> Show
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="text-label mb-2">Points History</p>
          {!historyLoaded ? (
            <div className="flex justify-center py-6">
              <div className="w-5 h-5 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: theme.primary }} />
            </div>
          ) : pointsHistory.length === 0 ? (
            <div className="card-subtle rounded-xl p-5 text-center">
              <p className="text-[13px] font-inter" style={{ color: ' rgba(255,255,255,0.25)' }}>No transactions yet. Check in to start earning.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pointsHistory.map(item => (
                <div key={item.id} className="card-subtle rounded-xl px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: isEarnType(item.type) ? `${theme.primary}10` : ' rgba(239,68,68,0.08)' }}>
                      <TrendingUp size={13} style={{ color: isEarnType(item.type) ? theme.primary : ' #f87171' }} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-[12px] font-space font-medium text-white leading-tight">{item.description}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: ' rgba(255,255,255,0.3)' }}>
                        {new Date(item.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className="text-[13px] font-space font-bold" style={{ color: pointsColor(item) }}>
                    {pointsSign(item)}{(item.points || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {pastRedemptions.length > 0 && (
          <div>
            <p className="text-label mb-2">Reward History</p>
            <div className="space-y-2">
              {pastRedemptions.map(r => {
                const statusColor = r.status === 'used' ? ' #4ade80' : r.status === 'expired' ? ' #f87171' : ' rgba(255,255,255,0.3)';
                return (
                  <div key={r.id} className="card-subtle rounded-xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: ' rgba(255,255,255,0.04)' }}>
                        <Gift size={13} color=" rgba(255,255,255,0.35)" strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-[12px] font-space font-medium text-white">{r.reward_name}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: ' rgba(255,255,255,0.3)' }}>
                          {new Date(r.redeemed_at || r.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-space font-semibold px-2 py-0.5 rounded-full capitalize"
                        style={{ background: `${statusColor}12`, color: statusColor, border: `1px solid ${statusColor}25` }}>
                        {r.status}
                      </span>
                      <p className="text-[12px] font-space font-bold mt-1" style={{ color: ' #f87171' }}>
                        -{r.points_spent?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Settings */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
        className="space-y-4 relative z-10">
        {[
          { title: 'Account', items: [
            { icon: CreditCard, label: 'My Tickets',    link: '/my-tickets' },
            { icon: Ticket,     label: 'My RSVPs',      link: '/my-rsvps' },
            { icon: Users,      label: 'Referrals',     link: '/referral' },
            { icon: Bell,       label: 'Notifications', link: '/notifications' },
          ]},
          { title: 'Support', items: [
            { icon: HelpCircle, label: 'Help & FAQ' },
            { icon: BookOpen,   label: 'Community Guidelines' },
            { icon: LogOut,     label: 'Sign Out', danger: true, action: handleSignOut },
          ]},
        ].map(group => (
          <div key={group.title}>
            <p className="text-label mb-2">{group.title}</p>
            <div className="card-subtle rounded-2xl overflow-hidden">
              {group.items.map((item, ii) => {
                const Icon = item.icon;
                const inner = (
                  <div className="w-full flex items-center justify-between px-4 py-3.5 transition-all hover:bg-white/[0.04]"
                    style={{ borderBottom: ii < group.items.length - 1 ? '1px solid  rgba(255,255,255,0.05)' : 'none' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: item.danger ? ' rgba(239,68,68,0.08)' : ' rgba(255,255,255,0.05)' }}>
                        <Icon size={14} style={{ color: item.danger ? ' #f87171' : ' rgba(255,255,255,0.55)' }} strokeWidth={1.8} />
                      </div>
                      <span className="text-[14px] font-inter font-medium"
                        style={{ color: item.danger ? ' #f87171' : ' rgba(255,255,255,0.8)' }}>
                        {item.label === 'Sign Out' && signingOut ? 'Signing out…' : item.label}
                      </span>
                    </div>
                    <ChevronRight size={14} color=" rgba(255,255,255,0.18)" />
                  </div>
                );
                if (item.link) return <Link key={item.label} to={item.link}>{inner}</Link>;
                return <button key={item.label} onClick={item.action} disabled={item.label === 'Sign Out' && signingOut} className="w-full text-left">{inner}</button>;
              })}
            </div>
          </div>
        ))}
      </motion.div>

      <div className="mt-8 text-center relative z-10">
        <p className="text-[11px] font-inter" style={{ color: ' rgba(255,255,255,0.18)' }}>
          NeonValley · Bay Area's 18+ Alcohol-Free Party Community
        </p>
        {(user?.role === 'admin' || user?.role === 'staff' || profile?.staff_role === 'staff' || profile?.staff_role === 'admin') && (
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            <Link to="/staff">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-space font-medium btn-secondary">
                <Shield size={12} /> Staff Portal
              </button>
            </Link>
            {(user?.role === 'admin' || profile?.staff_role === 'admin') && (
              <Link to="/dashboard">
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-space font-medium btn-secondary">
                  Dashboard
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
