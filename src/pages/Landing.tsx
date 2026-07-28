import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Gift, Link2, ShoppingBag, BarChart3, Globe, Shield, Zap, Bell,
  ArrowRight, Star, ChevronLeft, ChevronRight, Check, Sparkles,
  Store, ScanSearch, Users, Heart, MousePointerClick, Package,
  Layers, RefreshCw, Eye, Clock, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Hero ────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-purple-50">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-warm-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-6 bg-primary-100 text-primary-700 px-4 py-1.5 text-sm border-primary-200">
                <Sparkles size={14} className="mr-1.5" />
                The Universal Gift Registry
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-slate-900 leading-[1.1]"
            >
              One Registry.{' '}
              <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">Every Store.</span>{' '}
              Zero Hassle.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl"
            >
              Paste any product URL, sync your existing registries, or browse our curated catalog.
              Your guests see everything in one beautifully organized page - no account needed to buy.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link to="/register">
                <Button size="lg" className="text-base px-8 gap-2 shadow-lg shadow-primary-200 h-13">
                  Create Your Free Registry <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/registry/sarah-davids-wedding">
                <Button variant="outline" size="lg" className="text-base px-8 h-13">
                  View Demo Registry
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500"
            >
              <span className="flex items-center gap-1.5"><Check size={16} className="text-accent-500" /> Free forever</span>
              <span className="flex items-center gap-1.5"><Check size={16} className="text-accent-500" /> Works with any store</span>
              <span className="flex items-center gap-1.5"><Check size={16} className="text-accent-500" /> No guest accounts needed</span>
            </motion.div>
          </div>

          {/* Right: Visual showcase */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            {/* Main registry preview card */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 bg-white">
                <div className="relative h-44">
                  <img
                    src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=400&fit=crop&q=80"
                    alt="Wedding celebration"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <p className="text-white font-display font-bold text-lg">Sarah & David's Wedding</p>
                    <p className="text-white/70 text-xs">October 15, 2026 - 8 gifts, 3 purchased</p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { name: 'KitchenAid Stand Mixer', price: '$379.99', store: 'Amazon', status: 'available', img: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=100&h=100&fit=crop&q=80' },
                    { name: 'Le Creuset Dutch Oven', price: '$419.95', store: 'Crate & Barrel', status: 'purchased', img: 'https://images.unsplash.com/photo-1585442245948-a4c31e5e2a46?w=100&h=100&fit=crop&q=80' },
                    { name: 'Brooklinen Sheet Set', price: '$178.00', store: 'Brooklinen', status: 'available', img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100&h=100&fit=crop&q=80' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <img src={item.img} alt={item.name} className="w-11 h-11 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.store} - {item.price}</p>
                      </div>
                      {item.status === 'purchased' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Purchased</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Available</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating notification card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -bottom-6 -left-8 bg-white rounded-xl shadow-xl border border-slate-100 p-3 flex items-center gap-3 w-72"
              >
                <div className="h-9 w-9 rounded-full bg-accent-100 flex items-center justify-center shrink-0">
                  <Gift size={18} className="text-accent-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-800">Aunt Martha purchased a gift!</p>
                  <p className="text-[10px] text-slate-400">Le Creuset Dutch Oven - just now</p>
                </div>
              </motion.div>

              {/* Floating stats */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl border border-slate-100 p-3 text-center"
              >
                <p className="text-2xl font-bold text-primary-600">12,847</p>
                <p className="text-[10px] text-slate-500">Gifts this month</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
      >
        <span className="text-xs text-slate-400">Scroll to explore</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <ChevronDown size={20} className="text-slate-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Trusted Stores ──────────────────────────────────────────────
function TrustedStores() {
  const stores = [
    { name: 'Amazon', logo: 'A' },
    { name: 'Crate & Barrel', logo: 'C&B' },
    { name: 'Williams Sonoma', logo: 'WS' },
    { name: 'Target', logo: 'T' },
    { name: 'Brooklinen', logo: 'B' },
    { name: 'The Knot', logo: 'TK' },
    { name: 'Pottery Barn', logo: 'PB' },
    { name: 'West Elm', logo: 'WE' },
  ];

  return (
    <section className="py-14 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-slate-400 font-medium mb-8 uppercase tracking-wider">Works with gifts from every online store</p>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {stores.map((store) => (
            <div key={store.name} className="flex items-center gap-2 group cursor-default">
              <div className="h-8 w-8 rounded-lg bg-slate-100 group-hover:bg-primary-100 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:text-primary-600 transition-colors">
                {store.logo}
              </div>
              <span className="text-slate-500 group-hover:text-slate-700 font-medium text-sm transition-colors hidden sm:block">{store.name}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-medium">
            + 500 more stores
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { icon: Gift, title: 'Create Your Registry', desc: 'Set up your registry in seconds. Name your event, pick the occasion, and add a personal message for your guests.', color: 'bg-primary-100 text-primary-600', gradient: 'from-primary-500 to-primary-600' },
    { icon: Store, title: 'Add Gifts Your Way', desc: 'Three powerful ways: paste any product URL, browse our curated catalog, or sync registries from Amazon, Crate & Barrel, and more.', color: 'bg-blue-100 text-blue-600', gradient: 'from-blue-500 to-blue-600' },
    { icon: Link2, title: 'Share Your Link', desc: 'Send your unique registry link to friends and family. They can browse and shop without creating an account.', color: 'bg-purple-100 text-purple-600', gradient: 'from-purple-500 to-purple-600' },
    { icon: ShoppingBag, title: 'Guests Buy & You Track', desc: 'Gift givers click through to purchase at the original store. Our 3-layer tracking system shows what\'s been bought in real time.', color: 'bg-accent-100 text-accent-600', gradient: 'from-accent-500 to-accent-600' },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5">Simple Process</Badge>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900">How It Works</h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">Four simple steps to create the perfect gift registry that your guests will love.</p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-slate-200" />

          {steps.map((step, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                className="relative text-center group"
              >
                <div className="flex justify-center mb-6 relative z-10">
                  <div className={`h-16 w-16 rounded-2xl ${step.color} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                    <step.icon size={28} />
                  </div>
                </div>
                <div className={`absolute top-5 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-gradient-to-br ${step.gradient} text-white text-xs font-bold flex items-center justify-center z-20 shadow-md`}>
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 font-display">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Showcase ────────────────────────────────────────────────────
function Showcase() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5">See It In Action</Badge>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900">Three Ways to Add Gifts</h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            No matter where you find the perfect gift, we make it easy to add it to your registry.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Method 1: URL Import */}
          <AnimatedSection delay={0}>
            <motion.div whileHover={{ y: -6 }}>
              <Card className="overflow-hidden h-full">
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4"><Globe size={60} /></div>
                    <div className="absolute bottom-4 left-4"><Link2 size={40} /></div>
                  </div>
                  <div className="relative bg-white rounded-xl p-4 shadow-lg w-[85%]">
                    <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                      <div className="h-2 w-2 rounded-full bg-red-400" />
                      <div className="h-2 w-2 rounded-full bg-yellow-400" />
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                      <span className="flex-1 text-center">Paste URL</span>
                    </div>
                    <div className="bg-slate-100 rounded-lg px-3 py-2 text-xs text-slate-500 truncate">
                      https://amazon.com/dp/B0CXYZ123...
                    </div>
                    <div className="mt-2 flex justify-end">
                      <div className="bg-blue-500 text-white text-xs px-3 py-1 rounded-md">Import</div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-display font-semibold text-slate-900 mb-2">Paste Any URL</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Copy a product link from any online store. We automatically extract the image, title, and price using our multi-layer scraping engine.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">OpenGraph Extraction</Badge>
                    <Badge variant="outline" className="text-xs">Headless Browser</Badge>
                    <Badge variant="outline" className="text-xs">Store Parsers</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatedSection>

          {/* Method 2: Catalog */}
          <AnimatedSection delay={0.1}>
            <motion.div whileHover={{ y: -6 }}>
              <Card className="overflow-hidden h-full">
                <div className="relative h-48 bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 left-4"><Package size={60} /></div>
                    <div className="absolute bottom-4 right-4"><Star size={40} /></div>
                  </div>
                  <div className="relative grid grid-cols-3 gap-2 w-[85%]">
                    {[
                      { img: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=100&h=100&fit=crop&q=80', p: '$379' },
                      { img: 'https://images.unsplash.com/photo-1585442245948-a4c31e5e2a46?w=100&h=100&fit=crop&q=80', p: '$419' },
                      { img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100&h=100&fit=crop&q=80', p: '$178' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white rounded-lg p-1.5 shadow-md">
                        <img src={item.img} alt="" className="w-full aspect-square rounded object-cover" />
                        <p className="text-[10px] font-bold text-slate-700 text-center mt-1">{item.p}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-display font-semibold text-slate-900 mb-2">Browse Our Catalog</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Choose from our curated collection of top-rated products across every category. Updated daily with the most popular gift items from Amazon and beyond.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">Top 100 Products</Badge>
                    <Badge variant="outline" className="text-xs">Daily Updates</Badge>
                    <Badge variant="outline" className="text-xs">Ratings & Reviews</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatedSection>

          {/* Method 3: Sync */}
          <AnimatedSection delay={0.2}>
            <motion.div whileHover={{ y: -6 }}>
              <Card className="overflow-hidden h-full">
                <div className="relative h-48 bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4"><RefreshCw size={60} /></div>
                    <div className="absolute bottom-4 left-4"><Layers size={40} /></div>
                  </div>
                  <div className="relative bg-white rounded-xl p-4 shadow-lg w-[85%]">
                    <p className="text-xs font-medium text-slate-700 mb-2">Synced Registries</p>
                    {['Amazon', 'Crate & Barrel', 'The Knot'].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-0">
                        <div className="h-5 w-5 rounded bg-green-100 flex items-center justify-center">
                          <Check size={10} className="text-green-600" />
                        </div>
                        <span className="text-xs text-slate-600">{s}</span>
                        <span className="text-[10px] text-slate-400 ml-auto">Synced</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-display font-semibold text-slate-900 mb-2">Sync Existing Registries</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Already have registries on other sites? Paste the link and we'll crawl them daily, pulling all products into your unified GiftList registry.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">Auto-Sync Daily</Badge>
                    <Badge variant="outline" className="text-xs">Multi-Platform</Badge>
                    <Badge variant="outline" className="text-xs">Affiliate Links</Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

// ─── Features ────────────────────────────────────────────────────
function Features() {
  const features = [
    { icon: Globe, title: 'Universal Compatibility', desc: 'Add products from absolutely any online store. Paste a URL and we extract the product details automatically using our multi-layer scraping engine.', color: 'bg-blue-100 text-blue-600' },
    { icon: ScanSearch, title: 'Registry Syncing', desc: 'Already have registries on Amazon, The Knot, or Crate & Barrel? We crawl and sync them daily into your centralized GiftList page.', color: 'bg-purple-100 text-purple-600' },
    { icon: Layers, title: '3-Layer Gift Tracking', desc: 'Affiliate network reporting, token-based confirmation, and manual marking work together so you always know what\'s been bought.', color: 'bg-accent-100 text-accent-600' },
    { icon: Bell, title: 'Smart Notifications', desc: 'Get notified instantly when someone buys a gift, when items go out of stock, or when your registry is about to expire.', color: 'bg-warm-100 text-warm-600' },
    { icon: Shield, title: 'Price & Stock Monitoring', desc: 'Nightly cron jobs check every product in your registry for price changes and availability so you\'re never caught off guard.', color: 'bg-red-100 text-red-500' },
    { icon: Zap, title: 'Zero-Friction Guest Experience', desc: 'Gift givers never need an account. They browse your registry, click through to buy at the retailer, and optionally confirm the purchase.', color: 'bg-teal-100 text-teal-600' },
    { icon: MousePointerClick, title: 'Affiliate Engine', desc: 'Built-in affiliate link management recognizes the store in any URL and automatically applies the right affiliate ID for tracking and revenue.', color: 'bg-indigo-100 text-indigo-600' },
    { icon: Eye, title: 'Beautiful Public Pages', desc: 'Your guests see a polished, mobile-friendly registry page with filters, sorting, and a progress bar showing how many gifts are fulfilled.', color: 'bg-pink-100 text-pink-600' },
    { icon: Clock, title: 'Auto-Cleanup & Expiry', desc: 'Registries auto-expire after 36 months with advance notifications. Admins can manage lifecycle and cleanup from the dashboard.', color: 'bg-slate-100 text-slate-600' },
  ];

  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5">Features</Badge>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900">Everything You Need</h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">Powerful features that make gift-giving effortless for everyone involved.</p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <AnimatedSection key={i} delay={i * 0.05}>
              <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Card className="p-6 h-full hover:shadow-lg transition-all border-slate-200/80 group">
                  <div className={`h-12 w-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 font-display">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </Card>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials Carousel ───────────────────────────────────────
function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);

  const testimonials = [
    { name: 'Jessica & Tom Williams', occasion: 'Wedding Registry', text: 'GiftList was a game-changer for our wedding registry. We had items from five different stores and our guests could see everything in one place. So many people commented on how easy it was to find and buy gifts!', rating: 5 },
    { name: 'Priya Patel', occasion: 'Baby Shower', text: 'I loved being able to sync my Amazon and BuyBuy Baby registries instead of starting from scratch. The gift tracking was incredibly accurate and saved me from so many duplicate gifts. Highly recommend!', rating: 5 },
    { name: 'Marcus & Olivia Rivera', occasion: 'Housewarming', text: 'Setting up our housewarming registry took literally 10 minutes. We just pasted URLs from the stores we liked and GiftList pulled in all the product details automatically. The design looked premium.', rating: 5 },
    { name: 'Hannah Davis', occasion: 'Birthday Wishlist', text: 'My friends loved the simplicity. No accounts needed, no app downloads. Just click the link, browse, and buy. I got exactly what I wanted for my 30th! The progress bar was a nice touch too.', rating: 5 },
    { name: 'Alex & Jordan Kim', occasion: 'Wedding Registry', text: 'The notification system is brilliant. Every time a gift was purchased, I got a little ping of excitement. It made the whole experience leading up to our wedding so much more fun and organized.', rating: 5 },
    { name: 'Nina Morales', occasion: 'Graduation', text: 'I was worried about asking for gifts for my graduation, but GiftList made it feel natural. The page looked so professional and my family really appreciated the organization. Would use again for any event!', rating: 5 },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5">Testimonials</Badge>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900">Loved by Gift Givers</h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">Thousands of happy registries and counting. Here's what people are saying.</p>
        </AnimatedSection>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                  <Card className="p-6 h-full flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} size={16} className="fill-warm-400 text-warm-400" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed flex-1 italic">"{t.text}"</p>
                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium text-sm">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.occasion}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-8">
            <button onClick={() => emblaApi?.scrollPrev()} className="h-10 w-10 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 hover:border-primary-300 transition-all cursor-pointer">
              <ChevronLeft size={18} className="text-slate-600" />
            </button>
            <button onClick={() => emblaApi?.scrollNext()} className="h-10 w-10 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 hover:border-primary-300 transition-all cursor-pointer">
              <ChevronRight size={18} className="text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats ───────────────────────────────────────────────────────
function Stats() {
  const stats = [
    { value: '25,000+', label: 'Registries Created', icon: Gift },
    { value: '180,000+', label: 'Gifts Tracked', icon: Package },
    { value: '500+', label: 'Stores Supported', icon: Store },
    { value: '99.2%', label: 'Satisfaction Rate', icon: Heart },
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-purple-700 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <AnimatedSection key={i} className="text-center" delay={i * 0.1}>
              <stat.icon size={28} className="text-primary-200 mx-auto mb-3" />
              <p className="text-4xl lg:text-5xl font-display font-bold text-white">{stat.value}</p>
              <p className="mt-2 text-primary-200 text-sm">{stat.label}</p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      desc: 'Perfect for birthdays and smaller events.',
      features: ['1 active registry', 'Up to 50 items', 'Basic gift tracking', 'Shareable link', 'URL product import', 'Mobile-friendly pages'],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Premium',
      price: '$9',
      period: '/month',
      desc: 'Great for weddings and baby showers.',
      features: ['Unlimited registries', 'Unlimited items', 'Advanced 3-layer tracking', 'Registry syncing', 'Price & stock monitoring', 'Priority notifications', 'Custom URL slug', 'Analytics dashboard'],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Family',
      price: '$19',
      period: '/month',
      desc: 'For families with multiple events.',
      features: ['Everything in Premium', 'Up to 5 family members', 'Shared dashboard', 'Advanced analytics', 'Dedicated support', 'API access', 'White-label option'],
      cta: 'Contact Us',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5">Pricing</Badge>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">Start for free and upgrade when you need more power. No hidden fees.</p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <motion.div whileHover={{ y: -6 }}>
                <Card className={`p-8 h-full flex flex-col transition-all ${plan.popular ? 'ring-2 ring-primary-500 shadow-xl relative scale-[1.02]' : 'hover:shadow-lg'}`}>
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-5 py-1 shadow-md border-0">Most Popular</Badge>
                    </div>
                  )}
                  <h3 className="text-lg font-display font-semibold text-slate-900">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500 text-sm">{plan.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{plan.desc}</p>
                  <ul className="mt-6 space-y-3 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-sm text-slate-600">
                        <Check size={16} className="text-accent-500 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="mt-8 block">
                    <Button className="w-full" variant={plan.popular ? 'default' : 'outline'} size="lg">{plan.cta}</Button>
                  </Link>
                </Card>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────
function FAQ() {
  const faqs = [
    { q: 'Can I add gifts from any store?', a: 'Absolutely! Just paste the product URL and we automatically extract the product image, title, and price. Our multi-layer import engine works with Amazon, Target, Walmart, Crate & Barrel, and literally any other online store worldwide.' },
    { q: 'Do my guests need to create an account?', a: 'No! Gift givers never need to create an account or download an app. They simply visit your registry link, browse your wishlist, click "Buy This Gift" to go to the retailer, and optionally confirm their purchase. That\'s it.' },
    { q: 'How do you track which gifts were purchased?', a: 'We use a three-layer tracking system for maximum accuracy: (1) automatic affiliate network reporting from the retailer, (2) token-based email confirmation sent to the buyer, and (3) manual "I bought this" marking directly on the registry page.' },
    { q: 'Can I sync registries from other websites?', a: 'Yes! If you already have registries on Amazon, Crate & Barrel, Williams Sonoma, The Knot, or other platforms, just paste the registry link. We\'ll crawl them daily and sync all products into your GiftList - with affiliate codes attached.' },
    { q: 'What happens if a product goes out of stock?', a: 'We run nightly checks on every product in every active registry. If something goes out of stock or has a significant price change, we immediately notify you via email so you can update your registry or find an alternative.' },
    { q: 'How long does my registry stay active?', a: 'Registries remain active for 36 months from creation. You\'ll receive email reminders before expiration so you can decide whether to extend or archive it. Admins can also manage registry lifecycle from the admin dashboard.' },
    { q: 'Is this really free?', a: 'The Free plan is genuinely free forever with 1 registry and up to 50 items. It includes gift tracking, shareable links, and URL importing. Premium plans add unlimited registries, registry syncing, price monitoring, and advanced analytics.' },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5">FAQ</Badge>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900">Common Questions</h2>
          <p className="mt-4 text-lg text-slate-500">Everything you need to know about GiftList.</p>
        </AnimatedSection>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <AnimatedSection key={i} delay={i * 0.05}>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-primary-200 transition-colors">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 cursor-pointer text-left"
                >
                  <span className="font-medium text-slate-900 pr-4">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openIndex === i ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0"
                  >
                    <ChevronRight size={18} className="text-slate-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AnimatedSection>
          <Gift size={48} className="text-primary-400 mx-auto mb-6" />
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
            Ready to Create Your <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">Perfect Registry</span>?
          </h2>
          <p className="mt-6 text-lg text-slate-400 max-w-xl mx-auto">
            Join thousands of happy couples, parents, and celebrants who trust GiftList for their special moments. Free forever.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="text-base px-8 gap-2 shadow-lg shadow-primary-900/50 h-13">
                Create Free Registry <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/registry/sarah-davids-wedding">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white text-base px-8 h-13">
                View Demo Registry
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">No credit card required. Set up in under 2 minutes.</p>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── Landing Page ────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <TrustedStores />
      <HowItWorks />
      <Showcase />
      <Features />
      <Testimonials />
      <Stats />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
