import { FALLBACK_PLACES } from '../constants/homeData';

/**
 * Normalizes a raw place object (from API) into the shape the UI expects.
 * @param {object} place - Raw place data
 * @param {number} index - Array index (used for fallback values)
 * @returns {object} Normalized place
 */
export function normalizePlace(place, index) {
  return {
    id: place.id || index + 1,
    name: place.name || place.title || `Place ${index + 1}`,
    location_name:
      place.location_name ||
      place.city ||
      (place.location?.coordinates
        ? `${place.location.coordinates[1]}, ${place.location.coordinates[0]}`
        : 'TourVision destination'),
    category: place.category || place.type || 'Experience',
    distance: Number(place.distance || 0),
    rating: Number(place.rating || 4.8),
    review_count: place.review_count || place.reviews || 1200 + index * 117,
    price: Number(place.price || place.entry_fee || 0),
    free_entry: Number(place.price || place.entry_fee || 0) === 0,
    has_ar: Boolean(place.has_ar || place.ar_model_url),
    image:
      place.image ||
      place.images?.[0] ||
      FALLBACK_PLACES[index % FALLBACK_PLACES.length].image,
    score: Number(place.score || 8.7 + (index % 5) * 0.2).toFixed(1),
    region:
      place.region ||
      place.country ||
      (index % 2 === 0 ? 'India' : 'Asia'),
  };
}
