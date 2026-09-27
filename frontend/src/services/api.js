/**
 * Nearza — Axios API Instance
 * Configured with base URL, JWT interceptors, token refresh, and session expiry events.
 */

import axios from 'axios';

// Resolve and normalize the API base URL to guarantee /api prefix
const resolveApiBaseUrl = () => {
  const envUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL;

  if (!envUrl) {
    if (import.meta.env.PROD) {
      return 'https://nearza.onrender.com/api';
    }
    return 'http://127.0.0.1:8000/api';
  }

  const clean = envUrl.trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nearza_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 with token refresh & session expiry notification
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop on auth endpoints
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login/') ||
      originalRequest?.url?.includes('/auth/register/') ||
      originalRequest?.url?.includes('/auth/token/refresh/');

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthEndpoint &&
      localStorage.getItem('nearza_refresh_token')
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('nearza_refresh_token');
        const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = res.data;
        localStorage.setItem('nearza_access_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return api(originalRequest);
      } catch (refreshErr) {
        // Refresh token invalid or expired — notify app and reset credentials
        localStorage.removeItem('nearza_access_token');
        localStorage.removeItem('nearza_refresh_token');

        window.dispatchEvent(
          new CustomEvent('nearza:session_expired', {
            detail: { message: 'Your session has expired. Please sign in again.' },
          })
        );

        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
