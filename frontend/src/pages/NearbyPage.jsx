/**
 * Nearza — Nearby Discovery Page
 * Location-based discovery: nearby shops, product availability, distance sorting,
 * directions, call, and WhatsApp actions.
 *
 * Privacy: Never tracks location continuously — only on explicit user action.
 * Stores only the minimum data required (lat, lng).
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  Search,
  Star,
  Package,
  Store,
  MapPinOff,
  RefreshCw,
  ArrowUpDown,
  CheckCircle,
  Filter,
  X,
  Compass,
  ChevronRight,
  ShoppingBag,
  Clock,
  Locate,
  AlertTriangle,
} from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';
import { nearbyService } from '../services/nearby';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton, SkeletonShopCard } from '../components/ui/Skeleton';
import { formatDistance } from '../utils/formatters';
import { MerchantActions } from '../components/merchant/MerchantActions';

// ===================================================================
// Radius Options
// ===================================================================
const RADIUS_OPTIONS = [
  { label: '1 km', value: 1 },
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '25 km', value: 25 },
  { label: 'Any', value: null },
];

// ===================================================================
// Sub-Components
// ===================================================================

/**
 * Location Permission Banner — shown when location is not yet available.
 * Handles all three fallback cases: denied, unsupported, unavailable.
 */
function LocationPermissionBanner({ onRequestLocation, onManualSearch, loading, error, permissionAsked }) {
  const isBlocked = error && error.includes('denied');
  const isUnsupported = error && error.includes('not supported');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="p-8 sm:p-10 text-center bg-gradient-to-b from-sky-50/80 to-white border-sky-200/60">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-sky-100 to-sky-200/60 flex items-center justify-center mb-5 shadow-sm shadow-sky-500/10">
          {isBlocked ? (
            <MapPinOff className="w-10 h-10 text-sky-500" />
          ) : (
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <Compass className="w-10 h-10 text-sky-500" />
            </motion.div>
          )}
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          {isUnsupported
            ? 'Geolocation Not Supported'
            : isBlocked
              ? 'Location Access Blocked'
              : 'Discover Shops Near You'}
        </h2>

        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
          {isUnsupported
            ? 'Your browser doesn\'t support geolocation. Try using a modern browser like Chrome or Firefox.'
            : isBlocked
              ? 'Location access was denied. Please enable location permissions in your browser settings to discover nearby shops.'
              : 'Enable your location to find shops, products, and live pricing in your neighborhood. Your location is only used while you\'re on this page.'}
        </p>

        {error && (
          <div className="flex items-center justify-center gap-2 mb-4 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200/60 text-xs text-amber-700 font-medium max-w-sm mx-auto">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {!isUnsupported && (
            <Button
              variant="primary"
              size="lg"
              icon={Locate}
              onClick={onRequestLocation}
              isLoading={loading}
              className="shadow-lg shadow-sky-500/20"
            >
              {isBlocked ? 'Try GPS Again' : 'Use Device GPS'}
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            icon={Search}
            onClick={onManualSearch}
            className="border-sky-300 text-sky-700 hover:bg-sky-50"
          >
            Search Location Manually
          </Button>
        </div>

        <p className="text-[11px] text-slate-400 mt-4 flex items-center justify-center gap-1">
          <CheckCircle className="w-3 h-3" />
          You can change or clear your chosen location anytime
        </p>
      </Card>

      {/* Manual fallback: search by city */}
      {(isBlocked || isUnsupported || (permissionAsked && !loading)) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-slate-400 mb-3">Or browse shops by city instead</p>
          <Link to="/shops">
            <Button variant="outline" size="sm" icon={Store}>
              Browse All Shops
            </Button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Nearby Shop Card — enhanced with distance, inventory info, and action buttons.
 */
function NearbyShopCard({ shop, userLat, userLng }) {
  const {
    id,
    name,
    slug,
    address,
    city,
    phone,
    whatsapp_number,
    logo_url,
    avg_rating,
    total_reviews = 0,
    verification_status,
    distance_km,
    products_count = 0,
    latitude,
    longitude,
  } = shop;

  const isVerified = verification_status === 'approved';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card hoverable className="group bg-white border border-slate-100 flex flex-col h-full">
        {/* Top Section */}
        <div className="p-5 flex-1">
          {/* Shop Identity Row */}
          <div className="flex items-start gap-3.5 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 overflow-hidden">
              {logo_url ? (
                <img src={logo_url} alt={name} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-7 h-7" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  to={`/shops/${id}`}
                  className="font-bold text-sm text-slate-900 hover:text-sky-600 transition-colors truncate"
                >
                  {name}
                </Link>
                {isVerified && (
                  <CheckCircle className="w-3.5 h-3.5 text-sky-500 shrink-0" title="Verified Merchant" />
                )}
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">{address}, {city}</p>
            </div>

            {/* Distance Chip — calculated from authoritative user coordinates */}
            {(() => {
              let effectiveDistance = distance_km;
              if (
                (effectiveDistance === null || effectiveDistance === undefined) &&
                userLat &&
                userLng &&
                latitude &&
                longitude
              ) {
                const R = 6371;
                const dLat = (latitude - userLat) * (Math.PI / 180);
                const dLng = (longitude - userLng) * (Math.PI / 180);
                const a =
                  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(userLat * (Math.PI / 180)) *
                    Math.cos(latitude * (Math.PI / 180)) *
                    Math.sin(dLng / 2) *
                    Math.sin(dLng / 2);
                effectiveDistance = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
              }

              if (effectiveDistance !== null && effectiveDistance !== undefined) {
                return (
                  <div className="shrink-0 flex flex-col items-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200/60">
                      <MapPin className="w-3 h-3 text-sky-600" />
                      {formatDistance(effectiveDistance)}
                    </span>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {avg_rating > 0 ? Number(avg_rating).toFixed(1) : 'New'} ({total_reviews})
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
              <Package className="w-3 h-3 text-sky-600" />
              {products_count} items
            </span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-2">
          <Link
            to={`/shops/${id}`}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors flex items-center gap-1"
          >
            View Products <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <MerchantActions shop={shop} size="sm" />
        </div>
      </Card>
    </motion.div>
  );
}

/**
 * Nearby Product Row — compact product listing with shop, price, stock, confidence.
 */
function NearbyProductCard({ product }) {
  const {
    id,
    name,
    brand,
    category,
    image_url,
    unit,
    unit_value,
    min_price,
    max_price,
    shops_count = 0,
    in_stock_shops_count = 0,
    nearest_distance_km,
  } = product;

  const isAvailable = in_stock_shops_count > 0;
  const hasMultiplePrices = min_price && max_price && min_price !== max_price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card hoverable className="group bg-white border border-slate-100 hover:border-sky-200 transition-all">
        <Link to={`/products/${id}`} className="flex items-stretch">
          {/* Product Image */}
          <div className="w-24 sm:w-32 shrink-0 bg-slate-50 flex items-center justify-center p-3 border-r border-slate-100">
            {image_url ? (
              <img
                src={image_url}
                alt={name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <ShoppingBag className="w-8 h-8 text-slate-300" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] text-slate-400 font-medium truncate">
                  {brand || category?.name || 'General'}
                </span>
                {unit_value && unit && (
                  <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                    {unit_value} {unit}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
                {name}
              </h3>
            </div>

            {/* Bottom Info Row */}
            <div className="flex items-end justify-between gap-2 mt-2.5">
              <div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {hasMultiplePrices ? 'From' : 'Best'}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-black text-slate-900 tracking-tight">
                    {min_price != null ? `₹${min_price}` : '—'}
                  </span>
                  {hasMultiplePrices && (
                    <span className="text-[11px] text-slate-400 line-through">₹{max_price}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 justify-end">
                {/* Availability */}
                {isAvailable ? (
                  <Badge variant="success" size="sm" dot>In Stock</Badge>
                ) : (
                  <Badge variant="secondary" size="sm">Out</Badge>
                )}

                {/* Distance Chip */}
                {nearest_distance_km != null && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                    <MapPin className="w-2.5 h-2.5" />
                    {formatDistance(nearest_distance_km)}
                  </span>
                )}

                {/* Shop count */}
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                  <Store className="w-2.5 h-2.5" />
                  {shops_count}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    </motion.div>
  );
}

// ===================================================================
// Skeleton for Nearby Product
// ===================================================================
function SkeletonNearbyProduct() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-3">
      <Skeleton className="w-24 h-20 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2 mt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}


// ===================================================================
// Main NearbyPage Component
// ===================================================================
export function NearbyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    latitude,
    longitude,
    address,
    locality,
    city,
    displayName,
    openLocationModal,
    getLocation,
    locationLoading,
    locationError,
    permissionAsked,
    hasLocation,
  } = useLocation();

  // View tab state
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'shops');

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedRadius, setSelectedRadius] = useState(
    searchParams.get('radius') ? Number(searchParams.get('radius')) : 5
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'distance');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('in_stock_only') === 'true');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Data state
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch nearby data whenever location or filters change
  useEffect(() => {
    if (!latitude || !longitude) return;

    let active = true;
    setIsLoading(true);
    setError(null);

    async function fetchNearby() {
      const baseParams = {
        latitude,
        longitude,
        lat: latitude,
        lon: longitude,
        ...(selectedRadius != null && { radius_km: selectedRadius, radius: selectedRadius }),
        ...(searchQuery.trim() && { q: searchQuery.trim() }),
      };

      try {
        if (activeTab === 'shops') {
          const data = await nearbyService.getNearbyShops(baseParams);
          if (active) setShops(data.results || data);
        } else {
          const data = await nearbyService.getNearbyProducts({
            ...baseParams,
            sort: sortBy,
            ...(inStockOnly && { in_stock_only: 'true' }),
          });
          if (active) setProducts(data.results || data);
        }
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Failed to load nearby results.');
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchNearby();
    return () => { active = false; };
  }, [latitude, longitude, activeTab, selectedRadius, searchQuery, sortBy, inStockOnly, refreshKey]);

  // Handle search submit
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    const params = { tab: activeTab };
    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (selectedRadius != null) params.radius = selectedRadius;
    if (sortBy !== 'distance') params.sort = sortBy;
    if (inStockOnly) params.in_stock_only = 'true';
    setSearchParams(params);
    setRefreshKey((k) => k + 1);
  }, [activeTab, searchQuery, selectedRadius, sortBy, inStockOnly, setSearchParams]);

  // Switch tabs
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  }, [setSearchParams]);

  // ===================================================================
  // Render: Location Not Yet Available
  // ===================================================================
  if (!hasLocation) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 md:pb-12">
        <LocationPermissionBanner
          onRequestLocation={getLocation}
          onManualSearch={openLocationModal}
          loading={locationLoading}
          error={locationError}
          permissionAsked={permissionAsked}
        />
      </div>
    );
  }

  // ===================================================================
  // Render: Full Nearby Page
  // ===================================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Nearby</h1>
          <p className="text-xs text-slate-500 mt-1">
            Shops and products around your current location
          </p>
        </div>

        {/* Current Selected Location Badge */}
        <button
          type="button"
          onClick={openLocationModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer w-fit bg-sky-50 text-slate-800 border-sky-200 hover:bg-sky-100/90 shadow-2xs group"
        >
          <MapPin className="w-3.5 h-3.5 text-sky-600 group-hover:scale-110 transition-transform" />
          <span className="truncate max-w-[200px] font-bold text-slate-900">
            {locality || city || address || 'Ankola'}
          </span>
          <span className="text-sky-600 font-bold underline ml-1">
            Change location
          </span>
        </button>
      </div>

      {/* Tabs: Shops / Products */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6">
        {[
          { key: 'shops', label: 'Nearby Shops', icon: Store },
          { key: 'products', label: 'Nearby Products', icon: ShoppingBag },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'shops' ? 'Search nearby shops...' : 'Search nearby products, brands...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-500"
            />
          </div>

          {/* Radius Select */}
          <select
            value={selectedRadius ?? ''}
            onChange={(e) => setSelectedRadius(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            {RADIUS_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value ?? ''}>{opt.label}</option>
            ))}
          </select>

          {/* Mobile filter trigger */}
          {activeTab === 'products' && (
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              <Filter className="w-3.5 h-3.5" /> Filters
            </button>
          )}

          <Button type="submit" variant="primary" size="md">
            Search
          </Button>
        </form>

        {/* Desktop sort & filter controls for Products */}
        {activeTab === 'products' && (
          <div className="hidden sm:flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="distance">Distance: Nearest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-400"
              />
              In Stock Only
            </label>
          </div>
        )}
      </div>

      {/* Results Section */}
      {isLoading ? (
        <div className="space-y-4">
          {activeTab === 'shops' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonShopCard key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonNearbyProduct key={i} />
              ))}
            </div>
          )}
        </div>
      ) : error ? (
        <Card className="p-8 text-center border-rose-100 bg-white">
          <p className="text-sm font-semibold text-rose-600 mb-2">{error}</p>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => setRefreshKey((k) => k + 1)}>
            Try Again
          </Button>
        </Card>
      ) : activeTab === 'shops' ? (
        /* === Shops Grid === */
        shops.length === 0 ? (
          <Card className="p-12 text-center border-slate-100 bg-white">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-400 flex items-center justify-center mx-auto mb-3">
              <Store className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No shops found nearby</h3>
            <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
              Try increasing the radius or searching for a specific shop name.
            </p>
            <Button variant="outline" size="sm" onClick={() => setSelectedRadius(25)}>
              Expand to 25 km
            </Button>
          </Card>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-4">
              <strong className="text-slate-800">{shops.length}</strong> shops found within{' '}
              <strong className="text-slate-800">{selectedRadius ? `${selectedRadius} km` : 'any distance'}</strong>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {shops.map((shop) => (
                <NearbyShopCard
                  key={shop.id}
                  shop={shop}
                  userLat={latitude}
                  userLng={longitude}
                />
              ))}
            </div>
          </>
        )
      ) : (
        /* === Products List === */
        products.length === 0 ? (
          <Card className="p-12 text-center border-slate-100 bg-white">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-400 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No products found nearby</h3>
            <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
              Try widening the search radius or adjusting your search terms.
            </p>
            <Button variant="outline" size="sm" onClick={() => setSelectedRadius(25)}>
              Expand to 25 km
            </Button>
          </Card>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-4">
              <strong className="text-slate-800">{products.length}</strong> products available nearby
            </p>
            <div className="space-y-3">
              {products.map((product) => (
                <NearbyProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )
      )}

      {/* Mobile Filters Drawer for Products */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex sm:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between z-10"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-slate-900">Filters</h3>
                  <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-slate-400 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Sort */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200"
                  >
                    <option value="distance">Distance: Nearest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>

                {/* In stock */}
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                  In Stock Only
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setSortBy('distance');
                    setInStockOnly(false);
                    setMobileFilterOpen(false);
                  }}
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setMobileFilterOpen(false);
                    setRefreshKey((k) => k + 1);
                  }}
                >
                  Apply
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NearbyPage;
