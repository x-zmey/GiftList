import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Gift, ShoppingBag, Eye, TrendingUp, Plus, ExternalLink, Share2,
  Clock, AlertTriangle, RefreshCw, BarChart3, Copy, Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import * as api from '@/lib/api';
import type { Registry, Product, Notification as NotifType } from '@/types';
import { formatPrice, getRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

export default function Overview() {
  const { user } = useAuthStore();
  const { notifications } = useNotificationStore();
  const [registries, setRegistries] = useState<Registry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.getRegistries(user.id),
      api.getAllProducts(),
    ]).then(([regs, prods]) => {
      setRegistries(regs);
      setProducts(prods.filter((p) => regs.some((r) => r.id === p.registryId)));
      setLoading(false);
    });
  }, [user]);

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/registry/${slug}`);
    toast.success('Link copied!');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const totalPurchased = products.filter((p) => p.purchaseStatus === 'purchased').length;
  const totalReserved = products.filter((p) => p.purchaseStatus === 'reserved').length;
  const totalValue = products.reduce((s, p) => s + p.price, 0);
  const purchasedValue = products.filter((p) => p.purchaseStatus === 'purchased').reduce((s, p) => s + p.price, 0);
  const outOfStock = products.filter((p) => !p.inStock).length;
  const totalViews = registries.reduce((s, r) => s + (r.viewCount || 0), 0);

  const stats = [
    { icon: Gift, label: 'Registries', value: registries.length, sub: `${registries.reduce((s, r) => s + r.syncedRegistries.length, 0)} synced`, color: 'text-primary-600 bg-primary-100' },
    { icon: ShoppingBag, label: 'Total Items', value: products.length, sub: `${outOfStock} out of stock`, color: 'text-blue-600 bg-blue-100' },
    { icon: Check, label: 'Purchased', value: totalPurchased, sub: `${totalReserved} reserved`, color: 'text-accent-600 bg-accent-100' },
    { icon: Eye, label: 'Registry Views', value: totalViews, sub: formatPrice(purchasedValue) + ' received', color: 'text-purple-600 bg-purple-100' },
  ];

  const recentPurchases = products
    .filter((p) => p.purchaseStatus === 'purchased' && p.purchasedAt)
    .sort((a, b) => new Date(b.purchasedAt!).getTime() - new Date(a.purchasedAt!).getTime())
    .slice(0, 5);

  const unreadNotifs = notifications.filter((n) => !n.read).slice(0, 5);

  const expiringRegistries = registries.filter((r) => {
    const daysLeft = Math.floor((new Date(r.expiresAt).getTime() - Date.now()) / 86400000);
    return daysLeft < 90;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Welcome back, {user?.name.split(' ')[0]}!</h1>
          <p className="text-sm text-slate-500 mt-1">Here's what's happening with your registries</p>
        </div>
        <Link to="/dashboard/registries">
          <Button className="gap-2"><Plus size={16} /> New Registry</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress */}
      {products.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-700">Overall Gift Fulfillment</h3>
              <span className="text-sm font-bold text-primary-600">{Math.round((totalPurchased / products.length) * 100)}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full flex rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-accent-400 to-accent-500 transition-all duration-500" style={{ width: `${(totalPurchased / products.length) * 100}%` }} />
                <div className="bg-warm-300 transition-all duration-500" style={{ width: `${(totalReserved / products.length) * 100}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent-500" /> {totalPurchased} purchased ({formatPrice(purchasedValue)})</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warm-300" /> {totalReserved} reserved</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-200" /> {products.length - totalPurchased - totalReserved} available</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Registries */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-display">Your Registries</CardTitle>
            <Link to="/dashboard/registries"><Button variant="ghost" size="sm" className="text-xs">View All</Button></Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {registries.length === 0 ? (
              <div className="text-center py-8">
                <Gift size={28} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No registries yet. Create your first one!</p>
              </div>
            ) : (
              registries.map((reg) => {
                const regProducts = products.filter((p) => p.registryId === reg.id);
                const purchased = regProducts.filter((p) => p.purchaseStatus === 'purchased').length;
                const pct = regProducts.length > 0 ? Math.round((purchased / regProducts.length) * 100) : 0;
                return (
                  <div key={reg.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                    <Link to={`/dashboard/registries/${reg.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <img src={reg.coverImage} alt={reg.title} className="h-11 w-11 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{reg.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500">{regProducts.length} items</span>
                          <span className="text-xs text-accent-600 font-medium">{pct}% complete</span>
                          {reg.viewCount > 0 && <span className="text-xs text-slate-400 flex items-center gap-0.5"><Eye size={10} /> {reg.viewCount}</span>}
                        </div>
                      </div>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={() => copyLink(reg.slug)} title="Copy share link">
                      <Share2 size={12} />
                    </Button>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-display">Recent Activity</CardTitle>
            <Link to="/dashboard/notifications"><Button variant="ghost" size="sm" className="text-xs">All Notifications</Button></Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentPurchases.length === 0 && unreadNotifs.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 size={28} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No activity yet. Share your registry to start receiving gifts!</p>
              </div>
            ) : (
              <>
                {recentPurchases.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-accent-50/50">
                    <img src={p.image} alt={p.title} className="h-10 w-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{p.title}</p>
                      <p className="text-xs text-slate-500">by {p.purchasedBy} via {p.purchaseMethod} {p.purchasedAt && <span className="text-slate-400">- {getRelativeTime(p.purchasedAt)}</span>}</p>
                    </div>
                    <span className="text-sm font-medium text-slate-900 shrink-0">{formatPrice(p.price)}</span>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(outOfStock > 0 || expiringRegistries.length > 0) && (
        <Card className="border-warm-200 bg-warm-50/30">
          <CardContent className="p-5">
            <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-3"><AlertTriangle size={16} className="text-warm-500" /> Needs Attention</h3>
            <div className="space-y-2">
              {outOfStock > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="destructive" className="text-xs">{outOfStock}</Badge>
                  <span className="text-slate-600">{outOfStock === 1 ? 'item is' : 'items are'} currently out of stock in your registries</span>
                </div>
              )}
              {expiringRegistries.map((reg) => {
                const daysLeft = Math.floor((new Date(reg.expiresAt).getTime() - Date.now()) / 86400000);
                return (
                  <div key={reg.id} className="flex items-center gap-3 text-sm">
                    <Badge variant="warning" className="text-xs"><Clock size={10} className="mr-1" /> {daysLeft}d</Badge>
                    <span className="text-slate-600">"{reg.title}" expires in {daysLeft} days</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Share */}
      {registries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2"><Share2 size={16} /> Share Your Registry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {registries.map((reg) => (
                <div key={reg.id} className="flex items-center gap-3">
                  <span className="text-sm text-slate-700 flex-1 truncate">{reg.title}</span>
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 hidden sm:block truncate max-w-[300px]">
                    {window.location.origin}/registry/{reg.slug}
                  </code>
                  <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={() => copyLink(reg.slug)}>
                    <Copy size={12} /> Copy Link
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
