/**
 * Nearza — Recently Viewed Products Storage
 */

const RECENTLY_VIEWED_KEY = 'nearza_recently_viewed';
const MAX_RECENT = 12;

export function getRecentlyViewed() {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(product) {
  if (!product || !product.id) return;

  try {
    const items = getRecentlyViewed();
    const filtered = items.filter((p) => p.id !== product.id);

    // Save compact representation
    const record = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      category: product.category,
      image_url: product.image_url,
      min_price: product.min_price,
      max_price: product.max_price,
      nearest_distance_km: product.nearest_distance_km,
      primary_shop: product.primary_shop || (product.shop_offerings?.[0]?.shop ? {
        id: product.shop_offerings[0].shop.id,
        name: product.shop_offerings[0].shop.name,
        phone: product.shop_offerings[0].shop.phone,
        whatsapp_number: product.shop_offerings[0].shop.whatsapp_number,
        avg_rating: product.shop_offerings[0].shop.avg_rating,
        latitude: product.shop_offerings[0].shop.latitude,
        longitude: product.shop_offerings[0].shop.longitude,
      } : null),
      stock_status: product.stock_status || product.shop_offerings?.[0]?.stock_status || 'in_stock',
      inventory_confidence: product.inventory_confidence || product.shop_offerings?.[0]?.inventory_confidence || 85,
      rating: product.rating || 4.8,
      viewed_at: new Date().toISOString(),
    };

    const updated = [record, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save recently viewed item:', err);
    return [];
  }
}

export function clearRecentlyViewed() {
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
    return [];
  } catch {
    return [];
  }
}
