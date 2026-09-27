"""
Nearza — Favorites App Models
"""

import uuid

from django.conf import settings
from django.db import models


class Favorite(models.Model):
    """User's saved product or shop."""

    class FavoriteType(models.TextChoices):
        PRODUCT = "product", "Product"
        SHOP = "shop", "Shop"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorites"
    )
    product = models.ForeignKey(
        "products.Product", on_delete=models.CASCADE,
        null=True, blank=True, related_name="favorited_by",
    )
    shop = models.ForeignKey(
        "shops.Shop", on_delete=models.CASCADE,
        null=True, blank=True, related_name="favorited_by",
    )
    favorite_type = models.CharField(
        max_length=10, choices=FavoriteType.choices, db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "favorites"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "product"],
                condition=models.Q(product__isnull=False),
                name="unique_user_product_favorite",
            ),
            models.UniqueConstraint(
                fields=["user", "shop"],
                condition=models.Q(shop__isnull=False),
                name="unique_user_shop_favorite",
            ),
        ]

    def __str__(self):
        target = self.product or self.shop
        return f"{self.user.full_name} ♥ {target}"
