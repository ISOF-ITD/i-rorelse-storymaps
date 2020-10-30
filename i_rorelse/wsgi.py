"""
WSGI config for i_rorelse project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

# Set up different setting modules for different environments 
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'i_rorelse.settings')
# https://awefsome.blogspot.com/2018/12/django-different-setting-modules-for.html
# However, maybe this could be a better way: https://stackoverflow.com/a/33291976
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'i_rorelse.settings.production')

application = get_wsgi_application()
