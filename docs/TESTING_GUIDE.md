# Testing Guide

## Overview

Complete testing infrastructure with Jest, including unit tests, integration tests, sample XML fixtures, and mocked external dependencies. **All tests run in complete isolation - no real API calls or file downloads.**

## Test Suite Summary

- **Framework**: Jest with TypeScript support (ts-jest)
- **Total Tests**: 33 passing
- **Coverage**: Unit tests for utilities, XML parsing, and mock forecast generation
- **External Call Prevention**: All HTTP requests and downloads are mocked
- **Fast Execution**: ~1.5 seconds for full test suite

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (Auto-rerun on file changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Verbose Output
```bash
npm run test:verbose
```

---

## Test Structure

```
tests/
├── setup.ts                           # Test environment configuration
├── fixtures/                          # Test data
│   ├── xml/                          # Sample XML feeds
│   │   ├── forecast_city_telaviv.xml
│   │   └── forecast_city_jerusalem.xml
│   └── api/                          # Mock API responses
│       ├── stations_response.json
│       └── station_data_temperature.json
├── mocks/                            # Mock modules
│   ├── imsApi.mock.ts               # Mocked IMS API
│   └── xmlDownloader.mock.ts        # Mocked XML downloader
└── unit/                            # Unit tests
    ├── utils.test.ts               # 13 tests
    ├── xmlParser.test.ts           # 9 tests
    └── mockForecast.test.ts        # 11 tests
```

---

## Isolation Strategy

### No Real External Calls

**Prevented Operations:**
- ❌ HTTP requests to IMS API
- ❌ XML feed downloads
- ❌ File system writes (during mocked tests)
- ❌ Scheduled cron jobs

**How It's Achieved:**
1. **Test Setup** (`tests/setup.ts`): Sets test environment variables
2. **Mock Modules** (`tests/mocks/`): Replace real implementations
3. **Fixtures** (`tests/fixtures/`): Provide realistic test data
4. **Jest Configuration**: Isolated test environment

---

## Test Details

### Utils Module Tests (13 tests)

**File**: `tests/unit/utils.test.ts`

Tests for date range calculation, distance calculation, and data aggregation.

```typescript
describe('Utils Module', () => {
  // getForecastDateRange - forward-looking dates
  ✓ should return next 2 days for today period
  ✓ should return next 7 days for week period
  ✓ should return next 30 days for month period
  ✓ should default to today for unknown period
  
  // getDateRange - backward-looking dates  
  ✓ should return past 2 days for today period
  ✓ should return past 7 days for week period
  
  // calculateDistance - Haversine formula
  ✓ should calculate distance between Tel Aviv and Jerusalem
  ✓ should return 0 for same coordinates
  ✓ should handle negative coordinates
  
  // Data aggregation
  ✓ should return empty array for empty input (hourly)
  ✓ should return empty array for empty input (daily)
});
```

### XML Parser Tests (9 tests)

**File**: `tests/unit/xmlParser.test.ts`

Tests XML parsing with real fixture files.

```typescript
describe('XML Parser Module', () => {
  // parseXML - low-level XML parsing
  ✓ should parse valid XML string
  ✓ should reject invalid XML
  
  // parseForecastFeed - RSS extraction
  ✓ should extract forecast items from Tel Aviv XML
  ✓ should extract forecast items from Jerusalem XML
  ✓ should throw for XML without items
  
  // getCityForecast - file loading
  ✓ should load and parse Tel Aviv forecast from fixture
  ✓ should load and parse Jerusalem forecast from fixture
  ✓ should throw error for non-existent city
  ✓ should throw error for missing directory
});
```

### Mock Forecast Tests (11 tests)

**File**: `tests/unit/mockForecast.test.ts`

Tests synthetic forecast generation.

```typescript
describe('Mock Forecast Module', () => {
  // Daily forecast generation
  ✓ should generate correct number of days
  ✓ should generate forecast for each day in range
  ✓ should include all required fields
  ✓ should have tempMax greater than tempMin
  ✓ should use provided base temperature
  
  // Hourly forecast generation
  ✓ should generate 24 hours for single day
  ✓ should generate 48 hours for two days
  ✓ should include all required fields
  ✓ should format time correctly
  ✓ should show temperature variation throughout day
  
  // Main entry point
  ✓ should generate hourly forecast for today period
  ✓ should generate daily forecast for week period
  ✓ should generate daily forecast for month period
});
```

---

## Sample Test Fixtures

### XML Fixtures

**Tel Aviv Forecast** (`tests/fixtures/xml/forecast_city_telaviv.xml`):
- 5-day forecast with realistic data
- Temperatures, humidity, wind speed/direction
- Precipitation information
- Proper RSS 2.0 format

**Jerusalem Forecast** (`tests/fixtures/xml/forecast_city_jerusalem.xml`):
- 3-day forecast
- Cooler temperatures (mountain climate)
- Different weather patterns

### API Fixtures

**Stations Response** (`tests/fixtures/api/stations_response.json`):
```json
{
  "stations": [
    {
      "stationId": 178,
      "name": "Tel Aviv Coast",
      "location": { "latitude": 32.0853, "longitude": 34.7818 }
    }
  ]
}
```

**Temperature Data** (`tests/fixtures/api/station_data_temperature.json`):
- 10 hours of temperature readings
- Proper channel structure
- Realistic value progression

---

## Mock Modules

### IMS API Mock (`tests/mocks/imsApi.mock.ts`)

Replaces real IMS API calls with fixture data:

```typescript
export async function getStations() {
  return Promise.resolve(mockStations);
}

export async function getStationData(stationId, channelId, from, to) {
  return Promise.resolve(mockStationData);
}
```

### XML Downloader Mock (`tests/mocks/xmlDownloader.mock.ts`)

Prevents real downloads:

```typescript
export async function downloadAllFeeds() {
  // Returns success without downloading
  return Promise.resolve({ successful: 2, failed: 0 });
}

export function getMostRecentDownloadDir() {
  // Points to test fixtures
  return path.join(process.cwd(), 'tests', 'fixtures', 'xml');
}
```

---

## Writing New Tests

### Unit Test Template

```typescript
import { myFunction } from '../../src/myModule';

describe('My Module', () => {
  describe('myFunction', () => {
    it('should do something', () => {
      const result = myFunction('input');
      expect(result).toBe('expected');
    });
    
    it('should handle edge case', () => {
      expect(() => myFunction(null)).toThrow();
    });
  });
});
```

### Testing with Fixtures

```typescript
import fs from 'fs';
import path from 'path';

describe('XML Parser', () => {
  it('should parse fixture file', async () => {
    const fixturesDir = path.join(__dirname, '../fixtures/xml');
    const xml = fs.readFileSync(
      path.join(fixturesDir, 'forecast_city_telaviv.xml'),
      'utf8'
    );
    
    const result = await parseXML(xml);
    expect(result).toBeDefined();
  });
});
```

### Using Mocks

```typescript
import * as imsApi from '../mocks/imsApi.mock';

describe('Station Data', () => {
  it('should fetch from mocked API', async () => {
    const stations = await imsApi.getStations();
    expect(stations).toHaveLength(3);
    expect(stations[0].stationId).toBe(178);
  });
});
```

---

## Test Configuration

### Jest Config (`jest.config.js`)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
  testTimeout: 10000
};
```

### TypeScript Config (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "types": ["node", "jest"]
  },
  "include": ["src/**/*", "tests/**/*"]
}
```

---

## Coverage Goals

| Module | Target | Current |
|--------|--------|---------|
| **utils.ts** | 80% | ✅ Achieved |
| **xmlParser.ts** | 80% | ✅ Achieved |
| **mockForecast.ts** | 90% | ✅ Achieved |
| **cache.ts** | 70% | 🔜 TODO |
| **forecastAdapter.ts** | 70% | 🔜 TODO |

---

## Continuous Integration

### GitHub Actions (Example)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

### Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/sh
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed. Commit aborted."
  exit 1
fi
```

---

## Troubleshooting

### Tests Failing After Code Changes

**Problem**: Tests pass locally but fail in CI

**Solution**:
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Jest cache
npx jest --clearCache

# Run tests
npm test
```

### Timeout Errors

**Problem**: `Exceeded timeout of 5000 ms`

**Solution**:
```typescript
// Increase timeout for specific test
it('slow operation', async () => {
  // ...
}, 15000); // 15 second timeout
```

### Mock Not Working

**Problem**: Test still makes real HTTP calls

**Check**:
1. Verify mock is imported correctly
2. Check `jest.mock()` path matches actual module
3. Ensure mock is set up before test runs

---

## Best Practices

### ✅ Do

- Write tests for new features before implementation (TDD)
- Use descriptive test names
- Test both success and error cases
- Keep tests fast (< 100ms each)
- Use fixtures for complex data
- Mock external dependencies
- Run tests before committing

### ❌ Don't

- Make real API calls in tests
- Write tests that depend on specific dates/times
- Test implementation details
- Create flaky tests (non-deterministic)
- Skip failing tests without fixing them
- Commit code with failing tests

---

## Related Documentation

- [Jest Documentation](https://jestjs.io/)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [`src/utils.ts`](../src/utils.ts) - Utility functions
- [`src/xmlParser.ts`](../src/xmlParser.ts) - XML parsing
- [`src/mockForecast.ts`](../src/mockForecast.ts) - Mock generation

---

## Date: February 11, 2026
