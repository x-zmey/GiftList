import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Share2, ExternalLink, Plus, Trash2, Globe, Link2,
  ShoppingBag, Copy, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import * as api from '@/lib/api';
import type { Registry, Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function RegistryDetail() {
  const { id } = useParams<{ id: string }>();
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUrlImport, setShowUrlImport] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [syncPlatform, setSyncPlatform] = useState('');
  const [syncUrl, setSyncUrl] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.getRegistry(id), api.getProducts(id)]).then(([reg, prods]) => {
      setRegistry(reg);
      setProducts(prods);
      setLoading(false);
    });
  }, [id]);

  const handleUrlImport = async () => {
    if (!id || !importUrl) return;
    setImporting(true);
    try {
      const product = await api.addProductFromUrl(id, importUrl);
      setProducts([...products, product]);
      setShowUrlImport(false);
      setImportUrl('');
      toast.success('Product imported successfully!');
    } catch {
      toast.error('Failed to import product');
    } finally {
      setImporting(false);
    }
  };

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

  const handleDeleteProduct = async (productId: string) => {
    try {
      await api.deleteProduct(productId);
      setProducts(products.filter((p) => p.id !== productId));
      toast.success('Product removed');
    } catch {
      toast.error('Failed to remove product');
    }
  };

  const handlePriorityChange = async (productId: string, priority: Product['priority']) => {
    try {
      const updated = await api.updateProduct(productId, { priority });
      setProducts(products.map((p) => p.id === productId ? updated : p));
    } catch {
      toast.error('Failed to update priority');
    }
  };

  const copyShareLink = () => {
    if (registry) {
      navigator.clipboard.writeText(`${window.location.origin}/registry/${registry.slug}`);
      toast.success('Registry link copied!');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      </div>
    );
  }

  if (!registry) return <p>Registry not found</p>;

  const purchased = products.filter((p) => p.purchaseStatus === 'purchased');
  const available = products.filter((p) => p.purchaseStatus === 'available');

  const statusColor = (s: Product['purchaseStatus']) => {
    switch (s) {
      case 'purchased': return 'success';
      case 'reserved': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/registries">
          <Button variant="ghost" size="icon" className="h-9 w-9"><ArrowLeft size={18} /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-slate-900">{registry.title}</h1>
          <p className="text-sm text-slate-500">
            {new Date(registry.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={copyShareLink}>
          <Share2 size={14} /> Share
        </Button>
        <Link to={`/registry/${registry.slug}`} target="_blank">
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink size={14} /> Preview
          </Button>
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-900">{products.length}</p><p className="text-xs text-slate-500">Total Items</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-accent-600">{purchased.length}</p><p className="text-xs text-slate-500">Purchased</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-900">{available.length}</p><p className="text-xs text-slate-500">Available</p></CardContent></Card>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="synced">Synced Registries ({registry.syncedRegistries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="flex gap-2 mb-4">
            <Button size="sm" className="gap-1" onClick={() => setShowUrlImport(true)}><Link2 size={14} /> Import from URL</Button>
            <Link to={`/dashboard/add-products?registry=${registry.id}`}>
              <Button variant="outline" size="sm" className="gap-1"><Plus size={14} /> From Catalog</Button>
            </Link>
          </div>

          {products.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-500 text-sm mb-4">No products yet. Start adding gifts!</p>
                <Button size="sm" onClick={() => setShowUrlImport(true)} className="gap-2"><Plus size={14} /> Add First Product</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden group">
                  <div className="relative aspect-square">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="destructive">Out of Stock</Badge>
                      </div>
                    )}
                    <Badge variant={statusColor(product.purchaseStatus)} className="absolute top-3 right-3 capitalize">
                      {product.purchaseStatus}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium text-slate-900 line-clamp-2 mb-1">{product.title}</h4>
                    <p className="text-xs text-slate-500 mb-2">{product.store}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
                      <Badge variant="outline" className="text-xs capitalize">{product.addedVia.replace('-', ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={product.priority}
                        onChange={(e) => handlePriorityChange(product.id, e.target.value as Product['priority'])}
                        className="flex-1 h-8 text-xs"
                      >
                        <option value="must-have">Must Have</option>
                        <option value="nice-to-have">Nice to Have</option>
                        <option value="dream">Dream</option>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    {product.purchaseStatus === 'purchased' && product.purchasedBy && (
                      <p className="text-xs text-accent-600 mt-2">Purchased by {product.purchasedBy}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="synced">
          <div className="mb-4">
            <Button size="sm" className="gap-1" onClick={() => setShowSyncDialog(true)}><Globe size={14} /> Add External Registry</Button>
          </div>

          {registry.syncedRegistries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Globe size={28} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm mb-4">
                  Sync registries from Amazon, Crate & Barrel, Williams Sonoma, and more.
                </p>
                <Button size="sm" variant="outline" onClick={() => setShowSyncDialog(true)} className="gap-2">
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
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{sr.platform}</p>
                      <p className="text-xs text-slate-500 truncate">{sr.url}</p>
                    </div>
                    <Badge variant={sr.status === 'active' ? 'success' : sr.status === 'pending' ? 'warning' : 'destructive'} className="capitalize">{sr.status}</Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">{sr.itemCount} items</p>
                      <p className="text-xs text-slate-500">Last synced: {new Date(sr.lastSynced).toLocaleDateString()}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><RefreshCw size={14} /></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* URL Import Dialog */}
      <Dialog open={showUrlImport} onClose={() => setShowUrlImport(false)}>
        <DialogHeader><DialogTitle>Import Product from URL</DialogTitle></DialogHeader>
        <DialogContent>
          <p className="text-sm text-slate-500 mb-4">
            Paste any product URL and we'll automatically extract the product details.
          </p>
          <Input
            placeholder="https://amazon.com/product/..."
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
          />
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowUrlImport(false)}>Cancel</Button>
          <Button onClick={handleUrlImport} disabled={importing || !importUrl}>
            {importing ? 'Importing...' : 'Import Product'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onClose={() => setShowSyncDialog(false)}>
        <DialogHeader><DialogTitle>Add External Registry</DialogTitle></DialogHeader>
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
            <Input placeholder="https://..." value={syncUrl} onChange={(e) => setSyncUrl(e.target.value)} />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowSyncDialog(false)}>Cancel</Button>
          <Button onClick={handleSync} disabled={syncing || !syncPlatform || !syncUrl}>
            {syncing ? 'Syncing...' : 'Start Syncing'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
