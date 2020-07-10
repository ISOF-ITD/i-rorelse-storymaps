import L from 'leaflet';
import Proj from 'proj4leaflet';
import $ from 'jquery';
import { constants } from './constants';
import './leaflet-providers';
import './tabletop';
import 'leaflet-extra-markers';

// Create the Leaflet map with a generic start point
const map = L.map('map', {
  center: [0, 0],
  zoom: 1,
  scrollWheelZoom: false,
  zoomControl: false
});

$(window).on('load', function() {
  var documentSettings = {};

  // Some constants, such as default settings
  const CHAPTER_ZOOM = 15;

  // This watches for the scrollable container
  var scrollPosition = 0;
  $('div#contents').scroll(function() {
    scrollPosition = $(this).scrollTop();
  });
  
  $.get(`data/Stories.json`, function(stories) {
    let url = new URL(window.location.href);
    let story = url.searchParams.get("story");

    if (story == null) {
        initStoryList(
          stories
        )
      }
    else {
      $.get(`data/${story}/Options.json`, function(options) {
        $.get(`data/${story}/Chapters.json`, function(chapters) {
          initMap(
            options,
            chapters
          )
        }).fail(function(e) { alert(`Could not read data/${story}/Chapters.json`) });
      }).fail(function(e) { alert(`Could not read data/${story}/Options.json`) })
    }
  });

  /**
  * Reformulates documentSettings as a dictionary, e.g.
  * {"webpageTitle": "Leaflet Boilerplate", "infoPopupText": "Stuff"}
  */
  function createDocumentSettings(settings) {
    for (var i in settings) {
      var setting = settings[i];
      documentSettings[setting.Setting] = setting.Customize;
    }
  }

  /**
   * Returns the value of a setting s
   * getSetting(s) is equivalent to documentSettings[constants.s]
   */
  function getSetting(s) {
    return documentSettings[constants[s]];
  }

  /**
   * Returns the value of setting named s from constants.js
   * or def if setting is either not set or does not exist
   * Both arguments are strings
   * e.g. trySetting('_authorName', 'No Author')
   */
  function trySetting(s, def) {
    s = getSetting(s);
    if (!s || s.trim() === '') { return def; }
    return s;
  }

  /**
   * Loads the basemap and adds it to the map
   */
  function addBaseMap() {
    var basemap = trySetting('_tileProvider', 'Stamen.TonerLite');
    L.tileLayer.provider(basemap, {
      maxZoom: 18
    }).addTo(map);
  }

  function initStoryList(stories) {
    $('<div/>', {id: 'title', style: 'visibility: visible; position: relative;'}).append(
      $('<div/>', {id: 'header'}).append(
        $('<h1/>', {text: 'I rörelse'}),
        $('<h2/>', {text: 'Berättelser'})
      )
    ).appendTo($('body'));

    $('<div/>', {id: 'story-list'}).appendTo($('body'))
    let $ul = $('<ul>', {class: 'stories'}).append(
      stories.map(story => 
        $('<li/>').append($('<a/>', 
          {
            href: `?story=${story['Name']}`
          })
          .text(story['Name']))
      )
    );
    $('#story-list').append($ul)
    $('div.loader').css('visibility', 'hidden');
  }

  function initMap(options, chapters) {

    // build DOM elements
    $('<div/>', {id: 'title'}).append(
      $('<div/>', {id: 'logo'}),
      $('<div/>', {id: 'header'}).append(
        $('<a/>', {href: '?stories', id: 'back', text: '< tillbaka'})
      ),
    ).appendTo($('body'))

    $('<div/>', {id: 'narration'}).append(
      $('<div/>', {id: 'contents'}).append(
        $('<div/>', {id: 'top'})
      )
    ).appendTo($('body'))

    createDocumentSettings(options);

    var chapterContainerMargin = 70;

    document.title = getSetting('_mapTitle');
    $('#header').append('<h1>' + getSetting('_mapTitle') + '</h1>');
    $('#header').append('<h2>' + getSetting('_mapSubtitle') + '</h2>');

    // Add logo
    if (getSetting('_mapLogo')) {
      $('#logo').append('<img src="' + getSetting('_mapLogo') + '" />');
      $('#top').css('height', '60px');
    } else {
      $('#logo').css('display', 'none');
      $('#header').css('padding-top', '25px');
    }

    // Load tiles
    addBaseMap();

    // Add zoom controls if needed
    if (getSetting('_zoomControls') !== 'off') {
      L.control.zoom({
        position: getSetting('_zoomControls')
      }).addTo(map);
    }

    var markers = [];

    var markActiveColor = function(k) {
      /* Removes marker-active class from all markers */
      for (var i = 0; i < markers.length; i++) {
        if (markers[i] && markers[i]._icon) {
          markers[i]._icon.className = markers[i]._icon.className.replace(' marker-active', '');

          if (i == k) {
            /* Adds marker-active class, which is orange, to marker k */
            markers[k]._icon.className += ' marker-active';
          }
        }
      }
    }

    let changeProjection = function(map, c) {
      let url = c['Overlay']
      if(url.split('/').indexOf('lm_proxy') > -1 && (!(map.options.hasOwnProperty('crs')) || map.options.crs == 'EPSG:3857')){
        let crs = new L.Proj.CRS(
          'EPSG:3006',
          '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
          {
            resolutions: [
              4096, 2048, 1024, 512, 256, 128,64, 32, 16, 8, 4, 2, 1, 0.5
            ],
            origin: [-1200000.000000, 8500000.000000 ],
            bounds:  L.bounds( [-1200000.000000, 8500000.000000], [4305696.000000, 2994304.000000])
          }
        )
        map.options.crs = crs;
        map.fitBounds(chapterBounds)
      }
      // delete projection property for every map that is not lantmateriet
      else if (map.options.hasOwnProperty('crs') && url.split('/').indexOf('lm_proxy') == -1){
        delete map.options.crs;
      }
    }

    var pixelsAbove = [];
    var chapterCount = 0;

    var currentlyInFocus; // integer to specify each chapter is currently in focus
    var overlay;  // URL of the overlay for in-focus chapter
    var geoJsonOverlay;

    for (const i in chapters) {
      const c = chapters[i];

      if(c['Markers']){
        for (const marker of c['Markers']) {

          if ( !isNaN(parseFloat(marker['Latitude'])) && !isNaN(parseFloat(marker['Longitude']))) {
            const lat = parseFloat(marker['Latitude']);
            const lon = parseFloat(marker['Longitude']);

            chapterCount += 1;

            markers.push(
              L.marker([lat, lon], {
                chapter: i,
                icon: L.ExtraMarkers.icon({
                  icon: 'fa-number',
                  number: marker['Style'] === 'Plain' ? '' : marker['Location'],
                  markerColor: marker['Marker Color'] || 'blue'
                }),
                opacity: marker['Style'] === 'Hidden' ? 0 : 0.9,
                interactive: marker['Style'] === 'Hidden' ? false : true,
              }
            ));
          }
        }
      }

      // Add chapter container
      var container = $('<div></div>', {
        id: 'container' + i,
        class: 'chapter-container'
      });


      // Add media and credits: YouTube, audio, or image
      var media = null;
      var mediaContainer = null;

      // Add media source
      var source = '';
      if (c['Media Credit Link']) {
        source = $('<a>', {
          text: c['Media Credit'],
          href: c['Media Credit Link'],
          target: "_blank",
          class: 'source'
        });
      } else {
        source = $('<span>', {
          text: c['Media Credit'],
          class: 'source'
        });
      }

      // YouTube
      if (c['Media Link'] && c['Media Link'].indexOf('youtube.com/') > -1) {
        media = $('<iframe></iframe>', {
          src: c['Media Link'],
          width: '100%',
          height: '100%',
          frameborder: '0',
          allow: 'autoplay; encrypted-media',
          allowfullscreen: 'allowfullscreen',
        });

        mediaContainer = $('<div></div', {
          class: 'img-container'
        }).append(media).after(source);
      }

      // If not YouTube: either audio or image
      var mediaTypes = {
        'jpg': 'img',
        'jpeg': 'img',
        'png': 'img',
        'mp3': 'audio',
        'ogg': 'audio',
        'wav': 'audio',
      }

      var mediaExt = c['Media Link'].split('.').pop().toLowerCase();
      var mediaType = mediaTypes[mediaExt];

      if (mediaType) {
        media = $('<' + mediaType + '>', {
          src: c['Media Link'],
          controls: mediaType == 'audio' ? 'controls' : '',
        });

        mediaContainer = $('<div></div', {
          class: mediaType + '-container'
        }).append(media).after(source);
      }

      container
        .append('<p class="chapter-header">' + c['Chapter'] + '</p>')
        .append(media ? mediaContainer : '')
        .append(media ? source : '')
        .append('<div class="description">' + c['Description'] + '</div>');

      $('#contents').append(container);

    }

    changeAttribution();

    /* Change image container heights */
    let imgContainerHeight = parseInt(getSetting('_imgContainerHeight'));
    if (imgContainerHeight > 0) {
      $('.img-container').css({
        'height': imgContainerHeight + 'px',
        'max-height': imgContainerHeight + 'px',
      });
    }

    // For each block (chapter), calculate how many pixels above it
    pixelsAbove[0] = -100;
    for (let i = 1; i < chapters.length; i++) {
      pixelsAbove[i] = pixelsAbove[i-1] + $('div#container' + (i-1)).height() + chapterContainerMargin;
    }
    pixelsAbove.push(Number.MAX_VALUE);

    $('div#contents').scroll(function() {
      var currentPosition = $(this).scrollTop();

      // Make title disappear on scroll
      if (currentPosition < 200) {
        $('#title').css('opacity', 1 - Math.min(1, currentPosition / 100));
      }

      for (var i = 0; i < pixelsAbove.length - 1; i++) {
        
        if ( currentPosition >= pixelsAbove[i]
          && currentPosition < (pixelsAbove[i+1] - 2 * chapterContainerMargin)
          && currentlyInFocus != i
        ) {
          // Remove styling for the old in-focus chapter and
          // add it to the new active chapter
          $('.chapter-container').removeClass("in-focus").addClass("out-focus");
          $('div#container' + i).addClass("in-focus").removeClass("out-focus");

          currentlyInFocus = i;
          markActiveColor(currentlyInFocus);

          // Remove overlay tile layer if needed
          if (map.hasLayer(overlay)) {
            map.removeLayer(overlay);
          }

          // Remove GeoJson Overlay tile layer if needed
          if (map.hasLayer(geoJsonOverlay)) {
            map.removeLayer(geoJsonOverlay);
          }

          var c = chapters[i];

          // Add chapter's overlay tiles if specified in options
          if (c['Overlay']) {
            var opacity = (c['Overlay Transparency'] !== '') ? parseFloat(c['Overlay Transparency']) : 1;
            var url = c['Overlay'];

            if (url.split('.').pop() == 'geojson') {
              $.getJSON(url, function(geojson) {
                overlay = L.geoJson(geojson, {
                  style: function(feature) {
                    return {
                      fillColor: feature.properties.COLOR,
                      weight: 1,
                      opacity: 0.5,
                      color: feature.properties.COLOR,
                      fillOpacity: 0.5,
                    }
                  }
                }).addTo(map);
              });
            } else {
              overlay = L.tileLayer(c['Overlay'], {opacity: opacity}).addTo(map);
            }

          } else {
            delete map.options.crs;
          }

          let flyToBounds = false;

          if (c['GeoJSON Overlay']) {
            $.getJSON(c['GeoJSON Overlay'], function(geojson) {
              flyToBounds = true;
              // todo: make this 
              const geoJsonBounds = L.geoJson(geojson).getBounds()
              const markerBounds = c['Markers'].map( marker => [marker['Latitude'], marker['Longitude']])

              map.flyToBounds(
                [geoJsonBounds, markerBounds]
              ).on('moveend', function () {
                changeProjection(map, c)
              });

              // Parse properties string into a JS object
              var props = {};

              if (c['GeoJSON Feature Properties']) {
                var propsArray = c['GeoJSON Feature Properties'].split(';');
                var props = {};
                for (var p in propsArray) {
                  if (propsArray[p].split(':').length === 2) {
                    props[ propsArray[p].split(':')[0].trim() ] = propsArray[p].split(':')[1].trim();
                  }
                }
              }

              geoJsonOverlay = L.geoJson(geojson, {
                style: function(feature) {
                  return {
                    fillColor: feature.properties.COLOR || props.fillColor || 'white',
                    weight: props.weight || 1,
                    opacity: props.opacity || 0.5,
                    color: feature.properties.COLOR || props.color || 'silver',
                    fillOpacity: props.fillOpacity || 0.5,
                  }
                }
              }).addTo(map);
            });
          } else if (c['Markers'].length > 1) {
            // multiple markers become a bound
            map.flyToBounds(
              c['Markers'].map(marker => [marker['Latitude'], marker['Longitude']])
            ).on('moveend', function () {
              changeProjection(map, c)
            });
          } else {
            // Fly to the single marker destination, use zoom level from chapter zoom in JSON
            let zoom = c['Zoom'] ? c['Zoom'] : CHAPTER_ZOOM;
            let marker = c['Markers'][0]
            map.flyTo(
              [marker['Latitude'], marker['Longitude']], zoom
            ).on('moveend', function () {
              changeProjection(map, c)
            });
          }

          // No need to iterate through the following chapters
          break;
        }
      }
    });


    $('#contents').append(" \
      <div id='space-at-the-bottom'> \
        <a href='#top'>  \
          <i class='fa fa-chevron-up'></i></br> \
          <small>Upp</small>  \
        </a> \
      </div> \
    ");

    /* Generate a CSS sheet with cosmetic changes */
    $("<style>")
      .prop("type", "text/css")
      .html("\
      #narration, #title {\
        background-color: " + trySetting('_narrativeBackground', 'white') + "; \
        color: " + trySetting('_narrativeText', 'black') + "; \
      }\
      a, a:visited, a:hover {\
        color: " + trySetting('_narrativeLink', 'blue') + " \
      }\
      .in-focus {\
        background-color: " + trySetting('_narrativeActive', '#f0f0f0') + " \
      }")
      .appendTo("head");


    const endPixels = parseInt(getSetting('_pixelsAfterFinalChapter'));
    if (endPixels > 100) {
      $('#space-at-the-bottom').css({
        'height': (endPixels / 2) + 'px',
        'padding-top': (endPixels / 2) + 'px',
      });
    }

    var bounds = [];
    for (const marker of markers) {
      if (marker) {
        marker.addTo(map);
        marker['_pixelsAbove'] = pixelsAbove[marker['options']['chapter']];
        marker.on('click', function () {
          const pixels = parseInt(this['_pixelsAbove']) + 5;
          $('div#contents').animate({
            scrollTop: pixels + 'px'
          });
        });
        bounds.push(marker.getLatLng());
      }
    }
    map.fitBounds(bounds);

    $('#map, #narration, #title').css('visibility', 'visible');
    $('div.loader').css('visibility', 'hidden');

    $('div#container0').addClass("in-focus");
    $('div#contents').animate({scrollTop: '1px'});
  }


  /**
   * Changes map attribution (author, GitHub repo, email etc.) in bottom-right
   */
  function changeAttribution() {
    var attributionHTML = $('.leaflet-control-attribution')[0].innerHTML;
    var credit = 'View <a href="'
      // Show Google Sheet URL if the variable exists and is not empty, otherwise link to Chapters.json
      + (typeof googleDocURL !== 'undefined' && googleDocURL ? googleDocURL : './data/Chapters.json')
      + '" target="_blank">data</a>';
    
    var name = getSetting('_authorName');
    var url = getSetting('_authorURL');

    if (name && url) {
      if (url.indexOf('@') > 0) { url = 'mailto:' + url; }
      credit += ' by <a href="' + url + '">' + name + '</a> | ';
    } else if (name) {
      credit += ' by ' + name + ' | ';
    } else {
      credit += ' | ';
    }

    credit += 'View <a href="' + getSetting('_githubRepo') + '">code</a>';
    if (getSetting('_codeCredit')) credit += ' by ' + getSetting('_codeCredit');
    credit += ' with ';
    $('.leaflet-control-attribution')[0].innerHTML = credit + attributionHTML;
  }

});
