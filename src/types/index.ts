export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin';
  avatar?: string;
  createdAt: string;
}

export interface Registry {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  occasion: 'wedding' | 'baby-shower' | 'birthday' | 'housewarming' | 'graduation' | 'holiday' | 'other';
  eventDate: string;
  description: string;
  coverImage: string;
  slug: string;
  isPublic: boolean;
  syncedRegistries: SyncedRegistry[];
  createdAt: string;
  expiresAt: string;
}

export interface SyncedRegistry {
  id: string;
  platform: string;
  url: string;
  lastSynced: string;
  status: 'active' | 'error' | 'pending';
  itemCount: number;
}

export interface Product {
  id: string;
  registryId: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  store: string;
  storeUrl: string;
  affiliateUrl: string;
  category: string;
  priority: 'must-have' | 'nice-to-have' | 'dream';
  purchaseStatus: 'available' | 'purchased' | 'reserved';
  purchasedBy?: string;
  purchasedAt?: string;
  purchaseMethod?: 'affiliate' | 'manual' | 'token';
  addedVia: 'manual' | 'url-import' | 'catalog' | 'registry-sync';
  inStock: boolean;
  lastPriceCheck: string;
  createdAt: string;
}

export interface CatalogProduct {
  id: string;
  title: string;
  price: number;
  image: string;
  store: string;
  storeUrl: string;
  category: string;
  rating: number;
  reviewCount: number;
}

export interface AffiliateConfig {
  id: string;
  store: string;
  affiliateId: string;
  affiliateNetwork: string;
  urlPattern: string;
  isActive: boolean;
  totalClicks: number;
  totalRevenue: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'gift-purchased' | 'out-of-stock' | 'registry-expiring' | 'price-change' | 'sync-complete' | 'sync-error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, string>;
}

export interface AnalyticsData {
  registriesCreated: number;
  totalProducts: number;
  totalClicks: number;
  totalPurchases: number;
  registriesByDate: { date: string; count: number }[];
  clicksByDate: { date: string; count: number }[];
  topStores: { store: string; count: number }[];
  purchasesByMethod: { method: string; count: number }[];
}
