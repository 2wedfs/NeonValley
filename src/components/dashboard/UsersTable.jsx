import { Zap } from 'lucide-react';

export default function UsersTable({ profiles, onSelect }) {
  if (profiles.length === 0) return (
    <div className="glass-card rounded-xl px-4 py-6 text-center" style={{ border: '1px solid  rgba(255,255,255,0.06)' }}>
      <p className="text-sm text-white/30 font-inter">No members found.</p>
    </div>
  );

  const getTier = (pts) => {
    if (pts >= 75000) return { name: 'Diamond', color: ' #00F5D4' };
    if (pts >= 30000) return { name: 'Gold', color: ' #FFD700' };
    if (pts >= 10000) return { name: 'Silver', color: ' #C0C0C0' };
    return { name: 'Bronze', color: ' #CD7F32' };
  };

  return (
    <div className="space-y-2">
      {profiles.map((profile) => {
        const tier = getTier(profile.total_points_earned || 0);
        return (
          <button
            key={profile.id}
            onClick={() => onSelect(profile)}
            className="w-full glass-card rounded-xl px-4 py-3 flex items-center justify-between transition-all hover:bg-white/5 text-left"
            style={{ border: '1px solid  rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-space font-black text-sm"
                style={{ background: ' rgba(0,245,212,0.08)', color: ' #00F5D4', border: '1px solid  rgba(0,245,212,0.2)' }}>
                {(profile.user_email || '?').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-space font-semibold text-white truncate">{profile.user_email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-inter text-white/35">{profile.member_id || '—'}</span>
                  <span className="text-[10px] font-space font-bold" style={{ color: tier.color }}>· {tier.name}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
              <Zap size={11} style={{ color: ' #39FF14' }} fill=" #39FF14" />
              <span className="text-sm font-space font-bold" style={{ color: ' #00F5D4' }}>
                {(profile.points_balance || 0).toLocaleString()}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
