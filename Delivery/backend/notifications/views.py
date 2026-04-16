from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import Notification
from .serializers import MarkReadSerializer, NotificationSerializer


@extend_schema(
    tags=['Notifications'],
    parameters=[
        OpenApiParameter(
            name='is_read',
            type=bool,
            location=OpenApiParameter.QUERY,
            description='Filter by read status (true/false)',
            required=False,
        ),
    ],
)
class NotificationListView(generics.ListAPIView):
    """List the current user's notifications, ordered by most recent first."""

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Notification.objects.filter(user=self.request.user)
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            qs = qs.filter(is_read=is_read.lower() in ('true', '1'))
        return qs


@extend_schema(tags=['Notifications'])
class NotificationMarkReadView(generics.UpdateAPIView):
    """Mark a single notification as read."""

    serializer_class = MarkReadSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


@extend_schema(tags=['Notifications'])
class MarkAllReadView(APIView):
    """Mark all of the current user's notifications as read."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated = Notification.objects.filter(
            user=request.user, is_read=False,
        ).update(is_read=True)
        return Response(
            {'detail': f'{updated} notifications marked as read.'},
            status=status.HTTP_200_OK,
        )


@extend_schema(tags=['Notifications'])
class UnreadCountView(APIView):
    """Return the count of unread notifications for the current user."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(
            user=request.user, is_read=False,
        ).count()
        return Response({'unread_count': count}, status=status.HTTP_200_OK)
