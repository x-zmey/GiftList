import { useEffect, useState } from 'react';
import { Package, Star, Search, Plus, Trash2, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import * as api from '@/lib/api';
import type { CatalogProduct } from '@/types';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

const EMPTY_FORM = {
  title: '', price: '', image: '', store: '', storeUrl: '', category: '', rating: '', reviewCount: '',
};

export default function CatalogManagement() {
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getCatalogProducts().then((c) => {
      setCatalog(c);
      setLoading(false);
    });
  }, []);

  const categories = [...new Set(catalog.map((p) => p.category))].sort();
  const filtered = catalog.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && p.category !== category) return false;
    return true;
  });

  const categoryBreakdown = categories.map((cat) => ({
    category: cat,
    count: catalog.filter((p) => p.category === cat).length,
  }));

  const handleAddProduct = async () => {
    if (!form.title || !form.price || !form.store || !form.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const newProduct = await api.addCatalogProduct({
        title: form.title,
        price: parseFloat(form.price),
        image: form.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=80',
        store: form.store,
        storeUrl: form.storeUrl,
        category: form.category,
        rating: parseFloat(form.rating) || 0,
        reviewCount: parseInt(form.reviewCount) || 0,
      });
      setCatalog([...catalog, newProduct]);
      setForm(EMPTY_FORM);
      setShowAddDialog(false);
      toast.success('Product added to catalog');
    } catch {
      toast.error('Failed to add product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteCatalogProduct(id);
      setCatalog(catalog.filter((p) => p.id !== id));
      toast.success('Product removed from catalog');
    } catch {
      toast.error('Failed to delete product');
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Product Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">{catalog.length} products in the internal catalog</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus size={16} /> Add Product
        </Button>
      </div>

      {/* Category breakdown stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <BarChart3 size={16} /> Catalog Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="text-xs px-3 py-1">
              Total: {catalog.length}
            </Badge>
            {categoryBreakdown.map((cb) => (
              <Badge
                key={cb.category}
                variant="secondary"
                className="text-xs px-3 py-1 cursor-pointer hover:bg-slate-200 transition-colors"
                onClick={() => setCategory(category === cb.category ? '' : cb.category)}
              >
                {cb.category}: {cb.count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

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

      <p className="text-xs text-slate-400">{filtered.length} products shown</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((product) => (
          <Card key={product.id} className="overflow-hidden group relative">
            <div className="aspect-video relative">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              <Badge variant="secondary" className="absolute top-3 left-3">{product.category}</Badge>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 bg-white/80 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(product.id)}
              >
                <Trash2 size={14} />
              </Button>
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

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)}>
        <DialogHeader><DialogTitle>Add Catalog Product</DialogTitle></DialogHeader>
        <DialogContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Product name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price *</label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="29.99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Store *</label>
              <Input
                value={form.store}
                onChange={(e) => setForm({ ...form, store: e.target.value })}
                placeholder="e.g., Amazon"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
            <Input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Store URL</label>
            <Input
              value={form.storeUrl}
              onChange={(e) => setForm({ ...form, storeUrl: e.target.value })}
              placeholder="https://store.com/product"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g., Kitchen, Electronics"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                placeholder="4.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Review Count</label>
              <Input
                type="number"
                value={form.reviewCount}
                onChange={(e) => setForm({ ...form, reviewCount: e.target.value })}
                placeholder="1000"
              />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddProduct}
            disabled={saving || !form.title || !form.price || !form.store || !form.category}
          >
            {saving ? 'Adding...' : 'Add Product'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
