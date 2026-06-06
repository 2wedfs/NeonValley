import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function StaffRoute() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'allowed' | 'denied'

  useEffect(() => {
    async function check() {
      try {
        const user = await base44.auth.me();
        // Check Base44 built-in role first
        if (user?.role === 'admin' || user?.role === 'staff') {
          setStatus('allowed');
          return;
        }
        // Also check UserProfile.staff_role as secondary check
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
          style={{ borderTopColor: ' #00F5D4' }} />
      </div>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
