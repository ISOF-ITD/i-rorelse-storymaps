from django.db import models
from mapbox_location_field.models import LocationField
from tinymce.models import HTMLField
from django.db.models.signals import post_save, post_delete
from django.core.cache import cache

class Story(models.Model):
    title = models.CharField(blank=False, verbose_name="Title", max_length=255)
    subtitle = models.CharField(blank=True, verbose_name="Subtitle", max_length=255)
    basemap_tiles = models.CharField(blank=False, default="CartoDB.Positron", verbose_name="Basemap Tiles", max_length=255, help_text='<a href="https://leaflet-extras.github.io/leaflet-providers/preview/">https://leaflet-extras.github.io/leaflet-providers/preview/</a>')
    narrative_background_color = models.CharField(blank=True, verbose_name="Narrative Background Color", max_length=255)
    narrative_text_color = models.CharField(blank=True, verbose_name="Narrative Text Color", max_length=255)
    narrative_link_color = models.CharField(blank=True, verbose_name="Narrative Link Color", max_length=255)
    active_chapter_background_color = models.CharField(blank=True, verbose_name="Active Chapter Background Color", max_length=255)
    media_container_height = models.IntegerField(blank=False, default=300, verbose_name="Media Container Height", help_text="Maximum height of the image, in pixels. 200 is default. The image will be fit into the container with its proportions kept (it won't be skewed).")
    pixels_after_final_chapter = models.IntegerField(blank=False, default=600, verbose_name="Pixels after final chapter", help_text="At least 100")
    author_name = models.CharField(blank=True, verbose_name="Author Name", max_length=255, help_text="Appears in map credits as \"View data by...\" (or leave blank)")
    author_email_or_website = models.CharField(blank=True, verbose_name="Author Email or Website", max_length=255, help_text="Create link in Author Name by inserting your email or web address (or leave blank)")
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Story'
        verbose_name_plural = 'Stories'
    
    def __str__(self):
        return self.title

class Chapter(models.Model):
    story = models.ForeignKey(Story, on_delete=models.CASCADE)
    title = models.CharField(blank=False, verbose_name="Title", max_length=255)
    description = HTMLField(blank=True, verbose_name="Description")
    media_link = models.CharField(blank=True, verbose_name="Media Link", max_length=255)
    media_credit = models.CharField(blank=True, verbose_name="Media Credit", max_length=255)
    media_credit_link = models.CharField(blank=True, verbose_name="Media Credit Link", max_length=255)
    zoom = models.IntegerField(blank=True, null=True, verbose_name="Zoom", help_text="Only used in combination with a SINGLE marker, not with multiple markers or GEOJson-overlay.")
    overlay = models.CharField(blank=True, verbose_name="Overlay", max_length=255, help_text="e.g. historical map, from <a href='https://mapwarper.net' target=_blank>mapwarper.net</a>.")
    overlay_transparency = models.FloatField(blank=True, null=True, verbose_name="Overlay Transparency", help_text="Optional. Value between 0 and 1. E.g. <i>0.5</i>")
    geojson_overlay = models.CharField(blank=True, null=True, max_length=255, verbose_name = "GeoJSON Overlay", help_text="comma separated list of country names/codes and or US state names, e.g. <i>SE,United Kingdom,CAN,Maine,California</i>")
    geojson_feature_properties = models.CharField(blank=True, null=True, verbose_name = "GeoJSON Feature Properties", max_length=255, help_text="e.g. <i>weight:5; fillColor:orange</i>")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Chapter'
        verbose_name_plural = 'Chapters'

    def __str__(self):
        return self.title

class Marker(models.Model):
    chapter = models.ForeignKey(Chapter, null=False, blank=False, on_delete=models.CASCADE)
    location_name = models.CharField(blank=True, verbose_name="Location Name", max_length=255, help_text="e.g. <i>Göteborg, Aleppo, Farmors gård</i>")
    location = LocationField()
    style = models.CharField(blank=True, verbose_name="Style", max_length=255, help_text="possible values: <i>Location</i>, <i>Plain</i>, <i>Hidden</i>")
    marker_color =models.CharField(blank=True, verbose_name="Marker Color", max_length=255)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Marker'
        verbose_name_plural = 'Markers'

    def story(self):
        return self.chapter.story

    def __str__(self):
        return self.location_name

def model_post_change(sender, **kwargs):
    cache_key = 'StoryViewSet'
    cache.delete(cache_key)
    print(f"Deleted cache key {cache_key}.")

post_save.connect(model_post_change, sender=Story)
post_save.connect(model_post_change, sender=Chapter)
post_save.connect(model_post_change, sender=Marker)
post_delete.connect(model_post_change, sender=Story)
post_delete.connect(model_post_change, sender=Chapter)
post_delete.connect(model_post_change, sender=Marker)
