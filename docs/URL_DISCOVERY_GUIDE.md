# RSS Feed URL Discovery Guide

## Overview

The IMS website uses Angular templates to generate RSS feed URLs dynamically on the client side. This means the actual URLs are not visible in the HTML source code. To discover them, you need to use browser Developer Tools to capture the URLs when clicking on feed links.

## IMS XML Pages

| Page | URL | Purpose |
|------|-----|---------|
| **RSS Forecasts & Alerts** | [ims.gov.il/en/RSS_ForecastAlerts](https://ims.gov.il/en/RSS_ForecastAlerts) | Forecast and alert RSS feeds |
| **Current Data XML** | [ims.gov.il/en/CurrentDataXML](https://ims.gov.il/en/CurrentDataXML) | Observations and forecast XML data |

## IMS Update Schedule

Forecasts are updated **twice daily** (morning and afternoon). Additional updates are published when weather conditions change. See [IMS_XML_REFERENCE.md](IMS_XML_REFERENCE.md) for full details.

## Prerequisites

- Modern web browser (Chrome, Firefox, Edge, or Safari)
- Basic understanding of browser Developer Tools

## Step-by-Step Instructions

### 1. Open the IMS RSS Page

Navigate to: https://ims.gov.il/en/RSS_ForecastAlerts

### 2. Open Developer Tools

**Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
**Firefox**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
**Safari**: Enable Developer Menu first (Preferences → Advanced → Show Develop menu), then press `Cmd+Option+I`

### 3. Navigate to Network Tab

Click on the **Network** tab in Developer Tools.

### 4. Clear Network Log (Optional but Recommended)

Click the clear icon (🚫) to remove previous network requests.

### 5. Click on a City Forecast Link

Scroll down to "Forecasts for Cities" section and click on **any city name** (e.g., the first city link).

**What happens**: The browser will navigate to the RSS feed URL, and the Network tab will capture the request.

### 6. Find the Actual URL

In the Network tab, you should see a request that looks like an XML file. Click on it.

**Look for**:
- File name ending in `.xml`
- Type showing `application/xml` or `text/xml`
- Status code `200`

**In the Headers tab**, find the **Request URL** - this is the actual feed URL!

### 7. Document the URL Pattern

Copy the full URL and save it. It might look something like:
```
https://ims.gov.il/sites/default/files/rss_ims/forecast_locality_1_eng.xml
```

**Key things to note**:
- Base path structure
- How cities are identified (by ID number? by name?)
- File naming pattern
- Any date/time components in the URL

### 8. Test Additional Cities

Repeat steps 4-7 for 2-3 more cities to confirm the pattern.

**Questions to answer**:
- Do all city forecasts follow the same pattern?
- What changes between different cities?
- Are the city IDs consistent?

### 9. Test Other Feed Types

Repeat the process for:
- **Country forecast**: Click "General countrywide forecast"
- **Sea forecasts**: Click on each sea location
- **UVI forecast**: Click "UVI Forecast"
- **Alerts**: Click on warning/alert links

## Example URL Patterns to Look For

Based on typical IMS patterns, URLs might look like:

### City Forecasts
```
https://ims.gov.il/sites/default/files/rss_ims/forecast_locality_{ID}_eng.xml
https://ims.gov.il/sites/default/files/ims_data/rss/forecast_city_{NAME}_eng.xml
https://ims.gov.il/files/forecast/cities/{ID}.xml
```

### Country Forecast
```
https://ims.gov.il/sites/default/files/rss_ims/forecast_country_eng.xml
https://ims.gov.il/sites/default/files/ims_data/rss/forecast_eng.xml
```

### Sea Forecasts
```
https://ims.gov.il/sites/default/files/rss_ims/forecast_sea_{ID}_eng.xml
```

### Alerts
```
https://ims.gov.il/sites/default/files/rss_ims/warnings_{TYPE}_eng.xml
```

## Document Your Findings

Create a file `discovered-urls.txt` with your findings:

```
# City Forecasts
Tel Aviv (ID 1): [paste URL here]
Jerusalem (ID 31): [paste URL here]
Haifa (ID 6): [paste URL here]

# Pattern identified:
# [describe the pattern]

# Country Forecast
[paste URL here]

# Sea Forecasts
Haifa Port (ID 212): [paste URL here]
Ashdod Port (ID 213): [paste URL here]

# UVI Forecast
[paste URL here]

# Alerts - Country
All Warnings: [paste URL here]
Visibility Warnings: [paste URL here]
Marine Warnings: [paste URL here]
```

## Alternative Method: Address Bar

If the Network tab is confusing, you can also:

1. Click on a feed link to open the RSS feed in your browser
2. Look at the browser's address bar - that's the URL!
3. Copy the URL from the address bar

This method is simpler but requires clicking each link individually.

**Tip**: The [CurrentDataXML](https://ims.gov.il/en/CurrentDataXML) page may have different XML feeds (observations vs forecasts). Use the same discovery process there if needed.

## Troubleshooting

### Problem: Network tab shows nothing
**Solution**: Make sure you open Developer Tools BEFORE clicking the link.

### Problem: Too many requests in Network tab
**Solution**: 
1. Clear the network log before clicking
2. Use the filter box and type `.xml` to show only XML files
3. Sort by Type column to find XML files easily

### Problem: RSS feed displays as HTML page
**Solution**: Right-click the link and choose "Copy Link Address" instead of clicking it.

### Problem: Feed URLs require authentication
**Solution**: The RSS feeds should be public. If you get authentication errors, try:
1. Opening the link in an incognito/private window
2. Clearing cookies for ims.gov.il
3. Contacting IMS to confirm feeds are public

## After Discovery

Once you have 2-3 example URLs, share them with your development team. They can:
1. Identify the URL pattern
2. Update `src/xmlDownloader.ts` with the correct URLs
3. Test the download process
4. Enable the hybrid forecast system

## City ID Reference (from RSS page)

| ID | City |
|----|------|
| 31 | Jerusalem |
| 6 | Haifa |
| 8 | Beer Sheva |
| 75 | Eilat |
| 3 | Tiberias |
| 40 | Nazareth |
| 1 | Tel Aviv |
| 77 | Afula |
| 76 | Beit Dagan |
| 78 | Zefat |
| 80 | Lod |
| 33 | Dimona |
| 50 | Yotvata |
| 79 | Dead Sea |
| 2 | Mitzpe Ramon |

## Sea Location ID Reference

| ID | Location |
|----|----------|
| 212 | Haifa Port |
| 213 | Ashdod Port |
| 211 | Ashkelon |
| 214 | Eilat |

For full reference, see [IMS_XML_REFERENCE.md](IMS_XML_REFERENCE.md).

## Need Help?

If you encounter issues or need assistance:
1. Email: ims@ims.gov.il (for IMS-specific questions)
2. Check the IMS Terms & Conditions for automated access policies
3. Consult your development team with screenshots of what you're seeing

## Quick Reference Card

```
1. Open https://ims.gov.il/en/RSS_ForecastAlerts
2. Press F12 (Developer Tools)
3. Click "Network" tab
4. Click a city forecast link
5. Find the XML request in Network tab
6. Copy the "Request URL"
7. Repeat for 2-3 more cities
8. Document the pattern
```

---

**Next Step**: After discovering URLs, update `src/xmlDownloader.ts` and run `npm run download-xml` to test.
