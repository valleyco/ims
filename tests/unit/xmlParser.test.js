"use strict";
/**
 * Unit Tests for XML Parser Module
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const xmlParser = __importStar(require("../../src/xmlParser"));
// Read actual fixture files for testing
const fixturesDir = path_1.default.join(__dirname, '../fixtures/xml');
describe('XML Parser Module', () => {
    describe('parseXML', () => {
        it('should parse valid XML string', async () => {
            const telAvivXml = fs_1.default.readFileSync(path_1.default.join(fixturesDir, 'forecast_city_telaviv.xml'), 'utf8');
            const result = await xmlParser.parseXML(telAvivXml);
            expect(result).toBeDefined();
            expect(result.rss).toBeDefined();
            expect(result.rss.channel).toBeDefined();
        });
        it('should reject invalid XML', async () => {
            await expect(xmlParser.parseXML('invalid xml <>')).rejects.toThrow();
        });
    });
    describe('parseForecastFeed', () => {
        it('should extract forecast items from Tel Aviv XML', async () => {
            const telAvivXml = fs_1.default.readFileSync(path_1.default.join(fixturesDir, 'forecast_city_telaviv.xml'), 'utf8');
            const result = await xmlParser.parseForecastFeed(telAvivXml);
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toHaveProperty('title');
            expect(result[0]).toHaveProperty('description');
            expect(result[0]).toHaveProperty('pubDate');
        });
        it('should extract forecast items from Jerusalem XML', async () => {
            const jerusalemXml = fs_1.default.readFileSync(path_1.default.join(fixturesDir, 'forecast_city_jerusalem.xml'), 'utf8');
            const result = await xmlParser.parseForecastFeed(jerusalemXml);
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].title).toContain('Wednesday');
        });
        it('should throw for XML without items', async () => {
            const emptyXml = '<?xml version="1.0"?><rss><channel></channel></rss>';
            await expect(xmlParser.parseForecastFeed(emptyXml)).rejects.toThrow('Invalid RSS structure');
        });
    });
    describe('getCityForecast', () => {
        it('should load and parse Tel Aviv forecast from fixture', async () => {
            const result = await xmlParser.getCityForecast('telaviv', fixturesDir);
            expect(result).toBeDefined();
            expect(result.length).toBe(5); // 5 days in fixture
            expect(result[0]).toHaveProperty('title');
            expect(result[0]).toHaveProperty('description');
            expect(result[0].title).toContain('Wednesday');
        });
        it('should load and parse Jerusalem forecast from fixture', async () => {
            const result = await xmlParser.getCityForecast('jerusalem', fixturesDir);
            expect(result).toBeDefined();
            expect(result.length).toBe(3); // 3 days in fixture
        });
        it('should throw error for non-existent city', async () => {
            await expect(xmlParser.getCityForecast('nonexistent', fixturesDir)).rejects.toThrow('File not found');
        });
        it('should throw error for missing directory', async () => {
            await expect(xmlParser.getCityForecast('telaviv', '/nonexistent/path')).rejects.toThrow('File not found');
        });
    });
});
//# sourceMappingURL=xmlParser.test.js.map