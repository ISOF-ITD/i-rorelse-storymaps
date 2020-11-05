# Accessibility

[Accessibility](Accessibility.md)

# Prerequisites

* Python 3.6
* Node.js, npm

# Getting started

Register for a [Mapbox](https://www.mapbox.com/)-key and put the key along with the database configuration in a file named **secrets.py**:

```python
MAPBOX_KEY = "pk.JlIhNNkPfDyvcFjKOugfFvNkOiYcXwDqFghofXjmOyFvNkvFgjKGFGGGJNf"

# database
host='127.0.0.1'
database='i_rorelse'
user='root'
password=''
port='3306'
```

Install node modules:

```bash
cd i_rorelse
npm install
cd ..
```

Start the Django Server

```bash
python3.6 manage.py runserver 5000
```

Compile with gulp for development, watch for changes: 

```bash
sed -i 's/production = true/production = false/' i_rorelse/gulpfile.js && gulp --cwd i_rorelse
```

Optionally, you can install honcho (`pip3.6 install honcho`) to run Django server and gulp with a single command:

```bash
# runs the Procfile
honcho start
```

Look at your app here:
* User interface: [localhost:5000](localhost:5000)
* Admin/editorial interface: [localhost:5000/admin/i_rorelse](localhost:5000/admin/i_rorelse)
* REST-API: [localhost:5000/api/](localhost:5000/api/)

# Every day tasks

Compile the code with gulp for release: 

```bash
sed -i 's/production = false/production = true/' i_rorelse/gulpfile.js && gulp --cwd i_rorelse build && git add i_rorelse/static && git commit -m 'fresh compile'
```

Push the *master* branch:

```bash
git push origin master
git push gogs master
```

# Deployment

First install, see **deploy.txt**

Daily deployment, on server:

```bash
cd /var/www/django/i-rorelse/i-rorelse-storymaps
./gitupdate.sh
source ../venv/bin/activate
python3.6 /var/www/django/i-rorelse/i-rorelse-storymaps/manage.py collectstatic
sudo systemctl restart httpd # look in slack channel #apacherestart first!
```


---

# Leaflet Storymaps with Google Sheets
Customize your Leaflet story map with linked Google Sheets template and scrolling narrative.
Supports images, audio and video embeddings, and Leaflet TileLayer/geojson overlays.

<p align="center">
  <img src="./leaflet-storymaps-demo.gif" title="Storymaps demo" />
</p>

## [Live Demo](https://handsondataviz.github.io/leaflet-storymaps-with-google-sheets/)
- The map is hosted by GitHub and can be found at https://handsondataviz.github.io/leaflet-storymaps-with-google-sheets/
- Google Sheets template https://docs.google.com/spreadsheets/d/1AO6XHL_0JafWZF4KEejkdDNqfuZWUk3SlNlQ6MjlRFM/

## Create Your Own
- See step-by-step tutorial in *Hands-On Data Visualization* https://HandsOnDataViz.org/leaflet-storymaps-with-google-sheets.html

## Credits
Developed by [Ilya Ilyankou](https://github.com/ilyankou) and [Jack Dougherty](https://github.com/jackdougherty) with support from Trinity College, CT.

Inspired by Code for Atlanta mapsfor.us (2016) https://github.com/codeforatlanta/mapsforus (BSD-3-Clause). Adapted from MUX Lab, Map Effects 100: https://github.com/muxlab/map-effects-100, see http://muxlab.github.io/map-effects-100/Leaflet/11_scroll-driven-map-navigation.html. Uses a [Google Sheets](https://www.google.com/sheets/about/) template.

## Built Using These Libraries

| Library | Version | License | Notes |
|---       |---       |---       |---
| [Leaflet](https://leafletjs.com)| 1.4.0 | BSD-2-Clause | https://leafletjs.com
| [jQuery](https://code.jquery.com) | 3.3.1| MIT | https://code.jquery.com
| [leaflet-providers](https://github.com/leaflet-extras/leaflet-providers) | 1.1.15 | BSD-2-Clause | Manually updated for Carto https https://github.com/leaflet-extras/leaflet-providers |
| [Leaflet.awesome-markers](https://github.com/sigma-geosistemas/Leaflet.awesome-markers) | 2.0.4 | MIT | https://github.com/sigma-geosistemas/Leaflet.awesome-markers |
| [Single Element CSS Spinner](https://github.com/lukehaas/css-loaders) | May 31, 2016| MIT| https://github.com/lukehaas/css-loaders|
| [Tabletop](https://github.com/jsoma/tabletop) | 1.5.1 | MIT | Fetches data from Google Sheet template. https://github.com/jsoma/tabletop
| [Google Sheets Geocoder](https://github.com/jackdougherty/google-sheets-geocoder) | 1.0 | No License | By Ilya Ilyankou and Jack Dougherty https://github.com/jackdougherty/google-sheets-geocoder
| [jQuery-CSV](https://github.com/evanplaice/jquery-csv) | 0.71 | MIT | https://github.com/evanplaice/jquery-csv
| [Leaflet.ExtraMarkers](https://github.com/coryasilva/Leaflet.ExtraMarkers) | ? | MIT | https://github.com/coryasilva/Leaflet.ExtraMarkers
| [FontAwesome](https://fontawesome.com) | 5.8.1 | Font Awesome Free License | https://fontawesome.com |

## License
MIT