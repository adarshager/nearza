"""
Nearza — Products URL Configuration
"""

from django.urls import path
from . import views

app_name = "products"

urlpatterns = [
    path("", views.ProductListView.as_view(), name="list"),
    path("<str:identifier>/", views.ProductDetailView.as_view(), name="detail"),
    path("<str:identifier>/shops/", views.ProductPriceComparisonView.as_view(), name="price-comparison"),
]
