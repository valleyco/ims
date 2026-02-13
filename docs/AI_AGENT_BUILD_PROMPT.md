# Build Israel Weather Forecast Application

## Mission

Build a beautiful, production-ready weather forecast application for Israel using the Israel Meteorological Service (IMS) API and XML/RSS feeds. The application should provide professional weather forecasts with an elegant user interface, intelligent data fallback, and robust caching.

---

## Application Overview

**Purpose**: Provide accurate, real-time weather data for Israel with a modern, user-friendly interface.

**Core Value Proposition**: Hybrid data approach combining professional meteorologist forecasts (XML feeds) with real-time station observations, ensuring users always get the best available data.

**Target Users**: Anyone needing Israeli weather information, from casual users checking daily weather to researchers needing historical data.

---

## Technical Architecture

### Backend Stack

- **Runtime**: Node.js with Express server
- **Language**: TypeScript (strict mode, ES2020 target)
- **Caching**: 2-level system (in-memory Map + file-based JSON)
- **API Design**: RESTful endpoints with proper HTTP verbs
- **Scheduling**: node-cron for automated XML downloads
- **Data Parsing**: xml2js for RSS/XML feed parsing

### Frontend Stack

- **JavaScript**: Vanilla JS (no frameworks - keep it lightweight)
- **HTML**: Semantic HTML5 markup
- **CSS**: Modern CSS3 with glass-morphism effects and gradients
- **Architecture**: Single Page Application (SPA)
- **Communication**: AJAX/Fetch API for async data loading

### Data Sources

**Primary Source - IMS XML/RSS Feeds**:
- 15 major Israeli cities
- Professional meteorologist forecasts
- Updated twice daily
- Public feeds (no API token required)
- Text-based forecasts requiring parsing

**Fallback Source - IMS API**:
- 187 weather stations nationwide
- Real-time observations (10-minute intervals)
- Requires API token
- Structured JSON responses
- Historical data available

**Tertiary Source - Synthetic Fallback**:
- Generates reasonable forecasts when both sources fail
- Based on seasonal patterns and location
- Ensures app never shows "no data"

### Data Flow Architecture

```
User Request → Server
    ↓
Check Cache (Memory → File)
    ↓
Cache Miss
    ↓
Try XML Forecast (Primary)
    ↓ (if unavailable)
Try Station API (Fallback)
    ↓ (if insufficient)
Generate Synthetic (Tertiary)
    ↓
Store in Cache
    ↓
Return to User with Source Indicator
```

---

## Core Features

### 1. Location Detection

**Automatic Detection**:
- Use browser Geolocation API
- Request permission from user
- Handle denial gracefully
- Find nearest station/city using Haversine formula

**Manual Entry**:
- Latitude/longitude input fields
- Validation: lat [-90, 90], lon [-180, 180]
- Real-time feedback on validity
- Find station button

**Persistence**:
- Save user location in localStorage
- Save selected station in localStorage
- Auto-load on page refresh

### 2. Time Periods

**Today (Hourly)**:
- Show last 24 hours of data
- Hourly granularity
- Include next day if available
- Table limited to 6 visible rows with scrolling
- Highlight current hour

**This Week (Daily)**:
- 7 days forward from today
- Daily min/max temperatures
- Aggregated humidity, wind, rainfall
- Summary format

**This Month (Daily)**:
- 30 days forward from today
- Same format as week
- Daily summaries

### 3. Weather Metrics

Display the following metrics with appropriate icons and units:

- **Temperature**: Celsius (°C), large prominent display
- **Humidity**: Percentage (%), with droplet icon
- **Wind Speed**: Meters per second (m/s), with wind icon
- **Wind Direction**: Degrees + compass direction (N, NE, E, etc.)
- **Rainfall**: Millimeters (mm), with rain icon

### 4. User Interface

**Visual Design**:
- Animated gradient background
- Glass-morphism cards (backdrop-filter: blur)
- Smooth fade-in animations
- Loading spinners during data fetch
- Toast notifications for errors
- Responsive layout (mobile, tablet, desktop)

**Color Palette**:
- Primary: Purple gradient (#667eea → #764ba2)
- Glass: rgba(255, 255, 255, 0.1-0.8)
- Text: Dark on light cards
- Accents: Green (success), Red (errors), Orange (warnings)

**Data Source Badges**:
Show colored badge indicating data source:
- XML: Purple gradient (📡 XML Forecast)
- Station: Pink gradient (📊 Station Observation)
- Fallback: Orange gradient (🔮 Generated Forecast)

**Interactions**:
- Hover effects on buttons
- Active states on date range selector
- Smooth transitions (300ms)
- Auto-dismiss error toasts (5 seconds)

---

## Security & Best Practices

### Input Validation

Validate ALL user inputs before processing:

**Coordinates**:
```typescript
// Latitude must be between -90 and 90
if (isNaN(lat) || lat < -90 || lat > 90) {
  return error('Latitude must be between -90 and 90');
}

// Longitude must be between -180 and 180
if (isNaN(lon) || lon < -180 || lon > 180) {
  return error('Longitude must be between -180 and 180');
}
```

**Station ID**:
```typescript
// Must be numeric
if (!/^\d+$/.test(stationId)) {
  return error('Station ID must be a valid number');
}
```

**Period**:
```typescript
// Must be one of the allowed values
const validPeriods = ['today', 'week', 'month'];
if (period && !validPeriods.includes(period)) {
  return error('Period must be one of: today, week, month');
}
```

**City Name**:
```typescript
// Must exist in city mapping
const cityInfo = cityMapping.getCityById(city);
if (!cityInfo) {
  return error('City not found. Valid cities: jerusalem, telaviv, haifa, ...');
}
```

### CORS Configuration

**Never use open CORS** (`app.use(cors())`). Always restrict:

```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()),
  credentials: true
}));
```

**.env configuration**:
```bash
# Development
ALLOWED_ORIGINS=http://localhost:3000

# Production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Environment Variables

**Required Variables**:
```bash
IMS_API_TOKEN=your-token-here  # Get from https://ims.gov.il/en/ObservationDataAPI
PORT=3000                       # Server port
ALLOWED_ORIGINS=http://localhost:3000  # Comma-separated
NODE_ENV=development            # or 'production'
```

**Secret Management**:
1. Create `.env.example` template (safe to commit)
2. Never commit actual `.env` file
3. Add `.env` to `.gitignore`
4. Document all variables in README
5. Validate required variables on startup

### Admin Endpoint Security

Admin endpoints provide powerful functions (XML download, cache management) that could be abused:

```typescript
// ONLY enable in development
if (config.NODE_ENV === 'development') {
  app.get('/api/admin/data-status', handler);
  app.post('/api/admin/xml', handler);
  console.log('🔓 Admin endpoints enabled (development mode)');
} else {
  console.log('🔒 Admin endpoints disabled (production mode)');
}
```

**Why?**
- Prevents DoS attacks via XML downloads
- Prevents cache manipulation
- Reduces attack surface in production
- XML downloads handled by cron jobs in production

### Error Handling

**API Errors - Include Details**:
```typescript
if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`IMS API error: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
}
```

**Never Leak Secrets**:
- Don't log API tokens
- Don't include tokens in error messages
- Don't expose internal file paths (removed downloadDir from responses)

---

## API Design

### Core Endpoints

**GET /api/stations**
- Returns all 187 IMS weather stations
- Cached: 48 hours
- No parameters
- Response: Array of Station objects with location, monitors

**GET /api/nearest-station?lat={lat}&lon={lon}**
- Finds nearest station to coordinates
- Validates lat/lon ranges
- Returns: Station object + distance in km
- No caching (fast calculation)

**GET /api/station-data?stationId={id}&period={period}**
- Returns historical observations for station
- Period: today, week, month
- Uses BACKWARD-looking dates (getDateRange)
- Cached: 24 hours per station/period
- Fetches multiple channels in parallel

**GET /api/forecast?stationId={id}&period={period}**
- **Hybrid endpoint** - tries XML first, falls back to station
- Period: today, week, month
- Uses FORWARD-looking dates (getForecastDateRange)
- Cached: 24 hours per station/period
- Response includes `source` field: "xml", "station", or "fallback"

**GET /api/cities**
- Returns 15 cities with XML forecast coverage
- Includes coordinates for nearest city matching
- Cached: 48 hours

**DELETE /api/cache**
- Clears both memory and file caches
- Returns: Cache statistics before clearing
- Use for debugging/testing

**GET /api/health**
- Health check endpoint
- Returns: Server status, cache stats, XML data freshness
- No authentication required

### XML Data Endpoints

**GET /api/city-forecast?city={cityId}**
- Direct access to XML forecast for specific city
- City IDs: jerusalem, telaviv, haifa, beersheva, etc.
- Returns parsed forecast items
- Validates city exists

**GET /api/alerts**
- Returns all active weather alerts from IMS
- Parsed from alerts XML feed
- Returns count + array of alerts

**GET /api/country-forecast**
- General country-wide forecast text
- Parsed from XML feed

**GET /api/sea-forecast?location={location}**
- Sea conditions for specific locations
- Locations: haifa, ashdod, ashkelon, eilat
- Validates location against whitelist

**GET /api/uvi-forecast**
- UV index forecast for all 15 cities
- Parsed from UVI XML feed

### Admin Endpoints (Development Only)

**GET /api/admin/data-status**
- Shows XML data freshness
- Returns: timestamp, age, file count
- Helps debug XML download issues

**POST /api/admin/xml**
- Manually trigger XML download
- Useful for testing without waiting 6 hours
- Returns: Download status

### Date Handling - Critical Distinction

**Backward-looking dates** (`getDateRange`) for **observations**:
```typescript
// For /api/station-data (historical observations)
const dateRange = utils.getDateRange(period);
// today: today 00:00 to now
// week: 7 days ago to now
// month: 30 days ago to now
```

**Forward-looking dates** (`getForecastDateRange`) for **forecasts**:
```typescript
// For /api/forecast (future predictions)
const dateRange = utils.getForecastDateRange(period);
// today: now to end of day + some next day hours
// week: today to 7 days from now
// month: today to 30 days from now
```

---

## Caching Strategy

### 2-Level Cache Architecture

**Why 2 levels?**
- Memory: Lightning fast (sub-millisecond), volatile
- File: Persistent across restarts, slower but reliable
- Combination: Fast + Reliable

**Implementation**:

```typescript
// Level 1: In-Memory Map
const memoryCache = new Map<string, CacheEntry<any>>();

// Level 2: File System
const CACHE_DIR = '.cache/';
// Files: .cache/stations_list.json, .cache/forecast_178_2024-01-01_2024-01-07.json
```

### Cache Types & Durations

```typescript
export type CacheType = 'stations' | 'forecast' | 'station_data';

const CACHE_DURATIONS = {
  stations: 48 * 60 * 60 * 1000,      // 48 hours - stations rarely change
  forecast: 24 * 60 * 60 * 1000,      // 24 hours - forecasts update twice daily
  station_data: 24 * 60 * 60 * 1000   // 24 hours - historical data is stable
};
```

### Cache Key Format

**Stations**: `stations_list`

**Forecast**: `forecast_{stationId}_{fromDate}_{toDate}`
- Example: `forecast_178_2024-01-01_2024-01-07`

**Station Data**: `station_data_{stationId}_{fromDate}_{toDate}`
- Example: `station_data_178_2024-01-01_2024-01-01`

### Cache API Design

```typescript
// Unified cache API with fetcher pattern
cache.get<T>(type: CacheType, params: CacheParams, options: {
  fetcher?: () => Promise<T>,  // Function to call on cache miss
  duration?: number             // Optional override default duration
}): Promise<T>
```

**Usage Example**:
```typescript
const stations = await cache.get<Station[]>('stations', {}, {
  fetcher: async () => await imsApi.getStations()
});
```

### Cache Flow

```
1. Check memory cache
   ├─ Hit → return immediately
   └─ Miss → continue
2. Check file cache
   ├─ Hit → store in memory → return
   └─ Miss → continue
3. Call fetcher function
4. Store in both caches
5. Return data
```

### Important Cache Rules

1. **Never cache null/undefined**: 
   ```typescript
   if (data === null || data === undefined) {
     return data; // Don't store
   }
   ```

2. **Never cache errors**:
   ```typescript
   try {
     const data = await fetcher();
     await cache.set(key, data);
   } catch (error) {
     // Don't cache the error, just throw
     throw error;
   }
   ```

3. **Check expiration**:
   ```typescript
   if (Date.now() - timestamp > duration) {
     delete cache; // Expired
   }
   ```

4. **Cleanup on DELETE**:
   ```typescript
   // Clear memory
   memoryCache.clear();
   // Delete all .json files in .cache/
   ```

---

## XML Integration

### Download Scheduling

**Three trigger mechanisms**:

1. **Server Startup**: Download fresh data immediately
2. **Cron Schedule**: Every 6 hours (0 */6 * * *)
3. **Manual Trigger**: Admin API endpoint (dev only)

```typescript
import cron from 'node-cron';

// Download on startup
xmlDownloader.downloadAllFeeds().catch(console.error);

// Schedule every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('⏰ Scheduled XML download starting...');
  await xmlDownloader.downloadAllFeeds();
});
```

### Storage Structure

**Timestamped directories** prevent data loss and enable debugging:

```
data/
├── 2024-01-15/
│   ├── 06-00-00/
│   │   ├── metadata.json
│   │   ├── forecast_city_jerusalem.xml
│   │   ├── forecast_city_telaviv.xml
│   │   ├── ...
│   │   ├── alerts_1.xml
│   │   ├── country_forecast.xml
│   │   ├── sea_haifa.xml
│   │   └── uvi.xml
│   └── 12-00-00/
│       └── ...
└── 2024-01-16/
    └── ...
```

**metadata.json** format:
```json
{
  "timestamp": "2024-01-15T06:00:00.000Z",
  "fileCount": 20,
  "downloadDuration": 1234
}
```

### 15 Cities with XML Coverage

Map each city to nearest station for hybrid fallback:

```typescript
export const CITIES = [
  { 
    id: 'jerusalem', 
    name: 'Jerusalem', 
    nameHebrew: 'ירושלים',
    location: { latitude: 31.7683, longitude: 35.2137 }
  },
  { 
    id: 'telaviv', 
    name: 'Tel Aviv', 
    nameHebrew: 'תל אביב',
    location: { latitude: 32.0853, longitude: 34.7818 }
  },
  // ... 13 more cities
];
```

Complete list:
1. Jerusalem, 2. Tel Aviv, 3. Haifa, 4. Beer Sheva, 5. Eilat,
6. Tiberias, 7. Nazareth, 8. Afula, 9. Beit Dagan, 10. Zefat,
11. Lod, 12. Dimona, 13. Yotvata, 14. Dead Sea, 15. Mitzpe Ramon

### Hybrid Forecast Flow

**Critical logic for /api/forecast endpoint**:

```typescript
// 1. Find nearest city to station
const nearestCity = findNearestCity(station.location);

// 2. Try XML forecast first
const xmlDownloadDir = xmlDataManager.getMostRecentDownloadDir();
if (xmlDownloadDir) {
  const cityForecasts = await xmlParser.getCityForecast(nearestCity.id, xmlDownloadDir);
  if (cityForecasts && cityForecasts.length > 0) {
    // Success! Parse and return
    const forecast = forecastAdapter.formatForecastResponse(cityForecasts, period);
    return { forecast, source: 'xml', city: nearestCity };
  }
}

// 3. Fallback to station API
const stationData = await imsApi.getStationDataMultiChannel(stationId, channels, from, to);
if (stationData && stationData.length > 0) {
  const forecast = aggregateData(stationData, period);
  if (forecast.length >= minimumRequired) {
    return { forecast, source: 'station' };
  }
}

// 4. Generate synthetic fallback
const fallbackForecast = generateFallbackForecast(from, to, baseTemp);
return { forecast: fallbackForecast, source: 'fallback' };
```

### XML Parsing Strategy

**RSS Format**: IMS uses standard RSS 2.0 format with forecasts in item descriptions.

**Parsing Steps**:
1. Use xml2js to parse XML to JSON
2. Extract channel.item array
3. Each item has title, description, pubDate
4. Parse description text with regex to extract:
   - Temperature ranges (e.g., "22-28°C")
   - Wind speed/direction (e.g., "NW 15-25 km/h")
   - Humidity (e.g., "60-80%")
   - Rain probability (e.g., "20%")

**Regex Patterns**:
```typescript
const tempRegex = /(\d+)-(\d+)°C/;
const windRegex = /([A-Z]{1,2})\s+(\d+)-(\d+)/;
const humidityRegex = /(\d+)-(\d+)%/;
```

**Handle Both Languages**: Forecasts may be in Hebrew or English. Use regex that works for both:
```typescript
const tempRegex = /(\d+)[-–](\d+)\s*[°]?\s*C/i;  // Handles °C, C, and Hebrew
```

---

## Project Structure

### Directory Layout

```
meteorologic/
├── src/                              # TypeScript backend source
│   ├── server.ts                    # Main Express app (routes, middleware, cron)
│   ├── cache.ts                     # 2-level caching implementation
│   ├── imsApi.ts                    # IMS API client (stations, data)
│   ├── utils.ts                     # Utilities (date ranges, distance, aggregation)
│   ├── config.ts                    # Environment config loader
│   ├── cityStationMapping.ts       # 15 cities + nearest city finder
│   ├── xmlDownloader.ts            # Download all XML feeds
│   ├── xmlParser.ts                # Parse RSS XML to JSON
│   ├── xmlDataManager.ts           # Manage XML lifecycle (cleanup, freshness)
│   ├── forecastAdapter.ts          # Extract structured data from forecast text
│   ├── fallbackForecast.ts         # Generate synthetic forecasts
│   └── types/
│       └── environment.d.ts        # Ambient TypeScript types
│
├── public/                          # Frontend static files
│   ├── index.html                  # Single page application
│   ├── css/
│   │   └── style.css               # All styles (glass-morphism, animations)
│   └── js/
│       └── app.js                  # Vanilla JavaScript (AJAX, DOM manipulation)
│
├── scripts/
│   └── download-xml-feeds.ts       # CLI tool: npm run download-xml
│
├── tests/                           # Jest test suite
│   ├── unit/                       # Unit tests for individual functions
│   │   ├── cache.test.ts
│   │   ├── utils.test.ts
│   │   └── fallbackForecast.test.ts
│   ├── integration/                # API integration tests
│   │   └── api.test.ts
│   └── mocks/                      # Test fixtures and mocks
│       ├── imsApi.mock.ts
│       ├── forecast.mock.ts
│       └── sample-xml/
│
├── data/                            # XML downloads (gitignored)
│   └── YYYY-MM-DD/HH-MM-SS/...
│
├── .cache/                          # File-based cache (gitignored)
│   ├── stations_list.json
│   └── forecast_*.json
│
├── dist/                            # Compiled JavaScript (gitignored)
│   ├── server.js
│   ├── cache.js
│   └── ...
│
├── docs/                            # Documentation
│   ├── api/
│   │   ├── API.md
│   │   ├── internal-api.yaml
│   │   └── swagger.yaml
│   └── ...
│
├── .env.example                     # Environment template (committed)
├── .env                            # Actual secrets (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

### TypeScript Configuration

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "types": ["node", "jest"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "public"]
}
```

**Key Settings**:
- `strict: true` - Enable all strict type checking
- `esModuleInterop: true` - Allow default imports from CommonJS
- `sourceMap: true` - Generate source maps for debugging
- `declaration: true` - Generate .d.ts files

### Dependencies

**package.json** (production):
```json
{
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "node-cron": "^4.2.1",
    "node-fetch": "^2.7.0",
    "xml2js": "^0.6.2"
  }
}
```

**package.json** (development):
```json
{
  "devDependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/jest": "^30.0.0",
    "@types/node": "^25.2.0",
    "@types/node-cron": "^3.0.11",
    "@types/node-fetch": "^2.6.13",
    "@types/xml2js": "^0.4.14",
    "jest": "^30.2.0",
    "nodemon": "^3.1.11",
    "supertest": "^7.2.2",
    "ts-jest": "^29.4.6",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.3"
  }
}
```

### NPM Scripts

```json
{
  "scripts": {
    "start": "node dist/server.js",
    "dev": "ts-node src/server.ts",
    "dev:watch": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "clean": "rm -rf dist",
    "prebuild": "npm run clean",
    "download-xml": "ts-node scripts/download-xml-feeds.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration"
  }
}
```

---

## UI Design Specification

### HTML Structure

**Single Page Application** with semantic sections:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Israel Weather Forecast</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <h1>🌤️ Israel Weather Forecast</h1>
            <p class="subtitle">Real-time weather data from IMS stations</p>
        </header>

        <!-- Location Selection Card -->
        <div class="card location-card">
            <h2>📍 Select Your Location</h2>
            <button id="detectLocationBtn">Detect My Location</button>
            <div class="manual-input">
                <input type="number" id="latInput" placeholder="Latitude">
                <input type="number" id="lonInput" placeholder="Longitude">
                <button id="manualLocationBtn">Find Station</button>
            </div>
        </div>

        <!-- Date Range Selector -->
        <div class="card date-range-card">
            <h2>📅 Select Time Period</h2>
            <div class="date-range-buttons">
                <button class="range-btn active" data-period="today">Today</button>
                <button class="range-btn" data-period="week">This Week</button>
                <button class="range-btn" data-period="month">This Month</button>
            </div>
        </div>

        <!-- Weather Display Card -->
        <div id="weatherCard" class="card weather-card hidden">
            <!-- Loading State -->
            <div class="weather-loading">
                <div class="spinner"></div>
                <p>Loading weather data...</p>
            </div>

            <!-- Content -->
            <div class="weather-content hidden">
                <!-- Station Info -->
                <div class="station-info">
                    <h2 id="stationName">Station Name</h2>
                    <p id="stationLocation">Location</p>
                    <span class="distance-badge" id="distanceBadge"></span>
                </div>

                <!-- Main Temperature -->
                <div class="temperature-hero">
                    <span id="currentTemp">--</span>
                    <span class="temp-unit">°C</span>
                </div>

                <!-- Weather Metrics Grid -->
                <div class="weather-grid">
                    <div class="weather-metric">
                        <div class="metric-icon">💧</div>
                        <div class="metric-label">Humidity</div>
                        <div class="metric-value" id="humidity">--</div>
                    </div>
                    <div class="weather-metric">
                        <div class="metric-icon">💨</div>
                        <div class="metric-label">Wind Speed</div>
                        <div class="metric-value" id="windSpeed">--</div>
                    </div>
                    <!-- More metrics... -->
                </div>

                <!-- Data Source Indicator -->
                <div class="weather-footer">
                    <p class="data-source">
                        <span class="data-source-badge" id="dataSource">--</span>
                    </p>
                </div>
            </div>

            <!-- Forecast Table -->
            <div id="forecastSection" class="forecast-section hidden">
                <h3>📈 Forecast</h3>
                <div class="forecast-table-container">
                    <table class="forecast-table">
                        <thead id="forecastTableHead"></thead>
                        <tbody id="forecastTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Error Toast -->
        <div id="errorToast" class="toast hidden">
            <span class="toast-icon">⚠️</span>
            <span id="errorMessage"></span>
            <button class="toast-close">×</button>
        </div>
    </div>

    <script src="js/app.js"></script>
</body>
</html>
```

### CSS Architecture

**Glass-Morphism Cards**:
```css
.card {
    background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.8),
        rgba(255, 255, 255, 0.4)
    );
    backdrop-filter: blur(10px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    padding: 30px;
    margin-bottom: 20px;
}
```

**Animated Gradient Background**:
```css
body {
    background: linear-gradient(
        135deg,
        #667eea 0%,
        #764ba2 100%
    );
    animation: gradientShift 15s ease infinite;
    background-size: 200% 200%;
}

@keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}
```

**Loading Spinner**:
```css
.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
```

**Data Source Badges**:
```css
.data-source-badge {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.data-source-badge.xml {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.data-source-badge.observation {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
}

.data-source-badge.fallback {
    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    color: #333;
}
```

**Forecast Table Scrolling** (6 rows visible):
```css
.forecast-table-container {
    overflow-x: auto;
    overflow-y: auto;
    max-height: 375px; /* Header (~45px) + 6 rows (~55px each) */
    border-radius: 12px;
}

.forecast-table thead {
    position: sticky;
    top: 0;
    z-index: 10;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
}
```

**Responsive Design**:
```css
@media (max-width: 768px) {
    .container {
        padding: 10px;
    }
    
    .card {
        padding: 20px;
    }
    
    .weather-grid {
        grid-template-columns: 1fr 1fr; /* 2 columns on mobile */
    }
    
    .temperature-hero {
        font-size: 3rem; /* Smaller on mobile */
    }
}
```

### JavaScript Architecture

**Key Functions**:

```javascript
// Initialize app
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    loadFromLocalStorage();
    setupEventListeners();
    if (savedStation) {
        fetchWeatherData(savedStation.stationId);
    }
}

// Location detection
async function detectLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation not supported');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            await findNearestStation(latitude, longitude);
        },
        (error) => {
            showError('Location access denied. Try manual entry.');
        }
    );
}

// Find nearest station
async function findNearestStation(lat, lon) {
    const response = await fetch(`/api/nearest-station?lat=${lat}&lon=${lon}`);
    const data = await response.json();
    
    currentStation = data.station;
    localStorage.setItem('station', JSON.stringify(currentStation));
    
    await fetchWeatherData(data.station.stationId);
}

// Fetch weather data
async function fetchWeatherData(stationId) {
    showLoading();
    
    try {
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`/api/station-data?stationId=${stationId}&period=${currentPeriod}`),
            fetch(`/api/forecast?stationId=${stationId}&period=${currentPeriod}`)
        ]);
        
        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();
        
        displayWeatherData(currentData);
        displayForecast(forecastData.forecast, forecastData.period);
        displayDataSource(forecastData.source);
        
        hideLoading();
    } catch (error) {
        showError('Failed to fetch weather data');
    }
}

// Display data source indicator
function displayDataSource(source) {
    const badge = document.getElementById('dataSource');
    
    switch (source) {
        case 'xml':
            badge.textContent = '📡 XML Forecast';
            badge.className = 'data-source-badge xml';
            break;
        case 'station':
            badge.textContent = '📊 Station Observation';
            badge.className = 'data-source-badge observation';
            break;
        case 'fallback':
            badge.textContent = '🔮 Generated Forecast';
            badge.className = 'data-source-badge fallback';
            break;
    }
}

// Haversine distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
```

---

## Testing Strategy

### Unit Tests

Test individual functions in isolation:

**Cache Tests** (`tests/unit/cache.test.ts`):
```typescript
describe('Cache', () => {
    test('should store and retrieve from memory cache', async () => {
        const data = { test: 'data' };
        await cache.set('test_key', data);
        const retrieved = await cache.get('test_key');
        expect(retrieved).toEqual(data);
    });
    
    test('should expire old cache entries', async () => {
        await cache.set('test_key', { test: 'data' }, 100); // 100ms TTL
        await sleep(150);
        const retrieved = await cache.get('test_key');
        expect(retrieved).toBeNull();
    });
});
```

**Utils Tests** (`tests/unit/utils.test.ts`):
```typescript
describe('Date Ranges', () => {
    test('getDateRange should return backward dates', () => {
        const range = utils.getDateRange('week');
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        expect(range.to).toBe(formatDate(today));
        expect(range.from).toBe(formatDate(weekAgo));
    });
    
    test('getForecastDateRange should return forward dates', () => {
        const range = utils.getForecastDateRange('week');
        const today = new Date();
        const weekAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        expect(range.from).toBe(formatDate(today));
        expect(range.to).toBe(formatDate(weekAhead));
    });
});

describe('Distance Calculation', () => {
    test('should calculate distance between two points', () => {
        const distance = utils.calculateDistance(32.0853, 34.7818, 31.7683, 35.2137);
        expect(distance).toBeGreaterThan(50); // Tel Aviv to Jerusalem ~60km
        expect(distance).toBeLessThan(70);
    });
});
```

**Fallback Forecast Tests** (`tests/unit/fallbackForecast.test.ts`):
```typescript
describe('Fallback Forecast Generator', () => {
    test('should generate daily forecasts for date range', () => {
        const forecasts = generateFallbackDailyForecast('2024-01-01', '2024-01-07');
        expect(forecasts).toHaveLength(7);
        expect(forecasts[0]).toHaveProperty('date');
        expect(forecasts[0]).toHaveProperty('tempMin');
        expect(forecasts[0]).toHaveProperty('tempMax');
    });
    
    test('should have realistic temperature ranges', () => {
        const forecasts = generateFallbackDailyForecast('2024-01-01', '2024-01-01', 20);
        const tempMin = parseFloat(forecasts[0].tempMin);
        const tempMax = parseFloat(forecasts[0].tempMax);
        
        expect(tempMax).toBeGreaterThan(tempMin);
        expect(tempMax - tempMin).toBeGreaterThan(5);
        expect(tempMax - tempMin).toBeLessThan(15);
    });
});
```

### Integration Tests

Test API endpoints end-to-end:

**API Tests** (`tests/integration/api.test.ts`):
```typescript
import request from 'supertest';
import app from '../src/server';

describe('API Endpoints', () => {
    test('GET /api/stations should return stations list', async () => {
        const response = await request(app).get('/api/stations');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });
    
    test('GET /api/nearest-station should validate coordinates', async () => {
        const response = await request(app).get('/api/nearest-station?lat=200&lon=34');
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Latitude');
    });
    
    test('GET /api/forecast should return forecast data', async () => {
        const response = await request(app).get('/api/forecast?stationId=178&period=today');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('forecast');
        expect(response.body).toHaveProperty('source');
        expect(['xml', 'station', 'fallback']).toContain(response.body.source);
    });
});
```

### Test Mocking

**Mock IMS API** to avoid real calls during tests:

```typescript
// tests/mocks/imsApi.mock.ts
export const mockStations = [
    {
        stationId: 178,
        name: 'Jerusalem Centre',
        location: { latitude: 31.7683, longitude: 35.2137 }
    }
];

export const mockStationData = {
    stationId: 178,
    channelId: 1,
    data: [
        {
            datetime: '2024-01-01T12:00:00',
            channels: [{ value: 22.5, status: 'valid', valid: true }]
        }
    ]
};

jest.mock('../src/imsApi', () => ({
    getStations: jest.fn().mockResolvedValue(mockStations),
    getStationData: jest.fn().mockResolvedValue(mockStationData)
}));
```

**Mock XML Files** for parsing tests:

```xml
<!-- tests/mocks/sample-xml/forecast_jerusalem.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>Jerusalem Forecast</title>
        <item>
            <title>January 1, 2024</title>
            <description>Temperature: 18-25°C, Wind: NW 10-15 km/h, Humidity: 60%</description>
            <pubDate>Mon, 01 Jan 2024 06:00:00 GMT</pubDate>
        </item>
    </channel>
</rss>
```

### Jest Configuration

**jest.config.js**:
```javascript
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/types/**'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};
```

---

## Error Handling

### API Error Responses

Always include helpful information:

```typescript
// Good error response
{
    "error": "Invalid station ID",
    "details": "Station ID must be a valid number",
    "validExample": "?stationId=178"
}

// Bad error response
{
    "error": "Bad request"  // Not helpful!
}
```

### Client-Side Error Handling

```javascript
async function fetchWithErrorHandling(url) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        // Network error or parsing error
        showError(`Failed to fetch data: ${error.message}`);
        
        // Try to use cached data if available
        const cached = tryGetCachedData(url);
        if (cached) {
            showWarning('Using cached data due to network error');
            return cached;
        }
        
        throw error;
    }
}
```

### Logging Best Practices

```typescript
// Startup logging
console.log('🚀 Server starting...');
console.log(`📡 IMS API Token: ${config.IMS_API_TOKEN ? '✓ Configured' : '✗ Missing'}`);
console.log(`🌐 Port: ${config.PORT}`);
console.log(`🔒 CORS Origins: ${config.ALLOWED_ORIGINS}`);

// Cache logging
console.log('💾 Cache hit:', cacheKey);
console.log('🔄 Cache miss, fetching:', cacheKey);

// XML logging
console.log('📥 Downloading XML feeds...');
console.log(`✓ Downloaded ${fileCount} files in ${duration}ms`);

// Error logging (without secrets)
console.error('❌ IMS API error:', error.message);
console.error('❌ XML parse error:', error.message);

// NEVER log sensitive data
console.log('Token:', token); // ❌ BAD
console.log('Token:', token ? 'SET' : 'MISSING'); // ✓ GOOD
```

---

## Performance Optimization

### Caching Strategy

- Memory cache: First line of defense, sub-millisecond access
- File cache: Persistent across restarts, ~10ms access
- API calls: Last resort, 100-500ms latency

**Minimize API calls**:
```typescript
// Bad: Fetch each channel separately
for (const channelId of channels) {
    await fetch(`/api/data/${channelId}`); // 10 serial requests = 5 seconds
}

// Good: Fetch in parallel
const promises = channels.map(id => fetch(`/api/data/${id}`));
const results = await Promise.all(promises); // 10 parallel requests = 500ms
```

### Frontend Performance

**Minimize DOM Manipulation**:
```javascript
// Bad: Update DOM in loop
for (const item of data) {
    table.innerHTML += `<tr><td>${item.value}</td></tr>`; // Reflows on every iteration
}

// Good: Build string, update once
const rows = data.map(item => `<tr><td>${item.value}</td></tr>`).join('');
table.innerHTML = rows; // Single reflow
```

**Debounce User Input**:
```javascript
let debounceTimer;
function onLocationInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        validateAndFindStation();
    }, 500); // Wait 500ms after user stops typing
}
```

### Database-Free Architecture

This app intentionally avoids databases:
- Caching handles persistence needs
- XML files provide data storage
- No complex queries needed
- Simpler deployment (no DB setup)
- Lower operational cost

---

## Deployment

### Environment Setup

**Production checklist**:
```bash
# 1. Set environment variables
export NODE_ENV=production
export IMS_API_TOKEN=your-real-token
export PORT=3000
export ALLOWED_ORIGINS=https://yourdomain.com

# 2. Build TypeScript
npm run build

# 3. Start server
npm start

# Or use PM2 for process management
pm2 start dist/server.js --name weather-app
pm2 save
pm2 startup
```

### Process Management (PM2)

**ecosystem.config.js**:
```javascript
module.exports = {
    apps: [{
        name: 'meteorologic',
        script: './dist/server.js',
        instances: 2,
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        error_file: './logs/error.log',
        out_file: './logs/output.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }]
};
```

### Health Monitoring

**Health Check Endpoint**:
```typescript
app.get('/api/health', async (req, res) => {
    const xmlStatus = xmlDataManager.getDataStatus();
    const cacheStats = await cache.getStats();
    
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        xml: {
            available: !!xmlStatus,
            age: xmlStatus?.age,
            fileCount: xmlStatus?.fileCount
        },
        cache: {
            memoryEntries: cacheStats.memory.entries,
            fileEntries: cacheStats.file.entries,
            sizeMB: cacheStats.file.sizeMB
        }
    });
});
```

### Nginx Configuration (Optional)

```nginx
server {
    listen 80;
    server_name weather.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Git & Version Control

### .gitignore

```gitignore
# Environment
.env

# Dependencies
node_modules/

# Build
dist/

# Cache
.cache/

# Data
data/

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Tests
coverage/
.nyc_output/
```

### Commit Message Convention

Use conventional commits format:

```
feat: add data source indicator badges
fix: correct date range for station observations
docs: update API documentation
test: add cache expiration tests
refactor: extract forecast adapter logic
perf: implement parallel channel fetching
chore: update dependencies
```

---

## Implementation Checklist

### Phase 1: Foundation

- [ ] Initialize npm project
- [ ] Install dependencies (production + dev)
- [ ] Configure TypeScript (tsconfig.json)
- [ ] Set up project structure (src/, public/, tests/)
- [ ] Create .env.example and .gitignore
- [ ] Configure Jest for testing

### Phase 2: Core Backend

- [ ] Implement config.ts (environment loading)
- [ ] Build cache.ts (2-level caching)
- [ ] Create imsApi.ts (API client with types)
- [ ] Implement utils.ts (date ranges, distance, aggregation)
- [ ] Set up Express server basics

### Phase 3: API Endpoints

- [ ] GET /api/stations (with caching)
- [ ] GET /api/nearest-station (with validation)
- [ ] GET /api/station-data (backward dates, caching)
- [ ] DELETE /api/cache
- [ ] GET /api/health

### Phase 4: XML Integration

- [ ] Create cityStationMapping.ts (15 cities)
- [ ] Build xmlDownloader.ts (download all feeds)
- [ ] Implement xmlParser.ts (parse RSS)
- [ ] Create xmlDataManager.ts (lifecycle management)
- [ ] Build forecastAdapter.ts (extract structured data)
- [ ] Set up cron jobs (every 6 hours)

### Phase 5: Hybrid Forecast

- [ ] Implement GET /api/forecast (hybrid logic)
- [ ] Create fallbackForecast.ts (synthetic data)
- [ ] Test XML → Station → Fallback flow
- [ ] Add source field to responses

### Phase 6: Frontend

- [ ] Create index.html structure
- [ ] Build style.css (glass-morphism, animations)
- [ ] Implement app.js (vanilla JS)
- [ ] Add geolocation functionality
- [ ] Create weather display components
- [ ] Add forecast table with scrolling
- [ ] Implement data source badges
- [ ] Add localStorage persistence

### Phase 7: Security & Validation

- [ ] Add input validation to all endpoints
- [ ] Configure CORS properly
- [ ] Secure admin endpoints (dev only)
- [ ] Test with invalid inputs
- [ ] Ensure no secrets in errors

### Phase 8: Testing

- [ ] Write unit tests (cache, utils, fallback)
- [ ] Write integration tests (API endpoints)
- [ ] Create mocks (IMS API, XML files)
- [ ] Achieve >80% coverage
- [ ] Test error scenarios

### Phase 9: Documentation

- [ ] Write comprehensive README.md
- [ ] Document all API endpoints
- [ ] Add code comments (JSDoc)
- [ ] Create troubleshooting guide
- [ ] Document deployment process

### Phase 10: Polish

- [ ] Test responsive design
- [ ] Verify animations and transitions
- [ ] Check error handling flow
- [ ] Test cache performance
- [ ] Load test with multiple requests
- [ ] Final security review

---

## Success Criteria

Your implementation is complete when:

1. ✅ TypeScript compiles with zero errors
2. ✅ All Jest tests pass (>80% coverage)
3. ✅ API returns data from all three sources (XML, Station, Fallback)
4. ✅ UI is responsive on mobile, tablet, desktop
5. ✅ Data source badges show correct source
6. ✅ Caching reduces API calls significantly
7. ✅ Input validation prevents all injection attacks
8. ✅ Admin endpoints disabled in production
9. ✅ No secrets committed to git
10. ✅ Documentation is complete and accurate
11. ✅ App gracefully handles all error scenarios
12. ✅ Location detection and manual entry both work
13. ✅ Forecast table scrolls properly (6 rows visible)
14. ✅ localStorage persists user selections
15. ✅ Health endpoint reports system status

---

## Key Principles to Remember

1. **Always validate inputs** - Never trust user data
2. **Cache aggressively** - Minimize external API calls
3. **Fail gracefully** - Always show something to the user
4. **Type everything** - Use TypeScript properly
5. **Keep it simple** - Vanilla JS, no framework bloat
6. **Security first** - CORS, validation, secret management
7. **Test thoroughly** - Unit + integration tests
8. **Document clearly** - Code comments + README
9. **Monitor actively** - Health checks, logging
10. **Deploy safely** - Environment-specific configs

---

## Troubleshooting Guide

### Common Issues

**"IMS API Token Invalid"**:
- Check .env file exists
- Verify IMS_API_TOKEN is set correctly
- Test token at https://ims.gov.il/en/ObservationDataAPI

**"XML Data Not Found"**:
- Run `npm run download-xml` manually
- Check data/ directory exists and has files
- Verify cron job is running
- Check XML URLs are correct (they may change)

**"CORS Error in Browser"**:
- Verify ALLOWED_ORIGINS includes your domain
- Check NODE_ENV is set correctly
- Restart server after .env changes

**"Port Already in Use"**:
- Check if another process is using the port
- Change PORT in .env
- Kill existing Node processes: `pkill node`

**"Cache Not Working"**:
- Check .cache/ directory exists and is writable
- Verify cache keys are generated correctly
- Clear cache: `DELETE /api/cache`

**"Forecast Always Shows Fallback"**:
- Check XML files were downloaded
- Verify nearest city logic
- Check XML parsing isn't failing
- Review server logs for errors

---

## Additional Resources

**IMS API Documentation**:
- Main site: https://ims.gov.il/en/ObservationDataAPI
- Register for API token
- API limits: Check rate limiting

**XML Feeds**:
- Feed list: https://ims.gov.il/en/CurrentDataXML
- Update frequency: Twice daily (morning, evening)
- Format: RSS 2.0 standard

**TypeScript Resources**:
- Official docs: https://www.typescriptlang.org/docs/
- Strict mode guide
- Type inference best practices

**Testing Resources**:
- Jest documentation: https://jestjs.io/
- Supertest for HTTP testing
- ts-jest for TypeScript

---

## Final Notes

This specification provides everything needed to build a production-ready weather application. Follow the implementation checklist in order, test thoroughly at each phase, and refer back to specific sections as needed.

The application prioritizes:
- **User Experience**: Beautiful UI, smooth interactions, always shows data
- **Reliability**: Multiple data sources, caching, fallbacks
- **Security**: Input validation, CORS, secret management
- **Performance**: 2-level caching, parallel requests, optimized frontend
- **Maintainability**: TypeScript, tests, documentation, clear structure

Build with care, test thoroughly, and create something users will love! 🌤️
