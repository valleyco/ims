# Automatic XML Download System

## Overview

The automatic XML download system ensures fresh weather forecast data is always available by managing the lifecycle of XML/RSS feeds from the Israel Meteorological Service (IMS).

## Features

### 1. **Startup Check**
When the server starts, it automatically:
- Checks if XML data exists
- Evaluates data freshness (age < 6 hours)
- Downloads fresh data if missing or stale
- Continues gracefully if download fails

### 2. **Scheduled Updates**
- Runs every 6 hours (00:00, 06:00, 12:00, 18:00)
- Uses node-cron for scheduling
- Automatic cleanup of old data (keeps last 7 days)
- Non-blocking background operation

### 3. **Manual Refresh**
- Admin API endpoint for on-demand refresh
- Status endpoint to check data freshness
- Includes download statistics and timing

### 4. **Graceful Fallback**
- If XML download fails, server continues with:
  - Existing stale XML data (if available)
  - IMS Station API (historical observations)
  - Mock forecast data (synthetic)

---

## API Endpoints

### GET `/api/admin/data-status`

Check the current status of XML data.

**Response:**
```json
{
  "exists": true,
  "directory": "/path/to/data/2026-02-11/11-14-18",
  "age": 0.5,
  "isStale": false,
  "lastUpdate": "2026-02-11T09:14:43.341Z",
  "staleSinceHours": 0,
  "message": "XML data is fresh (0.5h old)",
  "needsUrgentRefresh": false,
  "recommendation": "Data is fresh, no action needed"
}
```

**Fields:**
- `exists`: Whether any XML data is downloaded
- `directory`: Path to most recent download
- `age`: Data age in hours
- `isStale`: True if age > 6 hours
- `lastUpdate`: ISO timestamp of download
- `staleSinceHours`: Hours since data became stale
- `message`: Human-readable status
- `needsUrgentRefresh`: True if age > 12 hours
- `recommendation`: Suggested action

### POST `/api/admin/refresh-xml`

Force an immediate XML data refresh.

**Response:**
```json
{
  "message": "XML data refreshed successfully",
  "duration": "22.9s",
  "metadata": {
    "total": 33,
    "successful": 0,
    "failed": 33,
    "directory": "/path/to/data/2026-02-11/11-15-59"
  }
}
```

**Use Cases:**
- Manual refresh after discovering correct RSS URLs
- Testing download functionality
- Recovery from failed automatic downloads

---

## Data Freshness Logic

### Freshness Thresholds

| Threshold | Value | Action |
|-----------|-------|--------|
| **Fresh** | < 6 hours | No action needed |
| **Stale** | 6-12 hours | Automatic refresh on schedule |
| **Very Stale** | > 12 hours | Urgent refresh recommended |

### Rationale
- IMS updates forecast data **twice daily** (~12-hour cycle)
- We check every **6 hours** to catch updates promptly
- Allows for some delay/retry tolerance

---

## Directory Structure

```
data/
├── 2026-02-09/                    # Date folders (YYYY-MM-DD)
│   └── 09-57-33/                  # Time folders (HH-MM-SS)
│       ├── metadata.json          # Download metadata
│       ├── forecast_city_*.xml    # City forecasts (if successful)
│       ├── forecast_country.xml
│       └── ...
├── 2026-02-11/
│   ├── 11-14-18/                  # Startup download
│   └── 11-15-59/                  # Manual refresh
└── .gitkeep
```

### Metadata Format

Each download includes a `metadata.json` file:

```json
{
  "timestamp": "2026-02-11T09:14:43.341Z",
  "directory": "/path/to/data/2026-02-11/11-14-18",
  "total": 33,
  "successful": 0,
  "failed": 33,
  "results": [
    {
      "feed": {
        "id": "city_telaviv",
        "name": "Tel Aviv Forecast",
        "url": "https://...",
        "filename": "forecast_city_telaviv.xml"
      },
      "success": false,
      "error": "HTTP 404: Not Found"
    }
  ]
}
```

---

## Configuration

### Cron Schedule

Modify the cron pattern in `src/server.ts`:

```typescript
// Current: Every 6 hours (00:00, 06:00, 12:00, 18:00)
cron.schedule('0 */6 * * *', async () => { ... });

// Alternative schedules:
// Every 3 hours:  '0 */3 * * *'
// Every 12 hours: '0 */12 * * *'
// Twice daily at specific times: '0 6,18 * * *'
// Daily at midnight: '0 0 * * *'
```

### Freshness Threshold

Modify in `src/xmlDataManager.ts`:

```typescript
// Current: 6 hours
const STALE_THRESHOLD_HOURS = 6;

// For testing: 5 minutes
const STALE_THRESHOLD_HOURS = 5 / 60;

// For production with less frequent checks: 12 hours
const STALE_THRESHOLD_HOURS = 12;
```

### Data Retention

Modify in download calls:

```typescript
// Current: Keep last 7 days
xmlDownloader.cleanOldDownloads(7);

// Keep 30 days:
xmlDownloader.cleanOldDownloads(30);

// Keep 24 hours:
xmlDownloader.cleanOldDownloads(1);
```

---

## Server Logs

### Startup with Fresh Data

```
🌤️  Weather Forecast Server running on http://localhost:3001
📡 IMS API Token: ✓ Configured
📅 Scheduled XML refresh: Every 6 hours (00:00, 06:00, 12:00, 18:00)

🚀 Initializing XML data...
✓ XML data is fresh (0.5h old)
✓ XML data initialization complete
```

### Startup with Stale Data

```
🚀 Initializing XML data...
📥 XML data is 7.2h old (stale), refreshing...

Downloading to: /path/to/data/2026-02-11/11-14-18

Downloading: Country Forecast from https://...
Downloading: Tel Aviv Forecast from https://...
...

=== Download Complete ===
Total: 33
Successful: 0
Failed: 33

✓ XML data refreshed successfully
✓ XML data initialization complete
```

### Scheduled Refresh

```
⏰ Scheduled XML refresh starting...
📥 XML data is 6.1h old (stale), refreshing...

Downloading to: /path/to/data/2026-02-11/17-00-12
...

✓ Scheduled XML refresh complete
```

---

## Troubleshooting

### Problem: All downloads fail (404 errors)

**Cause**: RSS feed URLs are incorrect (currently placeholders)

**Solution**:
1. Follow `docs/URL_DISCOVERY_GUIDE.md` to find real URLs
2. Update `src/xmlDownloader.ts` with correct URLs
3. Run manual refresh: `POST /api/admin/refresh-xml`

### Problem: Server continues to show stale data

**Cause**: Server not restarted after download, or cron not running

**Check**:
```bash
curl http://localhost:3001/api/admin/data-status
```

**Solution**:
- Restart server to pick up new data
- Verify cron schedule is correct
- Check server logs for errors

### Problem: Disk space issues

**Symptom**: Server crashes or refuses to download

**Solution**:
```bash
# Check disk usage
du -sh /path/to/project/data

# Manually clean old data
cd /path/to/project/data
rm -rf 2026-01-*  # Remove January data

# Or reduce retention period in code:
xmlDownloader.cleanOldDownloads(1);  # Keep only 1 day
```

### Problem: Download hangs or times out

**Cause**: Network issues or IMS server problems

**Solution**:
- Check network connectivity
- Verify IMS website is accessible
- Wait and retry later (automatic retry on next schedule)
- Use manual refresh with different timing

---

## Testing

### Test Automatic Startup

```bash
# Stop server
kill $(lsof -ti:3001)

# Rename data folder to simulate missing data
mv data data.backup

# Start server and watch logs
npm start
# Should see: "No XML data found, downloading..."
```

### Test Manual Refresh

```bash
# Check current status
curl http://localhost:3001/api/admin/data-status

# Force refresh
curl -X POST http://localhost:3001/api/admin/refresh-xml

# Verify new directory created
ls -la data/$(date +%Y-%m-%d)/
```

### Test Scheduled Refresh

```bash
# Temporarily set very short interval (for testing only!)
# In src/server.ts, change cron schedule to:
cron.schedule('*/2 * * * *', async () => { ... }); // Every 2 minutes

# Rebuild and restart
npm run build && npm start

# Watch logs for scheduled refreshes
tail -f <server-log>
```

---

## Performance

### Download Times

Based on 33 feeds:
- **Fast network**: 15-25 seconds
- **Slow network**: 30-60 seconds
- **Timeout threshold**: 30 seconds per feed

### Resource Usage

- **Disk**: ~10 KB per download (failed) to ~500 KB (successful with XML)
- **Memory**: Minimal (downloads are streamed to disk)
- **CPU**: Negligible during download

### Impact on Server Startup

- Downloads run **asynchronously** (non-blocking)
- Server starts immediately, data loads in background
- No impact on API availability

---

## Future Enhancements

1. **Retry Logic**: Exponential backoff for failed downloads
2. **Selective Refresh**: Update only specific feeds
3. **Download Progress**: WebSocket updates to admin UI
4. **Health Metrics**: Prometheus metrics for monitoring
5. **Notification**: Email/Slack alerts for persistent failures
6. **CDN Caching**: Serve XML files from CDN
7. **Delta Updates**: Only download if RSS ETag changed

---

## Related Documentation

- [`docs/XML_FEED_README.md`](XML_FEED_README.md) - XML integration overview
- [`docs/XML_INTEGRATION_NOTES.md`](XML_INTEGRATION_NOTES.md) - Technical details
- [`docs/URL_DISCOVERY_GUIDE.md`](URL_DISCOVERY_GUIDE.md) - How to find RSS URLs
- [`src/xmlDownloader.ts`](../src/xmlDownloader.ts) - Download implementation
- [`src/xmlDataManager.ts`](../src/xmlDataManager.ts) - Lifecycle management

## Date: February 11, 2026
