/**
 * Get user's current GPS location
 * @returns {Promise<{lat: number, lng: number}>}
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Location permission denied. Please enable location access."));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location information is unavailable."));
            break;
          case error.TIMEOUT:
            reject(new Error("Location request timed out."));
            break;
          default:
            reject(new Error("An unknown error occurred."));
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  });
}

/**
 * Watch user's location continuously
 * @param {Function} onUpdate - Callback with { lat, lng }
 * @param {Function} onError - Error callback
 * @returns {number} Watch ID (use to clear with navigator.geolocation.clearWatch)
 */
export function watchLocation(onUpdate, onError) {
  if (!navigator.geolocation) {
    onError?.(new Error("Geolocation not supported"));
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onUpdate({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    (error) => {
      onError?.(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000,
    }
  );
}

/**
 * Reverse geocode coordinates to a human-readable location name
 * Uses Mapbox Geocoding API
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string>} Location name (e.g., "Lekki Phase 1")
 */
export async function reverseGeocode(lat, lng) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token || token === "placeholder-token") {
    return "Location unavailable";
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=neighborhood,locality,place&limit=1`
    );
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features[0].place_name
        .split(",")
        .slice(0, 2)
        .join(",")
        .trim();
    }

    return "Unknown location";
  } catch {
    return "Location unavailable";
  }
}
