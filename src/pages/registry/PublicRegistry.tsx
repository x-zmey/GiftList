import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Gift, Calendar, ShoppingBag, Filter, ArrowUpDown,
  ExternalLink, Check, Search, X, Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import * as api from '@/lib/api';
import type { Registry, Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function PublicRegistry() {
  const { slug } = useParams<{ slug: string }>();
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [filterStore, setFilterStore] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showConfirm, setShowConfirm] = useState<Product | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api.getRegistryBySlug(slug)
      .then(async (reg) => {
        setRegistry(reg);
        const prods = await api.getProducts(reg.id);
        setProducts(prods);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  const handleConfirmPurchase = async () => {
    if (!showConfirm || !buyerName) return;
    setConfirming(true);
    try {
      const updated = await api.markAsPurchased(showConfirm.id, buyerName);
      setProducts(products.map((p) => p.id === updated.id ? updated : p));
      setShowConfirm(null);
      setBuyerName('');
      toast.success('Thank you! The gift has been marked as purchased.');
    } catch {
      toast.error('Failed to confirm purchase');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Skeleton className="h-72 w-full" />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !registry) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Gift size={48} className="text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-slate-900 mb-2">Registry Not Found</h1>
          <p className="text-slate-500 mb-6">This registry may have been removed or the link is incorrect.</p>
          <Link to="/"><Button>Go Home</Button></Link>
        </div>
      </div>
    );
  }

  const stores = [...new Set(products.map((p) => p.store))];

  let filtered = products.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStore && p.store !== filterStore) return false;
    if (filterStatus && p.purchaseStatus !== filterStatus) return false;
    if (filterPriority && p.priority !== filterPriority) return false;
    return true;
  });

  if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === 'priority') {
    const order = { 'must-have': 0, 'nice-to-have': 1, 'dream': 2 };
    filtered.sort((a, b) => order[a.priority] - order[b.priority]);
  }

  const purchased = products.filter((p) => p.purchaseStatus === 'purchased').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <div className="relative h-72 md:h-80">
        <img src={registry.coverImage} alt={registry.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="mb-3 bg-white/20 text-white border-0 capitalize">{registry.occasion.replace('-', ' ')}</Badge>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">{registry.title}</h1>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-white/80 text-sm flex items-center gap-1.5">
                  <Calendar size={14} /> {new Date(registry.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-white/80 text-sm flex items-center gap-1.5">
                  <Gift size={14} /> {products.length} gifts
                </span>
                <span className="text-white/80 text-sm flex items-center gap-1.5">
                  <Check size={14} /> {purchased} purchased
                </span>
              </div>
              {registry.description && (
                <p className="text-white/70 text-sm mt-3 max-w-xl">{registry.description}</p>
              )}
            </motion.div>
          </div>
        </div>

        <Link to="/" className="absolute top-4 left-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <Gift size={22} />
          <span className="font-display font-bold text-sm">GiftList</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search gifts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white" />
          </div>
          <Select value={filterStore} onChange={(e) => setFilterStore(e.target.value)} className="w-40 bg-white">
            <option value="">All Stores</option>
            {stores.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-40 bg-white">
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="purchased">Purchased</option>
            <option value="reserved">Reserved</option>
          </Select>
          <Select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="w-40 bg-white">
            <option value="">All Priorities</option>
            <option value="must-have">Must Have</option>
            <option value="nice-to-have">Nice to Have</option>
            <option value="dream">Dream</option>
          </Select>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-40 bg-white">
            <option value="default">Sort By</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="priority">Priority</option>
          </Select>
        </div>

        {/* Progress bar */}
        <div className="mb-8 bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Gift Fulfillment</span>
            <span className="text-sm font-bold text-primary-600">
              {products.length > 0 ? Math.round((purchased / products.length) * 100) : 0}% Complete
            </span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all"
              style={{ width: `${products.length > 0 ? (purchased / products.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`overflow-hidden group hover:shadow-lg transition-all ${product.purchaseStatus === 'purchased' ? 'opacity-75' : ''}`}>
                <div className="relative aspect-square">
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {product.purchaseStatus === 'purchased' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Badge className="bg-accent-500 text-white border-0 text-sm px-4 py-1.5 gap-1.5">
                        <Check size={16} /> Purchased
                      </Badge>
                    </div>
                  )}
                  {!product.inStock && (
                    <Badge variant="destructive" className="absolute top-3 left-3">Out of Stock</Badge>
                  )}
                  <Badge
                    variant={product.priority === 'must-have' ? 'default' : product.priority === 'dream' ? 'warning' : 'secondary'}
                    className="absolute top-3 right-3 capitalize text-xs"
                  >
                    {product.priority === 'must-have' ? 'Must Have' : product.priority === 'dream' ? 'Dream Gift' : 'Nice to Have'}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium text-slate-900 line-clamp-2 mb-1 min-h-[2.5rem]">{product.title}</h3>
                  <p className="text-xs text-slate-500 mb-3">{product.store}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xl font-bold text-slate-900">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-slate-400 line-through ml-2">{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>
                  </div>
                  {product.purchaseStatus === 'available' && product.inStock ? (
                    <div className="flex gap-2">
                      <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button className="w-full gap-1.5" size="sm">
                          <ShoppingBag size={14} /> Buy This Gift
                        </Button>
                      </a>
                      <Button variant="outline" size="sm" onClick={() => setShowConfirm(product)} className="gap-1.5">
                        <Check size={14} /> Confirm
                      </Button>
                    </div>
                  ) : product.purchaseStatus === 'purchased' ? (
                    <p className="text-sm text-accent-600 flex items-center gap-1.5">
                      <Heart size={14} className="fill-accent-500" />
                      Purchased by {product.purchasedBy}
                    </p>
                  ) : (
                    <Badge variant="warning">Reserved</Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No gifts match your filters.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700">
            <Gift size={18} />
            <span className="font-display font-bold text-sm">Powered by GiftList</span>
          </Link>
          <p className="text-xs text-slate-400 mt-2">Create your own free registry at giftlist.com</p>
        </div>
      </div>

      {/* Confirm Purchase Dialog */}
      <Dialog open={!!showConfirm} onClose={() => setShowConfirm(null)}>
        <DialogHeader>
          <DialogTitle>Confirm Your Purchase</DialogTitle>
        </DialogHeader>
        <DialogContent>
          {showConfirm && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <img src={showConfirm.image} alt={showConfirm.title} className="h-16 w-16 rounded-lg object-cover" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{showConfirm.title}</p>
                  <p className="text-sm text-slate-500">{formatPrice(showConfirm.price)}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                <Input
                  placeholder="Enter your name"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                />
                <p className="text-xs text-slate-400 mt-1">This will be shown to the registry owner</p>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowConfirm(null)}>Cancel</Button>
          <Button onClick={handleConfirmPurchase} disabled={confirming || !buyerName}>
            {confirming ? 'Confirming...' : 'Confirm Purchase'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
