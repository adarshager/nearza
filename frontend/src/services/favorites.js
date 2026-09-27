/**
 * Nearza — Favorites API Service
 */

import api from './api';

export const favoritesService = {
  getFavorites: async (params = {}) => {
    const res = await api.get('/favorites/', { params });
    return res.data;
  },

  toggleFavorite: async ({ product_id, shop_id }) => {
    const res = await api.post('/favorites/toggle/', { product_id, shop_id });
    return res.data;
  },

  deleteFavorite: async (id) => {
    const res = await api.delete(`/favorites/${id}/`);
    return res.data;
  },

  checkFavorite: async ({ product_id, shop_id }) => {
    const res = await api.get('/favorites/check/', {
      params: { product_id, shop_id },
    });
    return res.data;
  },
};

export const getFavorites = favoritesService.getFavorites;
export const toggleFavorite = favoritesService.toggleFavorite;
export const deleteFavorite = favoritesService.deleteFavorite;
export const checkFavorite = favoritesService.checkFavorite;

export default favoritesService;
