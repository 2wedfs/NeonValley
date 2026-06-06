import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Ticket, X, Zap, ArrowRight } from 'lucide-react';

/**
 * Shown right after RSVP is confirmed.
 * Lets the user decide: Pay Now or Pay at the Door.
 */
export default function RSVPPayModal({ event, onPayNow, onPayAtDoor, onClose, theme }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 28 }}
        className="w-full max-w-sm rounded-3xl p-6"
        style={{ background: '#0D0D0D', border: `1.5px solid ${theme.primary}30` }}>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(57,255,20,0.12)', border: '1px solid rgba(57,255,20,0.3)' }}>
              <CheckCircle size={20} style={{ color: '#39FF14' }} />
            </div>
            <div>
              <p className="text-base font-space font-bold text-white">RSVP Confirmed!</p>
              <p className="text-xs text-white/40 font-inter mt-0.5">{event?.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: ' rgba(255,255,255,0.06)' }}>
            <X size={14} color="white" />
          </button>
        </div>

        <div className="rounded-xl p-4 mb-5" style={{ background: ' rgba(255,255,255,0.03)', border: '1px solid  rgba(255,255,255,0.07)' }}>
          <p className="text-sm font-inter text-white/70 leading-relaxed text-center">
            Your RSVP is free. Pay now to secure your ticket, or pay at the door.
          </p>
        </div>

        {/* Pay Now */}
        <button onClick={onPayNow}
          className="w-full py-4 rounded-2xl font-space font-bold text-base flex items-center justify-center gap-2 mb-3 transition-all"
          style={{ background: theme.primary, color: ' #000' }}>
          <Ticket size={16} />
          Pay Now — App RSVP Ticket $10
          <ArrowRight size={14} />
        </button>

        {/* Points hint */}
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <Zap size={11} fill=" #39FF14" style={{ color: ' #39FF14' }} />
          <p className="text-[10px] text-white/40 font-inter">Earn 1,000 Party Points when you pay $10</p>
        </div>

        {/* Pay at door */}
        <button onClick={onPayAtDoor}
          className="w-full py-3.5 rounded-2xl font-space font-semibold text-sm flex items-center justify-center gap-2"
          style={{ background: ' rgba(255,255,255,0.04)', color: ' rgba(255,255,255,0.55)', border: '1px solid  rgba(255,255,255,0.1)' }}>
          Pay at the Door
        </button>

        <p className="text-[9px] text-white/20 text-center mt-3 font-inter leading-relaxed">
          Earn 100 Party Points per $1 spent. Points are based on what you actually pay.
        </p>
      </motion.div>
    </motion.div>
  );
}
