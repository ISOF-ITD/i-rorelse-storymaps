import json
from django.http import JsonResponse
from django.shortcuts import render 
from rest_framework import viewsets
from .models import Story, Chapter, Marker
from .serializers import StorySerializer, ChapterSerializer, MarkerSerializer
from django.core.cache import cache

def start(request, path=''):
     return render(request, "index.html")

class StoryViewSet(viewsets.ModelViewSet):
    queryset = Story.objects.all().order_by('title')
    serializer_class = StorySerializer

class ChapterViewSet(viewsets.ModelViewSet):
    queryset = Chapter.objects.all().order_by('title')
    serializer_class = ChapterSerializer

class MarkerViewSet(viewsets.ModelViewSet):
    queryset = Marker.objects.all().order_by('id')
    serializer_class = MarkerSerializer

def get_geojson_overlay(input):
    input_list = [i.strip() for i in input.split(',')]

    f = open('i_rorelse/geojson/countries.geojson')
    json_string_countries = f.read()
    f.close()

    geo_json_countries = json.loads(json_string_countries) 
    country_features = list(
        filter(
            lambda feature: any(item in map(str.lower, feature['properties'].values()) for item in map(str.lower, input_list)),
            geo_json_countries['features']
            )
        )
    
    f = open('i_rorelse/geojson/us_states.geojson')
    json_string_states = f.read()
    f.close()

    geo_json_states = json.loads(json_string_states) 
    states_features = list(
        filter(
            lambda feature: any(item in map(lambda x:str.lower(str(x)), feature['properties'].values()) for item in map(str.lower, input_list)),
            geo_json_states['features']
            )
        )
    new_dict = {
        'type': 'FeatureCollection',
        'features': country_features + states_features,
        'input': input_list,
        'found': list(map(lambda x:x['properties']['ADMIN'],country_features)) + list(map(lambda x:x['properties']['NAME'],states_features)),
    }
    return JsonResponse(new_dict)

class GeoJsonOverlayViewSet(viewsets.ViewSet):
    def list(self, request, input):
        cache_key = 'get_geojson_overlay-' + '_'.join([i.strip() for i in input.split(',')]).replace(" ", "")
        return cache.get_or_set(cache_key, get_geojson_overlay(input), None)