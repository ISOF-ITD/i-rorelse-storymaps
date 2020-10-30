#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    # Set up different setting modules for different environments 
    # os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'i_rorelse.settings')
    # https://awefsome.blogspot.com/2018/12/django-different-setting-modules-for.html
    # However, maybe this could be a better way: https://stackoverflow.com/a/33291976
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'i_rorelse.settings.development')

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
