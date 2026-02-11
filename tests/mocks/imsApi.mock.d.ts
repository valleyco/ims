/**
 * Mock IMS API for Testing
 * Prevents real API calls during tests
 */
export declare const mockStations: {
    stationId: number;
    name: string;
    location: {
        latitude: number;
        longitude: number;
    };
    active: boolean;
    monitors: {
        name: string;
        units: string;
    }[];
}[];
export declare const mockStationData: {
    channelId: number;
    stationId: number;
    data: {
        channel: {
            name: string;
            units: string;
        };
        datetime: string[];
        data: {
            datetime: string;
            channels: {
                name: string;
                value: number;
                status: number;
                valid: boolean;
            }[];
        }[];
    };
};
/**
 * Mock getStations - returns fixture data
 */
export declare function getStations(): Promise<{
    stationId: number;
    name: string;
    location: {
        latitude: number;
        longitude: number;
    };
    active: boolean;
    monitors: {
        name: string;
        units: string;
    }[];
}[]>;
/**
 * Mock getStationData - returns fixture data
 */
export declare function getStationData(stationId: number, channelId: number, from: string, to: string): Promise<{
    stationId: number;
    channelId: number;
    from: string;
    to: string;
    data: {
        channel: {
            name: string;
            units: string;
        };
        datetime: string[];
        data: {
            datetime: string;
            channels: {
                name: string;
                value: number;
                status: number;
                valid: boolean;
            }[];
        }[];
    };
}>;
/**
 * Mock getStationDataMultiChannel - returns array of fixture data
 */
export declare function getStationDataMultiChannel(stationId: number, channelIds: number[], from: string, to: string): Promise<{
    channelId: number;
    stationId: number;
    from: string;
    to: string;
    data: {
        channel: {
            name: string;
            units: string;
        };
        datetime: string[];
        data: {
            datetime: string;
            channels: {
                name: string;
                value: number;
                status: number;
                valid: boolean;
            }[];
        }[];
    };
}[]>;
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
//# sourceMappingURL=imsApi.mock.d.ts.map