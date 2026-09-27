"""
Nearza — Favorites Serializers
Handles serialization of user favorited products and shops.
"""

from rest_framework import serializers
from .models import Favorite
from apps.products.serializers import ProductListSerializer
from apps.shops.serializers import ShopListSerializer


class FavoriteSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()
    shop = serializers.SerializerMethodField()
    product_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    shop_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Favorite
        fields = [
            "id",
            "favorite_type",
            "product",
            "shop",
            "product_id",
            "shop_id",
            "created_at",
        ]
        read_only_fields = ["id", "favorite_type", "created_at"]

    def get_product(self, obj):
        if obj.product:
            return ProductListSerializer(obj.product, context=self.context).data
        return None

    def get_shop(self, obj):
        if obj.shop:
            return ShopListSerializer(obj.shop, context=self.context).data
        return None
