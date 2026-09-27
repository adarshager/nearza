/**
 * Nearza — Hyperlocal Shop Card Component
 * Highlights merchant identity, verification, live distance, and direct contact.
 */

import { Link } from 'react-router-dom';
import { Store, MapPin, Star, CheckCircle, Package } from 'lucide-react';
import { Card } from '../ui/Card';
import { MerchantActions } from '../merchant/MerchantActions';

export function ShopCard({ shop }) {
  const {
    id,
    name,
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
  } = shop;

  const isVerified = verification_status === 'approved';

  return (
    <Card hoverable className="group bg-white border border-slate-100 p-5 flex flex-col justify-between h-full">
      <div>
        {/* Top Header with Avatar & Status */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 overflow-hidden">
            {logo_url ? (
              <img src={logo_url} alt={name} className="w-full h-full object-cover" />
            ) : (
              <Store className="w-6 h-6" />
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
        </div>

        {/* Badges Bar: Distance, Rating, Products */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          {distance_km !== null && distance_km !== undefined && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              <MapPin className="w-3 h-3 text-sky-600" />
              {distance_km} km
            </span>
          )}

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

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/shops/${id}`}
          className="text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors"
        >
          View Shop Products →
        </Link>

        <MerchantActions shop={shop} size="sm" />
      </div>
    </Card>
  );
}

export default ShopCard;
