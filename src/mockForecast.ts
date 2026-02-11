/**
 * Mock Forecast Generator
 * Generates synthetic forecast data when XML feeds are unavailable
 * This is useful for development/testing or as a fallback
 */

import { DailyForecast, HourlyForecast } from './utils';

/**
 * Generate mock daily forecast data for testing
 * @param fromDate Start date (YYYY-MM-DD)
 * @param toDate End date (YYYY-MM-DD)
 * @param baseTemp Base temperature for variations
 * @returns Array of daily forecasts
 */
export function generateMockDailyForecast(
  fromDate: string,
  toDate: string,
  baseTemp: number = 18
): DailyForecast[] {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const forecasts: DailyForecast[] = [];

  let currentDate = new Date(from);
  let dayIndex = 0;

  while (currentDate <= to) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Add some variation to temperatures
    const tempVariation = Math.sin(dayIndex * 0.5) * 3; // ±3°C variation
    const dailyVariation = Math.random() * 2 - 1; // ±1°C random

    const tempMin = (baseTemp + tempVariation - 3 + dailyVariation).toFixed(1);
    const tempMax = (baseTemp + tempVariation + 5 + dailyVariation).toFixed(1);
    const tempCurrent = (baseTemp + tempVariation + dailyVariation).toFixed(1);

    // Generate realistic weather values
    const humidity = (60 + Math.random() * 20).toFixed(0); // 60-80%
    const windSpeed = (2 + Math.random() * 5).toFixed(1); // 2-7 m/s
    const rain = Math.random() < 0.2 ? (Math.random() * 5).toFixed(1) : null; // 20% chance of rain

    forecasts.push({
      date: dateStr,
      tempMin,
      tempMax,
      tempCurrent,
      humidity,
      windSpeed,
      rain
    });

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    dayIndex++;
  }

  return forecasts;
}

/**
 * Generate mock hourly forecast data for testing
 * @param fromDate Start date (YYYY-MM-DD)
 * @param toDate End date (YYYY-MM-DD)
 * @param baseTemp Base temperature for variations
 * @returns Array of hourly forecasts
 */
export function generateMockHourlyForecast(
  fromDate: string,
  toDate: string,
  baseTemp: number = 18
): HourlyForecast[] {
  const from = new Date(fromDate + 'T00:00:00Z');
  const to = new Date(toDate + 'T23:59:59Z');
  const forecasts: HourlyForecast[] = [];

  let currentHour = new Date(from);

  while (currentHour <= to) {
    const year = currentHour.getUTCFullYear();
    const month = String(currentHour.getUTCMonth() + 1).padStart(2, '0');
    const day = String(currentHour.getUTCDate()).padStart(2, '0');
    const hour = String(currentHour.getUTCHours()).padStart(2, '0');
    const timeStr = `${year}-${month}-${day} ${hour}:00`;

    // Temperature varies by hour of day (warmer during day, cooler at night)
    const hourOfDay = currentHour.getUTCHours();
    const dailyTempCurve = Math.sin((hourOfDay - 6) * Math.PI / 12) * 4; // ±4°C based on time
    const temp = (baseTemp + dailyTempCurve + Math.random() * 2 - 1).toFixed(1);

    // Humidity inversely correlates with temperature
    const humidity = (70 - dailyTempCurve * 2 + Math.random() * 10).toFixed(0);

    // Wind speed varies
    const windSpeed = (3 + Math.random() * 4).toFixed(1); // 3-7 m/s
    const windDir = (Math.random() * 360).toFixed(0); // 0-360 degrees

    // Occasional rain
    const rain = Math.random() < 0.1 ? (Math.random() * 2).toFixed(1) : null;

    forecasts.push({
      time: timeStr,
      temp,
      humidity,
      windSpeed,
      windDir,
      rain
    });

    currentHour.setUTCHours(currentHour.getUTCHours() + 1);
  }

  return forecasts;
}

/**
 * Generate mock forecast based on period type
 * @param period 'today', 'week', or 'month'
 * @param fromDate Start date (YYYY-MM-DD)
 * @param toDate End date (YYYY-MM-DD)
 * @param baseTemp Base temperature
 * @returns Array of forecasts (hourly or daily)
 */
export function generateMockForecast(
  period: string,
  fromDate: string,
  toDate: string,
  baseTemp: number = 18
): HourlyForecast[] | DailyForecast[] {
  if (period === 'today') {
    return generateMockHourlyForecast(fromDate, toDate, baseTemp);
  } else {
    return generateMockDailyForecast(fromDate, toDate, baseTemp);
  }
}
