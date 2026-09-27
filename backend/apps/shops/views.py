"""
Nearza — Shops Views
Public shop discovery, nearby calculations, and merchant shop management.
"""

from decimal import Decimal
import os
import time
import uuid

from django.conf import settings
from .image_service import process_image, upload_to_supabase
from django.core.files.storage import default_storage
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsMerchant, IsShopOwner
from .models import Shop
from .serializers import (
    MerchantShopSerializer,
    ShopDetailSerializer,
    ShopListSerializer,
)
from .utils import calculate_haversine_distance


class StandardPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 50


class ShopListView(generics.ListAPIView):
    """
    Public discovery endpoint for nearby and searchable shops.
    Supports geolocation (latitude, longitude, radius_km), city, pincode, and search query.
    """

    permission_classes = [AllowAny]
    serializer_class = ShopListSerializer
    pagination_class = StandardPagination

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["user_lat"] = self.request.query_params.get("latitude") or self.request.query_params.get("lat")
        context["user_lon"] = self.request.query_params.get("longitude") or self.request.query_params.get("lon") or self.request.query_params.get("lng")
        return context

    def get_queryset(self):
        queryset = (
            Shop.objects.filter(is_active=True)
            .annotate(products_count=Count("shop_products", filter=Q(shop_products__is_active=True)))
            .select_related("merchant")
        )

        # Keyword Search: Matches shop details or products/inventory carried by the shop
        q = self.request.query_params.get("q")
        if q:
            queryset = queryset.filter(
                Q(name__icontains=q)
                | Q(description__icontains=q)
                | Q(address__icontains=q)
                | Q(city__icontains=q)
                | Q(shop_products__product__name__icontains=q, shop_products__is_active=True)
                | Q(shop_products__product__brand__icontains=q, shop_products__is_active=True)
                | Q(shop_products__product__category__name__icontains=q, shop_products__is_active=True)
            ).distinct()

        # City & Pincode Filters
        city = self.request.query_params.get("city")
        if city:
            queryset = queryset.filter(city__iexact=city)

        pincode = self.request.query_params.get("pincode")
        if pincode:
            queryset = queryset.filter(pincode=pincode)

        # Geolocation Distance Sorting & Radius Filter
        user_lat = self.request.query_params.get("latitude") or self.request.query_params.get("lat")
        user_lon = self.request.query_params.get("longitude") or self.request.query_params.get("lon") or self.request.query_params.get("lng")
        radius_km = self.request.query_params.get("radius_km") or self.request.query_params.get("radius")

        if user_lat and user_lon:
            try:
                u_lat, u_lon = float(user_lat), float(user_lon)
                if -90 <= u_lat <= 90 and -180 <= u_lon <= 180:
                    max_radius = float(radius_km) if radius_km else None
                    if max_radius is not None and (max_radius <= 0 or max_radius > 500):
                        max_radius = None

                    # Compute distance and attach
                    shops_with_dist = []
                    for shop in queryset:
                        if shop.latitude and shop.longitude:
                            dist = calculate_haversine_distance(u_lat, u_lon, shop.latitude, shop.longitude)
                            if dist is not None:
                                if max_radius is None or dist <= max_radius:
                                    shop._distance_km = dist
                                    shops_with_dist.append(shop)
                        elif max_radius is None:
                            shop._distance_km = None
                            shops_with_dist.append(shop)

                    # Sort by distance
                    shops_with_dist.sort(
                        key=lambda s: (s._distance_km is None, s._distance_km or float("inf"))
                    )
                    return shops_with_dist
            except (ValueError, TypeError):
                pass

        return queryset.order_by("-created_at")


class ShopDetailView(APIView):
    """Public detail view for a specific shop by UUID or slug."""

    permission_classes = [AllowAny]

    def get(self, request, identifier):
        context = {
            "request": request,
            "user_lat": request.query_params.get("latitude") or request.query_params.get("lat"),
            "user_lon": request.query_params.get("longitude") or request.query_params.get("lon") or request.query_params.get("lng"),
        }

        # Look up by UUID or slug
        try:
            shop_uuid = uuid.UUID(identifier)
            shop = get_object_or_404(Shop.objects.filter(is_active=True), pk=shop_uuid)
        except ValueError:
            shop = get_object_or_404(Shop.objects.filter(is_active=True), slug=identifier)

        serializer = ShopDetailSerializer(shop, context=context)
        return Response({"status": "success", "data": serializer.data})


class ShopProductsView(generics.ListAPIView):
    """List all products stocked at a specific shop."""

    permission_classes = [AllowAny]
    pagination_class = StandardPagination

    def get(self, request, identifier):
        try:
            shop_uuid = uuid.UUID(identifier)
            shop = get_object_or_404(Shop.objects.filter(is_active=True), pk=shop_uuid)
        except ValueError:
            shop = get_object_or_404(Shop.objects.filter(is_active=True), slug=identifier)

        from apps.products.serializers import ShopProductComparisonSerializer

        products_qs = shop.shop_products.filter(is_active=True).select_related("product", "product__category")

        # Category filter
        cat = request.query_params.get("category")
        if cat:
            products_qs = products_qs.filter(
                Q(product__category__slug=cat) | Q(product__category__name__icontains=cat)
            )

        # In stock only
        if request.query_params.get("in_stock_only") == "true":
            products_qs = products_qs.filter(stock_status="in_stock")

        # Search
        q = request.query_params.get("q")
        if q:
            products_qs = products_qs.filter(
                Q(product__name__icontains=q) | Q(product__brand__icontains=q)
            )

        paginated = self.paginate_queryset(products_qs)
        if paginated is not None:
            serializer = ShopProductComparisonSerializer(paginated, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)

        serializer = ShopProductComparisonSerializer(products_qs, many=True, context={"request": request})
        return Response({"status": "success", "data": serializer.data})


# ===================================================================
# Merchant Shop Management Endpoints
# ===================================================================

class MerchantShopManageView(APIView):
    """
    Merchant manages their own shop profile.
    GET: Retrieve current shop
    POST: Create shop
    PUT/PATCH: Update shop
    """

    permission_classes = [IsAuthenticated, IsMerchant]

    def get(self, request):
        shop = Shop.objects.filter(merchant=request.user).first()
        if not shop:
            return Response(
                {"status": "error", "message": "No shop profile found. Please create one."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = MerchantShopSerializer(shop)
        return Response({"status": "success", "data": serializer.data})

    def post(self, request):
        # A merchant can manage a primary shop
        existing = Shop.objects.filter(merchant=request.user).first()
        if existing:
            return Response(
                {
                    "status": "error",
                    "message": "You already have a registered shop profile.",
                    "data": {"shop_id": str(existing.id)},
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = MerchantShopSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        shop = serializer.save()
        return Response(
            {"status": "success", "message": "Shop profile created!", "data": MerchantShopSerializer(shop).data},
            status=status.HTTP_201_CREATED,
        )

    def patch(self, request):
        shop = get_object_or_404(Shop, merchant=request.user)
        serializer = MerchantShopSerializer(shop, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        shop = serializer.save()
        return Response(
            {"status": "success", "message": "Shop profile updated!", "data": MerchantShopSerializer(shop).data},
            status=status.HTTP_200_OK,
        )


class ImageUploadView(APIView):
    """
    Image upload endpoint for merchant shop branding (logo, cover) & product photography.
    Supports JPG, PNG, WEBP, GIF with automated orientation, intelligent cropping,
    WebP compression, and verified upload to Supabase Storage.
    """

    permission_classes = [IsAuthenticated, IsMerchant]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("file") or request.FILES.get("image")
        if not file:
            return Response(
                {"status": "error", "message": "No image file provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. Server-side safety limit on raw upload size (15MB)
        if file.size > 15 * 1024 * 1024:
            return Response(
                {"status": "error", "message": "Image size exceeds 15MB limit. Please upload a smaller image."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 2. Upload type: 'logo', 'cover', 'product'
        upload_type = str(request.data.get("type", "product")).lower().strip()
        if upload_type not in ("logo", "cover", "product"):
            upload_type = "product"

        # 3. Resolve merchant shop & ownership
        shop = Shop.objects.filter(merchant=request.user).first()
        shop_id = str(shop.id) if shop else f"merchant_{request.user.id}"

        # 4. Storage path architecture per specifications:
        # shops/<shop-id>/logo/logo_<timestamp>.webp
        # shops/<shop-id>/cover/cover_<timestamp>.webp
        # products/<product-id or uuid>/image_<timestamp>.webp
        timestamp = int(time.time() * 1000)
        old_storage_path = None

        if upload_type == "logo":
            storage_path = f"shops/{shop_id}/logo/logo_{timestamp}.webp"
            if shop and shop.logo_url and "nearza-media" in shop.logo_url:
                old_storage_path = shop.logo_url.split("nearza-media/")[-1]
        elif upload_type == "cover":
            storage_path = f"shops/{shop_id}/cover/cover_{timestamp}.webp"
            if shop and shop.cover_image_url and "nearza-media" in shop.cover_image_url:
                old_storage_path = shop.cover_image_url.split("nearza-media/")[-1]
        else:
            product_id = request.data.get("product_id") or uuid.uuid4().hex
            storage_path = f"products/{product_id}/image_{timestamp}.webp"

        # 5. Process image with Pillow (normalize orientation, smart center crop, WebP optimize)
        try:
            webp_bytes, mime_type, (final_w, final_h) = process_image(file, target_type=upload_type)
        except ValueError as val_err:
            return Response(
                {"status": "error", "message": str(val_err)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"status": "error", "message": "Image processing failed. Please try another image."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 6. Upload to Supabase Storage & verify public URL
        try:
            public_url, final_storage_path = upload_to_supabase(
                data_bytes=webp_bytes,
                storage_path=storage_path,
                content_type=mime_type,
                old_storage_path=old_storage_path,
            )
        except Exception as e:
            return Response(
                {"status": "error", "message": f"Storage upload failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # 7. Resilient auto-update on Shop or Product model if applicable
        if shop:
            if upload_type == "logo":
                shop.logo_url = public_url
                shop.save(update_fields=["logo_url"])
            elif upload_type == "cover":
                shop.cover_image_url = public_url
                shop.save(update_fields=["cover_image_url"])
            elif upload_type == "product" and request.data.get("product_id"):
                prod_id = request.data.get("product_id")
                try:
                    from apps.products.models import Product, ShopProduct
                    if ShopProduct.objects.filter(shop=shop, product_id=prod_id).exists():
                        Product.objects.filter(pk=prod_id).update(image_url=public_url)
                except Exception as e:
                    logger.warning(f"Could not auto-link product image: {e}")

        return Response(
            {
                "status": "success",
                "message": "Image uploaded and verified successfully.",
                "data": {
                    "url": public_url,
                    "storage_path": final_storage_path,
                    "type": upload_type,
                    "width": final_w,
                    "height": final_h,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class MerchantDashboardStatsView(APIView):
    """
    Merchant portal dashboard statistics:
    - total products
    - active products
    - low-stock products
    - out-of-stock products
    - shop views
    - product views
    - whatsapp clicks
    - call clicks
    - directions clicks
    - 14-day daily trends for views and contact clicks
    - inventory confidence breakdown (high, medium, low)
    """

    permission_classes = [IsAuthenticated, IsMerchant]

    def get(self, request):
        from apps.analytics.models import AnalyticsEvent
        from apps.products.models import ShopProduct
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Q

        shop = Shop.objects.filter(merchant=request.user).first()
        if not shop:
            return Response({
                "status": "success",
                "data": {
                    "has_shop": False,
                    "shop": None,
                    "total_products": 0,
                    "active_products": 0,
                    "low_stock_products": 0,
                    "out_of_stock_products": 0,
                    "shop_views": 0,
                    "product_views": 0,
                    "whatsapp_clicks": 0,
                    "call_clicks": 0,
                    "directions_clicks": 0,
                    "total_clicks": 0,
                    "daily_trends": [],
                    "confidence_breakdown": {"high": 0, "medium": 0, "low": 0},
                }
            })

        # Product metrics
        sp_qs = ShopProduct.objects.filter(shop=shop)
        total_products = sp_qs.count()
        active_products = sp_qs.filter(is_active=True).count()
        low_stock_products = sp_qs.filter(
            is_active=True
        ).filter(Q(stock_status="low_stock") | Q(quantity__lte=5, quantity__gt=0)).count()
        out_of_stock_products = sp_qs.filter(
            is_active=True
        ).filter(Q(stock_status="out_of_stock") | Q(quantity=0)).count()

        # Analytics events
        events_qs = AnalyticsEvent.objects.filter(shop=shop)
        shop_views = events_qs.filter(event_type=AnalyticsEvent.EventType.SHOP_VIEW).count()
        product_views = events_qs.filter(event_type=AnalyticsEvent.EventType.PRODUCT_VIEW).count()
        whatsapp_clicks = events_qs.filter(event_type=AnalyticsEvent.EventType.WHATSAPP_CLICK).count()
        call_clicks = events_qs.filter(event_type=AnalyticsEvent.EventType.CALL_CLICK).count()
        directions_clicks = events_qs.filter(event_type=AnalyticsEvent.EventType.DIRECTIONS_CLICK).count()

        # 14-day daily trends
        now = timezone.now()
        start_date = (now - timedelta(days=13)).date()
        daily_trends = []
        for i in range(14):
            day = start_date + timedelta(days=i)
            day_events = events_qs.filter(created_at__date=day)
            day_views = day_events.filter(
                event_type__in=[AnalyticsEvent.EventType.SHOP_VIEW, AnalyticsEvent.EventType.PRODUCT_VIEW]
            ).count()
            day_wa = day_events.filter(event_type=AnalyticsEvent.EventType.WHATSAPP_CLICK).count()
            day_call = day_events.filter(event_type=AnalyticsEvent.EventType.CALL_CLICK).count()
            day_dir = day_events.filter(event_type=AnalyticsEvent.EventType.DIRECTIONS_CLICK).count()
            day_clicks = day_wa + day_call + day_dir
            daily_trends.append({
                "date": day.strftime("%Y-%m-%d"),
                "label": day.strftime("%b %d"),
                "views": day_views,
                "clicks": day_clicks,
                "whatsapp_clicks": day_wa,
                "call_clicks": day_call,
                "directions_clicks": day_dir,
            })

        # Inventory confidence breakdown
        high_conf = 0
        med_conf = 0
        low_conf = 0
        for sp in sp_qs.filter(is_active=True):
            conf = sp.inventory_confidence
            if conf == "high":
                high_conf += 1
            elif conf == "medium":
                med_conf += 1
            else:
                low_conf += 1

        shop_summary = {
            "id": str(shop.id),
            "name": shop.name,
            "address": shop.address,
            "city": shop.city,
            "phone": shop.phone,
            "whatsapp_number": shop.whatsapp_number,
            "logo_url": shop.logo_url,
            "verification_status": shop.verification_status,
            "avg_rating": float(shop.avg_rating),
            "total_reviews": shop.total_reviews,
            "is_active": shop.is_active,
        }

        return Response({
            "status": "success",
            "data": {
                "has_shop": True,
                "shop": shop_summary,
                "total_products": total_products,
                "active_products": active_products,
                "low_stock_products": low_stock_products,
                "out_of_stock_products": out_of_stock_products,
                "shop_views": shop_views,
                "product_views": product_views,
                "whatsapp_clicks": whatsapp_clicks,
                "call_clicks": call_clicks,
                "directions_clicks": directions_clicks,
                "total_clicks": whatsapp_clicks + call_clicks + directions_clicks,
                "daily_trends": daily_trends,
                "confidence_breakdown": {
                    "high": high_conf,
                    "medium": med_conf,
                    "low": low_conf,
                },
            }
        })
