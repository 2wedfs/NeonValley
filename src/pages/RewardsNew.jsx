import { useState, useEffect } from 'react';
import { Zap, Lock, CheckCircle, AlertCircle, Ticket, QrCode, X, Percent, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfile, getTierInfo } from '@/hooks/useUserProfile';
import { getTheme } from '@/lib/theme';
import { base44 } from '@/api/base44Client';
import { QRCodeSVG } from 'qrcode.react';

const FIXED_REWARDS = [
  { key: 'discount25', icon: Percent, name: '25% Discount',  cost: 10000, category: 'Discount',   description: '25% off your next entry.', reward_type: 'discount_25' },
  { key: 'discount50', icon: Percent, name: '50% Discount',  cost: 15000, category: 'Discount',   description: '50% off your next entry.', reward_type: 'discount_50' },
  { key: 'freeticket', icon: Ticket,  name: 'Free Ticket',   cost: 25000, category: 'Free Entry', description: 'Free entry to a NeonValley event.', reward_type: 'free_ticket' },
  { key: 'grouppass',  icon: Users,   name: 'Group Pass',    cost: 69000, category: 'Group',      description: 'Free entry for up to 4 people.', reward_type: 'group_pass' },
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
            <QRCodeSVG value={redemption.barcode_value} size={190} bgColor="#ffffff" fgColor="#000000" level="M" />
          </div>
        </div>
        <p className="text-center text-[12px] font-mono mt-3 mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>{redemption.barcode_value}</p>
        <div className="rounded-2xl p-3.5 text-center card-subtle">
          <p className="text-[13px] font-space font-semibold text-white">Show this to staff at the door.</p>
          <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Expires: {expiresDate}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Rewards() {
  const { user, profile, loading, redeemReward } = useUserProfile();
  const theme = getTheme(profile?.selected_theme);
  const [activeRedemptions, setActiveRedemptions] = useState([]);
  const [redeeming, setRedeeming] = useState(null);
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [showBarcode, setShowBarcode] = useState(null);

  const redeemable = profile?.redeemable_points ?? profile?.points_balance ?? 0;
  const lifetime   = profile?.total_lifetime_points ?? profile?.total_points_earned ?? 0;
  const tier       = getTierInfo(lifetime);

  function showToast(msg, type = 'success') {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(null), 3500);
  }

  async function loadRedemptions() {
    if (!user?.email) return;
    const all = await base44.entities.RewardRedemption.filter({ user_email: user.email }, '-created_date', 20);
    const now = new Date();
    const updated = await Promise.all(all.map(async r => {
      if (r.status === 'active' && r.expires_at && new Date(r.expires_at) < now) {
        await base44.entities.RewardRedemption.update(r.id, { status: 'expired' });
        return { ...r, status: 'expired' };
      }
      return r;
    }));
    setActiveRedemptions(updated.filter(r => r.status === 'active'));
  }

  useEffect(() => {
    loadRedemptions();
    window.addEventListener('neonvalley-demo-change', loadRedemptions);
    window.addEventListener('storage', loadRedemptions);
    return () => {
      window.removeEventListener('neonvalley-demo-change', loadRedemptions);
      window.removeEventListener('storage', loadRedemptions);
    };
  }, [user?.email]);

  async function handleRedeem(reward) {
    if (redeemable < reward.cost || redeemable <= 0) {
      showToast(`Need ${Math.max(0, reward.cost - redeemable).toLocaleString()} more points.`, 'error');
      return;
    }
    setRedeeming(reward.key);
    const updated = await redeemReward({ name: reward.name, costPoints: reward.cost });
    if (!updated) { showToast('Redemption failed. Try again.', 'error'); setRedeeming(null); return; }
    const now = new Date();
    const expires = new Date(now);
    expires.setDate(expires.getDate() + 30);
    const newRedemption = await base44.entities.RewardRedemption.create({
      user_email: user.email,
      user_name: profile?.full_name || user.email,
      reward_id: reward.key,
      reward_name: reward.name,
      reward_type: reward.reward_type,
      points_spent: reward.cost,
      barcode_value: 'NV-REWARD-PENDING',
      status: 'active',
      redeemed_at: now.toISOString(),
      expires_at: expires.toISOString(),
    });
    const realBarcode = `NV-REWARD-${newRedemption.id.slice(0, 12).toUpperCase()}`;
    await base44.entities.RewardRedemption.update(newRedemption.id, { barcode_value: realBarcode });
    setRedeeming(null);
    showToast(`${reward.name} redeemed! Find your barcode below.`, 'success');
    await loadRedemptions();
  }

  return (
    <div className="min-h-screen px-4 pt-12 pb-6 font-inter" style={{ background: ' #08080C' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ background: theme.bgGlow, position: 'absolute', inset: 0 }} />
      </div>

      <AnimatePresence>
        {showBarcode && <BarcodeModal redemption={showBarcode} onClose={() => setShowBarcode(null)} theme={theme} />}
        {toast && (
          <motion.div initial={{ opacity: 0, y: -32 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -32 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl font-space font-semibold text-[14px] flex items-center gap-2 max-w-xs shadow-2xl"
            style={{
              background: toastType === 'success' ? theme.primary : ' #ef4444',
              color: ' #fff',
            }}>
            {toastType === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6 relative z-10">
        <p className="text-label mb-1">NEONVALLEY</p>
        <h1 className="text-[26px] font-space font-bold text-white tracking-tight">Rewards</h1>
        <p className="text-[13px] mt-0.5" style={{ color: ' rgba(255,255,255,0.4)' }}>Spend points. Get rewards.</p>
      </motion.div>

      {/* Points hero */}
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.06 }}
        className="rounded-3xl p-6 mb-5 relative overflow-hidden gradient-border-subtle z-10 card-glass-elevated">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-label mb-2">Redeemable Points</p>
            <p className="text-[46px] font-space font-bold text-white leading-none tracking-tight">
              {loading ? '—' : redeemable.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
            style={{ background: `${theme.primary}12`, border: `1px solid ${theme.primary}25` }}>
            <Zap size={12} style={{ color: theme.primary }} />
            <span className="text-[12px] font-space font-semibold" style={{ color: theme.primary }}>Points</span>
          </div>
        </div>
        <p className="text-[13px] font-inter mb-4 leading-relaxed" style={{ color: ' rgba(255,255,255,0.45)' }}>
          Redeemable Points can be spent on rewards.<br />
          Lifetime Points build your tier and never go down.
        </p>
        <div className="flex items-center gap-4 pt-4" style={{ borderTop: '1px solid  rgba(255,255,255,0.07)' }}>
          <div>
            <p className="text-label mb-1">Lifetime Points</p>
            <p className="text-[15px] font-space font-semibold text-white">{loading ? '—' : lifetime.toLocaleString()}</p>
          </div>
          <div className="w-px h-8" style={{ background: ' rgba(255,255,255,0.08)' }} />
          <div>
            <p className="text-label mb-1">Membership Tier</p>
            <p className="text-[15px] font-space font-semibold text-white">{tier.name}</p>
          </div>
        </div>
      </motion.div>

      {/* Active Redemptions */}
      {activeRedemptions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-5 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-space font-semibold text-white">Active Rewards</h2>
            <span className="badge-active">{activeRedemptions.length} active</span>
          </div>
          <div className="space-y-2">
            {activeRedemptions.map(r => {
              const expires = r.expires_at
                ? new Date(r.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—';
              return (
                <div key={r.id} className="card-subtle rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-space font-semibold text-white">{r.reward_name}</p>
                    <p className="text-[12px] mt-0.5" style={{ color: ' rgba(255,255,255,0.35)' }}>Expires {expires}</p>
                  </div>
                  <button onClick={() => setShowBarcode(r)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-space font-semibold transition-all btn-secondary">
                    <QrCode size={13} /> Show Code
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Negative balance warning */}
      {redeemable < 0 && (
        <div className="rounded-2xl p-4 mb-5 relative z-10"
          style={{ background: ' rgba(239,68,68,0.07)', border: '1px solid  rgba(239,68,68,0.20)' }}>
          <p className="text-[14px] font-space font-semibold text-red-400 mb-1">Negative Balance</p>
          <p className="text-[13px] font-inter leading-relaxed" style={{ color: ' rgba(255,255,255,0.45)' }}>
            Your balance is {redeemable.toLocaleString()} due to a refund reversing earned points. Earn more to bring it above zero.
          </p>
        </div>
      )}

      {/* Reward Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
        className="mb-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-space font-semibold text-white">Available Rewards</h2>
          <span className="text-label">4 rewards</span>
        </div>
        <div className="space-y-3">
          {FIXED_REWARDS.map(reward => {
            const canAfford = redeemable > 0 && redeemable >= reward.cost;
            const isRedeeming = redeeming === reward.key;
            const Icon = reward.icon;
            return (
              <div key={reward.key}
                className="rounded-2xl p-5 transition-all"
                style={{
                  background: canAfford ? ' rgba(255,255,255,0.07)' : ' rgba(255,255,255,0.04)',
                  border: `1px solid ${canAfford ? ' rgba(255,255,255,0.14)' : ' rgba(255,255,255,0.07)'}`,
                  boxShadow: canAfford ? '0 8px 32px  rgba(0,0,0,0.3)' : 'none',
                }}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: canAfford ? `${theme.primary}12` : ' rgba(255,255,255,0.05)',
                      border: `1px solid ${canAfford ? theme.primary + '28' : ' rgba(255,255,255,0.08)'}`,
                    }}>
                    <Icon size={20} style={{ color: canAfford ? theme.primary : ' rgba(255,255,255,0.25)' }} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[15px] font-space font-semibold text-white">{reward.name}</p>
                      <span className="text-label">{reward.category}</span>
                    </div>
                    <p className="text-[13px] font-inter mt-1 leading-relaxed" style={{ color: ' rgba(255,255,255,0.45)' }}>{reward.description}</p>
                    <p className="text-[14px] font-space font-semibold mt-2"
                      style={{ color: canAfford ? theme.primary : ' rgba(255,255,255,0.25)' }}>
                      {reward.cost.toLocaleString()} pts
                    </p>
                  </div>
                </div>
                {canAfford ? (
                  <button onClick={() => handleRedeem(reward)} disabled={isRedeeming || !!redeeming}
                    className="w-full h-[46px] rounded-[14px] font-space font-semibold text-[14px] transition-all active:scale-[0.98]"
                    style={{
                      background: theme.gradient,
                      color: ' #fff',
                      boxShadow: `0 6px 20px ${theme.glow}`,
                      opacity: isRedeeming ? 0.6 : 1,
                    }}>
                    {isRedeeming ? 'Redeeming…' : 'Redeem'}
                  </button>
                ) : (
                  <div className="w-full h-[46px] rounded-[14px] text-[13px] font-space font-medium flex items-center justify-center gap-2"
                    style={{ background: ' rgba(255,255,255,0.03)', color: ' rgba(255,255,255,0.22)', border: '1px solid  rgba(255,255,255,0.06)' }}>
                    <Lock size={12} /> Need {Math.max(0, reward.cost - redeemable).toLocaleString()} more pts
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="pb-4 relative z-10">
        <p className="text-[11px] text-center font-inter leading-relaxed" style={{ color: ' rgba(255,255,255,0.2)' }}>
          Redeemable Points are spent on rewards. Lifetime Points build your tier and never decrease.<br />
          Reward barcodes expire 30 days after redemption.
        </p>
      </div>
    </div>
  );
}
