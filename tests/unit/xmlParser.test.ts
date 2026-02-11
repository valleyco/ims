/**
 * Unit Tests for XML Parser Module
 */

import path from 'path';
import fs from 'fs';
import * as xmlParser from '../../src/xmlParser';

// Read actual fixture files for testing
const fixturesDir = path.join(__dirname, '../fixtures/xml');

describe('XML Parser Module', () => {
  describe('parseXML', () => {
    it('should parse valid XML string', async () => {
      const telAvivXml = fs.readFileSync(path.join(fixturesDir, 'forecast_city_telaviv.xml'), 'utf8');
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
      const telAvivXml = fs.readFileSync(path.join(fixturesDir, 'forecast_city_telaviv.xml'), 'utf8');
      const result = await xmlParser.parseForecastFeed(telAvivXml);
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('description');
      expect(result[0]).toHaveProperty('pubDate');
    });
    
    it('should extract forecast items from Jerusalem XML', async () => {
      const jerusalemXml = fs.readFileSync(path.join(fixturesDir, 'forecast_city_jerusalem.xml'), 'utf8');
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
      await expect(
        xmlParser.getCityForecast('nonexistent', fixturesDir)
      ).rejects.toThrow('File not found');
    });
    
    it('should throw error for missing directory', async () => {
      await expect(
        xmlParser.getCityForecast('telaviv', '/nonexistent/path')
      ).rejects.toThrow('File not found');
    });
  });
});
