import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Star, Plus, Check, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import * as api from '@/lib/api';
import type { CatalogProduct, Registry } from '@/types';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

export default function AddProducts() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const preselectedRegistry = searchParams.get('registry');

  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [registries, setRegistries] = useState<Registry[]>([]);
  const [selectedRegistry, setSelectedRegistry] = useState(preselectedRegistry || '');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.getCatalogProducts(),
      api.getRegistries(user.id),
    ]).then(([cat, regs]) => {
      setCatalog(cat);
      setRegistries(regs);
      if (!selectedRegistry && regs.length > 0) setSelectedRegistry(regs[0].id);
      setLoading(false);
    });
  }, [user]);

  const handleAdd = async (catalogId: string) => {
    if (!selectedRegistry) {
      toast.error('Please select a registry first');
      return;
    }
    setAdding(catalogId);
    try {
      await api.addFromCatalog(selectedRegistry, catalogId);
      setAddedIds(new Set([...addedIds, catalogId]));
      toast.success('Product added to registry!');
    } catch {
      toast.error('Failed to add product');
    } finally {
      setAdding(null);
    }
  };

  const categories = [...new Set(catalog.map((p) => p.category))];
  const filtered = catalog.filter((p) => {
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || p.category === category;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Product Catalog</h1>
        <p className="text-sm text-slate-500 mt-1">Browse top products and add them to your registry</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-48">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select value={selectedRegistry} onChange={(e) => setSelectedRegistry(e.target.value)} className="w-56">
          <option value="">Select registry...</option>
          {registries.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((product) => (
          <Card key={product.id} className="overflow-hidden group hover:shadow-md transition-shadow">
            <div className="aspect-square relative">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              <Badge variant="secondary" className="absolute top-3 left-3">{product.category}</Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-slate-900 line-clamp-2 mb-1">{product.title}</h3>
              <p className="text-xs text-slate-500 mb-2">{product.store}</p>
              <div className="flex items-center gap-1 mb-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < Math.floor(product.rating) ? 'fill-warm-400 text-warm-400' : 'text-slate-200'} />
                  ))}
                </div>
                <span className="text-xs text-slate-500">({product.reviewCount.toLocaleString()})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
                {addedIds.has(product.id) ? (
                  <Button variant="secondary" size="sm" disabled className="gap-1">
                    <Check size={14} /> Added
                  </Button>
                ) : (
                  <Button size="sm" className="gap-1" onClick={() => handleAdd(product.id)} disabled={adding === product.id || !selectedRegistry}>
                    {adding === product.id ? (
                      <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Plus size={14} />
                    )}
                    Add
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No products found matching your search.</p>
        </div>
      )}
    </div>
  );
}
