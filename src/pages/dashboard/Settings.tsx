import { useState } from 'react';
import { Save, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

export default function Settings() {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-display font-bold text-slate-900">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2"><User size={18} /> Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button onClick={handleSave} className="gap-2"><Save size={14} /> Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {['Gift purchased', 'Item out of stock', 'Price changes', 'Registry expiration'].map((pref) => (
            <label key={pref} className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-700">{pref}</span>
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
            </label>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
