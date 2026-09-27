"""
Nearza — Account Views
Registration, login, logout, profile, and password management.
"""

from django.contrib.auth import authenticate, get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from .permissions import IsAdminUser, IsCustomer, IsMerchant
from .serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserProfileSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Register a new customer or merchant account."""

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "status": "success",
                "data": {
                    "user": UserProfileSerializer(user).data,
                    "tokens": {
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                    },
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """Authenticate with email and password, returns JWT tokens."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )

        if user is None:
            return Response(
                {"status": "error", "message": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"status": "error", "message": "Account is suspended."},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "status": "success",
                "data": {
                    "user": UserProfileSerializer(user).data,
                    "tokens": {
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                    },
                },
            },
        )


class LogoutView(APIView):
    """Blacklist the refresh token to log out."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"status": "error", "message": "Refresh token is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"status": "success", "message": "Logged out successfully."},
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                {"status": "error", "message": "Invalid token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get or update the current user's profile."""

    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return Response({"status": "success", "data": serializer.data})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", True)
        serializer = self.get_serializer(
            self.get_object(), data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"status": "success", "data": serializer.data})


class ChangePasswordView(APIView):
    """Change the authenticated user's password."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response(
                {"status": "error", "message": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response(
            {"status": "success", "message": "Password changed successfully."},
        )


class PasswordResetRequestView(APIView):
    """Generate a password reset token for the specified email."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].lower()
        try:
            user = User.objects.get(email=email, is_active=True)
            token = default_token_generator.make_token(user)
            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
            # In a production mailer, send an email with the link.
            # We return token/uidb64 in the response for development testing.
            return Response(
                {
                    "status": "success",
                    "message": "Password reset instructions have been sent.",
                    "data": {
                        "uidb64": uidb64,
                        "token": token,
                    },
                },
                status=status.HTTP_200_OK,
            )
        except User.DoesNotExist:
            # Generic message to prevent user enumeration
            return Response(
                {
                    "status": "success",
                    "message": "If an account with that email exists, reset instructions have been sent.",
                },
                status=status.HTTP_200_OK,
            )


class PasswordResetConfirmView(APIView):
    """Confirm password reset using uidb64 and token."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            uid = force_str(urlsafe_base64_decode(serializer.validated_data["uidb64"]))
            user = User.objects.get(pk=uid, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"status": "error", "message": "Invalid password reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, serializer.validated_data["token"]):
            return Response(
                {"status": "error", "message": "Password reset link has expired or is invalid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response(
            {"status": "success", "message": "Password has been reset successfully. You can now log in."},
            status=status.HTTP_200_OK,
        )


# ===================================================================
# Role-Protected Route Verification Endpoints
# Backend rigorously enforces permissions; never trusts frontend-sent roles.
# ===================================================================

class CustomerOnlyView(APIView):
    """Enforces customer-only access on the server."""

    permission_classes = [IsAuthenticated, IsCustomer]

    def get(self, request):
        return Response(
            {
                "status": "success",
                "message": f"Welcome customer {request.user.full_name}. Server verified your customer role.",
                "data": {"role": request.user.role},
            }
        )


class MerchantOnlyView(APIView):
    """Enforces merchant-only access on the server."""

    permission_classes = [IsAuthenticated, IsMerchant]

    def get(self, request):
        return Response(
            {
                "status": "success",
                "message": f"Welcome merchant {request.user.full_name}. Server verified your merchant role.",
                "data": {"role": request.user.role},
            }
        )


class AdminOnlyView(APIView):
    """Enforces admin-only access on the server."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response(
            {
                "status": "success",
                "message": f"Welcome admin {request.user.full_name}. Server verified your admin role.",
                "data": {"role": request.user.role},
            }
        )

