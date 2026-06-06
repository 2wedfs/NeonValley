import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function RecentTransactions({ transactions }) {
  const recent = transactions.slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-6"
    >
      <h2 className="text-lg font-space font-bold text-white mb-4">Recent Transactions</h2>
      {recent.length === 0 ? (
        <div className="glass-card rounded-xl px-4 py-6 text-center" style={{ border: '1px solid  rgba(255,255,255,0.06)' }}>
          <p className="text-sm text-white/30 font-inter">No transactions yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recent.map((txn) => (
            <div key={txn.id}
              className="glass-card rounded-xl px-4 py-3 flex items-center justify-between"
              style={{ border: '1px solid  rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: txn.type === 'earn' ? ' rgba(57,255,20,0.08)' : ' rgba(255,60,60,0.08)' }}>
                  <TrendingUp size={12} style={{ color: txn.type === 'earn' ? ' #39FF14' : ' #FF3C3C' }} />
                </div>
                <div>
                  <p className="text-xs font-space font-semibold text-white leading-tight">{txn.description}</p>
                  <p className="text-[10px] text-white/35 font-inter">{txn.user_email}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-space font-bold"
                  style={{ color: txn.type === 'earn' ? ' #39FF14' : ' #FF3C3C' }}>
                  {txn.type === 'earn' ? '+' : '-'}{txn.points?.toLocaleString()}
                </span>
                <p className="text-[10px] text-white/30 font-inter">
                  {new Date(txn.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
