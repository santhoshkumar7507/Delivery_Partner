from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

app_name = 'users'

urlpatterns = [
    # Auth
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # Profile
    path('profile/', views.ProfileView.as_view(), name='profile'),

    # Admin — vendors
    path('vendors/', views.VendorListView.as_view(), name='vendor-list'),
    path('vendors/<int:pk>/approve/', views.ApproveVendorView.as_view(), name='vendor-approve'),

    # Admin — delivery partners
    path('delivery-partners/', views.DeliveryPartnerListView.as_view(), name='delivery-partner-list'),
    path('delivery-partners/<int:pk>/approve/', views.ApproveDeliveryPartnerView.as_view(), name='delivery-partner-approve'),

    # Admin — all users
    path('users/', views.AllUsersView.as_view(), name='user-list'),
]
