"""
URL configuration for simpliers_backend project.
"""

from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(request) -> JsonResponse:
    """
    Return basic service health and available endpoints for Render health checks.
    """
    return JsonResponse({
        'status': 'healthy',
        'service': 'simpliers-backend',
        'endpoints': {
            'giveaways': '/api/giveaways/',
            'admin': '/admin/',
        },
    })


urlpatterns = [
    path('', health_check, name='health-check'),
    path('healthz', health_check, name='healthz-check'),
    path('admin/', admin.site.urls),
    path('api/', include('giveaways.urls')),
]
