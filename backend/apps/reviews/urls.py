"""
Nearza — Reviews URL Configuration
"""

from django.urls import path
from .views import ShopReviewsListView, ReviewCreateView, ReviewDetailView

app_name = "reviews"

urlpatterns = [
    path("", ReviewCreateView.as_view(), name="review-create"),
    path("shop/<uuid:shop_id>/", ShopReviewsListView.as_view(), name="shop-reviews-list"),
    path("<uuid:pk>/", ReviewDetailView.as_view(), name="review-detail"),
]
