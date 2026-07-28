import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Gift, Link2, ShoppingBag, BarChart3, Globe, Shield, Zap, Bell,
  ArrowRight, Star, ChevronLeft, ChevronRight, Check, Sparkles,
  Store, ScanSearch, Users, Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Hero ────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1920&h=1080&fit=crop"
          alt="Gift boxes"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/70" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-0">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-6 bg-primary-50 text-primary-700 px-4 py-1.5 text-sm">
              <Sparkles size={14} className="mr-1.5" />
              The Universal Gift Registry
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-display font-bold text-slate-900 leading-tight"
          >
            One Registry.{' '}
            <span className="text-primary-600">Every Store.</span>{' '}
            Zero Hassle.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl"
          >
            Add gifts from any online store, sync registries you already have, or pick from our curated catalog.
            Your guests see everything in one beautiful page.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link to="/register">
              <Button size="lg" className="text-base px-8 gap-2 shadow-lg shadow-primary-200">
                Create Your Registry <ArrowRight size={18} />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="text-base px-8">
                See How It Works
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 flex items-center gap-6 text-sm text-slate-500"
          >
            <span className="flex items-center gap-1.5"><Check size={16} className="text-accent-500" /> Free forever</span>
            <span className="flex items-center gap-1.5"><Check size={16} className="text-accent-500" /> Any store</span>
            <span className="flex items-center gap-1.5"><Check size={16} className="text-accent-500" /> No app needed</span>
          </motion.div>
        </div>
      </div>

      {/* Floating stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="hidden lg:block absolute right-12 bottom-20"
      >
        <Card className="p-5 shadow-xl backdrop-blur-sm bg-white/95">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-10 w-10 rounded-full bg-accent-100 flex items-center justify-center">
              <Gift size={20} className="text-accent-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">12,847</p>
              <p className="text-xs text-slate-500">Gifts purchased this month</p>
            </div>
          </div>
          <div className="flex -space-x-2">
            {['S', 'M', 'J', 'A', 'R'].map((letter, i) => (
              <div key={i} className="h-7 w-7 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-[10px] font-medium text-primary-700">
                {letter}
              </div>
            ))}
            <div className="h-7 w-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-medium text-slate-500">
              +99
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

// ─── Trusted By / Stores ─────────────────────────────────────────
function TrustedStores() {
  const stores = ['Amazon', 'Crate & Barrel', 'Williams Sonoma', 'Target', 'Brooklinen', 'Lululemon', 'Casper', 'Sonos', 'Dyson', 'KitchenAid'];
  return (
    <section className="py-12 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-slate-500 mb-6">Works with gifts from any online store</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {stores.map((store) => (
            <span key={store} className="text-slate-400 font-medium text-sm hover:text-slate-600 transition-colors">{store}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { icon: Gift, title: 'Create Your Registry', desc: 'Set up your registry in seconds. Name your event, pick the occasion, and customize your page.', color: 'bg-primary-100 text-primary-600' },
    { icon: Store, title: 'Add Gifts Your Way', desc: 'Paste any product URL, browse our catalog of top items, or sync registries from other sites like Amazon and Crate & Barrel.', color: 'bg-blue-100 text-blue-600' },
    { icon: Link2, title: 'Share Your Link', desc: 'Send your unique registry link to friends and family. They browse your wishlist without creating an account.', color: 'bg-purple-100 text-purple-600' },
    { icon: ShoppingBag, title: 'Guests Buy & You Track', desc: 'Gift givers click through to purchase at the original store. Our system tracks what\'s been bought automatically.', color: 'bg-accent-100 text-accent-600' },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Simple Process</Badge>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900">How It Works</h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">Four simple steps to create the perfect gift registry that your guests will love.</p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <AnimatedSection key={i}>
              <motion.div
                whileHover={{ y: -4 }}
                className="relative text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className={`h-16 w-16 rounded-2xl ${step.color} flex items-center justify-center`}>
                    <step.icon size={28} />
                  </div>
                </div>
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full text-6xl font-bold text-slate-100 font-display select-none">
                  {i + 1}
                </span>
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

// ─── Features ────────────────────────────────────────────────────
function Features() {
  const features = [
    { icon: Globe, title: 'Universal Compatibility', desc: 'Add products from absolutely any online store. Paste a URL and we extract the product details automatically.' },
    { icon: ScanSearch, title: 'Registry Syncing', desc: 'Already have registries on Amazon, The Knot, or Crate & Barrel? We sync them daily into one central place.' },
    { icon: BarChart3, title: 'Real-Time Tracking', desc: 'Know exactly which gifts have been purchased through affiliate tracking, manual confirmation, or token verification.' },
    { icon: Bell, title: 'Smart Notifications', desc: 'Get notified instantly when someone buys a gift, when items go out of stock, or when prices change.' },
    { icon: Shield, title: 'Price Monitoring', desc: 'We check prices nightly and alert you if something goes out of stock or drops in price.' },
    { icon: Zap, title: 'One-Click Guest Access', desc: 'Gift givers never need an account. They browse, click, buy at the retailer, and confirm - that simple.' },
  ];

  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Features</Badge>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900">Everything You Need</h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">Powerful features that make gift-giving effortless for everyone involved.</p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <AnimatedSection key={i}>
              <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Card className="p-6 h-full hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 mb-4">
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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 5000 })]);

  const testimonials = [
    { name: 'Jessica & Tom W.', occasion: 'Wedding', text: 'GiftList was a game-changer for our wedding registry. We had items from five different stores and our guests could see everything in one place. So many people commented on how easy it was!', avatar: 'J' },
    { name: 'Priya Patel', occasion: 'Baby Shower', text: 'I loved being able to sync my Amazon and BuyBuy Baby registries. The gift tracking was incredibly accurate and saved me from so many duplicate gifts.', avatar: 'P' },
    { name: 'Marcus & Olivia R.', occasion: 'Housewarming', text: 'Setting up our housewarming registry took literally 10 minutes. We just pasted URLs from the stores we liked and GiftList pulled in all the product details automatically.', avatar: 'M' },
    { name: 'Hannah Davis', occasion: 'Birthday', text: 'My friends loved the simplicity. No accounts needed, no app downloads. Just click the link, browse, and buy. I got exactly what I wanted for my 30th!', avatar: 'H' },
    { name: 'Alex & Jordan K.', occasion: 'Wedding', text: 'The notification system is brilliant. Every time a gift was purchased, I got a little ping of excitement. It made the whole experience leading up to our wedding so fun.', avatar: 'A' },
    { name: 'Nina Morales', occasion: 'Graduation', text: 'I was worried about asking for gifts for my graduation but GiftList made it feel natural. The page looked so professional and my family appreciated the organization.', avatar: 'N' },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Testimonials</Badge>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900">Loved by Gift Givers</h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">Thousands of happy registries and counting.</p>
        </AnimatedSection>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                  <Card className="p-6 h-full flex flex-col">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={16} className="fill-warm-400 text-warm-400" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed flex-1">"{t.text}"</p>
                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                        {t.avatar}
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
            <button onClick={() => emblaApi?.scrollPrev()} className="h-10 w-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => emblaApi?.scrollNext()} className="h-10 w-10 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer">
              <ChevronRight size={18} />
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
    { value: '25,000+', label: 'Registries Created' },
    { value: '180,000+', label: 'Gifts Tracked' },
    { value: '500+', label: 'Stores Supported' },
    { value: '99.2%', label: 'Satisfaction Rate' },
  ];

  return (
    <section className="py-20 bg-primary-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <AnimatedSection key={i} className="text-center">
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
      features: ['1 active registry', 'Up to 50 items', 'Basic gift tracking', 'Shareable link', 'URL product import'],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Premium',
      price: '$9',
      period: '/month',
      desc: 'Great for weddings and baby showers.',
      features: ['Unlimited registries', 'Unlimited items', 'Advanced tracking (3-layer)', 'Registry syncing', 'Price monitoring', 'Priority notifications', 'Custom URL slug'],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Family',
      price: '$19',
      period: '/month',
      desc: 'For families with multiple events.',
      features: ['Everything in Premium', 'Up to 5 family members', 'Shared dashboard', 'Analytics & insights', 'Dedicated support', 'API access'],
      cta: 'Contact Us',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">Start for free and upgrade when you need more power.</p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <AnimatedSection key={i}>
              <motion.div whileHover={{ y: -4 }}>
                <Card className={`p-8 h-full flex flex-col ${plan.popular ? 'ring-2 ring-primary-500 shadow-lg relative' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary-600 text-white px-4 py-1">Most Popular</Badge>
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
                      <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check size={16} className="text-accent-500 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="mt-8">
                    <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>{plan.cta}</Button>
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
    { q: 'Can I add gifts from any store?', a: 'Absolutely! Just paste the product URL and we automatically extract the product image, title, and price. It works with any online store worldwide.' },
    { q: 'Do my guests need to create an account?', a: 'No! Gift givers never need to create an account. They simply visit your registry link, browse your wishlist, and click through to purchase at the retailer.' },
    { q: 'How do you track which gifts were purchased?', a: 'We use a three-layer tracking system: automatic affiliate network reporting, token-based email confirmation, and manual marking by the gift giver. This ensures maximum accuracy.' },
    { q: 'Can I sync registries from other websites?', a: 'Yes! If you already have registries on Amazon, Crate & Barrel, Williams Sonoma, The Knot, or other platforms, we can sync those items into your GiftList registry automatically.' },
    { q: 'What happens if a product goes out of stock?', a: 'We monitor all products nightly for price changes and availability. If something goes out of stock, we immediately notify you via email so you can update your registry.' },
    { q: 'How long does my registry stay active?', a: 'Registries remain active for 36 months from creation. You will receive a reminder before expiration in case you want to extend it.' },
  ];

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">FAQ</Badge>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900">Common Questions</h2>
        </AnimatedSection>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <AnimatedSection key={i}>
              <details className="group border border-slate-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors text-left">
                  <span className="font-medium text-slate-900">{faq.q}</span>
                  <ChevronRight size={18} className="text-slate-400 group-open:rotate-90 transition-transform shrink-0 ml-4" />
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">{faq.a}</div>
              </details>
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
    <section className="py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10"><Gift size={80} /></div>
        <div className="absolute bottom-10 right-10"><Heart size={60} /></div>
        <div className="absolute top-1/2 left-1/3"><Users size={50} /></div>
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AnimatedSection>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-white">
            Ready to Create Your Perfect Registry?
          </h2>
          <p className="mt-6 text-lg text-primary-100 max-w-xl mx-auto">
            Join thousands of happy couples, parents, and celebrants who trust GiftList for their special moments.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50 text-base px-8 gap-2 shadow-lg">
                Create Free Registry <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/registry/sarah-davids-wedding">
              <Button size="lg" variant="outline" className="border-primary-300 text-white hover:bg-primary-600 text-base px-8">
                View Demo Registry
              </Button>
            </Link>
          </div>
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
