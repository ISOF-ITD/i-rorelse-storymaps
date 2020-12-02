import L from 'leaflet';
import Proj from 'proj4leaflet';
import $ from 'jquery';
import { constants } from './constants';
import './leaflet-providers';
import 'leaflet-extra-markers';
import 'leaflet-swoopy';
import 'jqueryrouter';
import { swapCoordinates, smoothZoom, stripTrailingSlash } from './helpers';

// Create the Leaflet map with a generic start point
const map = L.map('map', {
  center: [0, 0],
  zoom: 1,
  scrollWheelZoom: false,
  zoomControl: false
});

const initStoryList = function (stories) {
  $('<div/>', { id: 'title', style: 'visibility: visible; position: relative;' }).append(
    $('<div/>', { id: 'header' }).append(
      $('<h1/>', { text: 'I rörelse' }),
      $('<h2/>', { text: 'Berättelser' })
    )
  ).appendTo($('body'));

  $('<div/>', { id: 'story-list' }).appendTo($('body'))
  let $ul = $('<ul>', { class: 'stories' }).append(
    stories.map(story =>
      $('<li/>').append($('<a/>',
        {
          href: (`${ROOT_PATH}${story['title']}`)
        })
        .text(story['title']))
    )
  );
  $('#story-list').append($ul)
  $('div.loader').css('visibility', 'hidden');
}

$(window).on('load', function () {

  let url = new URL(window.location.href);

  var documentSettings = {};

  // Some constants, such as default settings
  const CHAPTER_ZOOM = 15;

  // This watches for the scrollable container
  var scrollPosition = 0;
  $('div#contents').on("scroll", function () {
    scrollPosition = $(this).scrollTop();
  });

  $.getJSON(`${ROOT_PATH}api/stories.json`, function (stories) {
    // trail and replace slashes because django and JS return different kinds of paths,
    // with and without slash
    const story_title = (`${url['pathname']}/`)
      .replace(stripTrailingSlash(ROOT_PATH), '') // remove root_path, e.g. "/i-rorelse/" --> "/i-rorelse"
      .replace(/\//g, ""); //remove all remaining slashes
    if (!story_title) {
      initStoryList(stories)
    }
    else {
      const story = stories.filter(s => s["title"] == story_title)[0]
      if (story) {
        initMap(story)
      } else {
        window.location.replace(ROOT_PATH)
      }
    }
  }).fail(function (e) {
    alert("Error. Could not connect to API.")
  });

  /**
  * Reformulates documentSettings as a dictionary, e.g.
  * {"webpageTitle": "Leaflet Boilerplate", "infoPopupText": "Stuff"}
  */
  function createDocumentSettings(settings) {
    delete settings.chapters;
    documentSettings = settings;
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

  function initMap(data) {

    const chapters = data['chapters']

    // build DOM elements

    $('<div/>', { id: 'title' }).append(
      $('<div/>', { id: 'logo' }),
      $('<div/>', { id: 'header' })
    ).appendTo($('body'));

    $('<div/>', { id: 'narration' }).append(
      $('<div/>', { id: 'contents' }).append(
        $('<div/>', { id: 'top' })
      )
    ).appendTo($('body'))

    createDocumentSettings(data);

    var chapterContainerMargin = 70;

    document.title = getSetting('_mapTitle');
    $('#header').append(`<h1>${getSetting('_mapTitle')}</h1>`);
    $('#header').append(`<h2>${getSetting('_mapSubtitle')}</h2>`);

    // Add logo
    if (getSetting('_mapLogo')) {
      $('#logo').append(`<img src="${getSetting('_mapLogo')}" />`);
      $('#top').css('height', '60px');
    } else {
      $('#logo').css('display', 'none');
      $('#header').css('padding-top', '25px');
    }

    // Load tiles
    addBaseMap();

    // Add zoom controls if needed
    if (false && getSetting('_zoomControls') !== 'off') {
      L.control.zoom({
        position: getSetting('_zoomControls')
      }).addTo(map);
    }

    var markers = [];

    var markActiveColor = function (k) {
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

    var pixelsAbove = [];
    var chapterCount = 0;

    var currentlyInFocus; // integer to specify each chapter is currently in focus
    var overlay;  // URL of the overlay for in-focus chapter
    var geoJsonOverlay;

    let allMarkers = []
    for (const i of chapters) {
      allMarkers = allMarkers.concat(i['markers'])
    }

    // Add swoopy arrows
    for (const j in allMarkers) {
      const i = parseInt(j)
      const marker = allMarkers[i]
      const nextMarker = allMarkers[i + 1] || false
      if (nextMarker) {
        new L.SwoopyArrow(swapCoordinates(marker['location'].slice(1, -1).split(",")), swapCoordinates(nextMarker['location'].slice(1, -1).split(",")), {
          text: 'Jag är en testpil',
          color: '#64A7D9',
          weight: "2",
          textClassName: 'swoopy-arrow',
          hideArrowHead: true,
          factor: 0.4,
          // minZoom: 4,
          maxZoom: 10
        }).addTo(map);
      }
    }

    for (const i in chapters) {
      const c = chapters[i];

      if (c['markers']) {
        for (const marker of c['markers']) {
          if (true) {
            // if ( !isNaN(parseFloat(marker['location'].split(',')[0])) && !isNaN(parseFloat(marker['location'].split(',')[1]))) {
            const lat = parseFloat(marker['location'].slice(1, -1).split(",")[1]);
            const lon = parseFloat(marker['location'].slice(1, -1).split(",")[0]);

            chapterCount += 1;

            markers.push(
              L.marker([lat, lon], {
                chapter: i,
                icon: L.ExtraMarkers.icon({
                  icon: 'fa-number',
                  number: marker['style'] === 'Plain' ? '' : marker['location_name'],
                  markerColor: marker['marker_color'] || 'blue'
                }),
                opacity: marker['style'] === 'Hidden' ? 0 : 0.9,
                interactive: marker['style'] === 'Hidden' ? false : true,
              }
              ));
          }
        }
      }

      // Add chapter container
      var container = $('<div></div>', {
        id: `container${i}`,
        class: 'chapter-container'
      });


      // Add media and credits: YouTube, audio, or image
      var media = null;
      var mediaContainer = null;

      // Add media source
      var source = '';
      if (c['media_credit_link']) {
        source = $('<a>', {
          text: c['media_credit'],
          href: c['media_credit_link'],
          target: "_blank",
          class: 'source'
        });
      } else {
        source = $('<span>', {
          text: c['media_credit'],
          class: 'source'
        });
      }

      // YouTube
      if (c['media_link'] && c['media_link'].indexOf('youtube.com/') > -1) {
        media = $('<iframe></iframe>', {
          src: c['media_link'],
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

      var mediaExt = c['media_link'].split('.').pop().toLowerCase();
      var mediaType = mediaTypes[mediaExt];

      if (mediaType) {
        media = $(`<${mediaType}>`, {
          src: c['media_link'],
          controls: mediaType == 'audio' ? 'controls' : '',
        });

        mediaContainer = $('<div></div', {
          class: `${mediaType}-container`
        }).append(media).after(source);
      }

      container
        .append(`<p class="chapter-header">${c['title']}</p>`)
        .append(media ? mediaContainer : '')
        .append(media ? source : '')
        .append(`<div class="description">${c['description']}</div>`);

      $('#contents').append(container);

    }

    changeAttribution();

    /* Change image container heights */
    let imgContainerHeight = parseInt(getSetting('_imgContainerHeight'));
    if (imgContainerHeight > 0) {
      $('.img-container').css({
        'height': `${imgContainerHeight}px`,
        'max-height': `${imgContainerHeight}px`,
      });
    }

    // For each block (chapter), calculate how many pixels above it
    pixelsAbove[0] = -100;
    for (let i = 1; i < chapters.length; i++) {
      pixelsAbove[i] = pixelsAbove[i - 1] + $(`div#container${(i - 1)}`).height() + chapterContainerMargin;
    }
    pixelsAbove.push(Number.MAX_VALUE);

    $('div#contents').on("scroll", function () {
      var currentPosition = $(this).scrollTop();
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
      const paddingLeft = vw >= 768 ? $("#narration").width() + 40 : 0
      const paddingTop = 40; //acount for the size of the marker

      // Make title disappear on scroll
      if (currentPosition < 200) {
        $('#title').css('opacity', 1 - Math.min(1, currentPosition / 100));
      }

      for (var i = 0; i < pixelsAbove.length - 1; i++) {

        if (currentPosition >= pixelsAbove[i]
          && currentPosition < (pixelsAbove[i + 1] - 2 * chapterContainerMargin)
          && currentlyInFocus != i
        ) {
          // Remove styling for the old in-focus chapter and
          // add it to the new active chapter
          $('.chapter-container').removeClass("in-focus").addClass("out-focus");
          $(`div#container${i}`).addClass("in-focus").removeClass("out-focus");

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

          // Add chapter's overlay tiles if specified in data
          if (c['overlay']) {
            var opacity = (c['overlay_transparency'] !== '') ? parseFloat(c['overlay_transparency']) : 1;
            var url = c['overlay'];

            if (url.split('.').pop() == 'geojson') {
              $.getJSON(url, function (geojson) {
                overlay = L.geoJson(geojson, {
                  style: function (feature) {
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
              overlay = L.tileLayer(c['overlay'], { opacity: opacity }).addTo(map);
            }

          } else {
            delete map.options.crs;
          }

          if (c['geojson_overlay']) {
            const geojsonoverlay_api = `${ROOT_PATH}api/geojson_overlays/`;
            const overlay_path = `${geojsonoverlay_api}${c['geojson_overlay']}/`;
            $.getJSON(overlay_path).done(function (geojson) {
              const geoJsonBounds = L.geoJson(geojson).getBounds()
              const markerBounds = c['markers'].map(marker => swapCoordinates(marker['location'].slice(1, -1).split(',')))
              const bounds = [geoJsonBounds, markerBounds]
              map.flyToBounds(
                bounds,
                { paddingTopLeft: [paddingLeft, paddingTop] }
              );

              // Parse properties string into a JS object
              var props = {};

              if (c['geojson_feature_properties']) {
                var propsArray = c['geojson_feature_properties'].split(';');
                var props = {};
                for (var p in propsArray) {
                  if (propsArray[p].split(':').length === 2) {
                    props[propsArray[p].split(':')[0].trim()] = propsArray[p].split(':')[1].trim();
                  }
                }
              }

              geoJsonOverlay = L.geoJson(geojson, {
                style: function (feature) {
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
          } else if (c['markers'].length > 1) {
            // multiple markers become a bound
            const bounds = c['markers'].map(marker => swapCoordinates(marker['location'].slice(1, -1).split(',')))
            map.flyToBounds(
              bounds,
              { paddingTopLeft: [paddingLeft, paddingTop] }
            );
          } else {
            // Fly to the single marker destination, use zoom level from chapter zoom in JSON
            const zoom = c['zoom'] ? c['zoom'] : CHAPTER_ZOOM;
            const marker = c['markers'][0]
            const coords = swapCoordinates(marker['location'].slice(1, -1).split(','))
            // center map with padding
            const newCoords = map.layerPointToLatLng([
              map.latLngToLayerPoint(coords)["x"] - paddingLeft / 2,
              map.latLngToLayerPoint(coords)["y"]
            ]);

            map.flyTo(
              newCoords,
              undefined,
              { duration: 1 }
            )

            setTimeout(function () {
              smoothZoom(map, zoom, 300, coords)
            },
              1010);
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
        background-color: " + trySetting('_narrativeBackground', 'rgba(255,255,255,0.7)') + "; \
        color: " + trySetting('_narrativeText', 'black') + "; \
      }\
      a, a:visited, a:hover {\
        color: " + trySetting('_narrativeLink', 'blue') + " \
      }\
      .in-focus {\
        background-color: " + trySetting('_narrativeActive', '#e5f4eb') + " \
      }\
      #top {\
        height: "+ $("#title").height() + "px;\
      ")
      .appendTo("head");


    const endPixels = parseInt(getSetting('_pixelsAfterFinalChapter'));
    if (endPixels > 100) {
      $('#space-at-the-bottom').css({
        'height': `${(endPixels / 2)}px`,
        'padding-top': `${(endPixels / 2)}px`,
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
            scrollTop: `${pixels}px`
          });
        });
        bounds.push(marker.getLatLng());
      }
    }
    map.fitBounds(bounds);

    $('#map, #narration, #title').css('visibility', 'visible');
    $('div.loader').css('visibility', 'hidden');

    $('div#container0').addClass("in-focus");
    $('div#contents').animate({ scrollTop: '1px' });
  }


  /**
   * Changes map attribution (author, GitHub repo, email etc.) in bottom-right
   */
  function changeAttribution() {
    var attributionHTML = $('.leaflet-control-attribution')[0].innerHTML;
    var credit = `View <a href="${ROOT_PATH}api/stories/${getSetting('_id')}.json" target="_blank">data</a>`;

    var name = getSetting('_authorName');
    var url = getSetting('_authorURL');

    if (name && url) {
      if (url.indexOf('@') > 0) { url = `mailto:${url}`; }
      credit += ` by <a href="${url}">${name}</a> | `;
    } else if (name) {
      credit += ` by ${name} | `;
    } else {
      credit += ' | ';
    }

    credit += `View <a href="${getSetting('_githubRepo')}">code</a>`;
    if (getSetting('_codeCredit')) credit += `by ${getSetting('_codeCredit')}`;
    credit += ' with ';
    $('.leaflet-control-attribution')[0].innerHTML = credit + attributionHTML;
  }

});
