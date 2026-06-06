import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import FormShell from './FormShell';

const EMPTY = { title: '', subtitle: '', date: '', time: '', venue: '', location: 'San Francisco, CA', djs: '', price: '', capacity: '', description: '', status: 'draft', featured: false, hot: false, tag: '' };

export default function EventForm({ event, onSave, onCancel }) {
  const [form, setForm] = useState(event ? { ...event } : { ...EMPTY });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    setSaving(true);
    if (event?.id) await base44.entities.Event.update(event.id, form);
    else await base44.entities.Event.create(form);
    setSaving(false);
    onSave();
  }

  return (
    <FormShell title={event ? 'Edit Event' : 'New Event'} onCancel={onCancel} onSave={handleSave} saving={saving}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Event Title *" value={form.title} onChange={v => set('title', v)} placeholder="NEON RAVE SATURDAYS" span2 />
        <Field label="Subtitle / Theme" value={form.subtitle} onChange={v => set('subtitle', v)} placeholder="Vol. 12 — Summer Edition" span2 />
        <Field label="Date" value={form.date} onChange={v => set('date', v)} placeholder="SAT, JUN 7" />
        <Field label="Time" value={form.time} onChange={v => set('time', v)} placeholder="10 PM – 4 AM" />
        <Field label="Venue" value={form.venue} onChange={v => set('venue', v)} placeholder="NeonValley Main Floor" />
        <Field label="Location" value={form.location} onChange={v => set('location', v)} placeholder="San Francisco, CA" />
        <Field label="DJs" value={form.djs} onChange={v => set('djs', v)} placeholder="DJ VOLTAGE · PRISM" />
        <Field label="Price" value={form.price} onChange={v => set('price', v)} placeholder="$25 early / $35 door" />
        <Field label="Capacity" value={form.capacity} onChange={v => set('capacity', v)} placeholder="480 / 500" />
        <Field label="Tag Label" value={form.tag} onChange={v => set('tag', v)} placeholder="FEATURED" />
        <Field label="Description" value={form.description} onChange={v => set('description', v)} placeholder="Tell guests about this event…" textarea span2 />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-space uppercase tracking-wider text-white/40">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm font-inter text-white outline-none"
            style={{ background: ' rgba(255,255,255,0.05)', border: '1px solid  rgba(255,255,255,0.1)' }}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
        <div className="flex flex-col gap-3 justify-end">
          <Toggle label="Featured on Home" value={form.featured} onChange={v => set('featured', v)} color=" #00F5FF" />
          <Toggle label="Mark as Hot" value={form.hot} onChange={v => set('hot', v)} color=" #FF10F0" />
        </div>
      </div>
    </FormShell>
  );
}

function Field({ label, value, onChange, placeholder, textarea, span2 }) {
  const cls = `${span2 ? 'md:col-span-2' : ''} flex flex-col gap-1`;
  return (
    <div className={cls}>
      <label className="text-[10px] font-space uppercase tracking-wider text-white/40">{label}</label>
      {textarea ? (
        <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="px-3 py-2.5 rounded-xl text-sm font-inter text-white placeholder-white/20 outline-none resize-none"
          style={{ background: ' rgba(255,255,255,0.05)', border: '1px solid  rgba(255,255,255,0.1)' }} />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="px-3 py-2.5 rounded-xl text-sm font-inter text-white placeholder-white/20 outline-none"
          style={{ background: ' rgba(255,255,255,0.05)', border: '1px solid  rgba(255,255,255,0.1)' }} />
      )}
    </div>
  );
}

function Toggle({ label, value, onChange, color }) {
  return (
    <button onClick={() => onChange(!value)} className="flex items-center gap-3">
      <div className="w-9 h-5 rounded-full relative transition-all"
        style={{ background: value ? color : ' rgba(255,255,255,0.1)' }}>
        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
          style={{ left: value ? '18px' : '2px', boxShadow: value ? `0 0 6px ${color}` : 'none' }} />
      </div>
      <span className="text-sm font-inter" style={{ color: value ? color : ' rgba(255,255,255,0.4)' }}>{label}</span>
    </button>
  );
}
