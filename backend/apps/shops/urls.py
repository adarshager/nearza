"""
Nearza — Shops URL Configuration
"""

from django.urls import path
from . import views

app_name = "shops"

urlpatterns = [
    path("", views.ShopListView.as_view(), name="list"),
    path("<str:identifier>/", views.ShopDetailView.as_view(), name="detail"),
    path("<str:identifier>/products/", views.ShopProductsView.as_view(), name="products"),
]
