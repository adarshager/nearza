/**
 * Nearza — Main Navigation Bar
 * Responsive header with brand identity, location badge, navigation links, and auth controls.
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import {
  MapPin,
  Menu,
  X,
  Search,
  Store,
  Compass,
  LayoutGrid,
  User,
  LogOut,
  ChevronDown,
  Heart,
  Bell,
  History,
  ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function Navbar() {
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { locality, city, displayName, openLocationModal } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Nearby', path: '/nearby', icon: MapPin },
    { label: 'Compare', path: '/compare', icon: ArrowUpDown },
    { label: 'Products', path: '/search', icon: Compass },
    { label: 'Shops', path: '/shops', icon: Store },
    { label: 'Categories', path: '/categories', icon: LayoutGrid },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(navSearchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-sky-400 flex items-center justify-center shadow-sm shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-extrabold text-xl tracking-tight">N</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                Nearza
              </span>
              <span className="text-[10px] font-medium text-sky-600 tracking-wide mt-0.5 hidden sm:inline">
                Find Nearby. Shop Smarter.
              </span>
            </div>
          </Link>

          {/* Prominent Location Selector Button in Header */}
          <button
            type="button"
            onClick={openLocationModal}
            title="Change discovery location"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-50 hover:bg-sky-100/90 text-slate-800 border border-sky-200 transition-all cursor-pointer group max-w-[200px]"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-slate-900 truncate">
              {locality || city || 'Ankola'}
            </span>
            <span className="text-[11px] text-sky-600 font-bold underline ml-0.5 shrink-0">
              Change
            </span>
          </button>

          {/* Desktop Search Trigger / Input */}
          <div className="hidden lg:flex flex-1 max-w-md mx-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products or nearby stores..."
                value={navSearchQuery}
                onChange={(e) => setNavSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200/80 text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              />
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = routerLocation.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-sky-600 bg-sky-50/70 font-semibold'
                      : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth & Quick Customer Icons */}
          <div className="hidden md:flex items-center gap-2">
            {/* Quick Favorites Icon */}
            <Link
              to="/favorites"
              title="My Favorites"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50/80 transition-colors"
            >
              <Heart className="w-4 h-4" />
            </Link>

            {/* Quick Notifications Icon */}
            <Link
              to="/notifications"
              title="Notifications & Deals"
              className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
            >
              <Bell className="w-4 h-4" />
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    {user?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                    {user?.name || user?.email || 'Account'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      <Badge variant="sky" size="sm" className="mt-1.5">
                        {user?.role || 'Customer'}
                      </Badge>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                    >
                      <User className="w-4 h-4 text-sky-600" />
                      Account Profile
                    </Link>

                    <Link
                      to="/favorites"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      Saved Favorites
                    </Link>

                    <Link
                      to="/history"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                    >
                      <History className="w-4 h-4 text-sky-600" />
                      Search History
                    </Link>

                    <Link
                      to="/notifications"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                    >
                      <Bell className="w-4 h-4 text-sky-600" />
                      Notifications & Deals
                    </Link>

                    {user?.role === 'merchant' && (
                      <Link
                        to="/merchant/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                      >
                        <Store className="w-4 h-4 text-sky-600" />
                        Merchant Dashboard
                      </Link>
                    )}

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin-panel"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <Store className="w-4 h-4 text-rose-600" />
                        Admin Panel
                      </Link>
                    )}

                    <div className="pt-1 mt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  as={Link}
                  to="/login"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  as={Link}
                  to="/register"
                >
                  Join Nearza
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-sky-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-lg px-4 py-4 space-y-3">
          {/* Location button mobile */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              openLocationModal();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-sky-50 text-slate-800 text-xs font-medium border border-sky-200 cursor-pointer"
          >
            <span className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="font-bold text-slate-900 truncate">{displayName || 'Ankola, Karnataka'}</span>
            </span>
            <span className="text-sky-600 font-bold underline text-[11px] shrink-0 ml-2">Change</span>
          </button>

          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700"
              >
                {link.icon && <link.icon className="w-4 h-4 text-sky-600" />}
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-slate-800 text-sm font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-sky-600" />
                    {user?.full_name || 'My Profile'}
                  </span>
                  <Badge variant="sky" size="sm">{user?.role}</Badge>
                </Link>

                {user?.role === 'merchant' && (
                  <Link
                    to="/merchant/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-3 rounded-xl bg-sky-50 text-sky-800 text-sm font-semibold"
                  >
                    <Store className="w-4 h-4 text-sky-600" />
                    Merchant Dashboard
                  </Link>
                )}

                <Button
                  variant="outline"
                  fullWidth
                  size="sm"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  fullWidth
                  size="sm"
                  as={Link}
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  size="sm"
                  as={Link}
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register Account
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
