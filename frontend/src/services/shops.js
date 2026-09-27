/**
 * Nearza — Shops API Service
 */

import api from './api';

export const shopsService = {
  getShops: async (params = {}) => {
    const res = await api.get('/shops/', { params });
    return res.data;
  },

  getShop: async (idOrSlug, params = {}) => {
    const res = await api.get(`/shops/${idOrSlug}/`, { params });
    return res.data?.data || res.data;
  },

  getShopProducts: async (idOrSlug, params = {}) => {
    const res = await api.get(`/shops/${idOrSlug}/products/`, { params });
    return res.data;
  },
};

export const getShops = shopsService.getShops;
export const getShop = shopsService.getShop;
export const getShopProducts = shopsService.getShopProducts;

export default shopsService;
