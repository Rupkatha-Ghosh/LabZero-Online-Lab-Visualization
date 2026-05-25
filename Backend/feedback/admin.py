from django.contrib import admin
from .models import Feedback, FeedbackForm, FeedbackResponse

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('user__username', 'user__email', 'comment')
    readonly_fields = ('created_at',)


@admin.register(FeedbackForm)
class FeedbackFormAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'anonymous_allowed', 'created_at', 'updated_at')
    list_filter = ('status', 'anonymous_allowed', 'created_at')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(FeedbackResponse)
class FeedbackResponseAdmin(admin.ModelAdmin):
    list_display = ('form', 'anonymous', 'submitted_at')
    list_filter = ('anonymous', 'submitted_at')
    search_fields = ('form__title',)
    readonly_fields = ('submitted_at',)
