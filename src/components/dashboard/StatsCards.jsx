import { motion } from 'framer-motion';
import { Users, Zap, TrendingUp, Gift } from 'lucide-react';

export default function StatsCards({ profiles, transactions }) {
  const totalMembers = profiles.length;
  const totalPointsInCirculation = profiles.reduce((sum, p) => sum + (p.points_balance || 0), 0);
  const totalEarnedAllTime = profiles.reduce((sum, p) => sum + (p.total_points_earned || 0), 0);
  const totalRedemptions = transactions.filter(t => t.type === 'redeem').length;

  const stats = [
    { label: 'Members', value: totalMembers.toLocaleString(), icon: Users, color: ' #00F5D4' },
    { label: 'Points in Circulation', value: totalPointsInCirculation.toLocaleString(), icon: Zap, color: ' #39FF14' },
    { label: 'All-Time Points Earned', value: totalEarnedAllTime.toLocaleString(), icon: TrendingUp, color: ' #00F5D4' },
    { label: 'Total Redemptions', value: totalRedemptions.toLocaleString(), icon: Gift, color: ' #39FF14' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 gap-3 mb-6"
    >
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label}
            className="glass-card rounded-xl p-4"
            style={{ border: `1px solid ${stat.color}18` }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} style={{ color: stat.color }} />
              <span className="text-[10px] font-space uppercase tracking-wider text-white/40">{stat.label}</span>
            </div>
            <p className="text-2xl font-space font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        );
      })}
    </motion.div>
  );
}
