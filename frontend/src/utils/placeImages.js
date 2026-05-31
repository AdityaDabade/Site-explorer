export const KNOWN_PLACE_IMAGES = {
  shaniwar_wada: 'https://commons.wikimedia.org/wiki/Special:FilePath/Shaniwar_Wada_Pune.jpg?width=900',
  sinhagad_fort: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sinhagad-Fort.jpg?width=900'
};

const GENERIC_IMAGE_PATTERNS = [
  'images.unsplash.com/photo-1500530855697',
  'images.unsplash.com/photo-1460661419201',
  'images.unsplash.com/photo-1506744038136'
];

function getPlaceSearchText(place) {
  return [
    place?.name,
    place?.title,
    place?.place_id,
    place?.slug,
    place?.location_name,
    place?.city,
    place?.category,
    place?.type
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function getKnownPlaceImage(place) {
  const text = getPlaceSearchText(place);

  if (text.includes('shaniwar') || text.includes('shanivar')) {
    return KNOWN_PLACE_IMAGES.shaniwar_wada;
  }

  if (text.includes('sinhagad') || text.includes('singad') || text.includes('sinharh')) {
    return KNOWN_PLACE_IMAGES.sinhagad_fort;
  }

  return '';
}

export function isGenericPlaceImage(image) {
  return Boolean(image && GENERIC_IMAGE_PATTERNS.some((pattern) => image.includes(pattern)));
}

export function resolvePlaceImage(place, fallbackImage = '') {
  const image = place?.image || place?.images?.[0] || '';
  const knownImage = getKnownPlaceImage(place);

  if (knownImage) {
    return knownImage;
  }

  return image || fallbackImage;
}
