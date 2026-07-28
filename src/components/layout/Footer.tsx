import { Link } from 'react-router-dom';
import { Gift, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-white mb-4">
              <Gift size={24} />
              <span className="font-display text-lg font-bold">GiftList</span>
            </Link>
            <p className="text-sm leading-relaxed">
              The universal gift registry that brings all your wishlists together in one beautiful place.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/#faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Occasions</h4>
            <ul className="space-y-2 text-sm">
              <li><a className="hover:text-white transition-colors cursor-pointer">Wedding</a></li>
              <li><a className="hover:text-white transition-colors cursor-pointer">Baby Shower</a></li>
              <li><a className="hover:text-white transition-colors cursor-pointer">Birthday</a></li>
              <li><a className="hover:text-white transition-colors cursor-pointer">Housewarming</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a className="hover:text-white transition-colors cursor-pointer">About</a></li>
              <li><a className="hover:text-white transition-colors cursor-pointer">Blog</a></li>
              <li><a className="hover:text-white transition-colors cursor-pointer">Privacy Policy</a></li>
              <li><a className="hover:text-white transition-colors cursor-pointer">Terms of Service</a></li>
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
