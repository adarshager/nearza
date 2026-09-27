"""
Nearza — Admin Panel URL Configuration
All routes require IsAdminUser role permission.
"""

from django.urls import path
from .views import (
    AdminDashboardStatsView,
    AdminMerchantListView,
    AdminMerchantVerifyView,
    AdminProductListView,
    AdminProductToggleActiveView,
    AdminCategoryListCreateView,
    AdminCategoryDetailView,
    AdminReportListView,
    AdminReportResolveView,
    AdminReviewListView,
    AdminReviewModerateView,
    AdminUserListView,
    AdminUserToggleActiveView,
    AdminAuditLogListView,
)

app_name = "admin_panel"

urlpatterns = [
    # Dashboard & Stats
    path("stats/", AdminDashboardStatsView.as_view(), name="admin-stats"),

    # Merchant Verification
    path("merchants/", AdminMerchantListView.as_view(), name="admin-merchant-list"),
    path("merchants/<uuid:pk>/verify/", AdminMerchantVerifyView.as_view(), name="admin-merchant-verify"),

    # Product Moderation
    path("products/", AdminProductListView.as_view(), name="admin-product-list"),
    path("products/<uuid:pk>/toggle-status/", AdminProductToggleActiveView.as_view(), name="admin-product-toggle"),

    # Category Moderation
    path("categories/", AdminCategoryListCreateView.as_view(), name="admin-category-list-create"),
    path("categories/<uuid:pk>/", AdminCategoryDetailView.as_view(), name="admin-category-detail"),

    # Reports Moderation
    path("reports/", AdminReportListView.as_view(), name="admin-report-list"),
    path("reports/<uuid:pk>/resolve/", AdminReportResolveView.as_view(), name="admin-report-resolve"),

    # Review Moderation
    path("reviews/", AdminReviewListView.as_view(), name="admin-review-list"),
    path("reviews/<uuid:pk>/moderate/", AdminReviewModerateView.as_view(), name="admin-review-moderate"),

    # User Management
    path("users/", AdminUserListView.as_view(), name="admin-user-list"),
    path("users/<uuid:pk>/toggle-active/", AdminUserToggleActiveView.as_view(), name="admin-user-toggle-active"),

    # Audit Trail
    path("audit-logs/", AdminAuditLogListView.as_view(), name="admin-audit-logs"),
]
