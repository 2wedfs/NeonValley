import { isDemoMode, getDemoRole } from '@/lib/demoMode';

export default function DemoModeBadge() {
  if (!isDemoMode()) return null;
  const role = getDemoRole();
  const label = role.charAt(0).toUpperCase() + role.slice(1);
  return (
    <div className="fixed top-4 right-4 z-[80] rounded-full px-3 py-1 text-[11px] font-bold text-white shadow-2xl" style={{ background: 'linear-gradient(135deg,#3A0CA3,#9D4EDD,#F72585)' }}>
      Demo Mode · {label} View
    </div>
  );
}
