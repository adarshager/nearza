"""
Nearza — Location API Tests
Tests geocoding search, reverse geocoding, and coordinate validation.
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.shops.models import Shop


class LocationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create demo merchant and shop in Ankola
        self.merchant = User.objects.create_user(
            email="merchant_ankola@nearza.test",
            password="StrongPassword123!",
            role="merchant",
            full_name="Ankola Merchant",
        )
        self.shop = Shop.objects.create(
            merchant=self.merchant,
            name="Ankola Test Mart",
            slug="ankola-test-mart",
            address="Main Road, Ankola",
            city="Ankola",
            state="Karnataka",
            pincode="581314",
            latitude=14.6653,
            longitude=74.3015,
            verification_status="approved",
            is_active=True,
        )

    def test_location_search_ankola(self):
        """Test location search returns Ankola with exact coordinates."""
        response = self.client.get("/api/location/search/?q=Ankola")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertTrue(len(data["results"]) > 0)

        first = data["results"][0]
        self.assertEqual(first["locality"], "Ankola")
        self.assertAlmostEqual(first["latitude"], 14.6653, places=3)
        self.assertAlmostEqual(first["longitude"], 74.3015, places=3)
        self.assertEqual(first["district"], "Uttara Kannada")
        self.assertEqual(first["state"], "Karnataka")

    def test_location_search_karwar_and_sirsi(self):
        """Test location search works for other regional towns."""
        for town, exp_lat, exp_lon in [
            ("Karwar", 14.8136, 74.1298),
            ("Sirsi", 14.6196, 74.8354),
            ("Kumta", 14.4286, 74.4172),
            ("Gokarna", 14.5427, 74.3188),
            ("Bengaluru", 12.9716, 77.5946),
        ]:
            response = self.client.get(f"/api/location/search/?q={town}")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertTrue(len(data["results"]) > 0)
            match = next((r for r in data["results"] if town.lower() in r["name"].lower() or town.lower() in r["locality"].lower()), None)
            self.assertIsNotNone(match, f"Failed to find match for {town}")
            self.assertAlmostEqual(match["latitude"], exp_lat, places=2)
            self.assertAlmostEqual(match["longitude"], exp_lon, places=2)

    def test_location_search_validation(self):
        """Test short search query returns 400 error."""
        response = self.client.get("/api/location/search/?q=a")
        self.assertEqual(response.status_code, 400)

        response_empty = self.client.get("/api/location/search/")
        self.assertEqual(response_empty.status_code, 400)

    def test_location_reverse_ankola(self):
        """Test reverse geocoding for Ankola coordinates."""
        response = self.client.get("/api/location/reverse/?lat=14.6653&lon=74.3015")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["data"]["locality"], "Ankola")
        self.assertEqual(data["data"]["district"], "Uttara Kannada")

    def test_location_reverse_validation(self):
        """Test out-of-bounds coordinates return 400 error."""
        # Latitude > 90
        res1 = self.client.get("/api/location/reverse/?lat=120.0&lon=74.3015")
        self.assertEqual(res1.status_code, 400)

        # Longitude < -180
        res2 = self.client.get("/api/location/reverse/?lat=14.6653&lon=-200.0")
        self.assertEqual(res2.status_code, 400)

        # Missing params
        res3 = self.client.get("/api/location/reverse/")
        self.assertEqual(res3.status_code, 400)

    def test_shops_nearby_distance_calculation(self):
        """Test that ShopListView calculates distance from selected coordinates."""
        # Query from Ankola coordinates (0 km away)
        res_ankola = self.client.get("/api/shops/?latitude=14.6653&longitude=74.3015")
        self.assertEqual(res_ankola.status_code, 200)
        shops_ankola = res_ankola.json().get("results", [])
        ankola_shop = next((s for s in shops_ankola if s["id"] == str(self.shop.id)), None)
        self.assertIsNotNone(ankola_shop)
        self.assertAlmostEqual(ankola_shop["distance_km"], 0.0, places=1)

        # Query from Karwar coordinates (~25 km away)
        res_karwar = self.client.get("/api/shops/?latitude=14.8136&longitude=74.1298")
        self.assertEqual(res_karwar.status_code, 200)
        shops_karwar = res_karwar.json().get("results", [])
        karwar_shop = next((s for s in shops_karwar if s["id"] == str(self.shop.id)), None)
        self.assertIsNotNone(karwar_shop)
        self.assertTrue(20.0 <= karwar_shop["distance_km"] <= 30.0)
