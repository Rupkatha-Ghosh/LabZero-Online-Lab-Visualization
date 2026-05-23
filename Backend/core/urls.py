from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/', include('lab_api.urls')),
    path('api/auth/', include('users.urls')),
    path('api/glossary/', include('glossary.urls')),
    path('api/classrooms/', include('classrooms.urls')),
]

if settings.DEBUG:
    urlpatterns.insert(0, path('admin/', admin.site.urls))
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)