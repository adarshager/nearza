"""
Nearza — Location URL Configuration
Endpoints for geocoding and reverse geocoding.
"""

from django.urls import path
from .location_views import LocationSearchView, LocationReverseView

app_name = "location"

urlpatterns = [
    path("search/", LocationSearchView.as_view(), name="search"),
    path("reverse/", LocationReverseView.as_view(), name="reverse"),
]
