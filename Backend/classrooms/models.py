from django.db import models
from django.conf import settings
import random
import string

def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class Classroom(models.Model):
    name = models.CharField(max_length=200)
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='managed_classrooms'
    )
    invite_code = models.CharField(max_length=10, unique=True, default=generate_invite_code)
    students = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='enrolled_classrooms',
        blank=True
    )
    is_live = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.teacher.username})"

class Assignment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('live', 'Live'),
        ('assigned', 'Assigned'),
        ('completed', 'Completed'),
    ]

    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file_url = models.URLField(max_length=1000, null=True, blank=True)
    topic = models.ForeignKey('lab_api.Topic', on_delete=models.SET_NULL, null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    points = models.IntegerField(default=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='assigned')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
