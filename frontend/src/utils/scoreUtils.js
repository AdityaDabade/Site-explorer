import { haversine } from './geoUtils';

/**
 * Matches user preferences against simple place attributes and tags.
 */
export function preferenceMatch(place, preferences = {}) {
  const tags = place?.tags || [];
  let score = 0;

  if (preferences.foodPreference && place?.food_type === preferences.foodPreference) {
    score += 1;
  }

  if (preferences.fuelType && place?.fuel_type === preferences.fuelType) {
    score += 1;
  }

  if (preferences.interests?.length) {
    score += preferences.interests.filter((interest) => tags.includes(interest)).length;
  }

  return score;
}

/**
 * Scores a place by distance, rating, and preference compatibility.
 */
export function scorePlace(place, userLat, userLng, preferences) {
  const distance = Math.max(haversine(userLat, userLng, place.lat, place.lng), 0.1);
  const alpha = 0.4;
  const beta = 0.4;
  const gamma = 0.2;

  return alpha * (1 / distance) + beta * (place.rating || 0) + gamma * preferenceMatch(place, preferences);
}
