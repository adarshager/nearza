/**
 * Nearza — Nearby Discovery API Service
 * Provides location-aware endpoints for nearby shops and products.
 */

import api from './api';

export const nearbyService = {
  /**
   * Get nearby shops with inventory, sorted by distance.
   * @param {object} params
   * @param {number} params.latitude  - User latitude
   * @param {number} params.longitude - User longitude
   * @param {number} [params.radius_km] - Search radius in km (default: server decides)
   * @param {string} [params.q] - Optional search query
   * @param {string} [params.city] - City filter
   * @param {number} [params.page] - Pagination page
   * @returns {Promise<object>}
   */
  getNearbyShops: async (params = {}) => {
    const res = await api.get('/shops/', { params });
    return res.data;
  },

  /**
   * Get products available at nearby shops, sorted by distance.
   * @param {object} params
   * @param {number} params.latitude  - User latitude
   * @param {number} params.longitude - User longitude
   * @param {string} [params.q] - Product search query
   * @param {string} [params.category] - Category filter
   * @param {string} [params.sort] - Sort order (distance, price_asc, price_desc)
   * @param {boolean} [params.in_stock_only] - Only show in-stock products
   * @returns {Promise<object>}
   */
  getNearbyProducts: async (params = {}) => {
    const res = await api.get('/products/', { params });
    return res.data;
  },

  /**
   * Get a single shop's detail with distance.
   * @param {string} idOrSlug
   * @param {object} params
   * @returns {Promise<object>}
   */
  getShopWithDistance: async (idOrSlug, params = {}) => {
    const res = await api.get(`/shops/${idOrSlug}/`, { params });
    return res.data?.data || res.data;
  },

  /**
   * Get products from a specific shop.
   * @param {string} idOrSlug
   * @param {object} params
   * @returns {Promise<object>}
   */
  getShopProducts: async (idOrSlug, params = {}) => {
    const res = await api.get(`/shops/${idOrSlug}/products/`, { params });
    return res.data;
  },
};

export default nearbyService;
