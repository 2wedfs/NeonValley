import { CheckCircle, Circle, Sparkles } from 'lucide-react';

export function AppShell({ children, theme, className = '' }) {
  return (
    <div
      className={'premium-page px-5 pt-10 pb-6 font-inter ' + className}
      style={{
        '--theme-primary': theme?.primary,
        '--theme-gradient': theme?.gradient,
        '--theme-glow': theme?.glow,
        '--theme-bg-glow': theme?.bgGlow,
      }}
    >
      <div className="club-vignette" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function GlassCard({ children, className = '', elevated = false, style }) {
  return (
    <div className={(elevated ? 'hero-glass ' : 'glass-card-premium ') + className} style={style}>
      {children}
    </div>
  );
}

export function PrimaryButton({ children, className = '', style, ...props }) {
  return (
    <button className={'btn-primary inline-flex items-center justify-center gap-2 px-4 active:scale-[0.98] transition ' + className} style={style} {...props}>
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = '', style, ...props }) {
  return (
    <button className={'btn-secondary inline-flex items-center justify-center gap-2 px-4 active:scale-[0.98] transition ' + className} style={style} {...props}>
      {children}
    </button>
  );
}

export function StatCard({ label, value, icon: Icon, accent, subtext }) {
  return (
    <GlassCard className="rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-label mb-1">{label}</p>
          <p className="text-[22px] font-bold text-white leading-tight">{value}</p>
          {subtext && <p className="text-xs mt-1 text-white/42">{subtext}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: (accent || '#9D4EDD') + '18', border: '1px solid ' + (accent || '#9D4EDD') + '2A' }}>
            <Icon size={18} style={{ color: accent || '#9D4EDD' }} />
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export function ProgressBar({ value = 0, accent = '#9D4EDD', className = '' }) {
  return (
    <div className={'progress-track h-2 ' + className}>
      <div className="progress-fill" style={{ width: Math.max(0, Math.min(100, value)) + '%', background: 'linear-gradient(90deg, ' + accent + ', rgba(255,255,255,0.82))' }} />
    </div>
  );
}

export function StatusBadge({ children, accent = '#9D4EDD', tone = 'default' }) {
  const color = tone === 'success' ? '#4ade80' : tone === 'danger' ? '#f87171' : accent;
  return (
    <span className="status-badge-premium" style={{ borderColor: color + '35', color, background: color + '12' }}>
      <Circle size={6} fill="currentColor" /> {children}
    </span>
  );
}

export function EmptyState({ title, children, icon: Icon = Sparkles }) {
  return (
    <GlassCard className="rounded-3xl p-8 text-center">
      <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-white/[0.06] border border-white/[0.10]">
        <Icon size={20} className="text-white/55" />
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      {children && <p className="text-sm text-white/45 mt-2 leading-6">{children}</p>}
    </GlassCard>
  );
}

export function SuccessScreen({ title = 'THANK YOU!', subtitle, children }) {
  return (
    <GlassCard elevated className="rounded-[28px] p-7 text-center">
      <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center bg-emerald-400/12 border border-emerald-300/30">
        <CheckCircle size={32} className="text-emerald-300" />
      </div>
      <h2 className="text-3xl font-extrabold text-white">{title}</h2>
      {subtitle && <p className="text-sm text-white/56 mt-2">{subtitle}</p>}
      {children && <div className="mt-5">{children}</div>}
    </GlassCard>
  );
}

export function ThemePicker({ themes, selectedTheme, onSelect, saving }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {themes.map((theme) => {
        const selected = selectedTheme === theme.name;
        return (
          <button
            key={theme.name}
            onClick={() => onSelect(theme.name)}
            disabled={saving}
            className="rounded-2xl p-4 text-left transition active:scale-[0.99]"
            style={{ background: selected ? theme.primary + '12' : 'rgba(255,255,255,0.045)', border: '1px solid ' + (selected ? theme.primary + '55' : 'rgba(255,255,255,0.09)') }}
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-10 rounded-xl border border-white/10" style={{ background: theme.gradient }} />
              <div className="flex-1">
                <p className="font-bold text-white">{theme.name}</p>
                <p className="text-xs text-white/42">{theme.primaryLabel} + {theme.secondaryLabel}</p>
              </div>
              {selected && <CheckCircle size={18} style={{ color: theme.primary }} />}
            </div>
          </button>
        );
      })}
    </div>
  );
}
