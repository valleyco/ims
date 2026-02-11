# XML Feed Integration - README

## Overview

This application now supports a **hybrid data source** approach:
- **Primary**: XML/RSS forecasts from IMS (professional meteorologist forecasts)
- **Fallback**: Real-time station observations via IMS API (10-minute interval data)

The UI remains unchanged - the system automatically uses XML forecasts when available, and seamlessly falls back to station data when not.

## Quick Start

### 1. Download XML Feeds

```bash
npm run download-xml
```

**Note**: Currently, the XML feed URLs return 404 errors. See [XML_INTEGRATION_NOTES.md](XML_INTEGRATION_NOTES.md) for details on discovering the correct URLs.

### 2. Start Server

```bash
npm run build
npm start
```

Or for development:

```bash
npm run dev
```

### 3. Schedule Automatic Downloads (Optional)

Add to crontab:

```bash
0 */6 * * * cd /path/to/meteorologic && npm run download-xml
```

Or use node-cron in `src/server.ts` (see XML_INTEGRATION_NOTES.md).

## New API Endpoints

### Get All Cities

```
GET /api/cities
```

Returns list of 15 cities with XML forecasts:

```json
[
  {
    "id": "jerusalem",
    "name": "Jerusalem",
    "nameHebrew": "ירושלים",
    "location": { "latitude": 31.7683, "longitude": 35.2137 }
  },
  ...
]
```

### Get City Forecast (Direct XML Access)

```
GET /api/city-forecast?city=jerusalem
```

Returns parsed XML forecast for a specific city.

### Get Station Detail (Raw Observations)

```
GET /api/station-detail?stationId=178&period=today
```

Returns raw station observation data (bypasses XML, always uses station API).

### Get Alerts

```
GET /api/alerts
```

Returns all active weather alerts from XML feeds.

### Get Country Forecast

```
GET /api/country-forecast
```

Returns general country-wide forecast text.

### Get Sea Forecast

```
GET /api/sea-forecast?location=haifa
```

Locations: `haifa`, `ashdod`, `ashkelon`, `eilat`

### Get UVI Forecast

```
GET /api/uvi-forecast
```

Returns UV index forecast for 15 cities.

## Modified Endpoint

### Get Forecast (Hybrid)

```
GET /api/forecast?stationId=178&period=today
```

**New Behavior**:
1. Finds nearest city to the station location
2. Attempts to load XML forecast for that city
3. If XML available: Returns parsed forecast data
4. If XML unavailable: Falls back to station observations (original behavior)

**Response includes** `source` field:
- `"xml"`: Using XML forecast data
- `"station"`: Using station observations (fallback)

## Data Flow

```
User requests forecast for station
    ↓
Find nearest city (from 15 XML cities)
    ↓
Check for XML forecast data
    ├─ XML Available
    │    ↓
    │  Parse & extract structured data
    │    ↓
    │  Return forecast (source: "xml")
    │
    └─ XML Unavailable
         ↓
       Load station observations
         ↓
       Aggregate to hourly/daily
         ↓
       Return forecast (source: "station")
```

## 15 Cities with XML Forecasts

1. Jerusalem (ירושלים)
2. Tel Aviv (תל אביב)
3. Haifa (חיפה)
4. Beer Sheva (באר שבע)
5. Eilat (אילת)
6. Tiberias (טבריה)
7. Nazareth (נצרת)
8. Afula (עפולה)
9. Beit Dagan (בית דגן)
10. Zefat (צפת)
11. Lod (לוד)
12. Dimona (דימונה)
13. Yotvata (יטבתה)
14. Dead Sea (ים המלח)
15. Mitzpe Ramon (מצפה רמון)

## File Structure

```
src/
├── cityStationMapping.ts    - 15 cities with coordinates + nearest city finder
├── xmlDownloader.ts          - Download all XML/RSS feeds to timestamped folders
├── xmlParser.ts              - Parse RSS format, extract forecast items
├── forecastAdapter.ts        - Extract temp/wind/humidity from forecast text
├── server.ts                 - Modified /api/forecast + new endpoints
└── ...

scripts/
└── download-xml-feeds.ts     - CLI tool: npm run download-xml

data/                          - XML feed storage (timestamped)
└── YYYY-MM-DD/
    └── HH-MM-SS/
        ├── forecast_*.xml
        ├── alerts_*.xml
        └── metadata.json
```

## Troubleshooting

### XML Feeds Return 404

**Problem**: All XML feed URLs return 404 errors.

**Solution**: See [XML_INTEGRATION_NOTES.md](XML_INTEGRATION_NOTES.md) for instructions on discovering actual URLs using browser DevTools.

### No XML Data Available

If you see this error:
```json
{
  "error": "No XML data available. Run: npm run download-xml"
}
```

**Solutions**:
1. Update `src/xmlDownloader.ts` with correct URLs
2. Run `npm run download-xml`
3. Check `data/` directory for downloaded files

### Forecast Always Uses Station Data

If `/api/forecast` always returns `"source": "station"`:
1. Check if XML files exist in `data/` directory
2. Verify XML files are not empty
3. Check server logs for XML parsing errors

## Benefits of Hybrid Approach

**XML Forecasts (Primary)**:
- Professional meteorologist predictions (vs calculated averages)
- Human-readable descriptions
- Twice-daily updates sufficient for most users
- No API token needed (public feeds)
- Lower server load

**Station Observations (Fallback)**:
- Real-time data (10-minute intervals)
- Historical data access
- 187 stations vs 15 cities (better coverage)
- Automatic fallback ensures reliability

## Next Steps

1. **Discover correct XML feed URLs** - Use browser DevTools (see XML_INTEGRATION_NOTES.md)
2. **Update `src/xmlDownloader.ts`** - Replace estimated URLs with actual URLs
3. **Download XML feeds** - `npm run download-xml`
4. **Verify XML integration** - Check if `/api/forecast` returns `"source": "xml"`
5. **Schedule downloads** - Add cron job for automatic updates

## Testing

### Test Cities Endpoint
```bash
curl "http://localhost:3001/api/cities" | jq
```

### Test Hybrid Forecast
```bash
# Will use XML if available, or fall back to station data
curl "http://localhost:3001/api/forecast?stationId=178&period=today" | jq '.source'
```

### Test Station Detail
```bash
# Always uses station observations
curl "http://localhost:3001/api/station-detail?stationId=178&period=today" | jq
```

## Dependencies Added

- `xml2js`: XML/RSS parsing
- `node-cron`: Scheduled task execution
- `@types/xml2js`: TypeScript types
- `@types/node-cron`: TypeScript types

## License

Same as parent project.
