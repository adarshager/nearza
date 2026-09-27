/**
 * Nearza — Customer Favorites Page
 * Displays customer's saved products and saved neighborhood shops.
 * Design: White + sky-blue aesthetic.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Store, Package, MapPin, ArrowRight, Star, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import ProductCard from '../components/product/ProductCard';
import { MerchantActions } from '../components/merchant/MerchantActions';
import { getFavorites, toggleFavorite } from '../services/favorites';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { useToast } from '../contexts/ToastContext';

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth();
  const { latitude, longitude } = useLocation();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'shops'
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [favoriteShops, setFavoriteShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const params = {};
        if (latitude && longitude) {
          params.latitude = latitude;
          params.longitude = longitude;
          params.lat = latitude;
          params.lon = longitude;
        }

        const res = await getFavorites(params);
        const items = res?.results || [];

        const prods = [];
        const shops = [];

        items.forEach((item) => {
          if (item.favorite_type === 'product' && item.product) {
            prods.push({ ...item.product, is_favorite: true, favorite_id: item.id });
          } else if (item.favorite_type === 'shop' && item.shop) {
            shops.push({ ...item.shop, is_favorite: true, favorite_id: item.id });
          }
        });

        setFavoriteProducts(prods);
        setFavoriteShops(shops);
      } catch (err) {
        console.error('Failed to load favorites:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [isAuthenticated, latitude, longitude]);

  const handleProductFavoriteChange = (productId, newState) => {
    if (!newState) {
      setFavoriteProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  const handleRemoveShopFavorite = async (shopId, shopName) => {
    try {
      await toggleFavorite({ shop_id: shopId });
      setFavoriteShops((prev) => prev.filter((s) => s.id !== shopId));
      toast.info(`Removed "${shopName}" from favorites`);
    } catch {
      toast.error('Failed to remove shop from favorites.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 bg-slate-50/50">
        <Card className="max-w-md w-full bg-white p-8 rounded-3xl text-center shadow-xs border border-sky-100">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 fill-rose-500/20" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Save Your Favorites</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Sign in to track your preferred local shops, bookmark essential items, and get notified of neighborhood price drops.
          </p>
          <div className="flex flex-col gap-2.5">
            <Button variant="primary" as={Link} to="/login" fullWidth>
              Sign In to View Favorites
            </Button>
            <Button variant="ghost" as={Link} to="/" fullWidth>
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-sky-50/60 to-white border-b border-sky-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                My Favorites
              </h1>
              <p className="text-xs text-slate-500">
                Quick access to your bookmarked products and trusted local shops
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mt-6">
            <button
              onClick={() => setActiveTab('products')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Saved Products</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {favoriteProducts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('shops')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'shops'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Saved Stores</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${activeTab === 'shops' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {favoriteShops.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading your favorites...</p>
          </div>
        ) : activeTab === 'products' ? (
          favoriteProducts.length === 0 ? (
            <div className="p-16 text-center bg-slate-50/50 rounded-3xl border border-slate-200/60 max-w-lg mx-auto">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No saved products yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Click the heart icon on any product card to save it here for quick price tracking.
              </p>
              <Button variant="primary" as={Link} to="/search">
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {favoriteProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={true}
                  onFavoriteChange={handleProductFavoriteChange}
                />
              ))}
            </div>
          )
        ) : (
          favoriteShops.length === 0 ? (
            <div className="p-16 text-center bg-slate-50/50 rounded-3xl border border-slate-200/60 max-w-lg mx-auto">
              <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No saved stores yet</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Save your favorite local neighborhood merchants for quick call, WhatsApp, and inventory check.
              </p>
              <Button variant="primary" as={Link} to="/nearby">
                Discover Nearby Stores
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteShops.map((shop) => (
                <Card
                  key={shop.id}
                  className="bg-white border border-slate-200/80 hover:border-sky-300 p-5 rounded-2xl shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          to={`/shops/${shop.id}`}
                          className="text-base font-bold text-slate-900 hover:text-sky-600 transition-colors truncate block"
                        >
                          {shop.name}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {shop.address || 'Local verified store'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemoveShopFavorite(shop.id, shop.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-600 flex-wrap">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {shop.avg_rating || '4.8'}
                      </span>
                      {shop.distance_km != null && (
                        <span className="inline-flex items-center gap-1 font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                          <MapPin className="w-3 h-3 text-sky-600" />
                          {typeof shop.distance_km === 'number'
                            ? `${shop.distance_km.toFixed(1)} km`
                            : `${shop.distance_km} km`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`/shops/${shop.id}`}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700"
                    >
                      Store Catalog →
                    </Link>
                    <MerchantActions shop={shop} size="sm" showLabels={false} />
                  </div>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
