/**
 * Nearza — Product Detail & Multi-Shop Price Comparison Page
 * Displays product specs, verified shops selling this item, prices, stock,
 * quantity, inventory confidence scores, and direct merchant contact options.
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Store,
  MapPin,
  Phone,
  MessageSquare,
  ShieldCheck,
  TrendingDown,
  ArrowUpDown,
  AlertCircle,
  Clock,
  Star,
  Share2,
} from 'lucide-react';
import { productsService } from '../services/products';
import { useLocation } from '../contexts/LocationContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { MerchantActions } from '../components/merchant/MerchantActions';
import { trackEvent } from '../services/merchant';
import { addRecentlyViewed } from '../utils/recently-viewed';

export function ProductDetailPage() {
  const { id } = useParams();
  const { latitude, longitude } = useLocation();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [shopOfferings, setShopOfferings] = useState([]);
  const [sortOfferingsBy, setSortOfferingsBy] = useState('price'); // 'price' | 'distance'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadProduct() {
      setError(null);
      try {
        const params = {
          sort: sortOfferingsBy,
        };
        if (latitude && longitude) {
          params.latitude = latitude;
          params.longitude = longitude;
          params.lat = latitude;
          params.lon = longitude;
        }

        const data = await productsService.getProduct(id, params);
        if (active) {
          setProduct(data);
          setShopOfferings(data.shop_offerings || []);
          addRecentlyViewed(data);
          if (data?.id) {
            trackEvent({ event_type: 'product_view', product_id: data.id });
          }
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load product details.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    loadProduct();
    return () => {
      active = false;
    };
  }, [id, sortOfferingsBy, latitude, longitude]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Compare prices for ${product?.name} on Nearza!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="w-full aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4 rounded-lg" />
            <Skeleton className="h-10 w-3/4 rounded-xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">{error || 'This product listing may be discontinued.'}</p>
        <Button variant="primary" as={Link} to="/search">
          Browse Other Products
        </Button>
      </div>
    );
  }

  const {
    name,
    brand,
    category,
    image_url,
    unit,
    unit_value,
    min_price,
    max_price,
    price_difference,
    description,
  } = product;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link to="/" className="hover:text-sky-600 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/search" className="hover:text-sky-600 transition-colors">Products</Link>
        {category && (
          <>
            <span>/</span>
            <Link to={`/search?category=${category.slug}`} className="hover:text-sky-600 transition-colors">
              {category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-700 font-medium truncate max-w-[200px]">{name}</span>
      </nav>

      {/* Top Product Hero & Price Range Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Product Visual */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm aspect-square flex items-center justify-center relative overflow-hidden">
            {image_url && !imgError ? (
              <img
                src={image_url}
                alt={name}
                onError={() => setImgError(true)}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-sky-50 text-sky-400 flex items-center justify-center">
                <Package className="w-12 h-12" />
              </div>
            )}

            <button
              onClick={handleShare}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition-colors cursor-pointer"
              title="Share product"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Product Meta & Highlights */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {brand && <Badge variant="secondary" size="sm">{brand}</Badge>}
              {category && <Badge variant="sky" size="sm">{category.name}</Badge>}
              {unit_value && unit && (
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {unit_value} {unit}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug mb-3">
              {name}
            </h1>

            {description && (
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {description}
              </p>
            )}

            {/* Price Comparison Callout Box */}
            <Card variant="secondary" className="p-6 border-sky-100/80 bg-gradient-to-r from-sky-50/80 via-white to-sky-50/80 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Lowest Local Price
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-sky-600 tracking-tight">
                      {min_price !== null && min_price !== undefined ? `₹${min_price}` : 'Unlisted'}
                    </span>
                    {max_price && min_price !== max_price && (
                      <span className="text-sm font-semibold text-slate-400 line-through">
                        Up to ₹{max_price}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Available across {shopOfferings.length} local merchant {shopOfferings.length === 1 ? 'store' : 'stores'}
                  </p>
                </div>

                {price_difference > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 px-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                        Potential Savings
                      </span>
                      <span className="text-sm font-extrabold text-emerald-600">
                        Save up to ₹{price_difference}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 pt-4 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              Verified merchant prices
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-600" />
              Updated continuously
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Shop Price Comparison Matrix Section */}
      <section className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Nearby Shop Comparison
              </h2>
              <Badge variant="sky" size="sm">{shopOfferings.length} Offers</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Check live pricing, stock availability, and inventory confidence at nearby stores
            </p>
          </div>

          {/* Sort Switcher & Full Comparison Matrix Link */}
          <div className="flex items-center gap-3">
            <Link
              to={`/compare?product_id=${id}`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 transition-colors"
            >
              <span>Full Comparison Matrix</span>
              <span className="text-sky-500">→</span>
            </Link>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Rank by:</span>
              <select
                value={sortOfferingsBy}
                onChange={(e) => setSortOfferingsBy(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="price">Cheapest First</option>
                <option value="distance">Nearest Distance</option>
              </select>
            </div>
          </div>
        </div>

        {shopOfferings.length === 0 ? (
          <Card className="p-12 text-center bg-white border-slate-100">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">No local stores stocking this item yet</h3>
            <p className="text-xs text-slate-400">
              Check back soon as more nearby stores update their inventory.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {shopOfferings.map((offering, idx) => {
              const { shop, price, quantity, stock_status, inventory_confidence } = offering;
              const isBestPrice = idx === 0 && sortOfferingsBy === 'price';

              // Confidence badge color mapping
              const confidenceMap = {
                high: { variant: 'success', label: 'High Confidence (<24h)' },
                medium: { variant: 'warning', label: 'Medium Confidence' },
                low: { variant: 'secondary', label: 'Low Confidence' },
              }[inventory_confidence] || { variant: 'secondary', label: 'Verified' };

              return (
                <Card
                  key={offering.id}
                  className={`p-5 transition-all bg-white border ${
                    isBestPrice
                      ? 'border-sky-300 ring-2 ring-sky-400/10 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Shop Info & Rank */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Link
                            to={`/shops/${shop.id}`}
                            className="font-bold text-base text-slate-900 hover:text-sky-600 transition-colors"
                          >
                            {shop.name}
                          </Link>
                          {isBestPrice && (
                            <Badge variant="solid" size="sm">Best Price</Badge>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 mb-2 truncate">
                          {shop.address}, {shop.city}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {(() => {
                            let effectiveDistance = shop.distance_km;
                            if (
                              (effectiveDistance === null || effectiveDistance === undefined) &&
                              latitude &&
                              longitude &&
                              shop.latitude &&
                              shop.longitude
                            ) {
                              const R = 6371;
                              const dLat = (shop.latitude - latitude) * (Math.PI / 180);
                              const dLng = (shop.longitude - longitude) * (Math.PI / 180);
                              const a =
                                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                Math.cos(latitude * (Math.PI / 180)) *
                                  Math.cos(shop.latitude * (Math.PI / 180)) *
                                  Math.sin(dLng / 2) *
                                  Math.sin(dLng / 2);
                              effectiveDistance = (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
                            }

                            if (effectiveDistance !== null && effectiveDistance !== undefined) {
                              return (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                  <MapPin className="w-3 h-3 text-sky-600" />
                                  {effectiveDistance} km away
                                </span>
                              );
                            }
                            return null;
                          })()}

                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {Number(shop.avg_rating).toFixed(1)}
                          </span>

                          <Badge variant={confidenceMap.variant} size="sm" dot>
                            {confidenceMap.label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Price & Stock Meta */}
                    <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-left lg:text-right">
                        <span className="text-2xl font-black text-slate-900 block leading-tight">
                          ₹{price}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              stock_status === 'in_stock'
                                ? 'bg-emerald-500'
                                : stock_status === 'low_stock'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          <span className="text-[11px] font-semibold text-slate-600 capitalize">
                            {stock_status.replace('_', ' ')} ({quantity} left)
                          </span>
                        </div>
                      </div>

                      {/* Direct Merchant Connect Buttons: Call, WhatsApp, Directions */}
                      <MerchantActions
                        shop={shop}
                        product={{ name, price, unit }}
                        size="sm"
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default ProductDetailPage;
