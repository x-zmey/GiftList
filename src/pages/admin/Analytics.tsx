import { useEffect, useState } from 'react';
import {
  BarChart3, Gift, MousePointerClick, ShoppingBag, TrendingUp,
  DollarSign, Activity, CheckCircle, XCircle, RefreshCw,
  AlertTriangle, Info, AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import * as api from '@/lib/api';
import type { AnalyticsData, SystemLog } from '@/types';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningPriceCheck, setRunningPriceCheck] = useState(false);

  useEffect(() => {
    Promise.all([api.getAnalytics(), api.getSystemLogs()]).then(([analytics, systemLogs]) => {
      setData(analytics);
      setLogs(systemLogs);
      setLoading(false);
    });
  }, []);

  const handlePriceCheck = async () => {
    setRunningPriceCheck(true);
    try {
      const result = await api.runPriceCheck();
      toast.success(
        `Price check complete: ${result.checked} checked, ${result.priceChanges} price changes, ${result.stockChanges} stock changes`
      );
      const [updatedAnalytics, updatedLogs] = await Promise.all([
        api.getAnalytics(),
        api.getSystemLogs(),
      ]);
      setData(updatedAnalytics);
      setLogs(updatedLogs);
    } catch {
      toast.error('Price check failed');
    } finally {
      setRunningPriceCheck(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
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
    { icon: DollarSign, label: 'Total Revenue', value: formatPrice(data.totalRevenue), color: 'text-green-600 bg-green-100' },
    { icon: CheckCircle, label: 'Active Registries', value: data.activeRegistries, color: 'text-emerald-600 bg-emerald-100' },
    { icon: XCircle, label: 'Expired Registries', value: data.expiredRegistries, color: 'text-red-600 bg-red-100' },
  ];

  const maxClicks = Math.max(...data.clicksByDate.map((d) => d.count), 1);
  const maxScrapes = Math.max(...data.scrapesByDate.map((d) => d.success + d.failed), 1);

  const logTypeConfig: Record<SystemLog['type'], { color: string; icon: typeof Info }> = {
    error: { color: 'bg-red-100 text-red-700', icon: AlertCircle },
    warning: { color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
    info: { color: 'bg-blue-100 text-blue-700', icon: Info },
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Platform-wide metrics and insights</p>
        </div>
        <Button onClick={handlePriceCheck} disabled={runningPriceCheck} className="gap-2">
          <RefreshCw size={16} className={runningPriceCheck ? 'animate-spin' : ''} />
          {runningPriceCheck ? 'Checking...' : 'Run Price Check'}
        </Button>
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

        {/* Scrape success/fail chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Activity size={16} /> Scrape Results (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-48">
              {data.scrapesByDate.slice(-30).map((d, i) => {
                const total = d.success + d.failed;
                const successPct = total > 0 ? (d.success / maxScrapes) * 100 : 0;
                const failPct = total > 0 ? (d.failed / maxScrapes) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end h-full group relative cursor-pointer">
                    <div
                      className="bg-red-300 hover:bg-red-400 transition-colors rounded-t"
                      style={{ height: `${failPct}%` }}
                    />
                    <div
                      className="bg-emerald-300 hover:bg-emerald-400 transition-colors"
                      style={{ height: `${successPct}%` }}
                    />
                    <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {d.success}ok / {d.failed}fail
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>30 days ago</span>
              <div className="flex gap-3">
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded bg-emerald-400" /> Success</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded bg-red-400" /> Failed</span>
              </div>
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

        {/* Top clicked products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <MousePointerClick size={16} /> Top Clicked Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 font-medium text-slate-500">#</th>
                      <th className="text-left py-2 font-medium text-slate-500">Product</th>
                      <th className="text-left py-2 font-medium text-slate-500">Store</th>
                      <th className="text-right py-2 font-medium text-slate-500">Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((product, idx) => (
                      <tr key={idx} className="border-b border-slate-50">
                        <td className="py-2 text-slate-400">{idx + 1}</td>
                        <td className="py-2 text-slate-800 max-w-[180px] truncate">{product.title}</td>
                        <td className="py-2"><Badge variant="secondary" className="text-xs">{product.store}</Badge></td>
                        <td className="py-2 text-right font-medium text-slate-900">{product.clicks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">No click data available yet</p>
            )}
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
                const maxR = Math.max(...data.registriesByDate.map((x) => x.count), 1);
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

      {/* System Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Activity size={16} /> System Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs.slice(0, 10).map((log) => {
              const cfg = logTypeConfig[log.type];
              const LogIcon = cfg.icon;
              return (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`mt-0.5 shrink-0 h-6 w-6 rounded flex items-center justify-center ${cfg.color}`}>
                    <LogIcon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={cfg.color + ' border-0 text-xs'}>{log.type}</Badge>
                      <Badge variant="secondary" className="text-xs">{log.module}</Badge>
                      <span className="text-xs text-slate-400 ml-auto shrink-0">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 mt-1">{log.message}</p>
                    {log.details && (
                      <p className="text-xs text-slate-500 mt-0.5">{log.details}</p>
                    )}
                  </div>
                </div>
              );
            })}
            {logs.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No system logs available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
