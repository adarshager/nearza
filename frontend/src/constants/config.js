/**
 * Nearza — App Configuration Constants
 */

export const APP_NAME = 'Nearza';
export const APP_TAGLINE = 'Find Nearby. Compare Prices. Shop Smarter.';
export const CURRENCY_SYMBOL = '₹';
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_FILE_SIZE_MB = 5;
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const INVENTORY_CONFIDENCE = {
  HIGH: { label: 'High', className: 'inventory-high', maxDays: 1 },
  MEDIUM: { label: 'Medium', className: 'inventory-medium', maxDays: 3 },
  LOW: { label: 'Low', className: 'inventory-low', maxDays: 7 },
};

export const STOCK_STATUS_LABELS = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
};
