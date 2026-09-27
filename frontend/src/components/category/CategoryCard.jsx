/**
 * Nearza — Category Card Component
 * Displays real photographic product visuals with robust fallback, lazy-loading,
 * accessible alt text, and interactive micro-animations. ZERO emojis.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export function CategoryCard({
  name,
  slug,
  image,
  fallbackImage,
  tag,
  productsCount,
  className = '',
}) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleImageError = (e) => {
    // If WebP fails, try fallback JPG first before falling back to neutral placeholder
    if (fallbackImage && e.target.src !== fallbackImage) {
      e.target.src = fallbackImage;
    } else {
      setImgError(true);
    }
  };

  return (
    <Link
      to={`/search?category=${encodeURIComponent(slug)}`}
      className={`group flex flex-col items-center p-3 rounded-2xl bg-white hover:bg-sky-50/50 border border-slate-200/80 hover:border-sky-300 hover:shadow-xs transition-all duration-200 text-center select-none ${className}`}
    >
      {/* Photographic Visual Container */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 border border-slate-100/90 flex items-center justify-center overflow-hidden mb-2 shadow-2xs group-hover:shadow-xs group-hover:scale-105 transition-all duration-200">
        {!imgError ? (
          <>
            {/* Shimmer placeholder before image loads */}
            {!imgLoaded && (
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-sky-50 animate-pulse" />
            )}
            <img
              src={image}
              alt={`${name} category products`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={handleImageError}
              className={`w-full h-full object-cover object-center transition-all duration-300 ${
                imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            />
          </>
        ) : (
          /* Neutral Fallback Container (Zero emojis) */
          <div className="w-full h-full flex items-center justify-center bg-sky-50 text-sky-500">
            <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
          </div>
        )}
      </div>

      {/* Category Labels */}
      <span className="text-xs sm:text-[13px] font-bold text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-1">
        {name}
      </span>

      <span className="text-[10px] text-slate-400 group-hover:text-sky-500 font-medium mt-0.5 transition-colors">
        {productsCount !== undefined ? `${productsCount} items` : tag || 'Explore →'}
      </span>
    </Link>
  );
}

export default CategoryCard;
