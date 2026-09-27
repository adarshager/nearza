"""
Nearza — Analytics App Models
AnalyticsEvent for tracking shop views, product views, and contact clicks (WhatsApp, Call, Directions).
"""

import uuid
from django.conf import settings
from django.db import models


class AnalyticsEvent(models.Model):
    """Event log for anonymous engagement and conversion metrics."""

    class EventType(models.TextChoices):
        SHOP_VIEW = "shop_view", "Shop View"
        PRODUCT_VIEW = "product_view", "Product View"
        WHATSAPP_CLICK = "whatsapp_click", "WhatsApp Click"
        CALL_CLICK = "call_click", "Call Click"
        DIRECTIONS_CLICK = "directions_click", "Directions Click"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_type = models.CharField(
        max_length=30,
        choices=EventType.choices,
        db_index=True,
    )
    shop = models.ForeignKey(
        "shops.Shop",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="analytics_events",
    )
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="analytics_events",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="analytics_events",
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "analytics_events"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["shop", "event_type", "created_at"], name="idx_analytics_shop_evt"),
        ]

    def __str__(self):
        return f"{self.event_type} @ {self.shop_id} ({self.created_at})"
