import { useEffect, useState } from 'react';
import {
  Bell, Gift, AlertTriangle, RefreshCw, Clock, CheckCheck,
  TrendingDown, TrendingUp, AlertCircle, Filter, ShoppingBag, Package,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { getRelativeTime } from '@/lib/utils';
import type { Notification } from '@/types';

export default function Notifications() {
  const { user } = useAuthStore();
  const { notifications, loading, fetch, markRead, markAllRead, unreadCount } = useNotificationStore();
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (user) fetch(user.id);
  }, [user]);

  const iconForType = (type: Notification['type']) => {
    switch (type) {
      case 'gift-purchased': return <Gift size={18} className="text-accent-600" />;
      case 'out-of-stock': return <AlertTriangle size={18} className="text-red-500" />;
      case 'back-in-stock': return <Package size={18} className="text-green-500" />;
      case 'sync-complete': return <RefreshCw size={18} className="text-blue-500" />;
      case 'sync-error': return <AlertCircle size={18} className="text-red-500" />;
      case 'registry-expiring': return <Clock size={18} className="text-warm-500" />;
      case 'price-change': return <TrendingDown size={18} className="text-purple-500" />;
      default: return <Bell size={18} className="text-slate-400" />;
    }
  };

  const badgeForType = (type: Notification['type']) => {
    switch (type) {
      case 'gift-purchased': return <Badge variant="success" className="text-[10px]">Purchase</Badge>;
      case 'out-of-stock': return <Badge variant="destructive" className="text-[10px]">Stock</Badge>;
      case 'back-in-stock': return <Badge variant="success" className="text-[10px]">Restock</Badge>;
      case 'sync-complete': return <Badge className="text-[10px] bg-blue-100 text-blue-700">Sync</Badge>;
      case 'sync-error': return <Badge variant="destructive" className="text-[10px]">Sync Error</Badge>;
      case 'registry-expiring': return <Badge variant="warning" className="text-[10px]">Expiry</Badge>;
      case 'price-change': return <Badge className="text-[10px] bg-purple-100 text-purple-700">Price</Badge>;
      default: return <Badge variant="secondary" className="text-[10px]">Info</Badge>;
    }
  };

  const filtered = filter === 'all'
    ? notifications
    : filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications.filter((n) => n.type === filter);

  const groupByDate = (notifs: Notification[]) => {
    const groups: Record<string, Notification[]> = {};
    notifs.forEach((n) => {
      const date = new Date(n.createdAt);
      const today = new Date();
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) key = 'Today';
      else if (date.toDateString() === yesterday.toDateString()) key = 'Yesterday';
      else key = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });
    return groups;
  };

  const grouped = groupByDate(filtered);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            {unreadCount()} unread of {notifications.length} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-44 h-9 text-sm">
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="gift-purchased">Purchases</option>
            <option value="out-of-stock">Stock Alerts</option>
            <option value="price-change">Price Changes</option>
            <option value="sync-complete">Sync Updates</option>
            <option value="registry-expiring">Expiry Alerts</option>
          </Select>
          {unreadCount() > 0 && user && (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => markAllRead(user.id)}>
              <CheckCheck size={14} /> Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Purchases', count: notifications.filter((n) => n.type === 'gift-purchased').length, icon: Gift, color: 'text-accent-600 bg-accent-100' },
          { label: 'Stock Alerts', count: notifications.filter((n) => n.type === 'out-of-stock' || n.type === 'back-in-stock').length, icon: AlertTriangle, color: 'text-red-500 bg-red-100' },
          { label: 'Price Changes', count: notifications.filter((n) => n.type === 'price-change').length, icon: TrendingDown, color: 'text-purple-500 bg-purple-100' },
          { label: 'Sync Updates', count: notifications.filter((n) => n.type === 'sync-complete' || n.type === 'sync-error').length, icon: RefreshCw, color: 'text-blue-500 bg-blue-100' },
        ].map((item) => (
          <Card key={item.label} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => setFilter(item.label === 'Purchases' ? 'gift-purchased' : item.label === 'Stock Alerts' ? 'out-of-stock' : item.label === 'Price Changes' ? 'price-change' : 'sync-complete')}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${item.color} shrink-0`}>
                <item.icon size={14} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{item.count}</p>
                <p className="text-[10px] text-slate-500">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bell size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              {filter === 'all' ? 'No notifications yet' : 'No notifications match this filter'}
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([dateLabel, notifs]) => (
          <div key={dateLabel}>
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 px-1">{dateLabel}</h3>
            <div className="space-y-2">
              {notifs.map((notif) => (
                <Card
                  key={notif.id}
                  className={`cursor-pointer transition-all hover:shadow-sm ${!notif.read ? 'bg-primary-50/30 border-primary-200 shadow-sm' : ''}`}
                  onClick={() => !notif.read && markRead(notif.id)}
                >
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      {iconForType(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-medium text-slate-900">{notif.title}</h3>
                        {badgeForType(notif.type)}
                        {!notif.read && <span className="h-2 w-2 rounded-full bg-primary-500" />}
                      </div>
                      <p className="text-sm text-slate-600">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{getRelativeTime(notif.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
