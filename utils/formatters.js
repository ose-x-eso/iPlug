/**
 * Format price in Naira
 * @param {number} amountInKobo - Amount in kobo (smallest unit)
 * @returns {string} Formatted price string
 */
export function formatPrice(amountInKobo) {
  const naira = amountInKobo / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(naira);
}

/**
 * Format distance in a human-readable way
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)}m away`;
  }
  const km = meters / 1000;
  if (km < 10) {
    return `${km.toFixed(1)}km away`;
  }
  return `${Math.round(km)}km away`;
}

/**
 * Format a date relative to now
 * @param {string|Date} date
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return then.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Format star rating (e.g., 4.7)
 * @param {number} rating
 * @param {number} reviewCount
 * @returns {string}
 */
export function formatRating(rating, reviewCount = 0) {
  if (!rating || reviewCount === 0) return "New";
  return `${rating.toFixed(1)} (${reviewCount})`;
}

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 * @returns {number} Distance in meters
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}
