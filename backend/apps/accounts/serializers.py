"""
Nearza — Account Serializers
Registration, login, profile management serializers.
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(
        write_only=True, min_length=8, validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "id", "email", "full_name", "phone", "role",
            "password", "password_confirm",
        ]
        read_only_fields = ["id"]

    def validate_role(self, value):
        """Only allow customer or merchant registration. Admins are created manually."""
        if value not in ("customer", "merchant"):
            raise serializers.ValidationError(
                "Registration is only allowed for 'customer' or 'merchant' roles."
            )
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for email/password login."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for viewing/updating user profile."""

    class Meta:
        model = User
        fields = [
            "id", "email", "full_name", "phone", "avatar_url",
            "role", "is_email_verified", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "email", "role", "is_email_verified", "created_at", "updated_at"]


class UserMiniSerializer(serializers.ModelSerializer):
    """Compact user representation for reviews, reports, and admin panels."""

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "role", "avatar_url"]
        read_only_fields = ["id", "email", "full_name", "role", "avatar_url"]


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""

    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(
        write_only=True, min_length=8, validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "Passwords do not match."}
            )
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting password reset token."""

    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for completing password reset with token."""

    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(
        write_only=True, min_length=8, validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "Passwords do not match."}
            )
        return attrs

