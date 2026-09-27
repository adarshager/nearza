/**
 * Nearza — Merchant Portal Layout
 * Dedicated merchant management layout with:
 * - Desktop sidebar navigation
 * - Mobile responsive drawer & bottom navigation
 * - Real-time shop status & verification badge
 * - Outlet context for shared shop data
 */

import { useState, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Store,
  ExternalLink,
  Menu,
  X,
  CheckCircle,
  Clock,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getMerchantShop } from '../services/merchant';
import { Badge } from '../components/ui/Badge';

export function MerchantLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [shop, setShop] = useState(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const fetchShop = useCallback(async () => {
    try {
      const data = await getMerchantShop();
      setShop(data);
    } catch {
      setShop(null);
    } finally {
      setLoadingShop(false);
    }
  }, []);

  useEffect(() => {
    fetchShop();
  }, [fetchShop]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  const navItems = [
    {
      to: '/merchant/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: location.pathname === '/merchant/dashboard',
    },
    {
      to: '/merchant/inventory',
      label: 'Inventory & Products',
      icon: Package,
      active: location.pathname === '/merchant/inventory',
    },
    {
      to: '/merchant/shop',
      label: 'Shop Profile',
      icon: Store,
      active: location.pathname === '/merchant/shop',
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased text-slate-800">
      {/* =================================================================== */}
      {/* DESKTOP SIDEBAR */}
      {/* =================================================================== */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-slate-200/80 shrink-0 sticky top-0 h-screen z-30">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-sky-500/20">
              N
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight block leading-tight">
                Nearza
              </span>
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
                Merchant Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Current Shop Identity Widget */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-b from-sky-50/60 to-slate-50 border border-sky-100/80">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-sky-100 flex items-center justify-center text-sky-600 shrink-0 overflow-hidden shadow-2xs relative">
              {shop?.logo_url ? (
                <img
                  src={shop.logo_url}
                  alt={shop.name}
                  key={shop.logo_url}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Building2 className={`w-5 h-5 text-sky-500 ${shop?.logo_url ? 'hidden' : ''}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-xs text-slate-900 truncate">
                {shop ? shop.name : 'Store Not Setup'}
              </h3>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                {shop ? `${shop.city || 'Local Store'}` : 'Click to register shop'}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                {shop?.verification_status === 'approved' ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100/80 text-emerald-800">
                    <CheckCircle className="w-2.5 h-2.5" /> Verified
                  </span>
                ) : shop ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100/80 text-amber-800">
                    <Clock className="w-2.5 h-2.5" /> Verification Pending
                  </span>
                ) : (
                  <Link to="/merchant/shop" className="text-[10px] font-bold text-sky-600 hover:underline">
                    Create Profile →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  item.active
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Public store preview link */}
          {shop?.id && (
            <Link
              to={`/shops/${shop.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-sky-600 hover:bg-sky-50/60 transition-all mt-4 border border-dashed border-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4 text-sky-500" />
                <span>Live Public Shop</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          )}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Switch to Customer App</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* =================================================================== */}
      {/* MOBILE TOP BAR & DRAWER */}
      {/* =================================================================== */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <span className="font-bold text-sm text-slate-900 block leading-tight">
              {shop?.name || 'Merchant Portal'}
            </span>
            <span className="text-[10px] text-sky-600 font-semibold block">
              Nearza Merchant
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {shop?.verification_status === 'approved' && (
            <Badge variant="success" size="sm" dot>
              Verified
            </Badge>
          )}
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl p-5 flex flex-col justify-between z-10"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-500 text-white font-black flex items-center justify-center text-sm">
                      N
                    </div>
                    <span className="font-extrabold text-slate-900 text-sm">Merchant Portal</span>
                  </div>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Nav Links */}
                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold ${
                          item.active
                            ? 'bg-sky-500 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <Link
                  to="/"
                  className="flex items-center gap-2 text-xs font-medium text-slate-600 p-2 rounded-lg hover:bg-slate-50"
                >
                  <ArrowLeft className="w-4 h-4" /> Switch to Customer App
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 text-xs font-semibold text-rose-600 p-2 rounded-lg hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* MAIN CONTENT AREA */}
      {/* =================================================================== */}
      <main className="flex-1 min-w-0 flex flex-col pb-20 md:pb-8">
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <Outlet context={{ shop, refreshShop: fetchShop }} />
        </div>
      </main>

      {/* =================================================================== */}
      {/* MOBILE BOTTOM NAVIGATION DOCK */}
      {/* =================================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg shadow-slate-900/5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center py-1 px-3 rounded-xl text-[11px] font-bold transition-colors ${
                item.active ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
        {shop?.id && (
          <Link
            to={`/shops/${shop.id}`}
            className="flex flex-col items-center py-1 px-3 rounded-xl text-[11px] font-medium text-slate-400 hover:text-sky-600"
          >
            <ExternalLink className="w-5 h-5 mb-0.5" />
            <span>Store</span>
          </Link>
        )}
      </nav>
    </div>
  );
}

export default MerchantLayout;
