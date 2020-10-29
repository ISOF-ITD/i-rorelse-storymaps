from mapbox_location_field.forms import LocationField
from django import forms
from .models import Story, Chapter, Marker
import random

class MarkerAdminForm(forms.ModelForm):
    map_attrs = {
        "style": "mapbox://styles/mapbox/outdoors-v11",
        "zoom": 3,
        "center": [16.240,62.418],
        "cursor_style": 'pointer',
        "marker_color": "red",
        "rotate": True,
        "geocoder": True,
        "fullscreen_button": False,
        "navigation_buttons": True,
        "track_location_button": False,
        "readonly": False,
        "placeholder": "Pick a location on map below",
        }

    class Meta:
        model = Marker
        fields = "__all__"

    location = LocationField(map_attrs=map_attrs)
