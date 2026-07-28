import { useEffect, useState } from 'react';
import { Package, Star, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import * as api from '@/lib/api';
import type { CatalogProduct } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function CatalogManagement() {
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    api.getCatalogProducts().then((c) => {
      setCatalog(c);
      setLoading(false);
    });
  }, []);

  const categories = [...new Set(catalog.map((p) => p.category))];
  const filtered = catalog.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && p.category !== category) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Product Catalog</h1>
        <p className="text-sm text-slate-500 mt-1">{catalog.length} products in the internal catalog</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search catalog..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-48">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              <Badge variant="secondary" className="absolute top-3 left-3">{product.category}</Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-slate-900 line-clamp-2 mb-1">{product.title}</h3>
              <p className="text-xs text-slate-500 mb-2">{product.store}</p>
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} className={i < Math.floor(product.rating) ? 'fill-warm-400 text-warm-400' : 'text-slate-200'} />
                ))}
                <span className="text-xs text-slate-500 ml-1">({product.reviewCount.toLocaleString()})</span>
              </div>
              <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
