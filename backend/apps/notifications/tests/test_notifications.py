"""
Tests for Notifications API.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.notifications.models import Notification

User = get_user_model()


class NotificationsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="notify@nearza.local",
            password="testpassword123",
            full_name="Notify User",
            role="customer",
        )
        self.client.force_authenticate(user=self.user)

    def test_list_notifications_seeds_welcome(self):
        res = self.client.get("/api/notifications/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreater(res.data["count"], 0)
        self.assertIn("unread_count", res.data)

    def test_mark_all_read(self):
        # Create unread notification
        Notification.objects.create(
            user=self.user,
            title="Test alert",
            message="Test msg",
            notification_type="deal",
            is_read=False,
        )
        res = self.client.post("/api/notifications/mark-all-read/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(Notification.objects.filter(user=self.user, is_read=False).exists())
