"use strict";
/**
 * Mock XML Downloader for Testing
 * Prevents real downloads during tests
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadAllFeeds = downloadAllFeeds;
exports.getMostRecentDownloadDir = getMostRecentDownloadDir;
exports.cleanOldDownloads = cleanOldDownloads;
exports.getDownloadVersion = getDownloadVersion;
const path_1 = __importDefault(require("path"));
/**
 * Mock downloadAllFeeds - simulates successful download
 */
async function downloadAllFeeds() {
    const testDir = path_1.default.join(process.cwd(), 'tests', 'fixtures', 'xml');
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
                filepath: path_1.default.join(testDir, 'forecast_city_telaviv.xml'),
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
                filepath: path_1.default.join(testDir, 'forecast_city_jerusalem.xml'),
                size: 896
            }
        ]
    });
}
/**
 * Mock getMostRecentDownloadDir - returns test fixtures directory
 */
function getMostRecentDownloadDir() {
    return path_1.default.join(process.cwd(), 'tests', 'fixtures', 'xml');
}
/**
 * Mock cleanOldDownloads - does nothing in tests
 */
function cleanOldDownloads(daysToKeep = 7) {
    // No-op in tests
    return;
}
/**
 * Mock getDownloadVersion - returns a test version
 */
function getDownloadVersion(downloadDir) {
    return '2026-02-11/09-00-00';
}
//# sourceMappingURL=xmlDownloader.mock.js.map