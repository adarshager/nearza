/**
 * Nearza — Notifications API Service
 */

import api from './api';

export const notificationsService = {
  getNotifications: async () => {
    const res = await api.get('/notifications/');
    return res.data;
  },

  markAsRead: async (id) => {
    const res = await api.post(`/notifications/${id}/read/`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.post('/notifications/mark-all-read/');
    return res.data;
  },

  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}/`);
    return res.data;
  },
};

export const getNotifications = notificationsService.getNotifications;
export const markAsRead = notificationsService.markAsRead;
export const markAllAsRead = notificationsService.markAllAsRead;
export const deleteNotification = notificationsService.deleteNotification;

export default notificationsService;
