"""
Nearza — Reports Serializers
"""

from rest_framework import serializers
from .models import Report
from apps.accounts.serializers import UserMiniSerializer


class ReportCreateSerializer(serializers.ModelSerializer):
    """Customer submits a report."""

    class Meta:
        model = Report
        fields = [
            "id",
            "report_type",
            "target_id",
            "reason",
            "description",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def validate_reason(self, value):
        valid_reasons = [
            "incorrect_price",
            "wrong_stock",
            "fake_shop",
            "inappropriate_content",
            "other",
            "incorrect price",
            "wrong stock",
            "fake shop",
            "inappropriate content",
        ]
        if value.lower().strip() not in valid_reasons:
            raise serializers.ValidationError(
                "Reason must be one of: incorrect price, wrong stock, fake shop, inappropriate content, other."
            )
        return value.lower().strip().replace(" ", "_")


class ReportDetailSerializer(serializers.ModelSerializer):
    """Admin inspection of a report with reporter details."""

    reporter = UserMiniSerializer(read_only=True)
    resolved_by = UserMiniSerializer(read_only=True)

    class Meta:
        model = Report
        fields = [
            "id",
            "reporter",
            "report_type",
            "target_id",
            "reason",
            "description",
            "status",
            "resolved_by",
            "resolution_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "reporter", "created_at", "updated_at"]
