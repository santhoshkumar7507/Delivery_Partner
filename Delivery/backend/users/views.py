from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import (
    CustomerProfile,
    DeliveryPartnerProfile,
    User,
    VendorProfile,
)
from .permissions import IsAdmin
from .serializers import (
    CustomerProfileSerializer,
    DeliveryPartnerProfileSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserProfileUpdateSerializer,
    UserSerializer,
    VendorProfileSerializer,
)


def _get_tokens_for_user(user):
    """Generate JWT token pair for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# ---------------------------------------------------------------------------
# Auth views
# ---------------------------------------------------------------------------

class RegisterView(generics.CreateAPIView):
    """Register a new user with a role-specific profile."""

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Auth'],
        summary='Register a new user',
        description=(
            'Creates a new user account. The `role` field determines which '
            'profile is created (customer, vendor, or delivery_partner). '
            'Pass optional nested profile data matching the chosen role.'
        ),
        responses={201: UserSerializer},
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = _get_tokens_for_user(user)
        return Response(
            {
                'user': UserSerializer(user).data,
                'tokens': tokens,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """Authenticate and return JWT tokens + user data."""

    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Auth'],
        summary='Login',
        description='Authenticate with username and password. Returns JWT tokens and user data.',
        request=LoginSerializer,
        responses={200: UserSerializer},
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        tokens = _get_tokens_for_user(user)
        return Response(
            {
                'user': UserSerializer(user).data,
                'tokens': tokens,
            },
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# Profile views
# ---------------------------------------------------------------------------

class ProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve or update the current authenticated user's profile."""

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return UserProfileUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user

    @extend_schema(
        tags=['Users'],
        summary='Get current user profile',
        description='Returns the profile of the currently authenticated user.',
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        tags=['Users'],
        summary='Update current user profile',
        description='Update basic profile fields and nested role-specific profile.',
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @extend_schema(
        tags=['Users'],
        summary='Partially update current user profile',
        description='Partially update profile fields.',
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


# ---------------------------------------------------------------------------
# Admin views
# ---------------------------------------------------------------------------

class VendorListView(generics.ListAPIView):
    """List all vendor profiles (admin only)."""

    serializer_class = VendorProfileSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = VendorProfile.objects.select_related('user').all()

    @extend_schema(
        tags=['Users'],
        summary='List all vendors',
        description='Admin-only endpoint to list all vendor profiles.',
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class DeliveryPartnerListView(generics.ListAPIView):
    """List all delivery partner profiles (admin only)."""

    serializer_class = DeliveryPartnerProfileSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = DeliveryPartnerProfile.objects.select_related('user').all()

    @extend_schema(
        tags=['Users'],
        summary='List all delivery partners',
        description='Admin-only endpoint to list all delivery partner profiles.',
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class ApproveVendorView(APIView):
    """Approve a vendor profile (admin only)."""

    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(
        tags=['Users'],
        summary='Approve a vendor',
        description='Admin-only. Sets is_approved=True on the vendor profile.',
        responses={200: VendorProfileSerializer},
    )
    def post(self, request, pk):
        profile = get_object_or_404(VendorProfile, pk=pk)
        profile.is_approved = True
        profile.save(update_fields=['is_approved'])
        return Response(
            {
                'message': 'Vendor approved successfully.',
                'vendor': VendorProfileSerializer(profile).data,
            },
            status=status.HTTP_200_OK,
        )


class ApproveDeliveryPartnerView(APIView):
    """Approve a delivery partner profile (admin only)."""

    permission_classes = [IsAuthenticated, IsAdmin]

    @extend_schema(
        tags=['Users'],
        summary='Approve a delivery partner',
        description='Admin-only. Sets is_approved=True on the delivery partner profile.',
        responses={200: DeliveryPartnerProfileSerializer},
    )
    def post(self, request, pk):
        profile = get_object_or_404(DeliveryPartnerProfile, pk=pk)
        profile.is_approved = True
        profile.save(update_fields=['is_approved'])
        return Response(
            {
                'message': 'Delivery partner approved successfully.',
                'delivery_partner': DeliveryPartnerProfileSerializer(profile).data,
            },
            status=status.HTTP_200_OK,
        )


class AllUsersView(generics.ListAPIView):
    """List all users with optional filtering (admin only)."""

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = User.objects.all()
    filterset_fields = ['role', 'is_verified', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    ordering_fields = ['date_joined', 'username', 'email']

    @extend_schema(
        tags=['Users'],
        summary='List all users',
        description=(
            'Admin-only endpoint to list all users. Supports filtering by '
            'role, is_verified, is_active and searching by username, email, '
            'first_name, last_name, phone.'
        ),
        parameters=[
            OpenApiParameter(name='role', description='Filter by role', type=str),
            OpenApiParameter(name='is_verified', description='Filter by verification status', type=bool),
            OpenApiParameter(name='is_active', description='Filter by active status', type=bool),
            OpenApiParameter(name='search', description='Search users', type=str),
        ],
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
