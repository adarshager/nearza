/**
 * Nearza — Products & Categories API Service
 */

import api from './api';

export const productsService = {
  // Categories
  getCategories: async () => {
    const res = await api.get('/categories/');
    return res.data;
  },

  getCategory: async (idOrSlug) => {
    const res = await api.get(`/categories/${idOrSlug}/`);
    return res.data?.data || res.data;
  },

  // Products
  getProducts: async (params = {}, options = {}) => {
    const res = await api.get('/products/', { params, ...options });
    return res.data;
  },

  getProduct: async (idOrSlug, params = {}) => {
    const res = await api.get(`/products/${idOrSlug}/`, { params });
    return res.data?.data || res.data;
  },

  getPriceComparison: async (idOrSlug, params = {}) => {
    const res = await api.get(`/products/${idOrSlug}/shops/`, { params });
    return res.data?.data || res.data;
  },
};

export const getCategories = productsService.getCategories;
export const getCategory = productsService.getCategory;
export const getProducts = productsService.getProducts;
export const getProduct = productsService.getProduct;
export const getPriceComparison = productsService.getPriceComparison;

export default productsService;
