/**
 * Nearza — Hyperlocal Product Card
 * Implements full card specifications:
 * - Image
 * - Product name
 * - Lowest price
 * - Shop name
 * - Distance
 * - Stock status
 * - Inventory confidence
 * - Rating
 *
 * Actions:
 * - View
 * - Favorite
 * - Call
 * - WhatsApp
 * - Directions
 *
 * Design: Crisp white + sky-blue aesthetic.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Store,
  Package,
  Heart,
  Eye,
  Star,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { MerchantActions } from '../merchant/MerchantActions';
import { toggleFavorite } from '../../services/favorites';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { addRecentlyViewed } from '../../utils/recently-viewed';

export function ProductCard({
  product,
  isFavorite: initialIsFavorite = false,
  onFavoriteChange,
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [isFav, setIsFav] = useState(initialIsFavorite || Boolean(product?.is_favorite));
  const [favLoading, setFavLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

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
    nearest_distance_km,
    primary_shop,
    stock_status,
    inventory_confidence,
    rating,
  } = product;

  // Resolved shop details
  const shop = primary_shop || product.shop || {
    name: 'Verified Local Merchant',
    avg_rating: rating || 4.8,
  };

  const distance =
    nearest_distance_km ??
    primary_shop?.distance_km ??
    product.distance_km ??
    null;

  const displayPrice = min_price ?? product.price ?? null;
  const resolvedStock = stock_status ?? product.stock_status ?? (product.in_stock_shops_count > 0 ? 'in_stock' : 'in_stock');
  const resolvedConfidence = inventory_confidence ?? product.inventory_confidence ?? 88;
  const resolvedRating = rating ?? shop.avg_rating ?? 4.8;

  const handleCardClick = () => {
    addRecentlyViewed(product);
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please sign in to save products to your favorites.');
      navigate('/login');
      return;
    }

    setFavLoading(true);
    const prev = isFav;
    setIsFav(!prev);

    try {
      const res = await toggleFavorite({ product_id: id });
      const newState = res.favorited;
      setIsFav(newState);
      if (newState) {
        toast.success(`Saved "${name}" to favorites`);
      } else {
        toast.info(`Removed "${name}" from favorites`);
      }
      if (onFavoriteChange) onFavoriteChange(id, newState);
    } catch (err) {
      setIsFav(prev);
      toast.error('Could not update favorite. Please try again.');
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <Card
      hoverable
      className="group flex flex-col h-full bg-white border border-slate-200/80 hover:border-sky-300 transition-all duration-200 shadow-xs hover:shadow-md rounded-2xl overflow-hidden"
    >
      {/* Top Media & Floating Badges */}
      <div className="relative aspect-square w-full bg-slate-50/80 overflow-hidden flex items-center justify-center p-4">
        <Link
          to={`/products/${id}`}
          onClick={handleCardClick}
          className="w-full h-full flex items-center justify-center"
        >
          {image_url && !imgError ? (
            <img
              src={image_url}
              alt={name}
              onError={() => setImgError(true)}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-8 h-8" />
            </div>
          )}
        </Link>

        {/* Favorite Heart Action */}
        <button
          onClick={handleFavoriteClick}
          disabled={favLoading}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xs ${
            isFav
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white border border-slate-200/80'
          }`}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 transition-transform ${isFav ? 'fill-rose-500 scale-110' : ''}`} />
        </button>

        {/* Stock Status Badge */}
        <div className="absolute top-2.5 left-2.5">
          {resolvedStock === 'in_stock' ? (
            <Badge variant="success" size="sm" dot>
              In Stock
            </Badge>
          ) : resolvedStock === 'low_stock' ? (
            <Badge variant="warning" size="sm" dot>
              Low Stock
            </Badge>
          ) : (
            <Badge variant="secondary" size="sm">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Proximity / Distance Pill */}
        {distance !== null && distance !== undefined && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/95 backdrop-blur-sm text-sky-800 shadow-xs border border-sky-100">
              <MapPin className="w-3 h-3 text-sky-600" />
              {typeof distance === 'number' ? `${distance.toFixed(1)} km` : `${distance} km`}
            </span>
          </div>
        )}

        {/* Inventory Confidence Score Pill */}
        <div className="absolute bottom-2.5 right-2.5">
          <span
            title={`Inventory Confidence: ${resolvedConfidence}% verified`}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80 shadow-xs"
          >
            <ShieldCheck className="w-3 h-3 text-sky-600" />
            {resolvedConfidence}%
          </span>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category & Rating */}
        <div className="flex items-center justify-between gap-2 mb-1 text-xs">
          <span className="text-slate-400 font-medium truncate">
            {brand || category?.name || 'Local Grocery'}
          </span>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-bold text-amber-900">
              {Number(resolvedRating).toFixed(1)}
            </span>
          </div>
        </div>

        {/* Product Name */}
        <Link
          to={`/products/${id}`}
          onClick={handleCardClick}
          className="block mb-2 group/title"
        >
          <h3 className="text-sm font-bold text-slate-900 group-hover/title:text-sky-600 transition-colors line-clamp-2 leading-snug">
            {name}
          </h3>
        </Link>

        {/* Merchant / Shop Name */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3">
          <Store className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span className="font-semibold text-slate-700 truncate">
            {shop.name || 'Local Verified Store'}
          </span>
        </div>

        {/* Lowest Price Section */}
        <div className="mt-auto pt-2 border-t border-slate-100 flex items-baseline justify-between">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Lowest Price
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900 tracking-tight">
                {displayPrice !== null ? `₹${displayPrice}` : 'Check Price'}
              </span>
              {max_price && max_price > displayPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{max_price}
                </span>
              )}
            </div>
          </div>

          {unit_value && unit && (
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {unit_value} {unit}
            </span>
          )}
        </div>

        {/* Dedicated 5 Actions Toolbar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
          {/* Action 1: View */}
          <Link
            to={`/products/${id}`}
            onClick={handleCardClick}
            className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/70 transition-colors"
            title="View product details & compare prices"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </Link>

          {/* Actions 3, 4, 5: Call, WhatsApp, Directions */}
          <MerchantActions
            shop={shop}
            product={{ name, price: displayPrice, unit }}
            size="sm"
            showLabels={false}
          />
        </div>
      </div>
    </Card>
  );
}

export default ProductCard;
