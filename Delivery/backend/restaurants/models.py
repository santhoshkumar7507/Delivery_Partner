from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Restaurant(models.Model):
    """Restaurant owned by a vendor user."""

    class CuisineType(models.TextChoices):
        INDIAN = 'indian', 'Indian'
        CHINESE = 'chinese', 'Chinese'
        ITALIAN = 'italian', 'Italian'
        MEXICAN = 'mexican', 'Mexican'
        THAI = 'thai', 'Thai'
        JAPANESE = 'japanese', 'Japanese'
        AMERICAN = 'american', 'American'
        CONTINENTAL = 'continental', 'Continental'
        FAST_FOOD = 'fast_food', 'Fast Food'
        DESSERTS = 'desserts', 'Desserts'
        BEVERAGES = 'beverages', 'Beverages'

    vendor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='restaurants',
        limit_choices_to={'role': 'vendor'},
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    address = models.TextField()
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True,
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True,
    )
    phone = models.CharField(max_length=15)
    cuisine_type = models.CharField(
        max_length=20,
        choices=CuisineType.choices,
        default=CuisineType.INDIAN,
    )
    opening_time = models.TimeField()
    closing_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    total_ratings = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='restaurants/', blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    min_order_amount = models.DecimalField(
        max_digits=8, decimal_places=2, default=0.00,
    )
    delivery_fee = models.DecimalField(
        max_digits=6, decimal_places=2, default=0.00,
    )
    estimated_delivery_time = models.PositiveIntegerField(
        help_text='Estimated delivery time in minutes',
        default=30,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'restaurants'
        ordering = ['-is_featured', '-average_rating']

    def __str__(self):
        return self.name


class MenuCategory(models.Model):
    """Category to group menu items within a restaurant."""

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='categories',
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'menu_categories'
        ordering = ['sort_order', 'name']
        verbose_name_plural = 'Menu categories'

    def __str__(self):
        return f"{self.name} ({self.restaurant.name})"


class MenuItem(models.Model):
    """Individual menu item within a category."""

    category = models.ForeignKey(
        MenuCategory,
        on_delete=models.CASCADE,
        related_name='items',
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to='menu_items/', blank=True, null=True)
    is_available = models.BooleanField(default=True)
    is_veg = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    preparation_time = models.PositiveIntegerField(
        help_text='Preparation time in minutes',
        default=15,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'menu_items'
        ordering = ['-is_bestseller', 'name']

    def __str__(self):
        return f"{self.name} - ₹{self.price}"
