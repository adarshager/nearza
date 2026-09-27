"""
Nearza — Admin Panel Views
Full administrative moderation, verification workflows, and immutable action audit logging.
Strictly enforced by server-side IsAdminUser permission.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q

from apps.accounts.permissions import IsAdminUser
from .models import AdminAction
from .serializers import (
    AdminActionSerializer,
    AdminUserSerializer,
    AdminShopSerializer,
    AdminProductSerializer,
    AdminCategorySerializer,
    AdminReportSerializer,
    AdminReviewSerializer,
)
from apps.shops.models import Shop
from apps.products.models import Product, Category
from apps.reports.models import Report
from apps.reviews.models import Review

User = get_user_model()


def log_admin_action(admin, action_type, target_type, target_id, details=None):
    """Immutable audit trail logging for all administrative events."""
    try:
        AdminAction.objects.create(
            admin=admin,
            action_type=action_type,
            target_type=target_type,
            target_id=target_id,
            details=details or {},
        )
    except Exception as err:
        # Never crash the primary flow, but print for log aggregation
        print(f"[AUDIT LOG ERROR] Failed to log admin action: {err}")


# ===================================================================
# 1. Admin Dashboard Stats & Activity
# ===================================================================
class AdminDashboardStatsView(APIView):
    """Provides high-level platform health, counts, and recent audit activity."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Users
        users_qs = User.objects.all()
        total_users = users_qs.count()
        active_users = users_qs.filter(is_active=True).count()
        customers_count = users_qs.filter(role="customer").count()
        merchants_count = users_qs.filter(role="merchant").count()

        # Shops & Verification
        shops_qs = Shop.objects.all()
        total_shops = shops_qs.count()
        pending_shops = shops_qs.filter(verification_status=Shop.VerificationStatus.PENDING).count()
        approved_shops = shops_qs.filter(verification_status=Shop.VerificationStatus.APPROVED).count()
        rejected_shops = shops_qs.filter(verification_status=Shop.VerificationStatus.REJECTED).count()
        suspended_shops = shops_qs.filter(verification_status=Shop.VerificationStatus.SUSPENDED).count()

        # Products & Categories
        products_qs = Product.objects.all()
        total_products = products_qs.count()
        active_products = products_qs.filter(is_active=True).count()
        total_categories = Category.objects.count()

        # Reports
        reports_qs = Report.objects.all()
        total_reports = reports_qs.count()
        pending_reports = reports_qs.filter(status=Report.Status.PENDING).count()
        resolved_reports = reports_qs.filter(status=Report.Status.RESOLVED).count()

        # Reviews
        reviews_qs = Review.objects.all()
        total_reviews = reviews_qs.count()
        unapproved_reviews = reviews_qs.filter(is_approved=False).count()

        # Activity Audit Trail (last 10)
        recent_actions = AdminAction.objects.select_related("admin").order_by("-created_at")[:10]
        actions_data = AdminActionSerializer(recent_actions, many=True).data

        return Response({
            "status": "success",
            "data": {
                "users": {
                    "total": total_users,
                    "active": active_users,
                    "customers": customers_count,
                    "merchants": merchants_count,
                },
                "merchants": {
                    "total": merchants_count,
                    "pending_verification": pending_shops,
                    "approved": approved_shops,
                    "rejected": rejected_shops,
                    "suspended": suspended_shops,
                },
                "shops": {
                    "total": total_shops,
                    "pending": pending_shops,
                    "approved": approved_shops,
                    "rejected": rejected_shops,
                    "suspended": suspended_shops,
                },
                "products": {
                    "total": total_products,
                    "active": active_products,
                    "categories": total_categories,
                },
                "reports": {
                    "total": total_reports,
                    "pending": pending_reports,
                    "resolved": resolved_reports,
                },
                "reviews": {
                    "total": total_reviews,
                    "unapproved": unapproved_reviews,
                },
                "activity": actions_data,
            },
        })


import math

# ===================================================================
# 2. Merchant & Shop Verification
# ===================================================================
class AdminMerchantListView(APIView):
    """
    List shops and merchants with filter by verification status, search, and pagination.
    Returns normalized results, independent counts for all verification statuses, and pagination metadata.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        status_filter = request.query_params.get("status")
        q = request.query_params.get("q")
        page_param = request.query_params.get("page", "1")
        page_size_param = request.query_params.get("page_size", "10")

        # Canonical normalization of status filter
        canonical_status = None
        if status_filter is not None:
            cleaned = status_filter.strip().lower()
            if cleaned and cleaned != "all":
                if cleaned not in Shop.VerificationStatus.values:
                    return Response(
                        {
                            "status": "error",
                            "error": f"Invalid verification status '{status_filter}'. Allowed values: {list(Shop.VerificationStatus.values)} or 'all'.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                canonical_status = cleaned

        # Independent counts for all statuses
        status_counts = {
            "all": Shop.objects.count(),
            "pending": Shop.objects.filter(verification_status=Shop.VerificationStatus.PENDING).count(),
            "approved": Shop.objects.filter(verification_status=Shop.VerificationStatus.APPROVED).count(),
            "rejected": Shop.objects.filter(verification_status=Shop.VerificationStatus.REJECTED).count(),
            "suspended": Shop.objects.filter(verification_status=Shop.VerificationStatus.SUSPENDED).count(),
        }

        # Filter queryset
        qs = Shop.objects.select_related("merchant").order_by("-created_at")

        if canonical_status:
            qs = qs.filter(verification_status=canonical_status)

        if q and q.strip():
            q_clean = q.strip()
            qs = qs.filter(
                Q(name__icontains=q_clean)
                | Q(city__icontains=q_clean)
                | Q(pincode__icontains=q_clean)
                | Q(phone__icontains=q_clean)
                | Q(merchant__email__icontains=q_clean)
                | Q(merchant__full_name__icontains=q_clean)
            )

        total_filtered = qs.count()

        # Parse pagination parameters
        try:
            page = max(1, int(page_param))
        except (ValueError, TypeError):
            page = 1

        try:
            page_size = min(100, max(1, int(page_size_param)))
        except (ValueError, TypeError):
            page_size = 10

        total_pages = max(1, math.ceil(total_filtered / page_size)) if total_filtered > 0 else 1
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        paginated_qs = qs[start_idx:end_idx]
        serializer = AdminShopSerializer(paginated_qs, many=True)

        return Response({
            "status": "success",
            "count": total_filtered,
            "total_pages": total_pages,
            "current_page": page,
            "page_size": page_size,
            "counts": status_counts,
            "results": serializer.data,
        })


class AdminMerchantVerifyView(APIView):
    """
    Set shop verification status (pending, approved, rejected, suspended).
    Audited in AdminAction!
    """
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        shop = get_object_or_404(Shop, id=pk)
        new_status = request.data.get("status")
        notes = request.data.get("notes", "")

        if not new_status:
            return Response(
                {"error": "Verification status is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_status_clean = str(new_status).strip().lower()
        valid_statuses = list(Shop.VerificationStatus.values)

        if new_status_clean not in valid_statuses:
            return Response(
                {"error": f"Invalid status '{new_status}'. Must be one of: {valid_statuses}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_status = shop.verification_status
        shop.verification_status = new_status_clean
        # If suspended or rejected, optionally deactivate shop
        if new_status_clean in [Shop.VerificationStatus.REJECTED, Shop.VerificationStatus.SUSPENDED]:
            shop.is_active = False
        elif new_status_clean == Shop.VerificationStatus.APPROVED:
            shop.is_active = True
        shop.save()

        # Audit Log
        log_admin_action(
            admin=request.user,
            action_type="merchant_verify",
            target_type="shop",
            target_id=shop.id,
            details={
                "shop_name": shop.name,
                "merchant_id": str(shop.merchant_id),
                "old_status": old_status,
                "new_status": new_status_clean,
                "notes": notes,
            },
        )

        return Response({
            "status": "success",
            "message": f"Shop verification status updated to '{new_status_clean}'.",
            "shop": AdminShopSerializer(shop).data,
        })


# ===================================================================
# 3. Product & Category Moderation
# ===================================================================
class AdminProductListView(APIView):
    """List all products with category and active filters."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        category_id = request.query_params.get("category")
        is_active = request.query_params.get("is_active")
        q = request.query_params.get("q")

        qs = Product.objects.select_related("category").order_by("-created_at")

        if category_id:
            qs = qs.filter(category_id=category_id)
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == "true")
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(brand__icontains=q))

        serializer = AdminProductSerializer(qs, many=True)
        return Response({
            "status": "success",
            "count": qs.count(),
            "results": serializer.data,
        })


class AdminProductToggleActiveView(APIView):
    """Toggle a product's active status. Audited in AdminAction."""
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        product = get_object_or_404(Product, id=pk)
        old_val = product.is_active
        product.is_active = not old_val
        product.save(update_fields=["is_active", "updated_at"])

        log_admin_action(
            admin=request.user,
            action_type="product_toggle_active",
            target_type="product",
            target_id=product.id,
            details={
                "product_name": product.name,
                "old_is_active": old_val,
                "new_is_active": product.is_active,
            },
        )

        return Response({
            "status": "success",
            "message": f"Product '{product.name}' is now {'active' if product.is_active else 'inactive'}.",
            "product": AdminProductSerializer(product).data,
        })


class AdminCategoryListCreateView(APIView):
    """List or create product categories. Audited in AdminAction."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        cats = Category.objects.all().order_by("sort_order", "name")
        return Response({
            "status": "success",
            "count": cats.count(),
            "results": AdminCategorySerializer(cats, many=True).data,
        })

    def post(self, request):
        serializer = AdminCategorySerializer(data=request.data)
        if serializer.is_valid():
            category = serializer.save()
            log_admin_action(
                admin=request.user,
                action_type="category_create",
                target_type="category",
                target_id=category.id,
                details={"category_name": category.name},
            )
            return Response(
                {"status": "success", "category": AdminCategorySerializer(category).data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminCategoryDetailView(APIView):
    """Edit or delete a product category. Audited in AdminAction."""
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        category = get_object_or_404(Category, id=pk)
        serializer = AdminCategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            cat = serializer.save()
            log_admin_action(
                admin=request.user,
                action_type="category_update",
                target_type="category",
                target_id=cat.id,
                details=request.data,
            )
            return Response({"status": "success", "category": AdminCategorySerializer(cat).data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        category = get_object_or_404(Category, id=pk)
        cat_id = category.id
        cat_name = category.name
        category.delete()
        log_admin_action(
            admin=request.user,
            action_type="category_delete",
            target_type="category",
            target_id=cat_id,
            details={"category_name": cat_name},
        )
        return Response({"status": "success", "message": f"Category '{cat_name}' deleted."})


# ===================================================================
# 4. Reports Moderation (incorrect price, wrong stock, fake shop, inappropriate content, other)
# ===================================================================
class AdminReportListView(APIView):
    """List submitted user reports with reason and status filters."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        status_filter = request.query_params.get("status")
        reason_filter = request.query_params.get("reason")

        qs = Report.objects.select_related("reporter", "resolved_by").order_by("-created_at")

        if status_filter:
            qs = qs.filter(status=status_filter)
        if reason_filter:
            qs = qs.filter(reason=reason_filter)

        serializer = AdminReportSerializer(qs, many=True)
        return Response({
            "status": "success",
            "count": qs.count(),
            "results": serializer.data,
        })


class AdminReportResolveView(APIView):
    """Resolve or dismiss a report with notes. Audited in AdminAction."""
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        report = get_object_or_404(Report, id=pk)
        new_status = request.data.get("status")
        notes = request.data.get("resolution_notes", "")

        valid_statuses = [
            Report.Status.REVIEWED,
            Report.Status.RESOLVED,
            Report.Status.DISMISSED,
        ]

        if new_status not in valid_statuses:
            return Response(
                {"error": f"Invalid status. Must be one of: {valid_statuses}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report.status = new_status
        report.resolved_by = request.user
        report.resolution_notes = notes
        report.save()

        log_admin_action(
            admin=request.user,
            action_type="report_resolve",
            target_type="report",
            target_id=report.id,
            details={
                "report_type": report.report_type,
                "reason": report.reason,
                "new_status": new_status,
                "notes": notes,
            },
        )

        return Response({
            "status": "success",
            "message": f"Report marked as '{new_status}'.",
            "report": AdminReportSerializer(report).data,
        })


# ===================================================================
# 5. Review Moderation
# ===================================================================
class AdminReviewListView(APIView):
    """List customer reviews for moderation."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        is_approved = request.query_params.get("is_approved")
        qs = Review.objects.select_related("user", "shop").order_by("-created_at")

        if is_approved is not None:
            qs = qs.filter(is_approved=is_approved.lower() == "true")

        serializer = AdminReviewSerializer(qs, many=True)
        return Response({
            "status": "success",
            "count": qs.count(),
            "results": serializer.data,
        })


class AdminReviewModerateView(APIView):
    """Approve or reject a review. Audited in AdminAction."""
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        review = get_object_or_404(Review, id=pk)
        is_approved = request.data.get("is_approved", True)
        review.is_approved = is_approved
        review.save(update_fields=["is_approved", "updated_at"])

        log_admin_action(
            admin=request.user,
            action_type="review_moderate",
            target_type="review",
            target_id=review.id,
            details={"is_approved": is_approved, "shop_id": str(review.shop_id)},
        )

        return Response({
            "status": "success",
            "message": f"Review marked as {'approved' if is_approved else 'unapproved'}.",
            "review": AdminReviewSerializer(review).data,
        })

    def delete(self, request, pk):
        review = get_object_or_404(Review, id=pk)
        review_id = review.id
        shop_id = str(review.shop_id)
        review.delete()

        log_admin_action(
            admin=request.user,
            action_type="review_delete",
            target_type="review",
            target_id=review_id,
            details={"shop_id": shop_id, "action": "deleted_inappropriate_review"},
        )

        return Response({"status": "success", "message": "Inappropriate review deleted."})


# ===================================================================
# 6. Users Management (Block / Unblock / Role Inspection)
# ===================================================================
class AdminUserListView(APIView):
    """List users with role and status filtering."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        role_filter = request.query_params.get("role")
        is_active = request.query_params.get("is_active")
        q = request.query_params.get("q")

        qs = User.objects.all().order_by("-created_at")

        if role_filter:
            qs = qs.filter(role=role_filter)
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == "true")
        if q:
            qs = qs.filter(Q(email__icontains=q) | Q(full_name__icontains=q))

        serializer = AdminUserSerializer(qs, many=True)
        return Response({
            "status": "success",
            "count": qs.count(),
            "results": serializer.data,
        })


class AdminUserToggleActiveView(APIView):
    """Suspend or reactivate a user account. Audited in AdminAction."""
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        target_user = get_object_or_404(User, id=pk)

        # Prevent admin from deactivating themselves
        if target_user == request.user:
            return Response(
                {"error": "You cannot suspend your own admin account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_val = target_user.is_active
        target_user.is_active = not old_val
        target_user.save(update_fields=["is_active", "updated_at"])

        log_admin_action(
            admin=request.user,
            action_type="user_toggle_active",
            target_type="user",
            target_id=target_user.id,
            details={
                "target_email": target_user.email,
                "old_is_active": old_val,
                "new_is_active": target_user.is_active,
            },
        )

        return Response({
            "status": "success",
            "message": f"User '{target_user.email}' is now {'active' if target_user.is_active else 'suspended'}.",
            "user": AdminUserSerializer(target_user).data,
        })


# ===================================================================
# 7. Immutable Admin Action Audit Trail
# ===================================================================
class AdminAuditLogListView(APIView):
    """Read-only paginated listing of all platform administrative actions."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        action_type = request.query_params.get("action_type")
        target_type = request.query_params.get("target_type")

        qs = AdminAction.objects.select_related("admin").order_by("-created_at")

        if action_type:
            qs = qs.filter(action_type=action_type)
        if target_type:
            qs = qs.filter(target_type=target_type)

        serializer = AdminActionSerializer(qs[:100], many=True)
        return Response({
            "status": "success",
            "count": qs.count(),
            "results": serializer.data,
        })
