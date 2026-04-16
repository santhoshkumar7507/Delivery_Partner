from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Read-only serializer for notification objects."""

    class Meta:
        model = Notification
        fields = [
            'id',
            'user',
            'title',
            'message',
            'notification_type',
            'is_read',
            'created_at',
            'related_order_id',
        ]
        read_only_fields = fields


class MarkReadSerializer(serializers.ModelSerializer):
    """Serializer for marking a notification as read."""

    class Meta:
        model = Notification
        fields = ['is_read']
