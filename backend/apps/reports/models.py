"""
Nearza — Reports App Models
"""

import uuid

from django.conf import settings
from django.db import models


class Report(models.Model):
    """User-submitted report for incorrect information."""

    class ReportType(models.TextChoices):
        PRODUCT = "product", "Product"
        SHOP = "shop", "Shop"
        REVIEW = "review", "Review"
        PRICE = "price", "Price"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        REVIEWED = "reviewed", "Reviewed"
        RESOLVED = "resolved", "Resolved"
        DISMISSED = "dismissed", "Dismissed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="submitted_reports",
    )
    report_type = models.CharField(
        max_length=20, choices=ReportType.choices, db_index=True
    )
    target_id = models.UUIDField(db_index=True)
    reason = models.CharField(max_length=100)
    description = models.TextField(blank=True, default="")
    status = models.CharField(
        max_length=20, choices=Status.choices,
        default=Status.PENDING, db_index=True,
    )
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="resolved_reports",
    )
    resolution_notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "reports"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.report_type}] {self.reason} — {self.status}"
