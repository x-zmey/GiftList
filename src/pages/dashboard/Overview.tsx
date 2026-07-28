import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, ShoppingBag, Eye, TrendingUp, Plus, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import * as api from '@/lib/api';
import type { Registry, Product } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function Overview() {
  const { user } = useAuthStore();
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
  const totalValue = products.reduce((s, p) => s + p.price, 0);
  const purchasedValue = products.filter((p) => p.purchaseStatus === 'purchased').reduce((s, p) => s + p.price, 0);

  const stats = [
    { icon: Gift, label: 'Registries', value: registries.length, color: 'text-primary-600 bg-primary-100' },
    { icon: ShoppingBag, label: 'Total Items', value: products.length, color: 'text-blue-600 bg-blue-100' },
    { icon: Eye, label: 'Purchased', value: totalPurchased, color: 'text-accent-600 bg-accent-100' },
    { icon: TrendingUp, label: 'Gift Value', value: formatPrice(purchasedValue), color: 'text-purple-600 bg-purple-100' },
  ];

  const recentPurchases = products
    .filter((p) => p.purchaseStatus === 'purchased' && p.purchasedAt)
    .sort((a, b) => new Date(b.purchasedAt!).getTime() - new Date(a.purchasedAt!).getTime())
    .slice(0, 5);

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
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Registries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">Your Registries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {registries.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No registries yet. Create your first one!</p>
            ) : (
              registries.map((reg) => {
                const regProducts = products.filter((p) => p.registryId === reg.id);
                const purchased = regProducts.filter((p) => p.purchaseStatus === 'purchased').length;
                return (
                  <Link key={reg.id} to={`/dashboard/registries/${reg.id}`} className="block">
                    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors group">
                      <img src={reg.coverImage} alt={reg.title} className="h-12 w-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{reg.title}</p>
                        <p className="text-xs text-slate-500">{regProducts.length} items, {purchased} purchased</p>
                      </div>
                      <Badge variant="secondary" className="capitalize text-xs">{reg.occasion}</Badge>
                      <ExternalLink size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent purchases */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">Recent Purchases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPurchases.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No purchases yet. Share your registry!</p>
            ) : (
              recentPurchases.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-accent-50/50">
                  <img src={p.image} alt={p.title} className="h-10 w-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{p.title}</p>
                    <p className="text-xs text-slate-500">by {p.purchasedBy}</p>
                  </div>
                  <span className="text-sm font-medium text-slate-900">{formatPrice(p.price)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
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
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${(totalPurchased / products.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {totalPurchased} of {products.length} gifts purchased ({formatPrice(purchasedValue)} of {formatPrice(totalValue)})
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
