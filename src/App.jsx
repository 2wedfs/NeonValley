import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from '@/components/Layout';
import Home from '@/pages/HomeNew';
import Events from '@/pages/Events';
import MyTickets from '@/pages/MyTickets';
import Scan from '@/pages/Scan';
import Rewards from '@/pages/RewardsNew';
import Profile from '@/pages/ProfileNew';
import Referral from '@/pages/Referral';
import Notifications from '@/pages/Notifications';
import MyRSVPs from '@/pages/MyRSVPs';
import RSVPsManager from '@/pages/dashboard/RSVPsManager';
import StaffScanner from '@/pages/StaffScanner';
import DashboardLayout from '@/pages/DashboardLayout';
import Overview from '@/pages/dashboard/Overview';
import EventsManager from '@/pages/dashboard/EventsManager';
import RewardsManager from '@/pages/dashboard/RewardsManager';
import AnnouncementsManager from '@/pages/dashboard/AnnouncementsManager';
import NotificationsManager from '@/pages/dashboard/NotificationsManager';
import UsersManager from '@/pages/dashboard/UsersManager';
import CheckInsManager from '@/pages/dashboard/CheckInsManager';
import ReferralsManager from '@/pages/dashboard/ReferralsManager';
import StaffManager from '@/pages/dashboard/StaffManager';
import DashboardSettings from '@/pages/dashboard/DashboardSettings';
import StaffRoute from '@/components/StaffRoute';
import Onboarding from '@/pages/Onboarding';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-transparent rounded-full animate-spin"
          style={{ borderTopColor: ' #00F5D4', boxShadow: '0 0 20px  rgba(0,245,212,0.5)' }} />
      </div>
    );
  }

  if (authError) {
    const basePath = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');
    const currentPath = window.location.pathname.startsWith(basePath)
      ? window.location.pathname.slice(basePath.length) || '/'
      : window.location.pathname;
    const authPage = ['/login', '/register', '/forgot-password', '/reset-password', '/onboarding'].includes(currentPath);

    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required' && !authPage) {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/my-rsvps" element={<MyRSVPs />} />
        <Route path="/my-tickets" element={<MyTickets />} />
      </Route>
      <Route element={<StaffRoute />}>
          <Route path="/staff" element={<StaffScanner />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<StaffRoute />}>
          <Route element={<DashboardLayout user={null} />}>
            <Route path="/dashboard" element={<Overview />} />
            <Route path="/dashboard/events" element={<EventsManager />} />
            <Route path="/dashboard/rewards" element={<RewardsManager />} />
            <Route path="/dashboard/announcements" element={<AnnouncementsManager />} />
            <Route path="/dashboard/notifications" element={<NotificationsManager />} />
            <Route path="/dashboard/users" element={<UsersManager />} />
            <Route path="/dashboard/checkins" element={<CheckInsManager />} />
            <Route path="/dashboard/referrals" element={<ReferralsManager />} />
            <Route path="/dashboard/staff" element={<StaffManager />} />
            <Route path="/dashboard/rsvps" element={<RSVPsManager />} />
            <Route path="/dashboard/settings" element={<DashboardSettings />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router basename="/NeonValley">
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
