from django.db.models import Q
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiParameter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter

from notifications.models import Notification
from users.permissions import IsAdmin, IsCustomer, IsDeliveryPartner, IsVendor
from .models import Order, OrderStatusHistory
from .serializers import (
    AssignDeliveryPartnerSerializer,
    OrderCreateSerializer,
    OrderDetailSerializer,
    OrderListSerializer,
    OrderStatusUpdateSerializer,
)


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _record_status_change(order, old_status, new_status, changed_by, notes=''):
    """Create an OrderStatusHistory record."""
    OrderStatusHistory.objects.create(
        order=order,
        old_status=old_status,
        new_status=new_status,
        changed_by=changed_by,
        notes=notes,
    )


# ---------------------------------------------------------------------------
# Customer views
# ---------------------------------------------------------------------------

@extend_schema(
    tags=['Orders'],
    request=OrderCreateSerializer,
    responses={201: OrderDetailSerializer},
    summary='Place a new order',
    description='Customer places a new order. All items must be from the same restaurant.',
)
class PlaceOrderView(APIView):
    """POST - Customer places a new order."""

    permission_classes = [IsCustomer]

    def post(self, request):
        serializer = OrderCreateSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        # Notify vendor about the new order
        Notification.objects.create(
            user=order.restaurant.vendor,
            title='New Order Received',
            message=(
                f'You have a new order #{order.pk} from {order.customer.username}. '
                f'Total: {order.grand_total}'
            ),
            notification_type='order_placed',
        )

        response_serializer = OrderDetailSerializer(order)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=['Orders'],
    responses={200: OrderListSerializer(many=True)},
    summary='List customer orders',
    description="Returns the authenticated customer's orders.",
)
class CustomerOrdersView(generics.ListAPIView):
    """GET - Customer's orders list."""

    serializer_class = OrderListSerializer
    permission_classes = [IsCustomer]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'payment_status']
    ordering_fields = ['created_at', 'grand_total']

    def get_queryset(self):
        return (
            Order.objects
            .filter(customer=self.request.user)
            .select_related('customer', 'restaurant', 'delivery_partner')
        )


@extend_schema(
    tags=['Orders'],
    responses={200: OrderDetailSerializer},
    summary='Customer order detail',
    description="Returns detailed info for a specific customer's order.",
)
class CustomerOrderDetailView(generics.RetrieveAPIView):
    """GET - Customer's order detail."""

    serializer_class = OrderDetailSerializer
    permission_classes = [IsCustomer]

    def get_queryset(self):
        return (
            Order.objects
            .filter(customer=self.request.user)
            .select_related('customer', 'restaurant', 'delivery_partner')
            .prefetch_related('items__menu_item', 'status_history__changed_by')
        )


@extend_schema(
    tags=['Orders'],
    request=None,
    responses={200: OrderDetailSerializer},
    summary='Cancel an order',
    description='Customer cancels an order. Only allowed when status is "placed".',
)
class CancelOrderView(APIView):
    """POST - Customer cancels an order if status is 'placed'."""

    permission_classes = [IsCustomer]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, customer=request.user)
        except Order.DoesNotExist:
            return Response(
                {'detail': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if order.status != Order.Status.PLACED:
            return Response(
                {'detail': 'Only orders with status "placed" can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_status = order.status
        order.status = Order.Status.CANCELLED
        order.save(update_fields=['status', 'updated_at'])

        _record_status_change(
            order, old_status, Order.Status.CANCELLED, request.user,
            notes='Cancelled by customer.',
        )

        # Notify vendor
        Notification.objects.create(
            user=order.restaurant.vendor,
            title='Order Cancelled',
            message=f'Order #{order.pk} has been cancelled by the customer.',
            notification_type='order_cancelled',
        )

        serializer = OrderDetailSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Vendor views
# ---------------------------------------------------------------------------

@extend_schema(
    tags=['Orders'],
    responses={200: OrderListSerializer(many=True)},
    summary='List vendor orders',
    description='Returns orders for restaurants owned by the authenticated vendor.',
)
class VendorOrdersView(generics.ListAPIView):
    """GET - Vendor sees orders for their restaurant(s)."""

    serializer_class = OrderListSerializer
    permission_classes = [IsVendor]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'payment_status']
    ordering_fields = ['created_at', 'grand_total']

    def get_queryset(self):
        return (
            Order.objects
            .filter(restaurant__vendor=self.request.user)
            .select_related('customer', 'restaurant', 'delivery_partner')
        )


@extend_schema(
    tags=['Orders'],
    request=OrderStatusUpdateSerializer,
    responses={200: OrderDetailSerializer},
    summary='Vendor update order status',
    description='Vendor updates order status. Allowed transitions: confirmed, preparing, ready_for_pickup.',
)
class VendorOrderUpdateView(APIView):
    """PUT - Vendor updates order status."""

    permission_classes = [IsVendor]

    VENDOR_ALLOWED_STATUSES = {
        Order.Status.CONFIRMED,
        Order.Status.PREPARING,
        Order.Status.READY_FOR_PICKUP,
    }

    def put(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, restaurant__vendor=request.user)
        except Order.DoesNotExist:
            return Response(
                {'detail': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        notes = serializer.validated_data.get('notes', '')

        if new_status not in self.VENDOR_ALLOWED_STATUSES:
            return Response(
                {'detail': f'Vendors can only set status to: {", ".join(s.value for s in self.VENDOR_ALLOWED_STATUSES)}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_status = order.status
        order.status = new_status
        order.save(update_fields=['status', 'updated_at'])

        _record_status_change(order, old_status, new_status, request.user, notes)

        # Notify customer
        status_display = order.get_status_display()
        Notification.objects.create(
            user=order.customer,
            title='Order Status Updated',
            message=f'Your order #{order.pk} is now "{status_display}".',
            notification_type=f'order_{new_status}' if new_status != Order.Status.READY_FOR_PICKUP else 'order_ready',
        )

        response_serializer = OrderDetailSerializer(order)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Delivery partner views
# ---------------------------------------------------------------------------

@extend_schema(
    tags=['Orders'],
    responses={200: OrderListSerializer(many=True)},
    parameters=[
        OpenApiParameter(
            name='type',
            type=str,
            enum=['available', 'assigned'],
            description='Filter by "available" (ready_for_pickup, no partner) or "assigned" (my active deliveries).',
        ),
    ],
    summary='Delivery partner orders',
    description='Returns available orders for pickup or orders assigned to the delivery partner.',
)
class DeliveryPartnerOrdersView(generics.ListAPIView):
    """GET - Available orders for pickup & assigned orders."""

    serializer_class = OrderListSerializer
    permission_classes = [IsDeliveryPartner]

    def get_queryset(self):
        filter_type = self.request.query_params.get('type', 'available')

        if filter_type == 'assigned':
            return (
                Order.objects
                .filter(
                    delivery_partner=self.request.user,
                    status__in=[
                        Order.Status.PICKED_UP,
                        Order.Status.ON_THE_WAY,
                        Order.Status.READY_FOR_PICKUP,
                    ],
                )
                .select_related('customer', 'restaurant', 'delivery_partner')
            )

        # Default: available orders (ready for pickup, no partner assigned)
        return (
            Order.objects
            .filter(
                status=Order.Status.READY_FOR_PICKUP,
                delivery_partner__isnull=True,
            )
            .select_related('customer', 'restaurant', 'delivery_partner')
        )


@extend_schema(
    tags=['Orders'],
    request=AssignDeliveryPartnerSerializer,
    responses={200: OrderDetailSerializer},
    summary='Accept a delivery order',
    description='Delivery partner accepts a ready-for-pickup order and is assigned to it.',
)
class AcceptDeliveryView(APIView):
    """POST - Delivery partner accepts an order."""

    permission_classes = [IsDeliveryPartner]

    def post(self, request, pk):
        try:
            order = Order.objects.get(
                pk=pk,
                status=Order.Status.READY_FOR_PICKUP,
                delivery_partner__isnull=True,
            )
        except Order.DoesNotExist:
            return Response(
                {'detail': 'Order not found or already assigned.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AssignDeliveryPartnerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        notes = serializer.validated_data.get('notes', '')

        order.delivery_partner = request.user
        order.save(update_fields=['delivery_partner', 'updated_at'])

        _record_status_change(
            order,
            order.status,
            order.status,
            request.user,
            notes=notes or 'Delivery partner assigned.',
        )

        # Notify customer
        Notification.objects.create(
            user=order.customer,
            title='Delivery Partner Assigned',
            message=(
                f'A delivery partner ({request.user.username}) has been assigned '
                f'to your order #{order.pk}.'
            ),
            notification_type='delivery_assigned',
        )

        # Notify vendor
        Notification.objects.create(
            user=order.restaurant.vendor,
            title='Delivery Partner Assigned',
            message=(
                f'Delivery partner {request.user.username} has accepted '
                f'order #{order.pk} for pickup.'
            ),
            notification_type='delivery_assigned',
        )

        response_serializer = OrderDetailSerializer(order)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Orders'],
    request=OrderStatusUpdateSerializer,
    responses={200: OrderDetailSerializer},
    summary='Delivery partner update status',
    description='Delivery partner updates order status. Allowed: picked_up, on_the_way, delivered.',
)
class DeliveryStatusUpdateView(APIView):
    """PUT - Delivery partner updates delivery status."""

    permission_classes = [IsDeliveryPartner]

    DELIVERY_ALLOWED_STATUSES = {
        Order.Status.PICKED_UP,
        Order.Status.ON_THE_WAY,
        Order.Status.DELIVERED,
    }

    def put(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, delivery_partner=request.user)
        except Order.DoesNotExist:
            return Response(
                {'detail': 'Order not found or not assigned to you.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        notes = serializer.validated_data.get('notes', '')

        if new_status not in self.DELIVERY_ALLOWED_STATUSES:
            return Response(
                {'detail': f'Delivery partners can only set status to: {", ".join(s.value for s in self.DELIVERY_ALLOWED_STATUSES)}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_status = order.status
        order.status = new_status
        order.save(update_fields=['status', 'updated_at'])

        _record_status_change(order, old_status, new_status, request.user, notes)

        # Determine notification type
        notification_type_map = {
            Order.Status.PICKED_UP: 'order_picked_up',
            Order.Status.ON_THE_WAY: 'order_on_the_way',
            Order.Status.DELIVERED: 'order_delivered',
        }

        status_display = order.get_status_display()

        # Notify customer
        Notification.objects.create(
            user=order.customer,
            title='Order Status Updated',
            message=f'Your order #{order.pk} is now "{status_display}".',
            notification_type=notification_type_map.get(new_status, 'general'),
        )

        # Notify vendor
        Notification.objects.create(
            user=order.restaurant.vendor,
            title='Delivery Status Updated',
            message=f'Order #{order.pk} is now "{status_display}".',
            notification_type=notification_type_map.get(new_status, 'general'),
        )

        response_serializer = OrderDetailSerializer(order)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Admin views
# ---------------------------------------------------------------------------

@extend_schema(
    tags=['Orders'],
    responses={200: OrderListSerializer(many=True)},
    parameters=[
        OpenApiParameter(name='status', type=str, description='Filter by order status'),
        OpenApiParameter(name='payment_status', type=str, description='Filter by payment status'),
        OpenApiParameter(name='restaurant', type=int, description='Filter by restaurant ID'),
        OpenApiParameter(name='customer', type=int, description='Filter by customer ID'),
        OpenApiParameter(name='delivery_partner', type=int, description='Filter by delivery partner ID'),
    ],
    summary='Admin list all orders',
    description='Admin can view all orders with optional filtering.',
)
class AdminOrdersView(generics.ListAPIView):
    """GET - Admin sees all orders with filtering."""

    serializer_class = OrderListSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_fields = [
        'status',
        'payment_status',
        'payment_method',
        'restaurant',
        'customer',
        'delivery_partner',
    ]
    ordering_fields = ['created_at', 'grand_total', 'status']
    search_fields = ['customer__username', 'restaurant__name']

    def get_queryset(self):
        return (
            Order.objects
            .all()
            .select_related('customer', 'restaurant', 'delivery_partner')
        )
