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
  viewCount: number;
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
  trackingToken?: string;
  addedVia: 'manual' | 'url-import' | 'catalog' | 'registry-sync';
  inStock: boolean;
  lastPriceCheck: string;
  priceHistory: PricePoint[];
  notes?: string;
  quantity: number;
  createdAt: string;
}

export interface PricePoint {
  price: number;
  date: string;
  inStock: boolean;
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
  paramName: string;
  isActive: boolean;
  totalClicks: number;
  totalRevenue: number;
  lastUpdated: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'gift-purchased' | 'out-of-stock' | 'registry-expiring' | 'price-change' | 'sync-complete' | 'sync-error' | 'back-in-stock';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, string>;
}

export interface ScrapeLog {
  id: string;
  url: string;
  store: string;
  status: 'success' | 'failed' | 'partial';
  method: 'opengraph' | 'headless' | 'store-parser' | 'managed-service';
  extractedTitle?: string;
  extractedPrice?: number;
  extractedImage?: string;
  errorMessage?: string;
  duration: number;
  createdAt: string;
}

export interface ClickLog {
  id: string;
  productId: string;
  productTitle: string;
  registryId: string;
  store: string;
  affiliateId: string;
  referrer: string;
  createdAt: string;
}

export interface SystemLog {
  id: string;
  type: 'error' | 'warning' | 'info';
  module: 'scraper' | 'affiliate' | 'sync' | 'price-monitor' | 'registry' | 'auth';
  message: string;
  details?: string;
  createdAt: string;
}

export interface ImportPipelineResult {
  url: string;
  layers: ImportLayerResult[];
  finalResult: {
    title: string;
    price: number;
    image: string;
    store: string;
  } | null;
  success: boolean;
}

export interface ImportLayerResult {
  layer: number;
  name: string;
  status: 'success' | 'failed' | 'skipped';
  duration: number;
  extracted?: {
    title?: string;
    price?: number;
    image?: string;
  };
  error?: string;
}

export interface AnalyticsData {
  registriesCreated: number;
  totalProducts: number;
  totalClicks: number;
  totalPurchases: number;
  totalRevenue: number;
  activeRegistries: number;
  expiredRegistries: number;
  registriesByDate: { date: string; count: number }[];
  clicksByDate: { date: string; count: number }[];
  scrapesByDate: { date: string; success: number; failed: number }[];
  topStores: { store: string; count: number }[];
  purchasesByMethod: { method: string; count: number }[];
  topProducts: { title: string; clicks: number; store: string }[];
}
