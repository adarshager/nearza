"""
Nearza — Favorites Views
API endpoints for managing saved products and saved shops.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Favorite
from .serializers import FavoriteSerializer
from apps.products.models import Product
from apps.shops.models import Shop


class FavoriteListView(APIView):
    """
    List current user's favorites.
    Supports filtering by ?type=product or ?type=shop.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        fav_type = request.query_params.get("type")
        qs = Favorite.objects.filter(user=user).select_related("product", "shop")
        if fav_type in [Favorite.FavoriteType.PRODUCT, Favorite.FavoriteType.SHOP]:
            qs = qs.filter(favorite_type=fav_type)

        context = {"request": request}
        try:
            if "lat" in request.query_params and "lon" in request.query_params:
                context["user_lat"] = float(request.query_params["lat"])
                context["user_lon"] = float(request.query_params["lon"])
        except (ValueError, TypeError):
            pass

        serializer = FavoriteSerializer(qs, many=True, context=context)
        return Response({
            "status": "success",
            "count": qs.count(),
            "results": serializer.data,
        })


class FavoriteToggleView(APIView):
    """
    Toggle favorite status for a product or a shop.
    Body: { "product_id": "..." } or { "shop_id": "..." }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        product_id = request.data.get("product_id")
        shop_id = request.data.get("shop_id")

        if not product_id and not shop_id:
            return Response(
                {"error": "Either product_id or shop_id must be provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if product_id:
            product = get_object_or_404(Product, id=product_id)
            fav = Favorite.objects.filter(user=user, product=product).first()
            if fav:
                fav.delete()
                return Response({
                    "status": "success",
                    "favorited": False,
                    "message": f"Removed {product.name} from favorites.",
                })
            else:
                fav = Favorite.objects.create(
                    user=user,
                    product=product,
                    favorite_type=Favorite.FavoriteType.PRODUCT,
                )
                serializer = FavoriteSerializer(fav, context={"request": request})
                return Response({
                    "status": "success",
                    "favorited": True,
                    "favorite": serializer.data,
                    "message": f"Added {product.name} to favorites.",
                }, status=status.HTTP_201_CREATED)

        if shop_id:
            shop = get_object_or_404(Shop, id=shop_id)
            fav = Favorite.objects.filter(user=user, shop=shop).first()
            if fav:
                fav.delete()
                return Response({
                    "status": "success",
                    "favorited": False,
                    "message": f"Removed {shop.name} from favorites.",
                })
            else:
                fav = Favorite.objects.create(
                    user=user,
                    shop=shop,
                    favorite_type=Favorite.FavoriteType.SHOP,
                )
                serializer = FavoriteSerializer(fav, context={"request": request})
                return Response({
                    "status": "success",
                    "favorited": True,
                    "favorite": serializer.data,
                    "message": f"Added {shop.name} to favorites.",
                }, status=status.HTTP_201_CREATED)


class FavoriteDetailView(APIView):
    """Delete a favorite by its ID."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        fav = get_object_or_404(Favorite, id=pk, user=request.user)
        fav.delete()
        return Response({"status": "success", "message": "Favorite removed."})


class FavoriteCheckView(APIView):
    """Quickly check if a product or shop is favorited by the current user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        product_id = request.query_params.get("product_id")
        shop_id = request.query_params.get("shop_id")

        if product_id:
            fav = Favorite.objects.filter(user=user, product_id=product_id).first()
            return Response({
                "is_favorite": fav is not None,
                "favorite_id": str(fav.id) if fav else None,
            })
        if shop_id:
            fav = Favorite.objects.filter(user=user, shop_id=shop_id).first()
            return Response({
                "is_favorite": fav is not None,
                "favorite_id": str(fav.id) if fav else None,
            })

        return Response({"error": "Provide product_id or shop_id query param."}, status=400)
