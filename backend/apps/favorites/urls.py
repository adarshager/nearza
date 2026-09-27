"""
Nearza — Favorites URL Configuration
"""

from django.urls import path
from .views import (
    FavoriteListView,
    FavoriteToggleView,
    FavoriteDetailView,
    FavoriteCheckView,
)

app_name = "favorites"

urlpatterns = [
    path("", FavoriteListView.as_view(), name="favorite-list"),
    path("toggle/", FavoriteToggleView.as_view(), name="favorite-toggle"),
    path("<uuid:pk>/", FavoriteDetailView.as_view(), name="favorite-detail"),
    path("check/", FavoriteCheckView.as_view(), name="favorite-check"),
]
