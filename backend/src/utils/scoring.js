function haversineDistanceKm(origin, destination) {
  if (!origin || !destination) {
    return null;
  }

  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(destination.lat - origin.lat);
  const deltaLng = toRadians(destination.lng - origin.lng);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(origin.lat)) *
      Math.cos(toRadians(destination.lat)) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function calculateNearbyScore(place, userLocation) {
  const distanceKm = userLocation
    ? haversineDistanceKm(userLocation, {
        lat: place.location?.coordinates?.[1],
        lng: place.location?.coordinates?.[0]
      })
    : null;

  const distanceScore = distanceKm === null ? 5 : clamp(10 - distanceKm * 1.4, 0, 10);
  const ratingScore = clamp(Number(place.rating || 0) * 2, 0, 10);
  const reviewScore = clamp(Math.log10(Number(place.review_count || 1)) * 2.6, 0, 10);
  const aiScore = place.has_ai_content || place.ai_content_available ? 1 : 0;

  const score = Number(
    (distanceScore * 0.45 + ratingScore * 0.3 + reviewScore * 0.2 + aiScore * 0.05).toFixed(2)
  );

  return {
    distanceKm,
    score
  };
}

module.exports = {
  calculateNearbyScore,
  haversineDistanceKm
};
