"""
Nearza — Admin Panel Models
Admin action audit log.
"""

import uuid

from django.conf import settings
from django.db import models


class AdminAction(models.Model):
    """Audit log for all admin actions on the platform."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="admin_actions",
    )
    action_type = models.CharField(max_length=50, db_index=True)
    target_type = models.CharField(max_length=50, db_index=True)
    target_id = models.UUIDField(db_index=True)
    details = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "admin_actions"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.action_type}] {self.target_type} by {self.admin.email}"


class SearchHistory(models.Model):
    """Tracks user search queries for recent searches feature."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="search_history",
    )
    query = models.CharField(max_length=255)
    filters = models.JSONField(null=True, blank=True)
    results_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "search_history"
        ordering = ["-created_at"]
        verbose_name_plural = "Search histories"

    def __str__(self):
        return f"{self.user.email}: '{self.query}'"
