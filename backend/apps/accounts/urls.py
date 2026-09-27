"""
Nearza — Account URL Configuration
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

app_name = "accounts"

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", views.ProfileView.as_view(), name="profile"),
    path("password/change/", views.ChangePasswordView.as_view(), name="password-change"),
    path("password/reset/", views.PasswordResetRequestView.as_view(), name="password-reset-request"),
    path("password/reset/confirm/", views.PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    # Role-based protected endpoints for verification
    path("protected/customer/", views.CustomerOnlyView.as_view(), name="protected-customer"),
    path("protected/merchant/", views.MerchantOnlyView.as_view(), name="protected-merchant"),
    path("protected/admin/", views.AdminOnlyView.as_view(), name="protected-admin"),
]
