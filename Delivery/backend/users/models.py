from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User model with role-based access."""

    class Role(models.TextChoices):
        CUSTOMER = 'customer', 'Customer'
        VENDOR = 'vendor', 'Vendor'
        DELIVERY_PARTNER = 'delivery_partner', 'Delivery Partner'
        ADMIN = 'admin', 'Admin'

    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
    )
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_vendor(self):
        return self.role == self.Role.VENDOR

    @property
    def is_delivery_partner(self):
        return self.role == self.Role.DELIVERY_PARTNER

    @property
    def is_customer(self):
        return self.role == self.Role.CUSTOMER


class VendorProfile(models.Model):
    """Profile for vendor/restaurant owner users."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='vendor_profile',
    )
    company_name = models.CharField(max_length=255, blank=True)
    gst_number = models.CharField(max_length=20, blank=True)
    is_approved = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Vendor: {self.user.username} - {self.company_name}"


class DeliveryPartnerProfile(models.Model):
    """Profile for delivery partner users."""

    class VehicleType(models.TextChoices):
        BICYCLE = 'bicycle', 'Bicycle'
        MOTORCYCLE = 'motorcycle', 'Motorcycle'
        CAR = 'car', 'Car'
        SCOOTER = 'scooter', 'Scooter'

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='delivery_partner_profile',
    )
    vehicle_type = models.CharField(
        max_length=20,
        choices=VehicleType.choices,
        default=VehicleType.MOTORCYCLE,
    )
    vehicle_number = models.CharField(max_length=20, blank=True)
    is_available = models.BooleanField(default=False)
    current_latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True,
    )
    current_longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True,
    )
    is_approved = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Delivery Partner: {self.user.username}"


class CustomerProfile(models.Model):
    """Profile for customer users."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='customer_profile',
    )
    default_address = models.TextField(blank=True)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True,
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Customer: {self.user.username}"
