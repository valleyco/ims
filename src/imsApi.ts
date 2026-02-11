/**
 * IMS API Client
 * Module for interacting with the Israel Meteorological Service API
 */

import fetch from 'node-fetch';
import { config } from './config';

const IMS_API_BASE = config.IMS_API_BASE;
const IMS_API_TOKEN = config.IMS_API_TOKEN;

// Type definitions for IMS API responses

export interface StationLocation {
  latitude: number;
  longitude: number;
}

export interface Monitor {
  channelId: number;
  name: string;
  alias: string | null;
  active: boolean;
  typeId: number;
  pollutantId: number | null;
  units: string;
  description: string | null;
}

export interface Station {
  stationId: number;
  name: string;
  shortName: string;
  stationsTag: string | null;
  location: StationLocation;
  timebase: number;
  active: boolean;
  owner: string;
  regionId: number;
  monitors: Monitor[];
}

export interface ChannelValue {
  value: number;
  status: string;
  valid: boolean;
}

export interface DataReading {
  datetime: string;
  channels: ChannelValue[];
}

export interface StationDataResponse {
  stationId: number;
  channelId: number;
  data: DataReading[];
}

export interface ChannelDataItem {
  channelId: number;
  data: StationDataResponse;
}

/**
 * Get all weather stations from IMS API
 * @returns {Promise<Station[]>} Array of station objects
 */
export async function getStations(): Promise<Station[]> {
  const response = await fetch(`${IMS_API_BASE}/stations`, {
    headers: {
      'Authorization': `ApiToken ${IMS_API_TOKEN}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`IMS API error: ${response.status}`);
  }
  
  return await response.json() as Station[];
}

/**
 * Get data for a specific station and channel within a date range
 * @param {number} stationId - Station ID
 * @param {number} channelId - Channel ID
 * @param {string} fromDate - Start date (YYYY-MM-DD)
 * @param {string} toDate - End date (YYYY-MM-DD)
 * @returns {Promise<StationDataResponse>} Channel data object
 */
export async function getStationData(
  stationId: number,
  channelId: number,
  fromDate: string,
  toDate: string
): Promise<StationDataResponse> {
  const url = `${IMS_API_BASE}/stations/${stationId}/data/${channelId}?from=${fromDate}&to=${toDate}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `ApiToken ${IMS_API_TOKEN}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`IMS API error: ${response.status}`);
  }
  
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Invalid response format');
  }
  
  return await response.json() as StationDataResponse;
}

/**
 * Get data for multiple channels for a station within a date range
 * @param {number} stationId - Station ID
 * @param {number[]} channelIds - Array of channel IDs
 * @param {string} fromDate - Start date (YYYY-MM-DD)
 * @param {string} toDate - End date (YYYY-MM-DD)
 * @returns {Promise<ChannelDataItem[]>} Array of channel data objects with {channelId, data}
 */
export async function getStationDataMultiChannel(
  stationId: number,
  channelIds: number[],
  fromDate: string,
  toDate: string
): Promise<ChannelDataItem[]> {
  const dataPromises = channelIds.map(async (channelId): Promise<ChannelDataItem | null> => {
    try {
      const data = await getStationData(stationId, channelId, fromDate, toDate);
      return { channelId, data };
    } catch (err) {
      // Silently skip channels that don't exist or have errors
      return null;
    }
  });
  
  const results = await Promise.all(dataPromises);
  return results.filter((r): r is ChannelDataItem => r !== null);
}
