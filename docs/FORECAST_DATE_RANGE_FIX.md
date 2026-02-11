# Forecast Date Range Fix

## Issue
The `/api/forecast` endpoint was returning past dates instead of future dates, even though it uses XML forecast data which contains future weather predictions.

## Root Cause
The `getDateRange()` function in `src/utils.ts` was designed for **historical station observation data** and calculated date ranges looking backwards (e.g., "week" = last 7 days).

## Solution
Created a separate `getForecastDateRange()` function that looks **forward** for forecast data while keeping the original `getDateRange()` for historical station data endpoints.

## Changes Made

### 1. Added New Function: `getForecastDateRange()` 
**File**: `src/utils.ts`

```typescript
export function getForecastDateRange(period: string): DateRange {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endDate = new Date(today);
  
  switch (period) {
    case 'today':
      // Today + next day (48 hours forward)
      endDate.setUTCDate(today.getUTCDate() + 1);
      break;
    case 'week':
      // Next 7 days (including today)
      endDate.setUTCDate(today.getUTCDate() + 6);
      break;
    case 'month':
      // Next 30 days (including today)
      endDate.setUTCDate(today.getUTCDate() + 29);
      break;
    default:
      endDate.setUTCDate(today.getUTCDate() + 1);
  }
  
  return {
    from: today.toISOString().split('T')[0],
    to: endDate.toISOString().split('T')[0]
  };
}
```

### 2. Updated `/api/forecast` Endpoint
**File**: `src/server.ts` (line 179)

Changed from:
```typescript
const dateRange = utils.getDateRange(period || 'today');
```

To:
```typescript
const dateRange = utils.getForecastDateRange(period || 'today');
```

### 3. Updated Documentation
**File**: `src/utils.ts` (line 91)

Updated the comment for `getDateRange()` to clarify:
```typescript
/**
 * Get date range based on period (looking backwards for historical station data)
 * Use getForecastDateRange() for forward-looking forecast data instead
 * ...
 */
```

## Results

### Today's date: February 11, 2026

| Period | Old Behavior (Past) | New Behavior (Future) |
|--------|-------------------|---------------------|
| **today** | Feb 9 → Feb 11 | Feb 11 → Feb 12 ✓ |
| **week** | Feb 4 → Feb 11 | Feb 11 → Feb 17 ✓ |
| **month** | Jan 12 → Feb 11 | Feb 11 → Mar 12 ✓ |

### Endpoint Behavior

- **`/api/forecast`**: Now uses `getForecastDateRange()` → Returns **future dates**
- **`/api/station-data`**: Still uses `getDateRange()` → Returns **past dates** (as intended)

## Testing

Verified with curl:

```bash
# Forecast endpoint - returns future dates
curl "http://localhost:3001/api/forecast?stationId=178&period=week"
# Returns: from: "2026-02-11", to: "2026-02-17"

# Station data endpoint - returns past dates
curl "http://localhost:3001/api/station-data?stationId=178&period=week"
# Returns: from: "2026-02-04", to: "2026-02-11"
```

## Impact
- ✅ Forecast endpoint now correctly shows future weather predictions
- ✅ Historical station data endpoint unaffected
- ✅ No breaking changes to API structure
- ✅ Backward compatible with existing UI code

## Date: February 11, 2026
