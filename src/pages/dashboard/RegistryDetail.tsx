import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Share2, ExternalLink, Plus, Trash2, Globe, Link2,
  ShoppingBag, Copy, RefreshCw, CheckCircle2, XCircle, MinusCircle,
  Pencil, Mail, QrCode, Clock, TrendingDown, TrendingUp, Package,
  BarChart3, Eye, Star, StickyNote, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import * as api from '@/lib/api';
import type { Registry, Product, ImportPipelineResult, ImportLayerResult } from '@/types';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Pipeline Step Visualization ──────────────────────────────────

function PipelineVisualization({
  pipeline,
  running,
  currentLayer,
}: {
  pipeline: ImportPipelineResult | null;
  running: boolean;
  currentLayer: number;
}) {
  const layerNames = [
    'OpenGraph & Meta Tags',
    'Headless Browser (Playwright)',
    'Dedicated Store Parser',
    'Managed Scraping Service (Zyte)',
  ];

  const layers = pipeline?.layers || [];

  return (
    <div className="space-y-2 mt-4">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
        Import Pipeline
      </p>
      {layerNames.map((name, i) => {
        const layerNum = i + 1;
        const layerResult = layers.find((l) => l.layer === layerNum);
        const isRunning = running && currentLayer === layerNum;
        const status = layerResult?.status;
        const duration = layerResult?.duration || 0;

        let statusIcon = <MinusCircle size={16} className="text-slate-300" />;
        let statusLabel = 'Waiting';
        let bgClass = 'bg-slate-50 border-slate-200';

        if (isRunning) {
          statusIcon = <Loader2 size={16} className="text-blue-500 animate-spin" />;
          statusLabel = 'Running...';
          bgClass = 'bg-blue-50 border-blue-200';
        } else if (status === 'success') {
          statusIcon = <CheckCircle2 size={16} className="text-green-500" />;
          statusLabel = `Success (${duration}ms)`;
          bgClass = 'bg-green-50 border-green-200';
        } else if (status === 'failed') {
          statusIcon = <XCircle size={16} className="text-red-500" />;
          statusLabel = `Failed (${duration}ms)`;
          bgClass = 'bg-red-50 border-red-200';
        } else if (status === 'skipped') {
          statusIcon = <MinusCircle size={16} className="text-slate-400" />;
          statusLabel = 'Skipped';
          bgClass = 'bg-slate-50 border-slate-200';
        }

        return (
          <div
            key={layerNum}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${bgClass}`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs font-bold text-slate-400 shrink-0">L{layerNum}</span>
              {statusIcon}
              <span className="text-sm font-medium text-slate-700 truncate">
                {layerResult?.name || name}
              </span>
            </div>
            <span className="text-xs text-slate-500 shrink-0">{statusLabel}</span>
          </div>
        );
      })}
      {pipeline?.success && pipeline.finalResult && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs font-medium text-green-700 mb-1">Extracted Data</p>
          <div className="text-sm text-green-800 space-y-0.5">
            <p className="truncate">Title: {pipeline.finalResult.title}</p>
            <p>Price: {formatPrice(pipeline.finalResult.price)}</p>
            <p>Store: {pipeline.finalResult.store}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mini Price History Chart ─────────────────────────────────────

function PriceHistoryChart({ product }: { product: Product }) {
  const history = product.priceHistory || [];
  const recent = history.slice(-14);

  if (recent.length === 0) {
    return (
      <p className="text-xs text-slate-400 text-center py-4">No price history available</p>
    );
  }

  const prices = recent.map((p) => p.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const range = maxPrice - minPrice || 1;

  const currentPrice = prices[prices.length - 1];
  const firstPrice = prices[0];
  const change = currentPrice - firstPrice;
  const changePercent = firstPrice > 0 ? ((change / firstPrice) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Price History (Last {recent.length} days)
        </p>
        <div className="flex items-center gap-1">
          {change < 0 ? (
            <TrendingDown size={14} className="text-green-500" />
          ) : change > 0 ? (
            <TrendingUp size={14} className="text-red-500" />
          ) : null}
          <span
            className={`text-xs font-medium ${
              change < 0 ? 'text-green-600' : change > 0 ? 'text-red-600' : 'text-slate-500'
            }`}
          >
            {change >= 0 ? '+' : ''}
            {changePercent}%
          </span>
        </div>
      </div>

      <div className="flex items-end gap-1 h-24">
        {recent.map((point, i) => {
          const height = ((point.price - minPrice) / range) * 100;
          const barHeight = Math.max(height, 4);
          const isLatest = i === recent.length - 1;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1 group relative"
            >
              <div
                className={`w-full rounded-t transition-colors ${
                  !point.inStock
                    ? 'bg-red-300'
                    : isLatest
                    ? 'bg-primary-500'
                    : 'bg-primary-200 group-hover:bg-primary-400'
                }`}
                style={{ height: `${barHeight}%`, minHeight: '3px' }}
              />
              <div className="absolute bottom-full mb-1 hidden group-hover:block z-10">
                <div className="bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  {formatPrice(point.price)}
                  <br />
                  {point.date}
                  {!point.inStock && (
                    <>
                      <br />
                      <span className="text-red-300">Out of stock</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{recent[0]?.date}</span>
        <span>{recent[recent.length - 1]?.date}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
        <div className="text-center">
          <p className="text-xs text-slate-400">Min</p>
          <p className="text-sm font-semibold text-green-600">{formatPrice(minPrice)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400">Current</p>
          <p className="text-sm font-semibold text-slate-900">{formatPrice(currentPrice)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400">Max</p>
          <p className="text-sm font-semibold text-red-600">{formatPrice(maxPrice)}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export default function RegistryDetail() {
  const { id } = useParams<{ id: string }>();
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // URL Import
  const [showUrlImport, setShowUrlImport] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importPipeline, setImportPipeline] = useState<ImportPipelineResult | null>(null);
  const [pipelineCurrentLayer, setPipelineCurrentLayer] = useState(0);

  // Sync dialogs
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [syncPlatform, setSyncPlatform] = useState('');
  const [syncUrl, setSyncUrl] = useState('');
  const [syncing, setSyncing] = useState(false);

  // Share modal
  const [showShareModal, setShowShareModal] = useState(false);

  // Product detail / price history
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Edit product dialog
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    image: '',
    category: '',
    priority: 'nice-to-have' as Product['priority'],
    quantity: '1',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  // Manual add dialog
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualForm, setManualForm] = useState({
    title: '',
    price: '',
    image: '',
    store: '',
    storeUrl: '',
    category: '',
  });
  const [addingManual, setAddingManual] = useState(false);

  // Re-sync loading per synced registry
  const [resyncingIds, setResyncingIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [reg, prods] = await Promise.all([api.getRegistry(id), api.getProducts(id)]);
      setRegistry(reg);
      setProducts(prods);
    } catch {
      toast.error('Failed to load registry data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── URL Import with pipeline visualization ──────

  const handleUrlImport = async () => {
    if (!id || !importUrl) return;
    setImporting(true);
    setImportPipeline(null);
    setPipelineCurrentLayer(1);

    const layerTimer = setInterval(() => {
      setPipelineCurrentLayer((prev) => {
        if (prev < 4) return prev + 1;
        return prev;
      });
    }, 700);

    try {
      const { product, pipeline } = await api.importProductFromUrl(id, importUrl);
      clearInterval(layerTimer);
      setPipelineCurrentLayer(0);
      setImportPipeline(pipeline);
      setProducts((prev) => [...prev, product]);
      toast.success('Product imported successfully!');

      setTimeout(() => {
        setShowUrlImport(false);
        setImportUrl('');
        setImportPipeline(null);
      }, 2500);
    } catch {
      clearInterval(layerTimer);
      setPipelineCurrentLayer(0);
      toast.error('Failed to import product');
    } finally {
      setImporting(false);
    }
  };

  // ─── Sync ────────────────────────────────────────

  const handleSync = async () => {
    if (!id || !syncPlatform || !syncUrl) return;
    setSyncing(true);
    try {
      await api.addSyncedRegistry(id, syncPlatform, syncUrl);
      const updated = await api.getRegistry(id);
      setRegistry(updated);
      setShowSyncDialog(false);
      setSyncPlatform('');
      setSyncUrl('');
      toast.success('Registry sync started! Items will appear shortly.');
    } catch {
      toast.error('Failed to add synced registry');
    } finally {
      setSyncing(false);
    }
  };

  // ─── Re-sync a synced registry ───────────────────

  const handleResync = async (syncedId: string, platform: string) => {
    if (!id) return;
    setResyncingIds((prev) => new Set(prev).add(syncedId));
    try {
      const sr = registry?.syncedRegistries.find((s) => s.id === syncedId);
      if (!sr) return;
      await api.removeSyncedRegistry(id, syncedId);
      await api.addSyncedRegistry(id, sr.platform, sr.url);
      toast.success(`Re-syncing ${platform}... Items will update shortly.`);
      setTimeout(async () => {
        const updated = await api.getRegistry(id);
        setRegistry(updated);
        setResyncingIds((prev) => {
          const next = new Set(prev);
          next.delete(syncedId);
          return next;
        });
      }, 3500);
    } catch {
      toast.error(`Failed to re-sync ${platform}`);
      setResyncingIds((prev) => {
        const next = new Set(prev);
        next.delete(syncedId);
        return next;
      });
    }
  };

  // ─── Remove synced registry ──────────────────────

  const handleRemoveSynced = async (syncedId: string) => {
    if (!id) return;
    try {
      await api.removeSyncedRegistry(id, syncedId);
      setRegistry((prev) =>
        prev
          ? { ...prev, syncedRegistries: prev.syncedRegistries.filter((s) => s.id !== syncedId) }
          : prev
      );
      toast.success('Synced registry removed');
    } catch {
      toast.error('Failed to remove synced registry');
    }
  };

  // ─── Delete product ─────────────────────────────

  const handleDeleteProduct = async (productId: string) => {
    try {
      await api.deleteProduct(productId);
      setProducts(products.filter((p) => p.id !== productId));
      toast.success('Product removed');
    } catch {
      toast.error('Failed to remove product');
    }
  };

  // ─── Priority change ────────────────────────────

  const handlePriorityChange = async (productId: string, priority: Product['priority']) => {
    try {
      const updated = await api.updateProduct(productId, { priority });
      setProducts(products.map((p) => (p.id === productId ? updated : p)));
    } catch {
      toast.error('Failed to update priority');
    }
  };

  // ─── Edit product ───────────────────────────────

  const openEditDialog = (product: Product) => {
    setEditProduct(product);
    setEditForm({
      title: product.title,
      price: String(product.price),
      image: product.image,
      category: product.category,
      priority: product.priority,
      quantity: String(product.quantity),
      notes: product.notes || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editProduct) return;
    setSaving(true);
    try {
      const updated = await api.updateProduct(editProduct.id, {
        title: editForm.title,
        price: parseFloat(editForm.price) || editProduct.price,
        image: editForm.image,
        category: editForm.category,
        priority: editForm.priority,
        quantity: parseInt(editForm.quantity, 10) || 1,
        notes: editForm.notes || undefined,
      });
      setProducts(products.map((p) => (p.id === editProduct.id ? updated : p)));
      setEditProduct(null);
      toast.success('Product updated');
    } catch {
      toast.error('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  // ─── Manual add ─────────────────────────────────

  const handleManualAdd = async () => {
    if (!id) return;
    const { title, price, image, store, storeUrl, category } = manualForm;
    if (!title || !price) {
      toast.error('Title and price are required');
      return;
    }
    setAddingManual(true);
    try {
      const product = await api.addProduct({
        registryId: id,
        title,
        price: parseFloat(price),
        image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=80',
        store: store || 'Other',
        storeUrl: storeUrl || '',
        affiliateUrl: storeUrl || '',
        category: category || 'General',
        priority: 'nice-to-have',
        purchaseStatus: 'available',
        addedVia: 'manual',
        inStock: true,
        quantity: 1,
      });
      setProducts((prev) => [...prev, product]);
      setShowManualAdd(false);
      setManualForm({ title: '', price: '', image: '', store: '', storeUrl: '', category: '' });
      toast.success('Product added manually');
    } catch {
      toast.error('Failed to add product');
    } finally {
      setAddingManual(false);
    }
  };

  // ─── Share helpers ──────────────────────────────

  const shareUrl = registry ? `${window.location.origin}/registry/${registry.slug}` : '';

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Registry link copied!');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out ${registry?.title}`);
    const body = encodeURIComponent(
      `I'd love for you to take a look at my gift registry!\n\n${shareUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  };

  // ─── Computed ───────────────────────────────────

  const purchased = useMemo(() => products.filter((p) => p.purchaseStatus === 'purchased'), [products]);
  const available = useMemo(() => products.filter((p) => p.purchaseStatus === 'available'), [products]);
  const totalValue = useMemo(() => products.reduce((s, p) => s + p.price * p.quantity, 0), [products]);

  const statusColor = (s: Product['purchaseStatus']) => {
    switch (s) {
      case 'purchased':
        return 'success';
      case 'reserved':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const priorityIcon = (p: Product['priority']) => {
    switch (p) {
      case 'must-have':
        return <Star size={12} className="text-amber-500 fill-amber-500" />;
      case 'dream':
        return <Star size={12} className="text-purple-500 fill-purple-500" />;
      default:
        return <Star size={12} className="text-slate-300" />;
    }
  };

  // ─── Loading ────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      </div>
    );
  }

  if (!registry) return <p>Registry not found</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard/registries">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-slate-900">{registry.title}</h1>
          <p className="text-sm text-slate-500">
            {new Date(registry.eventDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowShareModal(true)}>
          <Share2 size={14} /> Share
        </Button>
        <Link to={`/registry/${registry.slug}`} target="_blank">
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink size={14} /> Preview
          </Button>
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{products.length}</p>
            <p className="text-xs text-slate-500">Total Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-accent-600">{purchased.length}</p>
            <p className="text-xs text-slate-500">Purchased</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{available.length}</p>
            <p className="text-xs text-slate-500">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{formatPrice(totalValue)}</p>
            <p className="text-xs text-slate-500">Total Value</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="synced">
            Synced Registries ({registry.syncedRegistries.length})
          </TabsTrigger>
        </TabsList>

        {/* ─── Products Tab ───────────────────────────── */}
        <TabsContent value="products">
          <div className="flex gap-2 mb-4 flex-wrap">
            <Button size="sm" className="gap-1" onClick={() => setShowUrlImport(true)}>
              <Link2 size={14} /> Import from URL
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setShowManualAdd(true)}
            >
              <Plus size={14} /> Add Manually
            </Button>
            <Link to={`/dashboard/add-products?registry=${registry.id}`}>
              <Button variant="outline" size="sm" className="gap-1">
                <ShoppingBag size={14} /> From Catalog
              </Button>
            </Link>
          </div>

          {products.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm mb-4">
                  No products yet. Start adding gifts!
                </p>
                <div className="flex justify-center gap-2">
                  <Button size="sm" onClick={() => setShowUrlImport(true)} className="gap-2">
                    <Link2 size={14} /> Import from URL
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowManualAdd(true)}
                    className="gap-2"
                  >
                    <Plus size={14} /> Add Manually
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden group">
                  <div
                    className="relative aspect-square cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="destructive">Out of Stock</Badge>
                      </div>
                    )}
                    <Badge
                      variant={statusColor(product.purchaseStatus)}
                      className="absolute top-3 right-3 capitalize"
                    >
                      {product.purchaseStatus}
                    </Badge>
                    {product.quantity > 1 && (
                      <Badge variant="outline" className="absolute top-3 left-3 bg-white/90">
                        x{product.quantity}
                      </Badge>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <BarChart3
                        size={28}
                        className="text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow-lg"
                      />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2 mb-1">
                      {priorityIcon(product.priority)}
                      <h4 className="text-sm font-medium text-slate-900 line-clamp-2 flex-1">
                        {product.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{product.store}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-slate-900">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {product.addedVia.replace('-', ' ')}
                      </Badge>
                    </div>
                    {product.notes && (
                      <p className="text-xs text-slate-500 mb-2 line-clamp-1 flex items-center gap-1">
                        <StickyNote size={10} className="shrink-0" />
                        {product.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Select
                        value={product.priority}
                        onChange={(e) =>
                          handlePriorityChange(product.id, e.target.value as Product['priority'])
                        }
                        className="flex-1 h-8 text-xs"
                      >
                        <option value="must-have">Must Have</option>
                        <option value="nice-to-have">Nice to Have</option>
                        <option value="dream">Dream</option>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 shrink-0"
                        onClick={() => openEditDialog(product)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    {product.purchaseStatus === 'purchased' && product.purchasedBy && (
                      <p className="text-xs text-accent-600 mt-2">
                        Purchased by {product.purchasedBy}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Synced Registries Tab ──────────────────── */}
        <TabsContent value="synced">
          <div className="mb-4">
            <Button size="sm" className="gap-1" onClick={() => setShowSyncDialog(true)}>
              <Globe size={14} /> Add External Registry
            </Button>
          </div>

          {registry.syncedRegistries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Globe size={28} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm mb-4">
                  Sync registries from Amazon, Crate & Barrel, Williams Sonoma, and more.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSyncDialog(true)}
                  className="gap-2"
                >
                  <Plus size={14} /> Add External Registry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {registry.syncedRegistries.map((sr) => (
                <Card key={sr.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                      <Globe size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{sr.platform}</p>
                      <p className="text-xs text-slate-500 truncate">{sr.url}</p>
                    </div>
                    <Badge
                      variant={
                        sr.status === 'active'
                          ? 'success'
                          : sr.status === 'pending'
                          ? 'warning'
                          : 'destructive'
                      }
                      className="capitalize"
                    >
                      {sr.status}
                    </Badge>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-slate-900">{sr.itemCount} items</p>
                      <p className="text-xs text-slate-500">
                        Last synced: {new Date(sr.lastSynced).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      disabled={resyncingIds.has(sr.id)}
                      onClick={() => handleResync(sr.id, sr.platform)}
                    >
                      <RefreshCw
                        size={14}
                        className={resyncingIds.has(sr.id) ? 'animate-spin' : ''}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                      onClick={() => handleRemoveSynced(sr.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── URL Import Dialog ──────────────────────── */}
      <Dialog open={showUrlImport} onClose={() => { setShowUrlImport(false); setImportPipeline(null); setImportUrl(''); }}>
        <DialogHeader>
          <DialogTitle>Import Product from URL</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-sm text-slate-500 mb-4">
            Paste any product URL and we'll automatically extract the product details using our
            multi-layer import pipeline.
          </p>
          <Input
            placeholder="https://amazon.com/product/..."
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            disabled={importing}
          />
          <PipelineVisualization
            pipeline={importPipeline}
            running={importing}
            currentLayer={pipelineCurrentLayer}
          />
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setShowUrlImport(false); setImportPipeline(null); setImportUrl(''); }}>
            Cancel
          </Button>
          <Button onClick={handleUrlImport} disabled={importing || !importUrl}>
            {importing ? (
              <>
                <Loader2 size={14} className="animate-spin mr-2" />
                Importing...
              </>
            ) : (
              'Import Product'
            )}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* ─── Manual Add Dialog ──────────────────────── */}
      <Dialog open={showManualAdd} onClose={() => setShowManualAdd(false)}>
        <DialogHeader>
          <DialogTitle>Add Product Manually</DialogTitle>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <p className="text-sm text-slate-500">
            Enter the product details manually to add it to your registry.
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Product Title <span className="text-red-400">*</span>
            </label>
            <Input
              placeholder="e.g. KitchenAid Stand Mixer"
              value={manualForm.title}
              onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Price <span className="text-red-400">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="49.99"
                value={manualForm.price}
                onChange={(e) => setManualForm({ ...manualForm, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <Input
                placeholder="Kitchen"
                value={manualForm.category}
                onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
            <Input
              placeholder="https://..."
              value={manualForm.image}
              onChange={(e) => setManualForm({ ...manualForm, image: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Store Name</label>
              <Input
                placeholder="Amazon"
                value={manualForm.store}
                onChange={(e) => setManualForm({ ...manualForm, store: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Store URL</label>
              <Input
                placeholder="https://..."
                value={manualForm.storeUrl}
                onChange={(e) => setManualForm({ ...manualForm, storeUrl: e.target.value })}
              />
            </div>
          </div>
          {manualForm.image && (
            <div className="flex justify-center">
              <img
                src={manualForm.image}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg border border-slate-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowManualAdd(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleManualAdd}
            disabled={addingManual || !manualForm.title || !manualForm.price}
          >
            {addingManual ? (
              <>
                <Loader2 size={14} className="animate-spin mr-2" />
                Adding...
              </>
            ) : (
              'Add Product'
            )}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* ─── Edit Product Dialog ────────────────────── */}
      <Dialog open={!!editProduct} onClose={() => setEditProduct(null)}>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <Input
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
              <Input
                type="number"
                step="0.01"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
              <Input
                type="number"
                min="1"
                value={editForm.quantity}
                onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
            <Input
              value={editForm.image}
              onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <Input
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <Select
                value={editForm.priority}
                onChange={(e) =>
                  setEditForm({ ...editForm, priority: e.target.value as Product['priority'] })
                }
              >
                <option value="must-have">Must Have</option>
                <option value="nice-to-have">Nice to Have</option>
                <option value="dream">Dream</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <Textarea
              placeholder="Any special notes about this product..."
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              rows={3}
            />
          </div>
          {editForm.image && (
            <div className="flex justify-center">
              <img
                src={editForm.image}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditProduct(null)}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* ─── Product Detail / Price History Dialog ─── */}
      <Dialog
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        className="max-w-2xl"
      >
        {selectedProduct && (
          <>
            <DialogHeader>
              <DialogTitle className="pr-8">{selectedProduct.title}</DialogTitle>
            </DialogHeader>
            <DialogContent className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                  className="w-28 h-28 object-cover rounded-lg border border-slate-200 shrink-0"
                />
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-slate-900">
                      {formatPrice(selectedProduct.price)}
                    </span>
                    {selectedProduct.originalPrice &&
                      selectedProduct.originalPrice > selectedProduct.price && (
                        <span className="text-sm text-slate-400 line-through">
                          {formatPrice(selectedProduct.originalPrice)}
                        </span>
                      )}
                  </div>
                  <p className="text-sm text-slate-500">{selectedProduct.store}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={statusColor(selectedProduct.purchaseStatus)}
                      className="capitalize"
                    >
                      {selectedProduct.purchaseStatus}
                    </Badge>
                    <Badge variant="outline" className="capitalize text-xs">
                      {selectedProduct.addedVia.replace('-', ' ')}
                    </Badge>
                    <Badge variant="outline" className="capitalize text-xs">
                      {selectedProduct.priority}
                    </Badge>
                    {!selectedProduct.inStock && <Badge variant="destructive">Out of Stock</Badge>}
                  </div>
                  {selectedProduct.quantity > 1 && (
                    <p className="text-xs text-slate-500">
                      Quantity: {selectedProduct.quantity}
                    </p>
                  )}
                  {selectedProduct.notes && (
                    <p className="text-xs text-slate-500 mt-1">
                      <span className="font-medium">Notes:</span> {selectedProduct.notes}
                    </p>
                  )}
                  {selectedProduct.trackingToken && (
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Token: {selectedProduct.trackingToken}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <PriceHistoryChart product={selectedProduct} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-4">
                <div>
                  <span className="text-slate-400">Last Price Check</span>
                  <p className="text-slate-700 font-medium">
                    {new Date(selectedProduct.lastPriceCheck).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Added</span>
                  <p className="text-slate-700 font-medium">
                    {new Date(selectedProduct.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {selectedProduct.purchasedBy && (
                  <div>
                    <span className="text-slate-400">Purchased By</span>
                    <p className="text-slate-700 font-medium">{selectedProduct.purchasedBy}</p>
                  </div>
                )}
                {selectedProduct.purchasedAt && (
                  <div>
                    <span className="text-slate-400">Purchased At</span>
                    <p className="text-slate-700 font-medium">
                      {new Date(selectedProduct.purchasedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => {
                  openEditDialog(selectedProduct);
                  setSelectedProduct(null);
                }}
              >
                <Pencil size={14} /> Edit
              </Button>
              {selectedProduct.storeUrl && (
                <a href={selectedProduct.affiliateUrl || selectedProduct.storeUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="gap-1">
                    <ExternalLink size={14} /> View in Store
                  </Button>
                </a>
              )}
            </DialogFooter>
          </>
        )}
      </Dialog>

      {/* ─── Share Modal ────────────────────────────── */}
      <Dialog open={showShareModal} onClose={() => setShowShareModal(false)}>
        <DialogHeader>
          <DialogTitle>Share Your Registry</DialogTitle>
        </DialogHeader>
        <DialogContent className="space-y-5">
          <p className="text-sm text-slate-500">
            Share your registry with friends and family so they can browse your wish list and find
            the perfect gift.
          </p>

          {/* Registry URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Registry Link</label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="bg-slate-50 text-sm font-mono" />
              <Button variant="outline" size="icon" className="shrink-0" onClick={copyShareLink}>
                <Copy size={16} />
              </Button>
            </div>
          </div>

          {/* QR Code placeholder */}
          <div className="flex justify-center">
            <div className="w-40 h-40 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50">
              <QrCode size={48} className="mb-2" />
              <p className="text-xs font-medium">QR Code</p>
              <p className="text-[10px]">Scan to open registry</p>
            </div>
          </div>

          {/* Share buttons */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Share via</p>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="gap-2 h-12 flex-col text-xs" onClick={copyShareLink}>
                <Copy size={18} />
                Copy Link
              </Button>
              <Button variant="outline" className="gap-2 h-12 flex-col text-xs" onClick={shareViaEmail}>
                <Mail size={18} />
                Email
              </Button>
              <Button
                variant="outline"
                className="gap-2 h-12 flex-col text-xs"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: registry.title,
                      text: `Check out my gift registry: ${registry.title}`,
                      url: shareUrl,
                    }).catch(() => {});
                  } else {
                    copyShareLink();
                  }
                }}
              >
                <Share2 size={18} />
                Share...
              </Button>
            </div>
          </div>

          {/* Registry info */}
          <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-3">
            <Eye size={16} className="text-slate-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-700">
                {registry.viewCount} view{registry.viewCount !== 1 ? 's' : ''} so far
              </p>
              <p className="text-xs text-slate-500">
                {registry.isPublic ? 'Anyone with the link can view this registry' : 'This registry is private'}
              </p>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowShareModal(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>

      {/* ─── Sync Dialog ────────────────────────────── */}
      <Dialog open={showSyncDialog} onClose={() => setShowSyncDialog(false)}>
        <DialogHeader>
          <DialogTitle>Add External Registry</DialogTitle>
        </DialogHeader>
        <DialogContent className="space-y-4">
          <p className="text-sm text-slate-500">
            Connect a registry from another website. We'll sync the items daily.
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
            <Select value={syncPlatform} onChange={(e) => setSyncPlatform(e.target.value)}>
              <option value="">Select a platform...</option>
              <option value="Amazon">Amazon</option>
              <option value="Crate & Barrel">Crate & Barrel</option>
              <option value="Williams Sonoma">Williams Sonoma</option>
              <option value="The Knot">The Knot</option>
              <option value="Target">Target</option>
              <option value="Other">Other</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Registry URL</label>
            <Input
              placeholder="https://..."
              value={syncUrl}
              onChange={(e) => setSyncUrl(e.target.value)}
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowSyncDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSync} disabled={syncing || !syncPlatform || !syncUrl}>
            {syncing ? (
              <>
                <Loader2 size={14} className="animate-spin mr-2" />
                Syncing...
              </>
            ) : (
              'Start Syncing'
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
