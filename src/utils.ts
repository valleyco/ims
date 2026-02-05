/**
 * Utility Functions
 * Helper functions for weather calculations and data processing
 */

import { ChannelDataItem } from './imsApi';

// Type definitions

export interface DateRange {
  from: string;
  to: string;
}

export interface HourlyForecast {
  time: string;
  temp: string | null;
  humidity: string | null;
  windSpeed: string | null;
  windDir: string | null;
  rain: string | null;
}

export interface DailyForecast {
  date: string;
  tempMin: string | null;
  tempMax: string | null;
  tempCurrent: string | null;
  humidity: string | null;
  windSpeed: string | null;
  rain: string | null;
}

interface HourlyDataAccumulator {
  time: string;
  temp: number[];
  humidity: number[];
  windSpeed: number[];
  windDir: number[];
  rain: number[];
}

interface DailyDataAccumulator {
  date: string;
  temps: number[];
  lastTemp: number | null;
  lastTempTime: Date | null;
  humidity: number[];
  windSpeed: number[];
  rain: number[];
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get date range based on period (looking backwards for historical data)
 * @param {string} period - 'today', 'week', or 'month'
 * @returns {DateRange} Object with 'from' and 'to' date strings (YYYY-MM-DD)
 */
export function getDateRange(period: string): DateRange {
  const now = new Date();
  // Use UTC to avoid timezone issues
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const startDate = new Date(today);
  
  switch (period) {
    case 'today':
      // Last 2 days (48 hours) for hourly forecast
      startDate.setUTCDate(today.getUTCDate() - 2);
      break;
    case 'week':
      // Last 7 days for daily forecast
      startDate.setUTCDate(today.getUTCDate() - 7);
      break;
    case 'month':
      // Last 30 days for daily forecast
      startDate.setUTCDate(today.getUTCDate() - 30);
      break;
    default:
      startDate.setUTCDate(today.getUTCDate() - 2);
  }
  
  return {
    from: startDate.toISOString().split('T')[0],
    to: today.toISOString().split('T')[0]
  };
}

/**
 * Aggregate channel data by hour
 * @param {ChannelDataItem[]} channels - Array of channel data objects
 * @returns {HourlyForecast[]} Array of hourly aggregated data
 */
export function aggregateHourly(channels: ChannelDataItem[]): HourlyForecast[] {
  const hourlyData: Record<string, HourlyDataAccumulator> = {};

  channels.forEach(channel => {
    if (!channel.data || !channel.data.data) return;

    channel.data.data.forEach(reading => {
      const date = new Date(reading.datetime);
      const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;

      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = {
          time: hourKey,
          temp: [],
          humidity: [],
          windSpeed: [],
          windDir: [],
          rain: []
        };
      }

      if (reading.channels && reading.channels[0]) {
        const value = reading.channels[0].value;
        switch (channel.channelId) {
          case 7: hourlyData[hourKey].temp.push(value); break;
          case 8: hourlyData[hourKey].humidity.push(value); break;
          case 4: hourlyData[hourKey].windSpeed.push(value); break;
          case 5: hourlyData[hourKey].windDir.push(value); break;
          case 1: hourlyData[hourKey].rain.push(value); break;
        }
      }
    });
  });

  // Calculate averages
  return Object.values(hourlyData).map(hour => ({
    time: hour.time,
    temp: hour.temp.length ? (hour.temp.reduce((a, b) => a + b, 0) / hour.temp.length).toFixed(1) : null,
    humidity: hour.humidity.length ? (hour.humidity.reduce((a, b) => a + b, 0) / hour.humidity.length).toFixed(0) : null,
    windSpeed: hour.windSpeed.length ? (hour.windSpeed.reduce((a, b) => a + b, 0) / hour.windSpeed.length).toFixed(1) : null,
    windDir: hour.windDir.length ? (hour.windDir.reduce((a, b) => a + b, 0) / hour.windDir.length).toFixed(0) : null,
    rain: hour.rain.length ? hour.rain.reduce((a, b) => a + b, 0).toFixed(1) : null
  })).sort((a, b) => a.time.localeCompare(b.time));
}

/**
 * Aggregate channel data by day (min/max/current)
 * @param {ChannelDataItem[]} channels - Array of channel data objects
 * @returns {DailyForecast[]} Array of daily aggregated data
 */
export function aggregateDaily(channels: ChannelDataItem[]): DailyForecast[] {
  const dailyData: Record<string, DailyDataAccumulator> = {};

  // First pass: collect all data points
  channels.forEach(channel => {
    if (!channel.data || !channel.data.data) return;

    channel.data.data.forEach(reading => {
      const date = new Date(reading.datetime);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      if (!dailyData[dayKey]) {
        dailyData[dayKey] = {
          date: dayKey,
          temps: [],
          lastTemp: null,
          lastTempTime: null,
          humidity: [],
          windSpeed: [],
          rain: []
        };
      }

      if (reading.channels && reading.channels[0]) {
        const value = reading.channels[0].value;
        const readingTime = new Date(reading.datetime);
        
        switch (channel.channelId) {
          case 7: // Temperature
            dailyData[dayKey].temps.push(value);
            // Track latest temperature
            if (!dailyData[dayKey].lastTempTime || readingTime > dailyData[dayKey].lastTempTime) {
              dailyData[dayKey].lastTemp = value;
              dailyData[dayKey].lastTempTime = readingTime;
            }
            break;
          case 8: dailyData[dayKey].humidity.push(value); break;
          case 4: dailyData[dayKey].windSpeed.push(value); break;
          case 1: dailyData[dayKey].rain.push(value); break;
        }
      }
    });
  });

  // Calculate min/max/current and format
  return Object.values(dailyData).map(day => ({
    date: day.date,
    tempMin: day.temps.length ? Math.min(...day.temps).toFixed(1) : null,
    tempMax: day.temps.length ? Math.max(...day.temps).toFixed(1) : null,
    tempCurrent: day.lastTemp !== null ? day.lastTemp.toFixed(1) : null,
    humidity: day.humidity.length ? (day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length).toFixed(0) : null,
    windSpeed: day.windSpeed.length ? (day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length).toFixed(1) : null,
    rain: day.rain.length ? day.rain.reduce((a, b) => a + b, 0).toFixed(1) : null
  })).sort((a, b) => a.date.localeCompare(b.date));
}
