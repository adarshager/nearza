"""
Nearza — Comprehensive Authentication & Authorization Tests
Tests: Registration, Login, Token Refresh, Profile Retrieval & Update,
Role Escalation Protection, Password Reset, and Role-Based Route Protection.
"""

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthenticationTests(APITestCase):
    """Test suite for authentication workflows."""

    def setUp(self):
        self.register_url = reverse("accounts:register")
        self.login_url = reverse("accounts:login")
        self.logout_url = reverse("accounts:logout")
        self.profile_url = reverse("accounts:profile")
        self.password_change_url = reverse("accounts:password-change")
        self.password_reset_url = reverse("accounts:password-reset-request")
        self.password_reset_confirm_url = reverse("accounts:password-reset-confirm")

        self.customer_password = "SecurePassword123!"
        self.customer_user = User.objects.create_user(
            email="customer@nearza.local",
            full_name="Alice Customer",
            role=User.Role.CUSTOMER,
            password=self.customer_password,
        )

        self.merchant_password = "MerchantPass123!"
        self.merchant_user = User.objects.create_user(
            email="merchant@nearza.local",
            full_name="Bob Merchant",
            role=User.Role.MERCHANT,
            password=self.merchant_password,
        )

        self.admin_password = "AdminPassword123!"
        self.admin_user = User.objects.create_user(
            email="admin@nearza.local",
            full_name="Carol Admin",
            role=User.Role.ADMIN,
            is_staff=True,
            password=self.admin_password,
        )

    def test_customer_registration_success(self):
        """Customers can register with valid credentials."""
        payload = {
            "email": "newcustomer@nearza.local",
            "full_name": "New Customer",
            "phone": "9876543210",
            "role": "customer",
            "password": "Password1234!",
            "password_confirm": "Password1234!",
        }
        response = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "success")
        self.assertEqual(response.data["data"]["user"]["role"], "customer")
        self.assertIn("tokens", response.data["data"])
        self.assertIn("access", response.data["data"]["tokens"])

    def test_merchant_registration_success(self):
        """Merchants can register with valid credentials."""
        payload = {
            "email": "newmerchant@nearza.local",
            "full_name": "New Merchant Store",
            "phone": "9876543211",
            "role": "merchant",
            "password": "Password1234!",
            "password_confirm": "Password1234!",
        }
        response = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["data"]["user"]["role"], "merchant")

    def test_admin_registration_forbidden(self):
        """Registering with admin role must be rejected by backend."""
        payload = {
            "email": "fakeadmin@nearza.local",
            "full_name": "Hacker Trying Admin",
            "role": "admin",
            "password": "Password1234!",
            "password_confirm": "Password1234!",
        }
        response = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(email="fakeadmin@nearza.local").exists())

    def test_password_mismatch_registration_fails(self):
        """Registration fails if passwords do not match."""
        payload = {
            "email": "mismatch@nearza.local",
            "full_name": "Mismatch User",
            "role": "customer",
            "password": "Password1234!",
            "password_confirm": "DifferentPassword1234!",
        }
        response = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        """Users can log in and receive JWT tokens."""
        payload = {
            "email": "customer@nearza.local",
            "password": self.customer_password,
        }
        response = self.client.post(self.login_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "success")
        self.assertIn("tokens", response.data["data"])
        self.assertIn("access", response.data["data"]["tokens"])
        self.assertIn("refresh", response.data["data"]["tokens"])
        self.assertEqual(response.data["data"]["user"]["email"], "customer@nearza.local")

    def test_login_invalid_password(self):
        """Invalid credentials return 401 unauthorized."""
        payload = {
            "email": "customer@nearza.local",
            "password": "WrongPassword999!",
        }
        response = self.client.post(self.login_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        """Refresh token generates a new access token."""
        login_res = self.client.post(
            self.login_url,
            {"email": "customer@nearza.local", "password": self.customer_password},
            format="json",
        )
        refresh_token = login_res.data["data"]["tokens"]["refresh"]

        refresh_url = reverse("accounts:token-refresh")
        response = self.client.post(refresh_url, {"refresh": refresh_token}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_profile_retrieval(self):
        """Authenticated users can retrieve their profile."""
        self.client.force_authenticate(user=self.customer_user)
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["email"], "customer@nearza.local")
        self.assertEqual(response.data["data"]["role"], "customer")

    def test_profile_update_ignores_role_tampering(self):
        """Backend never trusts role changes sent in profile updates."""
        self.client.force_authenticate(user=self.customer_user)
        payload = {
            "full_name": "Alice Updated",
            "role": "admin",  # Attacker attempts privilege escalation
        }
        response = self.client.patch(self.profile_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["full_name"], "Alice Updated")
        # Role must remain customer
        self.customer_user.refresh_from_db()
        self.assertEqual(self.customer_user.role, "customer")
        self.assertEqual(response.data["data"]["role"], "customer")

    def test_password_change_success(self):
        """User can change password with correct current password."""
        self.client.force_authenticate(user=self.customer_user)
        payload = {
            "old_password": self.customer_password,
            "new_password": "BrandNewPassword123!",
            "new_password_confirm": "BrandNewPassword123!",
        }
        response = self.client.post(self.password_change_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Login with new password works
        self.client.logout()
        login_res = self.client.post(
            self.login_url,
            {"email": "customer@nearza.local", "password": "BrandNewPassword123!"},
            format="json",
        )
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)

    def test_password_reset_flow(self):
        """Forgot password flow requests token and completes reset."""
        # 1. Request reset
        res = self.client.post(
            self.password_reset_url,
            {"email": "customer@nearza.local"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        token_data = res.data.get("data")
        self.assertIsNotNone(token_data)

        # 2. Confirm reset
        confirm_payload = {
            "uidb64": token_data["uidb64"],
            "token": token_data["token"],
            "new_password": "ResetPassword123!",
            "new_password_confirm": "ResetPassword123!",
        }
        confirm_res = self.client.post(
            self.password_reset_confirm_url,
            confirm_payload,
            format="json",
        )
        self.assertEqual(confirm_res.status_code, status.HTTP_200_OK)

        # 3. Verify user can log in with new password
        login_res = self.client.post(
            self.login_url,
            {"email": "customer@nearza.local", "password": "ResetPassword123!"},
            format="json",
        )
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)


class RoleBasedAccessControlTests(APITestCase):
    """Test suite for server-side Role-Based Access Control (RBAC)."""

    def setUp(self):
        self.customer_user = User.objects.create_user(
            email="cust@nearza.local",
            full_name="Cust User",
            role=User.Role.CUSTOMER,
            password="Password123!",
        )
        self.merchant_user = User.objects.create_user(
            email="merch@nearza.local",
            full_name="Merch User",
            role=User.Role.MERCHANT,
            password="Password123!",
        )
        self.admin_user = User.objects.create_user(
            email="admin@nearza.local",
            full_name="Admin User",
            role=User.Role.ADMIN,
            is_staff=True,
            password="Password123!",
        )

        self.customer_endpoint = reverse("accounts:protected-customer")
        self.merchant_endpoint = reverse("accounts:protected-merchant")
        self.admin_endpoint = reverse("accounts:protected-admin")

    def test_unauthenticated_requests_rejected(self):
        """Unauthenticated requests are rejected with 401."""
        self.assertEqual(self.client.get(self.customer_endpoint).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.get(self.merchant_endpoint).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.get(self.admin_endpoint).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_customer_role_permissions(self):
        """Customers can only access customer endpoints; rejected on merchant/admin endpoints."""
        self.client.force_authenticate(user=self.customer_user)
        self.assertEqual(self.client.get(self.customer_endpoint).status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get(self.merchant_endpoint).status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.get(self.admin_endpoint).status_code, status.HTTP_403_FORBIDDEN)

    def test_merchant_role_permissions(self):
        """Merchants can only access merchant endpoints; rejected on customer/admin endpoints."""
        self.client.force_authenticate(user=self.merchant_user)
        self.assertEqual(self.client.get(self.merchant_endpoint).status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get(self.customer_endpoint).status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.client.get(self.admin_endpoint).status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_role_permissions(self):
        """Admins can access admin endpoints."""
        self.client.force_authenticate(user=self.admin_user)
        self.assertEqual(self.client.get(self.admin_endpoint).status_code, status.HTTP_200_OK)
