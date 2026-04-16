from django.contrib import admin

from .models import Restaurant, MenuCategory, MenuItem


class MenuCategoryInline(admin.TabularInline):
    model = MenuCategory
    extra = 0
    show_change_link = True


class MenuItemInline(admin.TabularInline):
    model = MenuItem
    extra = 0


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'vendor', 'cuisine_type', 'is_active',
        'is_featured', 'average_rating', 'total_ratings',
    ]
    list_filter = ['cuisine_type', 'is_active', 'is_featured']
    search_fields = ['name', 'address', 'vendor__username']
    readonly_fields = ['average_rating', 'total_ratings', 'created_at', 'updated_at']
    inlines = [MenuCategoryInline]


@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'restaurant', 'is_active', 'sort_order']
    list_filter = ['is_active', 'restaurant']
    search_fields = ['name', 'restaurant__name']
    inlines = [MenuItemInline]


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'category', 'price', 'is_available',
        'is_veg', 'is_bestseller', 'preparation_time',
    ]
    list_filter = ['is_available', 'is_veg', 'is_bestseller', 'category__restaurant']
    search_fields = ['name', 'category__name', 'category__restaurant__name']
