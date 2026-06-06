import { useState } from 'react';
import { X, CheckCircle, QrCode, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'NV-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function RSVPModal({ event, userEmail, onClose, onSuccess }) {
  const [step, setStep] = useState('form'); // 'form' | 'confirmed'
  const [submitting, setSubmitting] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: userEmail || '',
    birthday: '',
    instagram_handle: '',
    is_18_confirmed: false,
    understands_paid_entry: false,
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function validate() {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!form.birthday.trim()) e.birthday = 'Required';
    if (!form.is_18_confirmed) e.is_18_confirmed = 'You must confirm you are 18+';
    if (!form.understands_paid_entry) e.understands_paid_entry = 'You must confirm you understand entry is paid';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    const code = generateCode();
    await base44.entities.RSVP.create({
      event_id: event.id,
      event_title: event.title,
      event_date: event.date || '',
      event_location: event.venue || event.location || '',
      user_email: userEmail,
      ...form,
      confirmation_code: code,
      status: 'confirmed',
      checked_in: false,
    });
    setConfirmCode(code);
    setSubmitting(false);
    setStep('confirmed');
    if (onSuccess) onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        className="relative w-full md:max-w-md rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[92vh] overflow-y-auto"
        style={{ background: ' #0D0D0D', border: '1px solid  rgba(0,245,255,0.2)' }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10"
          style={{ background: ' rgba(255,255,255,0.07)' }}>
          <X size={14} color="white" />
        </button>

        {step === 'form' ? (
          <div className="p-6">
            {/* Header */}
            <div className="mb-5">
              <p className="text-[10px] font-space uppercase tracking-widest mb-1" style={{ color: ' #00F5FF' }}>Free RSVP</p>
              <h2 className="text-xl font-space font-bold text-white">{event.title}</h2>
              {event.date && <p className="text-sm text-white/40 font-inter mt-0.5">{event.date}{event.venue ? ` · ${event.venue}` : ''}</p>}
            </div>

            {/* Notice */}
            <div className="rounded-xl px-4 py-3 mb-5 flex items-start gap-2"
              style={{ background: ' rgba(255,16,240,0.07)', border: '1px solid  rgba(255,16,240,0.2)' }}>
              <Zap size={13} style={{ color: ' #FF10F0', marginTop: 2 }} className="flex-shrink-0" />
              <p className="text-xs font-inter leading-relaxed" style={{ color: ' rgba(255,255,255,0.6)' }}>
                <span className="font-semibold text-white">Free RSVP does not mean free entry.</span> Pay at the door. Show your NeonValley Pass. Earn Party Points.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-3 mb-5">
              {[
                { key: 'full_name', label: 'Full Name', placeholder: 'Your full name', type: 'text' },
                { key: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000', type: 'tel' },
                { key: 'email', label: 'Email', placeholder: 'you@email.com', type: 'email' },
                { key: 'birthday', label: 'Birthday (18+ confirmation)', placeholder: 'MM/DD/YYYY', type: 'text' },
                { key: 'instagram_handle', label: 'Instagram (optional)', placeholder: '@yourhandle', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] font-space uppercase tracking-wider text-white/40 block mb-1">{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => { set(f.key, e.target.value); setErrors(v => ({ ...v, [f.key]: undefined })); }}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-inter text-white placeholder-white/20 outline-none"
                    style={{ background: ' rgba(255,255,255,0.05)', border: errors[f.key] ? '1px solid  #FF3C3C' : '1px solid  rgba(255,255,255,0.1)' }} />
                  {errors[f.key] && <p className="text-[10px] text-red-400 mt-0.5">{errors[f.key]}</p>}
                </div>
              ))}
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 mb-6">
              {[
                { key: 'is_18_confirmed', label: 'I confirm I am 18 years of age or older.' },
                { key: 'understands_paid_entry', label: 'I understand RSVP is free, but entry is paid at the door.' },
              ].map(c => (
                <div key={c.key}>
                  <button onClick={() => { set(c.key, !form[c.key]); setErrors(v => ({ ...v, [c.key]: undefined })); }}
                    className="flex items-start gap-3 text-left w-full">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                      style={{ background: form[c.key] ? ' #39FF14' : ' rgba(255,255,255,0.07)', border: errors[c.key] ? '1px solid  #FF3C3C' : form[c.key] ? 'none' : '1px solid  rgba(255,255,255,0.2)' }}>
                      {form[c.key] && <CheckCircle size={13} color=" #000" />}
                    </div>
                    <span className="text-xs font-inter text-white/70 leading-relaxed">{c.label}</span>
                  </button>
                  {errors[c.key] && <p className="text-[10px] text-red-400 mt-1 ml-8">{errors[c.key]}</p>}
                </div>
              ))}
            </div>

            <button onClick={handleSubmit} disabled={submitting}
              className="w-full py-3.5 rounded-xl font-space font-bold text-sm transition-all"
              style={{ background: ' #39FF14', color: ' #000', boxShadow: '0 0 20px  rgba(57,255,20,0.4)', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Confirming…' : 'Confirm Free RSVP'}
            </button>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: ' rgba(57,255,20,0.15)', border: '2px solid  #39FF14', boxShadow: '0 0 30px  rgba(57,255,20,0.3)' }}>
              <CheckCircle size={30} style={{ color: ' #39FF14' }} />
            </div>
            <p className="text-[10px] font-space uppercase tracking-widest mb-1" style={{ color: ' #39FF14' }}>RSVP Confirmed</p>
            <h2 className="text-2xl font-space font-bold text-white mb-1">You're on the list.</h2>
            <p className="text-sm text-white/40 font-inter mb-5">{event.title}</p>

            <div className="rounded-2xl p-4 mb-5 text-left space-y-2"
              style={{ background: ' rgba(255,255,255,0.04)', border: '1px solid  rgba(255,255,255,0.08)' }}>
              {event.date && <Row label="Date" value={event.date} />}
              {(event.venue || event.location) && <Row label="Location" value={event.venue || event.location} />}
              <Row label="RSVP Status" value="Confirmed" valueColor=" #39FF14" />
              <Row label="Confirmation Code" value={confirmCode} valueColor=" #00F5FF" mono />
            </div>

            <div className="rounded-xl px-4 py-3 mb-5"
              style={{ background: ' rgba(255,16,240,0.06)', border: '1px solid  rgba(255,16,240,0.15)' }}>
              <p className="text-xs font-inter text-white/50 leading-relaxed">
                Pay at the door. Staff will scan your NeonValley Pass at check-in.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-3 rounded-xl font-space font-bold text-sm"
                style={{ background: ' rgba(255,255,255,0.07)', color: 'white' }}>
                Close
              </button>
              <button onClick={() => { onClose(); window.location.href = '/scan'; }}
                className="flex-1 py-3 rounded-xl font-space font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: ' #00F5FF', color: ' #000' }}>
                <QrCode size={14} /> View Pass
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Row({ label, value, valueColor, mono }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/40 font-inter">{label}</span>
      <span className={`text-xs font-semibold ${mono ? 'font-mono' : 'font-space'}`} style={{ color: valueColor || 'white' }}>{value}</span>
    </div>
  );
}
