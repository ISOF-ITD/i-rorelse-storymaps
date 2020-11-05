"""
Django settings for i_rorelse project.

Generated by 'django-admin startproject' using Django 3.1.2.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.1/ref/settings/
"""

from pathlib import Path
import secrets

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '1(*&0_h_$tup_(4rj+q(+m-mwx=1%!&=@4&e$li8wrizc&)23o'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []

# Application definition

INSTALLED_APPS = [
    'i_rorelse.apps.IRorelse',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'mapbox_location_field',
    'rest_framework',
    'nested_admin',
    'tinymce',
]

MIDDLEWARE = [
    'django.middleware.cache.UpdateCacheMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.cache.FetchFromCacheMiddleware',
]

CACHE_MIDDLEWARE_KEY_PREFIX = ''

ROOT_URLCONF = 'i_rorelse.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]




# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': secrets.database,
        'USER': secrets.user,
        'PASSWORD': secrets.password,
        'HOST': secrets.host,
        'PORT': secrets.port,
        'OPTIONS': {'ssl': True},
    }
}

MAPBOX_KEY = secrets.MAPBOX_KEY

# Password validation
# https://docs.djangoproject.com/en/3.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.1/topics/i18n/

LANGUAGE_CODE = 'sv'

TIME_ZONE = 'Europe/Stockholm'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.1/howto/static-files/

STATIC_URL = '/static/'

# CORS_ORIGIN_ALLOW_ALL = True

# *** Settings for HTTPS ***

# Whether to use a secure cookie for the session cookie. Cookie is only sent under an HTTPS connection.
#SESSION_COOKIE_SECURE = True

# Whether to use a secure cookie for the CSRF cookie.
# - Browsers may ensure that the cookie is only sent with an HTTPS connection.
#CSRF_COOKIE_SECURE = True

# ** These settings have no effect if SecurityMiddleware is not enabled! **
# If True, the SecurityMiddleware redirects all non-HTTPS requests to HTTPS (except for those URLs matching
# a regular expression listed in SECURE_REDIRECT_EXEMPT).
# SECURE_SSL_REDIRECT = True

# If a URL path matches a regular expression in this list, the request will not be redirected to HTTPS.
# If SECURE_SSL_REDIRECT is False, this setting has no effect. (Requires SecurityMiddleware).
# - ELAN as of version 4.9.4 does not support HTTPS correctly,
# - therefore the externally controlled vocabulary needs to be served with HTTP.
#SECURE_REDIRECT_EXEMPT = [r'dictionary/ecv/']

# All SSL redirects will be directed to this host rather than the originally-requested host.
# - (Requires SecurityMiddleware  and SECURE_SSL_REDIRECT=True).
#SECURE_SSL_HOST = 'signbank.csc.fi'

# If True, the SecurityMiddleware sets the X-XSS-Protection: 1; mode=block header on all responses that
# do not already have it.
#SECURE_BROWSER_XSS_FILTER = True
