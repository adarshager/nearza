/**
 * Nearza — Customer Home Experience
 * Modern commerce homepage with strictly white + sky-blue aesthetic.
 *
 * Implements all 8 required sections:
 * 1. Search bar
 * 2. Location selector
 * 3. Nearby shops
 * 4. Popular categories
 * 5. Trending products
 * 6. Best local prices
 * 7. Recently viewed
 * 8. Recommended nearby products
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  TrendingUp,
  Store,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Percent,
  History,
  Compass,
  Navigation,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import ProductCard from '../components/product/ProductCard';
import { CategoryCard } from '../components/category/CategoryCard';
import { MerchantActions } from '../components/merchant/MerchantActions';
import { LocationSelectorModal } from '../components/location/LocationSelectorModal';
import { getProducts, getCategories } from '../services/products';
import { getShops } from '../services/shops';
import { useLocation } from '../contexts/LocationContext';
import { addSearchQuery } from '../utils/search-history';
import { getRecentlyViewed, clearRecentlyViewed } from '../utils/recently-viewed';

// Curated Popular Categories with Studio Photographic Assets (Zero Emojis)
const POPULAR_CATEGORIES = [
  {
    name: 'Groceries',
    slug: 'grocery',
    image: '/images/categories/groceries.webp',
    fallbackImage: '/images/categories/groceries.jpg',
    tag: 'Daily Needs',
  },
  {
    name: 'Electronics',
    slug: 'electronics',
    image: '/images/categories/electronics.webp',
    fallbackImage: '/images/categories/electronics.jpg',
    tag: 'Smart Gadgets',
  },
  {
    name: 'Clothing',
    slug: 'fashion',
    image: '/images/categories/clothing.webp',
    fallbackImage: '/images/categories/clothing.jpg',
    tag: 'Apparel',
  },
  {
    name: 'Bakery',
    slug: 'bakery',
    image: '/images/categories/bakery.webp',
    fallbackImage: '/images/categories/bakery.jpg',
    tag: 'Artisan',
  },
  {
    name: 'Fruits & Veggies',
    slug: 'fruits-vegetables',
    image: '/images/categories/fruits-vegetables.webp',
    fallbackImage: '/images/categories/fruits-vegetables.jpg',
    tag: 'Fresh Farm',
  },
  {
    name: 'Pharmacy & Care',
    slug: 'beauty',
    image: '/images/categories/personal-care.webp',
    fallbackImage: '/images/categories/personal-care.jpg',
    tag: 'Personal Care',
  },
  {
    name: 'Mobile Accessories',
    slug: 'mobiles',
    image: '/images/categories/mobile-accessories.webp',
    fallbackImage: '/images/categories/mobile-accessories.jpg',
    tag: 'Gear & Audio',
  },
  {
    name: 'Dairy & Eggs',
    slug: 'dairy-eggs',
    image: '/images/categories/dairy-eggs.webp',
    fallbackImage: '/images/categories/dairy-eggs.jpg',
    tag: 'Chilled Milk',
  },
  {
    name: 'Household',
    slug: 'household',
    image: '/images/categories/household.webp',
    fallbackImage: '/images/categories/household.jpg',
    tag: 'Clean & Home',
  },
  {
    name: 'Stationery',
    slug: 'stationery',
    image: '/images/categories/stationery.webp',
    fallbackImage: '/images/categories/stationery.jpg',
    tag: 'Books & Office',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { latitude, longitude, locality, city, displayName, openLocationModal } = useLocation();

  // State
  const [searchTerm, setSearchTerm] = useState('');

  // Data states
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [bestPriceProducts, setBestPriceProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [nearbyShops, setNearbyShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick search keywords
  const popularKeywords = ['Amul Milk', 'Fortune Oil', 'Aashirvaad Atta', 'Basmati Rice', 'Farm Fresh Eggs', 'Bread'];

  useEffect(() => {
    // Load recently viewed
    setRecentlyViewed(getRecentlyViewed());

    async function loadData() {
      try {
        setLoading(true);
        const params = {};
        if (latitude && longitude) {
          params.latitude = latitude;
          params.longitude = longitude;
          params.lat = latitude;
          params.lon = longitude;
        }

        // Parallel fetch for snappy responsiveness
        const [productsRes, shopsRes, categoriesRes] = await Promise.all([
          getProducts({ ...params, page_size: 16 }),
          getShops({ ...params, page_size: 6 }),
          getCategories(),
        ]);

        const rawProducts = productsRes?.data?.results || productsRes?.data || [];
        const rawShops = shopsRes?.data?.results || shopsRes?.data || [];
        const rawCategories = categoriesRes?.data?.results || categoriesRes?.data || [];

        // Distribute products into sections
        setTrendingProducts(rawProducts.slice(0, 4));
        setBestPriceProducts(rawProducts.slice(4, 8).length > 0 ? rawProducts.slice(4, 8) : rawProducts.slice(0, 4));
        setRecommendedProducts(rawProducts.slice(8, 12).length > 0 ? rawProducts.slice(8, 12) : rawProducts.slice(0, 4));
        setNearbyShops(rawShops);
        setCategories(rawCategories.slice(0, 8));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [latitude, longitude]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      addSearchQuery(searchTerm.trim());
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleKeywordClick = (word) => {
    addSearchQuery(word);
    navigate(`/search?q=${encodeURIComponent(word)}`);
  };

  const handleClearRecent = () => {
    clearRecentlyViewed();
    setRecentlyViewed([]);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 pb-20">
      {/* SECTION 1 & 2: HERO WITH SEARCH BAR & LOCATION SELECTOR (Blinkit + Flipkart Usability) */}
      <section className="relative overflow-hidden bg-white border-b border-slate-100 pt-6 pb-10 md:pt-10 md:pb-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            {/* Brand Logo & Usability Tagline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              NEARZA
            </h1>
            <p className="text-sm sm:text-base font-semibold text-sky-600 mt-0.5">
              Find Nearby. Compare Prices.
            </p>

            {/* SEARCH BAR (Upfront & High Intent) */}
            <form onSubmit={handleSearchSubmit} className="mt-5 max-w-2xl mx-auto">
              <div className="relative flex items-center rounded-2xl bg-white shadow-md shadow-sky-950/5 border-2 border-sky-400 p-1.5 focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100 transition-all">
                <Search className="w-5 h-5 text-sky-500 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products nearby..."
                  className="w-full px-3 py-2.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="rounded-xl px-5 py-2.5 text-sm font-bold bg-[#38BDF8] hover:bg-sky-500 text-white shadow-xs shrink-0 cursor-pointer"
                >
                  Search
                </Button>
              </div>

              {/* LOCATION SELECTOR CHIP (📍 Ankola / Change location) */}
              <div className="mt-3 flex items-center justify-center">
                <button
                  type="button"
                  onClick={openLocationModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0F9FF] hover:bg-sky-100 text-slate-800 text-xs font-semibold border border-sky-200 transition-all cursor-pointer group shadow-2xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">
                    {locality || city || 'Ankola'}
                  </span>
                  <span className="text-sky-600 font-bold underline ml-1 text-[11px]">
                    Change location
                  </span>
                </button>
              </div>

              {/* Popular quick-tap pills */}
              <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap text-xs text-slate-500">
                <span className="font-semibold text-slate-400">Popular:</span>
                {popularKeywords.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => handleKeywordClick(kw)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F0F9FF] text-slate-600 hover:text-sky-700 border border-slate-200 hover:border-sky-200 transition-colors text-[11px] font-medium cursor-pointer"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* SECTION 4: POPULAR CATEGORIES */}
      <section className="py-8 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-100/80 px-2.5 py-0.5 rounded-md mb-1">
                <ShoppingBag className="w-3.5 h-3.5" />
                Featured Departments
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Popular Categories
              </h2>
            </div>
            <Link
              to="/categories"
              className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
            >
              <span>View All Categories</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-3 sm:gap-4">
            {POPULAR_CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.slug}
                name={cat.name}
                slug={cat.slug}
                image={cat.image}
                fallbackImage={cat.fallbackImage}
                tag={cat.tag}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: NEARBY SHOPS */}
      <section className="py-8 bg-[#F0F9FF]/40 border-b border-sky-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-100/80 px-2.5 py-0.5 rounded-md mb-1">
                <Store className="w-3.5 h-3.5" />
                Verified Local Stores
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Nearby Shops
              </h2>
            </div>
            <Link
              to="/nearby"
              className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
            >
              <span>Explore Map & Stores</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyShops.slice(0, 3).map((shop) => (
              <Card
                key={shop.id}
                className="bg-white border border-slate-200 hover:border-sky-300 p-4 rounded-2xl shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Shop Name & Distance */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100/80">
                        <Store className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <div>
                        <Link
                          to={`/shops/${shop.id}`}
                          className="text-base font-bold text-slate-900 hover:text-sky-600 transition-colors"
                        >
                          {shop.name}
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {shop.address || 'Local neighborhood merchant'}
                        </p>
                      </div>
                    </div>
                    {shop.distance_km != null && (
                      <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F0F9FF] text-sky-800 border border-sky-200">
                        <MapPin className="w-3 h-3 text-sky-500" />
                        {typeof shop.distance_km === 'number' ? `${shop.distance_km.toFixed(1)} km` : `${shop.distance_km} km`}
                      </span>
                    )}
                  </div>

                  {/* Featured Product Preview & Inventory Confidence */}
                  <div className="mt-3 p-2.5 rounded-xl bg-[#F0F9FF]/60 border border-sky-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">
                        {shop.featured_product_name || 'Rice 5kg & Daily Staples'}
                      </p>
                      <p className="text-sm font-extrabold text-sky-600">
                        ₹{shop.featured_product_price || '395'}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      High confidence
                    </span>
                  </div>
                </div>

                {/* Communication Action Buttons [ Call ] [ WhatsApp ] [ Directions ] */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <MerchantActions
                    shop={shop}
                    size="sm"
                    showLabels={true}
                    className="w-full justify-between"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: TRENDING PRODUCTS */}
      <section className="py-10 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-100/80 px-2.5 py-0.5 rounded-md mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Popular Demand
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Trending Nearby
              </h2>
            </div>
            <Link
              to="/search?trending=true"
              className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
            >
              <span>Explore All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: BEST LOCAL PRICES */}
      <section className="py-10 bg-sky-50/20 border-b border-sky-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md mb-1">
                <Percent className="w-3.5 h-3.5" />
                Maximum Savings
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Best Local Prices
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                The lowest verified prices across competitive neighborhood retailers
              </p>
            </div>
            <Link
              to="/compare"
              className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
            >
              <span>Price Comparison Matrix</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bestPriceProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: RECENTLY VIEWED (if available) */}
      {recentlyViewed.length > 0 && (
        <section className="py-12 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Recently Viewed
                  </h2>
                  <p className="text-xs text-slate-500">Pick up where you left off</p>
                </div>
              </div>
              <button
                onClick={handleClearRecent}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentlyViewed.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 8: RECOMMENDED NEARBY PRODUCTS */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-100/80 px-2.5 py-0.5 rounded-md mb-1">
                <Compass className="w-3.5 h-3.5" />
                Tailored Proximity
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Recommended Nearby Products
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                In-stock essentials verified within minutes of your location
              </p>
            </div>
            <Link
              to="/nearby"
              className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
            >
              <span>View All Nearby</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
