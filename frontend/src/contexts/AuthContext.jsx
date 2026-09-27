/**
 * Nearza — Auth Context
 * Manages authentication state, JWT tokens, session lifecycle, and profile operations.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(() =>
    localStorage.getItem('nearza_access_token')
  );

  // Initialize session and fetch user profile
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const token = localStorage.getItem('nearza_access_token');
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) {
          setUser(res.data.data);
        }
      } catch {
        localStorage.removeItem('nearza_access_token');
        localStorage.removeItem('nearza_refresh_token');
        if (isMounted) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    // Session expiry event listener from Axios interceptor
    const handleSessionExpired = () => {
      setUser(null);
      setAccessToken(null);
    };

    window.addEventListener('nearza:session_expired', handleSessionExpired);

    return () => {
      isMounted = false;
      window.removeEventListener('nearza:session_expired', handleSessionExpired);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login/', { email, password });
    const { user: userData, tokens } = res.data.data;
    setUser(userData);
    setAccessToken(tokens.access);
    localStorage.setItem('nearza_access_token', tokens.access);
    localStorage.setItem('nearza_refresh_token', tokens.refresh);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register/', data);
    const { user: userData, tokens } = res.data.data;
    setUser(userData);
    setAccessToken(tokens.access);
    localStorage.setItem('nearza_access_token', tokens.access);
    localStorage.setItem('nearza_refresh_token', tokens.refresh);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('nearza_refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('nearza_access_token');
      localStorage.removeItem('nearza_refresh_token');
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    const res = await api.patch('/auth/me/', data);
    setUser(res.data.data);
    return res.data.data;
  }, []);

  const changePassword = useCallback(async (oldPassword, newPassword, newPasswordConfirm) => {
    const res = await api.post('/auth/password/change/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
    return res.data;
  }, []);

  const forgotPassword = useCallback(async (email) => {
    const res = await api.post('/auth/password/reset/', { email });
    return res.data;
  }, []);

  const resetPassword = useCallback(async (uidb64, token, newPassword, newPasswordConfirm) => {
    const res = await api.post('/auth/password/reset/confirm/', {
      uidb64,
      token,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
    return res.data;
  }, []);

  const value = {
    user,
    loading,
    accessToken,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'customer',
    isMerchant: user?.role === 'merchant',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
