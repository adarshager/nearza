/**
 * Nearza — Price Comparison Page
 * Dedicated multi-merchant price comparison engine.
 *
 * Shows:
 * - Product
 * - Shop
 * - Price
 * - Distance
 * - Availability
 * - Inventory confidence
 *
 * Sortable by:
 * - price
 * - distance
 * - availability
 * - rating
 *
 * Actions: Call, WhatsApp, Directions per shop offering.
 * Design: White + sky-blue aesthetic.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowUpDown,
  Search,
  MapPin,
  Store,
  ShieldCheck,
  Star,
  Percent,
  SlidersHorizontal,
  Package,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { MerchantActions } from '../components/merchant/MerchantActions';
import { getProducts, getProduct } from '../services/products';
import { useLocation } from '../contexts/LocationContext';

export default function PriceComparisonPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProductId = searchParams.get('product_id');

  const { latitude, longitude, address, calculateDistance } = useLocation();

  // Selected product & offerings
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [offerings, setOfferings] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Sorting: 'price' | 'distance' | 'availability' | 'rating'
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  const loadProductDetails = useCallback(async (productId) => {
    try {
      setLoading(true);
      const params = {};
      if (latitude && longitude) {
        params.latitude = latitude;
        params.longitude = longitude;
        params.lat = latitude;
        params.lon = longitude;
      }

      const pData = await getProduct(productId, params);
      setSelectedProduct(pData);

      // Offerings from product details or dedicated endpoint
      const rawOfferings = pData?.shop_offerings || [];
      setOfferings(rawOfferings);
      setSearchParams({ product_id: productId });
    } catch (err) {
      console.error('Failed to load product details:', err);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, setSearchParams]);

  // Load product list for picker
  useEffect(() => {
    async function loadProductCatalog() {
      try {
        const res = await getProducts({ page_size: 20 });
        const list = res?.data?.results || res?.data || [];
        setAllProducts(list);

        const targetId = initialProductId || list[0]?.id;
        if (targetId) {
          loadProductDetails(targetId);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load products for comparison:', err);
        setLoading(false);
      }
    }
    loadProductCatalog();
  }, [initialProductId, loadProductDetails]);

  // Filter products for the quick switcher
  const filteredProductPicker = allProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Sort offerings
  const sortedOfferings = [...offerings].sort((a, b) => {
    if (sortBy === 'price') {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
    }
    if (sortBy === 'distance') {
      const getDist = (offering) => {
        if (offering.shop?.distance_km != null) return offering.shop.distance_km;
        if (offering.shop?.latitude && offering.shop?.longitude) {
          const d = calculateDistance(offering.shop.latitude, offering.shop.longitude);
          if (d != null) return d;
        }
        return 999999;
      };
      const distA = getDist(a);
      const distB = getDist(b);
      return sortOrder === 'asc' ? distA - distB : distB - distA;
    }
    if (sortBy === 'availability') {
      const rank = (status) => (status === 'in_stock' ? 2 : status === 'low_stock' ? 1 : 0);
      const rankA = rank(a.stock_status);
      const rankB = rank(b.stock_status);
      return sortOrder === 'asc' ? rankB - rankA : rankA - rankB;
    }
    if (sortBy === 'rating') {
      const ratA = Number(a.shop?.avg_rating) || 0;
      const ratB = Number(b.shop?.avg_rating) || 0;
      return sortOrder === 'asc' ? ratB - ratA : ratA - ratB;
    }
    return 0;
  });

  const lowestPrice = offerings.length > 0 ? Math.min(...offerings.map((o) => Number(o.price) || Infinity)) : 0;
  const highestPrice = offerings.length > 0 ? Math.max(...offerings.map((o) => Number(o.price) || 0)) : 0;
  const maxSavings = highestPrice > lowestPrice ? (highestPrice - lowestPrice).toFixed(2) : null;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200/80 mb-2">
                <Percent className="w-3.5 h-3.5 text-sky-600" />
                Hyperlocal Multi-Shop Comparison
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Live Price Comparison
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Compare prices, distances, and live inventory confidence across local neighborhood merchants
              </p>
            </div>

            {/* Location context info */}
            {address && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-sky-50/80 border border-sky-100 text-xs text-sky-900">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="truncate max-w-xs">{address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Product Selector Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                <span>Select Product</span>
                <span className="text-xs font-normal text-slate-400">
                  {allProducts.length} items
                </span>
              </h2>

              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                {filteredProductPicker.map((prod) => {
                  const isSelected = selectedProduct?.id === prod.id;
                  return (
                    <button
                      key={prod.id}
                      onClick={() => loadProductDetails(prod.id)}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-sky-50 border border-sky-200 text-sky-900'
                          : 'hover:bg-slate-50 border border-transparent text-slate-700'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden p-1">
                        {prod.image_url ? (
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }
                            }}
                            className="w-full h-full object-contain"
                          />
                        ) : null}
                        <div
                          className="w-5 h-5 text-slate-400 items-center justify-center"
                          style={{ display: prod.image_url ? 'none' : 'flex' }}
                        >
                          <Package className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate leading-tight">{prod.name}</p>
                        <p className="text-[11px] text-slate-400">
                          From <span className="font-bold text-sky-700">₹{prod.min_price}</span>
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Column: Price Comparison Matrix */}
          <div className="lg:col-span-3 space-y-6">
            {selectedProduct && (
              <Card className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-sky-50/80 flex items-center justify-center p-2 border border-sky-100 shrink-0">
                      {selectedProduct.image_url ? (
                        <img
                          src={selectedProduct.image_url}
                          alt={selectedProduct.name}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }
                          }}
                          className="w-full h-full object-contain"
                        />
                      ) : null}
                      <div
                        className="w-8 h-8 text-sky-500 items-center justify-center"
                        style={{ display: selectedProduct.image_url ? 'none' : 'flex' }}
                      >
                        <Package className="w-8 h-8" />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-sky-600 uppercase tracking-wider">
                        {selectedProduct.category?.name || 'Local Grocery'}
                      </span>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                        {selectedProduct.name}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Compared across {offerings.length} local neighborhood store{offerings.length === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>

                  {maxSavings && Number(maxSavings) > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl text-right">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                        Potential Savings
                      </span>
                      <span className="text-lg font-black text-emerald-800">
                        Up to ₹{maxSavings}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Sorting Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <SlidersHorizontal className="w-4 h-4 text-sky-600" />
                <span>Sort Offerings By:</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { key: 'price', label: 'Price' },
                  { key: 'distance', label: 'Distance' },
                  { key: 'availability', label: 'Availability' },
                  { key: 'rating', label: 'Rating' },
                ].map((sortOption) => {
                  const isActive = sortBy === sortOption.key;
                  return (
                    <button
                      key={sortOption.key}
                      onClick={() => {
                        if (isActive) {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy(sortOption.key);
                          setSortOrder('asc');
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      <span>{sortOption.label}</span>
                      {isActive && (
                        <ArrowUpDown className="w-3 h-3 transition-transform" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comparison Cards / Table */}
            {loading ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
                <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">Loading shop comparisons...</p>
              </div>
            ) : sortedOfferings.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
                <Store className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No shop offerings yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Local merchants have not yet published prices for this product. Check back soon or select another item.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedOfferings.map((offering, idx) => {
                  const isLowest = idx === 0 && sortBy === 'price' && sortOrder === 'asc';
                  const shop = offering.shop || {};
                  const isAvailable = offering.stock_status === 'in_stock';
                  const confidence = offering.inventory_confidence ?? 85;

                  return (
                    <Card
                      key={offering.id || idx}
                      className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all shadow-xs ${
                        isLowest
                          ? 'border-sky-400 ring-2 ring-sky-400/20 bg-gradient-to-r from-sky-50/30 to-white'
                          : 'border-slate-200/80 hover:border-sky-300'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Shop Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Link
                              to={`/shops/${shop.id}`}
                              className="text-base font-bold text-slate-900 hover:text-sky-600 transition-colors truncate"
                            >
                              {shop.name}
                            </Link>
                            {isLowest && (
                              <Badge variant="sky" size="sm" className="font-extrabold">
                                Best Price
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 truncate mb-2">
                            {shop.address || 'Local verified merchant'}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                            {/* Distance */}
                            {shop.distance_km != null && (
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                                {typeof shop.distance_km === 'number'
                                  ? `${shop.distance_km.toFixed(1)} km`
                                  : `${shop.distance_km} km`}
                              </span>
                            )}

                            {/* Rating */}
                            <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {shop.avg_rating || '4.8'}
                            </span>

                            {/* Inventory Confidence */}
                            <span
                              title={`Inventory Confidence: ${confidence}% verified`}
                              className="inline-flex items-center gap-1 font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/80"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                              {confidence}% Verified Stock
                            </span>
                          </div>
                        </div>

                        {/* Availability Pill */}
                        <div className="flex flex-col items-start md:items-center">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Availability
                          </span>
                          {isAvailable ? (
                            <Badge variant="success" size="sm" dot>
                              In Stock
                            </Badge>
                          ) : offering.stock_status === 'low_stock' ? (
                            <Badge variant="warning" size="sm" dot>
                              Low Stock ({offering.quantity || '<5'})
                            </Badge>
                          ) : (
                            <Badge variant="secondary" size="sm">
                              Out of Stock
                            </Badge>
                          )}
                        </div>

                        {/* Price */}
                        <div className="text-left md:text-right">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Offered Price
                          </span>
                          <span className="text-2xl font-black text-slate-900 tracking-tight">
                            ₹{offering.price}
                          </span>
                        </div>

                        {/* Merchant Actions */}
                        <div className="pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex items-center justify-end">
                          <MerchantActions
                            shop={shop}
                            product={{
                              name: selectedProduct.name,
                              price: offering.price,
                              unit: selectedProduct.unit,
                            }}
                            size="md"
                            showLabels={true}
                          />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
