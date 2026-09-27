"""
Tests for Favorites API.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.products.models import Category, Product
from apps.shops.models import Shop
from apps.favorites.models import Favorite

User = get_user_model()


class FavoritesAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="shopper@nearza.local",
            password="testpassword123",
            full_name="Shopper John",
            role="customer",
        )
        self.client.force_authenticate(user=self.user)

        self.category = Category.objects.create(name="Dairy", slug="dairy")
        self.product = Product.objects.create(
            name="Amul Butter 500g",
            slug="amul-butter-500g",
            category=self.category,
            unit="g",
            unit_value=500,
        )
        self.shop = Shop.objects.create(
            merchant=self.user,
            name="City Supermart",
            slug="city-supermart",
            address="123 High St",
            city="Bengaluru",
            phone="9876543210",
            whatsapp_number="9876543210",
            latitude=12.9716,
            longitude=77.5946,
        )

    def test_toggle_favorite_product(self):
        # Toggle on
        res = self.client.post("/api/favorites/toggle/", {"product_id": str(self.product.id)})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data["favorited"])
        self.assertTrue(Favorite.objects.filter(user=self.user, product=self.product).exists())

        # Toggle off
        res2 = self.client.post("/api/favorites/toggle/", {"product_id": str(self.product.id)})
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertFalse(res2.data["favorited"])
        self.assertFalse(Favorite.objects.filter(user=self.user, product=self.product).exists())

    def test_list_favorites(self):
        Favorite.objects.create(
            user=self.user,
            product=self.product,
            favorite_type=Favorite.FavoriteType.PRODUCT,
        )
        res = self.client.get("/api/favorites/?type=product")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["count"], 1)

    def test_check_favorite(self):
        Favorite.objects.create(
            user=self.user,
            product=self.product,
            favorite_type=Favorite.FavoriteType.PRODUCT,
        )
        res = self.client.get(f"/api/favorites/check/?product_id={self.product.id}")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["is_favorite"])
