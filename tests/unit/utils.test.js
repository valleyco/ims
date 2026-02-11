"use strict";
/**
 * Unit Tests for Utils Module
 */
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../src/utils");
describe('Utils Module', () => {
    describe('getForecastDateRange', () => {
        it('should return next 2 days for today period', () => {
            const result = (0, utils_1.getForecastDateRange)('today');
            const from = new Date(result.from);
            const to = new Date(result.to);
            const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
            expect(daysDiff).toBe(1); // Today + tomorrow = 2 days (1 day difference)
            expect(result.from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(result.to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
        it('should return next 7 days for week period', () => {
            const result = (0, utils_1.getForecastDateRange)('week');
            const from = new Date(result.from);
            const to = new Date(result.to);
            const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
            expect(daysDiff).toBe(6); // 7 days inclusive (6 day difference)
        });
        it('should return next 30 days for month period', () => {
            const result = (0, utils_1.getForecastDateRange)('month');
            const from = new Date(result.from);
            const to = new Date(result.to);
            const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
            expect(daysDiff).toBe(29); // 30 days inclusive (29 day difference)
        });
        it('should default to today for unknown period', () => {
            const result = (0, utils_1.getForecastDateRange)('unknown');
            const from = new Date(result.from);
            const to = new Date(result.to);
            const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
            expect(daysDiff).toBe(1);
        });
    });
    describe('getDateRange (historical)', () => {
        it('should return past 2 days for today period', () => {
            const result = (0, utils_1.getDateRange)('today');
            const from = new Date(result.from);
            const to = new Date(result.to);
            // From date should be before to date
            expect(from.getTime()).toBeLessThan(to.getTime());
        });
        it('should return past 7 days for week period', () => {
            const result = (0, utils_1.getDateRange)('week');
            const from = new Date(result.from);
            const to = new Date(result.to);
            const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
            expect(daysDiff).toBe(7);
        });
    });
    describe('calculateDistance', () => {
        it('should calculate distance between Tel Aviv and Jerusalem', () => {
            const telAvivLat = 32.0853;
            const telAvivLon = 34.7818;
            const jerusalemLat = 31.7683;
            const jerusalemLon = 35.2137;
            const distance = (0, utils_1.calculateDistance)(telAvivLat, telAvivLon, jerusalemLat, jerusalemLon);
            // Distance should be approximately 54 km
            expect(distance).toBeGreaterThan(50);
            expect(distance).toBeLessThan(60);
        });
        it('should return 0 for same coordinates', () => {
            const distance = (0, utils_1.calculateDistance)(32.0853, 34.7818, 32.0853, 34.7818);
            expect(distance).toBe(0);
        });
        it('should handle negative coordinates', () => {
            const distance = (0, utils_1.calculateDistance)(-33.8688, 151.2093, -37.8136, 144.9631);
            // Sydney to Melbourne: approximately 714 km
            expect(distance).toBeGreaterThan(700);
            expect(distance).toBeLessThan(750);
        });
    });
    describe('aggregateHourly', () => {
        it('should return empty array for empty input', () => {
            const result = (0, utils_1.aggregateHourly)([]);
            expect(result).toEqual([]);
        });
    });
    describe('aggregateDaily', () => {
        it('should return empty array for empty input', () => {
            const result = (0, utils_1.aggregateDaily)([]);
            expect(result).toEqual([]);
        });
    });
});
//# sourceMappingURL=utils.test.js.map