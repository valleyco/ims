/**
 * XML Data Manager
 * Manages XML data lifecycle: checking freshness, auto-downloading, validation
 *
 * IMS Update Schedule (from https://ims.gov.il/en/RSS_ForecastAlerts):
 * - Forecasts are updated twice daily (morning and afternoon)
 * - Additional updates when weather conditions change
 * - Stale threshold set to 6h to catch updates promptly
 */

import path from 'path';
import * as xmlDownloader from './xmlDownloader';

export interface DataStatus {
  exists: boolean;
  directory: string | null;
  age: number | null; // Age in hours
  isStale: boolean;
  lastUpdate: Date | null;
  staleSinceHours: number; // Hours since data became stale
}

/**
 * Check the status of downloaded XML data
 * @returns DataStatus object with freshness information
 */
export function getDataStatus(): DataStatus {
  const downloadDir = xmlDownloader.getMostRecentDownloadDir();
  
  if (!downloadDir) {
    return {
      exists: false,
      directory: null,
      age: null,
      isStale: true,
      lastUpdate: null,
      staleSinceHours: Infinity
    };
  }

  try {
    // Read metadata.json to get accurate timestamp
    const fs = require('fs');
    const metadataPath = path.join(downloadDir, 'metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      console.warn(`⚠ No metadata.json found in: ${downloadDir}`);
      return {
        exists: true,
        directory: downloadDir,
        age: null,
        isStale: true,
        lastUpdate: null,
        staleSinceHours: Infinity
      };
    }
    
    const metadataContent = fs.readFileSync(metadataPath, 'utf8');
    const metadata = JSON.parse(metadataContent);
    const lastUpdate = new Date(metadata.timestamp);
    
    if (isNaN(lastUpdate.getTime())) {
      console.warn(`⚠ Invalid timestamp in metadata: ${metadata.timestamp}`);
      return {
        exists: true,
        directory: downloadDir,
        age: null,
        isStale: true,
        lastUpdate: null,
        staleSinceHours: Infinity
      };
    }
    
    const ageMs = Date.now() - lastUpdate.getTime();
    const ageHours = ageMs / (1000 * 60 * 60);

    /** IMS updates twice daily - 6h threshold catches updates promptly. See docs/IMS_XML_REFERENCE.md */
    const STALE_THRESHOLD_HOURS = 6;
    const isStale = ageHours > STALE_THRESHOLD_HOURS;
    const staleSinceHours = isStale ? ageHours - STALE_THRESHOLD_HOURS : 0;
    
    return {
      exists: true,
      directory: downloadDir,
      age: ageHours,
      isStale,
      lastUpdate,
      staleSinceHours
    };
  } catch (error) {
    console.error('Error checking data status:', error);
    return {
      exists: true,
      directory: downloadDir,
      age: null,
      isStale: true,
      lastUpdate: null,
      staleSinceHours: Infinity
    };
  }
}

/**
 * Ensure XML data is fresh, download if necessary
 * @param force Force download even if data is fresh
 * @returns Promise that resolves when data is fresh
 */
export async function ensureFreshData(force: boolean = false): Promise<void> {
  const status = getDataStatus();
  
  if (!status.exists) {
    console.log('📥 No XML data found, downloading...');
    try {
      await xmlDownloader.downloadAllFeeds();
      console.log('✓ Initial XML data downloaded successfully');
    } catch (error) {
      console.error('❌ Failed to download XML data:', error);
      throw new Error('Initial XML download failed');
    }
    return;
  }
  
  if (force) {
    console.log('🔄 Forcing XML data refresh...');
    try {
      await xmlDownloader.downloadAllFeeds();
      xmlDownloader.cleanOldDownloads(7);
      console.log('✓ XML data refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh XML data:', error);
      throw new Error('XML data refresh failed');
    }
    return;
  }
  
  if (status.isStale) {
    const ageStr = status.age?.toFixed(1) || 'unknown';
    console.log(`📥 XML data is ${ageStr}h old (stale), refreshing...`);
    try {
      await xmlDownloader.downloadAllFeeds();
      xmlDownloader.cleanOldDownloads(7);
      console.log('✓ XML data refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh stale XML data:', error);
      console.warn('⚠ Will continue using existing data');
      // Don't throw - continue with stale data rather than failing
    }
    return;
  }
  
  const ageStr = status.age?.toFixed(1) || 'unknown';
  console.log(`✓ XML data is fresh (${ageStr}h old)`);
}

/**
 * Get a human-readable status message
 * @returns Status message string
 */
export function getStatusMessage(): string {
  const status = getDataStatus();
  
  if (!status.exists) {
    return 'No XML data available';
  }
  
  if (!status.age) {
    return 'XML data status unknown';
  }
  
  if (status.isStale) {
    return `XML data is stale (${status.age.toFixed(1)}h old)`;
  }
  
  return `XML data is fresh (${status.age.toFixed(1)}h old)`;
}

/**
 * Check if data needs urgent refresh (very stale)
 * @returns true if data is more than 12 hours old
 */
export function needsUrgentRefresh(): boolean {
  const status = getDataStatus();
  return !status.exists || (status.age !== null && status.age > 12);
}
