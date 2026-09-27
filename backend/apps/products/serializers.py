"""
Nearza — Products & Inventory Serializers
Handles Categories, Products, Multi-Shop Price Comparison, and Merchant Inventory.
"""

from rest_framework import serializers
from .models import Category, Product, ShopProduct
from apps.shops.utils import calculate_haversine_distance


class CategorySerializer(serializers.ModelSerializer):
    """Product category serializer."""

    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "icon_url",
            "parent",
            "sort_order",
            "is_active",
            "products_count",
        ]

    def get_products_count(self, obj):
        if hasattr(obj, "annotated_products_count"):
            return obj.annotated_products_count
        return obj.products.filter(is_active=True).count()


class ShopMiniSerializer(serializers.Serializer):
    """Compact shop representation for price comparison matrix."""

    id = serializers.UUIDField()
    name = serializers.CharField()
    slug = serializers.CharField()
    address = serializers.CharField()
    city = serializers.CharField()
    phone = serializers.CharField()
    whatsapp_number = serializers.CharField()
    latitude = serializers.DecimalField(max_digits=10, decimal_places=8)
    longitude = serializers.DecimalField(max_digits=11, decimal_places=8)
    avg_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    total_reviews = serializers.IntegerField()
    distance_km = serializers.SerializerMethodField()

    def get_distance_km(self, obj):
        user_lat = self.context.get("user_lat")
        user_lon = self.context.get("user_lon")
        if user_lat is not None and user_lon is not None:
            return calculate_haversine_distance(user_lat, user_lon, obj.latitude, obj.longitude)
        return None


class ShopProductComparisonSerializer(serializers.ModelSerializer):
    """
    Price Comparison item: a specific shop's price, stock,
    quantity, and inventory confidence for a product.
    """

    shop = serializers.SerializerMethodField()
    inventory_confidence = serializers.ReadOnlyField()

    class Meta:
        model = ShopProduct
        fields = [
            "id",
            "shop",
            "price",
            "quantity",
            "stock_status",
            "sku",
            "merchant_notes",
            "inventory_confidence",
            "last_updated",
        ]

    def get_shop(self, obj):
        serializer = ShopMiniSerializer(obj.shop, context=self.context)
        return serializer.data


class ProductListSerializer(serializers.ModelSerializer):
    """Public discovery serializer for search results and category products."""

    category = serializers.SerializerMethodField()
    min_price = serializers.SerializerMethodField()
    max_price = serializers.SerializerMethodField()
    shops_count = serializers.SerializerMethodField()
    in_stock_shops_count = serializers.SerializerMethodField()
    nearest_distance_km = serializers.SerializerMethodField()

    primary_shop = serializers.SerializerMethodField()
    stock_status = serializers.SerializerMethodField()
    inventory_confidence = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "brand",
            "category",
            "image_url",
            "unit",
            "unit_value",
            "min_price",
            "max_price",
            "shops_count",
            "in_stock_shops_count",
            "nearest_distance_km",
            "primary_shop",
            "stock_status",
            "inventory_confidence",
            "rating",
        ]

    def _get_active_sps(self, obj):
        if not hasattr(obj, "_cached_active_sps"):
            if hasattr(obj, "_prefetched_objects_cache") and "shop_products" in obj._prefetched_objects_cache:
                sps = [sp for sp in obj.shop_products.all() if sp.is_active]
            else:
                sps = list(obj.shop_products.filter(is_active=True).select_related("shop"))
            obj._cached_active_sps = sps
        return obj._cached_active_sps

    def _get_primary_sp(self, obj):
        if not hasattr(obj, "_cached_primary_sp"):
            user_lat = self.context.get("user_lat")
            user_lon = self.context.get("user_lon")
            sps = list(self._get_active_sps(obj))
            if not sps:
                obj._cached_primary_sp = None
                return None
            if user_lat is not None and user_lon is not None:
                for sp in sps:
                    if not hasattr(sp, "_distance_km"):
                        sp._distance_km = calculate_haversine_distance(
                            user_lat, user_lon, sp.shop.latitude, sp.shop.longitude
                        )
                sps.sort(key=lambda sp: (
                    0 if sp.stock_status == "in_stock" else 1,
                    sp._distance_km if sp._distance_km is not None else 999999,
                    float(sp.price),
                ))
            else:
                sps.sort(key=lambda sp: (0 if sp.stock_status == "in_stock" else 1, float(sp.price)))
            obj._cached_primary_sp = sps[0]
        return obj._cached_primary_sp

    def get_category(self, obj):
        return {
            "id": str(obj.category.id),
            "name": obj.category.name,
            "slug": obj.category.slug,
        }

    def get_min_price(self, obj):
        if hasattr(obj, "min_price") and obj.min_price is not None:
            return float(obj.min_price)
        sps = self._get_active_sps(obj)
        prices = [float(sp.price) for sp in sps]
        return min(prices) if prices else None

    def get_max_price(self, obj):
        if hasattr(obj, "max_price") and obj.max_price is not None:
            return float(obj.max_price)
        sps = self._get_active_sps(obj)
        prices = [float(sp.price) for sp in sps]
        return max(prices) if prices else None

    def get_shops_count(self, obj):
        if hasattr(obj, "shops_count") and obj.shops_count is not None:
            return obj.shops_count
        return len(self._get_active_sps(obj))

    def get_in_stock_shops_count(self, obj):
        return sum(1 for sp in self._get_active_sps(obj) if sp.stock_status == "in_stock")

    def get_nearest_distance_km(self, obj):
        sp = self._get_primary_sp(obj)
        if sp and hasattr(sp, "_distance_km") and sp._distance_km is not None:
            return sp._distance_km
        user_lat = self.context.get("user_lat")
        user_lon = self.context.get("user_lon")
        if user_lat is None or user_lon is None:
            return None

        min_dist = None
        for sp in self._get_active_sps(obj):
            dist = getattr(sp, "_distance_km", None)
            if dist is None:
                dist = calculate_haversine_distance(user_lat, user_lon, sp.shop.latitude, sp.shop.longitude)
                sp._distance_km = dist
            if dist is not None:
                if min_dist is None or dist < min_dist:
                    min_dist = dist
        return min_dist

    def get_primary_shop(self, obj):
        sp = self._get_primary_sp(obj)
        if not sp:
            return None
        dist = getattr(sp, "_distance_km", None)
        if dist is None:
            user_lat = self.context.get("user_lat")
            user_lon = self.context.get("user_lon")
            if user_lat is not None and user_lon is not None:
                dist = calculate_haversine_distance(user_lat, user_lon, sp.shop.latitude, sp.shop.longitude)
                sp._distance_km = dist
        return {
            "id": str(sp.shop.id),
            "name": sp.shop.name,
            "slug": sp.shop.slug,
            "address": sp.shop.address,
            "city": sp.shop.city,
            "phone": sp.shop.phone,
            "whatsapp_number": sp.shop.whatsapp_number,
            "latitude": float(sp.shop.latitude) if sp.shop.latitude else None,
            "longitude": float(sp.shop.longitude) if sp.shop.longitude else None,
            "avg_rating": float(sp.shop.avg_rating) if sp.shop.avg_rating else 4.8,
            "total_reviews": sp.shop.total_reviews,
            "price": float(sp.price),
            "stock_status": sp.stock_status,
            "distance_km": dist,
        }

    def get_stock_status(self, obj):
        sp = self._get_primary_sp(obj)
        return sp.stock_status if sp else "out_of_stock"

    def get_inventory_confidence(self, obj):
        sp = self._get_primary_sp(obj)
        return sp.inventory_confidence if sp else 75

    def get_rating(self, obj):
        sp = self._get_primary_sp(obj)
        if sp and sp.shop.avg_rating:
            return float(sp.shop.avg_rating)
        return 4.8


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full product details with all competing shop offerings (price comparison matrix)."""

    category = CategorySerializer(read_only=True)
    min_price = serializers.SerializerMethodField()
    max_price = serializers.SerializerMethodField()
    price_difference = serializers.SerializerMethodField()
    shop_offerings = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "brand",
            "category",
            "image_url",
            "unit",
            "unit_value",
            "min_price",
            "max_price",
            "price_difference",
            "shop_offerings",
            "created_at",
        ]

    def get_min_price(self, obj):
        sp = obj.shop_products.filter(is_active=True).order_by("price").first()
        return float(sp.price) if sp else None

    def get_max_price(self, obj):
        sp = obj.shop_products.filter(is_active=True).order_by("-price").first()
        return float(sp.price) if sp else None

    def get_price_difference(self, obj):
        min_p = self.get_min_price(obj)
        max_p = self.get_max_price(obj)
        if min_p is not None and max_p is not None:
            return round(max_p - min_p, 2)
        return 0.0

    def get_shop_offerings(self, obj):
        # Sort offerings by price or distance if requested
        offerings = obj.shop_products.filter(is_active=True).select_related("shop")

        user_lat = self.context.get("user_lat")
        user_lon = self.context.get("user_lon")

        serialized = ShopProductComparisonSerializer(
            offerings, many=True, context=self.context
        ).data

        # If user coordinates are provided and sort=distance was requested
        if user_lat is not None and user_lon is not None and self.context.get("sort") == "distance":
            serialized.sort(
                key=lambda x: (
                    x["shop"]["distance_km"] if x["shop"]["distance_km"] is not None else float("inf")
                )
            )
        else:
            serialized.sort(key=lambda x: float(x["price"]))

        return serialized


class MerchantShopProductSerializer(serializers.ModelSerializer):
    """Merchant serializer for managing shop inventory, prices, and stock."""

    product_id = serializers.UUIDField(write_only=True, required=False)
    # Allows creating a new catalog product directly if not found in catalog
    product_name = serializers.CharField(write_only=True, required=False)
    product_category_id = serializers.UUIDField(write_only=True, required=False)
    product_brand = serializers.CharField(write_only=True, required=False, allow_blank=True)
    product_unit = serializers.CharField(write_only=True, required=False)
    product_unit_value = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True, required=False)
    product_image_url = serializers.URLField(write_only=True, required=False, allow_blank=True)

    product = ProductListSerializer(read_only=True)
    inventory_confidence = serializers.ReadOnlyField()

    class Meta:
        model = ShopProduct
        fields = [
            "id",
            "product",
            "product_id",
            "product_name",
            "product_category_id",
            "product_brand",
            "product_unit",
            "product_unit_value",
            "product_image_url",
            "price",
            "quantity",
            "stock_status",
            "sku",
            "merchant_notes",
            "inventory_confidence",
            "last_updated",
            "is_active",
        ]
        read_only_fields = ["id", "product", "inventory_confidence", "last_updated"]

    def create(self, validated_data):
        shop = self.context["shop"]

        product_id = validated_data.pop("product_id", None)
        if product_id:
            product = Product.objects.get(pk=product_id)
        else:
            # Create a new product in the catalog
            name = validated_data.pop("product_name")
            category_id = validated_data.pop("product_category_id")
            brand = validated_data.pop("product_brand", "")
            unit = validated_data.pop("product_unit", "piece")
            unit_value = validated_data.pop("product_unit_value", 1.0)
            image_url = validated_data.pop("product_image_url", "")

            category = Category.objects.get(pk=category_id)
            product, created = Product.objects.get_or_create(
                name=name,
                unit=unit,
                unit_value=unit_value,
                defaults={
                    "category": category,
                    "brand": brand,
                    "image_url": image_url,
                },
            )
            if not created and image_url:
                product.image_url = image_url
                product.save(update_fields=["image_url"])

        # Create or update ShopProduct
        shop_product, _ = ShopProduct.objects.update_or_create(
            shop=shop,
            product=product,
            defaults=validated_data,
        )
        return shop_product

    def update(self, instance, validated_data):
        # Allow updating underlying product fields if provided
        prod = instance.product
        prod_updated = False
        if "product_name" in validated_data:
            prod.name = validated_data.pop("product_name")
            prod_updated = True
        if "product_brand" in validated_data:
            prod.brand = validated_data.pop("product_brand")
            prod_updated = True
        if "product_image_url" in validated_data:
            prod.image_url = validated_data.pop("product_image_url")
            prod_updated = True
        if "product_category_id" in validated_data:
            cat_id = validated_data.pop("product_category_id")
            try:
                prod.category = Category.objects.get(pk=cat_id)
                prod_updated = True
            except Category.DoesNotExist:
                pass
        if "product_unit" in validated_data:
            prod.unit = validated_data.pop("product_unit")
            prod_updated = True
        if "product_unit_value" in validated_data:
            prod.unit_value = validated_data.pop("product_unit_value")
            prod_updated = True

        if prod_updated:
            prod.save()

        return super().update(instance, validated_data)
