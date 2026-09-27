/**
 * Nearza — Route Constants
 */

export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  NEARBY: '/nearby',
  PRODUCT_DETAIL: '/products/:id',
  SHOP_LIST: '/shops',
  SHOP_DETAIL: '/shops/:id',
  CATEGORY_PRODUCTS: '/categories/:id',
  PRICE_COMPARISON: '/products/:id/compare',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  FAVORITES: '/favorites',
  SEARCH_HISTORY: '/history',
  NOTIFICATIONS: '/notifications',

  // Merchant
  MERCHANT_DASHBOARD: '/merchant',
  MERCHANT_SHOP: '/merchant/shop',
  MERCHANT_PRODUCTS: '/merchant/products',
  MERCHANT_INVENTORY: '/merchant/inventory',
  MERCHANT_ANALYTICS: '/merchant/analytics',

  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_MERCHANTS: '/admin/merchants',
  ADMIN_SHOPS: '/admin/shops',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_USERS: '/admin/users',
  ADMIN_AUDIT: '/admin/audit',
};
