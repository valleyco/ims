# RSS Feed URL Discovery Guide

## Overview

The IMS website uses Angular templates to generate RSS feed URLs dynamically on the client side. This means the actual URLs are not visible in the HTML source code. To discover them, you need to use browser Developer Tools to capture the URLs when clicking on feed links.

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

## Alternative Method: View Page Source

If the Network tab is confusing, you can also:

1. Click on a feed link to open the RSS feed in your browser
2. Look at the browser's address bar - that's the URL!
3. Copy the URL from the address bar

This method is simpler but requires clicking each link individually.

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

The city IDs visible in the Angular templates are:
- 31 - (First city)
- 6 - (Second city)
- 8 - (Third city)
- 75 - (Fourth city)
- 3 - (Fifth city)
- 40 - (Sixth city)
- 1 - (Seventh city)
- 77 - (Eighth city)
- 76 - (Ninth city)
- 78 - (Tenth city)
- 80 - (Eleventh city)
- 33 - (Twelfth city)
- 50 - (Thirteenth city)
- 79 - (Fourteenth city)
- 2 - (Fifteenth city)

**Note**: The actual city names are hidden in Angular variables. The URLs you discover will reveal which ID maps to which city.

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
