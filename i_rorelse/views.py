import json
from django.http import JsonResponse
from django.shortcuts import render 
from rest_framework import viewsets, mixins
from .models import Story, Chapter, Marker
from .serializers import StorySerializer, ChapterSerializer, MarkerSerializer
from django.core.cache import cache
import os, i_rorelse

path = os.path.dirname(i_rorelse.__file__)

def start(request, path=''):
    return render(request, "index.html")

class ModelViewSet(mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    pass

class StoryViewSet(ModelViewSet):

    def get_queryset(self):
        title= self.request.query_params.get('title')
        if title is not None:
            queryset = Story.objects.filter(title=title).order_by('title')
        else:
            queryset = Story.objects.all().order_by('title')

        return queryset

    queryset = Story.objects.all().order_by('title')
    serializer_class = StorySerializer

class ChapterViewSet(ModelViewSet):
    queryset = Chapter.objects.all().order_by('title')
    serializer_class = ChapterSerializer

class MarkerViewSet(ModelViewSet):
    queryset = Marker.objects.all().order_by('id')
    serializer_class = MarkerSerializer

def get_geojson_overlay(input_string):
    input_list = [i.strip() for i in input_string.split(',')]


    f = open(path + '/geojson/countries.geojson')
    json_string_countries = f.read()
    f.close()

    geo_json_countries = json.loads(json_string_countries) 
    country_features = list(
        filter(
            lambda feature: any(item in map(str.lower, feature['properties'].values()) for item in map(str.lower, input_list)),
            geo_json_countries['features']
            )
        )
    
    f = open(path + '/geojson/us_states.geojson')
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
        cache_key = 'get_geojson_overlay-' + '_'.join(
            [i.strip() for i in input.split(',')]
            ).replace(" ", "")

        response = cache.get(cache_key)
        if  response is None:
            response = get_geojson_overlay(input)
            cache.set(
                cache_key,
                response
            )

        return response
