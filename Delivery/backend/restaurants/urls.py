from django.urls import path

from . import views

app_name = 'restaurants'

urlpatterns = [
    # Public endpoints
    path('', views.RestaurantListView.as_view(), name='restaurant-list'),
    path('featured/', views.FeaturedRestaurantsView.as_view(), name='featured-restaurants'),
    path('<int:pk>/', views.RestaurantDetailView.as_view(), name='restaurant-detail'),

    # Vendor endpoints
    path('vendor/my-restaurant/', views.VendorRestaurantView.as_view(), name='vendor-restaurant'),
    path('vendor/categories/', views.VendorMenuCategoryView.as_view(), name='vendor-categories'),
    path('vendor/categories/<int:pk>/', views.VendorMenuCategoryDetailView.as_view(), name='vendor-category-detail'),
    path('vendor/menu-items/', views.VendorMenuItemView.as_view(), name='vendor-menu-items'),
    path('vendor/menu-items/<int:pk>/', views.VendorMenuItemDetailView.as_view(), name='vendor-menu-item-detail'),
]
