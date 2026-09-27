"""
Nearza — Root URL Configuration
All API routes are mounted under /api/ prefix.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def root_view(request):
    """API welcome endpoint."""
    return Response(
        {
            "name": "Nearza API",
            "status": "ok",
            "version": "1.0.0",
            "health": "/api/health/",
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Safe public health check endpoint."""
    return Response({"status": "ok"})


urlpatterns = [
    path("", root_view, name="api-root"),
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="api-health"),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/products/", include("apps.products.urls")),
    path("api/categories/", include("apps.products.category_urls")),
    path("api/shops/", include("apps.shops.urls")),
    path("api/location/", include("apps.shops.location_urls")),
    path("api/inventory/", include("apps.inventory.urls")),
    path("api/favorites/", include("apps.favorites.urls")),
    path("api/reviews/", include("apps.reviews.urls")),
    path("api/reports/", include("apps.reports.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
    path("api/merchant/", include("apps.shops.merchant_urls")),
    path("api/admin-panel/", include("apps.admin_panel.urls")),
    path("api/analytics/", include("apps.analytics.urls")),
    path("api/search/", include("apps.products.search_urls")),
]
