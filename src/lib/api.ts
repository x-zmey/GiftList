import { delay, generateId, slugify } from './utils';
import type {
  User, Registry, Product, CatalogProduct, PricePoint,
  AffiliateConfig, Notification, AnalyticsData, SyncedRegistry,
  ScrapeLog, ClickLog, SystemLog, ImportPipelineResult, ImportLayerResult,
} from '@/types';

const STORAGE_KEYS = {
  users: 'gl_users',
  registries: 'gl_registries',
  products: 'gl_products',
  catalog: 'gl_catalog',
  affiliates: 'gl_affiliates',
  notifications: 'gl_notifications',
  currentUser: 'gl_currentUser',
  scrapeLogs: 'gl_scrapeLogs',
  clickLogs: 'gl_clickLogs',
  systemLogs: 'gl_systemLogs',
};

function read<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Seed Data ───────────────────────────────────────────────────

const SEED_USERS: User[] = [
  { id: 'u1', email: 'sarah@example.com', name: 'Sarah Mitchell', role: 'owner', createdAt: '2026-05-10T10:00:00Z' },
  { id: 'u2', email: 'admin@giftlist.com', name: 'Admin', role: 'admin', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u3', email: 'james@example.com', name: 'James Rivera', role: 'owner', createdAt: '2026-06-15T14:30:00Z' },
  { id: 'u4', email: 'emily@example.com', name: 'Emily Chen', role: 'owner', createdAt: '2026-07-01T09:00:00Z' },
];

function makePriceHistory(currentPrice: number, days: number = 30): PricePoint[] {
  const history: PricePoint[] = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const variance = (Math.random() - 0.5) * currentPrice * 0.1;
    history.push({
      price: Math.round((currentPrice + variance) * 100) / 100,
      date: d.toISOString().split('T')[0],
      inStock: Math.random() > 0.05,
    });
  }
  history[history.length - 1].price = currentPrice;
  history[history.length - 1].inStock = true;
  return history;
}

const SEED_REGISTRIES: Registry[] = [
  {
    id: 'r1', ownerId: 'u1', ownerName: 'Sarah Mitchell',
    title: 'Sarah & David\'s Wedding', occasion: 'wedding',
    eventDate: '2026-10-15', description: 'We are so excited to celebrate our special day with you! Thank you for your generous gifts.',
    coverImage: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&h=600&fit=crop&q=80',
    slug: 'sarah-davids-wedding', isPublic: true, viewCount: 347,
    syncedRegistries: [
      { id: 'sr1', platform: 'Crate & Barrel', url: 'https://crateandbarrel.com/registry/sarah-david', lastSynced: '2026-07-27T08:00:00Z', status: 'active', itemCount: 8 },
      { id: 'sr2', platform: 'Amazon', url: 'https://amazon.com/registry/sarah-david', lastSynced: '2026-07-27T08:00:00Z', status: 'active', itemCount: 12 },
    ],
    createdAt: '2026-05-10T10:00:00Z', expiresAt: '2029-05-10T10:00:00Z',
  },
  {
    id: 'r2', ownerId: 'u3', ownerName: 'James Rivera',
    title: 'Baby Rivera\'s Nursery', occasion: 'baby-shower',
    eventDate: '2026-09-01', description: 'Our little one is on the way! We can\'t wait to welcome them into the world.',
    coverImage: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=600&fit=crop',
    slug: 'baby-riveras-nursery', isPublic: true, viewCount: 128,
    syncedRegistries: [
      { id: 'sr3', platform: 'BuyBuy Baby', url: 'https://buybuybaby.com/registry/rivera', lastSynced: '2026-07-26T08:00:00Z', status: 'active', itemCount: 5 },
    ],
    createdAt: '2026-06-15T14:30:00Z', expiresAt: '2029-06-15T14:30:00Z',
  },
  {
    id: 'r3', ownerId: 'u4', ownerName: 'Emily Chen',
    title: 'Emily\'s 30th Birthday Bash', occasion: 'birthday',
    eventDate: '2026-08-20', description: 'The big 3-0! Let\'s celebrate together.',
    coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&h=600&fit=crop',
    slug: 'emilys-30th-birthday', isPublic: true, viewCount: 64,
    syncedRegistries: [],
    createdAt: '2026-07-01T09:00:00Z', expiresAt: '2029-07-01T09:00:00Z',
  },
  {
    id: 'r4', ownerId: 'u1', ownerName: 'Sarah Mitchell',
    title: 'New Home Essentials', occasion: 'housewarming',
    eventDate: '2026-12-01', description: 'We just moved into our dream home and could use some finishing touches!',
    coverImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=600&fit=crop',
    slug: 'new-home-essentials', isPublic: true, viewCount: 23,
    syncedRegistries: [],
    createdAt: '2026-07-20T11:00:00Z', expiresAt: '2029-07-20T11:00:00Z',
  },
];

const SEED_PRODUCTS: Product[] = [
  { id: 'p1', registryId: 'r1', title: 'KitchenAid Artisan Stand Mixer - Empire Red', price: 379.99, image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=400&fit=crop&q=80', store: 'Amazon', storeUrl: 'https://amazon.com/kitchenaid-mixer', affiliateUrl: 'https://amazon.com/kitchenaid-mixer?tag=giftlist-20', category: 'Kitchen', priority: 'must-have', purchaseStatus: 'available', addedVia: 'catalog', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', priceHistory: makePriceHistory(379.99), quantity: 1, createdAt: '2026-05-11T10:00:00Z' },
  { id: 'p2', registryId: 'r1', title: 'Le Creuset Dutch Oven 5.5 Qt - Marseille', price: 419.95, image: 'https://images.unsplash.com/photo-1585442245948-a4c31e5e2a46?w=400&h=400&fit=crop', store: 'Crate & Barrel', storeUrl: 'https://crateandbarrel.com/le-creuset', affiliateUrl: 'https://crateandbarrel.com/le-creuset?ref=giftlist', category: 'Kitchen', priority: 'must-have', purchaseStatus: 'purchased', purchasedBy: 'Aunt Martha', purchasedAt: '2026-07-20T14:30:00Z', purchaseMethod: 'affiliate', addedVia: 'registry-sync', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', priceHistory: makePriceHistory(419.95), quantity: 1, createdAt: '2026-05-12T10:00:00Z' },
  { id: 'p3', registryId: 'r1', title: 'Dyson V15 Detect Cordless Vacuum', price: 749.99, image: 'https://images.unsplash.com/photo-1527515637462-cee1395c0c14?w=400&h=400&fit=crop&q=80', store: 'Amazon', storeUrl: 'https://amazon.com/dyson-v15', affiliateUrl: 'https://amazon.com/dyson-v15?tag=giftlist-20', category: 'Home', priority: 'nice-to-have', purchaseStatus: 'available', addedVia: 'url-import', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', priceHistory: makePriceHistory(749.99), quantity: 1, createdAt: '2026-05-13T10:00:00Z' },
  { id: 'p4', registryId: 'r1', title: 'Brooklinen Luxe Core Sheet Set - King', price: 178.00, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop', store: 'Brooklinen', storeUrl: 'https://brooklinen.com/sheets-king', affiliateUrl: 'https://brooklinen.com/sheets-king?ref=giftlist', category: 'Bedroom', priority: 'must-have', purchaseStatus: 'purchased', purchasedBy: 'Cousin Rachel', purchasedAt: '2026-07-18T09:00:00Z', purchaseMethod: 'manual', addedVia: 'url-import', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', priceHistory: makePriceHistory(178.00), quantity: 1, createdAt: '2026-05-14T10:00:00Z' },
  { id: 'p5', registryId: 'r1', title: 'Nespresso Vertuo Next Coffee Machine', price: 159.00, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&q=80', store: 'Williams Sonoma', storeUrl: 'https://williams-sonoma.com/nespresso', affiliateUrl: 'https://williams-sonoma.com/nespresso?ref=giftlist', category: 'Kitchen', priority: 'nice-to-have', purchaseStatus: 'reserved', trackingToken: 'tk_abc123', addedVia: 'registry-sync', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', priceHistory: makePriceHistory(159.00), quantity: 1, createdAt: '2026-05-15T10:00:00Z' },
  { id: 'p6', registryId: 'r1', title: 'Waterford Crystal Wine Glasses Set of 6', price: 295.00, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed514?w=400&h=400&fit=crop&q=80', store: 'Amazon', storeUrl: 'https://amazon.com/waterford-glasses', affiliateUrl: 'https://amazon.com/waterford-glasses?tag=giftlist-20', category: 'Dining', priority: 'dream', purchaseStatus: 'available', addedVia: 'catalog', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', priceHistory: makePriceHistory(295.00), quantity: 1, createdAt: '2026-05-16T10:00:00Z' },
  { id: 'p7', registryId: 'r1', title: 'All-Clad D5 Stainless 10-Piece Cookware Set', price: 899.99, image: 'https://images.unsplash.com/photo-1584990347449-a0e8e0e95f94?w=400&h=400&fit=crop&q=80', store: 'Williams Sonoma', storeUrl: 'https://williams-sonoma.com/all-clad', affiliateUrl: 'https://williams-sonoma.com/all-clad?ref=giftlist', category: 'Kitchen', priority: 'dream', purchaseStatus: 'available', addedVia: 'manual', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', priceHistory: makePriceHistory(899.99), quantity: 1, createdAt: '2026-05-17T10:00:00Z' },
  { id: 'p8', registryId: 'r1', title: 'Casper Original Hybrid Mattress - Queen', price: 1295.00, originalPrice: 1495.00, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop', store: 'Casper', storeUrl: 'https://casper.com/mattress-queen', affiliateUrl: 'https://casper.com/mattress-queen?ref=giftlist', category: 'Bedroom', priority: 'dream', purchaseStatus: 'available', addedVia: 'url-import', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', priceHistory: makePriceHistory(1295.00), quantity: 1, createdAt: '2026-05-18T10:00:00Z' },

  // Baby Shower (r2)
  { id: 'p9', registryId: 'r2', title: 'UPPAbaby Vista V3 Stroller - Greyson', price: 1099.99, image: 'https://images.unsplash.com/photo-1566004100477-7b1e3d1c8483?w=400&h=400&fit=crop&q=80', store: 'Amazon', storeUrl: 'https://amazon.com/uppababy-vista', affiliateUrl: 'https://amazon.com/uppababy-vista?tag=giftlist-20', category: 'Gear', priority: 'must-have', purchaseStatus: 'purchased', purchasedBy: 'Grandma Rivera', purchasedAt: '2026-07-15T16:00:00Z', purchaseMethod: 'affiliate', addedVia: 'catalog', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', priceHistory: makePriceHistory(1099.99), quantity: 1, createdAt: '2026-06-16T10:00:00Z' },
  { id: 'p10', registryId: 'r2', title: 'Hatch Rest+ Sound Machine & Night Light', price: 69.99, image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&h=400&fit=crop&q=80', store: 'Amazon', storeUrl: 'https://amazon.com/hatch-rest', affiliateUrl: 'https://amazon.com/hatch-rest?tag=giftlist-20', category: 'Nursery', priority: 'must-have', purchaseStatus: 'available', addedVia: 'catalog', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', priceHistory: makePriceHistory(69.99), quantity: 1, createdAt: '2026-06-17T10:00:00Z' },
  { id: 'p11', registryId: 'r2', title: 'Babyletto Hudson 3-in-1 Convertible Crib', price: 399.00, image: 'https://images.unsplash.com/photo-1586105449897-20b5efeb3233?w=400&h=400&fit=crop', store: 'BuyBuy Baby', storeUrl: 'https://buybuybaby.com/babyletto-crib', affiliateUrl: 'https://buybuybaby.com/babyletto-crib?ref=giftlist', category: 'Nursery', priority: 'must-have', purchaseStatus: 'available', addedVia: 'registry-sync', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', priceHistory: makePriceHistory(399.00), quantity: 1, createdAt: '2026-06-18T10:00:00Z' },
  { id: 'p12', registryId: 'r2', title: 'Ergobaby Omni Dream Baby Carrier', price: 189.00, image: 'https://images.unsplash.com/photo-1504151932400-72d4384f04b3?w=400&h=400&fit=crop&q=80', store: 'Amazon', storeUrl: 'https://amazon.com/ergobaby-carrier', affiliateUrl: 'https://amazon.com/ergobaby-carrier?tag=giftlist-20', category: 'Gear', priority: 'nice-to-have', purchaseStatus: 'available', addedVia: 'url-import', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', priceHistory: makePriceHistory(189.00), quantity: 1, createdAt: '2026-06-19T10:00:00Z' },
  { id: 'p13', registryId: 'r2', title: 'Skip Hop Activity Center - Silver Lining Cloud', price: 109.99, image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/skiphop-activity', affiliateUrl: 'https://amazon.com/skiphop-activity?tag=giftlist-20', category: 'Toys', priority: 'nice-to-have', purchaseStatus: 'purchased', purchasedBy: 'Uncle Mike', purchasedAt: '2026-07-22T11:00:00Z', purchaseMethod: 'token', addedVia: 'catalog', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', priceHistory: makePriceHistory(109.99), quantity: 1, createdAt: '2026-06-20T10:00:00Z' },

  // Birthday (r3)
  { id: 'p14', registryId: 'r3', title: 'Sony WH-1000XM5 Wireless Headphones', price: 348.00, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/sony-xm5', affiliateUrl: 'https://amazon.com/sony-xm5?tag=giftlist-20', category: 'Electronics', priority: 'must-have', purchaseStatus: 'available', addedVia: 'catalog', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', priceHistory: makePriceHistory(348.00), quantity: 1, createdAt: '2026-07-02T10:00:00Z' },
  { id: 'p15', registryId: 'r3', title: 'Kindle Paperwhite Signature Edition', price: 189.99, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/kindle-paperwhite', affiliateUrl: 'https://amazon.com/kindle-paperwhite?tag=giftlist-20', category: 'Electronics', priority: 'nice-to-have', purchaseStatus: 'available', addedVia: 'catalog', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', priceHistory: makePriceHistory(189.99), quantity: 1, createdAt: '2026-07-03T10:00:00Z' },
  { id: 'p16', registryId: 'r3', title: 'Theragun Elite Massage Gun', price: 399.00, image: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=400&h=400&fit=crop&q=80', store: 'Amazon', storeUrl: 'https://amazon.com/theragun-elite', affiliateUrl: 'https://amazon.com/theragun-elite?tag=giftlist-20', category: 'Wellness', priority: 'dream', purchaseStatus: 'available', addedVia: 'url-import', inStock: false, lastPriceCheck: '2026-07-27T06:00:00Z', priceHistory: makePriceHistory(399.00), quantity: 1, createdAt: '2026-07-04T10:00:00Z' },
  { id: 'p17', registryId: 'r3', title: 'Lululemon Yoga Mat - 5mm', price: 88.00, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop', store: 'Lululemon', storeUrl: 'https://lululemon.com/yoga-mat', affiliateUrl: 'https://lululemon.com/yoga-mat?ref=giftlist', category: 'Fitness', priority: 'nice-to-have', purchaseStatus: 'available', addedVia: 'url-import', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', priceHistory: makePriceHistory(88.00), quantity: 1, createdAt: '2026-07-05T10:00:00Z' },

  // Housewarming (r4)
  { id: 'p18', registryId: 'r4', title: 'Philips Hue Starter Kit - White & Color', price: 199.99, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop&q=80', store: 'Amazon', storeUrl: 'https://amazon.com/philips-hue', affiliateUrl: 'https://amazon.com/philips-hue?tag=giftlist-20', category: 'Smart Home', priority: 'must-have', purchaseStatus: 'available', addedVia: 'catalog', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', priceHistory: makePriceHistory(199.99), quantity: 1, createdAt: '2026-07-21T10:00:00Z' },
  { id: 'p19', registryId: 'r4', title: 'Sonos One SL Speaker - White', price: 219.00, image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/sonos-one', affiliateUrl: 'https://amazon.com/sonos-one?tag=giftlist-20', category: 'Electronics', priority: 'nice-to-have', purchaseStatus: 'available', addedVia: 'url-import', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', priceHistory: makePriceHistory(219.00), quantity: 1, createdAt: '2026-07-22T10:00:00Z' },
];

const SEED_CATALOG: CatalogProduct[] = [
  { id: 'c1', title: 'KitchenAid Artisan Stand Mixer', price: 379.99, image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=400&fit=crop&q=80', store: 'Amazon', storeUrl: 'https://amazon.com/kitchenaid-mixer', category: 'Kitchen', rating: 4.8, reviewCount: 12840 },
  { id: 'c2', title: 'Instant Pot Duo Plus 6-Quart', price: 89.95, image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/instant-pot', category: 'Kitchen', rating: 4.7, reviewCount: 98420 },
  { id: 'c3', title: 'Dyson V15 Detect Cordless Vacuum', price: 749.99, image: 'https://images.unsplash.com/photo-1527515637462-cee1395c0c14?w=400&h=400&fit=crop&q=80', store: 'Amazon', storeUrl: 'https://amazon.com/dyson-v15', category: 'Home', rating: 4.6, reviewCount: 5670 },
  { id: 'c4', title: 'Sony WH-1000XM5 Headphones', price: 348.00, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/sony-xm5', category: 'Electronics', rating: 4.7, reviewCount: 23100 },
  { id: 'c5', title: 'Apple AirPods Pro (2nd Gen)', price: 249.00, image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/airpods-pro', category: 'Electronics', rating: 4.7, reviewCount: 67200 },
  { id: 'c6', title: 'Ninja Foodi 6-in-1 Air Fryer', price: 119.99, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/ninja-air-fryer', category: 'Kitchen', rating: 4.8, reviewCount: 34500 },
  { id: 'c7', title: 'UPPAbaby Vista V3 Stroller', price: 1099.99, image: 'https://images.unsplash.com/photo-1566004100477-7b1e3d1c8483?w=400&h=400&fit=crop&q=80', store: 'Amazon', storeUrl: 'https://amazon.com/uppababy-vista', category: 'Baby Gear', rating: 4.8, reviewCount: 2340 },
  { id: 'c8', title: 'Nespresso Vertuo Next Coffee Machine', price: 159.00, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/nespresso-vertuo', category: 'Kitchen', rating: 4.5, reviewCount: 18900 },
  { id: 'c9', title: 'Kindle Paperwhite Signature Edition', price: 189.99, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/kindle-paperwhite', category: 'Electronics', rating: 4.6, reviewCount: 45600 },
  { id: 'c10', title: 'Vitamix E310 Explorian Blender', price: 349.95, image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/vitamix-e310', category: 'Kitchen', rating: 4.7, reviewCount: 8900 },
  { id: 'c11', title: 'Philips Hue Starter Kit', price: 199.99, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop&q=80', store: 'Amazon', storeUrl: 'https://amazon.com/philips-hue', category: 'Smart Home', rating: 4.5, reviewCount: 12300 },
  { id: 'c12', title: 'iRobot Roomba j7+ Robot Vacuum', price: 599.00, image: 'https://images.unsplash.com/photo-1603618090554-10b5e3e2ddab?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/roomba-j7', category: 'Home', rating: 4.4, reviewCount: 7800 },
];

const SEED_AFFILIATES: AffiliateConfig[] = [
  { id: 'a1', store: 'Amazon', affiliateId: 'giftlist-20', affiliateNetwork: 'Amazon Associates', urlPattern: 'amazon.com', paramName: 'tag', isActive: true, totalClicks: 1247, totalRevenue: 3420.50, lastUpdated: '2026-07-27T08:00:00Z' },
  { id: 'a2', store: 'Crate & Barrel', affiliateId: 'giftlist-cb', affiliateNetwork: 'CJ Affiliate', urlPattern: 'crateandbarrel.com', paramName: 'ref', isActive: true, totalClicks: 342, totalRevenue: 890.25, lastUpdated: '2026-07-27T08:00:00Z' },
  { id: 'a3', store: 'Williams Sonoma', affiliateId: 'giftlist-ws', affiliateNetwork: 'CJ Affiliate', urlPattern: 'williams-sonoma.com', paramName: 'ref', isActive: true, totalClicks: 189, totalRevenue: 567.80, lastUpdated: '2026-07-25T08:00:00Z' },
  { id: 'a4', store: 'Target', affiliateId: 'giftlist-tgt', affiliateNetwork: 'Impact', urlPattern: 'target.com', paramName: 'ref', isActive: true, totalClicks: 456, totalRevenue: 1230.40, lastUpdated: '2026-07-26T08:00:00Z' },
  { id: 'a5', store: 'Brooklinen', affiliateId: 'giftlist-bl', affiliateNetwork: 'ShareASale', urlPattern: 'brooklinen.com', paramName: 'ref', isActive: true, totalClicks: 98, totalRevenue: 245.60, lastUpdated: '2026-07-24T08:00:00Z' },
  { id: 'a6', store: 'BuyBuy Baby', affiliateId: 'giftlist-bbb', affiliateNetwork: 'CJ Affiliate', urlPattern: 'buybuybaby.com', paramName: 'ref', isActive: false, totalClicks: 67, totalRevenue: 178.90, lastUpdated: '2026-06-01T08:00:00Z' },
  { id: 'a7', store: 'Lululemon', affiliateId: 'giftlist-ll', affiliateNetwork: 'Rakuten', urlPattern: 'lululemon.com', paramName: 'ref', isActive: true, totalClicks: 134, totalRevenue: 412.30, lastUpdated: '2026-07-23T08:00:00Z' },
  { id: 'a8', store: 'Casper', affiliateId: 'giftlist-cas', affiliateNetwork: 'Impact', urlPattern: 'casper.com', paramName: 'ref', isActive: true, totalClicks: 56, totalRevenue: 890.00, lastUpdated: '2026-07-22T08:00:00Z' },
];

const SEED_NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 'u1', type: 'gift-purchased', title: 'Gift Purchased!', message: 'Aunt Martha purchased Le Creuset Dutch Oven from your wedding registry.', read: false, createdAt: '2026-07-20T14:30:00Z', data: { productId: 'p2', registryId: 'r1' } },
  { id: 'n2', userId: 'u1', type: 'gift-purchased', title: 'Gift Purchased!', message: 'Cousin Rachel purchased Brooklinen Luxe Core Sheet Set.', read: true, createdAt: '2026-07-18T09:00:00Z', data: { productId: 'p4', registryId: 'r1' } },
  { id: 'n3', userId: 'u3', type: 'gift-purchased', title: 'Gift Purchased!', message: 'Grandma Rivera purchased UPPAbaby Vista V3 Stroller.', read: false, createdAt: '2026-07-15T16:00:00Z', data: { productId: 'p9', registryId: 'r2' } },
  { id: 'n4', userId: 'u4', type: 'out-of-stock', title: 'Item Out of Stock', message: 'Theragun Elite Massage Gun is currently out of stock.', read: false, createdAt: '2026-07-25T08:00:00Z', data: { productId: 'p16', registryId: 'r3' } },
  { id: 'n5', userId: 'u1', type: 'sync-complete', title: 'Registry Synced', message: 'Your Crate & Barrel registry has been synced. 8 items found.', read: true, createdAt: '2026-07-27T08:05:00Z', data: { registryId: 'r1' } },
  { id: 'n6', userId: 'u3', type: 'gift-purchased', title: 'Gift Purchased!', message: 'Uncle Mike purchased Skip Hop Activity Center.', read: false, createdAt: '2026-07-22T11:00:00Z', data: { productId: 'p13', registryId: 'r2' } },
  { id: 'n7', userId: 'u1', type: 'price-change', title: 'Price Drop!', message: 'Casper Original Hybrid Mattress dropped from $1,495 to $1,295.', read: false, createdAt: '2026-07-26T06:00:00Z', data: { productId: 'p8', registryId: 'r1' } },
  { id: 'n8', userId: 'u4', type: 'registry-expiring', title: 'Registry Expiring Soon', message: 'Your birthday registry will expire in 60 days. Extend it in settings.', read: false, createdAt: '2026-07-24T10:00:00Z', data: { registryId: 'r3' } },
];

function generateScrapeLogs(): ScrapeLog[] {
  const stores = ['Amazon', 'Target', 'Crate & Barrel', 'Williams Sonoma', 'Brooklinen', 'Walmart'];
  const methods: ScrapeLog['method'][] = ['opengraph', 'headless', 'store-parser', 'managed-service'];
  const logs: ScrapeLog[] = [];
  for (let i = 0; i < 25; i++) {
    const d = new Date(); d.setHours(d.getHours() - i * 3);
    const store = stores[Math.floor(Math.random() * stores.length)];
    const success = Math.random() > 0.15;
    logs.push({
      id: `sl_${i}`, url: `https://${store.toLowerCase().replace(/[& ]/g, '')}.com/product/${Math.random().toString(36).substr(2, 8)}`,
      store, status: success ? 'success' : (Math.random() > 0.5 ? 'failed' : 'partial'),
      method: methods[Math.floor(Math.random() * methods.length)],
      extractedTitle: success ? `${store} Product ${i + 1}` : undefined,
      extractedPrice: success ? Math.floor(Math.random() * 500) + 20 : undefined,
      errorMessage: !success ? 'Could not extract product data from page' : undefined,
      duration: Math.floor(Math.random() * 3000) + 200,
      createdAt: d.toISOString(),
    });
  }
  return logs;
}

function generateClickLogs(): ClickLog[] {
  const products = ['KitchenAid Mixer', 'Le Creuset Dutch Oven', 'Dyson Vacuum', 'Sony Headphones', 'Kindle Paperwhite', 'Philips Hue Kit', 'Nespresso Machine'];
  const stores = ['Amazon', 'Crate & Barrel', 'Williams Sonoma', 'Brooklinen'];
  const logs: ClickLog[] = [];
  for (let i = 0; i < 40; i++) {
    const d = new Date(); d.setHours(d.getHours() - i * 2);
    logs.push({
      id: `cl_${i}`, productId: `p${(i % 19) + 1}`,
      productTitle: products[i % products.length],
      registryId: `r${(i % 4) + 1}`, store: stores[i % stores.length],
      affiliateId: 'giftlist-20', referrer: 'direct',
      createdAt: d.toISOString(),
    });
  }
  return logs;
}

function generateSystemLogs(): SystemLog[] {
  const logs: SystemLog[] = [
    { id: 'sys1', type: 'info', module: 'sync', message: 'Registry sync completed for Crate & Barrel (sarah-david)', details: '8 products synced, 0 errors', createdAt: '2026-07-27T08:05:00Z' },
    { id: 'sys2', type: 'info', module: 'sync', message: 'Registry sync completed for Amazon (sarah-david)', details: '12 products synced, 0 errors', createdAt: '2026-07-27T08:03:00Z' },
    { id: 'sys3', type: 'warning', module: 'price-monitor', message: 'Price change detected: Casper Mattress', details: 'Price dropped from $1,495.00 to $1,295.00 (-13.4%)', createdAt: '2026-07-26T06:00:00Z' },
    { id: 'sys4', type: 'error', module: 'scraper', message: 'Failed to scrape product from walmart.com', details: 'Headless browser timeout after 30s. URL: https://walmart.com/ip/12345', createdAt: '2026-07-26T04:30:00Z' },
    { id: 'sys5', type: 'warning', module: 'price-monitor', message: 'Product out of stock: Theragun Elite', details: 'amazon.com reports 0 availability', createdAt: '2026-07-25T06:00:00Z' },
    { id: 'sys6', type: 'info', module: 'affiliate', message: 'Affiliate callback received from Amazon Associates', details: 'Order confirmed for product p9 (UPPAbaby Vista). Commission: $54.99', createdAt: '2026-07-15T16:30:00Z' },
    { id: 'sys7', type: 'error', module: 'sync', message: 'Failed to sync BuyBuy Baby registry', details: 'HTTP 403 Forbidden - possible anti-bot protection triggered', createdAt: '2026-07-25T08:10:00Z' },
    { id: 'sys8', type: 'info', module: 'registry', message: 'New registry created: Emily\'s 30th Birthday Bash', details: 'Owner: Emily Chen (u4). Occasion: birthday', createdAt: '2026-07-01T09:00:00Z' },
    { id: 'sys9', type: 'info', module: 'auth', message: 'New user registered: Emily Chen', details: 'Email: emily@example.com', createdAt: '2026-07-01T09:00:00Z' },
    { id: 'sys10', type: 'warning', module: 'scraper', message: 'Partial extraction from brooklinen.com', details: 'OpenGraph extracted title and image but not price. Falling back to headless browser.', createdAt: '2026-07-24T14:00:00Z' },
    { id: 'sys11', type: 'info', module: 'price-monitor', message: 'Nightly price check completed', details: '19 products checked. 1 price change, 1 out-of-stock detected.', createdAt: '2026-07-27T06:15:00Z' },
    { id: 'sys12', type: 'error', module: 'scraper', message: 'Store parser failed for Target product', details: 'Unexpected DOM structure change. Parser needs update.', createdAt: '2026-07-23T15:20:00Z' },
  ];
  return logs;
}

// ─── Init ────────────────────────────────────────────────────────

const SEED_VERSION = '5';

function initSeedData() {
  if (localStorage.getItem('gl_seed_version') !== SEED_VERSION) {
    write(STORAGE_KEYS.users, SEED_USERS);
    write(STORAGE_KEYS.registries, SEED_REGISTRIES);
    write(STORAGE_KEYS.products, SEED_PRODUCTS);
    write(STORAGE_KEYS.catalog, SEED_CATALOG);
    write(STORAGE_KEYS.affiliates, SEED_AFFILIATES);
    write(STORAGE_KEYS.notifications, SEED_NOTIFICATIONS);
    write(STORAGE_KEYS.scrapeLogs, generateScrapeLogs());
    write(STORAGE_KEYS.clickLogs, generateClickLogs());
    write(STORAGE_KEYS.systemLogs, generateSystemLogs());
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    localStorage.setItem('gl_seed_version', SEED_VERSION);
  }
}

initSeedData();

// ─── Auth ────────────────────────────────────────────────────────

export async function login(email: string, _password: string): Promise<User> {
  await delay();
  const users = read<User>(STORAGE_KEYS.users);
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error('Invalid email or password');
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
  return user;
}

export async function register(name: string, email: string, _password: string): Promise<User> {
  await delay();
  const users = read<User>(STORAGE_KEYS.users);
  if (users.find((u) => u.email === email)) throw new Error('Email already exists');
  const user: User = { id: generateId(), email, name, role: 'owner', createdAt: new Date().toISOString() };
  users.push(user);
  write(STORAGE_KEYS.users, users);
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
  return user;
}

export async function getCurrentUser(): Promise<User | null> {
  await delay(50);
  const data = localStorage.getItem(STORAGE_KEYS.currentUser);
  return data ? JSON.parse(data) : null;
}

export async function logout(): Promise<void> {
  await delay(100);
  localStorage.removeItem(STORAGE_KEYS.currentUser);
}

export async function resetPassword(email: string): Promise<void> {
  await delay();
  const users = read<User>(STORAGE_KEYS.users);
  if (!users.find((u) => u.email === email)) throw new Error('No account found with that email');
}

// ─── Registries ──────────────────────────────────────────────────

export async function getRegistries(ownerId?: string): Promise<Registry[]> {
  await delay();
  const registries = read<Registry>(STORAGE_KEYS.registries);
  return ownerId ? registries.filter((r) => r.ownerId === ownerId) : registries;
}

export async function getRegistry(id: string): Promise<Registry> {
  await delay();
  const registries = read<Registry>(STORAGE_KEYS.registries);
  const registry = registries.find((r) => r.id === id);
  if (!registry) throw new Error('Registry not found');
  return registry;
}

export async function getRegistryBySlug(slug: string): Promise<Registry> {
  await delay();
  const registries = read<Registry>(STORAGE_KEYS.registries);
  const registry = registries.find((r) => r.slug === slug);
  if (!registry) throw new Error('Registry not found');
  // increment view count
  const idx = registries.findIndex((r) => r.slug === slug);
  registries[idx].viewCount = (registries[idx].viewCount || 0) + 1;
  write(STORAGE_KEYS.registries, registries);
  return registries[idx];
}

export async function createRegistry(data: Omit<Registry, 'id' | 'slug' | 'createdAt' | 'expiresAt' | 'syncedRegistries' | 'viewCount'>): Promise<Registry> {
  await delay();
  const registries = read<Registry>(STORAGE_KEYS.registries);
  const registry: Registry = {
    ...data,
    id: generateId(),
    slug: slugify(data.title),
    syncedRegistries: [],
    viewCount: 0,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 36 * 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  registries.push(registry);
  write(STORAGE_KEYS.registries, registries);
  addSystemLog('info', 'registry', `New registry created: ${registry.title}`, `Owner: ${data.ownerName}. Occasion: ${data.occasion}`);
  return registry;
}

export async function updateRegistry(id: string, data: Partial<Registry>): Promise<Registry> {
  await delay();
  const registries = read<Registry>(STORAGE_KEYS.registries);
  const idx = registries.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Registry not found');
  registries[idx] = { ...registries[idx], ...data };
  write(STORAGE_KEYS.registries, registries);
  return registries[idx];
}

export async function deleteRegistry(id: string): Promise<void> {
  await delay();
  let registries = read<Registry>(STORAGE_KEYS.registries);
  const reg = registries.find((r) => r.id === id);
  registries = registries.filter((r) => r.id !== id);
  write(STORAGE_KEYS.registries, registries);
  let products = read<Product>(STORAGE_KEYS.products);
  products = products.filter((p) => p.registryId !== id);
  write(STORAGE_KEYS.products, products);
  if (reg) addSystemLog('info', 'registry', `Registry deleted: ${reg.title}`, `ID: ${id}`);
}

export async function addSyncedRegistry(registryId: string, platform: string, url: string): Promise<SyncedRegistry> {
  await delay();
  const registries = read<Registry>(STORAGE_KEYS.registries);
  const idx = registries.findIndex((r) => r.id === registryId);
  if (idx === -1) throw new Error('Registry not found');
  const synced: SyncedRegistry = {
    id: generateId(), platform, url,
    lastSynced: new Date().toISOString(),
    status: 'pending', itemCount: 0,
  };
  registries[idx].syncedRegistries.push(synced);
  write(STORAGE_KEYS.registries, registries);
  addSystemLog('info', 'sync', `Sync started for ${platform}`, `Registry: ${registries[idx].title}. URL: ${url}`);

  setTimeout(() => {
    const regs = read<Registry>(STORAGE_KEYS.registries);
    const ri = regs.findIndex((r) => r.id === registryId);
    if (ri !== -1) {
      const si = regs[ri].syncedRegistries.findIndex((s) => s.id === synced.id);
      if (si !== -1) {
        const success = Math.random() > 0.2;
        regs[ri].syncedRegistries[si].status = success ? 'active' : 'error';
        regs[ri].syncedRegistries[si].itemCount = success ? Math.floor(Math.random() * 10) + 3 : 0;
        regs[ri].syncedRegistries[si].lastSynced = new Date().toISOString();
        write(STORAGE_KEYS.registries, regs);
        if (success) {
          addSystemLog('info', 'sync', `Sync completed for ${platform}`, `${regs[ri].syncedRegistries[si].itemCount} products synced`);
          const notifs = read<Notification>(STORAGE_KEYS.notifications);
          notifs.unshift({ id: generateId(), userId: regs[ri].ownerId, type: 'sync-complete', title: 'Registry Synced', message: `Your ${platform} registry has been synced. ${regs[ri].syncedRegistries[si].itemCount} items found.`, read: false, createdAt: new Date().toISOString(), data: { registryId } });
          write(STORAGE_KEYS.notifications, notifs);
        } else {
          addSystemLog('error', 'sync', `Failed to sync ${platform} registry`, 'HTTP 403 Forbidden - anti-bot protection');
          const notifs = read<Notification>(STORAGE_KEYS.notifications);
          notifs.unshift({ id: generateId(), userId: regs[ri].ownerId, type: 'sync-error', title: 'Sync Failed', message: `Failed to sync your ${platform} registry. We'll retry automatically.`, read: false, createdAt: new Date().toISOString(), data: { registryId } });
          write(STORAGE_KEYS.notifications, notifs);
        }
      }
    }
  }, 3000);
  return synced;
}

export async function removeSyncedRegistry(registryId: string, syncedId: string): Promise<void> {
  await delay();
  const registries = read<Registry>(STORAGE_KEYS.registries);
  const idx = registries.findIndex((r) => r.id === registryId);
  if (idx !== -1) {
    registries[idx].syncedRegistries = registries[idx].syncedRegistries.filter((s) => s.id !== syncedId);
    write(STORAGE_KEYS.registries, registries);
  }
}

// ─── Products ────────────────────────────────────────────────────

export async function getProducts(registryId: string): Promise<Product[]> {
  await delay();
  const products = read<Product>(STORAGE_KEYS.products);
  return products.filter((p) => p.registryId === registryId);
}

export async function getAllProducts(): Promise<Product[]> {
  await delay();
  return read<Product>(STORAGE_KEYS.products);
}

export async function addProduct(data: Omit<Product, 'id' | 'createdAt' | 'lastPriceCheck' | 'priceHistory'>): Promise<Product> {
  await delay();
  const products = read<Product>(STORAGE_KEYS.products);
  const product: Product = {
    ...data,
    id: generateId(),
    lastPriceCheck: new Date().toISOString(),
    priceHistory: [{ price: data.price, date: new Date().toISOString().split('T')[0], inStock: data.inStock }],
    createdAt: new Date().toISOString(),
  };
  products.push(product);
  write(STORAGE_KEYS.products, products);
  return product;
}

// ─── URL Import with Multi-Layer Pipeline ────────────────────────

const SIMULATED_PRODUCTS: Record<string, { title: string; price: number; image: string; category: string }> = {
  'amazon': { title: 'Echo Dot (5th Gen) Smart Speaker with Alexa', price: 49.99, image: 'https://images.unsplash.com/photo-1543512214-318228f8e869?w=400&h=400&fit=crop&q=80', category: 'Smart Home' },
  'target': { title: 'Threshold Ceramic Table Lamp - White', price: 34.99, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop&q=80', category: 'Home Decor' },
  'walmart': { title: 'Beautiful 12-Piece Cookware Set by Drew Barrymore', price: 119.00, image: 'https://images.unsplash.com/photo-1584990347449-a0e8e0e95f94?w=400&h=400&fit=crop&q=80', category: 'Kitchen' },
  'crateandbarrel': { title: 'Faye Cream Dining Chair', price: 299.00, image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop&q=80', category: 'Furniture' },
  'williams-sonoma': { title: 'Breville Barista Express Espresso Machine', price: 699.95, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&q=80', category: 'Kitchen' },
  'brooklinen': { title: 'Classic Hardcore Sheet Bundle', price: 263.20, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop&q=80', category: 'Bedroom' },
  'lululemon': { title: 'Wunder Under High-Rise Tight 25"', price: 98.00, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop&q=80', category: 'Fitness' },
};

function detectStore(url: string): string {
  const hostname = url.toLowerCase();
  if (hostname.includes('amazon')) return 'Amazon';
  if (hostname.includes('target')) return 'Target';
  if (hostname.includes('walmart')) return 'Walmart';
  if (hostname.includes('crateandbarrel') || hostname.includes('crate-and-barrel')) return 'Crate & Barrel';
  if (hostname.includes('williams-sonoma') || hostname.includes('williamssonoma')) return 'Williams Sonoma';
  if (hostname.includes('brooklinen')) return 'Brooklinen';
  if (hostname.includes('lululemon')) return 'Lululemon';
  if (hostname.includes('etsy')) return 'Etsy';
  if (hostname.includes('nordstrom')) return 'Nordstrom';
  return 'Other';
}

function getAffiliateUrl(url: string, store: string): string {
  const affiliates = read<AffiliateConfig>(STORAGE_KEYS.affiliates);
  const match = affiliates.find((a) => url.toLowerCase().includes(a.urlPattern) && a.isActive);
  if (match) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${match.paramName}=${match.affiliateId}`;
  }
  return url;
}

export async function importProductFromUrl(registryId: string, url: string): Promise<{ product: Product; pipeline: ImportPipelineResult }> {
  const store = detectStore(url);
  const storeKey = store.toLowerCase().replace(/[& ]/g, '').replace(/'/g, '');
  const simulated = SIMULATED_PRODUCTS[storeKey] || {
    title: `Product from ${store}`,
    price: Math.floor(Math.random() * 300) + 25,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=80',
    category: 'General',
  };

  const layers: ImportLayerResult[] = [];

  // Layer 1: OpenGraph
  await delay(400);
  const ogSuccess = Math.random() > 0.3;
  layers.push({
    layer: 1, name: 'OpenGraph & Meta Tags', status: ogSuccess ? 'success' : 'failed',
    duration: Math.floor(Math.random() * 500) + 200,
    extracted: ogSuccess ? { title: simulated.title, image: simulated.image } : undefined,
    error: ogSuccess ? undefined : 'No OG tags found on page',
  });

  // Layer 2: Headless Browser
  if (!ogSuccess) {
    await delay(600);
    const headlessSuccess = Math.random() > 0.2;
    layers.push({
      layer: 2, name: 'Headless Browser (Playwright)', status: headlessSuccess ? 'success' : 'failed',
      duration: Math.floor(Math.random() * 2000) + 1000,
      extracted: headlessSuccess ? { title: simulated.title, price: simulated.price, image: simulated.image } : undefined,
      error: headlessSuccess ? undefined : 'Could not render page content',
    });
  } else {
    layers.push({ layer: 2, name: 'Headless Browser (Playwright)', status: 'skipped', duration: 0 });
  }

  // Layer 3: Store Parser
  const hasParser = ['Amazon', 'Target', 'Crate & Barrel'].includes(store);
  if (hasParser) {
    await delay(300);
    layers.push({
      layer: 3, name: `Dedicated Store Parser (${store})`, status: 'success',
      duration: Math.floor(Math.random() * 400) + 100,
      extracted: { title: simulated.title, price: simulated.price, image: simulated.image },
    });
  } else {
    layers.push({ layer: 3, name: 'Dedicated Store Parser', status: 'skipped', duration: 0, error: `No parser available for ${store}` });
  }

  // Layer 4: Managed Service
  layers.push({ layer: 4, name: 'Managed Scraping Service (Zyte)', status: 'skipped', duration: 0, error: 'Not needed - data extracted from prior layers' });

  const affiliateUrl = getAffiliateUrl(url, store);
  const product: Product = {
    id: generateId(), registryId,
    title: simulated.title, price: simulated.price, image: simulated.image,
    store, storeUrl: url, affiliateUrl, category: simulated.category,
    priority: 'nice-to-have', purchaseStatus: 'available', addedVia: 'url-import',
    inStock: true, quantity: 1,
    lastPriceCheck: new Date().toISOString(),
    priceHistory: [{ price: simulated.price, date: new Date().toISOString().split('T')[0], inStock: true }],
    createdAt: new Date().toISOString(),
  };

  const products = read<Product>(STORAGE_KEYS.products);
  products.push(product);
  write(STORAGE_KEYS.products, products);

  // Log the scrape
  const scrapeLogs = read<ScrapeLog>(STORAGE_KEYS.scrapeLogs);
  scrapeLogs.unshift({
    id: generateId(), url, store, status: 'success',
    method: hasParser ? 'store-parser' : (ogSuccess ? 'opengraph' : 'headless'),
    extractedTitle: simulated.title, extractedPrice: simulated.price, extractedImage: simulated.image,
    duration: layers.reduce((s, l) => s + l.duration, 0),
    createdAt: new Date().toISOString(),
  });
  write(STORAGE_KEYS.scrapeLogs, scrapeLogs);

  const pipeline: ImportPipelineResult = {
    url, layers, finalResult: { title: simulated.title, price: simulated.price, image: simulated.image, store }, success: true,
  };

  return { product, pipeline };
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  await delay();
  const products = read<Product>(STORAGE_KEYS.products);
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Product not found');
  products[idx] = { ...products[idx], ...data };
  write(STORAGE_KEYS.products, products);
  return products[idx];
}

export async function markAsPurchased(productId: string, buyerName: string, method: 'manual' | 'token' = 'manual'): Promise<Product> {
  await delay();
  const products = read<Product>(STORAGE_KEYS.products);
  const idx = products.findIndex((p) => p.id === productId);
  if (idx === -1) throw new Error('Product not found');
  products[idx] = {
    ...products[idx],
    purchaseStatus: 'purchased',
    purchasedBy: buyerName,
    purchasedAt: new Date().toISOString(),
    purchaseMethod: method,
  };
  write(STORAGE_KEYS.products, products);

  const registries = read<Registry>(STORAGE_KEYS.registries);
  const registry = registries.find((r) => r.id === products[idx].registryId);
  if (registry) {
    const notifications = read<Notification>(STORAGE_KEYS.notifications);
    notifications.unshift({
      id: generateId(), userId: registry.ownerId, type: 'gift-purchased',
      title: 'Gift Purchased!',
      message: `${buyerName} purchased ${products[idx].title}. (Tracked via ${method === 'token' ? 'verification token' : 'manual confirmation'})`,
      read: false, createdAt: new Date().toISOString(),
      data: { productId, registryId: registry.id },
    });
    write(STORAGE_KEYS.notifications, notifications);
    addSystemLog('info', 'affiliate', `Gift purchase confirmed: ${products[idx].title}`, `Buyer: ${buyerName}. Method: ${method}. Registry: ${registry.title}`);
  }

  return products[idx];
}

export async function reserveProduct(productId: string): Promise<Product> {
  await delay();
  const products = read<Product>(STORAGE_KEYS.products);
  const idx = products.findIndex((p) => p.id === productId);
  if (idx === -1) throw new Error('Product not found');
  products[idx].purchaseStatus = 'reserved';
  products[idx].trackingToken = `tk_${generateId().substring(0, 12)}`;
  write(STORAGE_KEYS.products, products);
  return products[idx];
}

export async function deleteProduct(id: string): Promise<void> {
  await delay();
  let products = read<Product>(STORAGE_KEYS.products);
  products = products.filter((p) => p.id !== id);
  write(STORAGE_KEYS.products, products);
}

// ─── Click Tracking ──────────────────────────────────────────────

export async function recordClick(productId: string, productTitle: string, registryId: string, store: string): Promise<void> {
  const affiliates = read<AffiliateConfig>(STORAGE_KEYS.affiliates);
  const aff = affiliates.find((a) => store.toLowerCase().includes(a.urlPattern.split('.')[0]));
  if (aff) {
    const idx = affiliates.findIndex((a) => a.id === aff.id);
    affiliates[idx].totalClicks += 1;
    write(STORAGE_KEYS.affiliates, affiliates);
  }

  const clickLogs = read<ClickLog>(STORAGE_KEYS.clickLogs);
  clickLogs.unshift({
    id: generateId(), productId, productTitle, registryId, store,
    affiliateId: aff?.affiliateId || 'none', referrer: 'registry-page',
    createdAt: new Date().toISOString(),
  });
  write(STORAGE_KEYS.clickLogs, clickLogs);
}

// ─── Catalog ─────────────────────────────────────────────────────

export async function getCatalogProducts(category?: string): Promise<CatalogProduct[]> {
  await delay();
  const catalog = read<CatalogProduct>(STORAGE_KEYS.catalog);
  return category ? catalog.filter((p) => p.category === category) : catalog;
}

export async function addFromCatalog(registryId: string, catalogProductId: string): Promise<Product> {
  await delay();
  const catalog = read<CatalogProduct>(STORAGE_KEYS.catalog);
  const item = catalog.find((c) => c.id === catalogProductId);
  if (!item) throw new Error('Catalog product not found');

  const affiliateUrl = getAffiliateUrl(item.storeUrl, item.store);

  const product: Product = {
    id: generateId(), registryId,
    title: item.title, price: item.price, image: item.image,
    store: item.store, storeUrl: item.storeUrl, affiliateUrl,
    category: item.category, priority: 'nice-to-have', purchaseStatus: 'available',
    addedVia: 'catalog', inStock: true, quantity: 1,
    lastPriceCheck: new Date().toISOString(),
    priceHistory: [{ price: item.price, date: new Date().toISOString().split('T')[0], inStock: true }],
    createdAt: new Date().toISOString(),
  };

  const products = read<Product>(STORAGE_KEYS.products);
  products.push(product);
  write(STORAGE_KEYS.products, products);
  return product;
}

export async function addCatalogProduct(data: Omit<CatalogProduct, 'id'>): Promise<CatalogProduct> {
  await delay();
  const catalog = read<CatalogProduct>(STORAGE_KEYS.catalog);
  const product: CatalogProduct = { ...data, id: generateId() };
  catalog.push(product);
  write(STORAGE_KEYS.catalog, catalog);
  return product;
}

export async function deleteCatalogProduct(id: string): Promise<void> {
  await delay();
  let catalog = read<CatalogProduct>(STORAGE_KEYS.catalog);
  catalog = catalog.filter((c) => c.id !== id);
  write(STORAGE_KEYS.catalog, catalog);
}

// ─── Affiliates ──────────────────────────────────────────────────

export async function getAffiliates(): Promise<AffiliateConfig[]> {
  await delay();
  return read<AffiliateConfig>(STORAGE_KEYS.affiliates);
}

export async function createAffiliate(data: Omit<AffiliateConfig, 'id' | 'totalClicks' | 'totalRevenue' | 'lastUpdated'>): Promise<AffiliateConfig> {
  await delay();
  const affiliates = read<AffiliateConfig>(STORAGE_KEYS.affiliates);
  const affiliate: AffiliateConfig = { ...data, id: generateId(), totalClicks: 0, totalRevenue: 0, lastUpdated: new Date().toISOString() };
  affiliates.push(affiliate);
  write(STORAGE_KEYS.affiliates, affiliates);
  return affiliate;
}

export async function updateAffiliate(id: string, data: Partial<AffiliateConfig>): Promise<AffiliateConfig> {
  await delay();
  const affiliates = read<AffiliateConfig>(STORAGE_KEYS.affiliates);
  const idx = affiliates.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error('Affiliate not found');
  affiliates[idx] = { ...affiliates[idx], ...data, lastUpdated: new Date().toISOString() };
  write(STORAGE_KEYS.affiliates, affiliates);
  return affiliates[idx];
}

export async function deleteAffiliate(id: string): Promise<void> {
  await delay();
  let affiliates = read<AffiliateConfig>(STORAGE_KEYS.affiliates);
  affiliates = affiliates.filter((a) => a.id !== id);
  write(STORAGE_KEYS.affiliates, affiliates);
}

export function testAffiliateUrl(url: string): { store: string; affiliateUrl: string; affiliateId: string | null; matched: boolean } {
  const store = detectStore(url);
  const affiliates = read<AffiliateConfig>(STORAGE_KEYS.affiliates);
  const match = affiliates.find((a) => url.toLowerCase().includes(a.urlPattern) && a.isActive);
  if (match) {
    const separator = url.includes('?') ? '&' : '?';
    return { store, affiliateUrl: `${url}${separator}${match.paramName}=${match.affiliateId}`, affiliateId: match.affiliateId, matched: true };
  }
  return { store, affiliateUrl: url, affiliateId: null, matched: false };
}

// ─── Notifications ───────────────────────────────────────────────

export async function getNotifications(userId: string): Promise<Notification[]> {
  await delay();
  const notifications = read<Notification>(STORAGE_KEYS.notifications);
  return notifications.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markNotificationRead(id: string): Promise<void> {
  await delay(100);
  const notifications = read<Notification>(STORAGE_KEYS.notifications);
  const idx = notifications.findIndex((n) => n.id === id);
  if (idx !== -1) {
    notifications[idx].read = true;
    write(STORAGE_KEYS.notifications, notifications);
  }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await delay();
  const notifications = read<Notification>(STORAGE_KEYS.notifications);
  notifications.forEach((n) => { if (n.userId === userId) n.read = true; });
  write(STORAGE_KEYS.notifications, notifications);
}

// ─── System Logs ─────────────────────────────────────────────────

function addSystemLog(type: SystemLog['type'], module: SystemLog['module'], message: string, details?: string) {
  const logs = read<SystemLog>(STORAGE_KEYS.systemLogs);
  logs.unshift({ id: generateId(), type, module, message, details, createdAt: new Date().toISOString() });
  if (logs.length > 100) logs.splice(100);
  write(STORAGE_KEYS.systemLogs, logs);
}

export async function getSystemLogs(): Promise<SystemLog[]> {
  await delay();
  return read<SystemLog>(STORAGE_KEYS.systemLogs);
}

export async function getScrapeLogs(): Promise<ScrapeLog[]> {
  await delay();
  return read<ScrapeLog>(STORAGE_KEYS.scrapeLogs);
}

export async function getClickLogs(): Promise<ClickLog[]> {
  await delay();
  return read<ClickLog>(STORAGE_KEYS.clickLogs);
}

// ─── Price Monitoring ────────────────────────────────────────────

export async function runPriceCheck(): Promise<{ checked: number; priceChanges: number; stockChanges: number }> {
  await delay(1500);
  const products = read<Product>(STORAGE_KEYS.products);
  let priceChanges = 0, stockChanges = 0;

  products.forEach((p) => {
    const variance = (Math.random() - 0.5) * p.price * 0.05;
    const newPrice = Math.round((p.price + variance) * 100) / 100;
    const stockFlip = Math.random() > 0.95;

    if (Math.abs(newPrice - p.price) > 1) {
      priceChanges++;
      const registries = read<Registry>(STORAGE_KEYS.registries);
      const reg = registries.find((r) => r.id === p.registryId);
      if (reg && Math.abs(newPrice - p.price) > p.price * 0.03) {
        const notifs = read<Notification>(STORAGE_KEYS.notifications);
        notifs.unshift({
          id: generateId(), userId: reg.ownerId,
          type: 'price-change', title: newPrice < p.price ? 'Price Drop!' : 'Price Increase',
          message: `${p.title} changed from $${p.price.toFixed(2)} to $${newPrice.toFixed(2)}.`,
          read: false, createdAt: new Date().toISOString(),
          data: { productId: p.id, registryId: p.registryId },
        });
        write(STORAGE_KEYS.notifications, notifs);
      }
    }

    p.priceHistory.push({ price: newPrice, date: new Date().toISOString().split('T')[0], inStock: stockFlip ? !p.inStock : p.inStock });
    if (p.priceHistory.length > 60) p.priceHistory = p.priceHistory.slice(-60);
    p.price = newPrice;
    p.lastPriceCheck = new Date().toISOString();

    if (stockFlip) {
      stockChanges++;
      p.inStock = !p.inStock;
    }
  });

  write(STORAGE_KEYS.products, products);
  addSystemLog('info', 'price-monitor', 'Nightly price check completed', `${products.length} products checked. ${priceChanges} price changes, ${stockChanges} stock changes.`);
  return { checked: products.length, priceChanges, stockChanges };
}

// ─── Analytics (Admin) ───────────────────────────────────────────

export async function getAnalytics(): Promise<AnalyticsData> {
  await delay();
  const registries = read<Registry>(STORAGE_KEYS.registries);
  const products = read<Product>(STORAGE_KEYS.products);
  const affiliates = read<AffiliateConfig>(STORAGE_KEYS.affiliates);
  const clickLogs = read<ClickLog>(STORAGE_KEYS.clickLogs);
  const scrapeLogs = read<ScrapeLog>(STORAGE_KEYS.scrapeLogs);

  const totalClicks = affiliates.reduce((s, a) => s + a.totalClicks, 0);
  const totalRevenue = affiliates.reduce((s, a) => s + a.totalRevenue, 0);
  const totalPurchases = products.filter((p) => p.purchaseStatus === 'purchased').length;

  const now = new Date();
  const activeRegistries = registries.filter((r) => new Date(r.expiresAt) > now).length;
  const expiredRegistries = registries.length - activeRegistries;

  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  const productClickCounts: Record<string, { title: string; clicks: number; store: string }> = {};
  clickLogs.forEach((cl) => {
    if (!productClickCounts[cl.productId]) productClickCounts[cl.productId] = { title: cl.productTitle, clicks: 0, store: cl.store };
    productClickCounts[cl.productId].clicks++;
  });
  const topProducts = Object.values(productClickCounts).sort((a, b) => b.clicks - a.clicks).slice(0, 5);

  return {
    registriesCreated: registries.length,
    totalProducts: products.length,
    totalClicks,
    totalPurchases,
    totalRevenue,
    activeRegistries,
    expiredRegistries,
    registriesByDate: dates.map((date) => ({ date, count: Math.floor(Math.random() * 5) + 1 })),
    clicksByDate: dates.map((date) => ({ date, count: Math.floor(Math.random() * 50) + 10 })),
    scrapesByDate: dates.map((date) => ({ date, success: Math.floor(Math.random() * 15) + 5, failed: Math.floor(Math.random() * 3) })),
    topStores: [
      { store: 'Amazon', count: 847 },
      { store: 'Crate & Barrel', count: 234 },
      { store: 'Williams Sonoma', count: 189 },
      { store: 'Target', count: 156 },
      { store: 'Brooklinen', count: 98 },
    ],
    purchasesByMethod: [
      { method: 'Affiliate Tracking', count: 45 },
      { method: 'Manual Confirmation', count: 32 },
      { method: 'Token Verification', count: 18 },
    ],
    topProducts,
  };
}

// ─── Admin Users ─────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  await delay();
  return read<User>(STORAGE_KEYS.users);
}
