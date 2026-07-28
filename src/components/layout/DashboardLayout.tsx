import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Gift, LayoutDashboard, ListPlus, Package, Bell, Settings,
  LogOut, Menu, X, ChevronRight, Users, BarChart3, Link2, ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { cn } from '@/lib/utils';

const ownerNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/registries', icon: Gift, label: 'My Registries' },
  { to: '/dashboard/add-products', icon: ListPlus, label: 'Add Products' },
  { to: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

const adminNav = [
  { to: '/admin', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/registries', icon: Gift, label: 'Registries' },
  { to: '/admin/affiliates', icon: Link2, label: 'Affiliate Engine' },
  { to: '/admin/products', icon: Package, label: 'Product Catalog' },
  { to: '/admin/users', icon: Users, label: 'Users' },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = user.role === 'admin' ? adminNav : ownerNav;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 h-14 flex items-center px-4 gap-3">
        <button onClick={() => setSidebarOpen(true)} className="text-slate-600 cursor-pointer">
          <Menu size={22} />
        </button>
        <Link to="/" className="flex items-center gap-2 text-primary-600">
          <Gift size={22} />
          <span className="font-display font-bold">GiftList</span>
        </Link>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2 text-primary-600">
            <Gift size={24} />
            <span className="font-display text-lg font-bold">GiftList</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {user.role === 'admin' && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg px-3 py-2">
              <ShieldCheck size={14} />
              Admin Portal
            </div>
          </div>
        )}

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== '/dashboard' && item.to !== '/admin' && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <item.icon size={18} />
                {item.label}
                {item.label === 'Notifications' && unreadCount() > 0 && (
                  <span className="ml-auto bg-primary-500 text-white text-xs rounded-full px-2 py-0.5">{unreadCount()}</span>
                )}
                {isActive && <ChevronRight size={14} className="ml-auto text-primary-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors w-full cursor-pointer"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
