# Israel Meteorological Service (IMS) API Documentation

## Overview

The Israel Meteorological Service provides an API for accessing 10-minute interval meteorological data from approximately 85 automatic weather stations across Israel. The API allows automated data retrieval near real-time for parameters such as temperature, humidity, pressure, precipitation, wind, and radiation.

**API Base URL**: `https://api.ims.gov.il/v1/envista`

**Last Updated**: May 11, 2017

## Authentication

All API requests require authentication using an API token.

### Authorization Header
```
Authorization: ApiToken YOUR_TOKEN_HERE
```

**To obtain an API token**, contact the Israel Meteorological Service at: `ims@ims.gov.il`

### Example Request (using curl)
```bash
curl -H "Authorization: ApiToken YOUR_TOKEN_HERE" \
  "https://api.ims.gov.il/v1/envista/stations"
```

## Important Notes

### Time Format
- All timestamps are in **Local Standard Time (LST)** - winter time throughout the year
- During daylight saving time, there will be a 1-hour difference between the displayed `datetime` and actual time
- Example: In October, the system displays `2017-10-23T11:40:00+03:00` even though the actual time is `2017-10-23T12:40:00+03:00`

### Channels
- Stations measure various meteorological parameters called **CHANNELS**
- Not all stations measure all parameters
- The channel number for the same parameter may differ between stations
- Use metadata endpoints to find the correct channel number for each station

### Data Quality
- Each reading includes a `status` field:
  - `1` = Valid data
  - `2` = Invalid data
- Each value includes a `valid` field: `true` or `false`

## URL Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `{%REG_ID%}` | Region ID | `1` |
| `{%ST_ID%}` | Station ID | `178` |
| `{%CH_ID%}` | Channel ID | `7` |
| `YYYY` | Year | `2017` |
| `MM` | Month | `05` |
| `DD` | Day | `28` |

---

## API Endpoints

### 1. Metadata - Stations

#### Get All Stations
```
GET https://api.ims.gov.il/v1/envista/stations
```

Returns information about all weather stations.

**Response includes**:
- `name` - Station name
- `location` - Station coordinates (latitude, longitude)
- `regionId` - Region ID
- `monitors` - List of channels (parameters) measured at the station
  - `active` - Status
  - `channelId` - Channel number
  - `name` - Channel name
  - `typeId` - Channel type
  - `units` - Units of measurement

**Example**:
```bash
curl -H "Authorization: ApiToken YOUR_TOKEN" \
  "https://api.ims.gov.il/v1/envista/stations"
```

#### Get Specific Station
```
GET https://api.ims.gov.il/v1/envista/stations/{%ST_ID%}
```

Returns metadata for a specific station.

**Example**:
```bash
curl -H "Authorization: ApiToken YOUR_TOKEN" \
  "https://api.ims.gov.il/v1/envista/stations/178"
```

---

### 2. Metadata - Regions

#### Get All Regions
```
GET https://api.ims.gov.il/v1/envista/regions
```

Returns information about all regions, including all stations in each region.

**Response includes**:
- Region ID
- Region name
- List of stations in the region and their channels

#### Get Specific Region
```
GET https://api.ims.gov.il/v1/envista/regions/{%REG_ID%}
```

Returns metadata for a specific region.

---

### 3. Station Data - Latest Readings

#### Latest Data - All Channels
```
GET https://api.ims.gov.il/v1/envista/stations/{%ST_ID%}/data/latest
```

Returns the most recent readings for all channels at a station.

#### Latest Data - Specific Channel
```
GET https://api.ims.gov.il/v1/envista/stations/{%ST_ID%}/data/{%CH_ID%}/latest
```

Returns the most recent reading for a specific channel.

**Example**:
```bash
# Get latest temperature (channel 7) for station 178
curl -H "Authorization: ApiToken YOUR_TOKEN" \
  "https://api.ims.gov.il/v1/envista/stations/178/data/7/latest"
```

---

### 4. Station Data - Earliest Readings

#### Earliest Data - All Channels
```
GET https://api.ims.gov.il/v1/envista/stations/{%ST_ID%}/data/earliest
```

Returns the oldest available readings for all channels.

#### Earliest Data - Specific Channel
```
GET https://api.ims.gov.il/v1/envista/stations/{%ST_ID%}/data/{%CH_ID%}/earliest
```

Returns the oldest available reading for a specific channel.

---

### 5. Station Data - Current Day

#### Current Day - All Channels
```
GET https://api.ims.gov.il/v1/envista/stations/{%ST_ID%}/data/daily
```

Returns all readings from the current day for all channels.

#### Current Day - Specific Channel
```
GET https://api.ims.gov.il/v1/envista/stations/{%ST_ID%}/data/{%CH_ID%}/daily
```

Returns all readings from the current day for a specific channel.

---

### 6. Station Data - Current Month

#### Current Month - All Channels
```
GET https://api.ims.gov.il/v1/envista/stations/{%ST_ID%}/data/monthly
```

Returns all readings from the current month for all channels.

#### Current Month - Specific Channel
```
GET https://api.ims.gov.il/v1/envista/stations/{%ST_ID%}/data/{%CH_ID%}/monthly
```

Returns all readings from the current month for a specific channel.

---

### 7. Station Data - Specific Day

#### Specific Day - All Channels
```
GET https://api.ims.gov.il/v1/envista/stations/{%ST_ID%}/data/daily/YYYY/MM/DD
```

Returns all readings from a specific day for all channels.

#### Specific Day - Specific Channel
```
GET https://api.ims.gov.il/v1/envista/stations/{%ST_ID%}/data/daily/{%CH_ID%}/YYYY/MM/DD
```

Returns all readings from a specific day for a specific channel.

**Example**:
```bash
# Get temperature data for May 28, 2017
curl -H "Authorization: ApiToken YOUR_TOKEN" \
  "https://api.ims.gov.il/v1/envista/stations/178/data/7/daily/2017/05/28"
```

---

### 8. Station Data - Specific Month

#### Specific Month - All Channels
```
GET https://api.ims.gov.il/v1/envista/stations/{%ST_ID%}/data/monthly/YYYY/MM
```

Returns all readings from a specific month for all channels.

#### Specific Month - Specific Channel
```
GET https://api.ims.gov.il/v1/envista/stations/{%ST_ID%}/data/{%CH_ID%}/monthly/YYYY/MM
```

Returns all readings from a specific month for a specific channel.

**Example**:
```bash
# Get temperature data for May 2017
curl -H "Authorization: ApiToken YOUR_TOKEN" \
  "https://api.ims.gov.il/v1/envista/stations/178/data/7/monthly/2017/05"
```

---

### 9. Station Data - Date Range

#### Date Range - All Channels
```
GET https://api.ims.gov.il/v1/envista/stations/{%ST_ID%}/data?from=YYYY/MM/DD&to=YYYY/MM/DD
```

Returns all readings within a date range for all channels.

#### Date Range - Specific Channel
```
GET https://api.ims.gov.il/v1/envista/stations/{%ST_ID%}/data/{%CH_ID%}?from=YYYY/MM/DD&to=YYYY/MM/DD
```

Returns all readings within a date range for a specific channel.

**Example**:
```bash
# Get temperature data from Jan 1 to Jan 31, 2026
curl -H "Authorization: ApiToken YOUR_TOKEN" \
  "https://api.ims.gov.il/v1/envista/stations/178/data/7?from=2026/01/01&to=2026/01/31"
```

---

## Response Format

All responses are in **JSON format**.

### Station Data Response Structure

```json
{
  "stationId": 178,
  "datetime": "2017-10-23T11:40:00+03:00",
  "channels": [
    {
      "id": 7,
      "name": "TD",
      "status": 1,
      "valid": true,
      "value": 25.3
    }
  ]
}
```

**Response Fields**:
- `stationId` - Station identifier
- `datetime` - Measurement timestamp (ISO 8601 format)
- `channels` - Array of channel readings
  - `id` - Channel ID
  - `name` - Channel name
  - `status` - Data status (1 = valid, 2 = invalid)
  - `valid` - Boolean indicating data validity
  - `value` - Numerical value of the measured parameter

---

## Meteorological Parameters (Channels)

| Channel | Parameter | Units | Description |
|---------|-----------|-------|-------------|
| `BP` | Barometric Pressure | mb | Atmospheric pressure at station elevation |
| `DiffR` | Diffuse Radiation | W/m² | Diffuse solar radiation |
| `Grad` | Global Radiation | W/m² | Global solar radiation |
| `NIP` | Direct Radiation | W/m² | Direct (normal incidence) solar radiation |
| `Rain` | Precipitation | mm | Rainfall amount |
| `RH` | Relative Humidity | % | Relative humidity |
| `STDwd` | Wind Direction StdDev | degrees | Standard deviation of wind direction |
| `TD` | Dry Temperature | °C | Air temperature (dry bulb) |
| `TDmax` | Maximum Temperature | °C | Maximum air temperature |
| `TDmin` | Minimum Temperature | °C | Minimum air temperature |
| `TG` | Ground Temperature | °C | Temperature near ground level |
| `Time` | Time | hhmm | End time of 10-minute maximum period |
| `WD` | Wind Direction | degrees | Wind direction |
| `WDmax` | Gust Direction | degrees | Direction of maximum wind gust |
| `WS` | Wind Speed | m/sec | Wind speed |
| `Ws10mm` | Max 10-min Wind | m/sec | Maximum 10-minute average wind speed |
| `WS1mm` | Max 1-min Wind | m/sec | Maximum 1-minute average wind speed |
| `WSmax` | Gust Speed | m/sec | Maximum wind gust speed |

### Common Channel IDs (Note: may vary by station)

- **Channel 1**: Rain (mm)
- **Channel 2**: Battery Voltage (V)
- **Channel 3**: Time of Max Wind (hhmm)
- **Channel 4**: Wind Speed (m/sec)
- **Channel 5**: Wind Direction (degrees)
- **Channel 6**: Wind Standard Deviation (degrees)
- **Channel 7**: Temperature - Dry (°C)
- **Channel 8**: Relative Humidity (%)
- **Channel 9**: Ground Temperature (°C)
- **Channel 10**: Barometric Pressure (mb)

**Important**: Always verify channel IDs using the station metadata endpoint, as they can differ between stations.

---

## Testing with Fiddler

1. Download free Fiddler tool: http://fiddler.en.lo4d.com
2. Open Fiddler and click on the **Composer** tab
3. Next to **GET**, enter the desired API command
4. In the box below **GET**, add the authorization header:
   ```
   Authorization: ApiToken YOUR_TOKEN_HERE
   ```
5. Click **Execute**
6. A new row will appear on the left side; click on it
7. The JSON response will appear in the bottom-right panel

---

## Rate Limits

Please check with the Israel Meteorological Service for current rate limits and usage guidelines.

---

## Support

For questions, issues, or to request an API token:

**Email**: ims@ims.gov.il

**Website**: https://ims.gov.il

---

## Example Use Cases

### Get Current Temperature for Tel Aviv Station
```bash
curl -H "Authorization: ApiToken YOUR_TOKEN" \
  "https://api.ims.gov.il/v1/envista/stations/23/data/7/latest"
```

### Get Last 7 Days of Rainfall Data
```bash
curl -H "Authorization: ApiToken YOUR_TOKEN" \
  "https://api.ims.gov.il/v1/envista/stations/178/data/1?from=2026/01/25&to=2026/02/01"
```

### Get All Available Station Information
```bash
curl -H "Authorization: ApiToken YOUR_TOKEN" \
  "https://api.ims.gov.il/v1/envista/stations" | python -m json.tool
```

---

## Additional Resources

- **Station Details**: Contact IMS for detailed information about specific stations
- **Data Quality**: All data undergoes quality control; check `status` and `valid` fields
- **Historical Data**: For data older than available through the API, contact IMS directly

---

## Version History

- **v1** - Initial API release (May 11, 2017)
- Current version provides 10-minute interval data
- Data format: JSON
- Authentication: API Token

---

## Notes for Developers

1. **Always check the metadata** before requesting data to ensure the channel exists for the station
2. **Handle timezone differences** - remember LST vs local time during daylight saving
3. **Validate data quality** - use the `status` and `valid` fields to filter out invalid readings
4. **Cache metadata** - station and region information changes infrequently
5. **Respect rate limits** - implement appropriate throttling in your application
6. **Handle errors gracefully** - implement retry logic for transient failures

---

This documentation is based on the official Israel Meteorological Service API documentation. For the most up-to-date information, please contact IMS directly.
