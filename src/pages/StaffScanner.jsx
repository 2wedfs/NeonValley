import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, CheckCircle, User, XCircle, Shield, Star, Ticket, AlertTriangle, Camera, ArrowLeft } from 'lucide-react';
import QRScanner from '@/components/QRScanner';
import { base44 } from '@/api/base44Client';
import { getTierInfo } from '@/hooks/useUserProfile';
import { getMembershipTier } from '@/lib/theme';
import { detectScanType, calcPoints } from '@/lib/ticketUtils';

const SESSION_NAME = 'Bay Area Check-In';

function getAutoEntry() {
  const hour = new Date().getHours();
  if (hour < 22) return { label: 'Before 10 PM', amount: 10 };
  return { label: 'After 10 PM', amount: 20 };
}

export default function StaffScanner() {
  const [staffUser, setStaffUser] = useState(null);
  const [scanInput, setScanInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [loadingCheckins, setLoadingCheckins] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [memberPreview, setMemberPreview] = useState(null);
  const [rewardPreview, setRewardPreview] = useState(null);
  const [ticketPreview, setTicketPreview] = useState(null);
  const [successScreen, setSuccessScreen] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setStaffUser).catch(() => {});
    loadRecentCheckins();
    if (inputRef.current) inputRef.current.focus();
  }, []);

  function loadRecentCheckins() {
    base44.entities.CheckIn.list('-created_date', 30)
      .then(setRecentCheckins)
      .finally(() => setLoadingCheckins(false));
  }

  async function handleScanCode(rawCode) {
    const raw = rawCode.trim();
    if (!raw) return;
    setScanning(true);
    setScanError('');
    setMemberPreview(null);
    setRewardPreview(null);
    setTicketPreview(null);
    setSuccessScreen(null);

    const codeType = detectScanType(raw);
    if (codeType === 'ticket') await handleTicketScan(raw.toUpperCase());
    else if (codeType === 'reward') await handleRewardScan(raw.toUpperCase());
    else await handleMemberScan(raw.toUpperCase(), codeType !== 'member');
    setScanning(false);
  }

  async function handleScan() { await handleScanCode(scanInput); }

  async function handleTicketScan(code) {
    const tickets = await base44.entities.Ticket.filter({ ticket_barcode: code });
    if (tickets.length === 0) { setScanError('Ticket not found.'); return; }
    const ticket = tickets[0];
    const profiles = await base44.entities.UserProfile.filter({ user_email: ticket.user_email });
    setTicketPreview({ ticket, profile: profiles[0] || null });
  }

  async function handleMemberScan(code, fallback = false) {
    let profiles = await base44.entities.UserProfile.filter({ member_id: code });
    if (profiles.length === 0) profiles = await base44.entities.UserProfile.filter({ qr_code_value: code });
    if (profiles.length === 0) {
      setScanError(fallback ? 'Invalid NeonValley code. Scan a Member Pass, Ticket, or Reward barcode.' : 'Member pass not found.');
      return;
    }
    const profile = profiles[0];
    const entry = getAutoEntry();
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const existing = await base44.entities.CheckIn.filter({ user_email: profile.user_email, session_name: SESSION_NAME }, '-created_date', 10);
    const todayIn = existing.filter(c => new Date(c.check_in_time || c.created_date) >= todayStart);
    setMemberPreview({ profile, entry, alreadyIn: todayIn.length > 0 });
  }

  async function handleRewardScan(code) {
    const redemptions = await base44.entities.RewardRedemption.filter({ barcode_value: code });
    if (redemptions.length === 0) { setScanError('Invalid reward barcode.'); return; }
    const redemption = redemptions[0];
    if (redemption.status === 'used')    { setScanError('This reward was already used.'); return; }
    if (redemption.status === 'cancelled') { setScanError('This reward has been cancelled.'); return; }
    if (redemption.status === 'expired' || (redemption.expires_at && new Date(redemption.expires_at) < new Date())) {
      setScanError('This reward has expired.'); return;
    }
    const profiles = await base44.entities.UserProfile.filter({ user_email: redemption.user_email });
    setRewardPreview({ redemption, profile: profiles[0] || null });
  }

  async function confirmMemberCheckIn() {
    if (!memberPreview || !staffUser) return;
    setConfirming(true);
    const { profile, entry } = memberPreview;
    const pts = calcPoints(entry.amount);
    const currentRedeemable = profile.redeemable_points ?? profile.points_balance ?? 0;
    const currentLifetime = profile.total_lifetime_points ?? profile.total_points_earned ?? 0;
    const newRedeemable = currentRedeemable + pts;
    const newLifetime = currentLifetime + pts;
    const newVisits = (profile.visit_count || 0) + 1;
    const newTier = getMembershipTier(newLifetime);
    const userName = profile.full_name || profile.user_email;

    await Promise.all([
      base44.entities.UserProfile.update(profile.id, {
        redeemable_points: newRedeemable,
        total_lifetime_points: newLifetime,
        points_balance: newRedeemable,
        total_points_earned: newLifetime,
        visit_count: newVisits,
        membership_tier: newTier,
        neon_status: newTier + ' Member',
      }),
      base44.entities.CheckIn.create({
        user_email: profile.user_email,
        user_name: userName,
        member_id: profile.member_id,
        qr_code_value: profile.qr_code_value,
        scan_type: 'member_pass',
        entry_type: 'paid_entry',
        amount_paid: entry.amount,
        points_earned: pts,
        staff_id: staffUser.id,
        staff_email: staffUser.email,
        staff_name: staffUser.full_name || staffUser.email,
        event_title: SESSION_NAME,
        session_name: SESSION_NAME,
        check_in_time: new Date().toISOString(),
      }),
      base44.entities.PointsTransaction.create({
        user_email: profile.user_email,
        type: 'check_in',
        points: pts,
        description: `${SESSION_NAME} — ${entry.label} — $${entry.amount} paid at door`,
      }),
    ]);

    setSuccessScreen({
      title: 'Entry Confirmed',
      subtitle: 'Points have been added.',
      details: [
        { label: 'Member',    val: userName },
        { label: 'Amount',    val: `$${entry.amount}` },
        { label: 'Points',    val: `+${pts.toLocaleString()} pts` },
        { label: 'New Total', val: newRedeemable.toLocaleString() + ' pts' },
        { label: 'Tier',      val: getMembershipTier(newLifetime) },
      ],
    });
    reset(); loadRecentCheckins();
    setTimeout(() => setSuccessScreen(null), 3000);
    setConfirming(false);
  }

  async function confirmTicketEntry() {
    if (!ticketPreview || !staffUser) return;
    const { ticket, profile } = ticketPreview;
    if (ticket.ticket_status === 'used')      { setScanError('This ticket was already used.');   setTicketPreview(null); return; }
    if (ticket.ticket_status === 'refunded')  { setScanError('This ticket was refunded.');        setTicketPreview(null); return; }
    if (ticket.ticket_status === 'cancelled' || ticket.ticket_status === 'expired') {
      setScanError('This ticket is not valid.'); setTicketPreview(null); return;
    }
    setConfirming(true);
    const now = new Date().toISOString();
    const userName = ticket.user_name || ticket.user_email;
    await Promise.all([
      base44.entities.Ticket.update(ticket.id, { ticket_status: 'used', used_at: now }),
      base44.entities.CheckIn.create({
        user_email: ticket.user_email,
        user_name: userName,
        member_id: profile?.member_id || '',
        scan_type: 'member_pass',
        entry_type: 'paid_entry',
        amount_paid: ticket.final_amount_paid || 0,
        points_earned: 0,
        reward_name: 'App Ticket — points awarded at purchase',
        staff_id: staffUser.id,
        staff_email: staffUser.email,
        staff_name: staffUser.full_name || staffUser.email,
        event_title: ticket.event_name || SESSION_NAME,
        session_name: SESSION_NAME,
        check_in_time: now,
      }),
    ]);
    setSuccessScreen({
      title: 'Ticket Confirmed',
      subtitle: 'Entry approved.',
      details: [
        { label: 'Member', val: userName },
        { label: 'Event',  val: ticket.event_name || '—' },
        { label: 'Status', val: 'Used' },
        { label: 'Paid',   val: `$${(ticket.final_amount_paid || 0).toFixed(2)}` },
      ],
    });
    reset(); loadRecentCheckins();
    setTimeout(() => setSuccessScreen(null), 3000);
    setConfirming(false);
  }

  async function confirmRewardUse() {
    if (!rewardPreview || !staffUser) return;
    setConfirming(true);
    const { redemption, profile } = rewardPreview;
    const userName = redemption.user_name || redemption.user_email;
    await Promise.all([
      base44.entities.RewardRedemption.update(redemption.id, {
        status: 'used',
        used_at: new Date().toISOString(),
        used_by_staff_id: staffUser.id,
        used_by_staff_name: staffUser.full_name || staffUser.email,
        session_name: SESSION_NAME,
      }),
      base44.entities.CheckIn.create({
        user_email: redemption.user_email,
        user_name: userName,
        member_id: profile?.member_id || '',
        scan_type: 'reward_redemption',
        entry_type: 'free_ticket',
        amount_paid: 0,
        points_earned: 0,
        reward_redemption_id: redemption.id,
        reward_name: redemption.reward_name,
        staff_id: staffUser.id,
        staff_email: staffUser.email,
        staff_name: staffUser.full_name || staffUser.email,
        event_title: SESSION_NAME,
        session_name: SESSION_NAME,
        check_in_time: new Date().toISOString(),
      }),
    ]);
    setSuccessScreen({
      title: 'Reward Applied',
      subtitle: 'Entry approved. No points added for free entry.',
      details: [
        { label: 'Member', val: userName },
        { label: 'Reward', val: redemption.reward_name },
        { label: 'Status', val: 'Used' },
      ],
    });
    reset(); loadRecentCheckins();
    setTimeout(() => setSuccessScreen(null), 3000);
    setConfirming(false);
  }

  function reset() {
    setMemberPreview(null); setRewardPreview(null); setTicketPreview(null);
    setScanInput(''); setScanError('');
    if (inputRef.current) inputRef.current.focus();
  }

  const todayCheckins = recentCheckins.filter(c =>
    new Date(c.check_in_time || c.created_date).toDateString() === new Date().toDateString()
  );
  const ptsToday = todayCheckins.reduce((acc, c) => acc + (c.points_earned || 0), 0);

  return (
    <div className="min-h-screen px-4 pt-12 pb-10 font-inter" style={{ background: ' #08080C' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center card-subtle">
            <Shield size={13} color=" rgba(255,255,255,0.6)" strokeWidth={1.8} />
          </div>
          <span className="text-label">Staff Portal</span>
        </div>
        <h1 className="text-[24px] font-space font-bold text-white tracking-tight">Check-In Scanner</h1>
        <p className="text-[12px] mt-0.5" style={{ color: ' rgba(255,255,255,0.35)' }}>
          {staffUser ? staffUser.full_name || staffUser.email : 'Loading…'}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Check-Ins Today',  value: todayCheckins.length.toString() },
          { label: 'Points Awarded',   value: ptsToday.toLocaleString(), unit: 'pts' },
        ].map(s => (
          <div key={s.label} className="card-subtle rounded-2xl p-4">
            <p className="text-label mb-1">{s.label}</p>
            <p className="text-[28px] font-space font-bold text-white leading-none">{s.value}</p>
            {s.unit && <p className="text-[11px] mt-0.5" style={{ color: ' rgba(255,255,255,0.3)' }}>{s.unit}</p>}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showCamera && (
          <QRScanner
            onScan={code => { setShowCamera(false); setScanInput(code); handleScanCode(code); }}
            onClose={() => setShowCamera(false)}
          />
        )}
      </AnimatePresence>

      {/* Success Screen */}
      <AnimatePresence>
        {successScreen && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="card-glass rounded-2xl p-6 mb-5"
            style={{ border: '1px solid  rgba(74,222,128,0.25)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: ' rgba(74,222,128,0.12)' }}>
                <CheckCircle size={20} style={{ color: ' #4ade80' }} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-[16px] font-space font-bold text-white">{successScreen.title}</p>
                <p className="text-[12px]" style={{ color: ' rgba(255,255,255,0.45)' }}>{successScreen.subtitle}</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {successScreen.details.map(d => (
                <div key={d.label} className="flex justify-between text-[13px]">
                  <span style={{ color: ' rgba(255,255,255,0.4)' }}>{d.label}</span>
                  <span className="font-space font-semibold text-white">{d.val}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSuccessScreen(null)}
              className="w-full h-11 rounded-[14px] font-space font-semibold text-[14px] flex items-center justify-center gap-2 btn-secondary">
              <ArrowLeft size={14} /> Back to Scanner
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanner Input */}
      <div className="card-subtle rounded-2xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Scan size={14} color=" rgba(255,255,255,0.55)" strokeWidth={1.8} />
          <p className="text-[14px] font-space font-semibold text-white">Scan Code</p>
        </div>
        <p className="text-[11px] mb-4" style={{ color: ' rgba(255,255,255,0.3)' }}>
          Accepts: Member Pass · NV-TICKET-… · NV-REWARD-…
        </p>
        <div className="flex gap-2">
          <input ref={inputRef} type="text" value={scanInput}
            onChange={e => setScanInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
            placeholder="Scan or type code…"
            className="flex-1 px-4 py-3 rounded-xl text-[14px] font-mono text-white placeholder-white/20 outline-none"
            style={{ background: ' rgba(255,255,255,0.06)', border: '1px solid  rgba(255,255,255,0.10)' }} />
          <button onClick={() => setShowCamera(true)}
            className="px-4 py-3 rounded-xl transition-all btn-secondary">
            <Camera size={17} />
          </button>
          <button onClick={handleScan} disabled={scanning || !scanInput.trim()}
            className="px-5 py-3 rounded-xl font-space font-semibold text-[14px] transition-all"
            style={{
              background: scanInput.trim() ? ' #fff' : ' rgba(255,255,255,0.06)',
              color: scanInput.trim() ? ' #000' : ' rgba(255,255,255,0.2)',
            }}>
            {scanning ? '…' : 'Scan'}
          </button>
        </div>
        {scanError && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded-xl"
            style={{ background: ' rgba(239,68,68,0.07)', border: '1px solid  rgba(239,68,68,0.18)' }}>
            <XCircle size={13} style={{ color: ' #f87171' }} strokeWidth={1.8} />
            <p className="text-[12px] font-inter" style={{ color: ' #f87171' }}>{scanError}</p>
          </div>
        )}
      </div>

      {/* Ticket Preview */}
      <AnimatePresence>
        {ticketPreview && (() => {
          const { ticket, profile } = ticketPreview;
          const isUsed = ticket.ticket_status === 'used';
          const isRefunded = ticket.ticket_status === 'refunded';
          const isInvalid = ticket.ticket_status === 'cancelled' || ticket.ticket_status === 'expired';
          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="card-glass rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-1.5 mb-4">
                <Ticket size={12} color=" rgba(255,255,255,0.35)" strokeWidth={1.8} />
                <span className="text-label">App Ticket</span>
              </div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 card-subtle">
                  <Ticket size={18} color=" rgba(255,255,255,0.55)" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[16px] font-space font-bold text-white">{ticket.user_name || ticket.user_email}</p>
                  <p className="text-[12px]" style={{ color: ' rgba(255,255,255,0.4)' }}>{ticket.user_email}</p>
                  <p className="text-[13px] font-space font-medium mt-1 text-white">{ticket.event_name}</p>
                </div>
              </div>
              <div className="card-subtle rounded-xl p-4 mb-4 grid grid-cols-2 gap-3">
                {[
                  { label: 'Amount Paid',   val: `$${(ticket.final_amount_paid || 0).toFixed(2)}` },
                  { label: 'Points',        val: `${(ticket.points_awarded || 0).toLocaleString()} pts` },
                  { label: 'Payment',       val: ticket.payment_status === 'paid' ? 'Confirmed' : ticket.payment_status },
                  { label: 'Ticket Status', val: ticket.ticket_status },
                ].map(row => (
                  <div key={row.label}>
                    <p className="text-label mb-0.5">{row.label}</p>
                    <p className="text-[13px] font-space font-semibold text-white capitalize">{row.val}</p>
                  </div>
                ))}
              </div>
              {isUsed && (
                <div className="rounded-xl p-3 mb-4 text-center"
                  style={{ background: ' rgba(251,191,36,0.08)', border: '1px solid  rgba(251,191,36,0.2)' }}>
                  <p className="text-[13px] font-space font-semibold" style={{ color: ' #fbbf24' }}>This ticket was already used.</p>
                </div>
              )}
              {isRefunded && (
                <div className="rounded-xl p-3 mb-4 text-center"
                  style={{ background: ' rgba(239,68,68,0.07)', border: '1px solid  rgba(239,68,68,0.18)' }}>
                  <p className="text-[13px] font-space font-semibold" style={{ color: ' #f87171' }}>This ticket was refunded and is not valid.</p>
                </div>
              )}
              {!isUsed && !isRefunded && !isInvalid && (
                <button onClick={confirmTicketEntry} disabled={confirming}
                  className="w-full h-12 rounded-[14px] font-space font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg,  #4ade80,  #22c55e)', color: ' #000', opacity: confirming ? 0.6 : 1 }}>
                  <CheckCircle size={16} /> {confirming ? 'Processing…' : 'Mark Used — Grant Entry'}
                </button>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Member Pass Preview */}
      <AnimatePresence>
        {memberPreview && (() => {
          const { profile, entry, alreadyIn } = memberPreview;
          const fTier = getTierInfo(profile.total_lifetime_points || profile.total_points_earned || 0);
          const pts = calcPoints(entry.amount);
          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="card-glass rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-1.5 mb-4">
                <User size={12} color=" rgba(255,255,255,0.35)" strokeWidth={1.8} />
                <span className="text-label">Member Pass — Pay at Door</span>
              </div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 card-subtle">
                  <User size={18} color=" rgba(255,255,255,0.55)" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[16px] font-space font-bold text-white">{profile.full_name || profile.user_email}</p>
                  <p className="text-[12px]" style={{ color: ' rgba(255,255,255,0.4)' }}>{profile.user_email}</p>
                  <p className="text-[11px] font-mono mt-0.5" style={{ color: ' rgba(255,255,255,0.25)' }}>{profile.member_id}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Star size={10} color=" rgba(255,255,255,0.4)" />
                    <span className="text-[11px] font-space" style={{ color: ' rgba(255,255,255,0.55)' }}>{fTier.name}</span>
                  </div>
                </div>
              </div>

              {alreadyIn && (
                <div className="rounded-xl p-3 mb-4 flex items-center gap-2"
                  style={{ background: ' rgba(251,191,36,0.07)', border: '1px solid  rgba(251,191,36,0.2)' }}>
                  <AlertTriangle size={13} style={{ color: ' #fbbf24' }} strokeWidth={1.8} />
                  <p className="text-[13px] font-space font-semibold" style={{ color: ' #fbbf24' }}>Already checked in today.</p>
                </div>
              )}

              {!alreadyIn && (
                <div className="card-subtle rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-space font-semibold text-white">{entry.label}</p>
                      <p className="text-[12px] mt-0.5" style={{ color: ' rgba(255,255,255,0.4)' }}>100 pts per $1 paid</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[32px] font-space font-bold text-white">${entry.amount}</p>
                      <p className="text-[12px] font-space font-semibold" style={{ color: ' #4ade80' }}>+{pts.toLocaleString()} pts</p>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={confirmMemberCheckIn} disabled={confirming || alreadyIn}
                className="w-full h-12 rounded-[14px] font-space font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{
                  background: alreadyIn ? ' rgba(255,255,255,0.05)' : 'linear-gradient(135deg,  #4ade80,  #22c55e)',
                  color: alreadyIn ? ' rgba(255,255,255,0.3)' : ' #000',
                  border: alreadyIn ? '1px solid  rgba(255,255,255,0.08)' : 'none',
                  opacity: confirming ? 0.6 : 1,
                }}>
                <CheckCircle size={16} />
                {confirming ? 'Processing…' : alreadyIn ? 'Already Checked In' : 'Confirm Entry + Award Points'}
              </button>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Reward Preview */}
      <AnimatePresence>
        {rewardPreview && (() => {
          const { redemption, profile } = rewardPreview;
          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="card-glass rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-1.5 mb-4">
                <Ticket size={12} color=" rgba(255,255,255,0.35)" strokeWidth={1.8} />
                <span className="text-label">Reward Redemption</span>
              </div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 card-subtle">
                  <Ticket size={18} color=" rgba(255,255,255,0.55)" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[16px] font-space font-bold text-white">{redemption.user_name || redemption.user_email}</p>
                  <p className="text-[12px]" style={{ color: ' rgba(255,255,255,0.4)' }}>{redemption.user_email}</p>
                  <p className="text-[13px] font-space font-medium mt-1 text-white">{redemption.reward_name}</p>
                </div>
              </div>
              <div className="card-subtle rounded-xl p-3 mb-4"
                style={{ background: ' rgba(251,191,36,0.06)', borderColor: ' rgba(251,191,36,0.15)' }}>
                <p className="text-[12px] font-inter" style={{ color: ' rgba(255,255,255,0.5)' }}>
                  Free ticket redemptions earn <strong className="text-white">0 Party Points</strong>. Entry is covered by the reward.
                </p>
              </div>
              <button onClick={confirmRewardUse} disabled={confirming}
                className="w-full h-12 rounded-[14px] font-space font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg,  #4ade80,  #22c55e)', color: ' #000', opacity: confirming ? 0.6 : 1 }}>
                <Ticket size={16} /> {confirming ? 'Processing…' : 'Apply Reward — Grant Entry'}
              </button>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Recent Check-Ins */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-space font-semibold text-white">Recent Check-Ins</h2>
          <span className="text-label">{recentCheckins.length} total</span>
        </div>
        {loadingCheckins ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-transparent rounded-full animate-spin border-t-white/40" />
          </div>
        ) : recentCheckins.length === 0 ? (
          <div className="card-subtle rounded-2xl p-8 text-center">
            <p className="text-[13px] font-inter" style={{ color: ' rgba(255,255,255,0.25)' }}>No scans yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentCheckins.slice(0, 15).map(c => {
              const isFree = c.entry_type === 'free_ticket';
              return (
                <div key={c.id} className="card-subtle rounded-xl px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: ' rgba(255,255,255,0.05)' }}>
                      {isFree
                        ? <Ticket size={13} color=" rgba(255,255,255,0.4)" strokeWidth={1.8} />
                        : <User size={13} color=" rgba(255,255,255,0.4)" strokeWidth={1.8} />
                      }
                    </div>
                    <div>
                      <p className="text-[13px] font-space font-medium text-white">{c.user_name || c.user_email}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: ' rgba(255,255,255,0.3)' }}>
                        {isFree ? 'Free Ticket' : `$${c.amount_paid}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-space font-semibold text-white">
                      {isFree ? 'FREE' : `+${(c.points_earned || 0).toLocaleString()}`}
                    </p>
                    <p className="text-[10px]" style={{ color: ' rgba(255,255,255,0.25)' }}>
                      {c.check_in_time ? new Date(c.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
