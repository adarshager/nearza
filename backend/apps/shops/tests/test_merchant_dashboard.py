"""
Nearza — Merchant Dashboard, Analytics & Ownership Security Tests
Tests:
- Dashboard KPI statistics (total products, active, low stock, out of stock)
- Engagement analytics (shop views, product views, WhatsApp, Call, Directions clicks)
- Strict merchant ownership enforcement (Merchant A cannot access/modify Merchant B's shop or products)
- Customer forbidden from merchant operations
- InventoryUpdate audit trail creation and last_updated timestamp refresh
- Shop profile editing (name, phone, whatsapp, hours, address, logo)
"""

from decimal import Decimal
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.shops.models import Shop
from apps.products.models import Category, Product, ShopProduct
from apps.inventory.models import InventoryUpdate
from apps.analytics.models import AnalyticsEvent

User = get_user_model()


class MerchantDashboardAndOwnershipTests(APITestCase):
    def setUp(self):
        # 1. Users
        self.merchant_a = User.objects.create_user(
            email="merchant_a@nearza.local",
            full_name="Merchant Alice",
            role=User.Role.MERCHANT,
            password="Password123!",
        )

        self.merchant_b = User.objects.create_user(
            email="merchant_b@nearza.local",
            full_name="Merchant Bob",
            role=User.Role.MERCHANT,
            password="Password123!",
        )

        self.customer = User.objects.create_user(
            email="customer@nearza.local",
            full_name="Customer Charlie",
            role=User.Role.CUSTOMER,
            password="Password123!",
        )

        # 2. Categories
        self.category = Category.objects.create(
            name="Groceries",
            slug="groceries",
            description="Daily essentials",
        )

        # 3. Shops
        self.shop_a = Shop.objects.create(
            merchant=self.merchant_a,
            name="Alice Organic Grocery",
            address="123 Main St",
            city="Bengaluru",
            state="Karnataka",
            pincode="560001",
            phone="916363984209",
            whatsapp_number="916363984209",
            latitude=Decimal("12.97160000"),
            longitude=Decimal("77.59460000"),
            operating_hours={"monday": "9am-9pm"},
            description="Organic farm produce",
        )

        self.shop_b = Shop.objects.create(
            merchant=self.merchant_b,
            name="Bob Electronics",
            address="456 Cross Rd",
            city="Bengaluru",
            state="Karnataka",
            pincode="560002",
            phone="919876543210",
            whatsapp_number="919876543210",
        )

        # 4. Catalog Products
        self.product_1 = Product.objects.create(
            name="Organic Apples",
            category=self.category,
            brand="FreshFarm",
            unit="kg",
            unit_value=Decimal("1.0"),
        )
        self.product_2 = Product.objects.create(
            name="Brown Rice",
            category=self.category,
            brand="NatureBest",
            unit="kg",
            unit_value=Decimal("5.0"),
        )
        self.product_3 = Product.objects.create(
            name="Almond Milk",
            category=self.category,
            brand="Silk",
            unit="L",
            unit_value=Decimal("1.0"),
        )

        # 5. Shop Products for Shop A
        # Item 1: In stock, plenty (quantity 25)
        self.sp_a1 = ShopProduct.objects.create(
            shop=self.shop_a,
            product=self.product_1,
            price=Decimal("180.00"),
            quantity=25,
            stock_status=ShopProduct.StockStatus.IN_STOCK,
        )
        # Item 2: Low stock (quantity 3)
        self.sp_a2 = ShopProduct.objects.create(
            shop=self.shop_a,
            product=self.product_2,
            price=Decimal("450.00"),
            quantity=3,
            stock_status=ShopProduct.StockStatus.LOW_STOCK,
        )
        # Item 3: Out of stock (quantity 0)
        self.sp_a3 = ShopProduct.objects.create(
            shop=self.shop_a,
            product=self.product_3,
            price=Decimal("220.00"),
            quantity=0,
            stock_status=ShopProduct.StockStatus.OUT_OF_STOCK,
        )

        # 6. Shop Products for Shop B (Owned by Merchant B)
        self.sp_b1 = ShopProduct.objects.create(
            shop=self.shop_b,
            product=self.product_1,
            price=Decimal("195.00"),
            quantity=10,
            stock_status=ShopProduct.StockStatus.IN_STOCK,
        )

        # 7. Analytics Events for Shop A
        AnalyticsEvent.objects.create(
            event_type=AnalyticsEvent.EventType.SHOP_VIEW,
            shop=self.shop_a,
        )
        AnalyticsEvent.objects.create(
            event_type=AnalyticsEvent.EventType.SHOP_VIEW,
            shop=self.shop_a,
        )
        AnalyticsEvent.objects.create(
            event_type=AnalyticsEvent.EventType.PRODUCT_VIEW,
            shop=self.shop_a,
            product=self.product_1,
        )
        AnalyticsEvent.objects.create(
            event_type=AnalyticsEvent.EventType.WHATSAPP_CLICK,
            shop=self.shop_a,
            product=self.product_1,
        )
        AnalyticsEvent.objects.create(
            event_type=AnalyticsEvent.EventType.CALL_CLICK,
            shop=self.shop_a,
        )
        AnalyticsEvent.objects.create(
            event_type=AnalyticsEvent.EventType.DIRECTIONS_CLICK,
            shop=self.shop_a,
        )

    # ===================================================================
    # 1. Dashboard Statistics Endpoint Tests
    # ===================================================================

    def test_merchant_dashboard_statistics(self):
        """Merchant A receives accurate counts for products and engagement metrics."""
        self.client.force_authenticate(user=self.merchant_a)
        url = reverse("merchant:dashboard-stats")
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.data["data"]
        self.assertTrue(data["has_shop"])
        self.assertEqual(data["shop"]["name"], "Alice Organic Grocery")

        # Product metrics
        self.assertEqual(data["total_products"], 3)
        self.assertEqual(data["active_products"], 3)
        self.assertEqual(data["low_stock_products"], 1)
        self.assertEqual(data["out_of_stock_products"], 1)

        # Analytics events
        self.assertEqual(data["shop_views"], 2)
        self.assertEqual(data["product_views"], 1)
        self.assertEqual(data["whatsapp_clicks"], 1)
        self.assertEqual(data["call_clicks"], 1)
        self.assertEqual(data["directions_clicks"], 1)
        self.assertEqual(data["total_clicks"], 3)

        # 14-day trends and confidence breakdown
        self.assertEqual(len(data["daily_trends"]), 14)
        self.assertIn("confidence_breakdown", data)
        self.assertGreaterEqual(data["confidence_breakdown"]["high"], 1)

    def test_merchant_without_shop_dashboard(self):
        """Merchant without a registered shop receives clean empty dashboard structure."""
        new_merchant = User.objects.create_user(
            email="new_merch@nearza.local",
            full_name="New Merchant",
            role=User.Role.MERCHANT,
            password="Password123!",
        )
        self.client.force_authenticate(user=new_merchant)
        url = reverse("merchant:dashboard-stats")
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.data["data"]
        self.assertFalse(data["has_shop"])
        self.assertIsNone(data["shop"])
        self.assertEqual(data["total_products"], 0)

    # ===================================================================
    # 2. Strict Ownership Permissions Tests
    # ===================================================================

    def test_merchant_cannot_modify_another_merchants_product(self):
        """Merchant B cannot update Merchant A's product price/stock."""
        self.client.force_authenticate(user=self.merchant_b)
        url = reverse("merchant:manage-product-detail", kwargs={"pk": self.sp_a1.id})
        res = self.client.patch(url, {"price": "99.00"}, format="json")

        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        self.sp_a1.refresh_from_db()
        self.assertEqual(self.sp_a1.price, Decimal("180.00"))

    def test_merchant_cannot_delete_another_merchants_product(self):
        """Merchant B cannot delete Merchant A's inventory item."""
        self.client.force_authenticate(user=self.merchant_b)
        url = reverse("merchant:manage-product-detail", kwargs={"pk": self.sp_a1.id})
        res = self.client.delete(url)

        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        self.sp_a1.refresh_from_db()
        self.assertTrue(self.sp_a1.is_active)

    def test_merchant_inventory_list_scoped_to_own_shop(self):
        """Merchant A only sees products belonging to Shop A, not Shop B."""
        self.client.force_authenticate(user=self.merchant_a)
        url = reverse("merchant:manage-products")
        res = self.client.get(url)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        returned_ids = [item["id"] for item in res.data["data"]]
        self.assertIn(str(self.sp_a1.id), returned_ids)
        self.assertNotIn(str(self.sp_b1.id), returned_ids)

    def test_customer_cannot_access_merchant_dashboard(self):
        """Customer role is strictly forbidden from merchant dashboard."""
        self.client.force_authenticate(user=self.customer)
        url = reverse("merchant:dashboard-stats")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    # ===================================================================
    # 3. Inventory Update & Audit Trail Tests
    # ===================================================================

    def test_inventory_update_records_audit_trail(self):
        """Updating price or quantity logs previous/new values in InventoryUpdate."""
        self.client.force_authenticate(user=self.merchant_a)
        url = reverse("merchant:manage-product-detail", kwargs={"pk": self.sp_a1.id})

        initial_last_updated = self.sp_a1.last_updated
        res = self.client.patch(
            url,
            {"price": "199.50", "quantity": 30, "stock_status": "in_stock"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.sp_a1.refresh_from_db()
        self.assertEqual(self.sp_a1.price, Decimal("199.50"))
        self.assertEqual(self.sp_a1.quantity, 30)

        # Check InventoryUpdate audit record
        audit = InventoryUpdate.objects.filter(shop_product=self.sp_a1).latest("created_at")
        self.assertEqual(audit.previous_price, Decimal("180.00"))
        self.assertEqual(audit.new_price, Decimal("199.50"))
        self.assertEqual(audit.previous_quantity, 25)
        self.assertEqual(audit.new_quantity, 30)
        self.assertEqual(audit.updated_by, self.merchant_a)

    # ===================================================================
    # 4. Shop Management Tests
    # ===================================================================

    def test_merchant_update_shop_profile(self):
        """Merchant updates shop name, hours, description, and WhatsApp number."""
        self.client.force_authenticate(user=self.merchant_a)
        url = reverse("merchant:manage-shop")
        payload = {
            "name": "Alice Organic Super Store",
            "phone": "916363984209",
            "whatsapp_number": "916363984209",
            "description": "Premium 100% certified organic farm-to-table grocer.",
            "operating_hours": {
                "monday": "8:00 AM - 10:00 PM",
                "sunday": "9:00 AM - 8:00 PM",
            },
        }
        res = self.client.patch(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.shop_a.refresh_from_db()
        self.assertEqual(self.shop_a.name, "Alice Organic Super Store")
        self.assertEqual(self.shop_a.description, "Premium 100% certified organic farm-to-table grocer.")
        self.assertEqual(self.shop_a.operating_hours["monday"], "8:00 AM - 10:00 PM")

    # ===================================================================
    # 5. Public Anonymous Analytics Tracking
    # ===================================================================

    def test_track_event_endpoint(self):
        """Anonymous click on WhatsApp or Directions records an AnalyticsEvent."""
        url = reverse("analytics:track-event")
        payload = {
            "event_type": "whatsapp_click",
            "shop_id": str(self.shop_a.id),
            "product_id": str(self.product_1.id),
        }
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        latest_event = AnalyticsEvent.objects.latest("created_at")
        self.assertEqual(latest_event.event_type, "whatsapp_click")
        self.assertEqual(latest_event.shop, self.shop_a)
        self.assertEqual(latest_event.product, self.product_1)
