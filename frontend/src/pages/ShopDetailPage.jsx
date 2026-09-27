/**
 * Nearza — Shop Detail & In-Store Inventory Catalog Page
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  Phone,
  MessageSquare,
  Star,
  Package,
  Search,
  AlertCircle,
} from 'lucide-react';
import { shopsService } from '../services/shops';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { MerchantActions } from '../components/merchant/MerchantActions';
import { trackEvent } from '../services/merchant';

export function ShopDetailPage() {
  const { id } = useParams();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadShopData() {
      setError(null);
      try {
        const [shopData, productsData] = await Promise.all([
          shopsService.getShop(id),
          shopsService.getShopProducts(id, {
            q: searchQuery.trim() || undefined,
            in_stock_only: inStockOnly ? 'true' : undefined,
          }),
        ]);
        if (active) {
          setShop(shopData);
          setProducts(productsData.results || productsData.data || productsData);
          if (shopData?.id) {
            trackEvent({ event_type: 'shop_view', shop_id: shopData.id });
          }
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load shop details.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadShopData();
    return () => {
      active = false;
    };
  }, [id, searchQuery, inStockOnly]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Shop Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">{error || 'This store listing could not be found.'}</p>
        <Button variant="primary" as={Link} to="/shops">
          Browse All Stores
        </Button>
      </div>
    );
  }

  const {
    name,
    address,
    city,
    state,
    pincode,
    phone,
    whatsapp_number,
    logo_url,
    cover_image_url,
    description,
    avg_rating,
    total_reviews,
    verification_status,
  } = shop;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12">
      {/* Shop Profile Banner Card */}
      <Card className="p-6 sm:p-8 bg-white border-slate-100 shadow-sm mb-8 overflow-hidden">
        {cover_image_url ? (
          <div className="w-full h-44 sm:h-60 rounded-2xl overflow-hidden mb-6 bg-slate-100 border border-slate-100 relative">
            <img
              src={cover_image_url}
              alt={`${name} cover`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.parentElement.style.display = 'none';
              }}
            />
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 overflow-hidden relative">
              {logo_url ? (
                <img
                  src={logo_url}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : null}
              <Store className={`w-8 h-8 ${logo_url ? '' : ''}`} />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {name}
                </h1>
                {verification_status === 'approved' && (
                  <Badge variant="sky" size="sm" dot>
                    Verified Store
                  </Badge>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                {address}, {city}, {state} - {pincode}
              </p>

              {description && (
                <p className="text-xs text-slate-600 mt-2 max-w-xl">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Contact & Review Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200/60">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{avg_rating > 0 ? Number(avg_rating).toFixed(1) : 'New'}</span>
              <span className="text-slate-400 font-normal">({total_reviews} reviews)</span>
            </div>

            <MerchantActions shop={shop} variant="hero" size="md" />
          </div>
        </div>
      </Card>

      {/* In-Store Product Inventory Section */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Products in this Store
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Current in-store inventory and prices published by {name}
            </p>
          </div>

          {/* Search within store */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search this store..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 w-44 sm:w-60"
              />
            </div>

            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-sky-600"
              />
              <span>In Stock</span>
            </label>
          </div>
        </div>

        {products.length === 0 ? (
          <Card className="p-12 text-center bg-white border-slate-100">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">No products found</h3>
            <p className="text-xs text-slate-400">
              This store hasn’t cataloged items matching your search.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((item) => {
              const prod = item.product || item;
              return (
                <Card
                  key={item.id}
                  hoverable
                  className="bg-white border-slate-100 p-4 flex flex-col justify-between"
                >
                  <Link to={`/products/${prod.id || prod.slug}`}>
                    <div className="w-full aspect-square rounded-xl bg-slate-50 mb-3 flex items-center justify-center p-3 overflow-hidden">
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
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : null}
                      <div
                        className="w-8 h-8 text-sky-400 items-center justify-center"
                        style={{ display: prod.image_url ? 'none' : 'flex' }}
                      >
                        <Package className="w-8 h-8" />
                      </div>
                    </div>

                    <div className="mb-2">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">{prod.brand || 'Store Item'}</span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5">{prod.name}</h4>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between mb-3">
                      <span className="text-base font-extrabold text-slate-900">₹{item.price}</span>
                      <Badge
                        variant={item.stock_status === 'in_stock' ? 'success' : 'secondary'}
                        size="sm"
                      >
                        {item.stock_status === 'in_stock' ? 'In Stock' : 'Out'}
                      </Badge>
                    </div>
                  </Link>

                  <div className="pt-2 border-t border-slate-50 flex items-center justify-end">
                    <MerchantActions
                      shop={shop}
                      product={{ name: prod.name, price: item.price }}
                      size="sm"
                    />
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

export default ShopDetailPage;
