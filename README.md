# Every day tasks

Compile with gulp for development, watch for changes: 

```bash
sed -i 's/production = true/production = false/' gulpfile.js && gulp
```

(only once:) Add the original repo as *upstream* remote, in order to be able to merge their changes into our code:

```bash
git remote add upstream git@github.com:HandsOnDataViz/leaflet-storymaps-with-google-sheets.git
```

Merge change from the original (*upstream*) repo into our code:

```bash
git fetch upstream
git merge upstream/master
```

Compile the code with gulp for release: 

```bash
sed -i 's/production = false/production = true/' gulpfile.js && gulp build && git add www && git commit -m 'fresh compile'
```

Push the *master* branch to all remotes (except *upstream*):

```bash
git remote | grep -v upstream | xargs -L1 -I R git push R master
```

Push the **www**-directory to the github page (*gh-pages* branch on *origin*):

```bash
git subtree push --prefix www origin gh-pages
```

The Github page is located at: https://isof-itd.github.io/i-rorelse-storymaps/

---

# Tillgänglighet

Se https://webbriktlinjer.se/riktlinjer/?filter=on&guidelineorder=a&freetext-filter=&query-vlwebb-wcag%5B%5D=304&query-vlwebb-target%5B%5D=280&query-vlwebb-target%5B%5D=279

|	WCAG | Nivå | Riktlinje | Status | Kommentar |
|-- |-- |-- |-- |-- |
|	1.3.1 | (A) |	Ange i kod vad sidans olika delar har för roll | ❌ |
|	1.3.2 | (A) |	Presentera innehållet i en meningsfull ordning för alla | ❌ |
|	1.3.3 | (A) |	Gör inte instruktioner beroende av sensoriska kännetecken | ❌ |
|	1.3.4 | (AA) |	Se till att allt innehåll presenteras rätt oavsett skärmens riktning | ❌ |
|	1.3.5 | (AA) |	Märk upp vanliga formulärfält i koden | ❌ |
|	1.4.1 | (A) |	Använd inte enbart färg för att förmedla information | ❌ |
|	1.4.10 | (AA) |	Skapa en flexibel layout som fungerar vid förstoring eller liten skärm | ❌ |
|	1.4.11 | (AA) |	Använd tillräckliga kontraster i komponenter och grafik | ❌ |
|	1.4.12 | (AA) |	Se till att det går att öka avstånd mellan tecken, rader, stycken och ord | ❌ |
|	1.4.13 | (AA) |	Popup-funktioner ska kunna hanteras och stängas av alla | ❌ |
|	1.4.2 | (A) |	Ge användaren möjlighet att pausa, stänga av eller sänka ljud | ❌ |
|	1.4.3 | (AA) |	Använd tillräcklig kontrast mellan text och bakgrund | ❌ |
|	1.4.4 | (AA) |	Se till att text går att förstora utan problem | ❌ |
|	1.4.5 | (AA) |	Använd text, inte bilder, för att visa text | ❌ |
|	2.1.1 | (A) |	Utveckla systemet så att det går att hantera med enbart tangentbordet | ❌ |
|	2.1.2 | (A) |	Se till att markören inte fastnar vid tangentbordsnavigation | ❌ |
|	2.1.4 | (A) |	Skapa kortkommandon med varsamhet | ❌ |
|	2.2.1 | (A) |	Ge användarna möjlighet att justera tidsbegränsningar | ❌ |
|	2.2.2 | (A) |	Ge användarna möjlighet att pausa eller stänga av rörelser | ❌ |
|	2.3.1 | (A) |	Orsaka inte epileptiska anfall genom blinkande | ❌ |
|	2.4.1 | (A) |	Erbjud möjlighet att hoppa förbi återkommande innehåll | ❌ |
|	2.4.3 | (A) |	Gör en logisk tab-ordning | ❌ |
|	2.4.5 | (AA) |	Erbjud användarna flera olika sätt att navigera | ❌ |
|	2.4.7 | (AA) |	Markera tydligt vilket fält eller element som är i fokus | ❌ |
|	2.5.1 | (A) |	Erbjud alternativ till komplexa fingerrörelser | ❌ |
|	2.5.2 | (A) |	Gör det möjligt att ångra klick | ❌ |
|	2.5.3 | (A) |	Se till att text på knappar och kontroller överensstämmer med maskinläsbara etiketter | ❌ |
|	2.5.4 | (A) |	Erbjud alternativ till rörelsestyrning | ❌ |
|	3.1.1 | (A) |	Ange sidans språk i koden | ❌ |
|	3.1.2 | (AA) |	Ange språkförändringar i koden | ❌ |
|	3.2.1 | (A) |	Utför inga oväntade förändringar vid fokusering | ❌ |
|	3.2.2 | (A) |	Utför inga oväntade förändringar vid inmatning | ❌ |
|	3.2.3 | (AA) |	Var konsekvent i navigation, struktur och utformning | ❌ |
|	3.2.4 | (AA) |	Benämn funktioner konsekvent | ❌ |
|	3.3.1 | (A) |	Visa var ett fel uppstått och beskriv det tydligt | ❌ |
|	3.3.2 | (A) |	Skapa tydliga och klickbara fältetiketter | ❌ |
|	3.3.3 | (AA) |	Ge förslag på hur fel kan rättas till | ❌ |
|	3.3.4 | (AA) |	Ge möjlighet att ångra, korrigera eller bekräfta vid viktiga transaktioner | ❌ |
|	4.1.1 | (A) |	Se till att koden validerar | ❌ |
|	4.1.2 | (A) |	Se till att skräddarsydda komponenter fungerar i hjälpmedel | ❌ |
|	4.1.3 | (AA) |	Se till att hjälpmedel kan presentera meddelanden som inte är i fokus | ❌ |

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
|--       |--       |--       |--
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