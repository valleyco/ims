/**
 * XML/RSS Parser
 * Parses IMS XML/RSS forecast feeds into structured data
 */

import xml2js from 'xml2js';
import fs from 'fs';

export interface RSSItem {
  title?: string[];
  description?: string[];
  pubDate?: string[];
  guid?: string[];
  link?: string[];
}

export interface RSSChannel {
  title?: string[];
  description?: string[];
  link?: string[];
  pubDate?: string[];
  item?: RSSItem[];
}

export interface RSSFeed {
  rss?: {
    channel?: RSSChannel[];
  };
}

export interface ParsedForecast {
  title: string;
  description: string;
  pubDate: string;
  link?: string;
}

export interface ParsedAlert {
  title: string;
  description: string;
  pubDate: string;
  severity?: string;
  regions?: string[];
}

/**
 * Parse XML string to JavaScript object
 */
export async function parseXML(xmlString: string): Promise<any> {
  const parser = new xml2js.Parser({
    explicitArray: true,
    trim: true,
    normalize: true
  });
  
  try {
    return await parser.parseStringPromise(xmlString);
  } catch (error) {
    throw new Error(`XML parsing error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parse RSS feed to extract forecast items
 */
export async function parseForecastFeed(xmlString: string): Promise<ParsedForecast[]> {
  const parsed = await parseXML(xmlString) as RSSFeed;
  
  if (!parsed.rss || !parsed.rss.channel || !parsed.rss.channel[0]) {
    throw new Error('Invalid RSS structure');
  }
  
  const channel = parsed.rss.channel[0];
  const items = channel.item || [];
  
  return items.map(item => ({
    title: item.title ? item.title[0] : '',
    description: item.description ? item.description[0] : '',
    pubDate: item.pubDate ? item.pubDate[0] : '',
    link: item.link ? item.link[0] : undefined
  }));
}

/**
 * Parse alert/warning feed
 */
export async function parseAlertFeed(xmlString: string): Promise<ParsedAlert[]> {
  const forecasts = await parseForecastFeed(xmlString);
  
  return forecasts.map(forecast => ({
    ...forecast,
    severity: extractSeverity(forecast.description),
    regions: extractRegions(forecast.description)
  }));
}

/**
 * Extract severity from alert description
 */
function extractSeverity(description: string): string | undefined {
  const severityMatch = description.match(/severity:\s*(high|medium|low)/i);
  return severityMatch ? severityMatch[1].toLowerCase() : undefined;
}

/**
 * Extract regions from alert description
 */
function extractRegions(description: string): string[] {
  const regions: string[] = [];
  const regionsMatch = description.match(/regions?:\s*([^.]+)/i);
  
  if (regionsMatch) {
    const regionText = regionsMatch[1];
    regions.push(...regionText.split(',').map(r => r.trim()));
  }
  
  return regions;
}

/**
 * Read and parse XML file
 */
export async function parseXMLFile(filepath: string): Promise<ParsedForecast[]> {
  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filepath}`);
  }
  
  const xmlContent = fs.readFileSync(filepath, 'utf8');
  return await parseForecastFeed(xmlContent);
}

/**
 * Get city forecast from most recent download
 */
export async function getCityForecast(
  cityId: string,
  downloadDir: string
): Promise<ParsedForecast[]> {
  const filename = `forecast_city_${cityId}.xml`;
  const filepath = `${downloadDir}/${filename}`;
  
  return await parseXMLFile(filepath);
}

/**
 * Get country forecast
 */
export async function getCountryForecast(
  downloadDir: string
): Promise<ParsedForecast[]> {
  const filepath = `${downloadDir}/forecast_country.xml`;
  return await parseXMLFile(filepath);
}

/**
 * Get sea forecast
 */
export async function getSeaForecast(
  location: string,
  downloadDir: string
): Promise<ParsedForecast[]> {
  const filename = `forecast_sea_${location}.xml`;
  const filepath = `${downloadDir}/${filename}`;
  
  return await parseXMLFile(filepath);
}

/**
 * Get UVI forecast
 */
export async function getUVIForecast(
  downloadDir: string
): Promise<ParsedForecast[]> {
  const filepath = `${downloadDir}/forecast_uvi.xml`;
  return await parseXMLFile(filepath);
}

/**
 * Get all active alerts
 */
export async function getAllAlerts(
  downloadDir: string
): Promise<ParsedAlert[]> {
  const alertFiles = [
    'alerts_country_all.xml',
    'alerts_country_visibility.xml',
    'alerts_country_sea.xml',
    'alerts_north_flood.xml',
    'alerts_north_storm.xml',
    'alerts_north_fire.xml',
    'alerts_center_flood.xml',
    'alerts_center_storm.xml',
    'alerts_center_fire.xml',
    'alerts_south_flood.xml',
    'alerts_south_storm.xml',
    'alerts_south_fire.xml'
  ];
  
  const allAlerts: ParsedAlert[] = [];
  
  for (const filename of alertFiles) {
    const filepath = `${downloadDir}/${filename}`;
    
    if (fs.existsSync(filepath)) {
      try {
        const xmlContent = fs.readFileSync(filepath, 'utf8');
        const alerts = await parseAlertFeed(xmlContent);
        
        // Only include alerts with actual content (not empty feeds)
        if (alerts.length > 0 && alerts[0].description.trim() !== '') {
          allAlerts.push(...alerts);
        }
      } catch (error) {
        console.warn(`Failed to parse ${filename}:`, error);
      }
    }
  }
  
  return allAlerts;
}

/**
 * Check if XML file exists in download directory
 */
export function xmlFileExists(downloadDir: string, filename: string): boolean {
  const filepath = `${downloadDir}/${filename}`;
  return fs.existsSync(filepath);
}
