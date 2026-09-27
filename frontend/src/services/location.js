/**
 * Nearza — Location Service
 * Provides geocoding search and reverse geocoding via Nearza backend API.
 */

import api from './api';

export const locationService = {
  /**
   * Search locations by town, city, district, village, or postal code.
   * @param {string} query
   * @returns {Promise<Array>}
   */
  searchLocations: async (query) => {
    if (!query || query.trim().length < 2) return [];
    try {
      const res = await api.get('/location/search/', {
        params: { q: query.trim() },
      });
      return res.data?.results || [];
    } catch (err) {
      console.error('Location search error:', err);
      return [];
    }
  },

  /**
   * Reverse geocode coordinates to structured address information.
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<object|null>}
   */
  reverseGeocode: async (latitude, longitude) => {
    if (!latitude || !longitude) return null;
    try {
      const res = await api.get('/location/reverse/', {
        params: { lat: latitude, lon: longitude },
      });
      return res.data?.data || null;
    } catch (err) {
      console.error('Reverse geocode error:', err);
      return null;
    }
  },
};

export default locationService;
