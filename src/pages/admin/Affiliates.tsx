import { useEffect, useState } from 'react';
import { Link2, Plus, Edit2, Trash2, DollarSign, MousePointerClick } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import * as api from '@/lib/api';
import type { AffiliateConfig } from '@/types';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function Affiliates() {
  const [affiliates, setAffiliates] = useState<AffiliateConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<AffiliateConfig | null>(null);
  const [form, setForm] = useState({ store: '', affiliateId: '', affiliateNetwork: '', urlPattern: '', isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getAffiliates().then((a) => {
      setAffiliates(a);
      setLoading(false);
    });
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ store: '', affiliateId: '', affiliateNetwork: '', urlPattern: '', isActive: true });
    setShowDialog(true);
  };

  const openEdit = (aff: AffiliateConfig) => {
    setEditing(aff);
    setForm({ store: aff.store, affiliateId: aff.affiliateId, affiliateNetwork: aff.affiliateNetwork, urlPattern: aff.urlPattern, isActive: aff.isActive });
    setShowDialog(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.updateAffiliate(editing.id, form);
        setAffiliates(affiliates.map((a) => a.id === editing.id ? updated : a));
        toast.success('Affiliate updated');
      } else {
        const created = await api.createAffiliate(form);
        setAffiliates([...affiliates, created]);
        toast.success('Affiliate created');
      }
      setShowDialog(false);
    } catch {
      toast.error('Failed to save affiliate');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAffiliate(id);
      setAffiliates(affiliates.filter((a) => a.id !== id));
      toast.success('Affiliate deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleToggle = async (aff: AffiliateConfig) => {
    const updated = await api.updateAffiliate(aff.id, { isActive: !aff.isActive });
    setAffiliates(affiliates.map((a) => a.id === aff.id ? updated : a));
    toast.success(`${aff.store} ${updated.isActive ? 'activated' : 'deactivated'}`);
  };

  const totalRevenue = affiliates.reduce((s, a) => s + a.totalRevenue, 0);
  const totalClicks = affiliates.reduce((s, a) => s + a.totalClicks, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Affiliate Engine</h1>
          <p className="text-sm text-slate-500 mt-1">Manage affiliate IDs and track performance</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus size={16} /> Add Affiliate</Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent-100 flex items-center justify-center text-accent-600"><DollarSign size={24} /></div>
            <div><p className="text-2xl font-bold text-slate-900">{formatPrice(totalRevenue)}</p><p className="text-xs text-slate-500">Total Revenue</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600"><MousePointerClick size={24} /></div>
            <div><p className="text-2xl font-bold text-slate-900">{totalClicks.toLocaleString()}</p><p className="text-xs text-slate-500">Total Clicks</p></div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {affiliates.map((aff) => (
          <Card key={aff.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Link2 size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-slate-900">{aff.store}</h3>
                  <Badge variant={aff.isActive ? 'success' : 'secondary'}>{aff.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                <p className="text-xs text-slate-500">
                  ID: {aff.affiliateId} | Network: {aff.affiliateNetwork} | Pattern: {aff.urlPattern}
                </p>
              </div>
              <div className="text-right text-xs text-slate-600 hidden sm:block">
                <p>{aff.totalClicks.toLocaleString()} clicks</p>
                <p className="font-medium">{formatPrice(aff.totalRevenue)} revenue</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleToggle(aff)} className="text-xs">
                  {aff.isActive ? 'Disable' : 'Enable'}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(aff)}><Edit2 size={14} /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(aff.id)}><Trash2 size={14} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogHeader><DialogTitle>{editing ? 'Edit Affiliate' : 'Add Affiliate'}</DialogTitle></DialogHeader>
        <DialogContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Store Name</label>
            <Input value={form.store} onChange={(e) => setForm({ ...form, store: e.target.value })} placeholder="e.g., Amazon" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Affiliate ID</label>
            <Input value={form.affiliateId} onChange={(e) => setForm({ ...form, affiliateId: e.target.value })} placeholder="e.g., giftlist-20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Affiliate Network</label>
            <Select value={form.affiliateNetwork} onChange={(e) => setForm({ ...form, affiliateNetwork: e.target.value })}>
              <option value="">Select network...</option>
              <option value="Amazon Associates">Amazon Associates</option>
              <option value="CJ Affiliate">CJ Affiliate</option>
              <option value="ShareASale">ShareASale</option>
              <option value="Impact">Impact</option>
              <option value="Rakuten">Rakuten</option>
              <option value="Other">Other</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">URL Pattern</label>
            <Input value={form.urlPattern} onChange={(e) => setForm({ ...form, urlPattern: e.target.value })} placeholder="e.g., amazon.com" />
            <p className="text-xs text-slate-400 mt-1">The domain pattern to match when applying this affiliate ID</p>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.store || !form.affiliateId}>
            {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
