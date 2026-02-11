/**
 * Mock XML Downloader for Testing
 * Prevents real downloads during tests
 */
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
export declare function downloadAllFeeds(): Promise<DownloadMetadata>;
/**
 * Mock getMostRecentDownloadDir - returns test fixtures directory
 */
export declare function getMostRecentDownloadDir(): string | null;
/**
 * Mock cleanOldDownloads - does nothing in tests
 */
export declare function cleanOldDownloads(daysToKeep?: number): void;
/**
 * Mock getDownloadVersion - returns a test version
 */
export declare function getDownloadVersion(downloadDir: string): string;
//# sourceMappingURL=xmlDownloader.mock.d.ts.map