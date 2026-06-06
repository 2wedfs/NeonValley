import { Star } from 'lucide-react';
import { getTierInfo } from '@/hooks/useUserProfile';

export default function TierBadge({ totalEarned = 0, size = 'sm' }) {
  const tier = getTierInfo(totalEarned);
  const sizes = {
    xs: { px: 'px-2 py-0.5', text: 'text-[9px]', icon: 8 },
    sm: { px: 'px-2.5 py-1', text: 'text-[10px]', icon: 10 },
    md: { px: 'px-3 py-1.5', text: 'text-xs', icon: 12 },
  };
  const s = sizes[size] || sizes.sm;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-space font-bold ${s.px} ${s.text}`}
      style={{ background: `${tier.color}15`, border: `1px solid ${tier.color}50`, color: tier.color }}>
      <Star size={s.icon} fill={tier.color} />
      {tier.name} Member
    </span>
  );
}
