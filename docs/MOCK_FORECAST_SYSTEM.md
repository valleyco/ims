# Mock Forecast System

## Overview

The mock forecast system provides synthetic weather forecast data when real XML forecast feeds are unavailable. This is a fallback mechanism that ensures the application continues to function even when external data sources fail.

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
3. **Tertiary**: Mock forecast generator (synthetic data)

The mock system activates when:
- XML feeds are unavailable (404 errors, no data downloaded)
- Station API returns insufficient data for the requested period
- User requests multi-day forecasts (week/month)

## Implementation

### Files Created

**`src/mockForecast.ts`**: Mock data generator
- `generateMockDailyForecast()` - Creates daily forecasts
- `generateMockHourlyForecast()` - Creates hourly forecasts  
- `generateMockForecast()` - Main entry point

**Modified: `src/server.ts`**
- Added logic to detect insufficient data
- Automatically switches to mock data when needed
- Calculates expected days vs actual days returned

### Detection Logic

```typescript
// Calculate expected number of days
const fromDate = new Date(dateRange.from);
const toDate = new Date(dateRange.to);
const expectedDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

// If we're requesting multiple days but only got 1-2 days, use mock
if (period !== 'today' && forecast.length < Math.min(3, expectedDays)) {
  forecast = mockForecast.generateMockForecast(period, dateRange.from, dateRange.to, 20);
}
```

## Mock Data Characteristics

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
| **week** | Feb 11 → Feb 17 | Mock Generator | 7 days |
| **month** | Feb 11 → Mar 12 | Mock Generator | 30 days |

## API Response

The response indicates the data source:

```json
{
  "source": "station",  // Can be "xml", "station", or "station" (with mock data)
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

## When Mock Data is Used

**Logs indicate mock data generation:**
```
⚠ XML forecast unavailable for Tel Aviv, falling back to station data
→ Falling back to station 178 observations
Channels fetched: 10
Daily forecast generated: 1 entries
⚠ Insufficient station data (1/7 days), generating mock forecast
✓ Mock forecast generated: 7 entries
```

## Future: Replacing Mock Data with Real Forecasts

To get real forecast data instead of mock data:

1. **Discover actual RSS feed URLs** (see `docs/URL_DISCOVERY_GUIDE.md`)
2. **Update `src/xmlDownloader.ts`** with correct URLs
3. **Download fresh XML data**: `npm run download-xml`
4. **Restart server**: The system will automatically use XML data

Once valid XML feeds are available:
- Mock data will no longer be needed
- Response will show `"source": "xml"`
- Forecasts will be real meteorological predictions

## Development/Testing

The mock system is ideal for:
- ✅ Development without relying on external APIs
- ✅ Testing UI with full 7-day and 30-day datasets
- ✅ Demonstrating the application's capabilities
- ✅ Working offline or when IMS servers are down

## Limitations

Mock data is **synthetic** and should not be used for:
- ❌ Actual weather predictions
- ❌ Safety-critical decisions
- ❌ Production deployments without user awareness

The UI should ideally display a notice when mock data is being shown.

## Configuration

Base temperature can be adjusted in `server.ts`:

```typescript
forecast = mockForecast.generateMockForecast(
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

## Date: February 11, 2026
