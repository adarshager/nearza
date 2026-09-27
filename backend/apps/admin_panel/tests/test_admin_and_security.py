"""
Nearza — Comprehensive Admin & Security Audit Test Suite
Tests:
- RBAC permissions (Anonymous, Customer, Merchant, Admin) across all administrative endpoints
- Merchant verification (pending, approved, rejected, suspended)
- Product & Category moderation
- User reports (incorrect_price, wrong_stock, fake_shop, inappropriate_content, other)
- Review moderation & IDOR ownership protections
- Audit logging verification (AdminAction creation)
- Privilege escalation defense during registration
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.admin_panel.models import AdminAction
from apps.shops.models import Shop
from apps.products.models import Product, Category
from apps.reports.models import Report
from apps.reviews.models import Review

User = get_user_model()


class AdminSecurityAuditTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # 1. Admin User
        self.admin = User.objects.create_user(
            email="admin@nearza.local",
            password="AdminPassword123!",
            full_name="Super Administrator",
            role="admin",
            is_staff=True,
        )

        # 2. Merchant User
        self.merchant = User.objects.create_user(
            email="merchant@nearza.local",
            password="MerchantPassword123!",
            full_name="Merchant Bob",
            role="merchant",
        )

        # 3. Customer Users (2 distinct customers for IDOR testing)
        self.customer1 = User.objects.create_user(
            email="customer1@nearza.local",
            password="CustomerPassword123!",
            full_name="Alice Customer",
            role="customer",
        )
        self.customer2 = User.objects.create_user(
            email="customer2@nearza.local",
            password="CustomerPassword123!",
            full_name="David Customer",
            role="customer",
        )

        # Setup Category, Shop, Product
        self.category = Category.objects.create(name="Dairy & Cold", slug="dairy-cold")
        self.shop = Shop.objects.create(
            merchant=self.merchant,
            name="Bob's Hypermarket",
            slug="bobs-hypermarket",
            address="456 MG Road",
            city="Bengaluru",
            phone="9876543210",
            whatsapp_number="9876543210",
            verification_status=Shop.VerificationStatus.PENDING,
        )
        self.product = Product.objects.create(
            name="Organic Cow Milk 1L",
            slug="organic-cow-milk-1l",
            category=self.category,
            unit="L",
            unit_value=1,
            is_active=True,
        )

    # ===================================================================
    # Test 1: RBAC on Admin Dashboard Stats
    # ===================================================================
    def test_admin_stats_rbac(self):
        # Anonymous -> 401
        res_anon = self.client.get("/api/admin-panel/stats/")
        self.assertEqual(res_anon.status_code, status.HTTP_401_UNAUTHORIZED)

        # Customer -> 403 Forbidden
        self.client.force_authenticate(user=self.customer1)
        res_cust = self.client.get("/api/admin-panel/stats/")
        self.assertEqual(res_cust.status_code, status.HTTP_403_FORBIDDEN)

        # Merchant -> 403 Forbidden
        self.client.force_authenticate(user=self.merchant)
        res_merch = self.client.get("/api/admin-panel/stats/")
        self.assertEqual(res_merch.status_code, status.HTTP_403_FORBIDDEN)

        # Admin -> 200 OK with all stats sections
        self.client.force_authenticate(user=self.admin)
        res_admin = self.client.get("/api/admin-panel/stats/")
        self.assertEqual(res_admin.status_code, status.HTTP_200_OK)
        data = res_admin.data["data"]
        self.assertIn("users", data)
        self.assertIn("merchants", data)
        self.assertIn("shops", data)
        self.assertIn("products", data)
        self.assertIn("reports", data)
        self.assertIn("reviews", data)
        self.assertIn("activity", data)

    # ===================================================================
    # Test 2: Merchant Verification & Audit Logging
    # ===================================================================
    def test_merchant_verification_and_audit(self):
        # Non-admin cannot verify
        self.client.force_authenticate(user=self.customer1)
        res_denied = self.client.post(
            f"/api/admin-panel/merchants/{self.shop.id}/verify/",
            {"status": "approved", "notes": "Hacked verification"},
        )
        self.assertEqual(res_denied.status_code, status.HTTP_403_FORBIDDEN)

        # Admin approves shop
        self.client.force_authenticate(user=self.admin)
        res_approve = self.client.post(
            f"/api/admin-panel/merchants/{self.shop.id}/verify/",
            {"status": "approved", "notes": "Valid trade license verified"},
        )
        self.assertEqual(res_approve.status_code, status.HTTP_200_OK)
        self.shop.refresh_from_db()
        self.assertEqual(self.shop.verification_status, Shop.VerificationStatus.APPROVED)
        self.assertTrue(self.shop.is_active)

        # Verify Audit Log was recorded
        audit = AdminAction.objects.filter(
            action_type="merchant_verify",
            target_id=self.shop.id,
            admin=self.admin,
        ).first()
        self.assertIsNotNone(audit)
        self.assertEqual(audit.details["new_status"], "approved")

        # Admin suspends shop
        res_suspend = self.client.post(
            f"/api/admin-panel/merchants/{self.shop.id}/verify/",
            {"status": "suspended", "notes": "Multiple fraud complaints"},
        )
        self.assertEqual(res_suspend.status_code, status.HTTP_200_OK)
        self.shop.refresh_from_db()
        self.assertEqual(self.shop.verification_status, Shop.VerificationStatus.SUSPENDED)
        self.assertFalse(self.shop.is_active)

    # ===================================================================
    # Test 2B: Merchant Filtering Pipeline (All, Approved, Rejected, Suspended)
    # ===================================================================
    def test_admin_merchant_filtering_pipeline(self):
        """
        Verify the entire filtering pipeline:
        - RBAC authorization check
        - All returns all merchants
        - Approved returns only approved merchants
        - Rejected returns only rejected merchants
        - Suspended returns only suspended merchants
        - Pending returns only pending merchants
        - Case insensitivity ('APPROVED', 'Approved', etc.)
        - Invalid status returns 400 Bad Request
        - Independent counts returned
        - Search + status combined filtering
        - Pagination metadata and slicing
        """
        # Create additional test shops with distinct verification statuses
        shop_appr = Shop.objects.create(
            merchant=self.merchant,
            name="Alpha Approved Superstore",
            slug="alpha-approved-superstore",
            address="12 MG Road",
            city="Bengaluru",
            phone="9111111111",
            verification_status=Shop.VerificationStatus.APPROVED,
        )
        shop_rej = Shop.objects.create(
            merchant=self.merchant,
            name="Beta Rejected Traders",
            slug="beta-rejected-traders",
            address="14 Residency Road",
            city="Mysuru",
            phone="9222222222",
            verification_status=Shop.VerificationStatus.REJECTED,
        )
        shop_susp = Shop.objects.create(
            merchant=self.merchant,
            name="Gamma Suspended Mart",
            slug="gamma-suspended-mart",
            address="16 Brigade Road",
            city="Bengaluru",
            phone="9333333333",
            verification_status=Shop.VerificationStatus.SUSPENDED,
        )

        # 1. RBAC Check: Anonymous -> 401, Customer -> 403
        res_anon = self.client.get("/api/admin-panel/merchants/")
        self.assertEqual(res_anon.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(user=self.customer1)
        res_cust = self.client.get("/api/admin-panel/merchants/")
        self.assertEqual(res_cust.status_code, status.HTTP_403_FORBIDDEN)

        # 2. Admin Check: All merchants
        self.client.force_authenticate(user=self.admin)
        res_all = self.client.get("/api/admin-panel/merchants/")
        self.assertEqual(res_all.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(res_all.data["count"], 4)
        
        # Verify independent counts
        counts = res_all.data["counts"]
        self.assertIn("all", counts)
        self.assertIn("approved", counts)
        self.assertIn("rejected", counts)
        self.assertIn("suspended", counts)
        self.assertIn("pending", counts)
        self.assertGreaterEqual(counts["approved"], 1)
        self.assertGreaterEqual(counts["rejected"], 1)
        self.assertGreaterEqual(counts["suspended"], 1)
        self.assertGreaterEqual(counts["pending"], 1)

        # Also test explicit status=all
        res_explicit_all = self.client.get("/api/admin-panel/merchants/?status=all")
        self.assertEqual(res_explicit_all.status_code, status.HTTP_200_OK)
        self.assertEqual(res_explicit_all.data["count"], res_all.data["count"])

        # 3. Filter: Approved only
        res_appr = self.client.get("/api/admin-panel/merchants/?status=approved")
        self.assertEqual(res_appr.status_code, status.HTTP_200_OK)
        for item in res_appr.data["results"]:
            self.assertEqual(item["verification_status"], "approved")
        returned_ids = [item["id"] for item in res_appr.data["results"]]
        self.assertIn(str(shop_appr.id), returned_ids)
        self.assertNotIn(str(shop_rej.id), returned_ids)
        self.assertNotIn(str(shop_susp.id), returned_ids)

        # 4. Filter: Case insensitivity (APPROVED)
        res_appr_upper = self.client.get("/api/admin-panel/merchants/?status=APPROVED")
        self.assertEqual(res_appr_upper.status_code, status.HTTP_200_OK)
        self.assertEqual(res_appr_upper.data["count"], res_appr.data["count"])

        # 5. Filter: Rejected only
        res_rej = self.client.get("/api/admin-panel/merchants/?status=rejected")
        self.assertEqual(res_rej.status_code, status.HTTP_200_OK)
        for item in res_rej.data["results"]:
            self.assertEqual(item["verification_status"], "rejected")
        rej_ids = [item["id"] for item in res_rej.data["results"]]
        self.assertIn(str(shop_rej.id), rej_ids)
        self.assertNotIn(str(shop_appr.id), rej_ids)

        # 6. Filter: Suspended only
        res_susp = self.client.get("/api/admin-panel/merchants/?status=suspended")
        self.assertEqual(res_susp.status_code, status.HTTP_200_OK)
        for item in res_susp.data["results"]:
            self.assertEqual(item["verification_status"], "suspended")
        susp_ids = [item["id"] for item in res_susp.data["results"]]
        self.assertIn(str(shop_susp.id), susp_ids)
        self.assertNotIn(str(shop_appr.id), susp_ids)

        # 7. Filter: Pending only
        res_pend = self.client.get("/api/admin-panel/merchants/?status=pending")
        self.assertEqual(res_pend.status_code, status.HTTP_200_OK)
        for item in res_pend.data["results"]:
            self.assertEqual(item["verification_status"], "pending")

        # 8. Filter: Invalid status returns 400 Bad Request
        res_inv = self.client.get("/api/admin-panel/merchants/?status=invalid_status_xyz")
        self.assertEqual(res_inv.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", res_inv.data)

        # 9. Search + Filter Combination:
        # Search for "Alpha" with status=approved -> matches Alpha Approved
        res_search_appr = self.client.get("/api/admin-panel/merchants/?status=approved&q=Alpha")
        self.assertEqual(res_search_appr.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_search_appr.data["results"]), 1)
        self.assertEqual(res_search_appr.data["results"][0]["name"], "Alpha Approved Superstore")

        # Search for "Beta" (which is rejected) with status=approved -> returns 0 results
        res_search_rej_in_appr = self.client.get("/api/admin-panel/merchants/?status=approved&q=Beta")
        self.assertEqual(res_search_rej_in_appr.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_search_rej_in_appr.data["results"]), 0)

        # 10. Pagination metadata
        res_page = self.client.get("/api/admin-panel/merchants/?page=1&page_size=2")
        self.assertEqual(res_page.status_code, status.HTTP_200_OK)
        self.assertEqual(res_page.data["current_page"], 1)
        self.assertEqual(res_page.data["page_size"], 2)
        self.assertLessEqual(len(res_page.data["results"]), 2)
        self.assertGreaterEqual(res_page.data["total_pages"], 2)

    # ===================================================================
    # Test 3: Product & Category Moderation
    # ===================================================================
    def test_product_and_category_moderation(self):
        self.client.force_authenticate(user=self.admin)

        # Toggle product active
        res_prod = self.client.patch(f"/api/admin-panel/products/{self.product.id}/toggle-status/")
        self.assertEqual(res_prod.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertFalse(self.product.is_active)

        # Audit log created for product moderation
        self.assertTrue(
            AdminAction.objects.filter(action_type="product_toggle_active", target_id=self.product.id).exists()
        )

        # Add category
        res_cat = self.client.post(
            "/api/admin-panel/categories/",
            {"name": "Organic Snacks", "slug": "organic-snacks"},
        )
        self.assertEqual(res_cat.status_code, status.HTTP_201_CREATED)
        new_cat_id = res_cat.data["category"]["id"]

        # Audit log created for category
        self.assertTrue(
            AdminAction.objects.filter(action_type="category_create", target_id=new_cat_id).exists()
        )

    # ===================================================================
    # Test 4: User Reports Submission & Moderation
    # ===================================================================
    def test_user_reports_lifecycle(self):
        # Customer 1 submits an 'incorrect_price' report
        self.client.force_authenticate(user=self.customer1)
        res_rep = self.client.post("/api/reports/", {
            "report_type": "product",
            "target_id": str(self.product.id),
            "reason": "incorrect price",
            "description": "Shelf price was ₹45 but shop charged ₹60.",
        })
        self.assertEqual(res_rep.status_code, status.HTTP_201_CREATED)
        report_id = res_rep.data["data"]["id"]

        # Customer 2 cannot resolve report (403)
        self.client.force_authenticate(user=self.customer2)
        res_resolve_denied = self.client.post(
            f"/api/admin-panel/reports/{report_id}/resolve/",
            {"status": "resolved", "resolution_notes": "Attempted resolution"},
        )
        self.assertEqual(res_resolve_denied.status_code, status.HTTP_403_FORBIDDEN)

        # Admin resolves report
        self.client.force_authenticate(user=self.admin)
        res_resolve = self.client.post(
            f"/api/admin-panel/reports/{report_id}/resolve/",
            {"status": "resolved", "resolution_notes": "Merchant updated shop pricing."},
        )
        self.assertEqual(res_resolve.status_code, status.HTTP_200_OK)

        report = Report.objects.get(id=report_id)
        self.assertEqual(report.status, Report.Status.RESOLVED)
        self.assertEqual(report.resolved_by, self.admin)
        self.assertTrue(AdminAction.objects.filter(action_type="report_resolve", target_id=report_id).exists())

    # ===================================================================
    # Test 5: Review IDOR Ownership & Moderation
    # ===================================================================
    def test_review_ownership_idor_and_moderation(self):
        # Customer 1 writes review
        self.client.force_authenticate(user=self.customer1)
        res_rev = self.client.post("/api/reviews/", {
            "shop": str(self.shop.id),
            "rating": 5,
            "comment": "Excellent neighborhood shop with prompt service!",
        })
        self.assertEqual(res_rev.status_code, status.HTTP_201_CREATED)
        review_id = res_rev.data["data"]["id"]

        # Customer 2 attempts to DELETE Customer 1's review -> 403 Forbidden (IDOR Defense)
        self.client.force_authenticate(user=self.customer2)
        res_del_denied = self.client.delete(f"/api/reviews/{review_id}/")
        self.assertEqual(res_del_denied.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Review.objects.filter(id=review_id).exists())

        # Admin moderates (unapproves) review
        self.client.force_authenticate(user=self.admin)
        res_mod = self.client.post(
            f"/api/admin-panel/reviews/{review_id}/moderate/",
            {"is_approved": False},
        )
        self.assertEqual(res_mod.status_code, status.HTTP_200_OK)
        review = Review.objects.get(id=review_id)
        self.assertFalse(review.is_approved)

    # ===================================================================
    # Test 6: Privilege Escalation Defense during Registration
    # ===================================================================
    def test_privilege_escalation_registration_defense(self):
        # Malicious payload trying to register directly as an admin
        payload = {
            "email": "hacker@nearza.local",
            "password": "HackerPassword123!",
            "password_confirm": "HackerPassword123!",
            "full_name": "Privilege Escalation Attempt",
            "role": "admin",
        }
        res = self.client.post("/api/auth/register/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email="hacker@nearza.local").exists())

    # ===================================================================
    # Test 7: User Suspension & Admin Self-Suspension Defense
    # ===================================================================
    def test_user_suspension_and_admin_protection(self):
        self.client.force_authenticate(user=self.admin)

        # Suspend customer
        res = self.client.patch(f"/api/admin-panel/users/{self.customer1.id}/toggle-active/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.customer1.refresh_from_db()
        self.assertFalse(self.customer1.is_active)

        # Admin cannot suspend themselves
        res_self = self.client.patch(f"/api/admin-panel/users/{self.admin.id}/toggle-active/")
        self.assertEqual(res_self.status_code, status.HTTP_400_BAD_REQUEST)
        self.admin.refresh_from_db()
        self.assertTrue(self.admin.is_active)
