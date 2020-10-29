from rest_framework import serializers
from .models import Story, Chapter, Marker

class MarkerSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Marker
        fields = "__all__"

# class GeoJsonOverlaySerializer(serializers.HyperlinkedModelSerializer):
#     class Meta:
#         model = GeoJsonOverlay
#         fields = "__all__"

class ChapterSerializer(serializers.HyperlinkedModelSerializer):
    markers = MarkerSerializer(source='marker_set', many=True)
    # geojson_overlay = GeoJsonOverlaySerializer(source='geojson_overlay_set', many=True)
    class Meta:
        model = Chapter
        fields = "__all__"

class StorySerializer(serializers.HyperlinkedModelSerializer):
    id = serializers.ReadOnlyField()
    chapters = ChapterSerializer(source='chapter_set', many=True)

    class Meta:
        model = Story
        fields = "__all__"
