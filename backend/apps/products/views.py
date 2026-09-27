"""
Nearza — Products & Price Comparison Views
Public product discovery, multi-shop price comparison, category browsing, and merchant inventory.
"""

import uuid
from django.db.models import Count, Max, Min, Q, Prefetch
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsMerchant
from apps.shops.models import Shop
from apps.shops.utils import calculate_haversine_distance
from .models import Category, Product, ShopProduct
from .serializers import (
    CategorySerializer,
    MerchantShopProductSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ShopProductComparisonSerializer,
)


class StandardPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 50


# ===================================================================
# Categories Endpoints
# ===================================================================

class CategoryListView(generics.ListAPIView):
    """List all active product categories."""

    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    pagination_class = None

    def get_queryset(self):
        return (
            Category.objects.filter(is_active=True)
            .annotate(
                annotated_products_count=Count("products", filter=Q(products__is_active=True))
            )
            .order_by("sort_order", "name")
        )


class CategoryDetailView(APIView):
    """Get category details by UUID or slug."""

    permission_classes = [AllowAny]

    def get(self, request, identifier):
        try:
            cat_uuid = uuid.UUID(identifier)
            category = get_object_or_404(Category.objects.filter(is_active=True), pk=cat_uuid)
        except ValueError:
            category = get_object_or_404(Category.objects.filter(is_active=True), slug=identifier)

        serializer = CategorySerializer(category)
        return Response({"status": "success", "data": serializer.data})


# ===================================================================
# Products Search & Discovery Endpoints
# ===================================================================

class ProductListView(generics.ListAPIView):
    """
    Search and filter products across nearby merchant shops.
    Filters: q (name/brand), category, min_price, max_price, in_stock_only, availability.
    Sorting: price_asc, price_desc, name, distance.
    """

    permission_classes = [AllowAny]
    serializer_class = ProductListSerializer
    pagination_class = StandardPagination

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["user_lat"] = self.request.query_params.get("latitude") or self.request.query_params.get("lat")
        context["user_lon"] = self.request.query_params.get("longitude") or self.request.query_params.get("lon") or self.request.query_params.get("lng")
        return context

    def get_queryset(self):
        queryset = (
            Product.objects.filter(is_active=True)
            .select_related("category")
            .prefetch_related(
                Prefetch(
                    "shop_products",
                    queryset=ShopProduct.objects.filter(is_active=True).select_related("shop"),
                )
            )
            .annotate(
                shops_count=Count("shop_products", filter=Q(shop_products__is_active=True)),
                min_price=Min("shop_products__price", filter=Q(shop_products__is_active=True)),
                max_price=Max("shop_products__price", filter=Q(shop_products__is_active=True)),
            )
        )

        # Keyword Search: Product Name or Brand
        q = self.request.query_params.get("q")
        if q:
            queryset = queryset.filter(
                Q(name__icontains=q) | Q(brand__icontains=q) | Q(description__icontains=q)
            )

        # Category Filter: slug or UUID
        cat = self.request.query_params.get("category")
        if cat:
            queryset = queryset.filter(
                Q(category__slug=cat) | Q(category__name__iexact=cat)
            )

        # Brand Filter
        brand = self.request.query_params.get("brand")
        if brand:
            queryset = queryset.filter(brand__iexact=brand)

        # Price Filters
        min_p = self.request.query_params.get("min_price")
        if min_p:
            try:
                queryset = queryset.filter(shop_products__price__gte=float(min_p), shop_products__is_active=True).distinct()
            except ValueError:
                pass

        max_p = self.request.query_params.get("max_price")
        if max_p:
            try:
                queryset = queryset.filter(shop_products__price__lte=float(max_p), shop_products__is_active=True).distinct()
            except ValueError:
                pass

        # Availability / Stock Status Filter
        in_stock_only = self.request.query_params.get("in_stock_only")
        if in_stock_only == "true":
            queryset = queryset.filter(shop_products__stock_status="in_stock", shop_products__is_active=True).distinct()

        # Sorting
        sort = self.request.query_params.get("sort", "name")
        if sort in ("price_asc", "price_low"):
            queryset = queryset.order_by("min_price", "name")
        elif sort in ("price_desc", "price_high"):
            queryset = queryset.order_by("-min_price", "name")
        elif sort == "newest":
            queryset = queryset.order_by("-created_at")
        else:
            queryset = queryset.order_by("name")

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        user_lat_raw = request.query_params.get("latitude") or request.query_params.get("lat")
        user_lon_raw = request.query_params.get("longitude") or request.query_params.get("lon") or request.query_params.get("lng")
        radius_param = request.query_params.get("radius") or request.query_params.get("radius_km")
        sort = request.query_params.get("sort", "")

        has_coords = False
        user_lat, user_lon = None, None
        if user_lat_raw is not None and user_lon_raw is not None:
            try:
                user_lat = float(user_lat_raw)
                user_lon = float(user_lon_raw)
                has_coords = True
            except (ValueError, TypeError):
                has_coords = False

        radius_km = None
        if radius_param and str(radius_param).lower() not in ("all", "any", "none"):
            try:
                radius_km = float(radius_param)
            except (ValueError, TypeError):
                radius_km = None

        nearest_available_distance_km = None
        if has_coords:
            products_list = list(queryset)
            filtered_products = []

            for p in products_list:
                sps = [sp for sp in p.shop_products.all() if sp.is_active and sp.shop.latitude and sp.shop.longitude]
                if not sps:
                    p._nearest_dist = None
                else:
                    for sp in sps:
                        sp._dist = calculate_haversine_distance(user_lat, user_lon, sp.shop.latitude, sp.shop.longitude)
                    valid_dists = [sp._dist for sp in sps if sp._dist is not None]
                    p._nearest_dist = min(valid_dists) if valid_dists else None

                if p._nearest_dist is not None:
                    if nearest_available_distance_km is None or p._nearest_dist < nearest_available_distance_km:
                        nearest_available_distance_km = p._nearest_dist

                if radius_km is not None:
                    if p._nearest_dist is not None and p._nearest_dist <= radius_km:
                        filtered_products.append(p)
                else:
                    filtered_products.append(p)

            # Sort: if sort == "distance" OR (sort is not explicitly set and we have coordinates)
            if sort == "distance" or (not sort and has_coords):
                filtered_products.sort(
                    key=lambda p: (
                        p._nearest_dist is None,
                        p._nearest_dist or float("inf"),
                        p.name,
                    )
                )
            elif sort in ("price_asc", "price_low"):
                filtered_products.sort(key=lambda p: (p.min_price is None, p.min_price or float("inf")))
            elif sort in ("price_desc", "price_high"):
                filtered_products.sort(key=lambda p: (p.max_price is None, -(p.max_price or 0)))
            elif sort == "newest":
                filtered_products.sort(key=lambda p: p.created_at, reverse=True)

            page = self.paginate_queryset(filtered_products)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                response = self.get_paginated_response(serializer.data)
                response.data["radius_km"] = radius_km
                response.data["nearest_available_distance_km"] = nearest_available_distance_km
                return response

            serializer = self.get_serializer(filtered_products, many=True)
            return Response({
                "count": len(filtered_products),
                "radius_km": radius_km,
                "nearest_available_distance_km": nearest_available_distance_km,
                "results": serializer.data,
            })

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ProductDetailView(APIView):
    """
    Get full product details along with multi-shop price comparison matrix.
    Each shop's price, stock, quantity, and inventory confidence is included.
    """

    permission_classes = [AllowAny]

    def get(self, request, identifier):
        context = {
            "request": request,
            "user_lat": request.query_params.get("latitude") or request.query_params.get("lat"),
            "user_lon": request.query_params.get("longitude") or request.query_params.get("lon") or request.query_params.get("lng"),
            "sort": request.query_params.get("sort", "price"),
        }

        try:
            prod_uuid = uuid.UUID(identifier)
            product = get_object_or_404(
                Product.objects.filter(is_active=True).select_related("category"),
                pk=prod_uuid,
            )
        except ValueError:
            product = get_object_or_404(
                Product.objects.filter(is_active=True).select_related("category"),
                slug=identifier,
            )

        serializer = ProductDetailSerializer(product, context=context)
        return Response({"status": "success", "data": serializer.data})


class ProductPriceComparisonView(APIView):
    """
    Explicit endpoint for comparing prices of a single product across all nearby shops.
    """

    permission_classes = [AllowAny]

    def get(self, request, identifier):
        context = {
            "request": request,
            "user_lat": request.query_params.get("latitude") or request.query_params.get("lat"),
            "user_lon": request.query_params.get("longitude") or request.query_params.get("lon") or request.query_params.get("lng"),
        }

        try:
            prod_uuid = uuid.UUID(identifier)
            product = get_object_or_404(Product, pk=prod_uuid)
        except ValueError:
            product = get_object_or_404(Product, slug=identifier)

        offerings = (
            ShopProduct.objects.filter(product=product, is_active=True)
            .select_related("shop")
            .order_by("price")
        )

        serializer = ShopProductComparisonSerializer(offerings, many=True, context=context)
        return Response({"status": "success", "data": serializer.data})


# ===================================================================
# Merchant Inventory Management Endpoints
# ===================================================================

class MerchantProductListView(APIView):
    """
    Merchant manages inventory for their shop.
    GET: List all products in merchant's shop
    POST: Add product to shop with price, quantity, stock status
    """

    permission_classes = [IsAuthenticated, IsMerchant]

    def get_shop(self, request):
        return get_object_or_404(Shop, merchant=request.user)

    def get(self, request):
        shop = self.get_shop(request)
        inventory = (
            ShopProduct.objects.filter(shop=shop, is_active=True)
            .select_related("product", "product__category")
            .order_by("-updated_at")
        )
        serializer = MerchantShopProductSerializer(inventory, many=True)
        return Response({"status": "success", "data": serializer.data})

    def post(self, request):
        shop = self.get_shop(request)
        serializer = MerchantShopProductSerializer(
            data=request.data, context={"request": request, "shop": shop}
        )
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        return Response(
            {
                "status": "success",
                "message": "Product added to shop inventory.",
                "data": MerchantShopProductSerializer(item).data,
            },
            status=status.HTTP_201_CREATED,
        )


class MerchantProductDetailView(APIView):
    """
    Merchant updates price, stock, and quantity for a specific item in their shop.
    PATCH/PUT: Update item
    DELETE: Remove item from shop
    """

    permission_classes = [IsAuthenticated, IsMerchant]

    def get_shop(self, request):
        return get_object_or_404(Shop, merchant=request.user)

    def patch(self, request, pk):
        shop = self.get_shop(request)
        item = get_object_or_404(ShopProduct, pk=pk, shop=shop)

        prev_price = item.price
        prev_quantity = item.quantity
        prev_stock_status = item.stock_status

        serializer = MerchantShopProductSerializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        item = serializer.save()

        # Update last_updated timestamp to recalculate confidence
        from django.utils import timezone
        item.last_updated = timezone.now()
        item.save(update_fields=["last_updated"])

        # Record audit trail in InventoryUpdate
        try:
            from apps.inventory.models import InventoryUpdate
            if (
                prev_price != item.price
                or prev_quantity != item.quantity
                or prev_stock_status != item.stock_status
            ):
                InventoryUpdate.objects.create(
                    shop_product=item,
                    previous_price=prev_price,
                    new_price=item.price,
                    previous_quantity=prev_quantity,
                    new_quantity=item.quantity,
                    previous_stock_status=prev_stock_status,
                    new_stock_status=item.stock_status,
                    updated_by=request.user,
                )
        except Exception:
            pass

        return Response(
            {
                "status": "success",
                "message": "Inventory details updated successfully.",
                "data": MerchantShopProductSerializer(item).data,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        shop = self.get_shop(request)
        item = get_object_or_404(ShopProduct, pk=pk, shop=shop)
        item.is_active = False
        item.save()
        return Response(
            {"status": "success", "message": "Product removed from shop inventory."},
            status=status.HTTP_200_OK,
        )
