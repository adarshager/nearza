/**
 * Nearza — Product Discovery & Search Page
 * Features authoritative location-based product discovery:
 * - Keyword search & category filtering
 * - Distance calculation from authoritative LocationContext
 * - Nearest-first proximity sorting
 * - Configurable search radius (5km, 10km, 25km, 50km, Any)
 * - Empty state with "Search wider area" recommendations
 * - AbortController & stale request protection (race condition prevention)
 * - Interactive Grid View / Map View with shop markers & directions
 * - Real error handling & reliable "Try Again"
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  X,
  RefreshCw,
  ArrowUpDown,
  ShoppingBag,
  LayoutGrid,
  Map as MapIcon,
  Navigation,
  Compass,
  Store,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  Tag,
  Phone,
} from 'lucide-react';
import { productsService } from '../services/products';
import { useLocation } from '../contexts/LocationContext';
import { ProductCard } from '../components/product/ProductCard';
import { SkeletonProductCard } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MerchantActions } from '../components/merchant/MerchantActions';
import { addSearchQuery } from '../utils/search-history';

const RADIUS_OPTIONS = [
  { label: '5 km', value: '5' },
  { label: '10 km', value: '10' },
  { label: '25 km', value: '25' },
  { label: '50 km', value: '50' },
  { label: 'All', value: 'all' },
];

export function ProductSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    latitude,
    longitude,
    address,
    locality,
    city,
    openLocationModal,
  } = useLocation();

  // Filter States initialized from URL
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('in_stock_only') === 'true');
  const [radius, setRadius] = useState(searchParams.get('radius') || '25');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || (latitude && longitude ? 'distance' : 'name'));
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // View mode: 'grid' or 'map'
  const [viewMode, setViewMode] = useState('grid');
  const [selectedShopId, setSelectedShopId] = useState(null);

  // Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [nearestAvailableDistance, setNearestAvailableDistance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Track active fetch controller for race condition / cancellation
  const activeControllerRef = useRef(null);

  // Load categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await productsService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    fetchCategories();
  }, []);

  // Update default sort when coordinates become available
  useEffect(() => {
    if (latitude && longitude && !searchParams.get('sort')) {
      setSortBy('distance');
    }
  }, [latitude, longitude, searchParams]);

  // Authoritative Product Fetching with Stale Request Protection
  useEffect(() => {
    // Abort previous in-flight request if user rapidly changed filters/location
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }

    const controller = new AbortController();
    activeControllerRef.current = controller;

    async function loadProducts() {
      setIsLoading(true);
      setError(null);

      const params = {
        page,
        sort: sortBy,
      };

      if (query.trim()) params.q = query.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (inStockOnly) params.in_stock_only = 'true';
      if (radius && radius !== 'all') params.radius = radius;

      // Send authoritative user-selected coordinates
      if (latitude && longitude) {
        params.latitude = latitude;
        params.longitude = longitude;
        params.lat = latitude;
        params.lon = longitude;
      }

      try {
        const data = await productsService.getProducts(params, { signal: controller.signal });
        // Only update if not aborted
        if (!controller.signal.aborted) {
          const list = Array.isArray(data) ? data : (data.results || []);
          setProducts(list);
          setTotalCount(data.count !== undefined ? data.count : list.length);
          setNearestAvailableDistance(data.nearest_available_distance_km || null);
          setIsLoading(false);
        }
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
          // Clean cancellation due to rapid user interaction; ignore
          return;
        }
        if (!controller.signal.aborted) {
          console.error('Product fetch error:', err);
          const serverMsg = err.response?.data?.message || err.response?.data?.detail || err.message;
          setError(serverMsg || 'Failed to fetch products. Please try again.');
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      controller.abort();
    };
  }, [
    query,
    selectedCategory,
    minPrice,
    maxPrice,
    inStockOnly,
    radius,
    sortBy,
    page,
    latitude,
    longitude,
    refreshKey,
  ]);

  // Synchronize URL search params
  const handleApplyFilters = () => {
    const nextParams = {};
    if (query.trim()) {
      nextParams.q = query.trim();
      addSearchQuery(query.trim());
    }
    if (selectedCategory) nextParams.category = selectedCategory;
    if (minPrice) nextParams.min_price = minPrice;
    if (maxPrice) nextParams.max_price = maxPrice;
    if (inStockOnly) nextParams.in_stock_only = 'true';
    if (radius && radius !== '25') nextParams.radius = radius;
    if (sortBy !== 'distance' && sortBy !== 'name') nextParams.sort = sortBy;
    nextParams.page = '1';

    setPage(1);
    setSearchParams(nextParams);
    setMobileFilterOpen(false);
  };

  const handleResetFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setRadius('25');
    setSortBy(latitude && longitude ? 'distance' : 'name');
    setPage(1);
    setSearchParams({});
    setMobileFilterOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleApplyFilters();
  };

  const handleExpandRadius = (newRadius = '50') => {
    setRadius(newRadius);
    setPage(1);
    const nextParams = Object.fromEntries(searchParams.entries());
    nextParams.radius = newRadius;
    nextParams.page = '1';
    setSearchParams(nextParams);
  };

  // Extract unique shops from current products for Map View
  const mapShops = useMemo(() => {
    const shopMap = new Map();
    products.forEach((p) => {
      const sp = p.primary_shop || p.shop;
      if (sp && sp.latitude && sp.longitude) {
        const id = sp.id || sp.name;
        if (!shopMap.has(id)) {
          shopMap.set(id, {
            ...sp,
            products: [{ id: p.id, name: p.name, price: sp.price || p.min_price, image_url: p.image_url }],
          });
        } else {
          shopMap.get(id).products.push({
            id: p.id,
            name: p.name,
            price: sp.price || p.min_price,
            image_url: p.image_url,
          });
        }
      }
    });
    return Array.from(shopMap.values());
  }, [products]);

  const currentLocationName = locality || city || address || 'Ankola';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12">
      {/* Top Search & Location Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm mb-6">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands, essentials nearby (e.g. rice, milk, oil)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/20 focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Geolocation Selector */}
            <button
              type="button"
              onClick={openLocationModal}
              title="Change your search location"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer bg-sky-50 text-slate-800 border-sky-200 hover:bg-sky-100"
            >
              <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="truncate max-w-[150px] font-bold text-slate-900">
                {currentLocationName}
              </span>
              <span className="text-sky-600 underline text-[11px] ml-0.5">Change</span>
            </button>

            {/* Mobile Filter Trigger */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              <Filter className="w-3.5 h-3.5" /> Filters
            </button>

            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
          </div>
        </form>

        {/* Quick Radius Selector Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            <span className="font-semibold text-slate-700">Search Radius:</span>
            <div className="flex items-center gap-1">
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleExpandRadius(opt.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    radius === opt.value
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* View Toggle: Grid vs Map */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" /> Map View
              {mapShops.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-sky-100 text-sky-800">
                  {mapShops.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-64 shrink-0 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-sky-600" /> Filters
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs text-sky-600 hover:text-sky-700 font-medium cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Search Radius in Sidebar */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              Proximity Radius
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRadius(opt.value)}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                    radius === opt.value
                      ? 'bg-sky-50 text-sky-700 border-sky-300 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              Category
            </label>
            <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  !selectedCategory ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                    selectedCategory === cat.slug
                      ? 'bg-sky-50 text-sky-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {cat.products_count > 0 && (
                    <span className="text-[10px] text-slate-400">({cat.products_count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Price Range (₹)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Availability Toggle */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-400"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          <Button variant="primary" fullWidth size="sm" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Results Summary & Sorting Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="text-xs text-slate-500">
              Showing <strong className="text-slate-800">{products.length}</strong> of{' '}
              <strong className="text-slate-800">{totalCount}</strong> products
              {selectedCategory && (
                <span className="ml-2">
                  in <Badge variant="sky" size="sm">{selectedCategory}</Badge>
                </span>
              )}
              {radius && radius !== 'all' && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/60">
                  within {radius} km of {currentLocationName}
                </span>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="distance">Distance: Nearest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Product Name (A-Z)</option>
                <option value="newest">Newly Cataloged</option>
              </select>
            </div>
          </div>

          {/* STATE 1: LOADING SKELETONS */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonProductCard key={i} />
              ))}
            </div>
          ) : error ? (
            /* STATE 2: REAL API ERROR (With reliable Try Again) */
            <div className="bg-white rounded-2xl border border-rose-100 p-8 text-center my-6 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Failed to fetch products</h3>
              <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">{error}</p>
              <Button
                variant="primary"
                size="sm"
                icon={RefreshCw}
                onClick={() => setRefreshKey((k) => k + 1)}
              >
                Try Again
              </Button>
            </div>
          ) : products.length === 0 ? (
            /* STATE 3: ZERO PRODUCTS FOUND (Location/Radius Aware) */
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center my-6 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                {radius && radius !== 'all'
                  ? `No matching products within ${radius} km of ${currentLocationName}`
                  : 'No matching products found'}
              </h3>

              {nearestAvailableDistance && nearestAvailableDistance > Number(radius || 25) ? (
                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 max-w-md mx-auto my-3 text-xs text-amber-900">
                  <p className="font-semibold">
                    The nearest participating store carrying matching items is{' '}
                    <strong>{nearestAvailableDistance.toFixed(1)} km</strong> away.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                  No items matched your current search filters or location criteria.
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                {radius && radius !== 'all' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleExpandRadius(nearestAvailableDistance ? String(Math.ceil(nearestAvailableDistance + 5)) : '50')}
                  >
                    Search wider area ({nearestAvailableDistance ? `${Math.ceil(nearestAvailableDistance + 5)} km` : '50 km'})
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear All Filters
                </Button>
              </div>
            </div>
          ) : viewMode === 'map' ? (
            /* STATE 4B: MAP VIEW WITH SHOP MARKERS & TURN-BY-TURN */
            <div className="space-y-6">
              {/* Radar Coordinate Visualizer */}
              <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-800 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
                        Hyperlocal Proximity Radar
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      Stores near {currentLocationName} carrying your items
                    </h3>
                  </div>

                  <a
                    href={
                      latitude && longitude
                        ? `https://www.google.com/maps/search/shops/@${latitude},${longitude},13z`
                        : 'https://maps.google.com'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Google Maps
                  </a>
                </div>

                {/* Radar Grid Representation */}
                <div className="relative w-full aspect-2/1 max-h-72 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center overflow-hidden">
                  {/* Concentric Distance Rings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-24 h-24 rounded-full border border-sky-500/20" />
                    <div className="w-48 h-48 rounded-full border border-sky-500/15" />
                    <div className="w-72 h-72 rounded-full border border-sky-500/10" />
                    <div className="w-full h-full rounded-full border border-sky-500/5" />
                    {/* Crosshairs */}
                    <div className="absolute w-full h-[1px] bg-sky-500/10" />
                    <div className="absolute h-full w-[1px] bg-sky-500/10" />
                  </div>

                  {/* Customer Origin Pin */}
                  <div className="relative z-20 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/50 ring-4 ring-sky-500/20">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-sky-300 bg-slate-900/90 px-2 py-0.5 rounded-md mt-1 border border-sky-500/30">
                      You ({currentLocationName})
                    </span>
                  </div>

                  {/* Shop Markers Plotted on Radar */}
                  {mapShops.map((shop, idx) => {
                    const d = shop.distance_km || (idx + 1) * 1.5;
                    const angle = (idx * (360 / Math.max(mapShops.length, 1)) * Math.PI) / 180;
                    const distPercent = Math.min(Math.max((d / 25) * 40, 15), 44);
                    const left = `${50 + distPercent * Math.cos(angle)}%`;
                    const top = `${50 + distPercent * Math.sin(angle)}%`;

                    const isSelected = selectedShopId === (shop.id || shop.name);

                    return (
                      <button
                        key={shop.id || shop.name}
                        onClick={() => setSelectedShopId(shop.id || shop.name)}
                        style={{ left, top }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer transition-transform ${
                          isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shadow-md transition-all ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/40'
                              : 'bg-emerald-500 text-white ring-2 ring-emerald-500/30'
                          }`}
                        >
                          <Store className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-bold text-white bg-slate-950/90 px-1.5 py-0.5 rounded shadow-xs mt-0.5 whitespace-nowrap max-w-[100px] truncate border border-slate-700">
                          {shop.name} ({typeof d === 'number' ? `${d.toFixed(1)}km` : `${d}km`})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Shop Listings with Turn-by-Turn Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mapShops.map((shop) => {
                  const isSelected = selectedShopId === (shop.id || shop.name);
                  const firstProd = shop.products?.[0];

                  return (
                    <div
                      key={shop.id || shop.name}
                      onClick={() => setSelectedShopId(shop.id || shop.name)}
                      className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                          : 'border-slate-100 hover:border-sky-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Store className="w-4 h-4 text-sky-600 shrink-0" />
                            <h4 className="text-sm font-bold text-slate-900">{shop.name}</h4>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{[shop.address, shop.city].filter(Boolean).join(', ')}</span>
                          </p>
                        </div>

                        {shop.distance_km !== null && shop.distance_km !== undefined && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-50 text-sky-800 border border-sky-100 shrink-0">
                            <Navigation className="w-3 h-3 text-sky-600" />
                            {typeof shop.distance_km === 'number'
                              ? `${shop.distance_km.toFixed(1)} km`
                              : `${shop.distance_km} km`}
                          </span>
                        )}
                      </div>

                      {/* Products carried by this shop */}
                      {shop.products && shop.products.length > 0 && (
                        <div className="mb-4 pt-3 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Available Matching Products
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {shop.products.slice(0, 3).map((p) => (
                              <span
                                key={p.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-50 text-slate-700 border border-slate-200"
                              >
                                <Tag className="w-3 h-3 text-sky-600" />
                                {p.name} {p.price ? `(₹${p.price})` : ''}
                              </span>
                            ))}
                            {shop.products.length > 3 && (
                              <span className="text-[10px] text-slate-400 font-semibold self-center">
                                +{shop.products.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action buttons: Call, WhatsApp, Directions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Store
                        </span>

                        <MerchantActions
                          shop={shop}
                          product={firstProd}
                          size="sm"
                          showLabels={true}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* STATE 4A: PRODUCT CARDS GRID */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {viewMode === 'grid' && totalCount > 12 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs font-semibold text-slate-600">
                Page {page} of {Math.ceil(totalCount / 12)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={products.length < 12 || page >= Math.ceil(totalCount / 12)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
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
              className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between z-10 overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-slate-900">Filters</h3>
                  <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-slate-400 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Proximity Radius */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Search Radius</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {RADIUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRadius(opt.value)}
                        className={`py-1.5 text-xs font-semibold rounded-lg border text-center ${
                          radius === opt.value
                            ? 'bg-sky-50 text-sky-700 border-sky-300 font-bold'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Price Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="p-2 text-xs border rounded-xl"
                    />
                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="p-2 text-xs border rounded-xl"
                    />
                  </div>
                </div>

                {/* In stock */}
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                  <span>In Stock Only</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <Button variant="outline" size="sm" fullWidth onClick={handleResetFilters}>
                  Reset
                </Button>
                <Button variant="primary" size="sm" fullWidth onClick={handleApplyFilters}>
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

export default ProductSearchPage;
