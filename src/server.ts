import path from 'path';
import express, { Request, Response } from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { config } from './config';
import * as cache from './cache';
import * as imsApi from './imsApi';
import * as utils from './utils';
import * as cityMapping from './cityStationMapping';
import * as xmlParser from './xmlParser';
import * as xmlDownloader from './xmlDownloader';
import * as forecastAdapter from './forecastAdapter';
import * as fallbackForecast from './fallbackForecast';
import * as xmlDataManager from './xmlDataManager';

const app = express();
const PORT = parseInt(config.PORT);

// Initialize cache on startup
cache.initCache();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Type definitions for request query parameters

interface NearestStationQuery {
  lat?: string;
  lon?: string;
}

interface StationDataQuery {
  stationId?: string;
  period?: string;
}

interface ForecastQuery {
  stationId?: string;
  period?: string;
}

interface StationDataResponse {
  stationId: string | number;
  dateRange: utils.DateRange;
  channels: imsApi.ChannelDataItem[];
  period?: string;
}

// API Routes

// Get all stations (with caching)
app.get('/api/stations', async (req: Request, res: Response) => {
  try {
    const stations = await cache.get<imsApi.Station[]>('stations', {}, {
      fetcher: async () => await imsApi.getStations()
    });

    res.json(stations);
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
});

// Find nearest station to given coordinates
app.get('/api/nearest-station', async (req: Request<{}, {}, {}, NearestStationQuery>, res: Response) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);

    // Get stations list (from cache or fetch)
    const stations = await cache.get<imsApi.Station[]>('stations', {}, {
      fetcher: async () => await imsApi.getStations()
    });

    if (!stations) {
      return res.status(500).json({ error: 'Failed to fetch stations' });
    }

    // Find nearest station
    let nearestStation: imsApi.Station | null = null;
    let minDistance = Infinity;

    stations.forEach(station => {
      if (station.location && station.location.latitude && station.location.longitude) {
        const distance = utils.calculateDistance(
          userLat,
          userLon,
          station.location.latitude,
          station.location.longitude
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestStation = station;
        }
      }
    });

    if (!nearestStation) {
      return res.status(404).json({ error: 'No stations found' });
    }

    res.json({
      station: nearestStation,
      distance: minDistance.toFixed(2)
    });
  } catch (error) {
    console.error('Error finding nearest station:', error);
    res.status(500).json({ error: 'Failed to find nearest station' });
  }
});

// Get station data (multiple channels) with caching
app.get('/api/station-data', async (req: Request<{}, {}, {}, StationDataQuery>, res: Response) => {
  try {
    const { stationId, period } = req.query;

    if (!stationId) {
      return res.status(400).json({ error: 'Station ID is required' });
    }

    // Get date range using utils
    const dateRange = utils.getDateRange(period || 'today');

    const cacheParams = {
      stationId,
      from: dateRange.from,
      to: dateRange.to
    };

    // Try common weather channel IDs
    // Based on the station monitors: 1=Rain, 2=WSmax, 3=WDmax, 4=WS, 5=WD, 6=STDwd, 7=TD, 8=RH, 9=TDmax, 10=TDmin
    const channelIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Get data from cache or fetch
    const responseData = await cache.get<StationDataResponse>('forecast', cacheParams, {
      fetcher: async () => {
        const weatherData = await imsApi.getStationDataMultiChannel(
          parseInt(stationId),
          channelIds,
          dateRange.from,
          dateRange.to
        );

        return {
          stationId,
          dateRange,
          channels: weatherData
        };
      }
    });

    res.json({
      ...responseData,
      period: period || 'today'
    });
  } catch (error) {
    console.error('Error fetching station data:', error);
    res.status(500).json({ error: 'Failed to fetch station data' });
  }
});

// Get forecast data (aggregated by hour or day)
app.get('/api/forecast', async (req: Request<{}, {}, {}, ForecastQuery>, res: Response) => {
  try {
    const { stationId, period } = req.query;

    if (!stationId) {
      return res.status(400).json({ error: 'Station ID is required' });
    }

    // Get date range using utils
    const dateRange = utils.getForecastDateRange(period || 'today');

    // Get station info to find its location
    const stations = await cache.get<imsApi.Station[]>('stations', {}, {
      fetcher: async () => await imsApi.getStations()
    });

    const station = stations?.find(s => s.stationId === parseInt(stationId));
    
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    // Find nearest city for this station
    const nearestCity = cityMapping.findNearestCity(
      station.location.latitude,
      station.location.longitude
    );

    console.log(`Station ${stationId} → Nearest city: ${nearestCity.name} (${nearestCity.distance.toFixed(1)}km)`);

    // Try to get XML forecast
    const downloadDir = xmlDownloader.getMostRecentDownloadDir();
    
    if (downloadDir) {
      try {
        const cityForecasts = await xmlParser.getCityForecast(nearestCity.id, downloadDir);
        
        if (cityForecasts && cityForecasts.length > 0) {
          console.log(`✓ Using XML forecast for ${nearestCity.name}`);
          
          const response = forecastAdapter.formatForecastResponse(
            stationId,
            nearestCity.id,
            nearestCity.name,
            period as 'today' | 'week' | 'month',
            dateRange,
            cityForecasts
          );
          
          return res.json(response);
        }
      } catch (error) {
        console.warn(`⚠ XML forecast unavailable for ${nearestCity.name}, falling back to station data`);
      }
    }

    // Fallback: Use station observations (original implementation)
    console.log(`→ Falling back to station ${stationId} observations`);
    
    // Fetch all channel data
    const channelIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const channels = await imsApi.getStationDataMultiChannel(
      parseInt(stationId),
      channelIds,
      dateRange.from,
      dateRange.to
    );

    console.log(`Channels fetched: ${channels.length}`);
    channels.forEach(ch => {
      const dataPoints = ch.data?.data?.length || 0;
      console.log(`  Channel ${ch.channelId}: ${dataPoints} data points`);
    });

    // Aggregate data based on period
    let forecast: utils.HourlyForecast[] | utils.DailyForecast[];

    if (period === 'today') {
      // Hourly aggregation for today
      forecast = utils.aggregateHourly(channels);
      console.log(`Hourly forecast generated: ${forecast.length} entries`);
    } else {
      // Daily aggregation for week/month
      forecast = utils.aggregateDaily(channels);
      console.log(`Daily forecast generated: ${forecast.length} entries`);
    }

    // Check if we got insufficient data for the requested period
    // Calculate expected number of days for the period
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    const expectedDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // If we're requesting multiple days but only got 1-2 days of data, use fallback forecast
    if (period !== 'today' && forecast.length < Math.min(3, expectedDays)) {
      console.log(`⚠ Insufficient station data (${forecast.length}/${expectedDays} days), generating fallback forecast`);
      forecast = fallbackForecast.generateFallbackForecast(
        period || 'today',
        dateRange.from,
        dateRange.to,
        20 // base temperature in Celsius
      );
      console.log(`✓ Fallback forecast generated: ${forecast.length} entries`);
    }

    res.json({
      source: 'station',
      stationId,
      period,
      dateRange,
      forecast
    });
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Cache management endpoints

// Get cache statistics
app.get('/api/cache/stats', async (req: Request, res: Response) => {
  try {
    const stats = await cache.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

// Clear all caches
app.post('/api/cache/clear', async (req: Request, res: Response) => {
  try {
    await cache.clear();
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// NEW ENDPOINTS FOR XML INTEGRATION

// Get all available cities (15 cities with XML forecasts)
app.get('/api/cities', async (req: Request, res: Response) => {
  try {
    const cities = cityMapping.getAllCities();
    res.json(cities);
  } catch (error) {
    console.error('Error getting cities:', error);
    res.status(500).json({ error: 'Failed to get cities' });
  }
});

// Get station detail (raw observations - original implementation)
app.get('/api/station-detail', async (req: Request<{}, {}, {}, StationDataQuery>, res: Response) => {
  try {
    const { stationId, period } = req.query;

    if (!stationId) {
      return res.status(400).json({ error: 'Station ID is required' });
    }

    const dateRange = utils.getDateRange(period || 'today');

    const channelIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const channels = await imsApi.getStationDataMultiChannel(
      parseInt(stationId),
      channelIds,
      dateRange.from,
      dateRange.to
    );

    const response: StationDataResponse = {
      stationId: parseInt(stationId),
      dateRange,
      channels,
      period
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching station detail:', error);
    res.status(500).json({ error: 'Failed to fetch station detail' });
  }
});

// Get city forecast by city ID (direct XML access)
app.get('/api/city-forecast', async (req: Request<{}, {}, {}, { city?: string }>, res: Response) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ error: 'City ID is required' });
    }

    const cityInfo = cityMapping.getCityById(city);
    if (!cityInfo) {
      return res.status(404).json({ error: 'City not found' });
    }

    const downloadDir = xmlDownloader.getMostRecentDownloadDir();
    
    if (!downloadDir) {
      return res.status(503).json({ error: 'No XML data available. Run: npm run download-xml' });
    }

    const forecasts = await xmlParser.getCityForecast(city, downloadDir);
    
    res.json({
      city: cityInfo,
      forecasts,
      downloadDir
    });
  } catch (error) {
    console.error('Error fetching city forecast:', error);
    res.status(500).json({ error: 'Failed to fetch city forecast' });
  }
});

// Get all active alerts
app.get('/api/alerts', async (req: Request, res: Response) => {
  try {
    const downloadDir = xmlDownloader.getMostRecentDownloadDir();
    
    if (!downloadDir) {
      return res.status(503).json({ error: 'No XML data available. Run: npm run download-xml' });
    }

    const alerts = await xmlParser.getAllAlerts(downloadDir);
    
    res.json({
      count: alerts.length,
      alerts,
      downloadDir
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get country forecast
app.get('/api/country-forecast', async (req: Request, res: Response) => {
  try {
    const downloadDir = xmlDownloader.getMostRecentDownloadDir();
    
    if (!downloadDir) {
      return res.status(503).json({ error: 'No XML data available. Run: npm run download-xml' });
    }

    const forecasts = await xmlParser.getCountryForecast(downloadDir);
    
    res.json({
      forecasts,
      downloadDir
    });
  } catch (error) {
    console.error('Error fetching country forecast:', error);
    res.status(500).json({ error: 'Failed to fetch country forecast' });
  }
});

// Get sea forecast by location
app.get('/api/sea-forecast', async (req: Request<{}, {}, {}, { location?: string }>, res: Response) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({ error: 'Location is required (haifa, ashdod, ashkelon, eilat)' });
    }

    const downloadDir = xmlDownloader.getMostRecentDownloadDir();
    
    if (!downloadDir) {
      return res.status(503).json({ error: 'No XML data available. Run: npm run download-xml' });
    }

    const forecasts = await xmlParser.getSeaForecast(location, downloadDir);
    
    res.json({
      location,
      forecasts,
      downloadDir
    });
  } catch (error) {
    console.error('Error fetching sea forecast:', error);
    res.status(500).json({ error: 'Failed to fetch sea forecast' });
  }
});

// Get UVI forecast
app.get('/api/uvi-forecast', async (req: Request, res: Response) => {
  try {
    const downloadDir = xmlDownloader.getMostRecentDownloadDir();
    
    if (!downloadDir) {
      return res.status(503).json({ error: 'No XML data available. Run: npm run download-xml' });
    }

    const forecasts = await xmlParser.getUVIForecast(downloadDir);
    
    res.json({
      forecasts,
      downloadDir
    });
  } catch (error) {
    console.error('Error fetching UVI forecast:', error);
    res.status(500).json({ error: 'Failed to fetch UVI forecast' });
  }
});

// ADMIN ENDPOINTS

// Get XML data status
app.get('/api/admin/data-status', (req: Request, res: Response) => {
  try {
    const status = xmlDataManager.getDataStatus();
    const message = xmlDataManager.getStatusMessage();
    const needsUrgent = xmlDataManager.needsUrgentRefresh();
    
    res.json({
      ...status,
      message,
      needsUrgentRefresh: needsUrgent,
      recommendation: needsUrgent 
        ? 'Data is very stale, refresh recommended' 
        : status.isStale 
          ? 'Data is stale, refresh suggested'
          : 'Data is fresh, no action needed'
    });
  } catch (error) {
    console.error('Error getting data status:', error);
    res.status(500).json({ error: 'Failed to get data status' });
  }
});

// Force refresh XML data
app.post('/api/admin/refresh-xml', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Manual XML refresh requested');
    
    const startTime = Date.now();
    const metadata = await xmlDownloader.downloadAllFeeds();
    xmlDownloader.cleanOldDownloads(7);
    const duration = Date.now() - startTime;
    
    res.json({
      message: 'XML data refreshed successfully',
      duration: `${(duration / 1000).toFixed(1)}s`,
      metadata: {
        total: metadata.total,
        successful: metadata.successful,
        failed: metadata.failed,
        directory: metadata.directory
      }
    });
  } catch (error) {
    console.error('❌ Error refreshing XML:', error);
    res.status(500).json({ 
      error: 'Failed to refresh XML data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Serve index.html for all other routes
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🌤️  Weather Forecast Server running on http://localhost:${PORT}`);
  console.log(`📡 IMS API Token: ${config.IMS_API_TOKEN ? '✓ Configured' : '✗ Missing'}`);
});

// Initialize XML data on startup (async, non-blocking)
(async () => {
  console.log('\n🚀 Initializing XML data...');
  try {
    await xmlDataManager.ensureFreshData();
    console.log('✓ XML data initialization complete\n');
  } catch (error) {
    console.warn('⚠ Initial XML download failed, server will use fallback data');
    console.error(error);
    console.log('💡 You can manually refresh XML data via: POST /api/admin/refresh-xml\n');
  }
})();

// Schedule automatic XML updates every 6 hours
// Cron pattern: "0 */6 * * *" means "at minute 0 of every 6th hour"
// This will run at: 00:00, 06:00, 12:00, 18:00 daily
cron.schedule('0 */6 * * *', async () => {
  console.log('\n⏰ Scheduled XML refresh starting...');
  try {
    await xmlDataManager.ensureFreshData(true); // force=true for scheduled updates
    console.log('✓ Scheduled XML refresh complete\n');
  } catch (error) {
    console.error('❌ Scheduled XML refresh failed:', error);
    console.log('⚠ Will retry at next scheduled time\n');
  }
});

console.log('📅 Scheduled XML refresh: Every 6 hours (00:00, 06:00, 12:00, 18:00)');

