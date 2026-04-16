from django.conf import settings
from django.db import models

from restaurants.models import MenuItem, Restaurant


class Order(models.Model):
    """Customer order from a restaurant."""

    class Status(models.TextChoices):
        PLACED = 'placed', 'Placed'
        CONFIRMED = 'confirmed', 'Confirmed'
        PREPARING = 'preparing', 'Preparing'
        READY_FOR_PICKUP = 'ready_for_pickup', 'Ready for Pickup'
        PICKED_UP = 'picked_up', 'Picked Up'
        ON_THE_WAY = 'on_the_way', 'On the Way'
        DELIVERED = 'delivered', 'Delivered'
        CANCELLED = 'cancelled', 'Cancelled'

    class PaymentMethod(models.TextChoices):
        COD = 'cod', 'Cash on Delivery'
        ONLINE = 'online', 'Online Payment'

    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PAID = 'paid', 'Paid'
        REFUNDED = 'refunded', 'Refunded'

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='customer_orders',
    )
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='orders',
    )
    delivery_partner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='delivery_orders',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PLACED,
    )
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_address = models.TextField()
    delivery_latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True,
    )
    delivery_longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True,
    )
    special_instructions = models.TextField(blank=True)
    payment_method = models.CharField(
        max_length=10,
        choices=PaymentMethod.choices,
        default=PaymentMethod.COD,
    )
    payment_status = models.CharField(
        max_length=10,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
    )
    estimated_delivery_time = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.pk} - {self.customer} from {self.restaurant}"


class OrderItem(models.Model):
    """Individual item within an order."""

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
    )
    menu_item = models.ForeignKey(
        MenuItem,
        on_delete=models.CASCADE,
        related_name='order_items',
    )
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name} (Order #{self.order_id})"


class OrderStatusHistory(models.Model):
    """Audit trail for order status changes."""

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='status_history',
    )
    old_status = models.CharField(max_length=20, choices=Order.Status.choices, blank=True)
    new_status = models.CharField(max_length=20, choices=Order.Status.choices)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='order_status_changes',
    )
    changed_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-changed_at']
        verbose_name_plural = 'Order status histories'

    def __str__(self):
        return f"Order #{self.order_id}: {self.old_status} -> {self.new_status}"
