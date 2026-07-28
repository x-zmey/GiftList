import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

import Landing from '@/pages/Landing';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import NotFound from '@/pages/NotFound';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Overview from '@/pages/dashboard/Overview';
import Registries from '@/pages/dashboard/Registries';
import RegistryDetail from '@/pages/dashboard/RegistryDetail';
import AddProducts from '@/pages/dashboard/AddProducts';
import Notifications from '@/pages/dashboard/Notifications';
import Settings from '@/pages/dashboard/Settings';

import PublicRegistry from '@/pages/registry/PublicRegistry';

import Analytics from '@/pages/admin/Analytics';
import AdminRegistries from '@/pages/admin/AdminRegistries';
import Affiliates from '@/pages/admin/Affiliates';
import CatalogManagement from '@/pages/admin/CatalogManagement';
import UserManagement from '@/pages/admin/UserManagement';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user, initialized } = useAuthStore();
  if (!initialized) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  const { init, user } = useAuthStore();
  const { fetch: fetchNotifications } = useNotificationStore();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (user) fetchNotifications(user.id);
  }, [user]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: "'DM Sans', sans-serif" },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/registry/:slug" element={<PublicRegistry />} />

        {/* Registry Owner Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Overview />} />
          <Route path="registries" element={<Registries />} />
          <Route path="registries/:id" element={<RegistryDetail />} />
          <Route path="add-products" element={<AddProducts />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Admin Dashboard */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Analytics />} />
          <Route path="registries" element={<AdminRegistries />} />
          <Route path="affiliates" element={<Affiliates />} />
          <Route path="products" element={<CatalogManagement />} />
          <Route path="users" element={<UserManagement />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
