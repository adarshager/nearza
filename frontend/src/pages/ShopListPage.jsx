/**
 * Nearza — Shops Directory Page
 * Discover nearby neighborhood stores, sorted by physical distance.
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Store, Search, MapPin, RefreshCw } from 'lucide-react';
import { shopsService } from '../services/shops';
import { useLocation } from '../contexts/LocationContext';
import { ShopCard } from '../components/shop/ShopCard';
import { SkeletonShopCard } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';

export function ShopListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { latitude, longitude, address, locality, city: userCity, openLocationModal } = useLocation();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadShops() {
      setError(null);
      try {
        const params = {};
        if (query.trim()) params.q = query.trim();
        if (city.trim()) params.city = city.trim();
        if (latitude && longitude) {
          params.latitude = latitude;
          params.longitude = longitude;
          params.lat = latitude;
          params.lon = longitude;
        }

        const data = await shopsService.getShops(params);
        if (active) {
          setShops(data.results || data);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load shops.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadShops();
    return () => {
      active = false;
    };
  }, [query, city, latitude, longitude, refreshKey]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (query.trim()) params.q = query.trim();
    if (city.trim()) params.city = city.trim();
    setSearchParams(params);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Nearby Shops
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Verified local neighborhood merchants with live stock & price updates
          </p>
        </div>

        {/* Location selector trigger */}
        <button
          type="button"
          onClick={openLocationModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer w-fit bg-sky-50 text-slate-800 border-sky-200 hover:bg-sky-100/90 shadow-2xs group"
        >
          <MapPin className="w-3.5 h-3.5 text-sky-600 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-slate-900">{locality || userCity || address || 'Ankola'}</span>
          <span className="text-sky-600 font-bold underline ml-0.5">Change location</span>
        </button>
      </div>

      {/* Search & City Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search store name, street, or locality..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-500"
            />
          </div>

          <div className="w-full sm:w-48">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City (e.g. Ankola)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-500"
            />
          </div>

          <Button type="submit" variant="primary" size="md">
            Filter Shops
          </Button>
        </form>
      </div>

      {/* Grid State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonShopCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-rose-100 p-8 text-center">
          <p className="text-sm font-semibold text-rose-600 mb-2">{error}</p>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => setRefreshKey((k) => k + 1)}>
            Try Again
          </Button>
        </div>
      ) : shops.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No shops found</h3>
          <p className="text-xs text-slate-400 mb-4">
            Try adjusting your search query or city filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setQuery('');
              setCity('');
              setSearchParams({});
            }}
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ShopListPage;
