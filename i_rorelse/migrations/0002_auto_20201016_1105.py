# Generated by Django 2.2.10 on 2020-10-16 09:05

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('i_rorelse', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='storymapschapter',
            options={'verbose_name': 'Chapter', 'verbose_name_plural': 'Chapters'},
        ),
        migrations.AlterModelOptions(
            name='storymapsgeojsonoverlay',
            options={'verbose_name': 'GeoJSON Overlay', 'verbose_name_plural': 'GeoJSON Overlays'},
        ),
        migrations.AlterModelOptions(
            name='storymapsmarker',
            options={'verbose_name': 'Marker', 'verbose_name_plural': 'Markers'},
        ),
        migrations.AlterModelOptions(
            name='storymapsstory',
            options={'verbose_name': 'Story', 'verbose_name_plural': 'Stories'},
        ),
    ]
