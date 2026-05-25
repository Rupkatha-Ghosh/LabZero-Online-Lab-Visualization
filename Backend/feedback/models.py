from django.db import models

class Feedback(models.Model):
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name='feedbacks')
    rating = models.IntegerField(default=5)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.rating} stars"


class FeedbackForm(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('closed', 'Closed'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.JSONField(default=dict, blank=True)
    classroom_course_metadata = models.JSONField(default=dict, blank=True)
    anonymous_allowed = models.BooleanField(default=True)
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)
    sections = models.JSONField(default=list)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class FeedbackResponse(models.Model):
    form = models.ForeignKey(FeedbackForm, related_name='responses', on_delete=models.CASCADE)
    user_details = models.JSONField(default=dict, blank=True)
    anonymous = models.BooleanField(default=False)
    classroom_course_metadata = models.JSONField(default=dict, blank=True)
    answers = models.JSONField(default=list)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.form.title} response #{self.id}"
