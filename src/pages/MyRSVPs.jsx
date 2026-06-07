import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, QrCode, ChevronRight, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useUserProfile } from '@/hooks/useUserProfile';

const STATUS_COLORS = { confirmed: '#39FF14', cancelled: '#FF3C3C', checked_in: '#00F5FF', no_show: '#555' };
const STATUS_LABELS = { confirmed: 'Confirmed', cancelled: 'Cancelled', checked_in: 'Checked In', no_show: 'No Show' };

export default function MyRSVPs() {
  const { user, loading: userLoading } = useUserProfile();
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.RSVP.filter({ user_email: user.email }, '-created_date', 50)
      .then(setRsvps).finally(() => setLoading(false));
  }, [user?.email]);

  return (
    <div className="min-h-screen bg-black px-4 pt-12 pb-6 font-inter">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-7">
        <p className="text-xs font-space font-semibold tracking-[0.2em] uppercase mb-1" style={{ color: '#00F5FF' }}>NeonValley</p>
        <h1 className="text-3xl font-space font-bold text-white">My RSVPs</h1>
        <p className="text-sm text-white/40 font-inter mt-1">Your upcoming event reservations</p>
      </motion.div>

      {loading || userLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-transparent rounded-full animate-spin" style={{ borderTopColor: '#00F5FF' }} />
        </div>
      ) : rsvps.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-10 text-center"
          style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)' }}>
            <Ticket size={24} style={{ color: 'rgba(0,245,255,0.4)' }} />
          </div>
          <p className="font-space font-bold text-white mb-1">No RSVPs yet.</p>
          <p className="text-xs text-white/30 font-inter mb-5">New events will drop soon.</p>
          <Link to="/events">
            <button className="px-6 py-2.5 rounded-xl font-space font-bold text-sm"
              style={{ background: ' #39FF14', color: ' #000' }}>
              Browse Events
            </button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {rsvps.map((rsvp, i) => {
            const statusColor = STATUS_COLORS[rsvp.status] || ' #39FF14';
            return (
              <motion.div key={rsvp.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: ' #111', border: `1px solid ${statusColor}20` }}>
                {/* Status bar */}
                <div className="px-4 py-2 flex items-center justify-between"
                  style={{ background: `${statusColor}0A`, borderBottom: `1px solid ${statusColor}15` }}>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
                    <span className="text-[10px] font-space font-bold uppercase tracking-wider" style={{ color: statusColor }}>
                      {STATUS_LABELS[rsvp.status] || 'Confirmed'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-white/30">{rsvp.confirmation_code}</span>
                </div>

                <div className="p-4">
                  <h3 className="font-space font-bold text-white text-base mb-2">{rsvp.event_title}</h3>
                  <div className="space-y-1.5 mb-4">
                    {rsvp.event_date && (
                      <div className="flex items-center gap-2">
                        <Calendar size={12} style={{ color: statusColor }} />
                        <span className="text-xs font-inter text-white/60">{rsvp.event_date}</span>
                      </div>
                    )}
                    {rsvp.event_location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={12} style={{ color: statusColor }} />
                        <span className="text-xs font-inter text-white/60">{rsvp.event_location}</span>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl px-3 py-2 mb-4"
                    style={{ background: ' rgba(255,16,240,0.05)', border: '1px solid  rgba(255,16,240,0.12)' }}>
                    <p className="text-[10px] font-inter text-white/40 leading-relaxed">
                      Pay at the door. Staff will scan your NeonValley Pass at check-in.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link to="/events" className="flex-1">
                      <button className="w-full py-2 rounded-xl text-xs font-space font-semibold flex items-center justify-center gap-1"
                        style={{ background: ' rgba(255,255,255,0.06)', color: ' rgba(255,255,255,0.6)', border: '1px solid  rgba(255,255,255,0.08)' }}>
                        <ChevronRight size={12} /> View Event
                      </button>
                    </Link>
                    <Link to="/scan" className="flex-1">
                      <button className="w-full py-2 rounded-xl text-xs font-space font-bold flex items-center justify-center gap-1"
                        style={{ background: statusColor, color: ' #000', boxShadow: `0 0 10px ${statusColor}40` }}>
                        <QrCode size={12} /> My Pass
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
