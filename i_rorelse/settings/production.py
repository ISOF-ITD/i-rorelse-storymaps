from .base import *
import secrets

# TODO: Production Cache einrichten, kanske helst memory based
# CACHES = {
#     'default': {
#         'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
#         'LOCATION': '/var/tmp/django_cache',
#     }
# }

WSGI_APPLICATION = 'i_rorelse.wsgi.application'

#PROJECT_NAME = '/i-rorelse'

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = secrets.SECRET_KEY

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        # 'rest_framework.renderers.BrowsableAPIRenderer',
    ]
}

ALLOWED_HOSTS = ['frigg-test.isof.se' ]

STATIC_URL = '/static/i-rorelse/'

STATIC_ROOT = '/var/www/django/static/i-rorelse'

