from django.contrib import admin
from django.urls import reverse
from .models import Story, Chapter, Marker
from mapbox_location_field.admin import MapAdmin
from django_baker.admin import ExtendedModelAdminMixin
from .forms import MarkerAdminForm
from django.utils.html import escape, mark_safe
from nested_admin import NestedModelAdmin, NestedInlineModelAdminMixin, NestedInlineModelAdmin, NestedStackedInlineMixin

""" ### overwrite django-nested-admin nested.py ### """

class NestedStackedInline(NestedStackedInlineMixin, admin.options.InlineModelAdmin):
	show_change_link = True

""" ### ### """

class MarkerInline(NestedStackedInline):
	model = Marker
	extra = 0
	fields = ('location_name', 'location')
	classes = ('collapse',)
	readonly_fields = ('location', )


def media_preview(obj):
    if obj.pk:  # if object has already been saved and has a primary key, show picture preview
        return mark_safe("""<a href="{href}" target="_blank"><img src="{src}" alt="{title}" style="max-width: 200px; max-height: 200px;" /><br/><small>{title}</small></a>""".format(
            href=obj.media_credit_link,
			src=obj.media_link,
            title=obj.media_credit,
        ))
    return "(choose a picture and save and continue editing to see the preview)"
media_preview.short_description = "Media Preview"

def get_marker_story(marker):
	return marker.chapter.story

class ChapterInline(NestedStackedInline):
	model = Chapter
	classes = ('collapse',)
	show_change_link = False
	extra = 0
	readonly_fields = [media_preview]
	inlines = [
		MarkerInline
		]
	fieldsets = (
		(None, {
            'fields': ('title', 'description')
        }),
		('- Media', {
			'classes': ('collapse',),
			'fields': ('media_link', 'media_credit', 'media_credit_link', media_preview)
		}),
		('- Advanced', {
			'classes': ('collapse',),
			'fields': ('zoom', 'overlay', 'overlay_transparency', 'geojson_overlay', 'geojson_feature_properties')
		})
	)

class StoryAdmin(ExtendedModelAdminMixin, NestedModelAdmin):
	list_display = ['id', 'title', 'subtitle']
	list_display_links = ['id', 'title']
	extra_list_display = ['id']
	extra_list_filter = []
	extra_search_fields = ['id']
	list_editable = []
	raw_id_fields = []
	inlines = [
        ChapterInline,
    ]
	filter_vertical = []
	filter_horizontal = []
	radio_fields = {}
	prepopulated_fields = {}
	formfield_overrides = {}
	readonly_fields = ['id']
	fieldsets = (
		(None, {
            'fields': ('title', 'subtitle', 'basemap_tiles', )
		}),
		('Advanced', {
			'classes': ('collapse', ),
			'fields': (
				'author_name',
				'author_email_or_website',
				'narrative_background_color',
				'narrative_text_color',
				'narrative_link_color',
				'active_chapter_background_color',
				'media_container_height',
				'pixels_after_final_chapter',
			)
		})
	)

class ChapterAdmin(ExtendedModelAdminMixin, admin.ModelAdmin):
	list_display= ['id', 'title','story', 'description']
	extra_list_display = []
	extra_list_filter = []
	extra_search_fields = ['id']
	list_editable = []
	raw_id_fields = []
	inlines = [
        MarkerInline,
    ]
	filter_vertical = []
	filter_horizontal = []
	radio_fields = {}
	prepopulated_fields = {}
	formfield_overrides = {}
	readonly_fields = ['id']
	
	# https://github.com/krisfields/django-baker/issues/24
	def get_list_filter(self, request):
		return ()

class MarkerAdmin(MapAdmin):
	form = MarkerAdminForm
	list_display = "__all_fields__"
	list_display=('__str__', 'location', 'chapter', 'story', 'style', 'marker_color', )

admin.site.register(Story, StoryAdmin)
admin.site.register(Chapter, ChapterAdmin)
admin.site.register(Marker, MarkerAdmin)