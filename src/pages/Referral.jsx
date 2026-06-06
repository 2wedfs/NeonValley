import { useState, useEffect } from 'react';
import { Copy, Share2, Users, Zap, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getTheme } from '@/lib/theme';
import { getMembershipTier } from '@/lib/theme';
import { base44 } from '@/api/base44Client';

const REFERRAL_BONUS = 1000;
const PARTY_CODE = 'party!';

export default function Referral() {
  const { user, profile, setProfile, loading } = useUserProfile();
  const theme = getTheme(profile?.selected_theme);
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState(null);
  const [referralHistory, setReferralHistory] = useState([]);

  const referralUsed = profile?.referral_used === true;
  const myCode = profile?.referral_code ?? '';

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.PointsTransaction.filter({ user_email: user.email, type: 'referral_bonus' }, '-created_date', 20)
      .then(setReferralHistory);
  }, [user?.email]);

  function handleCopy() {
    navigator.clipboard.writeText(myCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: 'Join NeonValley!',
        text: `Use my referral code ${myCode} to join NeonValley! Bay Area's 18+ alcohol-free party community.`,
        url: window.location.origin,
      });
    } else {
      handleCopy();
    }
  }

  async function handleApplyCode() {
    const rawCode = inputCode.trim();
    const code = rawCode.toLowerCase();
    if (!code) return;
    if (!profile || !user) return;
    setApplying(true);
    setApplyMsg(null);

    if (referralUsed) {
      setApplyMsg({ text: 'You already used a referral code.', type: 'error' });
      setApplying(false);
      return;
    }

    if (code === 'party!') {
      const now = new Date().toISOString();
      const newRedeemable = (profile.redeemable_points ?? 0) + REFERRAL_BONUS;
      const newLifetime = (profile.total_lifetime_points ?? 0) + REFERRAL_BONUS;
      const newTier = getMembershipTier(newLifetime);
      const [updated] = await Promise.all([
        base44.entities.UserProfile.update(profile.id, {
          redeemable_points: newRedeemable,
          total_lifetime_points: newLifetime,
          points_balance: newRedeemable,
          total_points_earned: newLifetime,
          membership_tier: newTier,
          referral_used: true,
          referral_used_at: now,
          referred_by_code: 'party!',
          referral_bonus_received: true,
        }),
        base44.entities.PointsTransaction.create({
          user_email: user.email,
          type: 'referral_bonus',
          points: REFERRAL_BONUS,
          description: 'Used referral code party!',
          related_referral_code: 'party!',
        }),
      ]);
      setProfile(updated);
      setApplyMsg({ text: 'Code applied. +1,000 points added.', type: 'success' });
      setInputCode('');
      setApplying(false);
      return;
    }

    if (code === myCode) {
      setApplyMsg({ text: 'You cannot use your own referral code.', type: 'error' });
      setApplying(false);
      return;
    }

    const owners = await base44.entities.UserProfile.filter({ referral_code: code });
    if (owners.length === 0) {
      setApplyMsg({ text: 'Invalid referral code. Try again.', type: 'error' });
      setApplying(false);
      return;
    }

    const ownerProfile = owners[0];
    const now = new Date().toISOString();
    const newRedeemableB = (profile.redeemable_points ?? 0) + REFERRAL_BONUS;
    const newLifetimeB = (profile.total_lifetime_points ?? 0) + REFERRAL_BONUS;
    const newTierB = getMembershipTier(newLifetimeB);
    const newRedeemableA = (ownerProfile.redeemable_points ?? 0) + REFERRAL_BONUS;
    const newLifetimeA = (ownerProfile.total_lifetime_points ?? 0) + REFERRAL_BONUS;
    const newTierA = getMembershipTier(newLifetimeA);

    const [updated] = await Promise.all([
      base44.entities.UserProfile.update(profile.id, {
        redeemable_points: newRedeemableB,
        total_lifetime_points: newLifetimeB,
        points_balance: newRedeemableB,
        total_points_earned: newLifetimeB,
        membership_tier: newTierB,
        referral_used: true,
        referral_used_at: now,
        referred_by_code: code,
        referral_bonus_received: true,
      }),
      base44.entities.UserProfile.update(ownerProfile.id, {
        redeemable_points: newRedeemableA,
        total_lifetime_points: newLifetimeA,
        points_balance: newRedeemableA,
        total_points_earned: newLifetimeA,
        membership_tier: newTierA,
        referral_bonus_given_count: (ownerProfile.referral_bonus_given_count ?? 0) + 1,
      }),
      base44.entities.PointsTransaction.create({
        user_email: user.email,
        type: 'referral_bonus',
        points: REFERRAL_BONUS,
        description: `Used referral code ${code}`,
        related_referral_code: code,
      }),
      base44.entities.PointsTransaction.create({
        user_email: ownerProfile.user_email,
        type: 'referral_bonus',
        points: REFERRAL_BONUS,
        description: 'Friend used your referral code',
        related_referral_code: code,
      }),
    ]);

    setProfile(updated);
    setApplyMsg({ text: 'Applied. You and your friend both got 1,000 points.', type: 'success' });
    setInputCode('');
    setApplying(false);
    base44.entities.PointsTransaction.filter({ user_email: user.email, type: 'referral_bonus' }, '-created_date', 20)
      .then(setReferralHistory);
  }

  return (
    <div className="min-h-screen px-4 pt-12 pb-6 font-inter" style={{ background: ' #08080C' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ background: theme.bgGlow, position: 'absolute', inset: 0 }} />
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-7 relative z-10">
        <p className="text-label mb-1">NEONVALLEY</p>
        <h1 className="text-[26px] font-space font-bold text-white tracking-tight">Invite the Crew</h1>
        <p className="text-[13px] mt-0.5" style={{ color: ' rgba(255,255,255,0.4)' }}>
          Share your code. When a friend uses it, you both get 1,000 points.
        </p>
      </motion.div>

      {/* party! banner — only if not used */}
      <AnimatePresence>
        {!referralUsed && !loading && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl p-4 mb-5 flex items-center gap-3 relative z-10"
            style={{ background: ' rgba(74,222,128,0.06)', border: '1px solid  rgba(74,222,128,0.16)' }}>
            <Zap size={14} style={{ color: ' #4ade80' }} />
            <div>
              <p className="text-[13px] font-space font-semibold text-white">No referral code?</p>
              <p className="text-[12px] mt-0.5" style={{ color: ' rgba(255,255,255,0.5)' }}>
                Use <span className="font-mono font-bold text-white">party!</span> for 1,000 free points.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Your Referral Code card */}
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.08 }}
        className="rounded-3xl p-6 mb-5 relative overflow-hidden text-center gradient-border-subtle z-10 card-glass-elevated">
        <div className="relative z-10">
          <p className="text-label mb-4">Your Referral Code</p>

          <div className="inline-block px-8 py-4 rounded-2xl mb-4"
            style={{ background: ' rgba(255,255,255,0.06)', border: '1px solid  rgba(255,255,255,0.14)' }}>
            <p className="text-[38px] font-space font-bold tracking-[0.1em] text-white">
              {loading ? '…' : myCode}
            </p>
          </div>
          <p className="text-[12px] mb-6" style={{ color: ' rgba(255,255,255,0.35)' }}>Share this code with your crew</p>

          <div className="flex gap-2.5">
            <button onClick={handleCopy}
              className="flex-1 h-12 flex items-center justify-center gap-2 rounded-[14px] font-space font-semibold text-[14px] transition-all btn-secondary">
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button onClick={handleShare}
              className="flex-1 h-12 flex items-center justify-center gap-2 rounded-[14px] font-space font-semibold text-[14px] transition-all active:scale-[0.98]"
              style={{ background: theme.gradient, color: ' #fff', boxShadow: `0 6px 20px ${theme.glow}` }}>
              <Share2 size={15} />
              Share
            </button>
          </div>
        </div>
      </motion.div>

      {/* Use a code — only if not used */}
      <AnimatePresence>
        {!referralUsed && !loading && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="card-subtle rounded-2xl p-5 mb-5 relative z-10">
            <p className="text-[14px] font-space font-semibold text-white mb-1">Use a Referral Code</p>
            <p className="text-[12px] mb-4" style={{ color: ' rgba(255,255,255,0.35)' }}>You can only use one referral code. Also accepts: party!</p>

            <AnimatePresence>
              {applyMsg && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded-xl px-4 py-2.5 mb-3 text-[13px] font-space font-semibold"
                  style={{
                    background: applyMsg.type === 'success' ? ' rgba(74,222,128,0.08)' : ' rgba(239,68,68,0.08)',
                    border: `1px solid ${applyMsg.type === 'success' ? ' rgba(74,222,128,0.22)' : ' rgba(239,68,68,0.22)'}`,
                    color: applyMsg.type === 'success' ? ' #4ade80' : ' #f87171',
                  }}>
                  {applyMsg.text}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <input type="text" value={inputCode}
                onChange={e => { setInputCode(e.target.value); setApplyMsg(null); }}
                onKeyDown={e => e.key === 'Enter' && handleApplyCode()}
                placeholder="Enter referral code"
                className="flex-1 px-4 py-3 rounded-xl text-[14px] font-mono text-white placeholder-white/20 outline-none"
                style={{ background: ' rgba(255,255,255,0.06)', border: '1px solid  rgba(255,255,255,0.10)' }} />
              <button onClick={handleApplyCode} disabled={applying || !inputCode.trim()}
                className="px-5 py-3 rounded-xl font-space font-semibold text-[14px] transition-all"
                style={{
                  background: inputCode.trim() ? theme.primary : ' rgba(255,255,255,0.06)',
                  color: inputCode.trim() ? ' #000' : ' rgba(255,255,255,0.2)',
                }}>
                {applying ? '…' : 'Apply'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Used code confirmation */}
      {referralUsed && profile?.referred_by_code && (
        <div className="rounded-2xl px-4 py-3 mb-5 flex items-center gap-3 relative z-10"
          style={{ background: ' rgba(74,222,128,0.05)', border: '1px solid  rgba(74,222,128,0.14)' }}>
          <Check size={14} style={{ color: ' #4ade80' }} />
          <p className="text-[13px] font-inter" style={{ color: ' rgba(255,255,255,0.55)' }}>
            You used code <span className="font-mono font-bold text-white">{profile.referred_by_code}</span> — +1,000 points.
          </p>
        </div>
      )}

      {/* Referral History */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-space font-semibold text-white">Referral History</h2>
          <Users size={14} color=" rgba(255,255,255,0.2)" />
        </div>

        {referralHistory.length === 0 ? (
          <div className="card-subtle rounded-2xl p-8 text-center">
            <Users size={24} className="mx-auto mb-3" color=" rgba(255,255,255,0.15)" />
            <p className="text-[14px] font-space font-medium mb-1" style={{ color: ' rgba(255,255,255,0.35)' }}>No referrals yet.</p>
            <p className="text-[12px] font-inter leading-relaxed" style={{ color: ' rgba(255,255,255,0.2)' }}>Invite friends and start earning Party Points.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {referralHistory.map(txn => (
              <div key={txn.id} className="card-subtle rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: ' rgba(74,222,128,0.08)' }}>
                    <Users size={13} style={{ color: ' #4ade80' }} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[13px] font-space font-medium text-white">{txn.description}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: ' rgba(255,255,255,0.3)' }}>
                      {new Date(txn.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <span className="text-[14px] font-space font-bold" style={{ color: ' #4ade80' }}>
                  +{(txn.points || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
