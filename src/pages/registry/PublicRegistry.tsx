import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift, Calendar, ShoppingBag, Filter, ArrowUpDown,
  ExternalLink, Check, Search, X, Heart, ShieldCheck,
  Package, TrendingDown, TrendingUp, Clock, UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import * as api from '@/lib/api';
import type { Registry, Product, PricePoint } from '@/types';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

// --- Price Sparkline Component ---
function PriceSparkline({ history }: { history: PricePoint[] }) {
  if (!history || history.length < 2) return null;

  const prices = history.slice(-14).map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = 60;
  const h = 20;
  const step = w / (prices.length - 1);

  const points = prices
    .map((p, i) => `${i * step},${h - ((p - min) / range) * (h - 4) - 2}`)
    .join(' ');

  const trending = prices[prices.length - 1] < prices[0];

  return (
    <div className="inline-flex items-center gap-1" title={`${history.length}-day price trend`}>
      <svg width={w} height={h} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={trending ? '#22c55e' : '#ef4444'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {trending ? (
        <TrendingDown size={12} className="text-green-500" />
      ) : (
        <TrendingUp size={12} className="text-red-400" />
      )}
    </div>
  );
}

// --- Pending Purchase Banner Item ---
interface PendingPurchase {
  productId: string;
  productTitle: string;
  timestamp: number;
}

export default function PublicRegistry() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [buyerMessage, setBuyerMessage] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [pendingPurchases, setPendingPurchases] = useState<PendingPurchase[]>([]);
  const [buyingProductId, setBuyingProductId] = useState<string | null>(null);

  // Load registry data
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

  // Gift giver return flow: check URL params for ?token=xxx&confirm=productId
  useEffect(() => {
    if (loading || !products.length) return;
    const confirmProductId = searchParams.get('confirm');
    const token = searchParams.get('token');
    if (confirmProductId) {
      const product = products.find((p) => p.id === confirmProductId);
      if (product && product.purchaseStatus !== 'purchased') {
        setShowConfirm(product);
        // Pre-fill method hint based on token presence
        if (token) {
          toast.info('Welcome back! Please confirm your purchase below.');
        }
      }
      // Clean up URL params
      searchParams.delete('confirm');
      searchParams.delete('token');
      setSearchParams(searchParams, { replace: true });
    }
  }, [loading, products, searchParams, setSearchParams]);

  // Buy flow handler
  const handleBuyGift = useCallback(async (product: Product) => {
    if (!registry) return;
    setBuyingProductId(product.id);
    try {
      // Track the click
      await api.recordClick(product.id, product.title, registry.id, product.store);

      // Reserve the product
      const reserved = await api.reserveProduct(product.id);
      setProducts((prev) => prev.map((p) => p.id === reserved.id ? reserved : p));

      // Add to pending purchases for the confirmation banner
      setPendingPurchases((prev) => [
        ...prev.filter((pp) => pp.productId !== product.id),
        { productId: product.id, productTitle: product.title, timestamp: Date.now() },
      ]);

      // Show guidance toast
      toast.success(
        `Your gift link is opening in a new tab. After purchasing, come back here and click "Confirm Purchase" to let ${registry.ownerName} know!`,
        { duration: 8000 }
      );

      // Open affiliate URL in new tab
      window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setBuyingProductId(null);
    }
  }, [registry]);

  // Confirm purchase handler
  const handleConfirmPurchase = async () => {
    if (!showConfirm || !buyerName.trim()) return;
    setConfirming(true);
    try {
      const updated = await api.markAsPurchased(showConfirm.id, buyerName.trim(), 'manual');
      setProducts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      // Remove from pending purchases
      setPendingPurchases((prev) => prev.filter((pp) => pp.productId !== showConfirm.id));
      setShowConfirm(null);
      setBuyerName('');
      setBuyerMessage('');
      toast.success('Thank you! The gift has been marked as purchased.');
    } catch {
      toast.error('Failed to confirm purchase. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  // Dismiss a pending purchase banner
  const dismissPending = (productId: string) => {
    setPendingPurchases((prev) => prev.filter((pp) => pp.productId !== productId));
  };

  // Open confirm dialog from banner
  const confirmFromBanner = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setShowConfirm(product);
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
    const order: Record<string, number> = { 'must-have': 0, 'nice-to-have': 1, 'dream': 2 };
    filtered.sort((a, b) => order[a.priority] - order[b.priority]);
  }

  const purchased = products.filter((p) => p.purchaseStatus === 'purchased').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Pending Purchase Confirmation Banners */}
      <AnimatePresence>
        {pendingPurchases.map((pp) => (
          <motion.div
            key={pp.productId}
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="sticky top-0 z-40 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
          >
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShoppingBag size={16} />
                <span>Did you purchase <strong>{pp.productTitle}</strong>? Click here to confirm.</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-0 gap-1.5"
                  onClick={() => confirmFromBanner(pp.productId)}
                >
                  <Check size={14} /> Confirm Purchase
                </Button>
                <button
                  onClick={() => dismissPending(pp.productId)}
                  className="text-white/70 hover:text-white transition-colors p-1"
                  aria-label="Dismiss"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

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
          {filtered.map((product, i) => {
            const isPending = pendingPurchases.some((pp) => pp.productId === product.id);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`overflow-hidden group hover:shadow-lg transition-all ${product.purchaseStatus === 'purchased' ? 'opacity-75' : ''} ${isPending ? 'ring-2 ring-amber-400' : ''}`}>
                  <div className="relative aspect-square">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

                    {/* Purchased overlay */}
                    {product.purchaseStatus === 'purchased' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Badge className="bg-accent-500 text-white border-0 text-sm px-4 py-1.5 gap-1.5">
                          <Check size={16} /> Purchased
                        </Badge>
                      </div>
                    )}

                    {/* Reserved overlay */}
                    {product.purchaseStatus === 'reserved' && !isPending && (
                      <div className="absolute inset-0 bg-amber-900/30 flex items-center justify-center">
                        <Badge className="bg-amber-500 text-white border-0 text-sm px-3 py-1.5 gap-1.5">
                          <Clock size={14} /> Someone is shopping
                        </Badge>
                      </div>
                    )}

                    {/* Out of stock badge */}
                    {!product.inStock && (
                      <Badge variant="destructive" className="absolute top-3 left-3">Out of Stock</Badge>
                    )}

                    {/* Priority badge */}
                    <Badge
                      variant={product.priority === 'must-have' ? 'default' : product.priority === 'dream' ? 'warning' : 'secondary'}
                      className="absolute top-3 right-3 capitalize text-xs"
                    >
                      {product.priority === 'must-have' ? 'Must Have' : product.priority === 'dream' ? 'Dream Gift' : 'Nice to Have'}
                    </Badge>

                    {/* Quantity badge */}
                    {product.quantity > 1 && (
                      <Badge className="absolute bottom-3 left-3 bg-slate-900/80 text-white border-0 text-xs gap-1">
                        <Package size={12} /> Qty: {product.quantity}
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-slate-900 line-clamp-2 mb-1 min-h-[2.5rem]">{product.title}</h3>
                    <p className="text-xs text-slate-500 mb-2">{product.store}</p>

                    {/* Price + Sparkline row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-900">{formatPrice(product.price)}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
                        )}
                      </div>
                      <PriceSparkline history={product.priceHistory} />
                    </div>

                    {/* Action buttons */}
                    {product.purchaseStatus === 'available' && product.inStock ? (
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 gap-1.5"
                          size="sm"
                          disabled={buyingProductId === product.id}
                          onClick={() => handleBuyGift(product)}
                        >
                          <ShoppingBag size={14} />
                          {buyingProductId === product.id ? 'Opening...' : 'Buy This Gift'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowConfirm(product)} className="gap-1.5">
                          <Check size={14} /> Confirm
                        </Button>
                      </div>
                    ) : product.purchaseStatus === 'purchased' ? (
                      <p className="text-sm text-accent-600 flex items-center gap-1.5">
                        <Heart size={14} className="fill-accent-500" />
                        Purchased by {product.purchasedBy}
                      </p>
                    ) : isPending ? (
                      <Button
                        size="sm"
                        className="w-full gap-1.5 bg-amber-500 hover:bg-amber-600"
                        onClick={() => confirmFromBanner(product.id)}
                      >
                        <UserCheck size={14} /> Return & Confirm Purchase
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="warning" className="gap-1">
                          <Clock size={12} /> Reserved
                        </Badge>
                        <span className="text-xs text-slate-400">Someone is shopping for this</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
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
      <Dialog open={!!showConfirm} onClose={() => { setShowConfirm(null); setBuyerMessage(''); }}>
        <DialogHeader>
          <DialogTitle>Confirm Your Purchase</DialogTitle>
        </DialogHeader>
        <DialogContent>
          {showConfirm && (
            <div className="space-y-4">
              {/* Product preview */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <img src={showConfirm.image} alt={showConfirm.title} className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 line-clamp-1">{showConfirm.title}</p>
                  <p className="text-sm text-slate-500">{formatPrice(showConfirm.price)}</p>
                </div>
                <Badge variant="secondary" className="gap-1 text-xs shrink-0">
                  <ShieldCheck size={12} /> Manual Confirmation
                </Badge>
              </div>

              {/* Buyer name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                <Input
                  placeholder="Enter your name"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                />
                <p className="text-xs text-slate-400 mt-1">This will be shown to the registry owner</p>
              </div>

              {/* Optional message */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Add a note for {registry?.ownerName?.split(' ')[0] || 'the couple'}!
                  <span className="text-slate-400 font-normal ml-1">(optional)</span>
                </label>
                <Textarea
                  placeholder="Congratulations! Can't wait to celebrate with you..."
                  value={buyerMessage}
                  onChange={(e) => setBuyerMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setShowConfirm(null); setBuyerMessage(''); }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmPurchase}
            disabled={confirming || !buyerName.trim()}
            className="gap-1.5"
          >
            {confirming ? (
              'Confirming...'
            ) : (
              <>
                <Check size={14} /> Confirm Purchase
              </>
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
