/**
 * Nearza — Merchant Portal API Service
 */

import api from './api';

export const merchantService = {
  // Shop operations
  getShop: async () => {
    const res = await api.get('/merchant/shop/');
    return res.data?.data || res.data;
  },

  createShop: async (data) => {
    const res = await api.post('/merchant/shop/', data);
    return res.data?.data || res.data;
  },

  updateShop: async (data) => {
    const res = await api.patch('/merchant/shop/', data);
    return res.data?.data || res.data;
  },

  // Image upload
  uploadImage: async (file, type = 'product', options = {}) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    if (options.shopId) formData.append('shop_id', options.shopId);
    if (options.productId) formData.append('product_id', options.productId);

    const res = await api.post('/merchant/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data?.data || res.data;
  },

  // Dashboard statistics & metrics
  getDashboardStats: async () => {
    const res = await api.get('/merchant/dashboard/');
    return res.data?.data || res.data;
  },

  // Engagement event tracking (WhatsApp, Call, Directions clicks, Views)
  trackEvent: async ({ event_type, shop_id, product_id, metadata = {} }) => {
    try {
      const res = await api.post('/analytics/track/', {
        event_type,
        shop_id,
        product_id,
        metadata,
      });
      return res.data;
    } catch {
      // Non-blocking for analytics
      return null;
    }
  },

  // Inventory operations
  getInventory: async () => {
    const res = await api.get('/merchant/products/');
    return res.data?.data || res.data;
  },

  addInventoryItem: async (data) => {
    const res = await api.post('/merchant/products/', data);
    return res.data?.data || res.data;
  },

  updateInventoryItem: async (id, data) => {
    const res = await api.patch(`/merchant/products/${id}/`, data);
    return res.data?.data || res.data;
  },

  deleteInventoryItem: async (id) => {
    const res = await api.delete(`/merchant/products/${id}/`);
    return res.data;
  },
};

export const getDashboardStats = merchantService.getDashboardStats;
export const trackEvent = merchantService.trackEvent;
export const getMerchantShop = merchantService.getShop;
export const getShop = merchantService.getShop;
export const createShop = merchantService.createShop;
export const updateShop = merchantService.updateShop;
export const uploadImage = merchantService.uploadImage;
export const getMerchantProducts = merchantService.getInventory;
export const getInventory = merchantService.getInventory;
export const addInventoryItem = merchantService.addInventoryItem;
export const updateInventoryItem = merchantService.updateInventoryItem;
export const deleteInventoryItem = merchantService.deleteInventoryItem;

export default merchantService;
