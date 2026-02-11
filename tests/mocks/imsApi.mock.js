"use strict";
/**
 * Mock IMS API for Testing
 * Prevents real API calls during tests
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockStationData = exports.mockStations = void 0;
exports.getStations = getStations;
exports.getStationData = getStationData;
exports.getStationDataMultiChannel = getStationDataMultiChannel;
const stations_response_json_1 = __importDefault(require("../fixtures/api/stations_response.json"));
const station_data_temperature_json_1 = __importDefault(require("../fixtures/api/station_data_temperature.json"));
exports.mockStations = stations_response_json_1.default.stations;
exports.mockStationData = station_data_temperature_json_1.default;
/**
 * Mock getStations - returns fixture data
 */
async function getStations() {
    return Promise.resolve(exports.mockStations);
}
/**
 * Mock getStationData - returns fixture data
 */
async function getStationData(stationId, channelId, from, to) {
    // Return mock data with the requested parameters
    return Promise.resolve({
        ...exports.mockStationData,
        stationId,
        channelId,
        from,
        to
    });
}
/**
 * Mock getStationDataMultiChannel - returns array of fixture data
 */
async function getStationDataMultiChannel(stationId, channelIds, from, to) {
    // Return an array of mock channel data
    return Promise.resolve(channelIds.map(channelId => ({
        ...exports.mockStationData,
        channelId,
        stationId,
        from,
        to
    })));
}
//# sourceMappingURL=imsApi.mock.js.map