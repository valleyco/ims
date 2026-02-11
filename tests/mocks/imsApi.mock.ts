/**
 * Mock IMS API for Testing
 * Prevents real API calls during tests
 */

import stationsData from '../fixtures/api/stations_response.json';
import tempData from '../fixtures/api/station_data_temperature.json';

export const mockStations = stationsData.stations;

export const mockStationData = tempData;

/**
 * Mock getStations - returns fixture data
 */
export async function getStations() {
  return Promise.resolve(mockStations);
}

/**
 * Mock getStationData - returns fixture data
 */
export async function getStationData(stationId: number, channelId: number, from: string, to: string) {
  // Return mock data with the requested parameters
  return Promise.resolve({
    ...mockStationData,
    stationId,
    channelId,
    from,
    to
  });
}

/**
 * Mock getStationDataMultiChannel - returns array of fixture data
 */
export async function getStationDataMultiChannel(
  stationId: number,
  channelIds: number[],
  from: string,
  to: string
) {
  // Return an array of mock channel data
  return Promise.resolve(
    channelIds.map(channelId => ({
      ...mockStationData,
      channelId,
      stationId,
      from,
      to
    }))
  );
}

// Export Station type for tests
export interface Station {
  stationId: number;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  active: boolean;
  monitors: Array<{
    name: string;
    units: string;
  }>;
}

export interface ChannelDataItem {
  channelId: number;
  stationId: number;
  data: {
    channel: {
      name: string;
      units: string;
    };
    datetime: string[];
    data: Array<{
      datetime: string;
      channels: Array<{
        name: string;
        value: number;
        status: number;
        valid: boolean;
      }>;
    }>;
  };
}
