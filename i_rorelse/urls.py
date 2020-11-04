from django.contrib import admin
from django.urls import include, path, re_path
from . import views
from .models import Story 
from rest_framework import routers, serializers, viewsets
# from .serializers import StorySerializer
from .views import StoryViewSet, ChapterViewSet, MarkerViewSet, GeoJsonOverlayViewSet

apiRouter = routers.DefaultRouter()
apiRouter.register(r'stories', StoryViewSet)
apiRouter.register(r'chapters', ChapterViewSet)
apiRouter.register(r'markers', MarkerViewSet)
apiRouter.register(r'geojson_overlays/(?P<input>.+)', GeoJsonOverlayViewSet, basename='geojson_overlays')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(apiRouter.urls)),
    re_path(r'^tinymce/', include('tinymce.urls')), # TODO: kanske inte behövs?
    path('', views.start, name='start'),
    path('<path>', views.start, name='start'),
]
