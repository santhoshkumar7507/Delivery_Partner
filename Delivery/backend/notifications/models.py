from django.conf import settings
from django.db import models


class Notification(models.Model):
    """User notification for order updates, account events, and general info."""

    class NotificationType(models.TextChoices):
        ORDER_PLACED = 'order_placed', 'Order Placed'
        ORDER_CONFIRMED = 'order_confirmed', 'Order Confirmed'
        ORDER_PREPARING = 'order_preparing', 'Order Preparing'
        ORDER_READY = 'order_ready', 'Order Ready'
        ORDER_PICKED_UP = 'order_picked_up', 'Order Picked Up'
        ORDER_ON_THE_WAY = 'order_on_the_way', 'Order On The Way'
        ORDER_DELIVERED = 'order_delivered', 'Order Delivered'
        ORDER_CANCELLED = 'order_cancelled', 'Order Cancelled'
        NEW_ORDER = 'new_order', 'New Order'
        DELIVERY_ASSIGNED = 'delivery_assigned', 'Delivery Assigned'
        ACCOUNT_APPROVED = 'account_approved', 'Account Approved'
        GENERAL = 'general', 'General'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.GENERAL,
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    related_order_id = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} -> {self.user.username}"
