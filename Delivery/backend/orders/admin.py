from django.contrib import admin

from .models import Order, OrderItem, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['menu_item', 'quantity', 'price', 'subtotal']


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ['old_status', 'new_status', 'changed_by', 'changed_at', 'notes']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'customer',
        'restaurant',
        'status',
        'grand_total',
        'payment_method',
        'payment_status',
        'delivery_partner',
        'created_at',
    ]
    list_filter = ['status', 'payment_method', 'payment_status', 'created_at']
    search_fields = [
        'customer__username',
        'restaurant__name',
        'delivery_partner__username',
    ]
    readonly_fields = ['created_at', 'updated_at']
    inlines = [OrderItemInline, OrderStatusHistoryInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'menu_item', 'quantity', 'price', 'subtotal']
    list_filter = ['order__status']
    search_fields = ['menu_item__name', 'order__id']


@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'old_status', 'new_status', 'changed_by', 'changed_at']
    list_filter = ['new_status', 'changed_at']
    search_fields = ['order__id', 'changed_by__username']
    readonly_fields = ['changed_at']
