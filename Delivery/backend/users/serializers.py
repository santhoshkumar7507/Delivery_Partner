from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import (
    CustomerProfile,
    DeliveryPartnerProfile,
    User,
    VendorProfile,
)


# ---------------------------------------------------------------------------
# Profile serializers
# ---------------------------------------------------------------------------

class VendorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = ['id', 'company_name', 'gst_number', 'is_approved',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'is_approved', 'created_at', 'updated_at']


class DeliveryPartnerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryPartnerProfile
        fields = ['id', 'vehicle_type', 'vehicle_number', 'is_available',
                  'current_latitude', 'current_longitude', 'is_approved',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'is_approved', 'created_at', 'updated_at']


class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ['id', 'default_address', 'latitude', 'longitude',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


# ---------------------------------------------------------------------------
# User serializers
# ---------------------------------------------------------------------------

class UserSerializer(serializers.ModelSerializer):
    """Read-only user serializer that includes the role-specific profile."""

    vendor_profile = VendorProfileSerializer(read_only=True)
    delivery_partner_profile = DeliveryPartnerProfileSerializer(read_only=True)
    customer_profile = CustomerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'address', 'role', 'avatar', 'is_verified',
            'date_joined',
            'vendor_profile', 'delivery_partner_profile', 'customer_profile',
        ]
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    """
    Registration serializer.

    Accepts base user fields plus optional nested profile data depending on the
    chosen role.
    """

    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    # Optional nested profile data sent during registration
    vendor_profile = VendorProfileSerializer(required=False)
    delivery_partner_profile = DeliveryPartnerProfileSerializer(required=False)
    customer_profile = CustomerProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2',
            'first_name', 'last_name', 'phone', 'address', 'role',
            'vendor_profile', 'delivery_partner_profile', 'customer_profile',
        ]

    # ---- Validation --------------------------------------------------

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {'password': 'Passwords do not match.'}
            )
        return attrs

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                'A user with this email already exists.'
            )
        return value

    # ---- Creation ----------------------------------------------------

    def create(self, validated_data):
        validated_data.pop('password2')
        vendor_data = validated_data.pop('vendor_profile', None)
        delivery_data = validated_data.pop('delivery_partner_profile', None)
        customer_data = validated_data.pop('customer_profile', None)

        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)

        # Admin users are also staff so they can access Django admin
        if user.role == User.Role.ADMIN:
            user.is_staff = True
            user.is_superuser = True

        user.save()

        # Create the matching profile
        role = user.role
        if role == User.Role.VENDOR:
            VendorProfile.objects.create(user=user, **(vendor_data or {}))
        elif role == User.Role.DELIVERY_PARTNER:
            DeliveryPartnerProfile.objects.create(
                user=user, **(delivery_data or {}),
            )
        else:
            # Default to customer profile (covers CUSTOMER and any other)
            CustomerProfile.objects.create(user=user, **(customer_data or {}))

        return user


class LoginSerializer(serializers.Serializer):
    """Accepts username/password and returns validated user."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            username=attrs['username'],
            password=attrs['password'],
        )
        if user is None:
            raise serializers.ValidationError('Invalid credentials.')
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled.')
        attrs['user'] = user
        return attrs


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Update basic user fields (not role or auth fields)."""

    vendor_profile = VendorProfileSerializer(required=False)
    delivery_partner_profile = DeliveryPartnerProfileSerializer(required=False)
    customer_profile = CustomerProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'address', 'avatar',
            'vendor_profile', 'delivery_partner_profile', 'customer_profile',
        ]

    def update(self, instance, validated_data):
        vendor_data = validated_data.pop('vendor_profile', None)
        delivery_data = validated_data.pop('delivery_partner_profile', None)
        customer_data = validated_data.pop('customer_profile', None)

        # Update base user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update nested profile if data was provided
        if vendor_data and hasattr(instance, 'vendor_profile'):
            for attr, value in vendor_data.items():
                setattr(instance.vendor_profile, attr, value)
            instance.vendor_profile.save()

        if delivery_data and hasattr(instance, 'delivery_partner_profile'):
            for attr, value in delivery_data.items():
                setattr(instance.delivery_partner_profile, attr, value)
            instance.delivery_partner_profile.save()

        if customer_data and hasattr(instance, 'customer_profile'):
            for attr, value in customer_data.items():
                setattr(instance.customer_profile, attr, value)
            instance.customer_profile.save()

        return instance
