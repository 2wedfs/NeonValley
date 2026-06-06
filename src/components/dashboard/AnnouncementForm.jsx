import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import FormShell from './FormShell';

const EMPTY = { title: '', message: '', type: 'general', status: 'draft', featured_on_home: false, start_date: '', end_date: '' };

export default function AnnouncementForm({ announcement, onSave, onCancel }) {
  const [form, setForm] = useState(announcement ? { ...announcement } : { ...EMPTY });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    setSaving(true);
    if (announcement?.id) await base44.entities.Announcement.update(announcement.id, form);
    else await base44.entities.Announcement.create(form);
    setSaving(false);
    onSave();
  }

  return (
    <FormShell title={announcement ? 'Edit Announcement' : 'New Announcement'} onCancel={onCancel} onSave={handleSave} saving={saving}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-[10px] font-space uppercase tracking-wider text-white/40">Title *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="New event drop coming soon"
            className="px-3 py-2.5 rounded-xl text-sm font-inter text-white placeholder-white/20 outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-[10px] font-space uppercase tracking-wider text-white/40">Message *</label>
          <textarea rows={3} value={form.message} onChange={e => set('message', e.target.value)} placeholder="Full announcement text…"
            className="px-3 py-2.5 rounded-xl text-sm font-inter text-white placeholder-white/20 outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-space uppercase tracking-wider text-white/40">Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm font-inter text-white outline-none"
            style={{ background: ' rgba(255,255,255,0.05)', border: '1px solid  rgba(255,255,255,0.1)' }}>
            <option value="general">General</option>
            <option value="event_drop">Event Drop</option>
            <option value="reward_alert">Reward Alert</option>
            <option value="important">Important</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-space uppercase tracking-wider text-white/40">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm font-inter text-white outline-none"
            style={{ background: ' rgba(255,255,255,0.05)', border: '1px solid  rgba(255,255,255,0.1)' }}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-space uppercase tracking-wider text-white/40">Start Date</label>
          <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm font-inter text-white outline-none"
            style={{ background: ' rgba(255,255,255,0.05)', border: '1px solid  rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-space uppercase tracking-wider text-white/40">End Date</label>
          <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm font-inter text-white outline-none"
            style={{ background: ' rgba(255,255,255,0.05)', border: '1px solid  rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
        </div>
        <div className="md:col-span-2">
          <button onClick={() => set('featured_on_home', !form.featured_on_home)} className="flex items-center gap-3">
            <div className="w-9 h-5 rounded-full relative transition-all" style={{ background: form.featured_on_home ? ' #00F5FF' : ' rgba(255,255,255,0.1)' }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: form.featured_on_home ? '18px' : '2px' }} />
            </div>
            <span className="text-sm font-inter" style={{ color: form.featured_on_home ? ' #00F5FF' : ' rgba(255,255,255,0.4)' }}>Featured on Home Page</span>
          </button>
        </div>
      </div>
    </FormShell>
  );
}
