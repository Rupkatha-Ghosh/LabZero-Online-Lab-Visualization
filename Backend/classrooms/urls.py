from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClassroomViewSet, AssignmentViewSet, JoinClassroomView, LiveKitTokenView

router = DefaultRouter()
router.register(r'classrooms', ClassroomViewSet, basename='classroom')
router.register(r'assignments', AssignmentViewSet, basename='assignment')

urlpatterns = [
    path('', include(router.urls)),
    path('join/', JoinClassroomView.as_view(), name='join-classroom'),
    path('livekit/token/', LiveKitTokenView.as_view(), name='livekit-token'),
]
