"""
Nearza — Analytics App Views
Event tracking and metrics aggregation.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from apps.shops.models import Shop
from apps.products.models import Product
from .models import AnalyticsEvent


class TrackEventView(APIView):
    """
    Public/anonymous endpoint for logging user engagement events:
    - shop_view
    - product_view
    - whatsapp_click
    - call_click
    - directions_click
    """

    permission_classes = [AllowAny]

    def post(self, request):
        event_type = request.data.get("event_type")
        valid_types = [choice[0] for choice in AnalyticsEvent.EventType.choices]

        if not event_type or event_type not in valid_types:
            return Response(
                {
                    "status": "error",
                    "message": f"Invalid event_type. Must be one of: {', '.join(valid_types)}",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        shop = None
        shop_id = request.data.get("shop_id")
        if shop_id:
            try:
                shop = Shop.objects.filter(pk=shop_id).first()
            except (ValueError, TypeError):
                pass

        product = None
        product_id = request.data.get("product_id")
        if product_id:
            try:
                product = Product.objects.filter(pk=product_id).first()
            except (ValueError, TypeError):
                pass

        metadata = request.data.get("metadata", {})
        if not isinstance(metadata, dict):
            metadata = {}

        user = request.user if request.user.is_authenticated else None

        AnalyticsEvent.objects.create(
            event_type=event_type,
            shop=shop,
            product=product,
            user=user,
            metadata=metadata,
        )

        return Response(
            {"status": "success", "message": "Event recorded."},
            status=status.HTTP_201_CREATED,
        )
