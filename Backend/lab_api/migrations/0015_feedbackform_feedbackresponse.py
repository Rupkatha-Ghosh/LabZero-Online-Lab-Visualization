# Generated manually for LabZero feedback module sync.

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lab_api', '0014_feedback'),
    ]

    operations = [
        migrations.CreateModel(
            name='FeedbackForm',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('created_by', models.JSONField(blank=True, default=dict)),
                ('classroom_course_metadata', models.JSONField(blank=True, default=dict)),
                ('anonymous_allowed', models.BooleanField(default=True)),
                ('starts_at', models.DateTimeField(blank=True, null=True)),
                ('ends_at', models.DateTimeField(blank=True, null=True)),
                ('sections', models.JSONField(default=list)),
                ('status', models.CharField(choices=[('draft', 'Draft'), ('published', 'Published'), ('closed', 'Closed')], default='draft', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='FeedbackResponse',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_details', models.JSONField(blank=True, default=dict)),
                ('anonymous', models.BooleanField(default=False)),
                ('classroom_course_metadata', models.JSONField(blank=True, default=dict)),
                ('answers', models.JSONField(default=list)),
                ('submitted_at', models.DateTimeField(auto_now_add=True)),
                ('form', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='responses', to='lab_api.feedbackform')),
            ],
            options={
                'ordering': ['-submitted_at'],
            },
        ),
    ]
