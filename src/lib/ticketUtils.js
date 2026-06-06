// NeonValley Ticket & Points Utilities

/**
 * Core rule: $1 spent = 100 Party Points
 * pointsEarned = Math.floor(amountPaid) * 100
 */
export function calcPoints(amountPaid) {
  return Math.floor(amountPaid) * 100;
}

/**
 * Apply reward discount to base price
 * Returns { discountAmount, finalPrice, rewardLabel }
 */
export function applyRewardDiscount(basePrice, rewardType) {
  switch (rewardType) {
    case 'discount_25':
      return {
        discountAmount: parseFloat((basePrice * 0.25).toFixed(2)),
        finalPrice: parseFloat((basePrice * 0.75).toFixed(2)),
        rewardLabel: '25% Discount',
      };
    case 'discount_50':
      return {
        discountAmount: parseFloat((basePrice * 0.5).toFixed(2)),
        finalPrice: parseFloat((basePrice * 0.5).toFixed(2)),
        rewardLabel: '50% Discount',
      };
    case 'free_ticket':
      return {
        discountAmount: basePrice,
        finalPrice: 0,
        rewardLabel: 'Free Ticket',
      };
    case 'group_pass':
      return {
        discountAmount: basePrice,
        finalPrice: 0,
        rewardLabel: 'Group Pass',
      };
    default:
      return { discountAmount: 0, finalPrice: basePrice, rewardLabel: null };
  }
}

/**
 * Apply promo code discount
 */
export function applyPromoDiscount(price, promo) {
  if (!promo) return { discountAmount: 0, finalPrice: price };
  if (promo.discount_type === 'percentage') {
    const disc = parseFloat((price * promo.discount_value / 100).toFixed(2));
    return { discountAmount: disc, finalPrice: Math.max(0, parseFloat((price - disc).toFixed(2))) };
  }
  if (promo.discount_type === 'fixed_amount') {
    const disc = Math.min(promo.discount_value, price);
    return { discountAmount: disc, finalPrice: Math.max(0, parseFloat((price - disc).toFixed(2))) };
  }
  return { discountAmount: 0, finalPrice: price };
}

/**
 * Check if a ticket is refund-eligible (> 24h before event start)
 */
export function isRefundEligible(ticket) {
  if (!ticket || ticket.ticket_status !== 'active') return false;
  if (!ticket.refund_deadline) return true;
  return new Date() < new Date(ticket.refund_deadline);
}

/**
 * Generate ticket barcode
 */
export function genTicketBarcode(ticketId) {
  return `NV-TICKET-${ticketId || Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

/**
 * Detect scan code type
 */
export function detectScanType(code) {
  const upper = code.trim().toUpperCase();
  if (upper.startsWith('NV-TICKET-')) return 'ticket';
  if (upper.startsWith('NV-REWARD-')) return 'reward';
  if (/^NV-\d{4}-[A-Z]{1,4}$/.test(upper)) return 'member';
  if (upper.startsWith('NEONVALLEY-PASS-')) return 'member';
  return 'unknown';
}

/**
 * Generate a 6-char lowercase referral code
 */
export function generateReferralCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
