import { useEffect } from 'react';
import { Bell, Gift, AlertTriangle, RefreshCw, Clock, CheckCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { getRelativeTime } from '@/lib/utils';

export default function Notifications() {
  const { user } = useAuthStore();
  const { notifications, loading, fetch, markRead, markAllRead, unreadCount } = useNotificationStore();

  useEffect(() => {
    if (user) fetch(user.id);
  }, [user]);

  const iconForType = (type: string) => {
    switch (type) {
      case 'gift-purchased': return <Gift size={18} className="text-accent-600" />;
      case 'out-of-stock': return <AlertTriangle size={18} className="text-red-500" />;
      case 'sync-complete': return <RefreshCw size={18} className="text-blue-500" />;
      case 'registry-expiring': return <Clock size={18} className="text-warm-500" />;
      default: return <Bell size={18} className="text-slate-400" />;
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">{unreadCount()} unread</p>
        </div>
        {unreadCount() > 0 && user && (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => markAllRead(user.id)}>
            <CheckCheck size={14} /> Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bell size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`cursor-pointer transition-colors ${!notif.read ? 'bg-primary-50/30 border-primary-200' : ''}`}
              onClick={() => !notif.read && markRead(notif.id)}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  {iconForType(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-slate-900">{notif.title}</h3>
                    {!notif.read && <Badge className="text-[10px] px-1.5 py-0">New</Badge>}
                  </div>
                  <p className="text-sm text-slate-600">{notif.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{getRelativeTime(notif.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
