/**
 * Nearza — Formatting Utilities
 * Currency, distance, dates, inventory confidence.
 */

/**
 * Format price in INR.
 * @param {number} price
 * @returns {string}
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Format distance in km/m.
 * @param {number} km - Distance in kilometers
 * @returns {string}
 */
export function formatDistance(km) {
  if (km == null) return 'N/A';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/**
 * Format date relative (e.g., "2 hours ago", "3 days ago").
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/**
 * Get inventory confidence label and class from a last_updated timestamp.
 * @param {string|Date} lastUpdated
 * @returns {{ label: string, className: string, level: string }}
 */
export function getInventoryConfidence(lastUpdated) {
  const now = new Date();
  const updated = new Date(lastUpdated);
  const diffDays = (now - updated) / (1000 * 60 * 60 * 24);

  if (diffDays < 1) {
    return { label: 'High', className: 'inventory-high', level: 'high' };
  } else if (diffDays <= 3) {
    return { label: 'Medium', className: 'inventory-medium', level: 'medium' };
  } else {
    return { label: 'Low', className: 'inventory-low', level: 'low' };
  }
}
