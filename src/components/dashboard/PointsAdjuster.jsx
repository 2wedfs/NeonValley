import { useState } from 'react';
import { X, Plus, Minus, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function PointsAdjuster({ profile, onClose, onDone }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [mode, setMode] = useState('add'); // 'add' | 'subtract'
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    const pts = parseInt(amount);
    if (!pts || pts <= 0) return;
    setSubmitting(true);

    const newBalance = mode === 'add'
      ? (profile.points_balance || 0) + pts
      : Math.max((profile.points_balance || 0) - pts, 0);

    const newTotal = mode === 'add'
      ? (profile.total_points_earned || 0) + pts
      : profile.total_points_earned || 0;

    await Promise.all([
      base44.entities.UserProfile.update(profile.id, {
        points_balance: newBalance,
        total_points_earned: newTotal,
      }),
      base44.entities.PointsTransaction.create({
        user_email: profile.user_email,
        type: mode === 'add' ? 'earn' : 'redeem',
        points: pts,
        description: reason.trim() || (mode === 'add' ? 'Staff adjustment (add)' : 'Staff adjustment (deduct)'),
      }),
    ]);

    setSubmitting(false);
    setDone(true);
    setTimeout(onDone, 1500);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md glass-card rounded-t-3xl p-6"
          style={{ border: '1px solid  rgba(0,245,212,0.25)', borderBottom: 'none' }}
        >
          {done ? (
            <div className="flex flex-col items-center py-6">
              <CheckCircle size={40} style={{ color: ' #39FF14' }} className="mb-3" />
              <p className="font-space font-bold text-white text-lg">Points Updated!</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="font-space font-bold text-white">Adjust Points</p>
                  <p className="text-xs text-white/40 font-inter mt-0.5 truncate">{profile.user_email}</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: ' rgba(255,255,255,0.07)' }}>
                  <X size={14} color="white" />
                </button>
              </div>

              <p className="text-xs text-white/40 font-inter mb-1">
                Current balance: <span className="text-neon-cyan font-space font-bold">{(profile.points_balance || 0).toLocaleString()} pts</span>
              </p>

              {/* Mode toggle */}
              <div className="flex gap-2 mb-4 mt-3">
                {['add', 'subtract'].map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-space font-bold text-sm transition-all"
                    style={{
                      background: mode === m ? (m === 'add' ? ' #39FF14' : ' #FF3C3C') : ' rgba(255,255,255,0.05)',
                      color: mode === m ? ' #000' : ' rgba(255,255,255,0.4)',
                    }}>
                    {m === 'add' ? <Plus size={14} /> : <Minus size={14} />}
                    {m === 'add' ? 'Add Points' : 'Deduct Points'}
                  </button>
                ))}
              </div>

              <div className="space-y-3 mb-5">
                <input
                  type="number"
                  placeholder="Points amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min="1"
                  className="w-full px-4 py-3 rounded-xl text-sm font-inter text-white placeholder-white/25 outline-none"
                  style={{ background: ' rgba(255,255,255,0.05)', border: '1px solid  rgba(255,255,255,0.1)' }}
                />
                <input
                  type="text"
                  placeholder="Reason (optional)"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm font-inter text-white placeholder-white/25 outline-none"
                  style={{ background: ' rgba(255,255,255,0.05)', border: '1px solid  rgba(255,255,255,0.1)' }}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!amount || parseInt(amount) <= 0 || submitting}
                className="w-full py-3.5 rounded-xl font-space font-bold text-sm transition-all"
                style={{
                  background: amount && parseInt(amount) > 0 ? ' #00F5D4' : ' rgba(255,255,255,0.06)',
                  color: amount && parseInt(amount) > 0 ? ' #000' : ' rgba(255,255,255,0.25)',
                  boxShadow: amount && parseInt(amount) > 0 ? '0 0 20px  rgba(0,245,212,0.4)' : 'none',
                }}>
                {submitting ? 'Saving…' : 'Confirm'}
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
