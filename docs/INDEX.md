# Documentation Index

Welcome to the meteorologic weather application documentation. All documentation has been organized into logical categories for easy navigation.

## Quick Links

### API Documentation
Located in [`api/`](api/)

- **[API.md](api/API.md)** - Complete IMS API reference in English
- **[swagger.yaml](api/swagger.yaml)** - OpenAPI 3.0 specification for external IMS API
- **[internal-api.yaml](api/internal-api.yaml)** - OpenAPI 3.0 specification for internal application API
- **[SWAGGER_README.md](api/SWAGGER_README.md)** - Quick start guide for Swagger
- **[SWAGGER_USAGE.md](api/SWAGGER_USAGE.md)** - Detailed Swagger usage instructions

### Architecture Documentation
Located in [`architecture/`](architecture/)

- **[CACHE.md](architecture/CACHE.md)** - Cache system overview and API
- **[CACHING_SYSTEM.md](architecture/CACHING_SYSTEM.md)** - Detailed cache implementation
- **[TYPESCRIPT_CONVERSION.md](architecture/TYPESCRIPT_CONVERSION.md)** - TypeScript migration summary

### Feature Documentation
Located in [`features/`](features/)

- **[FORECAST_FEATURE.md](features/FORECAST_FEATURE.md)** - Forecast feature implementation guide
- **[TEST_UI.md](features/TEST_UI.md)** - UI testing notes and procedures

### Development History
Located in [`history/`](history/)

- **[FINAL_SUMMARY.md](history/FINAL_SUMMARY.md)** - Overall project summary
- **[RECENT_FIXES.md](history/RECENT_FIXES.md)** - Recent bug fixes and improvements
- **[FIXES_APPLIED.md](history/FIXES_APPLIED.md)** - Historical fixes documentation
- **[FORECAST_FIX_VERIFICATION.md](history/FORECAST_FIX_VERIFICATION.md)** - Forecast bug fix verification

### XML Integration
Located in root [`docs/`](.)

- **[XML_FEED_README.md](XML_FEED_README.md)** - Complete XML integration guide
- **[XML_INTEGRATION_NOTES.md](XML_INTEGRATION_NOTES.md)** - Technical implementation details
- **[URL_DISCOVERY_GUIDE.md](URL_DISCOVERY_GUIDE.md)** - Step-by-step guide to discover RSS feed URLs

### Recent Fixes & Enhancements
Located in root [`docs/`](.)

- **[FORECAST_DATE_RANGE_FIX.md](FORECAST_DATE_RANGE_FIX.md)** - Fix for forecast returning past dates instead of future dates
- **[MOCK_FORECAST_SYSTEM.md](MOCK_FORECAST_SYSTEM.md)** - Mock data generator for when XML feeds are unavailable
- **[AUTO_XML_DOWNLOAD.md](AUTO_XML_DOWNLOAD.md)** - Automatic XML data management system with scheduling and admin API
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Complete testing infrastructure with Jest (33 passing tests, no external calls)

### Original Documentation
Located in [`original/`](original/)

Contains the original PDF documentation files from the IMS API in Hebrew.

## Documentation Organization

This documentation follows standard open-source conventions:

- **Root README.md** - Project overview and getting started
- **docs/** - All detailed documentation
  - **api/** - External API integration
  - **architecture/** - System design and technical details
  - **features/** - Feature-specific guides
  - **history/** - Development timeline and fixes
  - **original/** - Source materials

## Contributing to Documentation

When adding new documentation:

1. Choose the appropriate category folder
2. Use clear, descriptive filenames (e.g., `FEATURE_NAME.md`)
3. Add links to this index file
4. Update the main README.md if it's a major feature
5. Use proper markdown formatting with headers and code blocks

## See Also

- [Main README](../README.md) - Project overview and setup
- [Examples](../examples/) - Code examples and test files
- [Source Code](../src/) - TypeScript source code
