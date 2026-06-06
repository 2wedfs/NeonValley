import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import FormShell from './FormShell';

const EMPTY = { name: '', description: '', points_required: '', category: 'special', icon: '🎁', status: 'draft', quantity: 0 };

export default function RewardForm({ reward, onSave, onCancel }) {
  const [form, setForm] = useState(reward ? { ...reward } : { ...EMPTY });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSave() {
    setSaving(true);
    const data = { ...form, points_required: Number(form.points_required) || 0, quantity: Number(form.quantity) || 0 };
    if (reward?.id) await base44.entities.Reward.update(reward.id, data);
    else await base44.entities.Reward.create(data);
    setSaving(false);
    onSave();
  }

  return (
    <FormShell title={reward ? 'Edit Reward' : 'New Reward'} onCancel={onCancel} onSave={handleSave} saving={saving}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-[10px] font-space uppercase tracking-wider text-white/40">Reward Name *</label>
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Free Cover Entry"
            className="px-3 py-2.5 rounded-xl text-sm font-inter text-white placeholder-white/20 outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-[10px] font-space uppercase tracking-wider text-white/40">Description</label>
          <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What the user gets…"
            className="px-3 py-2.5 rounded-xl text-sm font-inter text-white placeholder-white/20 outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-space uppercase tracking-wider text-white/40">Points Required *</label>
          <input type="number" value={form.points_required} onChange={e => set('points_required', e.target.value)} placeholder="15000"
            className="px-3 py-2.5 rounded-xl text-sm font-inter text-white placeholder-white/20 outline-none"
            style={{ background: ' rgba(255,255,255,0.05)', border: '1px solid  rgba(255,255,255,0.1)' }} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-space uppercase tracking-wider text-white/40">Icon (emoji)</label>
          <input type="text" value={form.icon} onChange={e => set('icon', e.target.value)} placeholder="🎫"
            className="px-3 py-2.5 rounded-xl text-sm font-inter text-white placeholder-white/20 outline-none"
            style={{ background: ' rgba(255,255,255,0.05)', border: '1px solid  rgba(255,255,255,0.1)' }} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-space uppercase tracking-wider text-white/40">Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm font-inter text-white outline-none"
            style={{ background: ' rgba(255,255,255,0.05)', border: '1px solid  rgba(255,255,255,0.1)' }}>
            <option value="free_entry">Free Entry</option>
            <option value="merch">Merch</option>
            <option value="vip">VIP</option>
            <option value="discount">Discount</option>
            <option value="special">Special</option>
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
          <label className="text-[10px] font-space uppercase tracking-wider text-white/40">Quantity (0 = unlimited)</label>
          <input type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="0"
            className="px-3 py-2.5 rounded-xl text-sm font-inter text-white placeholder-white/20 outline-none"
            style={{ background: ' rgba(255,255,255,0.05)', border: '1px solid  rgba(255,255,255,0.1)' }} />
        </div>
      </div>
    </FormShell>
  );
}
