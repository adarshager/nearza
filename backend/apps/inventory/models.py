"""
Nearza — Inventory App Models
InventoryUpdate audit trail for tracking price/stock changes.
"""

import uuid

from django.conf import settings
from django.db import models


class InventoryUpdate(models.Model):
    """Audit trail for inventory changes on shop products."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shop_product = models.ForeignKey(
        "products.ShopProduct",
        on_delete=models.CASCADE,
        related_name="inventory_updates",
    )
    previous_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    new_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    previous_quantity = models.IntegerField(null=True, blank=True)
    new_quantity = models.IntegerField(null=True, blank=True)
    previous_stock_status = models.CharField(max_length=20, blank=True, default="")
    new_stock_status = models.CharField(max_length=20, blank=True, default="")
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="inventory_updates",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "inventory_updates"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Update #{self.id} for {self.shop_product}"
