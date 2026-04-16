from rest_framework import serializers

from .models import Restaurant, MenuCategory, MenuItem


class MenuItemSerializer(serializers.ModelSerializer):
    """Read serializer for menu items."""

    class Meta:
        model = MenuItem
        fields = [
            'id',
            'category',
            'name',
            'description',
            'price',
            'image',
            'is_available',
            'is_veg',
            'is_bestseller',
            'preparation_time',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MenuCategorySerializer(serializers.ModelSerializer):
    """Read serializer for menu categories with nested items."""

    items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = MenuCategory
        fields = [
            'id',
            'restaurant',
            'name',
            'description',
            'is_active',
            'sort_order',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RestaurantListSerializer(serializers.ModelSerializer):
    """Summary serializer for restaurant listings."""

    vendor_name = serializers.CharField(source='vendor.get_full_name', read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            'id',
            'name',
            'cuisine_type',
            'address',
            'image',
            'is_active',
            'average_rating',
            'total_ratings',
            'is_featured',
            'delivery_fee',
            'min_order_amount',
            'estimated_delivery_time',
            'vendor_name',
        ]


class RestaurantDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer with nested categories and menu items."""

    vendor_name = serializers.CharField(source='vendor.get_full_name', read_only=True)
    categories = MenuCategorySerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            'id',
            'vendor',
            'vendor_name',
            'name',
            'description',
            'address',
            'latitude',
            'longitude',
            'phone',
            'cuisine_type',
            'opening_time',
            'closing_time',
            'is_active',
            'average_rating',
            'total_ratings',
            'image',
            'is_featured',
            'min_order_amount',
            'delivery_fee',
            'estimated_delivery_time',
            'categories',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id', 'vendor', 'average_rating', 'total_ratings',
            'created_at', 'updated_at',
        ]


class RestaurantCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for vendors to create/update their restaurant."""

    class Meta:
        model = Restaurant
        fields = [
            'id',
            'name',
            'description',
            'address',
            'latitude',
            'longitude',
            'phone',
            'cuisine_type',
            'opening_time',
            'closing_time',
            'is_active',
            'image',
            'min_order_amount',
            'delivery_fee',
            'estimated_delivery_time',
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        validated_data['vendor'] = self.context['request'].user
        return super().create(validated_data)


class MenuCategoryCreateSerializer(serializers.ModelSerializer):
    """Serializer for vendors to create/update menu categories."""

    class Meta:
        model = MenuCategory
        fields = [
            'id',
            'restaurant',
            'name',
            'description',
            'is_active',
            'sort_order',
        ]
        read_only_fields = ['id', 'restaurant']

    def validate(self, attrs):
        request = self.context['request']
        # On create, restaurant is set automatically; on update, it's already set.
        if self.instance is None:
            restaurant = Restaurant.objects.filter(vendor=request.user).first()
            if not restaurant:
                raise serializers.ValidationError(
                    'You must create a restaurant before adding categories.'
                )
            attrs['restaurant'] = restaurant
        return attrs


class MenuItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for vendors to create/update menu items."""

    class Meta:
        model = MenuItem
        fields = [
            'id',
            'category',
            'name',
            'description',
            'price',
            'image',
            'is_available',
            'is_veg',
            'is_bestseller',
            'preparation_time',
        ]
        read_only_fields = ['id']

    def validate_category(self, value):
        request = self.context['request']
        if value.restaurant.vendor != request.user:
            raise serializers.ValidationError(
                'You can only add items to your own restaurant categories.'
            )
        return value
