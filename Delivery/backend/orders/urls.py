from django.urls import path

from . import views

app_name = 'orders'

urlpatterns = [
    # Customer endpoints
    path('place/', views.PlaceOrderView.as_view(), name='place-order'),
    path('my-orders/', views.CustomerOrdersView.as_view(), name='customer-orders'),
    path('my-orders/<int:pk>/', views.CustomerOrderDetailView.as_view(), name='customer-order-detail'),
    path('<int:pk>/cancel/', views.CancelOrderView.as_view(), name='cancel-order'),

    # Vendor endpoints
    path('vendor/', views.VendorOrdersView.as_view(), name='vendor-orders'),
    path('vendor/<int:pk>/update-status/', views.VendorOrderUpdateView.as_view(), name='vendor-order-update'),

    # Delivery partner endpoints
    path('delivery/available/', views.DeliveryPartnerOrdersView.as_view(), name='delivery-orders'),
    path('delivery/<int:pk>/accept/', views.AcceptDeliveryView.as_view(), name='accept-delivery'),
    path('delivery/<int:pk>/update-status/', views.DeliveryStatusUpdateView.as_view(), name='delivery-status-update'),

    # Admin endpoints
    path('admin/all/', views.AdminOrdersView.as_view(), name='admin-orders'),
]
