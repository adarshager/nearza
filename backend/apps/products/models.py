"""
Nearza — Products App Models
Category, Product, and ShopProduct models.
"""

import uuid

from django.conf import settings
from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    """Product category with optional parent for subcategories."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, default="")
    icon_url = models.URLField(blank=True, default="")
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True,
        related_name="children",
    )
    sort_order = models.IntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "categories"
        ordering = ["sort_order", "name"]
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Category.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class Product(models.Model):
    """
    Global product catalog entry. Contains product identity but NOT price.
    Prices are per-shop, stored in ShopProduct.
    """

    class Unit(models.TextChoices):
        KG = "kg", "Kilogram"
        G = "g", "Gram"
        L = "L", "Litre"
        ML = "mL", "Millilitre"
        PIECE = "piece", "Piece"
        PACK = "pack", "Pack"
        DOZEN = "dozen", "Dozen"
        BOX = "box", "Box"
        BOTTLE = "bottle", "Bottle"
        PAIR = "pair", "Pair"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=275, unique=True, blank=True)
    description = models.TextField(blank=True, default="")
    brand = models.CharField(max_length=150, blank=True, default="", db_index=True)
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="products"
    )
    image_url = models.URLField(blank=True, default="")
    unit = models.CharField(max_length=20, choices=Unit.choices)
    unit_value = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "products"
        ordering = ["name"]
        indexes = [
            models.Index(fields=["name"], name="idx_product_name"),
        ]

    def __str__(self):
        return f"{self.name} ({self.unit_value} {self.unit})"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(f"{self.name}-{self.unit_value}-{self.unit}")
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class ShopProduct(models.Model):
    """
    Junction table: links a Product to a Shop with merchant-specific
    price, quantity, stock status, and inventory tracking.
    This is the CORE table for price comparison.
    """

    class StockStatus(models.TextChoices):
        IN_STOCK = "in_stock", "In Stock"
        LOW_STOCK = "low_stock", "Low Stock"
        OUT_OF_STOCK = "out_of_stock", "Out of Stock"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    shop = models.ForeignKey(
        "shops.Shop", on_delete=models.CASCADE, related_name="shop_products"
    )
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="shop_products"
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=0)
    stock_status = models.CharField(
        max_length=20,
        choices=StockStatus.choices,
        default=StockStatus.IN_STOCK,
        db_index=True,
    )
    sku = models.CharField(max_length=50, blank=True, default="")
    merchant_notes = models.TextField(blank=True, default="")
    last_updated = models.DateTimeField(auto_now=True, db_index=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "shop_products"
        ordering = ["price"]
        constraints = [
            models.UniqueConstraint(
                fields=["shop", "product"],
                name="unique_shop_product",
            ),
            models.CheckConstraint(
                condition=models.Q(price__gt=0),
                name="positive_price",
            ),
            models.CheckConstraint(
                condition=models.Q(quantity__gte=0),
                name="non_negative_quantity",
            ),
        ]

    def __str__(self):
        return f"{self.product.name} @ {self.shop.name} — ₹{self.price}"

    @property
    def inventory_confidence(self):
        """
        Compute inventory confidence based on last_updated timestamp.
        - High: within 24 hours
        - Medium: within 3 days
        - Low: older than 7 days
        """
        from django.utils import timezone
        now = timezone.now()
        delta = now - self.last_updated
        if delta.days < 1:
            return "high"
        elif delta.days <= 3:
            return "medium"
        else:
            return "low"
