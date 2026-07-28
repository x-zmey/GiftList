import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Calendar, ExternalLink, Trash2, Share2, Copy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import * as api from '@/lib/api';
import type { Registry } from '@/types';
import { toast } from 'sonner';

const OCCASIONS = ['wedding', 'baby-shower', 'birthday', 'housewarming', 'graduation', 'holiday', 'other'] as const;
const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1200&h=600&fit=crop',
];

export default function Registries() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [registries, setRegistries] = useState<Registry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [title, setTitle] = useState('');
  const [occasion, setOccasion] = useState<string>('wedding');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!user) return;
    api.getRegistries(user.id).then((regs) => {
      setRegistries(regs);
      setLoading(false);
    });
  }, [user]);

  const handleCreate = async () => {
    if (!user || !title || !eventDate) return;
    setCreating(true);
    try {
      const reg = await api.createRegistry({
        ownerId: user.id,
        ownerName: user.name,
        title,
        occasion: occasion as Registry['occasion'],
        eventDate,
        description,
        coverImage: COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)],
        isPublic: true,
      });
      setRegistries([...registries, reg]);
      setShowCreate(false);
      setTitle('');
      setDescription('');
      toast.success('Registry created!');
      navigate(`/dashboard/registries/${reg.id}`);
    } catch {
      toast.error('Failed to create registry');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteRegistry(id);
      setRegistries(registries.filter((r) => r.id !== id));
      toast.success('Registry deleted');
    } catch {
      toast.error('Failed to delete registry');
    }
  };

  const copyShareLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/registry/${slug}`);
    toast.success('Registry link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-slate-900">My Registries</h1>
        <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus size={16} /> New Registry</Button>
      </div>

      {registries.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <Plus size={28} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-display font-semibold text-slate-900 mb-2">Create Your First Registry</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Get started by creating a registry for your wedding, baby shower, birthday, or any special occasion.
            </p>
            <Button onClick={() => setShowCreate(true)} className="gap-2"><Plus size={16} /> Create Registry</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {registries.map((reg) => (
            <Card key={reg.id} className="overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative h-36">
                <img src={reg.coverImage} alt={reg.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-white font-display font-semibold text-lg">{reg.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-white/20 text-white border-0 capitalize text-xs">{reg.occasion.replace('-', ' ')}</Badge>
                    <span className="text-white/80 text-xs flex items-center gap-1"><Calendar size={12} /> {new Date(reg.eventDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{reg.description}</p>
                <div className="flex items-center gap-2">
                  <Link to={`/dashboard/registries/${reg.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <ExternalLink size={14} /> Manage
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyShareLink(reg.slug)}>
                    <Share2 size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(reg.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)}>
        <DialogHeader>
          <DialogTitle>Create New Registry</DialogTitle>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Registry Name</label>
            <Input placeholder="e.g., Sarah & David's Wedding" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Occasion</label>
            <Select value={occasion} onChange={(e) => setOccasion(e.target.value)}>
              {OCCASIONS.map((o) => (
                <option key={o} value={o}>{o.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Event Date</label>
            <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <Textarea
              placeholder="Tell your guests about your event..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={creating || !title || !eventDate}>
            {creating ? 'Creating...' : 'Create Registry'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
