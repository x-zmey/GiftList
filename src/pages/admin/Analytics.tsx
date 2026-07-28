import { useEffect, useState } from 'react';
import { BarChart3, Gift, MousePointerClick, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import * as api from '@/lib/api';
import type { AnalyticsData } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Gift, label: 'Registries Created', value: data.registriesCreated, color: 'text-primary-600 bg-primary-100' },
    { icon: ShoppingBag, label: 'Total Products', value: data.totalProducts, color: 'text-blue-600 bg-blue-100' },
    { icon: MousePointerClick, label: 'Affiliate Clicks', value: data.totalClicks.toLocaleString(), color: 'text-purple-600 bg-purple-100' },
    { icon: TrendingUp, label: 'Purchases Tracked', value: data.totalPurchases, color: 'text-accent-600 bg-accent-100' },
  ];

  const maxClicks = Math.max(...data.clicksByDate.map((d) => d.count));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Analytics Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Platform-wide metrics and insights</p>
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
        {/* Clicks chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <MousePointerClick size={16} /> Affiliate Clicks (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-48">
              {data.clicksByDate.slice(-30).map((d, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary-200 hover:bg-primary-400 transition-colors rounded-t cursor-pointer group relative"
                  style={{ height: `${(d.count / maxClicks) * 100}%` }}
                  title={`${d.date}: ${d.count} clicks`}
                >
                  <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {d.count}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>

        {/* Top stores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <BarChart3 size={16} /> Top Stores by Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topStores.map((store) => {
                const pct = (store.count / data.topStores[0].count) * 100;
                return (
                  <div key={store.store}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700">{store.store}</span>
                      <span className="text-sm font-medium text-slate-900">{store.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Purchase methods */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <ShoppingBag size={16} /> Purchases by Tracking Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.purchasesByMethod.map((pm) => (
                <div key={pm.method} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">{pm.method}</span>
                  <Badge variant="secondary">{pm.count} purchases</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Registry creation trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Gift size={16} /> Registry Creations (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-48">
              {data.registriesByDate.slice(-30).map((d, i) => {
                const maxR = Math.max(...data.registriesByDate.map((x) => x.count));
                return (
                  <div
                    key={i}
                    className="flex-1 bg-accent-200 hover:bg-accent-400 transition-colors rounded-t cursor-pointer group relative"
                    style={{ height: `${(d.count / maxR) * 100}%` }}
                    title={`${d.date}: ${d.count} registries`}
                  >
                    <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {d.count}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
