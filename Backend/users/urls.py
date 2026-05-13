from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserDetailView, CustomTokenObtainPairView
from .google_auth import GoogleLoginView, GoogleCallbackView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('google/login/', GoogleLoginView.as_view(), name='google-login'),
    path('google/callback/', GoogleCallbackView.as_view(), name='google-callback'),
]
