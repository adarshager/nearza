"""
Nearza — Reviews Serializers
"""

from rest_framework import serializers
from .models import Review
from apps.accounts.serializers import UserMiniSerializer


class ReviewSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "user",
            "shop",
            "rating",
            "comment",
            "is_approved",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "is_approved", "created_at", "updated_at"]

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Rating must be between 1 and 5 stars.")
        return value

    def validate_comment(self, value):
        # Basic sanitization
        return value.strip()
