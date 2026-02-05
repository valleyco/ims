import { promises as fs } from 'fs';
import path from 'path';

// Type definitions

export type CacheType = 'stations' | 'forecast';

export interface CacheParams {
  stationId?: number | string;
  from?: string;
  to?: string;
}

export interface CacheOptions<T> {
  fetcher?: () => Promise<T>;
  duration?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface CacheStats {
  memory: {
    entries: number;
  };
  file: {
    entries: number;
    sizeBytes: number;
    sizeMB: string;
  };
}

// Memory cache
const memoryCache = new Map<string, CacheEntry<any>>();

// Cache directory (at project root, not in src/)
const CACHE_DIR = path.join(__dirname, '../.cache');

// Cache durations (in milliseconds)
const CACHE_DURATIONS: Record<CacheType, number> = {
  stations: 48 * 60 * 60 * 1000, // 48 hours
  forecast: 24 * 60 * 60 * 1000   // 24 hours (1 day)
};

/**
 * Initialize cache directory
 */
export async function initCache(): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    console.log('📁 Cache directory initialized:', CACHE_DIR);
  } catch (error) {
    console.error('Error initializing cache directory:', error);
  }
}

/**
 * Generate cache key
 */
function getCacheKey(type: CacheType, params: CacheParams = {}): string | null {
  if (type === 'stations') {
    return 'stations_list';
  }
  if (type === 'forecast') {
    const { stationId, from, to } = params;
    return `forecast_${stationId}_${from}_${to}`;
  }
  return null;
}

/**
 * Get cache file path
 */
function getCacheFilePath(key: string): string {
  return path.join(CACHE_DIR, `${key}.json`);
}

/**
 * Check if cache is expired
 */
function isExpired(timestamp: number, duration: number): boolean {
  return Date.now() - timestamp > duration;
}

/**
 * Get from memory cache
 */
function getFromMemory<T>(key: string, duration: number): T | null {
  const cached = memoryCache.get(key);
  if (!cached) {
    return null;
  }

  if (isExpired(cached.timestamp, duration)) {
    memoryCache.delete(key);
    return null;
  }

  console.log(`✓ Memory cache HIT: ${key}`);
  return cached.data;
}

/**
 * Set in memory cache
 */
function setInMemory<T>(key: string, data: T): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log(`✓ Memory cache SET: ${key}`);
}

/**
 * Get from file cache
 */
async function getFromFile<T>(key: string, duration: number): Promise<T | null> {
  try {
    const filePath = getCacheFilePath(key);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const cached: CacheEntry<T> = JSON.parse(fileContent);

    if (isExpired(cached.timestamp, duration)) {
      await fs.unlink(filePath);
      return null;
    }

    console.log(`✓ File cache HIT: ${key}`);
    // Also store in memory for faster access next time
    setInMemory(key, cached.data);
    return cached.data;
  } catch (error) {
    // File doesn't exist or can't be read
    return null;
  }
}

/**
 * Set in file cache
 */
async function setInFile<T>(key: string, data: T): Promise<void> {
  try {
    const filePath = getCacheFilePath(key);
    const cacheData: CacheEntry<T> = {
      data,
      timestamp: Date.now()
    };
    await fs.writeFile(filePath, JSON.stringify(cacheData), 'utf8');
    console.log(`✓ File cache SET: ${key}`);
  } catch (error) {
    console.error(`Error writing file cache for ${key}:`, error);
  }
}

/**
 * Get data from cache (checks memory first, then file)
 * If cache misses and fetcher is provided, calls fetcher and caches result
 * 
 * @param {CacheType} type - Cache type ('stations' or 'forecast')
 * @param {CacheParams} params - Cache parameters (e.g., { stationId, from, to })
 * @param {CacheOptions<T>} options - Options object
 * @param {Function} options.fetcher - Function to call if cache misses (async function that returns data)
 * @param {number} options.duration - Custom expiration duration in milliseconds (overrides default)
 * 
 * @returns {Promise<T | null>} Cached data, fetched data, or null
 * 
 * @example
 * // Basic usage with fetcher
 * const stations = await cache.get('stations', {}, {
 *   fetcher: async () => await imsApi.getStations()
 * });
 * 
 * @example
 * // With custom expiration (5 minutes)
 * const data = await cache.get('forecast', { stationId: 23 }, {
 *   fetcher: async () => await fetchData(),
 *   duration: 5 * 60 * 1000
 * });
 */
export async function get<T>(
  type: CacheType,
  params: CacheParams = {},
  options: CacheOptions<T> = {}
): Promise<T | null> {
  const key = getCacheKey(type, params);
  if (!key) return null;

  // Use custom duration if provided, otherwise use default
  const duration = options.duration || CACHE_DURATIONS[type];

  // Level 1: Check memory cache
  const memoryData = getFromMemory<T>(key, duration);
  if (memoryData) {
    return memoryData;
  }

  // Level 2: Check file cache
  const fileData = await getFromFile<T>(key, duration);
  if (fileData) {
    return fileData;
  }

  console.log(`✗ Cache MISS: ${key}`);

  // If fetcher function is provided, call it and cache the result
  if (options.fetcher && typeof options.fetcher === 'function') {
    try {
      console.log(`⟳ Fetching data for: ${key}`);
      const data = await options.fetcher();
      
      // Cache the fetched data
      setInMemory(key, data);
      await setInFile(key, data);
      
      return data;
    } catch (error) {
      console.error(`✗ Error fetching data for ${key}:`, error);
      throw error;
    }
  }

  return null;
}

/**
 * Set data in cache (both memory and file)
 */
export async function set<T>(
  type: CacheType,
  data: T,
  params: CacheParams = {}
): Promise<void> {
  const key = getCacheKey(type, params);
  if (!key) return;

  // Set in both levels
  setInMemory(key, data);
  await setInFile(key, data);
}

/**
 * Clear all caches
 */
export async function clear(): Promise<void> {
  // Clear memory
  memoryCache.clear();
  console.log('✓ Memory cache cleared');

  // Clear files
  try {
    const files = await fs.readdir(CACHE_DIR);
    await Promise.all(
      files.map(file => fs.unlink(path.join(CACHE_DIR, file)))
    );
    console.log('✓ File cache cleared');
  } catch (error) {
    console.error('Error clearing file cache:', error);
  }
}

/**
 * Get cache stats
 */
export async function getStats(): Promise<CacheStats> {
  const memorySize = memoryCache.size;

  let fileCount = 0;
  let totalFileSize = 0;

  try {
    const files = await fs.readdir(CACHE_DIR);
    fileCount = files.length;

    for (const file of files) {
      const filePath = path.join(CACHE_DIR, file);
      const stats = await fs.stat(filePath);
      totalFileSize += stats.size;
    }
  } catch (error) {
    // Ignore errors
  }

  return {
    memory: {
      entries: memorySize
    },
    file: {
      entries: fileCount,
      sizeBytes: totalFileSize,
      sizeMB: (totalFileSize / (1024 * 1024)).toFixed(2)
    }
  };
}
