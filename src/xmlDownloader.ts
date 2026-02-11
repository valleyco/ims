/**
 * XML Feed Downloader
 * Downloads all IMS XML/RSS forecast feeds to local storage
 * See docs/IMS_XML_REFERENCE.md for IMS update schedule and feed structure
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

export interface FeedDefinition {
  id: string;
  name: string;
  url: string;
  filename: string;
  /** Alternate URLs to try if primary fails (e.g. rss_ims path) */
  alternateUrls?: string[];
}

const IMS_BASE = 'https://ims.gov.il/sites/default/files';

/**
 * URL patterns to try. IMS may use ims_data/xml_files/ or rss_ims/.
 * See docs/URL_DISCOVERY_GUIDE.md to discover actual URLs via browser DevTools.
 */
const URL_PATTERNS = {
  ims_data: (path: string) => `${IMS_BASE}/ims_data/xml_files/${path}`,
  rss_ims: (filename: string) => `${IMS_BASE}/rss_ims/${filename}`
};

/**
 * Aggregated forecast (all cities, 1 week, 6hr intervals).
 * Used by israel-weather-rs project - different XML structure than per-city RSS.
 * See docs/IMS_XML_REFERENCE.md
 */
export const AGGREGATED_FORECAST_URL = `${IMS_BASE}/ims_data/xml_files/isr_cities_1week_6hr_forecast.xml`;

/**
 * All IMS RSS/XML feed URLs
 * Tries primary URL first, then rss_ims alternate if configured
 */
export const FEEDS: FeedDefinition[] = [
  // Optional: Aggregated forecast (all cities in one file - different parser needed)
  {
    id: 'aggregated',
    name: 'Aggregated Cities Forecast (1 week)',
    url: AGGREGATED_FORECAST_URL,
    filename: 'isr_cities_1week_6hr_forecast.xml'
  },
  // Country forecast
  {
    id: 'country',
    name: 'Country Forecast',
    url: URL_PATTERNS.ims_data('Forecast_eng.xml'),
    filename: 'forecast_country.xml',
    alternateUrls: [URL_PATTERNS.rss_ims('forecast_country_eng.xml')]
  },
  
  // City forecasts (15 cities) - IMS IDs: 31,6,8,75,3,40,1,77,76,78,80,33,50,79,2
  { id: 'city_jerusalem', name: 'Jerusalem Forecast', url: URL_PATTERNS.ims_data('locality/Forecast_locality_31_eng.xml'), filename: 'forecast_city_jerusalem.xml', alternateUrls: [URL_PATTERNS.rss_ims('forecast_locality_31_eng.xml')] },
  { id: 'city_telaviv', name: 'Tel Aviv Forecast', url: URL_PATTERNS.ims_data('locality/Forecast_locality_1_eng.xml'), filename: 'forecast_city_telaviv.xml', alternateUrls: [URL_PATTERNS.rss_ims('forecast_locality_1_eng.xml')] },
  { id: 'city_haifa', name: 'Haifa Forecast', url: URL_PATTERNS.ims_data('locality/Forecast_locality_6_eng.xml'), filename: 'forecast_city_haifa.xml', alternateUrls: [URL_PATTERNS.rss_ims('forecast_locality_6_eng.xml')] },
  { id: 'city_beersheva', name: 'Beer Sheva Forecast', url: URL_PATTERNS.ims_data('locality/Forecast_locality_8_eng.xml'), filename: 'forecast_city_beersheva.xml', alternateUrls: [URL_PATTERNS.rss_ims('forecast_locality_8_eng.xml')] },
  { id: 'city_eilat', name: 'Eilat Forecast', url: URL_PATTERNS.ims_data('locality/Forecast_locality_75_eng.xml'), filename: 'forecast_city_eilat.xml', alternateUrls: [URL_PATTERNS.rss_ims('forecast_locality_75_eng.xml')] },
  { id: 'city_tiberias', name: 'Tiberias Forecast', url: URL_PATTERNS.ims_data('locality/Forecast_locality_3_eng.xml'), filename: 'forecast_city_tiberias.xml', alternateUrls: [URL_PATTERNS.rss_ims('forecast_locality_3_eng.xml')] },
  { id: 'city_nazareth', name: 'Nazareth Forecast', url: URL_PATTERNS.ims_data('locality/Forecast_locality_40_eng.xml'), filename: 'forecast_city_nazareth.xml', alternateUrls: [URL_PATTERNS.rss_ims('forecast_locality_40_eng.xml')] },
  { id: 'city_afula', name: 'Afula Forecast', url: URL_PATTERNS.ims_data('locality/Forecast_locality_77_eng.xml'), filename: 'forecast_city_afula.xml', alternateUrls: [URL_PATTERNS.rss_ims('forecast_locality_77_eng.xml')] },
  { id: 'city_beitdagan', name: 'Beit Dagan Forecast', url: URL_PATTERNS.ims_data('locality/Forecast_locality_76_eng.xml'), filename: 'forecast_city_beitdagan.xml', alternateUrls: [URL_PATTERNS.rss_ims('forecast_locality_76_eng.xml')] },
  { id: 'city_zefat', name: 'Zefat Forecast', url: URL_PATTERNS.ims_data('locality/Forecast_locality_78_eng.xml'), filename: 'forecast_city_zefat.xml', alternateUrls: [URL_PATTERNS.rss_ims('forecast_locality_78_eng.xml')] },
  { id: 'city_lod', name: 'Lod Forecast', url: URL_PATTERNS.ims_data('locality/Forecast_locality_80_eng.xml'), filename: 'forecast_city_lod.xml', alternateUrls: [URL_PATTERNS.rss_ims('forecast_locality_80_eng.xml')] },
  { id: 'city_dimona', name: 'Dimona Forecast', url: URL_PATTERNS.ims_data('locality/Forecast_locality_33_eng.xml'), filename: 'forecast_city_dimona.xml', alternateUrls: [URL_PATTERNS.rss_ims('forecast_locality_33_eng.xml')] },
  { id: 'city_yotvata', name: 'Yotvata Forecast', url: URL_PATTERNS.ims_data('locality/Forecast_locality_50_eng.xml'), filename: 'forecast_city_yotvata.xml', alternateUrls: [URL_PATTERNS.rss_ims('forecast_locality_50_eng.xml')] },
  { id: 'city_deadsea', name: 'Dead Sea Forecast', url: URL_PATTERNS.ims_data('locality/Forecast_locality_79_eng.xml'), filename: 'forecast_city_deadsea.xml', alternateUrls: [URL_PATTERNS.rss_ims('forecast_locality_79_eng.xml')] },
  { id: 'city_mitzperamon', name: 'Mitzpe Ramon Forecast', url: URL_PATTERNS.ims_data('locality/Forecast_locality_2_eng.xml'), filename: 'forecast_city_mitzperamon.xml', alternateUrls: [URL_PATTERNS.rss_ims('forecast_locality_2_eng.xml')] },
  
  // Sea forecasts - IDs: 212, 213, 211, 214
  { id: 'sea_haifa', name: 'Haifa Port Sea Forecast', url: URL_PATTERNS.ims_data('sea/Forecast_sea_212_eng.xml'), filename: 'forecast_sea_haifa.xml', alternateUrls: [URL_PATTERNS.rss_ims('forecast_sea_212_eng.xml')] },
  { id: 'sea_ashdod', name: 'Ashdod Port Sea Forecast', url: URL_PATTERNS.ims_data('sea/Forecast_sea_213_eng.xml'), filename: 'forecast_sea_ashdod.xml', alternateUrls: [URL_PATTERNS.rss_ims('forecast_sea_213_eng.xml')] },
  { id: 'sea_ashkelon', name: 'Ashkelon Sea Forecast', url: URL_PATTERNS.ims_data('sea/Forecast_sea_211_eng.xml'), filename: 'forecast_sea_ashkelon.xml', alternateUrls: [URL_PATTERNS.rss_ims('forecast_sea_211_eng.xml')] },
  { id: 'sea_eilat', name: 'Eilat Sea Forecast', url: URL_PATTERNS.ims_data('sea/Forecast_sea_214_eng.xml'), filename: 'forecast_sea_eilat.xml', alternateUrls: [URL_PATTERNS.rss_ims('forecast_sea_214_eng.xml')] },
  
  // UVI forecast
  { id: 'uvi', name: 'UVI Forecast', url: URL_PATTERNS.ims_data('IMSUVI_eng.xml'), filename: 'forecast_uvi.xml', alternateUrls: [URL_PATTERNS.rss_ims('IMSUVI_eng.xml')] },
  
  // Alerts - country wide
  { id: 'alert_country_all', name: 'All Country Warnings', url: URL_PATTERNS.ims_data('warnings/WarningsENG.xml'), filename: 'alerts_country_all.xml', alternateUrls: [URL_PATTERNS.rss_ims('WarningsENG.xml')] },
  { id: 'alert_country_visibility', name: 'Visibility Warnings', url: URL_PATTERNS.ims_data('warnings/VisibilityWarningsENG.xml'), filename: 'alerts_country_visibility.xml', alternateUrls: [URL_PATTERNS.rss_ims('VisibilityWarningsENG.xml')] },
  { id: 'alert_country_sea', name: 'Marine Warnings', url: URL_PATTERNS.ims_data('warnings/SeaWarningsENG.xml'), filename: 'alerts_country_sea.xml', alternateUrls: [URL_PATTERNS.rss_ims('SeaWarningsENG.xml')] },
  // Regional alerts
  { id: 'alert_north_flood', name: 'North Flood Warnings', url: URL_PATTERNS.ims_data('warnings/FloodWarningsNorthENG.xml'), filename: 'alerts_north_flood.xml', alternateUrls: [URL_PATTERNS.rss_ims('FloodWarningsNorthENG.xml')] },
  { id: 'alert_north_storm', name: 'North Storm Warnings', url: URL_PATTERNS.ims_data('warnings/StormWarningsNorthENG.xml'), filename: 'alerts_north_storm.xml', alternateUrls: [URL_PATTERNS.rss_ims('StormWarningsNorthENG.xml')] },
  { id: 'alert_north_fire', name: 'North Fire Warnings', url: URL_PATTERNS.ims_data('warnings/FireWarningsNorthENG.xml'), filename: 'alerts_north_fire.xml', alternateUrls: [URL_PATTERNS.rss_ims('FireWarningsNorthENG.xml')] },
  { id: 'alert_center_flood', name: 'Center Flood Warnings', url: URL_PATTERNS.ims_data('warnings/FloodWarningsCenterENG.xml'), filename: 'alerts_center_flood.xml', alternateUrls: [URL_PATTERNS.rss_ims('FloodWarningsCenterENG.xml')] },
  { id: 'alert_center_storm', name: 'Center Storm Warnings', url: URL_PATTERNS.ims_data('warnings/StormWarningsCenterENG.xml'), filename: 'alerts_center_storm.xml', alternateUrls: [URL_PATTERNS.rss_ims('StormWarningsCenterENG.xml')] },
  { id: 'alert_center_fire', name: 'Center Fire Warnings', url: URL_PATTERNS.ims_data('warnings/FireWarningsCenterENG.xml'), filename: 'alerts_center_fire.xml', alternateUrls: [URL_PATTERNS.rss_ims('FireWarningsCenterENG.xml')] },
  { id: 'alert_south_flood', name: 'South Flood Warnings', url: URL_PATTERNS.ims_data('warnings/FloodWarningsSouthENG.xml'), filename: 'alerts_south_flood.xml', alternateUrls: [URL_PATTERNS.rss_ims('FloodWarningsSouthENG.xml')] },
  { id: 'alert_south_storm', name: 'South Storm Warnings', url: URL_PATTERNS.ims_data('warnings/StormWarningsSouthENG.xml'), filename: 'alerts_south_storm.xml', alternateUrls: [URL_PATTERNS.rss_ims('StormWarningsSouthENG.xml')] },
  { id: 'alert_south_fire', name: 'South Fire Warnings', url: URL_PATTERNS.ims_data('warnings/FireWarningsSouthENG.xml'), filename: 'alerts_south_fire.xml', alternateUrls: [URL_PATTERNS.rss_ims('FireWarningsSouthENG.xml')] }
];

export interface DownloadResult {
  feed: FeedDefinition;
  success: boolean;
  error?: string;
  filepath?: string;
  size?: number;
}

export interface DownloadMetadata {
  timestamp: string;
  directory: string;
  total: number;
  successful: number;
  failed: number;
  results: DownloadResult[];
}

/**
 * Create timestamped directory for downloads
 * Returns: data/YYYY-MM-DD/HH-MM-SS/
 */
export function createTimestampedDirectory(): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  
  const dataDir = path.join(process.cwd(), 'data');
  const dateDir = path.join(dataDir, dateStr);
  const timestampDir = path.join(dateDir, timeStr);
  
  // Create directories if they don't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dateDir)) {
    fs.mkdirSync(dateDir, { recursive: true });
  }
  if (!fs.existsSync(timestampDir)) {
    fs.mkdirSync(timestampDir, { recursive: true });
  }
  
  return timestampDir;
}

/**
 * Attempt to download from a single URL
 */
async function tryDownload(url: string): Promise<{ ok: boolean; content?: string; error?: string }> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
    const content = await response.text();
    return { ok: true, content };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Download a single XML feed, trying alternate URLs (e.g. rss_ims) if primary fails
 */
async function downloadFeed(
  feed: FeedDefinition,
  targetDir: string
): Promise<DownloadResult> {
  const urlsToTry = [feed.url, ...(feed.alternateUrls || [])];
  let lastError = '';

  for (let i = 0; i < urlsToTry.length; i++) {
    const url = urlsToTry[i];
    const urlLabel = i === 0 ? 'primary' : `alternate (rss_ims)`;
    console.log(`Downloading: ${feed.name} from ${urlLabel} [${url}]`);

    const result = await tryDownload(url);
    if (result.ok && result.content) {
      const filepath = path.join(targetDir, feed.filename);
      fs.writeFileSync(filepath, result.content, 'utf8');
      const stats = fs.statSync(filepath);
      console.log(`✓ Downloaded: ${feed.name} (${stats.size} bytes)`);
      return { feed, success: true, filepath, size: stats.size };
    }
    lastError = result.error || 'Unknown error';
    if (i < urlsToTry.length - 1) {
      console.log(`  → Primary failed, trying rss_ims pattern...`);
    }
  }

  console.error(`✗ Failed: ${feed.name} - ${lastError}`);
  return { feed, success: false, error: lastError };
}

/**
 * Download all XML feeds
 */
export async function downloadAllFeeds(): Promise<DownloadMetadata> {
  const targetDir = createTimestampedDirectory();
  console.log(`\nDownloading to: ${targetDir}\n`);
  
  const results: DownloadResult[] = [];
  
  // Download feeds sequentially to avoid overwhelming the server
  for (const feed of FEEDS) {
    const result = await downloadFeed(feed, targetDir);
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  const metadata: DownloadMetadata = {
    timestamp: new Date().toISOString(),
    directory: targetDir,
    total: results.length,
    successful,
    failed,
    results
  };
  
  // Save metadata
  const metadataPath = path.join(targetDir, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  
  console.log(`\n=== Download Complete ===`);
  console.log(`Total: ${metadata.total}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Directory: ${targetDir}\n`);
  
  return metadata;
}

/**
 * Get the most recent download directory
 */
export function getMostRecentDownloadDir(): string | null {
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    return null;
  }
  
  const dateDirs = fs.readdirSync(dataDir)
    .filter(name => /^\d{4}-\d{2}-\d{2}$/.test(name))
    .sort()
    .reverse();
  
  if (dateDirs.length === 0) {
    return null;
  }
  
  const latestDateDir = path.join(dataDir, dateDirs[0]);
  const timeDirs = fs.readdirSync(latestDateDir)
    .filter(name => /^\d{2}-\d{2}-\d{2}$/.test(name))
    .sort()
    .reverse();
  
  if (timeDirs.length === 0) {
    return null;
  }
  
  return path.join(latestDateDir, timeDirs[0]);
}

/**
 * Clean up old download directories (keep last N days)
 */
export function cleanOldDownloads(daysToKeep: number = 7): void {
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    return;
  }
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];
  
  const dateDirs = fs.readdirSync(dataDir)
    .filter(name => /^\d{4}-\d{2}-\d{2}$/.test(name));
  
  for (const dateDir of dateDirs) {
    if (dateDir < cutoffStr) {
      const dirPath = path.join(dataDir, dateDir);
      console.log(`Removing old data: ${dirPath}`);
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  }
}
