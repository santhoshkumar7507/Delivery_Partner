from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter

from users.permissions import IsVendor
from .models import Restaurant, MenuCategory, MenuItem
from .serializers import (
    RestaurantListSerializer,
    RestaurantDetailSerializer,
    RestaurantCreateUpdateSerializer,
    MenuCategorySerializer,
    MenuCategoryCreateSerializer,
    MenuItemSerializer,
    MenuItemCreateSerializer,
)
from .filters import RestaurantFilter


# ---------------------------------------------------------------------------
# Public endpoints
# ---------------------------------------------------------------------------


@extend_schema(tags=['Restaurants'])
class RestaurantListView(generics.ListAPIView):
    """List all active restaurants. Supports filtering, search, and ordering."""

    permission_classes = [AllowAny]
    serializer_class = RestaurantListSerializer
    queryset = Restaurant.objects.filter(is_active=True)
    filterset_class = RestaurantFilter
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'cuisine_type', 'address']
    ordering_fields = [
        'name', 'average_rating', 'delivery_fee',
        'estimated_delivery_time', 'created_at',
    ]
    ordering = ['-is_featured', '-average_rating']


@extend_schema(tags=['Restaurants'])
class RestaurantDetailView(generics.RetrieveAPIView):
    """Retrieve full detail of a single restaurant including menu."""

    permission_classes = [AllowAny]
    serializer_class = RestaurantDetailSerializer
    queryset = Restaurant.objects.prefetch_related(
        'categories__items',
    ).filter(is_active=True)
    lookup_field = 'pk'


@extend_schema(tags=['Restaurants'])
class FeaturedRestaurantsView(generics.ListAPIView):
    """List featured restaurants."""

    permission_classes = [AllowAny]
    serializer_class = RestaurantListSerializer
    queryset = Restaurant.objects.filter(is_active=True, is_featured=True)


# ---------------------------------------------------------------------------
# Vendor endpoints
# ---------------------------------------------------------------------------


@extend_schema(tags=['Restaurants'])
class VendorRestaurantView(generics.GenericAPIView):
    """
    Vendor manages their own restaurant.
    GET  - retrieve own restaurant
    POST - create restaurant (if none exists)
    PUT  - update own restaurant
    """

    permission_classes = [IsAuthenticated, IsVendor]
    serializer_class = RestaurantCreateUpdateSerializer

    def get_object(self):
        return Restaurant.objects.filter(vendor=self.request.user).first()

    @extend_schema(
        responses={200: RestaurantDetailSerializer},
        tags=['Restaurants'],
    )
    def get(self, request, *args, **kwargs):
        restaurant = self.get_object()
        if not restaurant:
            return Response(
                {'detail': 'You have not created a restaurant yet.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = RestaurantDetailSerializer(restaurant)
        return Response(serializer.data)

    @extend_schema(
        request=RestaurantCreateUpdateSerializer,
        responses={201: RestaurantDetailSerializer},
        tags=['Restaurants'],
    )
    def post(self, request, *args, **kwargs):
        if Restaurant.objects.filter(vendor=request.user).exists():
            return Response(
                {'detail': 'You already have a restaurant. Use PUT to update.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        restaurant = serializer.save()
        detail_serializer = RestaurantDetailSerializer(restaurant)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        request=RestaurantCreateUpdateSerializer,
        responses={200: RestaurantDetailSerializer},
        tags=['Restaurants'],
    )
    def put(self, request, *args, **kwargs):
        restaurant = self.get_object()
        if not restaurant:
            return Response(
                {'detail': 'You have not created a restaurant yet. Use POST first.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = self.get_serializer(restaurant, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        restaurant = serializer.save()
        detail_serializer = RestaurantDetailSerializer(restaurant)
        return Response(detail_serializer.data)


@extend_schema(tags=['Restaurants'])
class VendorMenuCategoryView(generics.ListCreateAPIView):
    """
    Vendor manages menu categories for their restaurant.
    GET  - list categories
    POST - create category
    """

    permission_classes = [IsAuthenticated, IsVendor]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MenuCategoryCreateSerializer
        return MenuCategorySerializer

    def get_queryset(self):
        return MenuCategory.objects.filter(
            restaurant__vendor=self.request.user,
        ).prefetch_related('items')


@extend_schema(tags=['Restaurants'])
class VendorMenuCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vendor manages a single menu category.
    GET    - retrieve
    PUT    - update
    DELETE - delete
    """

    permission_classes = [IsAuthenticated, IsVendor]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return MenuCategoryCreateSerializer
        return MenuCategorySerializer

    def get_queryset(self):
        return MenuCategory.objects.filter(
            restaurant__vendor=self.request.user,
        ).prefetch_related('items')

    lookup_field = 'pk'


@extend_schema(tags=['Restaurants'])
class VendorMenuItemView(generics.ListCreateAPIView):
    """
    Vendor manages menu items.
    GET  - list items for vendor's restaurant
    POST - create item
    """

    permission_classes = [IsAuthenticated, IsVendor]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MenuItemCreateSerializer
        return MenuItemSerializer

    def get_queryset(self):
        return MenuItem.objects.filter(
            category__restaurant__vendor=self.request.user,
        ).select_related('category')


@extend_schema(tags=['Restaurants'])
class VendorMenuItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vendor manages a single menu item.
    GET    - retrieve
    PUT    - update
    DELETE - delete
    """

    permission_classes = [IsAuthenticated, IsVendor]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return MenuItemCreateSerializer
        return MenuItemSerializer

    def get_queryset(self):
        return MenuItem.objects.filter(
            category__restaurant__vendor=self.request.user,
        ).select_related('category')

    lookup_field = 'pk'
