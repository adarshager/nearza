"""
Nearza — Admin Panel Serializers
Handles full administrative inspection, moderation, and auditing.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import AdminAction
from apps.shops.models import Shop
from apps.products.models import Product, Category
from apps.reports.models import Report
from apps.reviews.models import Review

User = get_user_model()


class AdminActionSerializer(serializers.ModelSerializer):
    admin_email = serializers.CharField(source="admin.email", read_only=True)
    admin_name = serializers.CharField(source="admin.full_name", read_only=True)

    class Meta:
        model = AdminAction
        fields = [
            "id",
            "admin",
            "admin_email",
            "admin_name",
            "action_type",
            "target_type",
            "target_id",
            "details",
            "created_at",
        ]
        read_only_fields = fields


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone",
            "role",
            "is_active",
            "is_email_verified",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AdminShopSerializer(serializers.ModelSerializer):
    merchant = AdminUserSerializer(read_only=True)
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Shop
        fields = [
            "id",
            "merchant",
            "name",
            "slug",
            "description",
            "address",
            "city",
            "state",
            "pincode",
            "phone",
            "whatsapp_number",
            "verification_status",
            "avg_rating",
            "total_reviews",
            "is_active",
            "products_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "merchant", "avg_rating", "total_reviews", "created_at", "updated_at"]

    def get_products_count(self, obj):
        return obj.shop_products.count()


class AdminProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    shops_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "brand",
            "category",
            "category_name",
            "image_url",
            "unit",
            "unit_value",
            "is_active",
            "shops_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_shops_count(self, obj):
        return obj.shop_products.count()


class AdminCategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "icon_url",
            "sort_order",
            "is_active",
            "products_count",
        ]
        read_only_fields = ["id"]

    def get_products_count(self, obj):
        return obj.products.count()


class AdminReportSerializer(serializers.ModelSerializer):
    reporter_email = serializers.CharField(source="reporter.email", read_only=True)
    reporter_name = serializers.CharField(source="reporter.full_name", read_only=True)
    resolved_by_email = serializers.CharField(source="resolved_by.email", read_only=True)

    class Meta:
        model = Report
        fields = [
            "id",
            "reporter",
            "reporter_email",
            "reporter_name",
            "report_type",
            "target_id",
            "reason",
            "description",
            "status",
            "resolved_by",
            "resolved_by_email",
            "resolution_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "reporter", "created_at", "updated_at"]


class AdminReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    shop_name = serializers.CharField(source="shop.name", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "user",
            "user_email",
            "user_name",
            "shop",
            "shop_name",
            "rating",
            "comment",
            "is_approved",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "shop", "created_at", "updated_at"]
