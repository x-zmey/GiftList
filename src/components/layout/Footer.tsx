import { Link, useNavigate } from 'react-router-dom';
import { Gift, Heart, Mail, Globe, MessageCircle, Share2 } from 'lucide-react';

export function Footer() {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    navigate('/');
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-white mb-4">
              <Gift size={24} />
              <span className="font-display text-lg font-bold">GiftList</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              The universal gift registry that brings all your wishlists together in one beautiful place.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="h-9 w-9 rounded-full bg-slate-800 hover:bg-primary-600 flex items-center justify-center transition-colors" title="Social">
                <Globe size={16} />
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-slate-800 hover:bg-primary-600 flex items-center justify-center transition-colors" title="Community">
                <MessageCircle size={16} />
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-slate-800 hover:bg-primary-600 flex items-center justify-center transition-colors" title="Share">
                <Share2 size={16} />
              </a>
              <a href="mailto:support@giftlist.com" className="h-9 w-9 rounded-full bg-slate-800 hover:bg-primary-600 flex items-center justify-center transition-colors" title="Email">
                <Mail size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => scrollTo('features')} className="hover:text-white transition-colors cursor-pointer">Features</button></li>
              <li><button onClick={() => scrollTo('pricing')} className="hover:text-white transition-colors cursor-pointer">Pricing</button></li>
              <li><button onClick={() => scrollTo('how-it-works')} className="hover:text-white transition-colors cursor-pointer">How It Works</button></li>
              <li><button onClick={() => scrollTo('faq')} className="hover:text-white transition-colors cursor-pointer">FAQ</button></li>
              <li><Link to="/registry/sarah-davids-wedding" className="hover:text-white transition-colors">Demo Registry</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Occasions</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/register" className="hover:text-white transition-colors">Wedding Registry</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Baby Shower</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Birthday Wishlist</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Housewarming</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Graduation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><button onClick={() => scrollTo('faq')} className="hover:text-white transition-colors cursor-pointer">Help Center</button></li>
              <li><a href="mailto:support@giftlist.com" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">&copy; 2026 GiftList. All rights reserved.</p>
          <p className="text-sm flex items-center gap-1">
            Made with <Heart size={14} className="text-primary-500 fill-primary-500" /> for gift givers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
