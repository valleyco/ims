/**
 * XML Feed Downloader
 * Downloads all IMS XML/RSS forecast feeds to local storage
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

export interface FeedDefinition {
  id: string;
  name: string;
  url: string;
  filename: string;
}

/**
 * All IMS RSS/XML feed URLs
 * Note: These URLs use Angular template variables in the actual IMS site
 * We'll need to discover the actual URLs by inspecting the RSS page
 */
export const FEEDS: FeedDefinition[] = [
  // Country forecast
  {
    id: 'country',
    name: 'Country Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/Forecast_eng.xml',
    filename: 'forecast_country.xml'
  },
  
  // City forecasts (15 cities)
  // These are estimates - actual URLs need to be discovered
  {
    id: 'city_jerusalem',
    name: 'Jerusalem Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/locality/Forecast_locality_31_eng.xml',
    filename: 'forecast_city_jerusalem.xml'
  },
  {
    id: 'city_telaviv',
    name: 'Tel Aviv Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/locality/Forecast_locality_1_eng.xml',
    filename: 'forecast_city_telaviv.xml'
  },
  {
    id: 'city_haifa',
    name: 'Haifa Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/locality/Forecast_locality_6_eng.xml',
    filename: 'forecast_city_haifa.xml'
  },
  {
    id: 'city_beersheva',
    name: 'Beer Sheva Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/locality/Forecast_locality_8_eng.xml',
    filename: 'forecast_city_beersheva.xml'
  },
  {
    id: 'city_eilat',
    name: 'Eilat Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/locality/Forecast_locality_75_eng.xml',
    filename: 'forecast_city_eilat.xml'
  },
  {
    id: 'city_tiberias',
    name: 'Tiberias Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/locality/Forecast_locality_3_eng.xml',
    filename: 'forecast_city_tiberias.xml'
  },
  {
    id: 'city_nazareth',
    name: 'Nazareth Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/locality/Forecast_locality_40_eng.xml',
    filename: 'forecast_city_nazareth.xml'
  },
  {
    id: 'city_afula',
    name: 'Afula Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/locality/Forecast_locality_77_eng.xml',
    filename: 'forecast_city_afula.xml'
  },
  {
    id: 'city_beitdagan',
    name: 'Beit Dagan Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/locality/Forecast_locality_76_eng.xml',
    filename: 'forecast_city_beitdagan.xml'
  },
  {
    id: 'city_zefat',
    name: 'Zefat Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/locality/Forecast_locality_78_eng.xml',
    filename: 'forecast_city_zefat.xml'
  },
  {
    id: 'city_lod',
    name: 'Lod Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/locality/Forecast_locality_80_eng.xml',
    filename: 'forecast_city_lod.xml'
  },
  {
    id: 'city_dimona',
    name: 'Dimona Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/locality/Forecast_locality_33_eng.xml',
    filename: 'forecast_city_dimona.xml'
  },
  {
    id: 'city_yotvata',
    name: 'Yotvata Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/locality/Forecast_locality_50_eng.xml',
    filename: 'forecast_city_yotvata.xml'
  },
  {
    id: 'city_deadsea',
    name: 'Dead Sea Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/locality/Forecast_locality_79_eng.xml',
    filename: 'forecast_city_deadsea.xml'
  },
  {
    id: 'city_mitzperamon',
    name: 'Mitzpe Ramon Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/locality/Forecast_locality_2_eng.xml',
    filename: 'forecast_city_mitzperamon.xml'
  },
  
  // Sea forecasts
  {
    id: 'sea_haifa',
    name: 'Haifa Port Sea Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/sea/Forecast_sea_212_eng.xml',
    filename: 'forecast_sea_haifa.xml'
  },
  {
    id: 'sea_ashdod',
    name: 'Ashdod Port Sea Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/sea/Forecast_sea_213_eng.xml',
    filename: 'forecast_sea_ashdod.xml'
  },
  {
    id: 'sea_ashkelon',
    name: 'Ashkelon Sea Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/sea/Forecast_sea_211_eng.xml',
    filename: 'forecast_sea_ashkelon.xml'
  },
  {
    id: 'sea_eilat',
    name: 'Eilat Sea Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/sea/Forecast_sea_214_eng.xml',
    filename: 'forecast_sea_eilat.xml'
  },
  
  // UVI forecast
  {
    id: 'uvi',
    name: 'UVI Forecast',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/IMSUVI_eng.xml',
    filename: 'forecast_uvi.xml'
  },
  
  // Alerts - country wide
  {
    id: 'alert_country_all',
    name: 'All Country Warnings',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/warnings/WarningsENG.xml',
    filename: 'alerts_country_all.xml'
  },
  {
    id: 'alert_country_visibility',
    name: 'Visibility Warnings',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/warnings/VisibilityWarningsENG.xml',
    filename: 'alerts_country_visibility.xml'
  },
  {
    id: 'alert_country_sea',
    name: 'Marine Warnings',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/warnings/SeaWarningsENG.xml',
    filename: 'alerts_country_sea.xml'
  },
  
  // Regional alerts
  {
    id: 'alert_north_flood',
    name: 'North Flood Warnings',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/warnings/FloodWarningsNorthENG.xml',
    filename: 'alerts_north_flood.xml'
  },
  {
    id: 'alert_north_storm',
    name: 'North Storm Warnings',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/warnings/StormWarningsNorthENG.xml',
    filename: 'alerts_north_storm.xml'
  },
  {
    id: 'alert_north_fire',
    name: 'North Fire Warnings',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/warnings/FireWarningsNorthENG.xml',
    filename: 'alerts_north_fire.xml'
  },
  {
    id: 'alert_center_flood',
    name: 'Center Flood Warnings',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/warnings/FloodWarningsCenterENG.xml',
    filename: 'alerts_center_flood.xml'
  },
  {
    id: 'alert_center_storm',
    name: 'Center Storm Warnings',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/warnings/StormWarningsCenterENG.xml',
    filename: 'alerts_center_storm.xml'
  },
  {
    id: 'alert_center_fire',
    name: 'Center Fire Warnings',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/warnings/FireWarningsCenterENG.xml',
    filename: 'alerts_center_fire.xml'
  },
  {
    id: 'alert_south_flood',
    name: 'South Flood Warnings',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/warnings/FloodWarningsSouthENG.xml',
    filename: 'alerts_south_flood.xml'
  },
  {
    id: 'alert_south_storm',
    name: 'South Storm Warnings',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/warnings/StormWarningsSouthENG.xml',
    filename: 'alerts_south_storm.xml'
  },
  {
    id: 'alert_south_fire',
    name: 'South Fire Warnings',
    url: 'https://ims.gov.il/sites/default/files/ims_data/xml_files/warnings/FireWarningsSouthENG.xml',
    filename: 'alerts_south_fire.xml'
  }
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
 * Download a single XML feed
 */
async function downloadFeed(
  feed: FeedDefinition,
  targetDir: string
): Promise<DownloadResult> {
  try {
    console.log(`Downloading: ${feed.name} from ${feed.url}`);
    
    const response = await fetch(feed.url);
    
    if (!response.ok) {
      return {
        feed,
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
    
    const content = await response.text();
    const filepath = path.join(targetDir, feed.filename);
    
    fs.writeFileSync(filepath, content, 'utf8');
    
    const stats = fs.statSync(filepath);
    
    console.log(`✓ Downloaded: ${feed.name} (${stats.size} bytes)`);
    
    return {
      feed,
      success: true,
      filepath,
      size: stats.size
    };
  } catch (error) {
    console.error(`✗ Failed: ${feed.name}`, error);
    return {
      feed,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
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
