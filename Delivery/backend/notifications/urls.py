from django.urls import path

from . import views

app_name = 'notifications'

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:id>/read/', views.NotificationMarkReadView.as_view(), name='notification-mark-read'),
    path('mark-all-read/', views.MarkAllReadView.as_view(), name='notification-mark-all-read'),
    path('unread-count/', views.UnreadCountView.as_view(), name='notification-unread-count'),
]
