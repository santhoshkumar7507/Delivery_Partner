from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import (
    CustomerProfile,
    DeliveryPartnerProfile,
    User,
    VendorProfile,
)


class VendorProfileInline(admin.StackedInline):
    model = VendorProfile
    can_delete = False
    extra = 0


class DeliveryPartnerProfileInline(admin.StackedInline):
    model = DeliveryPartnerProfile
    can_delete = False
    extra = 0


class CustomerProfileInline(admin.StackedInline):
    model = CustomerProfile
    can_delete = False
    extra = 0


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        'username', 'email', 'role', 'is_verified', 'is_active', 'date_joined',
    ]
    list_filter = ['role', 'is_verified', 'is_active', 'is_staff']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    ordering = ['-date_joined']

    fieldsets = BaseUserAdmin.fieldsets + (
        ('Extra Fields', {
            'fields': ('phone', 'address', 'role', 'avatar', 'is_verified'),
        }),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Extra Fields', {
            'fields': ('email', 'phone', 'role'),
        }),
    )

    inlines = [VendorProfileInline, DeliveryPartnerProfileInline, CustomerProfileInline]


@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'company_name', 'gst_number', 'is_approved']
    list_filter = ['is_approved']
    search_fields = ['user__username', 'company_name', 'gst_number']


@admin.register(DeliveryPartnerProfile)
class DeliveryPartnerProfileAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'vehicle_type', 'vehicle_number', 'is_available', 'is_approved',
    ]
    list_filter = ['is_approved', 'is_available', 'vehicle_type']
    search_fields = ['user__username', 'vehicle_number']


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'default_address']
    search_fields = ['user__username', 'default_address']
