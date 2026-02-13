# API Migration Guide - Comprehensive Refactoring

This guide documents the breaking changes made to the API in the comprehensive refactoring and provides migration instructions.

## Overview

The API has been refactored to follow proper REST conventions, remove deprecated fields, and improve consistency. These changes improve the API's maintainability and align it with modern best practices.

## Breaking Changes

### 1. Removed `/api/station-detail` Endpoint

**Status:** BREAKING CHANGE

**Reason:** This endpoint was a duplicate of `/api/station-data` and caused confusion.

**Migration:**
```javascript
// BEFORE
fetch('/api/station-detail?stationId=178&period=today')

// AFTER
fetch('/api/station-data?stationId=178&period=today')
```

Both endpoints returned the same data structure. Simply replace all calls to `/api/station-detail` with `/api/station-data`.

### 2. Cache Management Endpoint Changed to REST-Compliant

**Status:** BREAKING CHANGE

**Reason:** POST method for clearing cache violated REST conventions. DELETE is the proper HTTP verb for removing resources.

**Migration:**
```javascript
// BEFORE
fetch('/api/cache/clear', { method: 'POST' })

// AFTER
fetch('/api/cache', { method: 'DELETE' })
```

**Changed:**
- Endpoint: `/api/cache/clear` → `/api/cache`
- Method: `POST` → `DELETE`
- Response: Unchanged

### 3. Admin XML Refresh Endpoint Renamed

**Status:** BREAKING CHANGE

**Reason:** Improved naming consistency for admin endpoints.

**Migration:**
```javascript
// BEFORE
fetch('/api/admin/refresh-xml', { method: 'POST' })

// AFTER
fetch('/api/admin/xml', { method: 'POST' })
```

**Changed:**
- Endpoint: `/api/admin/refresh-xml` → `/api/admin/xml`
- Method: Unchanged (POST)
- Response: Unchanged

### 4. Removed `tempCurrent` from Daily Forecasts

**Status:** BREAKING CHANGE

**Reason:** "Current temperature" is logically incorrect for future dates in forecasts. Only min/max make sense for daily forecasts.

**Migration:**

Update your frontend code to remove references to `tempCurrent` in daily (week/month) forecasts:

```javascript
// BEFORE
forecasts.forEach(day => {
  console.log(`${day.date}: Min ${day.tempMin}, Max ${day.tempMax}, Current ${day.tempCurrent}`);
});

// AFTER
forecasts.forEach(day => {
  console.log(`${day.date}: Min ${day.tempMin}, Max ${day.tempMax}`);
});
```

**Changed Schema:**
```typescript
// BEFORE
interface DailyForecast {
  date: string;
  tempMin: string | null;
  tempMax: string | null;
  tempCurrent: string | null;  // REMOVED
  humidity: string | null;
  windSpeed: string | null;
  rain: string | null;
}

// AFTER
interface DailyForecast {
  date: string;
  tempMin: string | null;
  tempMax: string | null;
  humidity: string | null;
  windSpeed: string | null;
  rain: string | null;
}
```

### 5. `/api/station-data` Now Uses Forward-Looking Dates

**Status:** BREAKING CHANGE (if you relied on historical data)

**Reason:** Consistency with `/api/forecast` endpoint. All forecast-related endpoints should look forward, not backward.

**Migration:**

The endpoint now returns future data instead of historical data:

- `period=today`: Today + next day (forward)
- `period=week`: Next 7 days (forward)
- `period=month`: Next 30 days (forward)

If you need historical data, note that station observations are typically only available for recent past periods, so you may need to adjust your expectations or use cached data.

**Impact:**
```javascript
// BEFORE (returned past data)
fetch('/api/station-data?stationId=178&period=week')
// → Data from 7 days ago to today

// AFTER (returns forward-looking data)
fetch('/api/station-data?stationId=178&period=week')
// → Data from today to 7 days ahead
```

## Non-Breaking Improvements

### 1. Standardized Response Format

All forecast endpoints now consistently return:
```json
{
  "source": "xml" | "station",
  "stationId": "178",
  "period": "today" | "week" | "month",
  "dateRange": {
    "from": "2026-02-11",
    "to": "2026-02-17"
  },
  "forecast": [...]
}
```

### 2. Admin Endpoints - Security Enhancement

The following endpoints are now documented in the OpenAPI spec:
- `GET /api/admin/data-status`
- `POST /api/admin/xml`

**Important Security Note:** These admin endpoints are now **development-only** and disabled in production for security reasons.

**Development Mode (NODE_ENV=development):**
```bash
# Admin endpoints are available
curl http://localhost:3001/api/admin/data-status  # ✓ Works
curl -X POST http://localhost:3001/api/admin/xml  # ✓ Works
```

**Production Mode (NODE_ENV=production):**
```bash
# Admin endpoints return 404
curl http://localhost:3001/api/admin/data-status  # ✗ 404 Not Found
curl -X POST http://localhost:3001/api/admin/xml  # ✗ 404 Not Found
```

**Why this change?**
- Prevents unauthorized resource-intensive operations
- Protects against DoS attacks via repeated calls  
- Eliminates security risks from unauthenticated admin actions
- Production systems use automatic cron-based updates (every 6 hours)

If you were using these endpoints in production, remove those calls. XML data is automatically managed via:
- **Startup check**: Downloads missing/stale data on server start
- **Cron schedule**: Refreshes every 6 hours (00:00, 06:00, 12:00, 18:00)

### 3. Improved Error Response Consistency

All endpoints now return errors in a consistent format:
```json
{
  "error": "Error message description"
}
```

Some endpoints also include additional details:
```json
{
  "error": "Failed to refresh XML data",
  "details": "Network timeout after 30s"
}
```

## Testing Your Migration

After migrating, test these scenarios:

1. **Cache Management:**
   ```bash
   # Should clear cache successfully
   curl -X DELETE http://localhost:3001/api/cache
   ```

2. **Station Data:**
   ```bash
   # Should return forward-looking data
   curl "http://localhost:3001/api/station-data?stationId=178&period=week"
   ```

3. **Daily Forecasts:**
   ```bash
   # Response should NOT include tempCurrent field
   curl "http://localhost:3001/api/forecast?stationId=178&period=week"
   ```

4. **Admin XML Refresh:**
   ```bash
   # Should trigger XML download
   curl -X POST http://localhost:3001/api/admin/xml
   ```

## Rollback Instructions

If you need to temporarily rollback these changes:

1. **Restore `tempCurrent` field:**
   - Revert changes in `src/utils.ts`, `src/fallbackForecast.ts`, and `tests/`
   - Restore the old `aggregateDaily` function implementation

2. **Restore old endpoints:**
   - Add back `/api/station-detail` in `src/server.ts`
   - Add back `POST /api/cache/clear` alongside `DELETE /api/cache`
   - Add back `POST /api/admin/refresh-xml` alongside `POST /api/admin/xml`

However, it's recommended to migrate forward rather than rolling back, as these changes improve API consistency and maintainability.

## Support

If you encounter issues during migration:

1. Check the updated OpenAPI specification at `docs/api/internal-api.yaml`
2. Review the updated type definitions in `src/utils.ts`
3. Run tests: `npm test`
4. Check server logs for detailed error messages

## Timeline

All changes were implemented on: **February 11, 2026**

Recommended migration timeline: **Immediate** (breaking changes)
