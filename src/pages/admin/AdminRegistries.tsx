import { useEffect, useState } from 'react';
import { Gift, Trash2, ExternalLink, Calendar, Search, Eye, Clock, RefreshCw, Link } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import * as api from '@/lib/api';
import type { Registry } from '@/types';
import { toast } from 'sonner';

function getDaysUntilExpiration(expiresAt: string): number {
  const now = new Date();
  const expires = new Date(expiresAt);
  return Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getExpirationColor(days: number): string {
  if (days < 0) return 'text-red-700 bg-red-100';
  if (days < 30) return 'text-red-600 bg-red-50';
  if (days < 90) return 'text-amber-600 bg-amber-50';
  return 'text-green-600 bg-green-50';
}

function getRegistryStatus(days: number): { label: string; variant: 'destructive' | 'secondary' | 'success' } {
  if (days < 0) return { label: 'Expired', variant: 'destructive' };
  if (days < 90) return { label: 'Expiring Soon', variant: 'secondary' };
  return { label: 'Active', variant: 'success' };
}

export default function AdminRegistries() {
  const [registries, setRegistries] = useState<Registry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [extending, setExtending] = useState<string | null>(null);

  useEffect(() => {
    api.getRegistries().then((regs) => {
      setRegistries(regs);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteRegistry(id);
      setRegistries(registries.filter((r) => r.id !== id));
      toast.success('Registry deleted');
    } catch {
      toast.error('Failed to delete registry');
    }
  };

  const handleExtend = async (reg: Registry) => {
    setExtending(reg.id);
    try {
      const currentExpiry = new Date(reg.expiresAt);
      currentExpiry.setFullYear(currentExpiry.getFullYear() + 1);
      const updated = await api.updateRegistry(reg.id, { expiresAt: currentExpiry.toISOString() });
      setRegistries(registries.map((r) => r.id === reg.id ? updated : r));
      toast.success(`Extended "${reg.title}" by 12 months`);
    } catch {
      toast.error('Failed to extend registry');
    } finally {
      setExtending(null);
    }
  };

  const filtered = registries.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) || r.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = registries.filter((r) => getDaysUntilExpiration(r.expiresAt) > 0).length;
  const expiringCount = registries.filter((r) => {
    const d = getDaysUntilExpiration(r.expiresAt);
    return d > 0 && d < 90;
  }).length;
  const expiredCount = registries.filter((r) => getDaysUntilExpiration(r.expiresAt) <= 0).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Registry Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            {registries.length} total &middot; {activeCount} active &middot; {expiringCount} expiring &middot; {expiredCount} expired
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Search registries..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="space-y-3">
        {filtered.map((reg) => {
          const daysLeft = getDaysUntilExpiration(reg.expiresAt);
          const status = getRegistryStatus(daysLeft);
          const expColor = getExpirationColor(daysLeft);
          const syncedCount = reg.syncedRegistries.length;

          return (
            <Card key={reg.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <img src={reg.coverImage} alt={reg.title} className="h-14 w-14 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-medium text-slate-900">{reg.title}</h3>
                    <Badge variant="secondary" className="capitalize text-xs">{reg.occasion.replace('-', ' ')}</Badge>
                    <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">by {reg.ownerName}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Eye size={11} /> {reg.viewCount} views</span>
                    <span className="flex items-center gap-1"><Link size={11} /> {syncedCount} synced</span>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500 hidden sm:block space-y-1">
                  <p className="flex items-center gap-1 justify-end"><Calendar size={12} /> Event: {new Date(reg.eventDate).toLocaleDateString()}</p>
                  <p>Created: {new Date(reg.createdAt).toLocaleDateString()}</p>
                  <p className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${expColor}`}>
                    <Clock size={10} />
                    {daysLeft < 0
                      ? `Expired ${Math.abs(daysLeft)} days ago`
                      : `${daysLeft} days left`
                    }
                  </p>
                </div>
                <div className="flex gap-1 items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => handleExtend(reg)}
                    disabled={extending === reg.id}
                    title="Extend by 12 months"
                  >
                    <RefreshCw size={12} className={extending === reg.id ? 'animate-spin' : ''} />
                    +12mo
                  </Button>
                  <a href={`/registry/${reg.slug}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink size={14} /></Button>
                  </a>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(reg.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-8">No registries found</p>
        )}
      </div>
    </div>
  );
}
