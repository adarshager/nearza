"""
Nearza — Comprehensive Product, Shop Discovery & Merchant Operations Tests
Tests: Category listing, Product search, Multi-shop price comparison, Nearby distance calculations,
Merchant shop creation/editing, and Inventory pricing & stock updates.
"""

from decimal import Decimal
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.products.models import Category, Product, ShopProduct
from apps.shops.models import Shop

User = get_user_model()


class DiscoveryAndMerchantTests(APITestCase):
    def setUp(self):
        # 1. Create Users
        self.customer = User.objects.create_user(
            email="cust_discover@nearza.local",
            full_name="Discovery Customer",
            role=User.Role.CUSTOMER,
            password="Password123!",
        )

        self.merchant = User.objects.create_user(
            email="merch_discover@nearza.local",
            full_name="Discovery Merchant",
            role=User.Role.MERCHANT,
            password="Password123!",
        )

        self.other_merchant = User.objects.create_user(
            email="other_merch@nearza.local",
            full_name="Other Merchant",
            role=User.Role.MERCHANT,
            password="Password123!",
        )

        # 2. Create Categories
        self.cat_groceries = Category.objects.create(
            name="Groceries",
            slug="groceries",
            description="Everyday supermarket essentials",
        )
        self.cat_electronics = Category.objects.create(
            name="Electronics",
            slug="electronics",
            description="Phones, gadgets, accessories",
        )

        # 3. Create Shops
        # Shop A: Indiranagar, Bangalore (12.9784, 77.6408)
        self.shop_a = Shop.objects.create(
            merchant=self.merchant,
            name="Indiranagar Supermart",
            address="100 Feet Rd, Indiranagar",
            city="Bangalore",
            state="Karnataka",
            pincode="560038",
            latitude=Decimal("12.97840000"),
            longitude=Decimal("77.64080000"),
            phone="9876543210",
        )

        # Shop B: Koramangala, Bangalore (12.9352, 77.6245)
        self.shop_b = Shop.objects.create(
            merchant=self.other_merchant,
            name="Koramangala Daily Needs",
            address="80 Feet Rd, Koramangala",
            city="Bangalore",
            state="Karnataka",
            pincode="560034",
            latitude=Decimal("12.93520000"),
            longitude=Decimal("77.62450000"),
            phone="9876543211",
        )

        # 4. Create Catalog Products
        self.product_milk = Product.objects.create(
            name="Farm Fresh Whole Milk",
            brand="Amul",
            category=self.cat_groceries,
            unit="L",
            unit_value=Decimal("1.00"),
        )

        self.product_oil = Product.objects.create(
            name="Pure Sunflower Cooking Oil",
            brand="Fortune",
            category=self.cat_groceries,
            unit="L",
            unit_value=Decimal("1.00"),
        )

        # 5. Populate Shop Products (Prices, Stock, Quantities)
        # Milk at Shop A: ₹65 (In Stock)
        self.sp_milk_a = ShopProduct.objects.create(
            shop=self.shop_a,
            product=self.product_milk,
            price=Decimal("65.00"),
            quantity=25,
            stock_status="in_stock",
        )

        # Milk at Shop B: ₹62 (In Stock, Cheaper!)
        self.sp_milk_b = ShopProduct.objects.create(
            shop=self.shop_b,
            product=self.product_milk,
            price=Decimal("62.00"),
            quantity=10,
            stock_status="in_stock",
        )

        # Oil at Shop A: ₹180 (Out of stock)
        self.sp_oil_a = ShopProduct.objects.create(
            shop=self.shop_a,
            product=self.product_oil,
            price=Decimal("180.00"),
            quantity=0,
            stock_status="out_of_stock",
        )

    # ==================== Customer Discovery Tests ====================

    def test_category_list(self):
        """Categories endpoint lists active categories."""
        url = reverse("categories:list")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        names = [c["name"] for c in res.data]
        self.assertIn("Groceries", names)
        self.assertIn("Electronics", names)

    def test_product_search_by_name(self):
        """Search products by keyword."""
        url = reverse("products:list")
        res = self.client.get(url, {"q": "Milk"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data["results"]
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "Farm Fresh Whole Milk")
        self.assertEqual(results[0]["min_price"], 62.0)
        self.assertEqual(results[0]["max_price"], 65.0)

    def test_product_filter_by_category(self):
        """Filter products by category slug."""
        url = reverse("products:list")
        res = self.client.get(url, {"category": "groceries"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data["results"]), 2)

    def test_product_filter_by_price_range(self):
        """Filter products by min and max price."""
        url = reverse("products:list")
        # Items between 60 and 70 (Milk is 62-65, Oil is 180)
        res = self.client.get(url, {"min_price": 60, "max_price": 70})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        ids = [p["id"] for p in res.data["results"]]
        self.assertIn(str(self.product_milk.id), ids)
        self.assertNotIn(str(self.product_oil.id), ids)

    def test_product_price_comparison(self):
        """Product details returns all competing shop offerings with confidence metrics."""
        url = reverse("products:detail", kwargs={"identifier": str(self.product_milk.id)})
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.data["data"]

        self.assertEqual(data["min_price"], 62.0)
        self.assertEqual(data["max_price"], 65.0)
        self.assertEqual(data["price_difference"], 3.0)

        offerings = data["shop_offerings"]
        self.assertEqual(len(offerings), 2)
        # Lowest price first
        self.assertEqual(float(offerings[0]["price"]), 62.0)
        self.assertEqual(offerings[0]["shop"]["name"], "Koramangala Daily Needs")
        self.assertEqual(offerings[0]["inventory_confidence"], "high")

    def test_nearby_shops_distance_calculation(self):
        """Shops list calculates distance when user provides coordinates."""
        url = reverse("shops:list")
        # User is in Indiranagar (12.9780, 77.6400)
        res = self.client.get(url, {"latitude": "12.9780", "longitude": "77.6400"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data["results"]
        self.assertGreaterEqual(len(results), 2)

        # Indiranagar shop should be closest (< 1 km away)
        first_shop = results[0]
        self.assertEqual(first_shop["name"], "Indiranagar Supermart")
        self.assertIsNotNone(first_shop["distance_km"])
        self.assertLess(first_shop["distance_km"], 1.0)

    # ==================== Merchant Operations Tests ====================

    def test_customer_cannot_access_merchant_endpoints(self):
        """Customer role is forbidden on merchant operations."""
        self.client.force_authenticate(user=self.customer)
        url = reverse("merchant:manage-shop")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_merchant_can_view_own_shop(self):
        """Merchant can view their own shop."""
        self.client.force_authenticate(user=self.merchant)
        url = reverse("merchant:manage-shop")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["data"]["name"], "Indiranagar Supermart")

    def test_merchant_can_update_shop_details(self):
        """Merchant can update shop phone and address."""
        self.client.force_authenticate(user=self.merchant)
        url = reverse("merchant:manage-shop")
        res = self.client.patch(
            url,
            {"phone": "9998887776", "description": "Best local grocery store in Indiranagar"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.shop_a.refresh_from_db()
        self.assertEqual(self.shop_a.phone, "9998887776")
        self.assertEqual(self.shop_a.description, "Best local grocery store in Indiranagar")

    def test_merchant_add_product_to_inventory(self):
        """Merchant can add a product to their shop inventory."""
        self.client.force_authenticate(user=self.merchant)
        url = reverse("merchant:manage-products")
        payload = {
            "product_name": "Organic Brown Bread",
            "product_category_id": str(self.cat_groceries.id),
            "product_brand": "Modern",
            "product_unit": "pack",
            "product_unit_value": "1.00",
            "price": "45.00",
            "quantity": 30,
            "stock_status": "in_stock",
        }
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(float(res.data["data"]["price"]), 45.0)
        self.assertEqual(res.data["data"]["quantity"], 30)

    def test_merchant_update_price_and_stock(self):
        """Merchant can update price and stock quantity."""
        self.client.force_authenticate(user=self.merchant)
        url = reverse("merchant:manage-product-detail", kwargs={"pk": self.sp_milk_a.id})
        payload = {
            "price": "64.00",
            "quantity": 18,
            "stock_status": "in_stock",
        }
        res = self.client.patch(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.sp_milk_a.refresh_from_db()
        self.assertEqual(self.sp_milk_a.price, Decimal("64.00"))
        self.assertEqual(self.sp_milk_a.quantity, 18)

    def test_merchant_cannot_alter_another_merchants_product(self):
        """Merchant B cannot update Merchant A's inventory."""
        self.client.force_authenticate(user=self.other_merchant)
        url = reverse("merchant:manage-product-detail", kwargs={"pk": self.sp_milk_a.id})
        res = self.client.patch(url, {"price": "10.00"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
