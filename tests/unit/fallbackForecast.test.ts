/**
 * Unit Tests for Fallback Forecast Generator
 */

import {
  generateFallbackDailyForecast,
  generateFallbackHourlyForecast,
  generateFallbackForecast
} from '../../src/fallbackForecast';

describe('Fallback Forecast Module', () => {
  describe('generateFallbackDailyForecast', () => {
    it('should generate correct number of days', () => {
      const result = generateFallbackDailyForecast('2026-02-11', '2026-02-17', 20);
      
      expect(result).toHaveLength(7); // 7 days inclusive
    });
    
    it('should generate forecast for each day in range', () => {
      const result = generateFallbackDailyForecast('2026-02-11', '2026-02-13', 20);
      
      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2026-02-11');
      expect(result[1].date).toBe('2026-02-12');
      expect(result[2].date).toBe('2026-02-13');
    });
    
    it('should include all required fields', () => {
      const result = generateFallbackDailyForecast('2026-02-11', '2026-02-11', 20);
      
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('tempMin');
      expect(result[0]).toHaveProperty('tempMax');
      expect(result[0]).toHaveProperty('humidity');
      expect(result[0]).toHaveProperty('windSpeed');
      expect(result[0]).toHaveProperty('rain');
    });
    
    it('should have tempMax greater than tempMin', () => {
      const result = generateFallbackDailyForecast('2026-02-11', '2026-02-11', 20);
      
      const tempMin = parseFloat(result[0].tempMin!);
      const tempMax = parseFloat(result[0].tempMax!);
      
      expect(tempMax).toBeGreaterThan(tempMin);
    });
    
    it('should use provided base temperature', () => {
      const result = generateFallbackDailyForecast('2026-02-11', '2026-02-11', 30);
      
      const tempMin = parseFloat(result[0].tempMin!);
      const tempMax = parseFloat(result[0].tempMax!);
      
      // Should be close to base temp (30°C) with some variation
      expect(tempMin).toBeGreaterThan(22);
      expect(tempMax).toBeLessThan(38);
    });
  });
  
  describe('generateFallbackHourlyForecast', () => {
    it('should generate 24 hours for single day', () => {
      const result = generateFallbackHourlyForecast('2026-02-11', '2026-02-11', 20);
      
      expect(result).toHaveLength(24);
    });
    
    it('should generate 48 hours for two days', () => {
      const result = generateFallbackHourlyForecast('2026-02-11', '2026-02-12', 20);
      
      expect(result).toHaveLength(48);
    });
    
    it('should include all required fields', () => {
      const result = generateFallbackHourlyForecast('2026-02-11', '2026-02-11', 20);
      
      expect(result[0]).toHaveProperty('time');
      expect(result[0]).toHaveProperty('temp');
      expect(result[0]).toHaveProperty('humidity');
      expect(result[0]).toHaveProperty('windSpeed');
      expect(result[0]).toHaveProperty('windDir');
      expect(result[0]).toHaveProperty('rain');
    });
    
    it('should format time correctly', () => {
      const result = generateFallbackHourlyForecast('2026-02-11', '2026-02-11', 20);
      
      expect(result[0].time).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:00$/);
      expect(result[0].time).toContain('2026-02-11');
    });
    
    it('should show temperature variation throughout day', () => {
      const result = generateFallbackHourlyForecast('2026-02-11', '2026-02-11', 20);
      
      const temps = result.map(r => parseFloat(r.temp!));
      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);
      
      // Should have at least 5°C variation in a day
      expect(maxTemp - minTemp).toBeGreaterThan(5);
    });
  });
  
  describe('generateFallbackForecast', () => {
    it('should generate hourly forecast for today period', () => {
      const result = generateFallbackForecast('today', '2026-02-11', '2026-02-12', 20);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('time'); // Hourly format
    });
    
    it('should generate daily forecast for week period', () => {
      const result = generateFallbackForecast('week', '2026-02-11', '2026-02-17', 20);
      
      expect(result).toHaveLength(7);
      expect(result[0]).toHaveProperty('date'); // Daily format
    });
    
    it('should generate daily forecast for month period', () => {
      const result = generateFallbackForecast('month', '2026-02-11', '2026-03-12', 20);
      
      expect(result).toHaveLength(30);
      expect(result[0]).toHaveProperty('date'); // Daily format
    });
  });
});
