import { motion } from 'framer-motion';
import { useUserProfile, getTierInfo } from '@/hooks/useUserProfile';
import { getTheme } from '@/lib/theme';
import { Zap, Star, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const ALL_TIERS = [
  { name: 'Neon Newbie',          pts: '0–9,999' },
  { name: 'Rhythm Rider',         pts: '10K–99,999' },
  { name: 'Boogie Boss',          pts: '100K–499,999' },
  { name: 'Certified Toe-Tapper', pts: '500K+' },
];

const HOW_IT_WORKS = [
  'Open your NeonValley Pass',
  'Pay entry at the door',
  'Staff scans your pass',
  'Earn 100 Party Points per $1',
  'Level up your membership',
];

export default function Scan() {
  const { user, profile, loading } = useUserProfile();
  const theme = getTheme(profile?.selected_theme);
  const lifetime   = profile?.total_lifetime_points ?? profile?.total_points_earned ?? 0;
  const redeemable = profile?.redeemable_points ?? profile?.points_balance ?? 0;
  const tier       = getTierInfo(lifetime);
  const memberId   = profile?.member_id ?? '—';
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Member';
  const qrValue    = profile?.qr_code_value || profile?.member_id || `NEONVALLEY-PASS-${profile?.id || 'loading'}`;

  const progress = tier.next
    ? Math.min(100, (lifetime - tier.floor) / (tier.nextPts - tier.floor) * 100)
    : 100;
  const ptsToNext = tier.next ? tier.nextPts - lifetime : 0;

  return (
    <div className="min-h-screen px-4 pt-12 pb-8 font-inter" style={{ background: '#08080C' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ background: theme.bgGlow, position: 'absolute', inset: 0 }} />
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center relative z-10">
        <p className="text-label mb-2">Member Pass</p>
        <h1 className="text-[26px] font-space font-bold text-white tracking-tight">NeonValley Pass</h1>
        <p className="text-[13px] mt-1" style={{ color: ' rgba(255,255,255,0.38)' }}>Your digital check-in pass</p>
      </motion.div>

      {/* Main Pass Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="rounded-3xl mb-5 relative overflow-hidden gradient-border-subtle z-10"
        style={{
          background: ' rgba(255,255,255,0.07)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          boxShadow: '0 24px 70px  rgba(0,0,0,0.6)',
        }}>

        {/* Top band */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid  rgba(255,255,255,0.07)' }}>
          <div>
            <p className="text-[11px] font-space font-bold tracking-[0.18em] uppercase text-white opacity-80">NEONVALLEY</p>
            <p className="text-[10px] mt-0.5" style={{ color: ' rgba(255,255,255,0.3)' }}>Digital Member Pass · 18+</p>
          </div>
          <div className="flex items-center gap-1.5 badge-active">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-green-400" />
            <span>Active</span>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center py-6 px-6">
          <div className="rounded-2xl p-4 bg-white"
            style={{ boxShadow: '0 8px 32px  rgba(0,0,0,0.5)' }}>
            {loading ? (
              <div className="flex items-center justify-center" style={{ width: 180, height: 180 }}>
                <div className="w-7 h-7 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
              </div>
            ) : (
              <QRCodeSVG value={qrValue} size={180} bgColor=" #ffffff" fgColor=" #000000" level="M" includeMargin={false} />
            )}
          </div>
        </div>

        {/* Member info */}
        <div className="px-6 pb-5 text-center">
          <p className="text-[19px] font-space font-bold text-white">{loading ? '…' : displayName}</p>
          <p className="text-[11px] font-mono mt-0.5 tracking-wider" style={{ color: ' rgba(255,255,255,0.35)' }}>
            {loading ? '…' : memberId}
          </p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: ' rgba(255,255,255,0.07)', border: '1px solid  rgba(255,255,255,0.12)' }}>
              <Star size={11} style={{ color: theme.primary }} />
              <span className="text-[12px] font-space font-semibold text-white">{tier.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={12} style={{ color: theme.primary }} />
              <span className="text-[13px] font-space font-semibold" style={{ color: theme.primary }}>
                {loading ? '—' : redeemable.toLocaleString()} pts
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mx-5 mb-5 rounded-2xl px-4 py-3 text-center"
          style={{ background: ' rgba(255,255,255,0.04)', border: '1px solid  rgba(255,255,255,0.07)' }}>
          <p className="text-[13px] font-inter" style={{ color: ' rgba(255,255,255,0.55)' }}>
            Show this pass when paying at the door.
          </p>
          <p className="text-[12px] mt-1" style={{ color: theme.primary }}>
            Staff will scan your pass to add your points.
          </p>
        </div>
      </motion.div>

      {/* Status card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="card-glass rounded-2xl p-5 mb-4 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] font-space font-semibold text-white">Your Status</p>
          <span className="text-[12px] font-space font-semibold px-2.5 py-1 rounded-full"
            style={{ background: `${theme.primary}14`, color: theme.primary, border: `1px solid ${theme.primary}28` }}>
            {tier.name}
          </span>
        </div>

        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[36px] font-space font-bold text-white leading-none">{redeemable.toLocaleString()}</p>
            <p className="text-label mt-1">Party Points</p>
          </div>
          <div className="text-right">
            {tier.next && <p className="text-[12px]" style={{ color: ' rgba(255,255,255,0.35)' }}>{ptsToNext.toLocaleString()} pts to {tier.next}</p>}
          </div>
        </div>

        <div className="w-full h-1.5 rounded-full mb-4" style={{ background: ' rgba(255,255,255,0.08)' }}>
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            transition={{ duration: 1, delay: 0.4 }}
            className="h-full rounded-full"
            style={{ background: theme.gradient }} />
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {ALL_TIERS.map(t => {
            const isCurrent = t.name === tier.name;
            const isPast = lifetime >= { 'Neon Newbie': 0, 'Rhythm Rider': 10000, 'Boogie Boss': 100000, 'Certified Toe-Tapper': 500000 }[t.name];
            return (
              <div key={t.name} className="rounded-xl p-2 text-center"
                style={{
                  background: isCurrent ? `${theme.primary}10` : ' rgba(255,255,255,0.03)',
                  border: `1px solid ${isCurrent ? theme.primary + '28' : ' rgba(255,255,255,0.06)'}`,
                }}>
                <p className="text-[9px] font-space font-semibold leading-tight"
                  style={{ color: isPast ? ' rgba(255,255,255,0.75)' : ' rgba(255,255,255,0.2)' }}>{t.name}</p>
                <p className="text-[8px] mt-0.5" style={{ color: ' rgba(255,255,255,0.25)' }}>{t.pts}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="card-subtle rounded-2xl p-5 relative z-10">
        <p className="text-[14px] font-space font-semibold text-white mb-4">How It Works</p>
        <div className="space-y-3">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-space font-bold flex-shrink-0"
                style={{ background: `${theme.primary}12`, color: theme.primary, border: `1px solid ${theme.primary}28` }}>
                {i + 1}
              </div>
              <p className="text-[13px] font-inter" style={{ color: ' rgba(255,255,255,0.65)' }}>{step}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-center font-inter mt-4" style={{ color: ' rgba(255,255,255,0.3)' }}>
          Earn 100 Party Points per $1 spent. Points are based on what you actually pay.
        </p>
      </motion.div>
    </div>
  );
}
