import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import * as api from '@/lib/api';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.resetPassword(email);
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset link');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-display font-bold text-slate-900">Reset Password</h1>
          <p className="text-sm text-slate-500 mt-1">We'll send you a link to reset your password</p>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <div className="h-16 w-16 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-accent-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Check Your Email</h2>
            <p className="text-sm text-slate-500 mb-6">
              We sent a password reset link to <strong>{email}</strong>
            </p>
            <Link to="/login">
              <Button variant="outline" className="gap-2">
                <ArrowLeft size={16} /> Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <Link to="/login" className="block text-center text-sm text-slate-500 hover:text-slate-700">
              <ArrowLeft size={14} className="inline mr-1" /> Back to Sign In
            </Link>
          </form>
        )}
      </Card>
    </div>
  );
}
