"""
Nearza — Shops Serializers
Public discovery and merchant shop management serializers.
"""

from rest_framework import serializers
from .models import Shop, ShopVerification
from .utils import calculate_haversine_distance


class ShopListSerializer(serializers.ModelSerializer):
    """Public serializer for shop discovery and nearby search."""

    distance_km = serializers.SerializerMethodField()
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Shop
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "address",
            "city",
            "state",
            "pincode",
            "latitude",
            "longitude",
            "phone",
            "whatsapp_number",
            "logo_url",
            "cover_image_url",
            "avg_rating",
            "total_reviews",
            "verification_status",
            "distance_km",
            "products_count",
        ]

    def get_distance_km(self, obj):
        user_lat = self.context.get("user_lat")
        user_lon = self.context.get("user_lon")
        if user_lat is not None and user_lon is not None:
            return calculate_haversine_distance(user_lat, user_lon, obj.latitude, obj.longitude)
        return None

    def get_products_count(self, obj):
        if hasattr(obj, "products_count"):
            return obj.products_count
        return obj.shop_products.filter(is_active=True).count()


class ShopDetailSerializer(serializers.ModelSerializer):
    """Detailed view for a specific shop."""

    distance_km = serializers.SerializerMethodField()
    products_count = serializers.SerializerMethodField()
    merchant_name = serializers.CharField(source="merchant.full_name", read_only=True)

    class Meta:
        model = Shop
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "address",
            "city",
            "state",
            "pincode",
            "latitude",
            "longitude",
            "phone",
            "whatsapp_number",
            "logo_url",
            "cover_image_url",
            "operating_hours",
            "avg_rating",
            "total_reviews",
            "verification_status",
            "distance_km",
            "products_count",
            "merchant_name",
            "created_at",
        ]

    def get_distance_km(self, obj):
        user_lat = self.context.get("user_lat")
        user_lon = self.context.get("user_lon")
        if user_lat is not None and user_lon is not None:
            return calculate_haversine_distance(user_lat, user_lon, obj.latitude, obj.longitude)
        return None

    def get_products_count(self, obj):
        return obj.shop_products.filter(is_active=True).count()


class MerchantShopSerializer(serializers.ModelSerializer):
    """Merchant serializer for creating and managing own shop."""

    class Meta:
        model = Shop
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "address",
            "city",
            "state",
            "pincode",
            "latitude",
            "longitude",
            "phone",
            "whatsapp_number",
            "logo_url",
            "cover_image_url",
            "operating_hours",
            "verification_status",
            "avg_rating",
            "total_reviews",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "slug",
            "verification_status",
            "avg_rating",
            "total_reviews",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        merchant = self.context["request"].user
        return Shop.objects.create(merchant=merchant, **validated_data)
