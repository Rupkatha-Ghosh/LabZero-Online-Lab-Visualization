from django.urls import path
from .views import (
    ElementList, ElementDetail, APIStatus, 
    MoleculeList, MoleculeDetail,
    SubjectList, SubjectDetail,
    TopicList, TopicDetail,
    GlobalSettingsView,
    PublicStatsView,
    FeedbackList
)

urlpatterns = [
    path('status/', APIStatus.as_view(), name='api-status'),
    path('public-stats/', PublicStatsView.as_view(), name='public-stats'),
    path('settings/', GlobalSettingsView.as_view(), name='global-settings'),
    path('elements/', ElementList.as_view(), name='element-list'),
    path('elements/<int:number>/', ElementDetail.as_view(), name='element-detail'),
    path('molecules/', MoleculeList.as_view(), name='molecule-list'),
    path('molecules/<str:formula>/', MoleculeDetail.as_view(), name='molecule-detail'),
    path('subjects/', SubjectList.as_view(), name='subject-list'),
    path('subjects/<int:pk>/', SubjectDetail.as_view(), name='subject-detail'),
    path('topics/', TopicList.as_view(), name='topic-list'),
    path('topics/<int:pk>/', TopicDetail.as_view(), name='topic-detail'),
    path('feedback/', FeedbackList.as_view(), name='feedback-list'),
]