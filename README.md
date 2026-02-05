# 🌤️ Israel Weather Forecast Application

A beautiful, modern weather forecast application that displays real-time weather data from the Israel Meteorological Service (IMS) API.

## Features

- 📍 **Automatic Location Detection** - Uses browser geolocation to find your position
- 🎯 **Nearest Station Finder** - Automatically finds the closest IMS weather station
- 📅 **Flexible Time Ranges** - View weather for today, this week, or this month
- 🎨 **Modern UI** - Beautiful gradient backgrounds, smooth animations, and glass-morphism effects
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- 🌡️ **Comprehensive Weather Data** - Temperature, humidity, wind speed/direction, and rainfall
- 📈 **Detailed Forecasts**:
  - **Today**: Hourly forecast for the last 24 hours
  - **This Week/Month**: Daily min/max summary for each day

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- IMS API Token

## Installation

1. **Clone or navigate to the project directory**

```bash
cd /Users/davidlevy/Projects/meteorologic
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure API Token**

Copy the example environment file and add your IMS API token:

```bash
cp .env.example .env
```

Then edit `.env` and replace `your-ims-api-token-here` with your actual API token:

```
IMS_API_TOKEN=your-actual-token-here
PORT=3000
```

**⚠️ Never commit the `.env` file - it contains secrets!**

## Usage

1. **Start the server**

```bash
npm start
```

2. **Open your browser**

Navigate to: `http://localhost:3000`

3. **Use the application**

   - Click "Detect My Location" to automatically find your nearest weather station
   - Or manually enter latitude and longitude coordinates
   - Select your desired time period (Today, This Week, This Month)
   - View current weather conditions at the top
   - Scroll down to see the detailed forecast:
     - **Today**: Hourly data for the last 24 hours
     - **Week/Month**: Daily min/max temperatures and weather metrics

## Documentation

Comprehensive documentation is organized in the `docs/` folder:

- **[API Documentation](docs/api/)** - IMS API integration, OpenAPI/Swagger specifications
- **[Architecture](docs/architecture/)** - System design, caching, and TypeScript conversion
- **[Features](docs/features/)** - Feature implementation guides and testing
- **[History](docs/history/)** - Development history, fixes, and project summaries

## Project Structure

```
meteorologic/
├── src/                     # Server-side TypeScript code
│   ├── server.ts           # Express server with API routes
│   ├── cache.ts            # 2-level caching system (memory + file)
│   ├── imsApi.ts           # IMS API client
│   ├── utils.ts            # Utility functions
│   └── types/              # TypeScript type definitions
├── dist/                    # Compiled JavaScript (production)
├── public/                  # Frontend files (static assets)
│   ├── index.html          # Main HTML file
│   ├── css/
│   │   └── style.css       # Styling with animations
│   └── js/
│       └── app.js          # Frontend logic and AJAX calls
├── docs/                    # Documentation
│   ├── api/                # API documentation and Swagger specs
│   ├── architecture/       # System design and technical docs
│   ├── features/           # Feature implementation guides
│   └── history/            # Development history and fixes
├── examples/                # Example files
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── .env.example             # Environment template (safe to commit)
├── .env                     # Configuration (NOT in git - contains secrets)
└── README.md                # This file
```

## API Documentation

### Application Endpoints

The server provides the following API endpoints:

- `GET /api/stations` - Get all available weather stations (cached 48h)
- `GET /api/nearest-station?lat=X&lon=Y` - Find nearest station to coordinates
- `GET /api/station-data?stationId=X&period=Y` - Get raw weather data for a station
- `GET /api/forecast?stationId=X&period=Y` - Get aggregated forecast data (cached 24h)
- `GET /api/cache/stats` - Get cache statistics
- `POST /api/cache/clear` - Clear all caches
- `GET /api/health` - Health check endpoint

### IMS API Documentation

Comprehensive documentation is available in the `docs/api/` folder:

- **[`docs/api/API.md`](docs/api/API.md)** - Complete IMS API reference in English (translated from Hebrew PDF)
- **[`docs/api/swagger.yaml`](docs/api/swagger.yaml)** - OpenAPI 3.0 specification for the IMS API
  - View in Swagger Editor: https://editor.swagger.io/
  - Import to Postman for testing
  - Generate client SDKs in 50+ languages
  - See [`docs/api/SWAGGER_README.md`](docs/api/SWAGGER_README.md) for quick start guide
  - See [`docs/api/SWAGGER_USAGE.md`](docs/api/SWAGGER_USAGE.md) for detailed usage instructions

## Technology Stack

- **Backend**: Node.js, Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **API**: Israel Meteorological Service (IMS) API
- **Design**: Modern gradient UI with glass-morphism effects

## Features in Detail

### Location Detection
- Browser-based geolocation API
- Fallback to manual coordinate entry
- Haversine formula for accurate distance calculation

### Weather Metrics
- **Temperature** (Channel 1) - Displayed in Celsius
- **Humidity** (Channel 2) - Relative humidity percentage
- **Wind Speed** (Channel 3) - Measured in m/s
- **Wind Direction** (Channel 4) - Compass direction and degrees
- **Rainfall** (Channel 5) - Precipitation in mm

### UI/UX
- Smooth fade-in animations
- Loading states with elegant spinners
- Error handling with user-friendly messages
- Responsive design for all screen sizes
- Glass-morphism cards with backdrop blur
- Gradient backgrounds with subtle animations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Requires JavaScript enabled and geolocation API support for automatic location detection.

## Troubleshooting

### Location Detection Fails
- Ensure browser permissions for location are enabled
- Try using manual coordinate entry as a fallback

### No Weather Data
- Verify the API token is correctly configured in `.env`
- Check that the selected station has active sensors
- Try a different time period

### Server Won't Start
- Ensure port 3000 is not already in use
- Check that all dependencies are installed (`npm install`)
- Verify Node.js version is 14 or higher

## License

ISC

## Author

Created for meteorological data visualization using the Israel Meteorological Service API.
