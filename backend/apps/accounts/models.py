"""
Nearza — Custom User Model & Profile
Uses email as the primary identifier instead of username.
"""

import uuid

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model with email authentication and role-based access."""

    class Role(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        MERCHANT = "merchant", "Merchant"
        ADMIN = "admin", "Admin"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15, blank=True, default="")
    avatar_url = models.URLField(blank=True, default="")
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
        db_index=True,
    )
    is_active = models.BooleanField(default=True, db_index=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        db_table = "profiles"
        ordering = ["-created_at"]
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.full_name} ({self.email})"

    @property
    def is_customer(self):
        return self.role == self.Role.CUSTOMER

    @property
    def is_merchant(self):
        return self.role == self.Role.MERCHANT

    @property
    def is_admin_user(self):
        return self.role == self.Role.ADMIN
