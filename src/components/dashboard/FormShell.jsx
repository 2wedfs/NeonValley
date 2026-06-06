import { ArrowLeft, Save } from 'lucide-react';

export default function FormShell({ title, onCancel, onSave, saving, children }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: ' rgba(255,255,255,0.07)' }}>
          <ArrowLeft size={14} color="white" />
        </button>
        <h2 className="text-xl font-space font-bold text-white">{title}</h2>
      </div>
      <div className="rounded-2xl p-5 mb-5" style={{ background: ' #131313', border: '1px solid  rgba(255,255,255,0.06)' }}>
        {children}
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-sm font-space font-semibold transition-all"
          style={{ background: ' rgba(255,255,255,0.06)', color: ' rgba(255,255,255,0.5)' }}>
          Cancel
        </button>
        <button onClick={onSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-space font-bold transition-all"
          style={{ background: ' #39FF14', color: ' #000', opacity: saving ? 0.7 : 1 }}>
          <Save size={14} /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
