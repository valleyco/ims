# IMS XML Feed Reference

Reference documentation for Israel Meteorological Service (IMS) XML/RSS forecast feeds.

## Official IMS Pages

- **[Recent Forecasts & Alerts (RSS)](https://ims.gov.il/en/RSS_ForecastAlerts)** - Forecast and alert RSS feeds
- **[Recent Observations & Forecasts (XML)](https://ims.gov.il/en/CurrentDataXML)** - Observations and forecast XML data

## Update Schedule

| Aspect | Details |
|--------|---------|
| **Forecast updates** | Twice daily (morning and afternoon) |
| **Additional updates** | Published when weather conditions change |
| **Recommended stale threshold** | 6-12 hours |

*Source: [IMS RSS_ForecastAlerts](https://ims.gov.il/en/RSS_ForecastAlerts) - "Forecasts are updated twice a day, in the morning and in the afternoon. Additional updates will be published upon weather changes."*

## Feed Types and Structure

### Template Variables (from IMS RSS page)

The IMS website uses Angular/Drupal template variables. The actual URLs are resolved at runtime when the page loads.

| Feed Type | Description | Template Variable |
|-----------|-------------|-------------------|
| Country forecast | Text forecast for 4 days ahead | `ims.rss_data.forecast_country.file_path` |
| UVI forecast | Ultraviolet Index for 15 cities | `ims.rss_data.forecast_radiation.file_path` |
| Sea forecasts | State of sea, wave height, wind for 24h | `ims.rss_data.forecast_sea[ID].file_path` |
| City forecasts | Weather, temps (4 days), wind/humidity (24h) | `ims.rss_data.forecast_city[ID].file_path` |
| Alerts - Country | All warnings | `ims.rss_data.alert.country.general.file_path` |
| Alerts - Visibility | Dust/fog | `ims.rss_data.alert.country.visibility.file_path` |
| Alerts - Marine | Sea warnings | `ims.rss_data.alert.country.sea.file_path` |
| Alerts - North | Flood, storm, fire | `ims.rss_data.alert.north.*.file_path` |
| Alerts - Center | Flood, storm, fire | `ims.rss_data.alert.center.*.file_path` |
| Alerts - South | Flood, storm, fire | `ims.rss_data.alert.south.*.file_path` |

## City IDs

IMS city IDs used in `forecast_city[ID]`:

| ID | City | Our ID |
|----|------|--------|
| 31 | Jerusalem | jerusalem |
| 6 | Haifa | haifa |
| 8 | Beer Sheva | beersheva |
| 75 | Eilat | eilat |
| 3 | Tiberias | tiberias |
| 40 | Nazareth | nazareth |
| 1 | Tel Aviv | telaviv |
| 77 | Afula | afula |
| 76 | Beit Dagan | beitdagan |
| 78 | Zefat | zefat |
| 80 | Lod | lod |
| 33 | Dimona | dimona |
| 50 | Yotvata | yotvata |
| 79 | Dead Sea | deadsea |
| 2 | Mitzpe Ramon | mitzperamon |

## Sea Location IDs

| ID | Location |
|----|----------|
| 212 | Haifa Port |
| 213 | Ashdod Port |
| 211 | Ashkelon |
| 214 | Eilat |

## URL Discovery

The actual XML URLs are not in the page source - they are injected by JavaScript. To discover them:

1. Open [RSS_ForecastAlerts](https://ims.gov.il/en/RSS_ForecastAlerts) in a browser
2. Open Developer Tools > Network tab
3. Click a city link (e.g., Tel Aviv)
4. Find the XML request in the Network tab
5. Copy the Request URL from the Headers

See [URL_DISCOVERY_GUIDE.md](URL_DISCOVERY_GUIDE.md) for detailed instructions.

## Known URL Patterns

### Tried (return 404)

- `https://ims.gov.il/sites/default/files/ims_data/xml_files/Forecast_eng.xml`
- `https://ims.gov.il/sites/default/files/ims_data/xml_files/locality/Forecast_locality_31_eng.xml`
- `https://ims.gov.il/sites/default/files/ims_data/xml_files/sea/Forecast_sea_212_eng.xml`
- `https://ims.gov.il/sites/default/files/ims_data/xml_files/warnings/WarningsENG.xml`

### Alternative (to try)

- `https://ims.gov.il/sites/default/files/rss_ims/forecast_locality_1_eng.xml`
- `https://ims.gov.il/sites/default/files/ims_data/xml_files/isr_cities_1week_6hr_forecast.xml` (aggregated format - used by [israel-weather-rs](https://github.com/barakplasma/israel-weather-rs))

## Alternative: Aggregated Forecast

The [barakplasma/israel-weather-rs](https://github.com/barakplasma/israel-weather-rs) project uses a different format:

- **URL**: `https://ims.gov.il/sites/default/files/ims_data/xml_files/isr_cities_1week_6hr_forecast.xml`
- **Format**: Single XML file with all cities, 1-week forecast, 6-hour intervals
- **Structure**: Different from RSS (location/forecast nodes, not RSS items)

## Terms of Use

Before using IMS RSS/XML services, read and agree to the [IMS Terms & Conditions](https://ims.gov.il/en/termOfuse).

## Related Documentation

- [URL_DISCOVERY_GUIDE.md](URL_DISCOVERY_GUIDE.md) - How to find actual URLs
- [XML_FEED_README.md](XML_FEED_README.md) - XML integration overview
- [XML_INTEGRATION_NOTES.md](XML_INTEGRATION_NOTES.md) - Technical details
- [AUTO_XML_DOWNLOAD.md](AUTO_XML_DOWNLOAD.md) - Automatic download system
