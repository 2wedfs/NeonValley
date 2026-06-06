import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, QrCode, X, CheckCircle, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useUserProfile, getTierInfo } from '@/hooks/useUserProfile';
import { getTheme } from '@/lib/theme';
import { isRefundEligible, calcPoints } from '@/lib/ticketUtils';
import { QRCodeSVG } from 'qrcode.react';
import { getMembershipTier } from '@/lib/theme';

const STATUS_CONFIG = {
  active: { label: 'Active', color: '#39FF14', bg: 'rgba(57,255,20,0.08)' },
  used: { label: 'Used', color: '#888', bg: 'rgba(255,255,255,0.04)' },
  refunded: { label: 'Refunded', color: '#FF3C3C', bg: 'rgba(255,60,60,0.06)' },
  expired: { label: 'Expired', color: '#FF8C00', bg: 'rgba(255,140,0,0.06)' },
  cancelled: { label: 'Cancelled', color: '#888', bg: 'rgba(255,255,255,0.04)' },
};

function TicketQRModal({ ticket, onClose, theme }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.92)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
        className="rounded-3xl p-6 w-full max-w-sm"
        style={{ background: '#0D0D0D', border: `1.5px solid ${theme.primary}40` }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-base font-space font-bold text-white">{ticket.event_name}</p>
            <p className="text-xs text-white/40 font-inter mt-0.5">App RSVP Ticket</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <X size={14} color="white" />
          </button>
        </div>
        <div className="flex justify-center mb-4">
          <div className="rounded-2xl p-4 bg-white" style={{ boxShadow: `0 0 40px ${theme.primary}30` }}>
            <QRCodeSVG value={ticket.ticket_barcode} size={200} bgColor="#ffffff" fgColor="#000000" level="M" />
          </div>
        </div>
        <p className="text-center text-xs font-mono text-white/35 mb-4">{ticket.ticket_barcode}</p>
        <div className="rounded-xl p-3 text-center" style={{ background: `${theme.primary}08`, border: `1px solid ${theme.primary}20` }}>
          <p className="text-xs font-space font-semibold" style={{ color: theme.primary }}>
            Show this to staff at the door.
          </p>
          <p className="text-[10px] text-white/30 font-inter mt-1">
            Paid: ${ticket.final_amount_paid?.toFixed(2)} · {ticket.points_awarded?.toLocaleString()} pts earned
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MyTickets() {
  const { user, profile } = useUserProfile();
  const theme = getTheme(profile?.selected_theme);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(null);
  const [refunding, setRefunding] = useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');

  function showMsg(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function loadTickets() {
    if (!user?.email) return;
    const all = await base44.entities.Ticket.filter({ user_email: user.email }, '-created_date', 50);
    setTickets(all);
    setLoading(false);
  }

  useEffect(() => { if (user?.email) loadTickets(); }, [user?.email]);

  async function handleRefund(ticket) {
    if (!isRefundEligible(ticket)) {
      showMsg('Refunds are only available until 24 hours before the event starts.', 'error');
      return;
    }
    setRefunding(ticket.id);
    try {
      const now = new Date().toISOString();
      // Reverse points
      if (ticket.points_awarded > 0 && profile) {
        // Allow redeemable to go negative (user already spent those points)
        // Lifetime can't go below 0
        const newRedeemable = (profile.redeemable_points ?? 0) - ticket.points_awarded;
        const newLifetime = Math.max(0, (profile.total_lifetime_points ?? 0) - ticket.points_awarded);
        const newTier = getMembershipTier(newLifetime);
        await Promise.all([
          base44.entities.UserProfile.update(profile.id, {
            redeemable_points: newRedeemable,
            total_lifetime_points: newLifetime,
            points_balance: newRedeemable,
            total_points_earned: newLifetime,
            membership_tier: newTier,
          }),
          base44.entities.PointsTransaction.create({
            user_email: user.email,
            type: 'ticket_refund',
            points: ticket.points_awarded,
            description: `Refund — ${ticket.event_name} ticket`,
            ticket_id: ticket.id,
          }),
        ]);
      }

      // Restore reward if applied
      if (ticket.reward_applied_id) {
        const reds = await base44.entities.RewardRedemption.filter({ id: ticket.reward_applied_id });
        if (reds.length > 0) {
          await base44.entities.RewardRedemption.update(ticket.reward_applied_id, {
            status: 'restored',
            restored_at: now,
            applied_to_ticket_id: '',
          });
        }
      }

      // Mark ticket refunded
      await base44.entities.Ticket.update(ticket.id, {
        ticket_status: 'refunded',
        payment_status: 'refunded',
        refunded_at: now,
      });

      showMsg('Ticket refunded. Points reversed and reward restored if applicable.');
      loadTickets();
    } finally {
      setRefunding(null);
    }
  }

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.ticket_status === filter);

  return (
    <div className="min-h-screen px-4 pt-12 pb-6 font-inter" style={{ background: ' #050505' }}>
      <AnimatePresence>
        {showQR && <TicketQRModal ticket={showQR} onClose={() => setShowQR(null)} theme={theme} />}
        {toast && (
          <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl font-space font-bold text-sm flex items-center gap-2 shadow-2xl max-w-xs"
            style={{ background: toast.type === 'success' ? ' #39FF14' : ' #FF3C3C', color: ' #000' }}>
            {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-[10px] font-space font-bold tracking-[0.25em] uppercase mb-1" style={{ color: theme.primary }}>NeonValley</p>
        <h1 className="text-3xl font-space font-black text-white">My Tickets</h1>
        <p className="text-xs text-white/35 font-inter mt-1">Your purchased event tickets</p>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'used', label: 'Used' },
          { key: 'refunded', label: 'Refunded' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="whitespace-nowrap px-4 py-2 rounded-full text-xs font-space font-bold transition-all"
            style={filter === f.key
              ? { background: theme.primary, color: ' #000' }
              : { background: ' rgba(255,255,255,0.04)', border: '1px solid  rgba(255,255,255,0.09)', color: ' rgba(255,255,255,0.4)' }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: theme.primary }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: ' rgba(255,255,255,0.02)', border: '1px solid  rgba(255,255,255,0.07)' }}>
          <Ticket size={32} className="mx-auto mb-3 opacity-15" color="white" />
          <p className="text-white/30 text-sm font-inter">No tickets yet. RSVP an event and pay now to get your ticket.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ticket, i) => {
            const sc = STATUS_CONFIG[ticket.ticket_status] || STATUS_CONFIG.active;
            const canRefund = isRefundEligible(ticket);
            const purchasedDate = ticket.purchased_at ? new Date(ticket.purchased_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
            return (
              <motion.div key={ticket.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: ' #0D0D0D', border: `1px solid ${theme.primary}18` }}>
                {/* Top bar */}
                <div className="px-5 py-4" style={{ background: `linear-gradient(135deg, ${theme.primary}08, transparent)` }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-base font-space font-bold text-white truncate">{ticket.event_name}</p>
                      <p className="text-xs text-white/40 font-inter mt-0.5">App RSVP Ticket · {purchasedDate}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-space font-bold whitespace-nowrap"
                      style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}30` }}>
                      {sc.label}
                    </span>
                  </div>
                </div>

                <div className="px-5 pb-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 mb-4 py-3" style={{ borderTop: '1px solid  rgba(255,255,255,0.06)', borderBottom: '1px solid  rgba(255,255,255,0.06)' }}>
                    <div>
                      <p className="text-[9px] font-space uppercase tracking-wider text-white/30">Paid</p>
                      <p className="text-sm font-space font-bold text-white mt-0.5">${(ticket.final_amount_paid ?? 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-space uppercase tracking-wider text-white/30">Points</p>
                      <p className="text-sm font-space font-bold mt-0.5" style={{ color: ' #39FF14' }}>+{(ticket.points_awarded ?? 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-space uppercase tracking-wider text-white/30">Method</p>
                      <p className="text-sm font-space font-bold text-white mt-0.5 capitalize">{ticket.payment_method || '—'}</p>
                    </div>
                  </div>

                  {ticket.reward_applied_name && (
                    <div className="rounded-xl px-3 py-2 mb-3 flex items-center gap-2"
                      style={{ background: `${theme.secondary}08`, border: `1px solid ${theme.secondary}20` }}>
                      <span className="text-[10px] font-space font-bold" style={{ color: theme.secondary }}>Reward Applied: {ticket.reward_applied_name}</span>
                      <span className="text-[10px] text-white/35 font-inter ml-auto">-${(ticket.discount_amount ?? 0).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {ticket.ticket_status === 'active' && (
                      <button onClick={() => setShowQR(ticket)}
                        className="flex-1 py-3 rounded-xl font-space font-bold text-sm flex items-center justify-center gap-2"
                        style={{ background: theme.primary, color: ' #000' }}>
                        <QrCode size={14} /> Show Ticket
                      </button>
                    )}
                    {ticket.ticket_status === 'used' && (
                      <div className="flex-1 py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                        style={{ background: ' rgba(255,255,255,0.03)', color: ' rgba(255,255,255,0.3)', border: '1px solid  rgba(255,255,255,0.08)' }}>
                        <CheckCircle size={14} /> Ticket Used
                      </div>
                    )}
                    {ticket.ticket_status === 'active' && (
                      canRefund ? (
                        <button onClick={() => handleRefund(ticket)} disabled={refunding === ticket.id}
                          className="px-4 py-3 rounded-xl font-space font-bold text-xs flex items-center gap-1.5 transition-all"
                          style={{ background: ' rgba(255,60,60,0.08)', color: ' #FF3C3C', border: '1px solid  rgba(255,60,60,0.2)' }}>
                          <RefreshCw size={12} /> {refunding === ticket.id ? '…' : 'Refund'}
                        </button>
                      ) : (
                        <div className="px-4 py-3 rounded-xl text-[9px] font-inter text-white/25 text-center leading-tight"
                          style={{ background: ' rgba(255,255,255,0.02)', border: '1px solid  rgba(255,255,255,0.06)' }}>
                          No refunds<br/>after cutoff
                        </div>
                      )
                    )}
                    {ticket.ticket_status === 'refunded' && (
                      <div className="flex-1 py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                        style={{ background: ' rgba(255,60,60,0.05)', color: ' #FF3C3C', border: '1px solid  rgba(255,60,60,0.15)' }}>
                        Refunded
                      </div>
                    )}
                  </div>

                  <p className="text-[9px] text-white/20 font-inter mt-2 text-center">
                    {ticket.ticket_status === 'active' && canRefund
                      ? `Refund available until 24h before the event.`
                      : ticket.ticket_status === 'active'
                        ? 'Refund window has passed. All sales are final.'
                        : ''}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
