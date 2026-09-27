"""
Nearza — Reviews Views
Customer review endpoints with strict ownership verification.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Avg

from .models import Review
from .serializers import ReviewSerializer
from apps.shops.models import Shop


def update_shop_rating(shop):
    """Recalculate shop average rating and total reviews."""
    approved_reviews = Review.objects.filter(shop=shop, is_approved=True)
    count = approved_reviews.count()
    avg = approved_reviews.aggregate(Avg("rating"))["rating__avg"] or 0.0
    shop.total_reviews = count
    shop.avg_rating = round(avg, 2)
    shop.save(update_fields=["total_reviews", "avg_rating"])


class ShopReviewsListView(APIView):
    """List approved reviews for a specific shop."""
    permission_classes = [AllowAny]

    def get(self, request, shop_id):
        shop = get_object_or_404(Shop, id=shop_id)
        reviews = Review.objects.filter(shop=shop, is_approved=True).select_related("user")
        serializer = ReviewSerializer(reviews, many=True)
        return Response({
            "status": "success",
            "count": reviews.count(),
            "results": serializer.data,
        })


class ReviewCreateView(APIView):
    """Customer submits a review for a shop."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        shop_id = request.data.get("shop")
        shop = get_object_or_404(Shop, id=shop_id)

        # Check if review already exists from this user for this shop
        existing = Review.objects.filter(user=user, shop=shop).first()
        if existing:
            return Response(
                {"error": "You have already reviewed this shop."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            review = serializer.save(user=user, shop=shop)
            update_shop_rating(shop)
            return Response(
                {
                    "status": "success",
                    "message": "Review submitted successfully.",
                    "data": ReviewSerializer(review).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReviewDetailView(APIView):
    """Delete a review (must be the author)."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        review = get_object_or_404(Review, id=pk)
        # IDOR check: only review author or admin can delete
        if review.user != request.user and getattr(request.user, "role", None) != "admin":
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        shop = review.shop
        review.delete()
        update_shop_rating(shop)
        return Response({"status": "success", "message": "Review deleted."})
