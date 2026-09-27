/**
 * Nearza — Admin API Service
 * Server-side RBAC enforced endpoints for platform moderation and oversight.
 */

import api from './api';

export const adminService = {
  // Stats & Dashboard
  getStats: async () => {
    const res = await api.get('/admin-panel/stats/');
    return res.data?.data || res.data;
  },

  // Merchant Verification
  getMerchants: async (params = {}, options = {}) => {
    const res = await api.get('/admin-panel/merchants/', { params, ...options });
    return res.data;
  },

  verifyMerchant: async (shopId, { status, notes }) => {
    const res = await api.post(`/admin-panel/merchants/${shopId}/verify/`, {
      status,
      notes,
    });
    return res.data;
  },

  // Product & Category Moderation
  getProducts: async (params = {}) => {
    const res = await api.get('/admin-panel/products/', { params });
    return res.data;
  },

  toggleProductActive: async (productId) => {
    const res = await api.patch(`/admin-panel/products/${productId}/toggle-status/`);
    return res.data;
  },

  getCategories: async () => {
    const res = await api.get('/admin-panel/categories/');
    return res.data;
  },

  createCategory: async (categoryData) => {
    const res = await api.post('/admin-panel/categories/', categoryData);
    return res.data;
  },

  updateCategory: async (categoryId, categoryData) => {
    const res = await api.patch(`/admin-panel/categories/${categoryId}/`, categoryData);
    return res.data;
  },

  deleteCategory: async (categoryId) => {
    const res = await api.delete(`/admin-panel/categories/${categoryId}/`);
    return res.data;
  },

  // Reports Moderation
  getReports: async (params = {}) => {
    const res = await api.get('/admin-panel/reports/', { params });
    return res.data;
  },

  resolveReport: async (reportId, { status, resolution_notes }) => {
    const res = await api.post(`/admin-panel/reports/${reportId}/resolve/`, {
      status,
      resolution_notes,
    });
    return res.data;
  },

  // Review Moderation
  getReviews: async (params = {}) => {
    const res = await api.get('/admin-panel/reviews/', { params });
    return res.data;
  },

  moderateReview: async (reviewId, { is_approved }) => {
    const res = await api.post(`/admin-panel/reviews/${reviewId}/moderate/`, {
      is_approved,
    });
    return res.data;
  },

  deleteReview: async (reviewId) => {
    const res = await api.delete(`/admin-panel/reviews/${reviewId}/moderate/`);
    return res.data;
  },

  // User Management
  getUsers: async (params = {}) => {
    const res = await api.get('/admin-panel/users/', { params });
    return res.data;
  },

  toggleUserActive: async (userId) => {
    const res = await api.patch(`/admin-panel/users/${userId}/toggle-active/`);
    return res.data;
  },

  // Audit Logs
  getAuditLogs: async (params = {}) => {
    const res = await api.get('/admin-panel/audit-logs/', { params });
    return res.data;
  },
};

export default adminService;
