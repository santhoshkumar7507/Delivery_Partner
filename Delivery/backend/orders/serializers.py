from decimal import Decimal

from rest_framework import serializers

from restaurants.models import MenuItem
from .models import Order, OrderItem, OrderStatusHistory


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items (read)."""

    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'menu_item',
            'menu_item_name',
            'quantity',
            'price',
            'subtotal',
        ]
        read_only_fields = ['id', 'price', 'subtotal']


class OrderItemCreateSerializer(serializers.Serializer):
    """Serializer for items when creating an order."""

    menu_item = serializers.PrimaryKeyRelatedField(queryset=MenuItem.objects.all())
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    """Serializer for placing a new order."""

    items = OrderItemCreateSerializer(many=True, min_length=1)
    delivery_address = serializers.CharField()
    delivery_latitude = serializers.DecimalField(
        max_digits=9, decimal_places=6, required=False, allow_null=True,
    )
    delivery_longitude = serializers.DecimalField(
        max_digits=9, decimal_places=6, required=False, allow_null=True,
    )
    special_instructions = serializers.CharField(required=False, default='')
    payment_method = serializers.ChoiceField(
        choices=Order.PaymentMethod.choices,
        default=Order.PaymentMethod.COD,
    )

    def validate_items(self, items):
        """Ensure all items belong to the same restaurant and are available."""
        menu_items = [item['menu_item'] for item in items]
        restaurant_ids = {mi.category.restaurant_id for mi in menu_items}

        if len(restaurant_ids) > 1:
            raise serializers.ValidationError(
                'All items must belong to the same restaurant.'
            )

        unavailable = [mi.name for mi in menu_items if not mi.is_available]
        if unavailable:
            raise serializers.ValidationError(
                f'The following items are not available: {", ".join(unavailable)}'
            )

        return items

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        customer = self.context['request'].user

        # Determine restaurant from first item
        restaurant = items_data[0]['menu_item'].category.restaurant

        # Calculate totals
        total_amount = Decimal('0.00')
        for item in items_data:
            subtotal = item['menu_item'].price * item['quantity']
            total_amount += subtotal

        delivery_fee = restaurant.delivery_fee
        grand_total = total_amount + delivery_fee

        # Create order
        order = Order.objects.create(
            customer=customer,
            restaurant=restaurant,
            total_amount=total_amount,
            delivery_fee=delivery_fee,
            grand_total=grand_total,
            delivery_address=validated_data['delivery_address'],
            delivery_latitude=validated_data.get('delivery_latitude'),
            delivery_longitude=validated_data.get('delivery_longitude'),
            special_instructions=validated_data.get('special_instructions', ''),
            payment_method=validated_data.get('payment_method', Order.PaymentMethod.COD),
            status=Order.Status.PLACED,
        )

        # Create order items
        order_items = []
        for item in items_data:
            menu_item = item['menu_item']
            quantity = item['quantity']
            price = menu_item.price
            subtotal = price * quantity
            order_items.append(
                OrderItem(
                    order=order,
                    menu_item=menu_item,
                    quantity=quantity,
                    price=price,
                    subtotal=subtotal,
                )
            )
        OrderItem.objects.bulk_create(order_items)

        # Create initial status history
        OrderStatusHistory.objects.create(
            order=order,
            old_status='',
            new_status=Order.Status.PLACED,
            changed_by=customer,
            notes='Order placed by customer.',
        )

        return order


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    """Serializer for order status history records."""

    changed_by_name = serializers.CharField(source='changed_by.username', read_only=True)

    class Meta:
        model = OrderStatusHistory
        fields = [
            'id',
            'old_status',
            'new_status',
            'changed_by',
            'changed_by_name',
            'changed_at',
            'notes',
        ]
        read_only_fields = fields


class OrderListSerializer(serializers.ModelSerializer):
    """Serializer for listing orders (summary view)."""

    customer_name = serializers.CharField(source='customer.username', read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    delivery_partner_name = serializers.SerializerMethodField()
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id',
            'customer',
            'customer_name',
            'restaurant',
            'restaurant_name',
            'delivery_partner',
            'delivery_partner_name',
            'status',
            'total_amount',
            'delivery_fee',
            'grand_total',
            'payment_method',
            'payment_status',
            'items_count',
            'created_at',
            'updated_at',
            'estimated_delivery_time',
        ]
        read_only_fields = fields

    def get_delivery_partner_name(self, obj):
        if obj.delivery_partner:
            return obj.delivery_partner.username
        return None

    def get_items_count(self, obj):
        return obj.items.count()


class OrderDetailSerializer(serializers.ModelSerializer):
    """Serializer for order detail view with nested items and status history."""

    customer_name = serializers.CharField(source='customer.username', read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    delivery_partner_name = serializers.SerializerMethodField()
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'customer',
            'customer_name',
            'restaurant',
            'restaurant_name',
            'delivery_partner',
            'delivery_partner_name',
            'status',
            'total_amount',
            'delivery_fee',
            'grand_total',
            'delivery_address',
            'delivery_latitude',
            'delivery_longitude',
            'special_instructions',
            'payment_method',
            'payment_status',
            'estimated_delivery_time',
            'created_at',
            'updated_at',
            'items',
            'status_history',
        ]
        read_only_fields = fields

    def get_delivery_partner_name(self, obj):
        if obj.delivery_partner:
            return obj.delivery_partner.username
        return None


class OrderStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating order status."""

    status = serializers.ChoiceField(choices=Order.Status.choices)
    notes = serializers.CharField(required=False, default='')


class AssignDeliveryPartnerSerializer(serializers.Serializer):
    """Serializer for assigning a delivery partner to an order."""

    notes = serializers.CharField(required=False, default='')
