import os
from django.core.asgi import get_asgi_application
from mangum import Mangum

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

django_application = get_asgi_application()

handler = Mangum(django_application, lifespan="off")