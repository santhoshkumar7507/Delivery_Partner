from rest_framework.permissions import BasePermission


class IsVendor(BasePermission):
    """Allow access only to users with the vendor role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'vendor'
        )


class IsCustomer(BasePermission):
    """Allow access only to users with the customer role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'customer'
        )


class IsDeliveryPartner(BasePermission):
    """Allow access only to users with the delivery_partner role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'delivery_partner'
        )


class IsAdmin(BasePermission):
    """Allow access only to users with the admin role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )
