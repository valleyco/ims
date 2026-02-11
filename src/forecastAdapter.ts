/**
 * Forecast Adapter
 * Extracts structured data from XML forecast text descriptions
 * Converts textual forecasts into the format expected by the current API
 */

import type { ParsedForecast } from './xmlParser';
import type { HourlyForecast, DailyForecast } from './utils';

export interface ExtractedForecastData {
  temp?: string;
  tempMin?: string;
  tempMax?: string;
  humidity?: string;
  windSpeed?: string;
  windDir?: string;
  rain?: string;
  forecastText: string;
  date?: string;
}

/**
 * Extract temperature from text
 * Patterns: "15°C", "15-20°C", "Temperature 15-20°C", "15 to 20 degrees"
 */
function extractTemperature(text: string): { min?: string; max?: string; avg?: string } {
  // Range: "15-20°C" or "15 to 20°C" or "15-20 degrees"
  const rangeMatch = text.match(/(\d+)\s*[-to]+\s*(\d+)\s*[°degrees]/i);
  if (rangeMatch) {
    const min = rangeMatch[1];
    const max = rangeMatch[2];
    const avg = Math.round((parseInt(min) + parseInt(max)) / 2).toString();
    return { min, max, avg };
  }
  
  // Single value: "15°C" or "Temperature: 15"
  const singleMatch = text.match(/temperature:?\s*(\d+)|(\d+)\s*[°degrees]/i);
  if (singleMatch) {
    const temp = singleMatch[1] || singleMatch[2];
    return { avg: temp };
  }
  
  return {};
}

/**
 * Extract humidity from text
 * Patterns: "Humidity 60%", "60% humidity", "RH: 60"
 */
function extractHumidity(text: string): string | undefined {
  const match = text.match(/humidity:?\s*(\d+)|(\d+)%\s*humidity|RH:?\s*(\d+)/i);
  if (match) {
    return match[1] || match[2] || match[3];
  }
  return undefined;
}

/**
 * Extract wind speed from text
 * Patterns: "10-15 km/h", "West winds 10 km/h", "15 knots"
 * Convert to m/s if needed
 */
function extractWindSpeed(text: string): string | undefined {
  // km/h
  const kmhMatch = text.match(/(\d+)(?:-\d+)?\s*km\/h/i);
  if (kmhMatch) {
    const kmh = parseInt(kmhMatch[1]);
    const ms = (kmh / 3.6).toFixed(1);
    return ms;
  }
  
  // knots
  const knotsMatch = text.match(/(\d+)(?:-\d+)?\s*knots?/i);
  if (knotsMatch) {
    const knots = parseInt(knotsMatch[1]);
    const ms = (knots * 0.514444).toFixed(1);
    return ms;
  }
  
  // m/s (already in correct unit)
  const msMatch = text.match(/(\d+)(?:-\d+)?\s*m\/s/i);
  if (msMatch) {
    return msMatch[1];
  }
  
  return undefined;
}

/**
 * Extract wind direction from text
 * Patterns: "North winds", "NW wind", "westerly"
 * Convert to degrees
 */
function extractWindDirection(text: string): string | undefined {
  const directions: { [key: string]: number } = {
    'north': 0, 'n': 0,
    'northeast': 45, 'ne': 45, 'north-east': 45,
    'east': 90, 'e': 90,
    'southeast': 135, 'se': 135, 'south-east': 135,
    'south': 180, 's': 180,
    'southwest': 225, 'sw': 225, 'south-west': 225,
    'west': 270, 'w': 270,
    'northwest': 315, 'nw': 315, 'north-west': 315
  };
  
  const directionMatch = text.match(/\b(north|south|east|west|n|s|e|w|ne|nw|se|sw|north-east|north-west|south-east|south-west|northeast|northwest|southeast|southwest)\s*(?:wind|winds|erly)?/i);
  
  if (directionMatch) {
    const direction = directionMatch[1].toLowerCase();
    const degrees = directions[direction];
    if (degrees !== undefined) {
      return degrees.toString();
    }
  }
  
  return undefined;
}

/**
 * Extract rainfall from text
 * Patterns: "10mm rain", "rainfall 5-10mm", "precipitation 15mm"
 */
function extractRainfall(text: string): string | undefined {
  const match = text.match(/(?:rain|rainfall|precipitation):?\s*(\d+(?:\.\d+)?)\s*mm/i);
  if (match) {
    return match[1];
  }
  
  // Check for "no rain" or "dry"
  if (/no\s+rain|dry|clear/i.test(text)) {
    return '0';
  }
  
  return undefined;
}

/**
 * Extract date from forecast title or text
 * Patterns: "Feb 9, 2026", "2026-02-09", "Friday, February 9"
 */
function extractDate(title: string, description: string): string | undefined {
  // ISO format: YYYY-MM-DD
  const isoMatch = (title + ' ' + description).match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return isoMatch[0];
  }
  
  // Month Day, Year: "Feb 9, 2026"
  const dateMatch = (title + ' ' + description).match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i);
  if (dateMatch) {
    const months: { [key: string]: string } = {
      'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
      'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
      'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    };
    const month = months[dateMatch[1].toLowerCase().substring(0, 3)];
    const day = dateMatch[2].padStart(2, '0');
    const year = dateMatch[3];
    return `${year}-${month}-${day}`;
  }
  
  return undefined;
}

/**
 * Extract structured forecast data from parsed XML forecast
 */
export function extractForecastData(forecast: ParsedForecast): ExtractedForecastData {
  const text = forecast.title + ' ' + forecast.description;
  const temp = extractTemperature(text);
  
  return {
    temp: temp.avg,
    tempMin: temp.min,
    tempMax: temp.max,
    humidity: extractHumidity(text),
    windSpeed: extractWindSpeed(text),
    windDir: extractWindDirection(text),
    rain: extractRainfall(text),
    forecastText: forecast.description,
    date: extractDate(forecast.title, forecast.description)
  };
}

/**
 * Convert parsed forecasts to hourly format
 * Note: XML provides daily forecasts, so we'll replicate data for each hour
 */
export function convertToHourlyFormat(
  forecasts: ParsedForecast[],
  period: 'today' | 'week' | 'month'
): HourlyForecast[] {
  const hourlyData: HourlyForecast[] = [];
  
  // For "today", we'll create hourly entries for the next 48 hours
  if (period === 'today' && forecasts.length > 0) {
    const forecast = forecasts[0];
    const extracted = extractForecastData(forecast);
    
    const now = new Date();
    
    // Generate 48 hourly entries (today + tomorrow)
    for (let i = 0; i < 48; i++) {
      const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
      const hourStr = hour.toISOString().slice(0, 13).replace('T', ' ') + ':00';
      
      hourlyData.push({
        time: hourStr,
        temp: extracted.temp || 'N/A',
        humidity: extracted.humidity || 'N/A',
        windSpeed: extracted.windSpeed || 'N/A',
        windDir: extracted.windDir || 'N/A',
        rain: extracted.rain || '0.0'
      });
    }
  }
  
  return hourlyData;
}

/**
 * Convert parsed forecasts to daily format
 */
export function convertToDailyFormat(
  forecasts: ParsedForecast[]
): DailyForecast[] {
  const dailyData: DailyForecast[] = [];
  
  for (const forecast of forecasts) {
    const extracted = extractForecastData(forecast);
    
    // Use extracted date or forecast pubDate
    const date = extracted.date || forecast.pubDate.split('T')[0] || new Date().toISOString().split('T')[0];
    
    dailyData.push({
      date,
      tempMin: extracted.tempMin || extracted.temp || 'N/A',
      tempMax: extracted.tempMax || extracted.temp || 'N/A',
      tempCurrent: extracted.temp || 'N/A',
      humidity: extracted.humidity || 'N/A',
      windSpeed: extracted.windSpeed || 'N/A',
      rain: extracted.rain || '0.0'
    });
  }
  
  return dailyData;
}

/**
 * Create a fallback response when XML is unavailable
 */
export function createFallbackResponse(message: string) {
  return {
    source: 'fallback',
    message,
    forecast: []
  };
}

/**
 * Format forecast for API response (matches current API structure)
 */
export function formatForecastResponse(
  stationId: string,
  cityId: string,
  cityName: string,
  period: 'today' | 'week' | 'month',
  dateRange: { from: string; to: string },
  forecasts: ParsedForecast[]
) {
  const response: any = {
    source: 'xml',
    stationId,
    cityId,
    cityName,
    period,
    dateRange
  };
  
  if (period === 'today') {
    response.forecast = convertToHourlyFormat(forecasts, period);
  } else {
    response.forecast = convertToDailyFormat(forecasts);
  }
  
  return response;
}
