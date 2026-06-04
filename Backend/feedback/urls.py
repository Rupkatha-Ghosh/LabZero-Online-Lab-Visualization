from django.urls import path
from .views import (
    FeedbackList,
    FeedbackFormDetailView,
    FeedbackResponseCreateView,
    FeedbackAnalyticsView,
    FeedbackTextAnalysisView,
    FeedbackAdminOverviewView,
    FeedbackAdminFormsView,
    FeedbackAdminFormDetailView,
    FeedbackAdminStatusView,
)

urlpatterns = [
    path('', FeedbackList.as_view(), name='feedback-list'),
    path('forms/site-feedback/', FeedbackFormDetailView.as_view(), name='feedback-site-form-detail'),
    path('forms/<int:form_id>/', FeedbackFormDetailView.as_view(), name='feedback-form-detail'),
    path('responses/', FeedbackResponseCreateView.as_view(), name='feedback-response-create'),
    path('forms/site-feedback/analytics/', FeedbackAnalyticsView.as_view(), name='feedback-site-analytics'),
    path('forms/<int:form_id>/analytics/', FeedbackAnalyticsView.as_view(), name='feedback-analytics'),
    path('forms/site-feedback/text-analysis/', FeedbackTextAnalysisView.as_view(), name='feedback-site-text-analysis'),
    path('forms/<int:form_id>/text-analysis/', FeedbackTextAnalysisView.as_view(), name='feedback-text-analysis'),
    path('admin/overview/', FeedbackAdminOverviewView.as_view(), name='feedback-admin-overview'),
    path('admin/forms/', FeedbackAdminFormsView.as_view(), name='feedback-admin-forms'),
    path('admin/forms/<int:form_id>/', FeedbackAdminFormDetailView.as_view(), name='feedback-admin-form-detail'),
    path('admin/forms/<int:form_id>/status/', FeedbackAdminStatusView.as_view(), name='feedback-admin-form-status'),
]
