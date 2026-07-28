import { useEffect, useState } from 'react';
import { Users, Shield, User, Gift, Package, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import * as api from '@/lib/api';
import type { User as UserType, Registry, Product } from '@/types';

interface UserWithStats extends UserType {
  registryCount: number;
  productCount: number;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [allUsers, allRegistries, allProducts] = await Promise.all([
        api.getUsers(),
        api.getRegistries(),
        api.getAllProducts(),
      ]);

      const enriched: UserWithStats[] = allUsers.map((u) => {
        const userRegistries = allRegistries.filter((r) => r.ownerId === u.id);
        const userRegistryIds = new Set(userRegistries.map((r) => r.id));
        const userProducts = allProducts.filter((p) => userRegistryIds.has(p.registryId));
        return {
          ...u,
          registryCount: userRegistries.length,
          productCount: userProducts.length,
        };
      });

      setUsers(enriched);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-500 mt-1">{users.length} registered users</p>
      </div>

      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium shrink-0">
                {u.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-slate-900">{u.name}</h3>
                  <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize gap-1">
                    {u.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                    {u.role}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5" title="Registries">
                  <Gift size={13} className="text-primary-500" />
                  <span className="font-medium text-slate-700">{u.registryCount}</span>
                  <span className="hidden sm:inline">registries</span>
                </div>
                <div className="flex items-center gap-1.5" title="Products">
                  <Package size={13} className="text-blue-500" />
                  <span className="font-medium text-slate-700">{u.productCount}</span>
                  <span className="hidden sm:inline">products</span>
                </div>
              </div>
              <div className="text-right text-xs text-slate-500 hidden sm:block">
                <p className="flex items-center gap-1 justify-end">
                  <Clock size={11} /> Last login
                </p>
                <p className="text-slate-700">{new Date(u.createdAt).toLocaleDateString()}</p>
                <p className="mt-1">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
