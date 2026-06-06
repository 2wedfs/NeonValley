import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getTierInfo as getTierInfoFromLib, getMembershipTier, DEFAULT_THEME } from '@/lib/theme';
import { generateReferralCode } from '@/lib/ticketUtils';

// Re-export for backward compatibility
export { getTierInfo } from '@/lib/theme';

export function getNeonStatus(totalLifetimePoints) {
  return getTierInfoFromLib(totalLifetimePoints).name + ' Member';
}

export function useUserProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const me = await base44.auth.me();
        if (cancelled) return;
        setUser(me);

        const results = await base44.entities.UserProfile.filter({ user_email: me.email });
        if (cancelled) return;

        if (results.length > 0) {
          const p = results[0];
          let updates = {};
          // Sync qr_code_value
          if (p.member_id && p.qr_code_value !== p.member_id) {
            updates.qr_code_value = p.member_id;
          }
          // Migrate legacy points fields
          if (p.total_lifetime_points == null && p.total_points_earned != null) {
            updates.total_lifetime_points = p.total_points_earned;
          }
          if (p.redeemable_points == null && p.points_balance != null) {
            updates.redeemable_points = p.points_balance;
          }
          // Migrate old tier names to new ones
          const oldToNew = {
            'Bronze': 'Neon Newbie', 'Silver': 'Rhythm Rider',
            'Gold': 'Boogie Boss', 'Neon': 'Certified Toe-Tapper',
            'Starter': 'Neon Newbie', 'Glow Member': 'Rhythm Rider',
            'Neon Insider': 'Boogie Boss', 'Valley VIP': 'Certified Toe-Tapper',
          };
          if (p.membership_tier && oldToNew[p.membership_tier]) {
            updates.membership_tier = oldToNew[p.membership_tier];
          }
          // Ensure referral fields exist
          if (p.referral_code == null || p.referral_code === '' || p.referral_code?.startsWith('NEON-')) {
            updates.referral_code = generateReferralCode();
          }
          if (p.referral_used == null) updates.referral_used = false;
          if (p.referral_bonus_given_count == null) updates.referral_bonus_given_count = 0;

          if (Object.keys(updates).length > 0) {
            const updated = await base44.entities.UserProfile.update(p.id, updates);
            if (!cancelled) setProfile(updated);
          } else {
            if (!cancelled) setProfile(p);
          }
        } else {
          // New user - create profile
          const nameStr = me.full_name || me.email;
          const initials = nameStr.slice(0, 2).toUpperCase();
          const memberId = `NV-${Math.floor(1000 + Math.random() * 9000)}-${initials}`;
          const referralCode = generateReferralCode();
          const created = await base44.entities.UserProfile.create({
            user_email: me.email,
            full_name: me.full_name || '',
            redeemable_points: 0,
            total_lifetime_points: 0,
            points_balance: 0,
            total_points_earned: 0,
            visit_count: 0,
            membership_tier: 'Neon Newbie',
            neon_status: 'Neon Newbie Member',
            selected_theme: DEFAULT_THEME,
            onboarding_completed: false,
            member_id: memberId,
            referral_code: referralCode,
            referral_used: false,
            referral_bonus_received: false,
            referral_bonus_given_count: 0,
            role: 'user',
            staff_role: 'none',
            is_18_verified: true,
            qr_code_value: memberId,
          });
          if (!cancelled) setProfile(created);
        }
      } catch (e) {
        console.error('useUserProfile error', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Award points: adds to both total_lifetime_points and redeemable_points
  async function addPoints(points, description, txnType = 'earn') {
    if (!profile || !user) return;
    const newRedeemable = (profile.redeemable_points ?? 0) + points;
    const newLifetime = (profile.total_lifetime_points ?? 0) + points;
    const newVisits = (profile.visit_count || 0) + 1;
    const newTier = getMembershipTier(newLifetime);
    const [updated] = await Promise.all([
      base44.entities.UserProfile.update(profile.id, {
        redeemable_points: newRedeemable,
        total_lifetime_points: newLifetime,
        points_balance: newRedeemable,
        total_points_earned: newLifetime,
        visit_count: newVisits,
        membership_tier: newTier,
        neon_status: newTier + ' Member',
      }),
      base44.entities.PointsTransaction.create({
        user_email: user.email,
        type: txnType,
        points: points,
        description,
      }),
    ]);
    setProfile(updated);
    return updated;
  }

  // Redeem reward: only subtracts from redeemable_points, NEVER from total_lifetime_points
  async function redeemReward({ name, costPoints }) {
    if (!profile || !user) return null;
    const currentRedeemable = profile.redeemable_points ?? 0;
    if (currentRedeemable < costPoints) return null;
    const newRedeemable = currentRedeemable - costPoints;
    const [updated] = await Promise.all([
      base44.entities.UserProfile.update(profile.id, {
        redeemable_points: newRedeemable,
        points_balance: newRedeemable,
        // NOTE: total_lifetime_points is NOT changed here
      }),
      base44.entities.PointsTransaction.create({
        user_email: user.email,
        type: 'reward_redemption',
        points: costPoints,
        description: `${name} redeemed`,
        reward_name: name,
      }),
    ]);
    setProfile(updated);
    return updated;
  }

  async function updateTheme(themeName) {
    if (!profile) return;
    const updated = await base44.entities.UserProfile.update(profile.id, { selected_theme: themeName });
    setProfile(updated);
    return updated;
  }

  async function completeOnboarding({ selectedTheme, howHeard }) {
    if (!profile) return;
    const updated = await base44.entities.UserProfile.update(profile.id, {
      selected_theme: selectedTheme || DEFAULT_THEME,
      how_heard_about_us: howHeard || '',
      onboarding_completed: true,
    });
    setProfile(updated);
    return updated;
  }

  return { user, profile, loading, addPoints, redeemReward, setProfile, updateTheme, completeOnboarding };
}
