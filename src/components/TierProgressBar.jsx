import { motion } from 'framer-motion';
import { getTierInfo } from '@/hooks/useUserProfile';

const ALL_TIERS = [
  { name: 'Bronze', threshold: 0, color: '#CD7F32' },
  { name: 'Silver', threshold: 1000, color: '#C0C0C0' },
  { name: 'Gold', threshold: 5000, color: '#FFD700' },
  { name: 'Neon', threshold: 10000, color: '#39FF14' },
];

export default function TierProgressBar({ totalEarned = 0, compact = false }) {
  const tier = getTierInfo(totalEarned);
  const progress = tier.next
    ? Math.min(100, ((totalEarned - tier.floor) / (tier.nextPts - tier.floor)) * 100)
    : 100;
  const ptsToNext = tier.next ? tier.nextPts - totalEarned : 0;

  return (
    <div>
      {/* Tier track */}
      <div className="flex items-center justify-between mb-2">
        {ALL_TIERS.map((t, i) => {
          const isActive = t.name === tier.name;
          const isPast = totalEarned >= t.threshold;
          return (
            <div key={t.name} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-space font-black border transition-all ${isActive ? 'scale-110' : ''}`}
                style={{
                  background: isPast ? `${t.color}25` : ' rgba(255,255,255,0.04)',
                  borderColor: isPast ? t.color : ' rgba(255,255,255,0.1)',
                  color: isPast ? t.color : ' rgba(255,255,255,0.25)',
                  boxShadow: isActive ? `0 0 10px ${t.color}60` : 'none',
                }}>
                {i + 1}
              </div>
              <span className="text-[8px] font-space font-semibold" style={{ color: isPast ? t.color : ' rgba(255,255,255,0.2)' }}>
                {t.name}
              </span>
              {i < ALL_TIERS.length - 1 && (
                <div className="absolute" />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      {!compact && (
        <>
          <div className="w-full h-1.5 rounded-full mb-2" style={{ background: ' rgba(255,255,255,0.07)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${tier.color}, ${tier.color}99)`, boxShadow: `0 0 8px ${tier.glow}` }}
            />
          </div>
          {tier.next && (
            <p className="text-[10px] font-inter text-white/40 text-right">
              {ptsToNext.toLocaleString()} pts to {tier.next} Member
            </p>
          )}
        </>
      )}
    </div>
  );
}
