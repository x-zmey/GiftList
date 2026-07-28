import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gift, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back!');
      const user = useAuthStore.getState().user;
      navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600 mb-4">
            <Gift size={32} />
            <span className="font-display text-2xl font-bold">GiftList</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-slate-900">Welcome Back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage your registries</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" className="rounded border-slate-300" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-500 mb-2 font-medium">Demo Accounts:</p>
          <div className="space-y-1 text-xs text-slate-600">
            <p>Registry Owner: <button onClick={() => { setEmail('sarah@example.com'); setPassword('demo'); }} className="text-primary-600 hover:underline cursor-pointer">sarah@example.com</button></p>
            <p>Admin: <button onClick={() => { setEmail('admin@giftlist.com'); setPassword('demo'); }} className="text-primary-600 hover:underline cursor-pointer">admin@giftlist.com</button></p>
            <p className="text-slate-400">Password: any (demo mode)</p>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:underline font-medium">Create one</Link>
        </p>
      </Card>
    </div>
  );
}
