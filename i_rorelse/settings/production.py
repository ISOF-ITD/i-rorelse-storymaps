from .base import *
import secrets

# TODO: Production Cache einrichten, kanske bäst memory based
# CACHES = {
#     'default': {
#         'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
#         'LOCATION': '/var/tmp/django_cache',
#     }
# }

PROJECT_NAME = '/i-rorelse'

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = secrets.secret_key

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        # 'rest_framework.renderers.BrowsableAPIRenderer',
    ]
}

ALLOWED_HOSTS = ['frigg-test.isof.se' ]