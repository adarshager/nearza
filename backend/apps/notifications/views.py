"""
Nearza — Notifications Views
API endpoints for managing user in-app notifications.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(APIView):
    """
    List user notifications and unread count.
    Seeds sample starter notifications if user has none.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        notifications = Notification.objects.filter(user=user)

        # Seed welcome/hyperlocal notification if user has none
        if not notifications.exists():
            Notification.objects.bulk_create([
                Notification(
                    user=user,
                    title="Welcome to Nearza Hyperlocal!",
                    message="Compare prices across nearby shops, check real-time inventory confidence, and contact local store owners directly via WhatsApp.",
                    notification_type="system",
                    is_read=False,
                    data={"route": "/nearby"},
                ),
                Notification(
                    user=user,
                    title="Local Price Drop Alert",
                    message="Fresh milk & dairy prices dropped by 8% at nearby verified marts in your neighborhood.",
                    notification_type="price_drop",
                    is_read=False,
                    data={"route": "/search?q=milk"},
                ),
                Notification(
                    user=user,
                    title="Inventory Verified Nearby",
                    message="3 local shops updated their inventory confidence within 500m of your location.",
                    notification_type="restock",
                    is_read=True,
                    data={"route": "/nearby"},
                ),
            ])
            notifications = Notification.objects.filter(user=user)

        unread_count = notifications.filter(is_read=False).count()
        serializer = NotificationSerializer(notifications, many=True)

        return Response({
            "status": "success",
            "unread_count": unread_count,
            "count": notifications.count(),
            "results": serializer.data,
        })


class NotificationMarkReadView(APIView):
    """Mark a single notification as read."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        notif = get_object_or_404(Notification, id=pk, user=request.user)
        notif.is_read = True
        notif.save(update_fields=["is_read"])
        return Response({"status": "success", "message": "Marked as read."})


class NotificationMarkAllReadView(APIView):
    """Mark all notifications for the user as read."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"status": "success", "message": "All notifications marked as read."})


class NotificationDeleteView(APIView):
    """Delete a single notification."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        notif = get_object_or_404(Notification, id=pk, user=request.user)
        notif.delete()
        return Response({"status": "success", "message": "Notification deleted."})
