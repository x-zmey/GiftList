import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Menu, X, Bell, LogOut, LayoutDashboard, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors">
            <Gift size={28} strokeWidth={2.5} />
            <span className="font-display text-xl font-bold">GiftList</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">How It Works</Link>
            <Link to="/#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
            <Link to="/#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Pricing</Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/dashboard/notifications" className="relative">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Bell size={18} />
                    {unreadCount() > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary-500 text-[10px] text-white flex items-center justify-center">
                        {unreadCount()}
                      </span>
                    )}
                  </Button>
                </Link>
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-medium">
                    {user.name.charAt(0)}
                  </div>
                  <button onClick={handleLogout} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
                <Link to="/register"><Button size="sm">Create Registry</Button></Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-slate-600 cursor-pointer">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              <Link to="/#how-it-works" className="block text-sm text-slate-600 py-2" onClick={() => setMobileOpen(false)}>How It Works</Link>
              <Link to="/#features" className="block text-sm text-slate-600 py-2" onClick={() => setMobileOpen(false)}>Features</Link>
              <Link to="/#pricing" className="block text-sm text-slate-600 py-2" onClick={() => setMobileOpen(false)}>Pricing</Link>
              <hr className="border-slate-200" />
              {user ? (
                <>
                  <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 text-sm text-slate-700 py-2" onClick={() => setMobileOpen(false)}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link to="/dashboard/notifications" className="flex items-center gap-2 text-sm text-slate-700 py-2" onClick={() => setMobileOpen(false)}>
                    <Bell size={16} /> Notifications
                    {unreadCount() > 0 && <span className="ml-auto bg-primary-500 text-white text-xs rounded-full px-2 py-0.5">{unreadCount()}</span>}
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center gap-2 text-sm text-red-600 py-2 w-full cursor-pointer">
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full" size="sm"><User size={16} /> Sign In</Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full" size="sm">Create Registry</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
