"""
Nearza — Merchant Operations URL Configuration
"""

from django.urls import path
from . import views
from apps.products import views as products_views

app_name = "merchant"

urlpatterns = [
    # Merchant Shop Operations
    path("dashboard/", views.MerchantDashboardStatsView.as_view(), name="dashboard-stats"),
    path("shop/", views.MerchantShopManageView.as_view(), name="manage-shop"),
    path("upload/", views.ImageUploadView.as_view(), name="upload-image"),

    # Merchant Inventory & Product Management
    path("products/", products_views.MerchantProductListView.as_view(), name="manage-products"),
    path("products/<uuid:pk>/", products_views.MerchantProductDetailView.as_view(), name="manage-product-detail"),
]
