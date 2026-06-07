import { useEffect, useState } from 'react';
import { Plus, Calendar, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { isDemoMode } from '@/lib/demoMode';

function futureDate() {
  const date = new Date();
  date.setDate(date.getDate() + 21);
  return date.toISOString().slice(0, 10);
}

export default function EventsManager() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('NeonValley Test Drop');

  async function load() {
    setLoading(true);
    const rows = await base44.entities.Event.list('-created_date', 100);
    setEvents(rows);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const refresh = () => load();
    window.addEventListener('neonvalley-demo-change', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('neonvalley-demo-change', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  async function addEvent() {
    await base44.entities.Event.create({
      is_demo: isDemoMode(),
      title,
      event_title: title,
      date: futureDate(),
      time: '9:00 PM',
      location: 'Bay Area',
      venue: 'Bay Area',
      price: 10,
      ticket_price: 10,
      status: 'published',
      alcohol_free: true,
      free_rsvp_enabled: true,
      featured: true,
      theme: 'Midnight Eclipse',
      description: 'Demo event created from the admin dashboard.',
      image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      event_start_time: new Date(futureDate() + 'T21:00:00').toISOString(),
    });
    await load();
  }

  return (
    <div className="px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-label">Admin Dashboard</p>
          <h1 className="mt-2 text-3xl font-black text-white">Events</h1>
          <p className="mt-2 text-sm text-white/50">Create and edit published test events. Demo events are marked with is_demo.</p>
        </div>
        <div className="flex gap-2">
          <input value={title} onChange={e => setTitle(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none" />
          <button onClick={addEvent} className="btn-primary h-11 rounded-xl px-4 text-sm font-bold"><Plus size={15} /> Add Event</button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-white/45">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="card-subtle rounded-2xl p-8 text-center text-white/45">No events yet.</div>
      ) : (
        <div className="space-y-3">
          {events.map(event => (
            <div key={event.id} className="card-subtle rounded-2xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-white">{event.title}</h2>
                    {event.is_demo && <span className="status-badge-premium">is_demo</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/48">
                    <span className="inline-flex items-center gap-1"><Calendar size={13} />{event.date} · {event.time}</span>
                    <span className="inline-flex items-center gap-1"><MapPin size={13} />{event.venue || event.location}</span>
                  </div>
                </div>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">{event.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
