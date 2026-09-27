/**
 * Nearza — Application Routes
 * Configures public, auth, and role-protected route pipelines.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import MerchantLayout from '../layouts/MerchantLayout';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ProfilePage from '../pages/ProfilePage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import MerchantDashboard from '../pages/merchant/MerchantDashboard';
import MerchantShopManage from '../pages/merchant/MerchantShopManage';
import MerchantInventoryManage from '../pages/merchant/MerchantInventoryManage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Customer Discovery & Catalog Pages
import ProductSearchPage from '../pages/ProductSearchPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import ShopListPage from '../pages/ShopListPage';
import ShopDetailPage from '../pages/ShopDetailPage';
import CategoryListPage from '../pages/CategoryListPage';
import NearbyPage from '../pages/NearbyPage';
import PriceComparisonPage from '../pages/PriceComparisonPage';
import FavoritesPage from '../pages/FavoritesPage';
import SearchHistoryPage from '../pages/SearchHistoryPage';
import NotificationsPage from '../pages/NotificationsPage';

// Platform, Help & Legal Pages
import HowItWorksPage from '../pages/HowItWorksPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import TermsOfServicePage from '../pages/TermsOfServicePage';
import SupportPage from '../pages/SupportPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Platform, Help & Legal Routes */}
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/support" element={<SupportPage />} />

        {/* Customer Discovery Routes */}
        <Route path="/search" element={<ProductSearchPage />} />
        <Route path="/nearby" element={<NearbyPage />} />
        <Route path="/products" element={<ProductSearchPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/compare" element={<PriceComparisonPage />} />
        <Route path="/shops" element={<ShopListPage />} />
        <Route path="/shops/:id" element={<ShopDetailPage />} />
        <Route path="/categories" element={<CategoryListPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/history" element={<SearchHistoryPage />} />
        <Route path="/search-history" element={<SearchHistoryPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Authenticated User Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['customer', 'merchant', 'admin']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Merchant Protected Portal with Dedicated Responsive Layout */}
      <Route
        path="/merchant"
        element={
          <ProtectedRoute allowedRoles={['merchant', 'admin']}>
            <MerchantLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/merchant/dashboard" replace />} />
        <Route path="dashboard" element={<MerchantDashboard />} />
        <Route path="shop" element={<MerchantShopManage />} />
        <Route path="inventory" element={<MerchantInventoryManage />} />
      </Route>
    </Routes>
  );
}
