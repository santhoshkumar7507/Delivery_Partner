import django_filters

from .models import Restaurant


class RestaurantFilter(django_filters.FilterSet):
    """FilterSet for the Restaurant model."""

    name = django_filters.CharFilter(lookup_expr='icontains')
    cuisine_type = django_filters.ChoiceFilter(
        choices=Restaurant.CuisineType.choices,
    )
    is_active = django_filters.BooleanFilter()
    is_featured = django_filters.BooleanFilter()
    min_rating = django_filters.NumberFilter(
        field_name='average_rating', lookup_expr='gte',
    )
    max_delivery_fee = django_filters.NumberFilter(
        field_name='delivery_fee', lookup_expr='lte',
    )
    max_delivery_time = django_filters.NumberFilter(
        field_name='estimated_delivery_time', lookup_expr='lte',
    )

    class Meta:
        model = Restaurant
        fields = [
            'name',
            'cuisine_type',
            'is_active',
            'is_featured',
            'min_rating',
            'max_delivery_fee',
            'max_delivery_time',
        ]
