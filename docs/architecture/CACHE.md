# Cache System Documentation

## Overview

The application uses a 2-level caching system (memory + file) to optimize API calls and improve performance.

## Cache API

### `cache.get(type, params, options)`

Retrieves data from cache. If cache misses and a fetcher function is provided, it automatically fetches and caches the data.

#### Parameters

- **`type`** (string): Cache type - `'stations'` or `'forecast'`
- **`params`** (object): Cache parameters for generating unique keys
  - For stations: empty object `{}`
  - For forecast: `{ stationId, from, to }`
- **`options`** (object): Optional configuration
  - **`fetcher`** (async function): Function to call if cache misses
  - **`duration`** (number): Custom expiration duration in milliseconds (overrides defaults)

#### Default Expiration Times

- **Stations**: 48 hours (172,800,000 ms)
- **Forecast**: 24 hours (86,400,000 ms)

## Usage Examples

### Basic Usage with Auto-fetch

```javascript
// Fetch stations - automatically caches if not present
const stations = await cache.get('stations', {}, {
  fetcher: async () => await imsApi.getStations()
});
```

### Forecast with Auto-fetch

```javascript
const cacheParams = {
  stationId: 23,
  from: '2026-02-03',
  to: '2026-02-05'
};

const data = await cache.get('forecast', cacheParams, {
  fetcher: async () => {
    const channels = await imsApi.getStationDataMultiChannel(
      stationId, 
      channelIds, 
      dateRange.from, 
      dateRange.to
    );
    return { stationId, dateRange, channels };
  }
});
```

### Custom Expiration Duration

```javascript
// Cache for only 5 minutes
const data = await cache.get('forecast', params, {
  fetcher: async () => await fetchData(),
  duration: 5 * 60 * 1000  // 5 minutes
});
```

### Without Auto-fetch (Legacy Pattern)

```javascript
// Just check cache, return null if not found
const cached = await cache.get('stations');
if (!cached) {
  const data = await fetchData();
  await cache.set('stations', data);
  return data;
}
return cached;
```

## Benefits of New API

1. **Cleaner Code**: Reduces boilerplate from ~10 lines to ~3 lines
2. **Consistency**: Ensures caching logic is always applied correctly
3. **Flexibility**: Supports custom expiration times when needed
4. **Type Safety**: Single source of truth for cache operations

## Cache Management Endpoints

### Get Cache Statistics
```bash
GET /api/cache/stats
```

### Clear All Caches
```bash
POST /api/cache/clear
```

## Implementation Notes

- **Memory Cache**: Fast in-process Map for immediate access
- **File Cache**: Persistent JSON files in `.cache/` directory
- **Automatic Cleanup**: Expired entries are automatically removed
- **Cache Keys**: Generated based on type and parameters for uniqueness
