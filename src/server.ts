import path from 'path';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import * as cache from './cache';
import * as imsApi from './imsApi';
import * as utils from './utils';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

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
    const dateRange = utils.getDateRange(period || 'today');

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

    res.json({
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

// Serve index.html for all other routes
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🌤️  Weather Forecast Server running on http://localhost:${PORT}`);
  console.log(`📡 IMS API Token: ${process.env.IMS_API_TOKEN ? '✓ Configured' : '✗ Missing'}`);
});
