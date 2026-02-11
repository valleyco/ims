/**
 * Mock XML Downloader for Testing
 * Prevents real downloads during tests
 */

import path from 'path';

export interface DownloadResult {
  feed: {
    id: string;
    name: string;
    url: string;
    filename: string;
  };
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
 * Mock downloadAllFeeds - simulates successful download
 */
export async function downloadAllFeeds(): Promise<DownloadMetadata> {
  const testDir = path.join(process.cwd(), 'tests', 'fixtures', 'xml');
  
  return Promise.resolve({
    timestamp: new Date().toISOString(),
    directory: testDir,
    total: 2,
    successful: 2,
    failed: 0,
    results: [
      {
        feed: {
          id: 'city_telaviv',
          name: 'Tel Aviv Forecast',
          url: 'mock://telaviv.xml',
          filename: 'forecast_city_telaviv.xml'
        },
        success: true,
        filepath: path.join(testDir, 'forecast_city_telaviv.xml'),
        size: 1024
      },
      {
        feed: {
          id: 'city_jerusalem',
          name: 'Jerusalem Forecast',
          url: 'mock://jerusalem.xml',
          filename: 'forecast_city_jerusalem.xml'
        },
        success: true,
        filepath: path.join(testDir, 'forecast_city_jerusalem.xml'),
        size: 896
      }
    ]
  });
}

/**
 * Mock getMostRecentDownloadDir - returns test fixtures directory
 */
export function getMostRecentDownloadDir(): string | null {
  return path.join(process.cwd(), 'tests', 'fixtures', 'xml');
}

/**
 * Mock cleanOldDownloads - does nothing in tests
 */
export function cleanOldDownloads(daysToKeep: number = 7): void {
  // No-op in tests
  return;
}

/**
 * Mock getDownloadVersion - returns a test version
 */
export function getDownloadVersion(downloadDir: string): string {
  return '2026-02-11/09-00-00';
}
