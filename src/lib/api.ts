import { delay, generateId, slugify } from './utils';
import type {
  User, Registry, Product, CatalogProduct,
  AffiliateConfig, Notification, AnalyticsData, SyncedRegistry,
} from '@/types';

const STORAGE_KEYS = {
  users: 'gl_users',
  registries: 'gl_registries',
  products: 'gl_products',
  catalog: 'gl_catalog',
  affiliates: 'gl_affiliates',
  notifications: 'gl_notifications',
  currentUser: 'gl_currentUser',
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

const SEED_REGISTRIES: Registry[] = [
  {
    id: 'r1', ownerId: 'u1', ownerName: 'Sarah Mitchell',
    title: 'Sarah & David\'s Wedding', occasion: 'wedding',
    eventDate: '2026-10-15', description: 'We are so excited to celebrate our special day with you! Thank you for your generous gifts.',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=600&fit=crop',
    slug: 'sarah-davids-wedding', isPublic: true,
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
    slug: 'baby-riveras-nursery', isPublic: true,
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
    slug: 'emilys-30th-birthday', isPublic: true,
    syncedRegistries: [],
    createdAt: '2026-07-01T09:00:00Z', expiresAt: '2029-07-01T09:00:00Z',
  },
  {
    id: 'r4', ownerId: 'u1', ownerName: 'Sarah Mitchell',
    title: 'New Home Essentials', occasion: 'housewarming',
    eventDate: '2026-12-01', description: 'We just moved into our dream home and could use some finishing touches!',
    coverImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=600&fit=crop',
    slug: 'new-home-essentials', isPublic: true,
    syncedRegistries: [],
    createdAt: '2026-07-20T11:00:00Z', expiresAt: '2029-07-20T11:00:00Z',
  },
];

const SEED_PRODUCTS: Product[] = [
  // Wedding Registry (r1) products
  { id: 'p1', registryId: 'r1', title: 'KitchenAid Artisan Stand Mixer - Empire Red', price: 379.99, image: 'https://images.unsplash.com/photo-1594385208974-2f8bb07b4c68?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/kitchenaid-mixer', affiliateUrl: 'https://amazon.com/kitchenaid-mixer?tag=giftlist-20', category: 'Kitchen', priority: 'must-have', purchaseStatus: 'available', addedVia: 'catalog', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', createdAt: '2026-05-11T10:00:00Z' },
  { id: 'p2', registryId: 'r1', title: 'Le Creuset Dutch Oven 5.5 Qt - Marseille', price: 419.95, image: 'https://images.unsplash.com/photo-1585442245948-a4c31e5e2a46?w=400&h=400&fit=crop', store: 'Crate & Barrel', storeUrl: 'https://crateandbarrel.com/le-creuset', affiliateUrl: 'https://crateandbarrel.com/le-creuset?ref=giftlist', category: 'Kitchen', priority: 'must-have', purchaseStatus: 'purchased', purchasedBy: 'Aunt Martha', purchasedAt: '2026-07-20T14:30:00Z', purchaseMethod: 'affiliate', addedVia: 'registry-sync', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', createdAt: '2026-05-12T10:00:00Z' },
  { id: 'p3', registryId: 'r1', title: 'Dyson V15 Detect Cordless Vacuum', price: 749.99, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/dyson-v15', affiliateUrl: 'https://amazon.com/dyson-v15?tag=giftlist-20', category: 'Home', priority: 'nice-to-have', purchaseStatus: 'available', addedVia: 'url-import', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', createdAt: '2026-05-13T10:00:00Z' },
  { id: 'p4', registryId: 'r1', title: 'Brooklinen Luxe Core Sheet Set - King', price: 178.00, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop', store: 'Brooklinen', storeUrl: 'https://brooklinen.com/sheets-king', affiliateUrl: 'https://brooklinen.com/sheets-king?ref=giftlist', category: 'Bedroom', priority: 'must-have', purchaseStatus: 'purchased', purchasedBy: 'Cousin Rachel', purchasedAt: '2026-07-18T09:00:00Z', purchaseMethod: 'manual', addedVia: 'url-import', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', createdAt: '2026-05-14T10:00:00Z' },
  { id: 'p5', registryId: 'r1', title: 'Nespresso Vertuo Next Coffee Machine', price: 159.00, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=400&fit=crop', store: 'Williams Sonoma', storeUrl: 'https://williams-sonoma.com/nespresso', affiliateUrl: 'https://williams-sonoma.com/nespresso?ref=giftlist', category: 'Kitchen', priority: 'nice-to-have', purchaseStatus: 'reserved', addedVia: 'registry-sync', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', createdAt: '2026-05-15T10:00:00Z' },
  { id: 'p6', registryId: 'r1', title: 'Waterford Crystal Lismore Wine Glasses Set of 6', price: 295.00, image: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/waterford-glasses', affiliateUrl: 'https://amazon.com/waterford-glasses?tag=giftlist-20', category: 'Dining', priority: 'dream', purchaseStatus: 'available', addedVia: 'catalog', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', createdAt: '2026-05-16T10:00:00Z' },
  { id: 'p7', registryId: 'r1', title: 'All-Clad D5 Stainless Steel 10-Piece Cookware Set', price: 899.99, image: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&h=400&fit=crop', store: 'Williams Sonoma', storeUrl: 'https://williams-sonoma.com/all-clad', affiliateUrl: 'https://williams-sonoma.com/all-clad?ref=giftlist', category: 'Kitchen', priority: 'dream', purchaseStatus: 'available', addedVia: 'manual', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', createdAt: '2026-05-17T10:00:00Z' },
  { id: 'p8', registryId: 'r1', title: 'Casper Original Hybrid Mattress - Queen', price: 1295.00, originalPrice: 1495.00, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop', store: 'Casper', storeUrl: 'https://casper.com/mattress-queen', affiliateUrl: 'https://casper.com/mattress-queen?ref=giftlist', category: 'Bedroom', priority: 'dream', purchaseStatus: 'available', addedVia: 'url-import', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', createdAt: '2026-05-18T10:00:00Z' },

  // Baby Shower (r2) products
  { id: 'p9', registryId: 'r2', title: 'UPPAbaby Vista V3 Stroller - Greyson', price: 1099.99, image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/uppababy-vista', affiliateUrl: 'https://amazon.com/uppababy-vista?tag=giftlist-20', category: 'Gear', priority: 'must-have', purchaseStatus: 'purchased', purchasedBy: 'Grandma Rivera', purchasedAt: '2026-07-15T16:00:00Z', purchaseMethod: 'affiliate', addedVia: 'catalog', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', createdAt: '2026-06-16T10:00:00Z' },
  { id: 'p10', registryId: 'r2', title: 'Hatch Rest+ Sound Machine & Night Light', price: 69.99, image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/hatch-rest', affiliateUrl: 'https://amazon.com/hatch-rest?tag=giftlist-20', category: 'Nursery', priority: 'must-have', purchaseStatus: 'available', addedVia: 'catalog', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', createdAt: '2026-06-17T10:00:00Z' },
  { id: 'p11', registryId: 'r2', title: 'Babyletto Hudson 3-in-1 Convertible Crib', price: 399.00, image: 'https://images.unsplash.com/photo-1586105449897-20b5efeb3233?w=400&h=400&fit=crop', store: 'BuyBuy Baby', storeUrl: 'https://buybuybaby.com/babyletto-crib', affiliateUrl: 'https://buybuybaby.com/babyletto-crib?ref=giftlist', category: 'Nursery', priority: 'must-have', purchaseStatus: 'available', addedVia: 'registry-sync', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', createdAt: '2026-06-18T10:00:00Z' },
  { id: 'p12', registryId: 'r2', title: 'Ergobaby Omni Dream Baby Carrier', price: 189.00, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/ergobaby-carrier', affiliateUrl: 'https://amazon.com/ergobaby-carrier?tag=giftlist-20', category: 'Gear', priority: 'nice-to-have', purchaseStatus: 'available', addedVia: 'url-import', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', createdAt: '2026-06-19T10:00:00Z' },
  { id: 'p13', registryId: 'r2', title: 'Skip Hop Activity Center - Silver Lining Cloud', price: 109.99, image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/skiphop-activity', affiliateUrl: 'https://amazon.com/skiphop-activity?tag=giftlist-20', category: 'Toys', priority: 'nice-to-have', purchaseStatus: 'purchased', purchasedBy: 'Uncle Mike', purchasedAt: '2026-07-22T11:00:00Z', purchaseMethod: 'token', addedVia: 'catalog', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', createdAt: '2026-06-20T10:00:00Z' },

  // Birthday (r3) products
  { id: 'p14', registryId: 'r3', title: 'Sony WH-1000XM5 Wireless Headphones', price: 348.00, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/sony-xm5', affiliateUrl: 'https://amazon.com/sony-xm5?tag=giftlist-20', category: 'Electronics', priority: 'must-have', purchaseStatus: 'available', addedVia: 'catalog', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', createdAt: '2026-07-02T10:00:00Z' },
  { id: 'p15', registryId: 'r3', title: 'Kindle Paperwhite Signature Edition', price: 189.99, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/kindle-paperwhite', affiliateUrl: 'https://amazon.com/kindle-paperwhite?tag=giftlist-20', category: 'Electronics', priority: 'nice-to-have', purchaseStatus: 'available', addedVia: 'catalog', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', createdAt: '2026-07-03T10:00:00Z' },
  { id: 'p16', registryId: 'r3', title: 'Theragun Elite Massage Gun', price: 399.00, image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/theragun-elite', affiliateUrl: 'https://amazon.com/theragun-elite?tag=giftlist-20', category: 'Wellness', priority: 'dream', purchaseStatus: 'available', addedVia: 'url-import', inStock: false, lastPriceCheck: '2026-07-27T06:00:00Z', createdAt: '2026-07-04T10:00:00Z' },
  { id: 'p17', registryId: 'r3', title: 'Lululemon Yoga Mat - 5mm', price: 88.00, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop', store: 'Lululemon', storeUrl: 'https://lululemon.com/yoga-mat', affiliateUrl: 'https://lululemon.com/yoga-mat?ref=giftlist', category: 'Fitness', priority: 'nice-to-have', purchaseStatus: 'available', addedVia: 'url-import', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', createdAt: '2026-07-05T10:00:00Z' },

  // Housewarming (r4) products
  { id: 'p18', registryId: 'r4', title: 'Philips Hue Starter Kit - White & Color Ambiance', price: 199.99, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/philips-hue', affiliateUrl: 'https://amazon.com/philips-hue?tag=giftlist-20', category: 'Smart Home', priority: 'must-have', purchaseStatus: 'available', addedVia: 'catalog', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', createdAt: '2026-07-21T10:00:00Z' },
  { id: 'p19', registryId: 'r4', title: 'Sonos One SL Speaker - White', price: 219.00, image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/sonos-one', affiliateUrl: 'https://amazon.com/sonos-one?tag=giftlist-20', category: 'Electronics', priority: 'nice-to-have', purchaseStatus: 'available', addedVia: 'url-import', inStock: true, lastPriceCheck: '2026-07-27T06:00:00Z', createdAt: '2026-07-22T10:00:00Z' },
];

const SEED_CATALOG: CatalogProduct[] = [
  { id: 'c1', title: 'KitchenAid Artisan Stand Mixer', price: 379.99, image: 'https://images.unsplash.com/photo-1594385208974-2f8bb07b4c68?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/kitchenaid-mixer', category: 'Kitchen', rating: 4.8, reviewCount: 12840 },
  { id: 'c2', title: 'Instant Pot Duo Plus 6-Quart', price: 89.95, image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/instant-pot', category: 'Kitchen', rating: 4.7, reviewCount: 98420 },
  { id: 'c3', title: 'Dyson V15 Detect Cordless Vacuum', price: 749.99, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/dyson-v15', category: 'Home', rating: 4.6, reviewCount: 5670 },
  { id: 'c4', title: 'Sony WH-1000XM5 Headphones', price: 348.00, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/sony-xm5', category: 'Electronics', rating: 4.7, reviewCount: 23100 },
  { id: 'c5', title: 'Apple AirPods Pro (2nd Gen)', price: 249.00, image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/airpods-pro', category: 'Electronics', rating: 4.7, reviewCount: 67200 },
  { id: 'c6', title: 'Ninja Foodi 6-in-1 Air Fryer', price: 119.99, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/ninja-air-fryer', category: 'Kitchen', rating: 4.8, reviewCount: 34500 },
  { id: 'c7', title: 'UPPAbaby Vista V3 Stroller', price: 1099.99, image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/uppababy-vista', category: 'Baby Gear', rating: 4.8, reviewCount: 2340 },
  { id: 'c8', title: 'Nespresso Vertuo Next Coffee Machine', price: 159.00, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/nespresso-vertuo', category: 'Kitchen', rating: 4.5, reviewCount: 18900 },
  { id: 'c9', title: 'Kindle Paperwhite Signature Edition', price: 189.99, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/kindle-paperwhite', category: 'Electronics', rating: 4.6, reviewCount: 45600 },
  { id: 'c10', title: 'Vitamix E310 Explorian Blender', price: 349.95, image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/vitamix-e310', category: 'Kitchen', rating: 4.7, reviewCount: 8900 },
  { id: 'c11', title: 'Philips Hue Starter Kit', price: 199.99, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/philips-hue', category: 'Smart Home', rating: 4.5, reviewCount: 12300 },
  { id: 'c12', title: 'iRobot Roomba j7+ Self-Emptying Robot Vacuum', price: 599.00, image: 'https://images.unsplash.com/photo-1603618090554-10b5e3e2ddab?w=400&h=400&fit=crop', store: 'Amazon', storeUrl: 'https://amazon.com/roomba-j7', category: 'Home', rating: 4.4, reviewCount: 7800 },
];

const SEED_AFFILIATES: AffiliateConfig[] = [
  { id: 'a1', store: 'Amazon', affiliateId: 'giftlist-20', affiliateNetwork: 'Amazon Associates', urlPattern: 'amazon.com', isActive: true, totalClicks: 1247, totalRevenue: 3420.50 },
  { id: 'a2', store: 'Crate & Barrel', affiliateId: 'giftlist-cb', affiliateNetwork: 'CJ Affiliate', urlPattern: 'crateandbarrel.com', isActive: true, totalClicks: 342, totalRevenue: 890.25 },
  { id: 'a3', store: 'Williams Sonoma', affiliateId: 'giftlist-ws', affiliateNetwork: 'CJ Affiliate', urlPattern: 'williams-sonoma.com', isActive: true, totalClicks: 189, totalRevenue: 567.80 },
  { id: 'a4', store: 'Target', affiliateId: 'giftlist-tgt', affiliateNetwork: 'Impact', urlPattern: 'target.com', isActive: true, totalClicks: 456, totalRevenue: 1230.40 },
  { id: 'a5', store: 'Brooklinen', affiliateId: 'giftlist-bl', affiliateNetwork: 'ShareASale', urlPattern: 'brooklinen.com', isActive: true, totalClicks: 98, totalRevenue: 245.60 },
  { id: 'a6', store: 'BuyBuy Baby', affiliateId: 'giftlist-bbb', affiliateNetwork: 'CJ Affiliate', urlPattern: 'buybuybaby.com', isActive: false, totalClicks: 67, totalRevenue: 178.90 },
  { id: 'a7', store: 'Lululemon', affiliateId: 'giftlist-ll', affiliateNetwork: 'Rakuten', urlPattern: 'lululemon.com', isActive: true, totalClicks: 134, totalRevenue: 412.30 },
  { id: 'a8', store: 'Casper', affiliateId: 'giftlist-cas', affiliateNetwork: 'Impact', urlPattern: 'casper.com', isActive: true, totalClicks: 56, totalRevenue: 890.00 },
];

const SEED_NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 'u1', type: 'gift-purchased', title: 'Gift Purchased!', message: 'Aunt Martha purchased Le Creuset Dutch Oven from your wedding registry.', read: false, createdAt: '2026-07-20T14:30:00Z', data: { productId: 'p2', registryId: 'r1' } },
  { id: 'n2', userId: 'u1', type: 'gift-purchased', title: 'Gift Purchased!', message: 'Cousin Rachel purchased Brooklinen Luxe Core Sheet Set.', read: true, createdAt: '2026-07-18T09:00:00Z', data: { productId: 'p4', registryId: 'r1' } },
  { id: 'n3', userId: 'u3', type: 'gift-purchased', title: 'Gift Purchased!', message: 'Grandma Rivera purchased UPPAbaby Vista V3 Stroller.', read: false, createdAt: '2026-07-15T16:00:00Z', data: { productId: 'p9', registryId: 'r2' } },
  { id: 'n4', userId: 'u4', type: 'out-of-stock', title: 'Item Out of Stock', message: 'Theragun Elite Massage Gun is currently out of stock.', read: false, createdAt: '2026-07-25T08:00:00Z', data: { productId: 'p16', registryId: 'r3' } },
  { id: 'n5', userId: 'u1', type: 'sync-complete', title: 'Registry Synced', message: 'Your Crate & Barrel registry has been synced. 8 items found.', read: true, createdAt: '2026-07-27T08:05:00Z', data: { registryId: 'r1' } },
  { id: 'n6', userId: 'u3', type: 'gift-purchased', title: 'Gift Purchased!', message: 'Uncle Mike purchased Skip Hop Activity Center.', read: false, createdAt: '2026-07-22T11:00:00Z', data: { productId: 'p13', registryId: 'r2' } },
];

// ─── Init ────────────────────────────────────────────────────────

function initSeedData() {
  if (!localStorage.getItem('gl_seeded')) {
    write(STORAGE_KEYS.users, SEED_USERS);
    write(STORAGE_KEYS.registries, SEED_REGISTRIES);
    write(STORAGE_KEYS.products, SEED_PRODUCTS);
    write(STORAGE_KEYS.catalog, SEED_CATALOG);
    write(STORAGE_KEYS.affiliates, SEED_AFFILIATES);
    write(STORAGE_KEYS.notifications, SEED_NOTIFICATIONS);
    localStorage.setItem('gl_seeded', 'true');
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
  return registry;
}

export async function createRegistry(data: Omit<Registry, 'id' | 'slug' | 'createdAt' | 'expiresAt' | 'syncedRegistries'>): Promise<Registry> {
  await delay();
  const registries = read<Registry>(STORAGE_KEYS.registries);
  const registry: Registry = {
    ...data,
    id: generateId(),
    slug: slugify(data.title),
    syncedRegistries: [],
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 36 * 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  registries.push(registry);
  write(STORAGE_KEYS.registries, registries);
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
  registries = registries.filter((r) => r.id !== id);
  write(STORAGE_KEYS.registries, registries);
  let products = read<Product>(STORAGE_KEYS.products);
  products = products.filter((p) => p.registryId !== id);
  write(STORAGE_KEYS.products, products);
}

export async function addSyncedRegistry(registryId: string, platform: string, url: string): Promise<SyncedRegistry> {
  await delay();
  const registries = read<Registry>(STORAGE_KEYS.registries);
  const idx = registries.findIndex((r) => r.id === registryId);
  if (idx === -1) throw new Error('Registry not found');
  const synced: SyncedRegistry = {
    id: generateId(),
    platform,
    url,
    lastSynced: new Date().toISOString(),
    status: 'pending',
    itemCount: 0,
  };
  registries[idx].syncedRegistries.push(synced);
  write(STORAGE_KEYS.registries, registries);
  // Simulate syncing after a delay
  setTimeout(() => {
    const regs = read<Registry>(STORAGE_KEYS.registries);
    const ri = regs.findIndex((r) => r.id === registryId);
    if (ri !== -1) {
      const si = regs[ri].syncedRegistries.findIndex((s) => s.id === synced.id);
      if (si !== -1) {
        regs[ri].syncedRegistries[si].status = 'active';
        regs[ri].syncedRegistries[si].itemCount = Math.floor(Math.random() * 10) + 3;
        regs[ri].syncedRegistries[si].lastSynced = new Date().toISOString();
        write(STORAGE_KEYS.registries, regs);
      }
    }
  }, 3000);
  return synced;
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

export async function addProduct(data: Omit<Product, 'id' | 'createdAt' | 'lastPriceCheck'>): Promise<Product> {
  await delay();
  const products = read<Product>(STORAGE_KEYS.products);
  const product: Product = {
    ...data,
    id: generateId(),
    lastPriceCheck: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  products.push(product);
  write(STORAGE_KEYS.products, products);
  return product;
}

export async function addProductFromUrl(registryId: string, url: string): Promise<Product> {
  await delay(800);
  // Simulate URL scraping
  const stores = ['Amazon', 'Target', 'Walmart', 'Crate & Barrel'];
  const store = stores.find((s) => url.toLowerCase().includes(s.toLowerCase().replace(/[& ]/g, ''))) || 'Unknown Store';
  const product: Product = {
    id: generateId(),
    registryId,
    title: `Imported Product from ${store}`,
    price: Math.floor(Math.random() * 200) + 29.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    store,
    storeUrl: url,
    affiliateUrl: url + (url.includes('?') ? '&' : '?') + 'ref=giftlist',
    category: 'General',
    priority: 'nice-to-have',
    purchaseStatus: 'available',
    addedVia: 'url-import',
    inStock: true,
    lastPriceCheck: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  const products = read<Product>(STORAGE_KEYS.products);
  products.push(product);
  write(STORAGE_KEYS.products, products);
  return product;
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

export async function markAsPurchased(productId: string, buyerName: string): Promise<Product> {
  await delay();
  const products = read<Product>(STORAGE_KEYS.products);
  const idx = products.findIndex((p) => p.id === productId);
  if (idx === -1) throw new Error('Product not found');
  products[idx] = {
    ...products[idx],
    purchaseStatus: 'purchased',
    purchasedBy: buyerName,
    purchasedAt: new Date().toISOString(),
    purchaseMethod: 'manual',
  };
  write(STORAGE_KEYS.products, products);

  // Create notification for registry owner
  const registries = read<Registry>(STORAGE_KEYS.registries);
  const registry = registries.find((r) => r.id === products[idx].registryId);
  if (registry) {
    const notifications = read<Notification>(STORAGE_KEYS.notifications);
    notifications.unshift({
      id: generateId(),
      userId: registry.ownerId,
      type: 'gift-purchased',
      title: 'Gift Purchased!',
      message: `${buyerName} purchased ${products[idx].title}.`,
      read: false,
      createdAt: new Date().toISOString(),
      data: { productId, registryId: registry.id },
    });
    write(STORAGE_KEYS.notifications, notifications);
  }

  return products[idx];
}

export async function deleteProduct(id: string): Promise<void> {
  await delay();
  let products = read<Product>(STORAGE_KEYS.products);
  products = products.filter((p) => p.id !== id);
  write(STORAGE_KEYS.products, products);
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

  const affiliates = read<AffiliateConfig>(STORAGE_KEYS.affiliates);
  const affiliate = affiliates.find((a) => item.storeUrl.includes(a.urlPattern) && a.isActive);
  const affiliateUrl = affiliate
    ? `${item.storeUrl}?tag=${affiliate.affiliateId}`
    : item.storeUrl;

  const product: Product = {
    id: generateId(),
    registryId,
    title: item.title,
    price: item.price,
    image: item.image,
    store: item.store,
    storeUrl: item.storeUrl,
    affiliateUrl,
    category: item.category,
    priority: 'nice-to-have',
    purchaseStatus: 'available',
    addedVia: 'catalog',
    inStock: true,
    lastPriceCheck: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  const products = read<Product>(STORAGE_KEYS.products);
  products.push(product);
  write(STORAGE_KEYS.products, products);
  return product;
}

// ─── Affiliates ──────────────────────────────────────────────────

export async function getAffiliates(): Promise<AffiliateConfig[]> {
  await delay();
  return read<AffiliateConfig>(STORAGE_KEYS.affiliates);
}

export async function createAffiliate(data: Omit<AffiliateConfig, 'id' | 'totalClicks' | 'totalRevenue'>): Promise<AffiliateConfig> {
  await delay();
  const affiliates = read<AffiliateConfig>(STORAGE_KEYS.affiliates);
  const affiliate: AffiliateConfig = { ...data, id: generateId(), totalClicks: 0, totalRevenue: 0 };
  affiliates.push(affiliate);
  write(STORAGE_KEYS.affiliates, affiliates);
  return affiliate;
}

export async function updateAffiliate(id: string, data: Partial<AffiliateConfig>): Promise<AffiliateConfig> {
  await delay();
  const affiliates = read<AffiliateConfig>(STORAGE_KEYS.affiliates);
  const idx = affiliates.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error('Affiliate not found');
  affiliates[idx] = { ...affiliates[idx], ...data };
  write(STORAGE_KEYS.affiliates, affiliates);
  return affiliates[idx];
}

export async function deleteAffiliate(id: string): Promise<void> {
  await delay();
  let affiliates = read<AffiliateConfig>(STORAGE_KEYS.affiliates);
  affiliates = affiliates.filter((a) => a.id !== id);
  write(STORAGE_KEYS.affiliates, affiliates);
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

// ─── Analytics (Admin) ───────────────────────────────────────────

export async function getAnalytics(): Promise<AnalyticsData> {
  await delay();
  const registries = read<Registry>(STORAGE_KEYS.registries);
  const products = read<Product>(STORAGE_KEYS.products);
  const affiliates = read<AffiliateConfig>(STORAGE_KEYS.affiliates);

  const totalClicks = affiliates.reduce((s, a) => s + a.totalClicks, 0);
  const totalPurchases = products.filter((p) => p.purchaseStatus === 'purchased').length;

  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  return {
    registriesCreated: registries.length,
    totalProducts: products.length,
    totalClicks,
    totalPurchases,
    registriesByDate: dates.map((date) => ({ date, count: Math.floor(Math.random() * 5) + 1 })),
    clicksByDate: dates.map((date) => ({ date, count: Math.floor(Math.random() * 50) + 10 })),
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
  };
}

// ─── Admin Users ─────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  await delay();
  return read<User>(STORAGE_KEYS.users);
}
