import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Ticket, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getTheme } from '@/lib/theme';
import RSVPModal from '@/components/RSVPModal';
import RSVPPayModal from '@/components/events/RSVPPayModal';
import CheckoutModal from '@/components/checkout/CheckoutModal';

export default function Events() {
  const { user, profile } = useUserProfile();
  const theme = getTheme(profile?.selected_theme);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [rsvpEvent, setRsvpEvent] = useState(null);
  const [payPromptEvent, setPayPromptEvent] = useState(null);
  const [checkoutEvent, setCheckoutEvent] = useState(null);
  const [myRsvpIds, setMyRsvpIds] = useState(new Set());
  const [myTicketEventIds, setMyTicketEventIds] = useState(new Set());

  useEffect(() => {
    base44.entities.Event.filter({ status: 'published' }, '-created_date', 50)
      .then(setEvents).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    Promise.all([
      base44.entities.RSVP.filter({ user_email: user.email }, '-created_date', 100),
      base44.entities.Ticket.filter({ user_email: user.email, ticket_status: 'active' }, '-created_date', 50),
    ]).then(([rsvps, tickets]) => {
      setMyRsvpIds(new Set(rsvps.map(r => r.event_id)));
      setMyTicketEventIds(new Set(tickets.filter(t => t.payment_status === 'paid' || t.payment_status === 'free').map(t => t.event_id)));
    });
  }, [user?.email]);

  function handleRSVPSuccess(event) {
    setMyRsvpIds(prev => new Set([...prev, event.id]));
    setRsvpEvent(null);
    setPayPromptEvent(event);
  }
  function handlePayNow(event) { setPayPromptEvent(null); setCheckoutEvent(event); }
  function handlePayAtDoor() { setPayPromptEvent(null); }
  function handleCheckoutSuccess(event) { setMyTicketEventIds(prev => new Set([...prev, event.id])); setCheckoutEvent(null); }

  const filtered = filter === 'featured' ? events.filter(e => e.featured) : events;

  return (
    <div className="min-h-screen px-4 pt-12 pb-6 font-inter" style={{ background: ' #08080C' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ background: theme.bgGlow, position: 'absolute', inset: 0 }} />
      </div>

      <AnimatePresence>
        {rsvpEvent && <RSVPModal event={rsvpEvent} userEmail={user?.email} onClose={() => setRsvpEvent(null)} onSuccess={() => handleRSVPSuccess(rsvpEvent)} />}
        {payPromptEvent && <RSVPPayModal event={payPromptEvent} theme={theme} onPayNow={() => handlePayNow(payPromptEvent)} onPayAtDoor={handlePayAtDoor} onClose={() => setPayPromptEvent(null)} />}
        {checkoutEvent && <CheckoutModal event={checkoutEvent} user={user} profile={profile} theme={theme} onClose={() => setCheckoutEvent(null)} onSuccess={() => handleCheckoutSuccess(checkoutEvent)} />}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label mb-1">NEONVALLEY</p>
            <h1 className="text-[26px] font-space font-bold text-white tracking-tight">Events</h1>
            <p className="text-[13px] mt-0.5" style={{ color: ' rgba(255,255,255,0.4)' }}>Bay Area's hottest 18+ nights</p>
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            <Link to="/my-rsvps">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl card-subtle">
                <Ticket size={12} style={{ color: theme.primary }} strokeWidth={1.8} />
                <span className="text-[12px] font-space font-medium" style={{ color: theme.primary }}>My RSVPs</span>
              </div>
            </Link>
            <Link to="/my-tickets">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl card-subtle">
                <Ticket size={12} color=" rgba(255,255,255,0.55)" strokeWidth={1.8} />
                <span className="text-[12px] font-space font-medium" style={{ color: ' rgba(255,255,255,0.55)' }}>My Tickets</span>
              </div>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 relative z-10">
        {['all', 'featured'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-full text-[13px] font-space font-semibold transition-all capitalize"
            style={filter === f
              ? { background: theme.primary, color: ' #000' }
              : { background: ' rgba(255,255,255,0.06)', border: '1px solid  rgba(255,255,255,0.10)', color: ' rgba(255,255,255,0.45)' }}>
            {f === 'all' ? 'All Events' : 'Featured'}
          </button>
        ))}
      </div>

      {/* Points banner */}
      <div className="rounded-2xl px-4 py-3 mb-5 flex items-center gap-2.5 relative z-10"
        style={{ background: `${theme.primary}0C`, border: `1px solid ${theme.primary}22` }}>
        <Zap size={13} style={{ color: theme.primary }} />
        <span className="text-[13px] font-space font-medium" style={{ color: ' rgba(255,255,255,0.6)' }}>
          Earn <span style={{ color: theme.primary }}>100 Party Points</span> per $1 spent.
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 relative z-10">
          <div className="w-6 h-6 border-2 border-transparent rounded-full animate-spin"
            style={{ borderTopColor: theme.primary }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl p-10 text-center card-glass relative z-10">
          <Calendar size={32} className="mx-auto mb-4 opacity-20" color="white" />
          <p className="text-[18px] font-space font-semibold text-white mb-2">No live events yet.</p>
          <p className="text-[13px] font-inter leading-relaxed" style={{ color: ' rgba(255,255,255,0.35)' }}>New drops will appear here soon.</p>
        </div>
      ) : (
        <div className="space-y-4 relative z-10">
          {filtered.map((event, i) => {
            const hasRsvp = myRsvpIds.has(event.id);
            const hasPaidTicket = myTicketEventIds.has(event.id);
            return (
              <motion.div key={event.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i }}
                className="card-glass overflow-hidden">

                {/* Event header banner */}
                <div className="relative h-36 w-full overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}18, ${theme.secondary}10,  rgba(0,0,0,0.8))`,
                  }}>
                  {/* Subtle grid texture */}
                  <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage: `linear-gradient( rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg,  rgba(255,255,255,1) 1px, transparent 1px)`,
                      backgroundSize: '40px 40px',
                    }} />
                  {/* Big faint text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[72px] font-space font-black text-white opacity-[0.04] tracking-tighter">NV</span>
                  </div>
                  {/* Date badge */}
                  {event.date && (
                    <div className="absolute top-3 right-3">
                      <div className="px-3 py-1.5 rounded-xl text-[12px] font-space font-semibold"
                        style={{ background: ' rgba(0,0,0,0.7)', color: ' rgba(255,255,255,0.85)', border: '1px solid  rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>
                        {event.date}
                      </div>
                    </div>
                  )}
                  {event.tag && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-space font-bold tracking-wide"
                        style={{ background: `${theme.primary}20`, border: `1px solid ${theme.primary}40`, color: theme.primary, backdropFilter: 'blur(8px)' }}>
                        {event.tag}
                      </span>
                    </div>
                  )}
                  {/* Bottom fade */}
                  <div className="absolute bottom-0 left-0 right-0 h-14"
                    style={{ background: 'linear-gradient(to bottom, transparent,  rgba(8,8,12,0.95))' }} />
                </div>

                <div className="p-5">
                  <h3 className="text-[18px] font-space font-bold text-white tracking-tight mb-1">{event.title}</h3>
                  {event.subtitle && (
                    <p className="text-[13px] mb-3" style={{ color: ' rgba(255,255,255,0.45)' }}>{event.subtitle}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    {event.time && (
                      <div className="flex items-center gap-2.5">
                        <Clock size={13} color=" rgba(255,255,255,0.35)" strokeWidth={1.8} />
                        <span className="text-[13px]" style={{ color: ' rgba(255,255,255,0.55)' }}>{event.time}</span>
                      </div>
                    )}
                    {event.venue && (
                      <div className="flex items-center gap-2.5">
                        <MapPin size={13} color=" rgba(255,255,255,0.35)" strokeWidth={1.8} />
                        <span className="text-[13px]" style={{ color: ' rgba(255,255,255,0.55)' }}>{event.venue}</span>
                      </div>
                    )}
                    {event.djs && (
                      <div className="rounded-xl px-3 py-2.5 mt-2"
                        style={{ background: ' rgba(255,255,255,0.04)', border: '1px solid  rgba(255,255,255,0.08)' }}>
                        <p className="text-label mb-0.5">DJ Lineup</p>
                        <p className="text-[13px] font-space font-medium text-white">{event.djs}</p>
                      </div>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-[13px] mb-4 leading-relaxed" style={{ color: ' rgba(255,255,255,0.4)' }}>{event.description}</p>
                  )}

                  {/* Ticket info */}
                  <div className="rounded-2xl p-4 mb-4"
                    style={{ background: ' rgba(255,255,255,0.04)', border: '1px solid  rgba(255,255,255,0.09)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-[14px] font-space font-semibold text-white">App RSVP Ticket</p>
                        <p className="text-[12px] mt-0.5" style={{ color: ' rgba(255,255,255,0.4)' }}>Pay now · Show at the door</p>
                      </div>
                      <p className="text-[26px] font-space font-bold text-white">$10</p>
                    </div>
                    <div className="flex items-center gap-1.5 pt-2.5"
                      style={{ borderTop: '1px solid  rgba(255,255,255,0.07)' }}>
                      <Zap size={11} style={{ color: theme.primary }} />
                      <p className="text-[12px]" style={{ color: ' rgba(255,255,255,0.5)' }}>
                        Earn <span style={{ color: theme.primary }}>1,000 Party Points</span> on this ticket
                      </p>
                    </div>
                    <p className="text-[11px] mt-1.5" style={{ color: ' rgba(255,255,255,0.25)' }}>Refundable up to 24h before the event.</p>
                  </div>

                  {/* CTA */}
                  {hasPaidTicket ? (
                    <Link to="/my-tickets">
                      <button className="w-full h-12 rounded-[14px] font-space font-semibold text-[14px] flex items-center justify-center gap-2"
                        style={{ background: ' rgba(74,222,128,0.10)', color: ' #4ade80', border: '1px solid  rgba(74,222,128,0.25)' }}>
                        <Ticket size={15} /> Ticket Secured
                      </button>
                    </Link>
                  ) : hasRsvp ? (
                    <div className="space-y-2.5">
                      <button onClick={() => setCheckoutEvent(event)}
                        className="w-full h-12 rounded-[14px] font-space font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        style={{ background: theme.gradient, color: ' #fff', boxShadow: `0 8px 24px ${theme.glow}` }}>
                        Pay Now — $10 <ArrowRight size={14} />
                      </button>
                      <Link to="/my-rsvps">
                        <button className="w-full h-10 rounded-[14px] text-[13px] font-space font-medium btn-secondary">
                          You're on the list · Pay at the Door
                        </button>
                      </Link>
                    </div>
                  ) : event.free_rsvp_enabled !== false ? (
                    <button onClick={() => setRsvpEvent(event)}
                      className="w-full h-12 rounded-[14px] font-space font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                      style={{ background: theme.gradient, color: ' #fff', boxShadow: `0 8px 24px ${theme.glow}` }}>
                      <Ticket size={15} /> Free RSVP
                    </button>
                  ) : (
                    <div className="w-full h-12 rounded-[14px] text-center flex items-center justify-center text-[14px] font-space"
                      style={{ background: ' rgba(255,255,255,0.04)', color: ' rgba(255,255,255,0.25)', border: '1px solid  rgba(255,255,255,0.07)' }}>
                      RSVP Closed
                    </div>
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
