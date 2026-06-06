import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, ChevronRight, Check } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { THEMES } from '@/lib/theme';

const THEME_LIST = Object.values(THEMES);

const HOW_HEARD_OPTIONS = [
  'Friend invited me', 'Instagram', 'TikTok', 'Snapchat',
  'Flyer', 'School', 'Another event', 'Staff / promoter', 'Other', 'Prefer not to say',
];

export default function Onboarding() {
  const { profile, completeOnboarding } = useUserProfile();
  const [step, setStep] = useState(1); // 1 = theme, 2 = how heard, 3 = hype
  const [selectedTheme, setSelectedTheme] = useState('Gamer RGB');
  const [howHeard, setHowHeard] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const theme = THEMES[selectedTheme];

  async function handleFinish() {
    setSubmitting(true);
    await completeOnboarding({ selectedTheme, howHeard });
    window.location.href = '/';
  }

  return (
    <div className="min-h-screen font-inter flex flex-col" style={{ background: '#050505' }}>
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-15"
          style={{ background: `radial-gradient(circle, ${theme.primary}, transparent)`, filter: 'blur(60px)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15"
          style={{ background: `radial-gradient(circle, ${theme.secondary}, transparent)`, filter: 'blur(60px)' }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-5 py-12 max-w-md mx-auto w-full">

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {[1, 2, 3].map(s => (
            <div key={s} className="h-1 rounded-full transition-all duration-500"
              style={{
                width: s === step ? 32 : 12,
                background: s <= step ? theme.primary : ' rgba(255,255,255,0.1)',
                boxShadow: s === step ? `0 0 10px ${theme.primary}` : 'none',
              }} />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Choose Theme ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="flex-1 flex flex-col">
              <div className="mb-8">
                <p className="text-[10px] font-space font-black tracking-[0.3em] uppercase mb-2" style={{ color: theme.primary }}>
                  Step 1 of 3
                </p>
                <h1 className="text-3xl font-space font-black text-white leading-tight mb-2">
                  Choose Your<br />NeonValley Vibe
                </h1>
                <p className="text-sm text-white/45 font-inter">
                  Pick the glow you want across your app. You can change this later in Profile.
                </p>
              </div>

              <div className="space-y-3 flex-1">
                {THEME_LIST.map((t) => {
                  const isSelected = selectedTheme === t.name;
                  return (
                    <button key={t.name} onClick={() => setSelectedTheme(t.name)}
                      className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all text-left"
                      style={{
                        background: isSelected ? `linear-gradient(135deg, ${t.primary}15, ${t.secondary}10)` : ' rgba(255,255,255,0.03)',
                        border: `1.5px solid ${isSelected ? t.primary : ' rgba(255,255,255,0.08)'}`,
                        boxShadow: isSelected ? `0 0 20px ${t.primary}30, 0 0 40px ${t.secondary}15` : 'none',
                      }}>
                      {/* Color dots */}
                      <div className="flex gap-2 flex-shrink-0">
                        <div className="w-7 h-7 rounded-full" style={{ background: t.primary, boxShadow: `0 0 12px ${t.primary}` }} />
                        <div className="w-7 h-7 rounded-full" style={{ background: t.secondary, boxShadow: `0 0 12px ${t.secondary}` }} />
                      </div>
                      {/* Gradient bar */}
                      <div className="w-14 h-7 rounded-xl flex-shrink-0" style={{ background: t.gradient }} />
                      {/* Labels */}
                      <div className="flex-1">
                        <p className="font-space font-bold text-white text-sm">{t.name}</p>
                        <p className="text-[10px] text-white/40 font-inter mt-0.5">{t.primaryLabel} + {t.secondaryLabel}</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: t.primary }}>
                          <Check size={13} color=" #000" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <button onClick={() => setStep(2)}
                className="mt-6 w-full py-4 rounded-2xl font-space font-black text-base flex items-center justify-center gap-2 transition-all"
                style={{ background: theme.gradient, color: ' #000', boxShadow: `0 0 30px ${theme.primary}50` }}>
                Continue <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: How did you hear ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="flex-1 flex flex-col">
              <div className="mb-6">
                <p className="text-[10px] font-space font-black tracking-[0.3em] uppercase mb-2" style={{ color: theme.primary }}>
                  Step 2 of 3
                </p>
                <h1 className="text-3xl font-space font-black text-white leading-tight mb-2">
                  How'd You Hear<br />About Us?
                </h1>
                <p className="text-sm text-white/45 font-inter">Optional — this helps us grow the NeonValley community.</p>
              </div>

              <div className="grid grid-cols-2 gap-2 flex-1">
                {HOW_HEARD_OPTIONS.map((opt) => {
                  const isSelected = howHeard === opt;
                  return (
                    <button key={opt} onClick={() => setHowHeard(isSelected ? '' : opt)}
                      className="rounded-xl px-3 py-3 text-sm font-space font-semibold transition-all text-left"
                      style={{
                        background: isSelected ? `${theme.primary}15` : ' rgba(255,255,255,0.03)',
                        border: `1px solid ${isSelected ? theme.primary : ' rgba(255,255,255,0.08)'}`,
                        color: isSelected ? theme.primary : ' rgba(255,255,255,0.6)',
                        boxShadow: isSelected ? `0 0 12px ${theme.primary}30` : 'none',
                      }}>
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(3)}
                  className="flex-1 py-3.5 rounded-2xl font-space font-semibold text-sm transition-all"
                  style={{ background: ' rgba(255,255,255,0.05)', color: ' rgba(255,255,255,0.4)', border: '1px solid  rgba(255,255,255,0.08)' }}>
                  Skip
                </button>
                <button onClick={() => setStep(3)}
                  className="flex-1 py-3.5 rounded-2xl font-space font-black text-sm flex items-center justify-center gap-2 transition-all"
                  style={{ background: theme.gradient, color: ' #000', boxShadow: `0 0 25px ${theme.primary}40` }}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Hype Screen ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center">

              {/* Glowing orb */}
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-32 h-32 rounded-full mb-8 flex items-center justify-center"
                style={{
                  background: theme.gradient,
                  boxShadow: `0 0 60px ${theme.primary}, 0 0 120px ${theme.primary}50, 0 0 200px ${theme.secondary}30`,
                }}>
                <Zap size={56} color=" #000" fill=" #000" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-5xl font-space font-black mb-4 leading-none"
                style={{
                  background: theme.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: `drop-shadow(0 0 20px ${theme.primary})`,
                }}>
                LET'S GET<br />HYPE!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="text-base text-white/60 font-inter mb-3 leading-relaxed">
                Your NeonValley Pass is ready.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                className="text-sm font-space font-bold mb-10"
                style={{ color: theme.secondary }}>
                Show your pass. Earn points. Level up.
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                onClick={handleFinish}
                disabled={submitting}
                className="w-full py-5 rounded-2xl font-space font-black text-lg flex items-center justify-center gap-3 transition-all"
                style={{
                  background: theme.gradient,
                  color: ' #000',
                  boxShadow: `0 0 40px ${theme.primary}60, 0 0 80px ${theme.primary}25`,
                  opacity: submitting ? 0.7 : 1,
                }}>
                <Zap size={22} fill=" #000" />
                {submitting ? 'Loading…' : 'Enter NeonValley'}
              </motion.button>

              <p className="text-[10px] text-white/20 font-inter mt-6">
                18+ · Alcohol-Free · Bay Area Party Community
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
