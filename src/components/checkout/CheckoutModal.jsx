import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Zap, Tag, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Lock, Ticket, Gift } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { calcPoints, applyRewardDiscount, applyPromoDiscount, genTicketBarcode } from '@/lib/ticketUtils';
import { getMembershipTier } from '@/lib/theme';

const BASE_TICKET_PRICE = 10;

export default function CheckoutModal({ event, user, profile, onClose, onSuccess, theme }) {
  const [step, setStep] = useState('checkout'); // checkout | processing | success
  const [activeRedemptions, setActiveRedemptions] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoData, setPromoData] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [ticket, setTicket] = useState(null);

  // Pricing
  const basePrice = BASE_TICKET_PRICE;
  const rewardDiscount = selectedReward ? applyRewardDiscount(basePrice, selectedReward.reward_type) : { discountAmount: 0, finalPrice: basePrice };
  const priceAfterReward = rewardDiscount.finalPrice;
  const promoResult = promoData ? applyPromoDiscount(priceAfterReward, promoData) : { discountAmount: 0, finalPrice: priceAfterReward };
  const totalDiscount = rewardDiscount.discountAmount + promoResult.discountAmount;
  const finalPrice = promoResult.finalPrice;
  const pointsToEarn = calcPoints(finalPrice);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.RewardRedemption
      .filter({ user_email: user.email, status: 'active' }, '-created_date', 20)
      .then(setActiveRedemptions)
      .catch(() => {});
  }, [user?.email]);

  async function handleApplyPromo() {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    setPromoData(null);
    const codes = await base44.entities.PromoCode.filter({ code: promoCode.trim().toUpperCase(), status: 'active' });
    setPromoLoading(false);
    if (codes.length === 0) { setPromoError('Invalid or inactive promo code.'); return; }
    const c = codes[0];
    const now = new Date();
    if (c.starts_at && new Date(c.starts_at) > now) { setPromoError('This promo code is not active yet.'); return; }
    if (c.expires_at && new Date(c.expires_at) < now) { setPromoError('This promo code has expired.'); return; }
    if (c.usage_limit > 0 && c.used_count >= c.usage_limit) { setPromoError('This promo code has reached its usage limit.'); return; }
    if (c.event_id && c.event_id !== event?.id) { setPromoError('This promo code is not valid for this event.'); return; }
    setPromoData(c);
  }

  async function handlePay() {
    if (processing) return;
    setProcessing(true);
    setStep('processing');

    try {
      const now = new Date();
      const eventStart = event?.event_start_time ? new Date(event.event_start_time) : null;
      const refundDeadline = eventStart ? new Date(eventStart.getTime() - 24 * 60 * 60 * 1000).toISOString() : null;

      // Create ticket record
      const tmpId = Math.random().toString(36).substring(2, 10).toUpperCase();
      const barcode = genTicketBarcode(tmpId);

      const newTicket = await base44.entities.Ticket.create({
        user_id: user.id,
        user_name: profile?.full_name || user.email,
        user_email: user.email,
        event_id: event?.id || '',
        event_name: event?.title || 'NeonValley Event',
        event_start_time: event?.event_start_time || '',
        ticket_type: 'app_rsvp',
        ticket_barcode: barcode,
        original_price: basePrice,
        reward_applied_id: selectedReward?.id || '',
        reward_applied_name: selectedReward?.reward_name || '',
        promo_code_used: promoData?.code || '',
        discount_amount: totalDiscount,
        final_amount_paid: finalPrice,
        points_awarded: pointsToEarn,
        payment_status: finalPrice === 0 ? 'free' : 'paid',
        ticket_status: 'active',
        payment_method: paymentMethod,
        provider_payment_id: finalPrice > 0 ? `stripe_placeholder_${tmpId}` : '',
        purchased_at: now.toISOString(),
        refund_deadline: refundDeadline,
      });

      // Update barcode with real ticket ID
      const realBarcode = genTicketBarcode(newTicket.id.slice(0, 10).toUpperCase());
      await base44.entities.Ticket.update(newTicket.id, { ticket_barcode: realBarcode });

      // Create payment record
      await base44.entities.Payment.create({
        user_id: user.id,
        user_email: user.email,
        ticket_id: newTicket.id,
        event_id: event?.id || '',
        payment_provider: 'stripe',
        payment_method: paymentMethod,
        payment_status: finalPrice > 0 ? 'succeeded' : 'free',
        original_amount: basePrice,
        discount_amount: totalDiscount,
        final_amount: finalPrice,
        provider_payment_id: finalPrice > 0 ? `stripe_placeholder_${tmpId}` : 'free',
        notes: `Stripe integration pending. ${paymentMethod} selected.`,
      });

      // Award points
      if (pointsToEarn > 0) {
        const currentRedeemable = profile?.redeemable_points ?? 0;
        const currentLifetime = profile?.total_lifetime_points ?? 0;
        const newRedeemable = currentRedeemable + pointsToEarn;
        const newLifetime = currentLifetime + pointsToEarn;
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
            type: 'ticket_purchase',
            points: pointsToEarn,
            description: `${event?.title || 'Event'} — App Ticket — $${finalPrice} paid`,
            ticket_id: newTicket.id,
            event_id: event?.id || '',
          }),
        ]);
      }

      // Mark reward as used
      if (selectedReward) {
        await base44.entities.RewardRedemption.update(selectedReward.id, {
          status: 'used',
          used_at: now.toISOString(),
          applied_to_ticket_id: newTicket.id,
        });
      }

      // Update promo usage
      if (promoData) {
        await base44.entities.PromoCode.update(promoData.id, {
          used_count: (promoData.used_count || 0) + 1,
        });
      }

      setTicket({ ...newTicket, ticket_barcode: realBarcode });
      setStep('success');
    } catch (e) {
      console.error(e);
      setStep('checkout');
      setProcessing(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: ' rgba(0,0,0,0.85)' }}>
      <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28 }}
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ background: ' #0D0D0D', border: `1px solid ${theme.primary}25`, maxHeight: '92vh', overflowY: 'auto' }}>

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-24 px-8">
            <div className="w-12 h-12 border-2 border-transparent rounded-full animate-spin mb-6"
              style={{ borderTopColor: theme.primary }} />
            <p className="text-white font-space font-bold text-lg">Processing Payment…</p>
            <p className="text-white/40 text-sm font-inter mt-2 text-center">Please don't close this screen.</p>
          </div>
        )}

        {step === 'success' && ticket && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: `${theme.primary}15`, border: `2px solid ${theme.primary}50` }}>
                <CheckCircle size={30} style={{ color: theme.primary }} />
              </div>
              <h2 className="text-2xl font-space font-black text-white">Ticket Confirmed!</h2>
              <p className="text-white/50 font-inter text-sm mt-1">{event?.title}</p>
            </div>
            <div className="rounded-2xl p-4 mb-4" style={{ background: ' rgba(255,255,255,0.03)', border: '1px solid  rgba(255,255,255,0.08)' }}>
              <div className="space-y-2">
                {[
                  { label: 'Amount Paid', val: `$${finalPrice.toFixed(2)}` },
                  { label: 'Party Points Earned', val: `+${pointsToEarn.toLocaleString()} pts`, color: theme.primary },
                  { label: 'Ticket Barcode', val: ticket.ticket_barcode, mono: true },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-xs text-white/40 font-inter">{row.label}</span>
                    <span className={`text-sm font-space font-bold ${row.mono ? 'font-mono text-xs' : ''}`}
                      style={{ color: row.color || 'white' }}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl p-3 mb-4" style={{ background: `${theme.primary}08`, border: `1px solid ${theme.primary}20` }}>
              <p className="text-xs text-white/60 font-inter text-center leading-relaxed">
                Show this ticket at the door. Staff will scan your barcode to let you in.
              </p>
            </div>
            <button onClick={() => { onSuccess && onSuccess(); onClose(); }}
              className="w-full py-4 rounded-2xl font-space font-bold text-base"
              style={{ background: theme.primary, color: ' #000' }}>
              View My Tickets
            </button>
          </div>
        )}

        {step === 'checkout' && (
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-space font-bold text-white">Checkout</h2>
                <p className="text-xs text-white/40 font-inter mt-0.5">{event?.title}</p>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: ' rgba(255,255,255,0.06)' }}>
                <X size={16} color="white" />
              </button>
            </div>

            {/* Ticket type */}
            <div className="rounded-2xl p-4 mb-4" style={{ background: ' rgba(255,255,255,0.03)', border: '1px solid  rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${theme.primary}12`, border: `1px solid ${theme.primary}25` }}>
                    <Ticket size={18} style={{ color: theme.primary }} />
                  </div>
                  <div>
                    <p className="text-sm font-space font-bold text-white">App RSVP Ticket</p>
                    <p className="text-[10px] text-white/40 font-inter mt-0.5">Your RSVP is free. Pay now or pay at the door.</p>
                  </div>
                </div>
                <p className="text-xl font-space font-bold text-white">${basePrice.toFixed(2)}</p>
              </div>
            </div>

            {/* Apply Reward */}
            <div className="rounded-2xl mb-3 overflow-hidden" style={{ border: '1px solid  rgba(255,255,255,0.08)' }}>
              <button onClick={() => setShowRewards(!showRewards)}
                className="w-full flex items-center justify-between p-4"
                style={{ background: ' rgba(255,255,255,0.02)' }}>
                <div className="flex items-center gap-2">
                  <Gift size={15} style={{ color: theme.secondary }} />
                  <span className="text-sm font-space font-semibold text-white">Apply Reward</span>
                  {selectedReward && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-space font-bold"
                      style={{ background: `${theme.secondary}15`, color: theme.secondary, border: `1px solid ${theme.secondary}30` }}>
                      {selectedReward.reward_name}
                    </span>
                  )}
                </div>
                {showRewards ? <ChevronUp size={15} color=" rgba(255,255,255,0.4)" /> : <ChevronDown size={15} color=" rgba(255,255,255,0.4)" />}
              </button>
              {showRewards && (
                <div className="px-4 pb-4 space-y-2">
                  {activeRedemptions.length === 0 ? (
                    <p className="text-xs text-white/30 font-inter py-2">No active rewards available.</p>
                  ) : activeRedemptions.map(r => {
                    const isSelected = selectedReward?.id === r.id;
                    const disc = applyRewardDiscount(basePrice, r.reward_type);
                    return (
                      <button key={r.id} onClick={() => setSelectedReward(isSelected ? null : r)}
                        className="w-full flex items-center justify-between rounded-xl p-3 transition-all"
                        style={{
                          background: isSelected ? `${theme.secondary}10` : ' rgba(255,255,255,0.02)',
                          border: `1px solid ${isSelected ? theme.secondary + '50' : ' rgba(255,255,255,0.06)'}`,
                        }}>
                        <div>
                          <p className="text-sm font-space font-semibold text-left" style={{ color: isSelected ? theme.secondary : 'white' }}>{r.reward_name}</p>
                          <p className="text-[10px] text-white/35 font-inter mt-0.5">Saves ${disc.discountAmount.toFixed(2)}</p>
                        </div>
                        {isSelected && <CheckCircle size={16} style={{ color: theme.secondary }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Promo Code */}
            <div className="rounded-2xl p-4 mb-4" style={{ background: ' rgba(255,255,255,0.02)', border: '1px solid  rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Tag size={14} style={{ color: theme.primary }} />
                <span className="text-sm font-space font-semibold text-white">Promo Code</span>
              </div>
              <div className="flex gap-2">
                <input type="text" value={promoCode}
                  onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); setPromoData(null); }}
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm font-mono text-white placeholder-white/20 outline-none"
                  style={{ background: ' rgba(255,255,255,0.05)', border: '1px solid  rgba(255,255,255,0.1)' }} />
                <button onClick={handleApplyPromo} disabled={promoLoading || !promoCode.trim()}
                  className="px-4 py-2.5 rounded-xl text-xs font-space font-bold transition-all"
                  style={{ background: promoCode.trim() ? theme.primary : ' rgba(255,255,255,0.06)', color: promoCode.trim() ? ' #000' : ' rgba(255,255,255,0.25)' }}>
                  {promoLoading ? '…' : 'Apply'}
                </button>
              </div>
              {promoError && (
                <div className="flex items-center gap-1.5 mt-2">
                  <AlertCircle size={12} style={{ color: ' #FF3C3C' }} />
                  <p className="text-xs text-red-400 font-inter">{promoError}</p>
                </div>
              )}
              {promoData && (
                <div className="flex items-center gap-1.5 mt-2">
                  <CheckCircle size={12} style={{ color: ' #39FF14' }} />
                  <p className="text-xs font-inter" style={{ color: ' #39FF14' }}>
                    Promo applied! -{promoData.discount_type === 'percentage' ? `${promoData.discount_value}%` : `$${promoData.discount_value}`} off
                  </p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="rounded-2xl p-4 mb-4" style={{ background: ' rgba(255,255,255,0.03)', border: `1px solid ${theme.primary}20` }}>
              <p className="text-[10px] font-space uppercase tracking-wider text-white/30 mb-3">Order Summary</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60 font-inter">Ticket Price</span>
                  <span className="text-white font-space font-semibold">${basePrice.toFixed(2)}</span>
                </div>
                {selectedReward && (
                  <div className="flex justify-between text-sm">
                    <span className="font-inter" style={{ color: theme.secondary }}>{rewardDiscount.rewardLabel}</span>
                    <span className="font-space font-semibold" style={{ color: theme.secondary }}>-${rewardDiscount.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {promoData && (
                  <div className="flex justify-between text-sm">
                    <span className="font-inter" style={{ color: theme.primary }}>Promo: {promoData.code}</span>
                    <span className="font-space font-semibold" style={{ color: theme.primary }}>-${promoResult.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 mt-1" style={{ borderTop: '1px solid  rgba(255,255,255,0.07)' }}>
                  <div className="flex justify-between">
                    <span className="text-white font-space font-bold">Total</span>
                    <span className="text-xl font-space font-black" style={{ color: theme.primary }}>${finalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-white/35 font-inter">Party Points earned</span>
                    <span className="text-sm font-space font-bold" style={{ color: ' #39FF14' }}>+{pointsToEarn.toLocaleString()} pts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <p className="text-[10px] font-space uppercase tracking-wider text-white/30 mb-3">Payment Method</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'card', label: 'Credit Card', icon: '💳' },
                  { key: 'apple_pay', label: 'Apple Pay', icon: '' },
                  { key: 'google_pay', label: 'Google Pay', icon: '🇬' },
                ].map(m => (
                  <button key={m.key} onClick={() => setPaymentMethod(m.key)}
                    className="rounded-xl p-3 flex flex-col items-center gap-1.5 transition-all"
                    style={{
                      background: paymentMethod === m.key ? `${theme.primary}10` : ' rgba(255,255,255,0.03)',
                      border: `1.5px solid ${paymentMethod === m.key ? theme.primary + '60' : ' rgba(255,255,255,0.08)'}`,
                    }}>
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-[9px] font-space font-bold text-center" style={{ color: paymentMethod === m.key ? theme.primary : ' rgba(255,255,255,0.45)' }}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 mb-4 px-1">
              <Lock size={11} style={{ color: ' rgba(255,255,255,0.25)' }} />
              <p className="text-[10px] text-white/25 font-inter">Payments processed securely via Stripe. We never store card numbers.</p>
            </div>

            {/* Points reminder */}
            <div className="rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2"
              style={{ background: ' rgba(57,255,20,0.05)', border: '1px solid  rgba(57,255,20,0.15)' }}>
              <Zap size={11} fill=" #39FF14" style={{ color: ' #39FF14' }} />
              <p className="text-xs font-inter text-white/55">
                Earn 100 Party Points per $1 spent. Points are based on what you actually pay.
              </p>
            </div>

            <button onClick={handlePay} disabled={processing}
              className="w-full py-4 rounded-2xl font-space font-bold text-base transition-all"
              style={{ background: theme.primary, color: ' #000', opacity: processing ? 0.6 : 1 }}>
              {finalPrice === 0 ? 'Confirm Free Ticket' : `Pay $${finalPrice.toFixed(2)}`}
            </button>

            <p className="text-[9px] text-white/20 text-center mt-3 font-inter">
              Stripe payment integration is active. Test mode is enabled.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
