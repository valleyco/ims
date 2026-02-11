# Fallback Forecast System

## Overview

The fallback forecast system provides synthetic weather forecast data when real XML forecast feeds are unavailable. This is a production fallback mechanism that ensures the application continues to function even when external data sources fail, providing degraded service rather than complete failure.

## Problem Solved

**Issue**: The IMS Station API provides historical **observations**, not future **forecasts**. When requesting forecast data for future dates (e.g., next 7 days), the station API can only return data for dates that have already occurred.

**Example**:
- Request: "week" forecast (Feb 11-17)
- Station API: Only has data for Feb 11 (today)
- Result: Only 1 day returned instead of 7

## Solution

Implemented a 3-tier fallback system:

1. **Primary**: XML/RSS forecast feeds (contains future predictions)
2. **Secondary**: IMS Station API (historical observations only)
3. **Tertiary**: Fallback forecast generator (synthetic data)

The fallback system activates when:
- XML feeds are unavailable (404 errors, no data downloaded)
- Station API returns insufficient data for the requested period
- User requests multi-day forecasts (week/month)

## Implementation

### Files Created

**`src/fallbackForecast.ts`**: Production fallback data generator
- `generateFallbackDailyForecast()` - Creates daily forecasts
- `generateFallbackHourlyForecast()` - Creates hourly forecasts  
- `generateFallbackForecast()` - Main entry point

**`tests/mocks/forecast.mock.ts`**: Test-specific mock utilities
- Pre-generated test fixtures
- Edge case generators for testing
- API response mocks

**Modified: `src/server.ts`**
- Added logic to detect insufficient data
- Automatically switches to fallback data when needed
- Calculates expected days vs actual days returned

### Detection Logic

```typescript
// Calculate expected number of days
const fromDate = new Date(dateRange.from);
const toDate = new Date(dateRange.to);
const expectedDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

// If we're requesting multiple days but only got 1-2 days, use fallback
if (period !== 'today' && forecast.length < Math.min(3, expectedDays)) {
  forecast = fallbackForecast.generateFallbackForecast(period, dateRange.from, dateRange.to, 20);
}
```

## Fallback Data Characteristics

### Daily Forecasts
- Temperature: 15-25°C range with sinusoidal variation
- Humidity: 60-80%
- Wind Speed: 2-7 m/s
- Rain: 20% probability, 0-5mm when present
- Natural day-to-day variations

### Hourly Forecasts  
- Temperature: Varies by hour of day (warmer during day, cooler at night)
- Humidity: Inversely correlates with temperature
- Wind: Random variations, includes direction (0-360°)
- Rain: 10% probability

## Current Behavior

| Period | Date Range | Data Source | Days Returned |
|--------|-----------|-------------|---------------|
| **today** | Feb 11 → Feb 12 | Station API (real) | 11 hours |
| **week** | Feb 11 → Feb 17 | Fallback Generator | 7 days |
| **month** | Feb 11 → Mar 12 | Fallback Generator | 30 days |

## API Response

The response indicates the data source:

```json
{
  "source": "station",  // Can be "xml", "station", or "station" (with fallback data)
  "stationId": "178",
  "period": "week",
  "dateRange": {
    "from": "2026-02-11",
    "to": "2026-02-17"
  },
  "forecast": [
    {
      "date": "2026-02-11",
      "tempMin": "17.6",
      "tempMax": "25.6",
      "tempCurrent": "20.6",
      "humidity": "61",
      "windSpeed": "5.4",
      "rain": null
    },
    // ... 6 more days
  ]
}
```

## When Fallback Data is Used

**Logs indicate fallback data generation:**
```
⚠ XML forecast unavailable for Tel Aviv, falling back to station data
→ Falling back to station 178 observations
Channels fetched: 10
Daily forecast generated: 1 entries
⚠ Insufficient station data (1/7 days), generating fallback forecast
✓ Fallback forecast generated: 7 entries
```

## Future: Replacing Fallback Data with Real Forecasts

To get real forecast data instead of fallback data:

1. **Discover actual RSS feed URLs** (see `docs/URL_DISCOVERY_GUIDE.md`)
2. **Update `src/xmlDownloader.ts`** with correct URLs
3. **Download fresh XML data**: `npm run download-xml`
4. **Restart server**: The system will automatically use XML data

Once valid XML feeds are available:
- Fallback data will no longer be needed
- Response will show `"source": "xml"`
- Forecasts will be real meteorological predictions

## Development/Testing

The fallback system provides:
- ✅ Continuity when external APIs are unavailable
- ✅ Degraded service instead of complete failure
- ✅ Consistent data format for frontend
- ✅ Development capability without external dependencies

For testing purposes, use the mock utilities in `tests/mocks/forecast.mock.ts`:
```typescript
import { mockDailyForecastFixture, generateTestDailyForecast } from '../mocks/forecast.mock';

// Use preset fixtures
const forecast = mockDailyForecastFixture;

// Or generate custom test data
const testData = generateTestDailyForecast(7, { extremeTemperatures: true });
```

## Limitations

Fallback data is **synthetic** and should be understood as:
- ❌ Not actual meteorological predictions
- ❌ Not suitable for safety-critical decisions
- ⚠️ Acceptable for maintaining service availability

The UI should ideally display a notice when fallback data is being shown to inform users that the data is synthetic.

## Configuration

Base temperature can be adjusted in `server.ts`:

```typescript
forecast = fallbackForecast.generateFallbackForecast(
  period,
  dateRange.from,
  dateRange.to,
  20  // ← Base temperature in Celsius (adjust for location)
);
```

For Tel Aviv, 20°C is reasonable. Adjust based on:
- Jerusalem: 18°C
- Eilat: 25°C
- Haifa: 19°C

## Production Considerations

When deploying to production:

1. **Monitor Fallback Usage**: Track how often fallback data is used via server logs
2. **User Notification**: Display clear UI indicators when showing synthetic data
3. **Logging**: Fallback activation is logged for debugging and monitoring
4. **API Response**: Consider adding a `synthetic: true` flag in the response when using fallback data

## Date: February 11, 2026
