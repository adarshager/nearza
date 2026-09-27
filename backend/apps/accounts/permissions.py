"""
Nearza — RBAC Permission Classes
Server-side role and ownership checks. Never trust frontend-supplied role data.
"""

from rest_framework.permissions import BasePermission


class IsCustomer(BasePermission):
    """Allow access only to users with 'customer' role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "customer"
        )


class IsMerchant(BasePermission):
    """Allow access only to users with 'merchant' role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "merchant"
        )


class IsAdminUser(BasePermission):
    """Allow access only to users with 'admin' role, staff, or superusers."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                getattr(request.user, "role", None) == "admin"
                or getattr(request.user, "is_staff", False)
                or getattr(request.user, "is_superuser", False)
            )
        )


class IsMerchantOrAdmin(BasePermission):
    """Allow access to merchants or admins."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ("merchant", "admin")
        )


class IsObjectOwner(BasePermission):
    """
    Object-level permission: checks that the requesting user
    owns the object (obj.user or obj.user_id matches request.user).
    """

    def has_object_permission(self, request, view, obj):
        owner_field = getattr(obj, "user", None)
        if owner_field is None:
            owner_id = getattr(obj, "user_id", None)
            return owner_id == request.user.id
        return owner_field == request.user


class IsShopOwner(BasePermission):
    """
    Object-level permission: checks that the requesting merchant
    owns the shop (obj.merchant or obj.merchant_id matches request.user).
    Also applies to objects with a shop.merchant chain.
    """

    def has_object_permission(self, request, view, obj):
        # Direct shop ownership
        merchant = getattr(obj, "merchant", None)
        if merchant is not None:
            return merchant == request.user or getattr(obj, "merchant_id", None) == request.user.id

        # Indirect: object has a shop → merchant chain
        shop = getattr(obj, "shop", None)
        if shop is not None:
            return shop.merchant_id == request.user.id

        return False
