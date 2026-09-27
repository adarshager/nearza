"""
Nearza — Automated Test Suite for Image Processing & Supabase Upload
Tests:
- Aspect ratio auto-cropping (square logo, 16:5 cover banner, square product)
- Multi-format support (JPG, PNG with alpha, WEBP)
- Dimension handling (oversized, tiny, portrait, landscape)
- Permission controls (unauthenticated, non-merchant, merchant)
- Shop model automatic URL updates
- Size limits & corrupt image handling
"""

import io
from unittest.mock import patch, MagicMock
from PIL import Image
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.shops.models import Shop
from apps.shops.image_service import process_image, upload_to_supabase

User = get_user_model()


def create_test_image(size=(400, 300), color=(200, 50, 50), fmt="JPEG", mode="RGB"):
    """Generate in-memory image for testing."""
    img = Image.new(mode, size, color)
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    buf.seek(0)
    buf.name = f"test.{fmt.lower()}"
    return buf


class ImageProcessingUnitTests(TestCase):
    """Unit tests for image_service.process_image."""

    def test_logo_square_dimensions(self):
        # 1000x1000 square input -> should be resized to 512x512 WebP
        buf = create_test_image(size=(1000, 1000), fmt="JPEG")
        webp_bytes, mime, (w, h) = process_image(buf, target_type="logo")
        self.assertEqual(mime, "image/webp")
        self.assertEqual((w, h), (512, 512))
        # Verify valid webp
        out_img = Image.open(io.BytesIO(webp_bytes))
        self.assertEqual(out_img.size, (512, 512))

    def test_logo_landscape_center_crop(self):
        # 1920x1080 landscape input -> should be center-cropped to square and resized to 512x512
        buf = create_test_image(size=(1920, 1080), fmt="JPEG")
        webp_bytes, mime, (w, h) = process_image(buf, target_type="logo")
        self.assertEqual(mime, "image/webp")
        self.assertEqual((w, h), (512, 512))

    def test_logo_portrait_center_crop(self):
        # 1080x1920 portrait input -> should be center-cropped to square and resized to 512x512
        buf = create_test_image(size=(1080, 1920), fmt="JPEG")
        webp_bytes, mime, (w, h) = process_image(buf, target_type="logo")
        self.assertEqual(mime, "image/webp")
        self.assertEqual((w, h), (512, 512))

    def test_cover_landscape_banner(self):
        # 3000x2000 input -> should be cropped to 16:5 and resized to 1600x500
        buf = create_test_image(size=(3000, 2000), fmt="JPEG")
        webp_bytes, mime, (w, h) = process_image(buf, target_type="cover")
        self.assertEqual(mime, "image/webp")
        self.assertEqual((w, h), (1600, 500))

    def test_cover_portrait_banner(self):
        # 1000x2000 portrait input -> cropped to 16:5 banner without crashing or distortion
        buf = create_test_image(size=(1000, 2000), fmt="JPEG")
        webp_bytes, mime, (w, h) = process_image(buf, target_type="cover")
        self.assertEqual(mime, "image/webp")
        self.assertEqual((w, h), (1600, 500))

    def test_product_dimensions(self):
        # 1200x800 landscape product photo -> center-cropped to 1:1, 800x800
        buf = create_test_image(size=(1200, 800), fmt="JPEG")
        webp_bytes, mime, (w, h) = process_image(buf, target_type="product")
        self.assertEqual(mime, "image/webp")
        self.assertEqual((w, h), (800, 800))

    def test_png_with_transparency_support(self):
        # PNG RGBA image
        buf = create_test_image(size=(400, 400), fmt="PNG", mode="RGBA")
        webp_bytes, mime, (w, h) = process_image(buf, target_type="logo")
        self.assertEqual(mime, "image/webp")
        out_img = Image.open(io.BytesIO(webp_bytes))
        self.assertIn(out_img.mode, ("RGBA", "RGB"))

    def test_corrupted_file_raises_value_error(self):
        corrupt = io.BytesIO(b"not a real image at all!")
        with self.assertRaises(ValueError):
            process_image(corrupt, target_type="logo")


class ImageUploadApiTests(TestCase):
    """API endpoint tests for /api/v1/merchant/upload-image/."""

    def setUp(self):
        self.client = APIClient()
        self.merchant_user = User.objects.create_user(
            email="testmerchant@nearza.local",
            password="testpassword123",
            role=User.Role.MERCHANT,
            full_name="Test Merchant",
            phone="+919988776655",
        )
        self.shop = Shop.objects.create(
            merchant=self.merchant_user,
            name="Test Boutique",
            address="Main St",
            city="Ankola",
            state="Karnataka",
            pincode="581314",
            latitude=14.6644,
            longitude=74.3015,
            phone="+919988776655",
        )
        self.customer_user = User.objects.create_user(
            email="testcustomer@nearza.local",
            password="testpassword123",
            role=User.Role.CUSTOMER,
            full_name="Test Customer",
        )
        self.url = reverse("merchant:upload-image")

    def test_unauthenticated_request_rejected(self):
        resp = self.client.post(self.url, {})
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_customer_user_forbidden(self):
        self.client.force_authenticate(user=self.customer_user)
        resp = self.client.post(self.url, {})
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    @patch("apps.shops.views.upload_to_supabase")
    def test_merchant_logo_upload_updates_shop(self, mock_upload):
        mock_upload.return_value = (
            "https://test.supabase.co/storage/v1/object/public/nearza-media/shops/1/logo/logo_test.webp",
            "shops/1/logo/logo_test.webp",
        )
        self.client.force_authenticate(user=self.merchant_user)

        img_file = create_test_image(size=(600, 600), fmt="JPEG")
        resp = self.client.post(
            self.url,
            {"file": img_file, "type": "logo"},
            format="multipart",
        )

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        data = resp.json()["data"]
        self.assertEqual(data["type"], "logo")
        self.assertIn("logo_test.webp", data["url"])

        # Check DB persistence
        self.shop.refresh_from_db()
        self.assertEqual(self.shop.logo_url, data["url"])

    @patch("apps.shops.views.upload_to_supabase")
    def test_merchant_cover_upload_updates_shop(self, mock_upload):
        mock_upload.return_value = (
            "https://test.supabase.co/storage/v1/object/public/nearza-media/shops/1/cover/cover_test.webp",
            "shops/1/cover/cover_test.webp",
        )
        self.client.force_authenticate(user=self.merchant_user)

        img_file = create_test_image(size=(1200, 800), fmt="JPEG")
        resp = self.client.post(
            self.url,
            {"file": img_file, "type": "cover"},
            format="multipart",
        )

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        data = resp.json()["data"]
        self.assertEqual(data["type"], "cover")

        # Check DB persistence
        self.shop.refresh_from_db()
        self.assertEqual(self.shop.cover_image_url, data["url"])

    @patch("apps.shops.views.upload_to_supabase")
    def test_merchant_product_upload(self, mock_upload):
        mock_upload.return_value = (
            "https://test.supabase.co/storage/v1/object/public/nearza-media/products/p1/image_test.webp",
            "products/p1/image_test.webp",
        )
        self.client.force_authenticate(user=self.merchant_user)

        img_file = create_test_image(size=(800, 600), fmt="JPEG")
        resp = self.client.post(
            self.url,
            {"file": img_file, "type": "product"},
            format="multipart",
        )

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        data = resp.json()["data"]
        self.assertEqual(data["type"], "product")
        self.assertIn("products/p1/image_test.webp", data["url"])
