import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { isDemoMode, demoProfile, demoUser } from '@/lib/demoMode';

export default function StaffRoute() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'allowed' | 'denied'

  useEffect(() => {
    async function check() {
      if (isDemoMode()) {
        const user = demoUser();
        const profile = demoProfile();
        const allowed = ['staff', 'admin'].includes(user.role) || ['staff', 'admin'].includes(profile.staff_role);
        setStatus(allowed ? 'allowed' : 'denied');
        return;
      }

      try {
        const user = await base44.auth.me();
        if (user?.role === 'admin' || user?.role === 'staff') {
          setStatus('allowed');
          return;
        }
        const profiles = await base44.entities.UserProfile.filter({ user_email: user?.email });
        const profile = profiles[0];
        if (profile?.staff_role === 'staff' || profile?.staff_role === 'admin') {
          setStatus('allowed');
          return;
        }
        setStatus('denied');
      } catch {
        setStatus('denied');
      }
    }
    check();
  }, []);

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-transparent rounded-full animate-spin"
          style={{ borderTopColor: ' #9D4EDD' }} />
      </div>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
