// State management
let currentStation = null;
let currentPeriod = 'today';
let userLocation = null;

// DOM Elements
const detectLocationBtn = document.getElementById('detectLocationBtn');
const manualLocationBtn = document.getElementById('manualLocationBtn');
const latInput = document.getElementById('latInput');
const lonInput = document.getElementById('lonInput');
const locationStatus = document.getElementById('locationStatus');
const locationSpinner = document.getElementById('locationSpinner');
const weatherCard = document.getElementById('weatherCard');
const weatherLoading = document.getElementById('weatherLoading');
const weatherContent = document.getElementById('weatherContent');
const errorToast = document.getElementById('errorToast');
const errorMessage = document.getElementById('errorMessage');
const rangeButtons = document.querySelectorAll('.range-btn');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners
    detectLocationBtn.addEventListener('click', detectLocation);
    manualLocationBtn.addEventListener('click', useManualLocation);

    // Date range buttons
    rangeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            rangeButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentPeriod = e.target.dataset.period;
            if (currentStation) {
                fetchWeatherData(currentStation.stationId);
            }
        });
    });

    // Check if we have saved location and station
    const savedLat = localStorage.getItem('lastLat');
    const savedLon = localStorage.getItem('lastLon');
    const savedStation = localStorage.getItem('currentStation');

    if (savedLat && savedLon) {
        latInput.value = savedLat;
        lonInput.value = savedLon;
    }

    // If we have a saved station, offer to use it
    if (savedStation && savedLat && savedLon) {
        try {
            currentStation = JSON.parse(savedStation);
            userLocation = { lat: parseFloat(savedLat), lon: parseFloat(savedLon) };
            locationStatus.textContent = `Last used: ${currentStation.name}`;
            locationStatus.className = 'status-message info';
        } catch (e) {
            console.error('Error loading saved station:', e);
        }
    }
});

// Detect user location using browser geolocation
function detectLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    // Show loading state
    detectLocationBtn.disabled = true;
    locationSpinner.classList.remove('hidden');
    locationStatus.textContent = 'Detecting your location...';
    locationStatus.className = 'status-message info';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            userLocation = { lat, lon };
            latInput.value = lat.toFixed(4);
            lonInput.value = lon.toFixed(4);

            // Save to localStorage
            localStorage.setItem('lastLat', lat);
            localStorage.setItem('lastLon', lon);

            locationStatus.textContent = `✓ Location detected: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            locationStatus.className = 'status-message success';

            // Find nearest station
            findNearestStation(lat, lon);

            // Reset button
            detectLocationBtn.disabled = false;
            locationSpinner.classList.add('hidden');
        },
        (error) => {
            let errorMsg = 'Unable to detect location';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg = 'Location permission denied. Please enable location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg = 'Location information unavailable';
                    break;
                case error.TIMEOUT:
                    errorMsg = 'Location request timed out';
                    break;
            }

            showError(errorMsg);
            locationStatus.textContent = '✗ ' + errorMsg;
            locationStatus.className = 'status-message error';
            detectLocationBtn.disabled = false;
            locationSpinner.classList.add('hidden');
        }
    );
}

// Use manually entered location
function useManualLocation() {
    const lat = parseFloat(latInput.value);
    const lon = parseFloat(lonInput.value);

    if (isNaN(lat) || isNaN(lon)) {
        showError('Please enter valid latitude and longitude');
        return;
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        showError('Latitude must be between -90 and 90, longitude between -180 and 180');
        return;
    }

    userLocation = { lat, lon };

    // Save to localStorage
    localStorage.setItem('lastLat', lat);
    localStorage.setItem('lastLon', lon);

    locationStatus.textContent = `Location set to: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    locationStatus.className = 'status-message success';

    findNearestStation(lat, lon);
}

// Find nearest weather station
async function findNearestStation(lat, lon) {
    try {
        locationStatus.textContent = 'Finding nearest weather station...';
        locationStatus.className = 'status-message info';

        const response = await fetch(`/api/nearest-station?lat=${lat}&lon=${lon}`);

        if (!response.ok) {
            throw new Error('Failed to find nearest station');
        }

        const data = await response.json();
        currentStation = data.station;

        // Save to localStorage
        localStorage.setItem('currentStation', JSON.stringify(currentStation));

        locationStatus.textContent = `✓ Nearest station: ${currentStation.name} (${data.distance} km away)`;
        locationStatus.className = 'status-message success';

        // Fetch weather data
        fetchWeatherData(currentStation.stationId);

    } catch (error) {
        console.error('Error finding station:', error);
        showError('Failed to find nearest station. Please try again.');
        locationStatus.textContent = '✗ Failed to find station';
        locationStatus.className = 'status-message error';
    }
}

// Fetch weather data for station
async function fetchWeatherData(stationId) {
    try {
        // Show weather card and loading state
        weatherCard.classList.remove('hidden');
        weatherLoading.classList.remove('hidden');
        weatherContent.classList.add('hidden');

        // Fetch both current conditions and forecast
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`/api/station-data?stationId=${stationId}&period=${currentPeriod}`),
            fetch(`/api/forecast?stationId=${stationId}&period=${currentPeriod}`)
        ]);

        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        // Display weather data
        displayWeatherData(currentData);
        displayForecast(forecastData.forecast, forecastData.period);

        // Hide loading, show content
        weatherLoading.classList.add('hidden');
        weatherContent.classList.remove('hidden');

    } catch (error) {
        console.error('Error fetching weather:', error);
        showError('Failed to fetch weather data. Please try again.');
        weatherCard.classList.add('hidden');
    }
}

// Display weather data in the UI
function displayWeatherData(data) {
    // Update station info
    document.getElementById('stationName').textContent = currentStation.name || 'Weather Station';

    const locationText = currentStation.location
        ? `${currentStation.location.latitude.toFixed(2)}°N, ${currentStation.location.longitude.toFixed(2)}°E`
        : 'Location unknown';
    document.getElementById('stationLocation').textContent = locationText;

    // Calculate and show distance
    if (userLocation && currentStation.location) {
        const distance = calculateDistance(
            userLocation.lat,
            userLocation.lon,
            currentStation.location.latitude,
            currentStation.location.longitude
        );
        document.getElementById('distanceBadge').textContent = `${distance.toFixed(1)} km away`;
    }

    // Process channel data for current conditions
    const channelData = {};

    data.channels.forEach(channel => {
        if (channel.data && channel.data.data && channel.data.data.length > 0) {
            // Get the latest reading for current conditions
            const latestReading = channel.data.data[channel.data.data.length - 1];
            if (latestReading.channels && latestReading.channels.length > 0) {
                channelData[channel.channelId] = latestReading.channels[0];
            }
        }
    });

    // Update temperature (channel 7 = TD)
    if (channelData[7] && channelData[7].value != null) {
        document.getElementById('currentTemp').textContent = channelData[7].value.toFixed(1);
    } else {
        document.getElementById('currentTemp').textContent = 'N/A';
    }

    // Update humidity (channel 8 = RH)
    if (channelData[8] && channelData[8].value != null) {
        document.getElementById('humidity').textContent = channelData[8].value.toFixed(0) + '%';
    } else {
        document.getElementById('humidity').textContent = 'N/A';
    }

    // Update wind speed (channel 4 = WS)
    if (channelData[4] && channelData[4].value != null) {
        document.getElementById('windSpeed').textContent = channelData[4].value.toFixed(1) + ' m/s';
    } else {
        document.getElementById('windSpeed').textContent = 'N/A';
    }

    // Update wind direction (channel 5 = WD)
    if (channelData[5] && channelData[5].value != null) {
        const direction = getWindDirection(channelData[5].value);
        document.getElementById('windDirection').textContent = direction;
    } else {
        document.getElementById('windDirection').textContent = 'N/A';
    }

    // Update rainfall (channel 1 = Rain)
    if (channelData[1] && channelData[1].value != null) {
        document.getElementById('rainfall').textContent = channelData[1].value.toFixed(1) + ' mm';
    } else {
        document.getElementById('rainfall').textContent = 'N/A';
    }

    // Update date range
    const dateRangeText = `${data.dateRange.from} to ${data.dateRange.to}`;
    document.getElementById('dateRangeDisplay').textContent = dateRangeText;

    // Update last updated time
    const now = new Date();
    document.getElementById('lastUpdated').textContent = now.toLocaleTimeString();
}

// Display forecast based on period
function displayForecast(forecastArray, period) {
    const forecastSection = document.getElementById('forecastSection');
    const tableHead = document.getElementById('forecastTableHead');
    const tableBody = document.getElementById('forecastTableBody');

    console.log('displayForecast called:', {
        hasData: !!forecastArray,
        dataLength: forecastArray ? forecastArray.length : 0,
        period: period
    });

    if (!forecastArray || forecastArray.length === 0) {
        console.log('No forecast data, hiding forecast');
        forecastSection.classList.add('hidden');
        return;
    }

    console.log('Showing forecast section');
    forecastSection.classList.remove('hidden');

    if (period === 'today') {
        // Hourly forecast for today/next day
        console.log('Displaying hourly forecast');
        displayHourlyForecast(forecastArray, tableHead, tableBody);
    } else {
        // Daily min/max for week/month
        console.log('Displaying daily forecast');
        displayDailyForecast(forecastArray, tableHead, tableBody);
    }
}

// Display hourly forecast
function displayHourlyForecast(forecastArray, tableHead, tableBody) {
    console.log('displayHourlyForecast:', {
        forecastCount: forecastArray.length
    });

    // Create table
    tableHead.innerHTML = `
        <tr>
            <th>Time</th>
            <th>Temperature</th>
            <th>Humidity</th>
            <th>Rainfall</th>
        </tr>
    `;

    // Display last 24 hours
    const displayData = forecastArray.slice(-24);

    // Get current hour
    const now = new Date();
    const currentHour = now.getHours();

    // Find current hour in data
    let currentHourIndex = -1;
    for (let i = displayData.length - 1; i >= 0; i--) {
        const timeParts = displayData[i].time.split(' ');
        const hourParts = timeParts[1].split(':');
        const entryHour = parseInt(hourParts[0], 10);

        if (entryHour === currentHour) {
            currentHourIndex = i;
            break;
        }
    }

    // Reorder data: current hour first, then next hours, then previous hours
    let reorderedData;
    if (currentHourIndex !== -1) {
        reorderedData = [
            ...displayData.slice(currentHourIndex),
            ...displayData.slice(0, currentHourIndex)
        ];
    } else {
        // If current hour not found, keep original order
        reorderedData = displayData;
    }

    console.log('Hourly data processed:', {
        totalEntries: forecastArray.length,
        displayingEntries: reorderedData.length,
        currentHour: currentHour,
        currentHourIndex: currentHourIndex
    });

    tableBody.innerHTML = reorderedData.map((entry, index) => {
        const temp = entry.temp || 'N/A';
        const humidity = entry.humidity || 'N/A';
        const rain = entry.rain || '0.0';

        // Parse time from "YYYY-MM-DD HH:00" format and extract hour
        const timeParts = entry.time.split(' ');
        const hourParts = timeParts[1].split(':');
        const hour = hourParts[0];

        // First row is current hour
        const isCurrent = index === 0;
        const rowClass = isCurrent ? 'current-hour' : '';

        return `
            <tr class="${rowClass}">
                <td>${hour}:00</td>
                <td>${temp}°C</td>
                <td>${humidity}%</td>
                <td>${rain} mm</td>
            </tr>
        `;
    }).join('');
}

// Display daily min/max forecast
function displayDailyForecast(forecastArray, tableHead, tableBody) {
    console.log('displayDailyForecast:', {
        forecastCount: forecastArray.length
    });

    // Create table
    tableHead.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Min Temp</th>
            <th>Max Temp</th>
            <th>Current Temp</th>
            <th>Avg Humidity</th>
            <th>Total Rain</th>
        </tr>
    `;

    console.log('Daily data processed:', {
        totalDays: forecastArray.length,
        dates: forecastArray.map(d => d.date)
    });

    tableBody.innerHTML = forecastArray.map(entry => {
        const minTemp = entry.tempMin || 'N/A';
        const maxTemp = entry.tempMax || 'N/A';
        const currentTemp = entry.tempCurrent || 'N/A';
        const humidity = entry.humidity || 'N/A';
        const rain = entry.rain || '0.0';

        // Parse date from "YYYY-MM-DD" format
        const dateParts = entry.date.split('-');
        const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

        const displayDate = date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        return `
            <tr>
                <td>${displayDate}</td>
                <td>${minTemp}°C</td>
                <td>${maxTemp}°C</td>
                <td><strong>${currentTemp}°C</strong></td>
                <td>${humidity}%</td>
                <td>${rain} mm</td>
            </tr>
        `;
    }).join('');
}

// Utility: Calculate distance (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Utility: Convert wind degrees to direction
function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index] + ' (' + degrees.toFixed(0) + '°)';
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorToast.classList.remove('hidden');
    errorToast.classList.add('show');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

// Hide error message
function hideError() {
    errorToast.classList.remove('show');
    setTimeout(() => {
        errorToast.classList.add('hidden');
    }, 300);
}
