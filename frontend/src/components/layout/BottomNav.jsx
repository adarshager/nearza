/**
 * Nearza — Mobile Bottom Navigation Bar
 * Persistent navigation dock for mobile devices with route detection and smooth indicators.
 */

import { Link, useLocation } from 'react-router-dom';
import { Home, ArrowUpDown, Heart, User, Store, MapPin, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function BottomNav() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const isMerchant = user?.role === 'merchant';

  const items = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Nearby', path: '/nearby', icon: MapPin },
    {
      label: isMerchant ? 'My Shop' : 'Saved',
      path: isMerchant ? '/merchant/dashboard' : '/favorites',
      icon: isMerchant ? Store : Heart,
    },
    {
      label: isAuthenticated ? 'Profile' : 'Profile',
      path: isAuthenticated ? '/profile' : '/login',
      icon: User,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-150 ${
                isActive
                  ? 'text-sky-600 font-semibold'
                  : 'text-slate-500 hover:text-sky-600'
              }`}
            >
              <div
                className={`relative p-1 rounded-xl transition-all ${
                  isActive ? 'bg-sky-50 text-sky-600' : ''
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
