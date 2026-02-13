/**
 * Test Mock Utilities for Forecast Data
 * 
 * Provides pre-generated test fixtures and utilities for testing forecast-related functionality.
 * These are test-specific helpers and should NOT be used in production code.
 */

import { DailyForecast, HourlyForecast } from '../../src/utils';

/**
 * Preset daily forecast fixture for testing
 * Provides consistent test data for 7 days starting from 2026-02-11
 */
export const mockDailyForecastFixture: DailyForecast[] = [
  {
    date: '2026-02-11',
    tempMin: '15.0',
    tempMax: '23.0',
    humidity: '65',
    windSpeed: '3.5',
    rain: null
  },
  {
    date: '2026-02-12',
    tempMin: '16.0',
    tempMax: '24.0',
    humidity: '62',
    windSpeed: '4.2',
    rain: null
  },
  {
    date: '2026-02-13',
    tempMin: '17.0',
    tempMax: '25.0',
    humidity: '60',
    windSpeed: '3.8',
    rain: '2.5'
  },
  {
    date: '2026-02-14',
    tempMin: '16.5',
    tempMax: '24.5',
    humidity: '68',
    windSpeed: '4.0',
    rain: null
  },
  {
    date: '2026-02-15',
    tempMin: '15.5',
    tempMax: '23.5',
    humidity: '66',
    windSpeed: '3.2',
    rain: null
  },
  {
    date: '2026-02-16',
    tempMin: '14.0',
    tempMax: '22.0',
    humidity: '70',
    windSpeed: '5.0',
    rain: '1.8'
  },
  {
    date: '2026-02-17',
    tempMin: '13.5',
    tempMax: '21.5',
    humidity: '72',
    windSpeed: '4.5',
    rain: null
  }
];

/**
 * Preset hourly forecast fixture for testing
 * Provides consistent test data for 24 hours on 2026-02-11
 */
export const mockHourlyForecastFixture: HourlyForecast[] = [
  {
    time: '2026-02-11 00:00',
    temp: '15.0',
    humidity: '70',
    windSpeed: '3.5',
    windDir: '45',
    rain: null
  },
  {
    time: '2026-02-11 06:00',
    temp: '14.5',
    humidity: '72',
    windSpeed: '3.2',
    windDir: '50',
    rain: null
  },
  {
    time: '2026-02-11 12:00',
    temp: '22.0',
    humidity: '55',
    windSpeed: '4.5',
    windDir: '90',
    rain: null
  },
  {
    time: '2026-02-11 18:00',
    temp: '19.0',
    humidity: '62',
    windSpeed: '4.0',
    windDir: '120',
    rain: null
  },
  {
    time: '2026-02-11 23:00',
    temp: '16.0',
    humidity: '68',
    windSpeed: '3.8',
    windDir: '75',
    rain: null
  }
];

/**
 * Generate mock forecast for testing with edge cases
 * Includes options for empty data, extreme temperatures, error conditions
 */
export interface MockForecastOptions {
  includeNullValues?: boolean;
  extremeTemperatures?: boolean;
  missingFields?: boolean;
  emptyResult?: boolean;
}

/**
 * Generate customizable daily forecast mock for testing
 */
export function generateTestDailyForecast(
  days: number,
  options: MockForecastOptions = {}
): DailyForecast[] {
  if (options.emptyResult) {
    return [];
  }

  const forecasts: DailyForecast[] = [];
  const baseDate = new Date('2026-02-11');

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    const baseTemp = options.extremeTemperatures ? 40 : 18;
    
    forecasts.push({
      date: dateStr,
      tempMin: options.missingFields ? undefined : `${baseTemp - 5}`,
      tempMax: `${baseTemp + 5}`,
      humidity: `${65}`,
      windSpeed: `${3.5}`,
      rain: options.includeNullValues ? null : undefined
    } as DailyForecast);
  }

  return forecasts;
}

/**
 * Generate customizable hourly forecast mock for testing
 */
export function generateTestHourlyForecast(
  hours: number,
  options: MockForecastOptions = {}
): HourlyForecast[] {
  if (options.emptyResult) {
    return [];
  }

  const forecasts: HourlyForecast[] = [];
  const baseDate = new Date('2026-02-11T00:00:00Z');

  for (let i = 0; i < hours; i++) {
    const currentHour = new Date(baseDate);
    currentHour.setHours(baseDate.getHours() + i);
    
    const year = currentHour.getUTCFullYear();
    const month = String(currentHour.getUTCMonth() + 1).padStart(2, '0');
    const day = String(currentHour.getUTCDate()).padStart(2, '0');
    const hour = String(currentHour.getUTCHours()).padStart(2, '0');
    const timeStr = `${year}-${month}-${day} ${hour}:00`;

    const baseTemp = options.extremeTemperatures ? 45 : 20;

    forecasts.push({
      time: timeStr,
      temp: options.missingFields ? undefined : `${baseTemp}`,
      humidity: `${65}`,
      windSpeed: `${4.0}`,
      windDir: options.includeNullValues ? null : `${90}`,
      rain: options.includeNullValues ? null : undefined
    } as HourlyForecast);
  }

  return forecasts;
}

/**
 * Mock API response structure for forecast endpoint
 */
export function mockForecastApiResponse(
  period: 'today' | 'week' | 'month',
  source: 'xml' | 'station' | 'fallback' = 'xml'
) {
  const isHourly = period === 'today';
  
  return {
    source,
    stationId: '178',
    period,
    dateRange: {
      from: '2026-02-11',
      to: period === 'today' ? '2026-02-12' : period === 'week' ? '2026-02-17' : '2026-03-12'
    },
    forecast: isHourly ? mockHourlyForecastFixture : mockDailyForecastFixture
  };
}
