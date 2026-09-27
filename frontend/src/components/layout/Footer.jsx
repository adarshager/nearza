/**
 * Nearza — Footer Component
 * Professional multi-column footer adhering to the Nearza design system.
 */

import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200/80 pt-12 pb-20 md:pb-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-100">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center shadow-sm shadow-sky-500/20">
                <span className="text-white font-extrabold text-lg">N</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Nearza
              </span>
            </Link>

            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Find Nearby. Compare Prices. Shop Smarter. The hyperlocal commerce network connecting local shoppers directly with trusted neighborhood stores.
            </p>

            <div className="flex items-center gap-2 text-xs text-sky-800 bg-sky-50 border border-sky-200/70 rounded-xl px-3 py-2 w-fit">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Verified merchant pricing & inventory confidence tracking</span>
            </div>
          </div>

          {/* Column: Discover */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Discover
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/nearby" className="hover:text-sky-600 transition-colors">
                  Nearby Stores
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-sky-600 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-sky-600 transition-colors">
                  Price Comparison
                </Link>
              </li>
              <li>
                <Link to="/search?trending=true" className="hover:text-sky-600 transition-colors">
                  Trending Local Items
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Merchants */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              For Merchants
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/register" className="hover:text-sky-600 transition-colors">
                  List Your Store (Join Nearza)
                </Link>
              </li>
              <li>
                <Link to="/merchant/dashboard" className="hover:text-sky-600 transition-colors">
                  Inventory Management
                </Link>
              </li>
              <li>
                <Link to="/merchant/dashboard" className="hover:text-sky-600 transition-colors">
                  Footfall Analytics
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-sky-600 transition-colors">
                  Merchant Portal Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Platform & Trust */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Trust & Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/how-it-works" className="hover:text-sky-600 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-sky-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-sky-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-sky-600 transition-colors">
                  Support & Help
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {currentYear} Nearza Technologies. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              API Operational
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-sky-500" />
              Hyperlocal Engine
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
