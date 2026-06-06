import { useState, useEffect } from 'react';
import { Bell, Zap, Gift, Calendar, ChevronRight, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const TYPE_ICONS = { event_drop: Calendar, reward_alert: Gift, general: Bell, important: Megaphone };
const TYPE_COLORS = { event_drop: '#00F5D4', reward_alert: '#39FF14', general: '#BF00FF', important: '#FF10F0' };

export default function Notifications() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Announcement.filter({ status: 'active' }, '-created_date', 30)
      .then(setAnnouncements).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black px-4 pt-12 pb-6 font-inter">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-space font-bold text-white">Notifications</h1>
          <p className="text-sm text-white/40 font-inter mt-1">NeonValley updates and announcements</p>
        </div>
        <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center"
          style={{ border: '1px solid rgba(0,245,212,0.2)' }}>
          <Bell size={17} style={{ color: '#00F5D4' }} />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
        <button className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all pulse-neon"
          style={{ background: 'linear-gradient(135deg, rgba(0,245,212,0.1), rgba(57,255,20,0.05))', border: '1px solid rgba(0,245,212,0.35)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,245,212,0.15)', border: '1px solid rgba(0,245,212,0.3)' }}>
              <Bell size={17} style={{ color: '#00F5D4' }} />
            </div>
            <div className="text-left">
              <p className="font-space font-bold text-white text-sm">Enable Notifications</p>
              <p className="text-xs text-white/40 font-inter mt-0.5">Stay up to date with NeonValley</p>
            </div>
          </div>
          <ChevronRight size={18} style={{ color: '#00F5D4' }} />
        </button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: ' #00F5D4' }} />
        </div>
      ) : announcements.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-8 text-center relative overflow-hidden"
          style={{ border: '1px solid  rgba(0,245,212,0.15)' }}>
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-08" style={{ background: 'radial-gradient(circle,  #00F5D4, transparent)' }} />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: ' rgba(0,245,212,0.08)', border: '1px solid  rgba(0,245,212,0.2)' }}>
              <Bell size={22} style={{ color: ' rgba(0,245,212,0.5)' }} />
            </div>
            <p className="font-space font-bold text-white mb-1">You're all caught up</p>
            <p className="text-xs text-white/35 font-inter">NeonValley updates will appear here soon.</p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a, i) => {
            const Icon = TYPE_ICONS[a.type] || Bell;
            const color = TYPE_COLORS[a.type] || ' #00F5D4';
            return (
              <motion.div key={a.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
                className="glass-card rounded-xl px-4 py-4 flex items-start gap-4"
                style={{ border: `1px solid ${color}18` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${color}0D`, border: `1px solid ${color}25` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-space font-bold text-white">{a.title}</p>
                  <p className="text-xs font-inter text-white/50 mt-0.5 leading-relaxed">{a.message}</p>
                  {a.created_date && (
                    <p className="text-[10px] text-white/25 font-inter mt-1.5">
                      {new Date(a.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
