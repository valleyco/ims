/**
 * City to Station Mapping
 * Maps the 15 IMS RSS forecast cities to geographic coordinates
 */

export interface City {
  id: string;
  name: string;
  nameHebrew: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

/**
 * 15 cities that have XML/RSS forecasts from IMS
 * Coordinates are approximate city centers
 */
export const CITIES: City[] = [
  {
    id: 'jerusalem',
    name: 'Jerusalem',
    nameHebrew: 'ירושלים',
    location: { latitude: 31.7683, longitude: 35.2137 }
  },
  {
    id: 'telaviv',
    name: 'Tel Aviv',
    nameHebrew: 'תל אביב',
    location: { latitude: 32.0853, longitude: 34.7818 }
  },
  {
    id: 'haifa',
    name: 'Haifa',
    nameHebrew: 'חיפה',
    location: { latitude: 32.7940, longitude: 34.9896 }
  },
  {
    id: 'beersheva',
    name: 'Beer Sheva',
    nameHebrew: 'באר שבע',
    location: { latitude: 31.2518, longitude: 34.7913 }
  },
  {
    id: 'eilat',
    name: 'Eilat',
    nameHebrew: 'אילת',
    location: { latitude: 29.5581, longitude: 34.9482 }
  },
  {
    id: 'tiberias',
    name: 'Tiberias',
    nameHebrew: 'טבריה',
    location: { latitude: 32.7940, longitude: 35.5308 }
  },
  {
    id: 'nazareth',
    name: 'Nazareth',
    nameHebrew: 'נצרת',
    location: { latitude: 32.7046, longitude: 35.2978 }
  },
  {
    id: 'afula',
    name: 'Afula',
    nameHebrew: 'עפולה',
    location: { latitude: 32.6074, longitude: 35.2897 }
  },
  {
    id: 'beitdagan',
    name: 'Beit Dagan',
    nameHebrew: 'בית דגן',
    location: { latitude: 32.0025, longitude: 34.8213 }
  },
  {
    id: 'zefat',
    name: 'Zefat',
    nameHebrew: 'צפת',
    location: { latitude: 32.9658, longitude: 35.4983 }
  },
  {
    id: 'lod',
    name: 'Lod',
    nameHebrew: 'לוד',
    location: { latitude: 31.9510, longitude: 34.8880 }
  },
  {
    id: 'dimona',
    name: 'Dimona',
    nameHebrew: 'דימונה',
    location: { latitude: 31.0686, longitude: 35.0333 }
  },
  {
    id: 'yotvata',
    name: 'Yotvata',
    nameHebrew: 'יטבתה',
    location: { latitude: 29.9000, longitude: 35.0667 }
  },
  {
    id: 'deadsea',
    name: 'Dead Sea',
    nameHebrew: 'ים המלח',
    location: { latitude: 31.3547, longitude: 35.4736 }
  },
  {
    id: 'mitzperamon',
    name: 'Mitzpe Ramon',
    nameHebrew: 'מצפה רמון',
    location: { latitude: 30.6095, longitude: 34.8016 }
  }
];

/**
 * Haversine distance calculation (in kilometers)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find the nearest city to a given location
 * @param latitude User's latitude
 * @param longitude User's longitude
 * @returns Nearest city object with distance
 */
export function findNearestCity(
  latitude: number,
  longitude: number
): City & { distance: number } {
  let nearestCity: City | null = null;
  let minDistance = Infinity;

  for (const city of CITIES) {
    const distance = calculateDistance(
      latitude,
      longitude,
      city.location.latitude,
      city.location.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }

  if (!nearestCity) {
    // Fallback to Tel Aviv if something goes wrong
    nearestCity = CITIES[1];
  }

  return {
    ...nearestCity,
    distance: minDistance
  };
}

/**
 * Get city by ID
 */
export function getCityById(cityId: string): City | undefined {
  return CITIES.find(city => city.id === cityId);
}

/**
 * Get all cities
 */
export function getAllCities(): City[] {
  return CITIES;
}
