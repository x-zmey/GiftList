import { useEffect, useState } from 'react';
import { Gift, Trash2, ExternalLink, Calendar, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import * as api from '@/lib/api';
import type { Registry } from '@/types';
import { toast } from 'sonner';

export default function AdminRegistries() {
  const [registries, setRegistries] = useState<Registry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filtered = registries.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) || r.ownerName.toLowerCase().includes(search.toLowerCase())
  );

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
          <p className="text-sm text-slate-500 mt-1">{registries.length} total registries</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Search registries..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="space-y-3">
        {filtered.map((reg) => (
          <Card key={reg.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <img src={reg.coverImage} alt={reg.title} className="h-14 w-14 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-slate-900">{reg.title}</h3>
                  <Badge variant="secondary" className="capitalize text-xs">{reg.occasion.replace('-', ' ')}</Badge>
                </div>
                <p className="text-xs text-slate-500">by {reg.ownerName}</p>
              </div>
              <div className="text-right text-xs text-slate-500 hidden sm:block">
                <p className="flex items-center gap-1"><Calendar size={12} /> {new Date(reg.eventDate).toLocaleDateString()}</p>
                <p>Created: {new Date(reg.createdAt).toLocaleDateString()}</p>
                <p>Expires: {new Date(reg.expiresAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-1">
                <a href={`/registry/${reg.slug}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink size={14} /></Button>
                </a>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(reg.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
