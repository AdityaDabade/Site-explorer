import { haversine } from './geoUtils';

export const DEFAULT_ORIGIN = { lat: 18.5204, lng: 73.8567, name: 'Pune' };

export const DESTINATION_LIBRARY = {
  Pune: { lat: 18.5204, lng: 73.8567, image: 'https://images.unsplash.com/photo-1591360236480-4ed861025fa1?auto=format&fit=crop&w=600&q=80', terrain: 'Urban start' },
  Sinhagad: { lat: 18.3663, lng: 73.7559, image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80', terrain: 'Hill fort climb' },
  Rajgad: { lat: 18.2462, lng: 73.6829, image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80', terrain: 'Trekking ridge' },
  Torna: { lat: 18.276, lng: 73.621, image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80', terrain: 'High ridge trek' },
  Lohagad: { lat: 18.7101, lng: 73.4824, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', terrain: 'Fort trail' },
  Mumbai: { lat: 19.076, lng: 72.8777, image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80', terrain: 'Coastal city' },
  Goa: { lat: 15.2993, lng: 74.124, image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80', terrain: 'Coastal roads' },
  Jaipur: { lat: 26.9124, lng: 75.7873, image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80', terrain: 'Royal city' },
  Delhi: { lat: 28.6139, lng: 77.209, image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80', terrain: 'City heritage' }
};

export const TRANSPORT_OPTIONS = [
  { id: 'car', label: 'Car', ratePerKm: 12, fuelPerKm: 7.5, speedKmh: 42, timeFactor: 1 },
  { id: 'bike', label: 'Bike', ratePerKm: 8, fuelPerKm: 3.8, speedKmh: 48, timeFactor: 0.9 },
  { id: 'bus', label: 'Bus', ratePerKm: 4, fuelPerKm: 0, speedKmh: 30, timeFactor: 1.35 },
  { id: 'train', label: 'Train', ratePerKm: 5, fuelPerKm: 0, speedKmh: 58, timeFactor: 0.82 }
];

export function formatCurrency(value) {
  return `INR ${Math.round(Number(value || 0)).toLocaleString('en-IN')}`;
}

export function formatDistance(km) {
  return `${Math.max(0, Number(km || 0)).toFixed(Number(km || 0) >= 10 ? 0 : 1)} km`;
}

export function formatDuration(minutes) {
  const total = Math.max(0, Math.round(Number(minutes || 0)));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return hours ? `${hours} hr${mins ? ` ${mins} min` : ''}` : `${mins} min`;
}

export function resolveDestinationPlace(destination, index = 0) {
  const name = typeof destination === 'string' ? destination : destination?.name;
  const known = DESTINATION_LIBRARY[name] || {};

  return {
    id: `trip-stop-${index}-${name || 'destination'}`,
    name: name || 'Destination',
    lat: Number(destination?.lat || known.lat || DEFAULT_ORIGIN.lat + 0.18 + index * 0.09),
    lng: Number(destination?.lng || known.lng || DEFAULT_ORIGIN.lng + 0.18 + index * 0.08),
    image: destination?.image || known.image || '',
    terrain: destination?.terrain || known.terrain || 'Mixed route',
    category: 'Trip stop'
  };
}

export function buildGoogleMapsUrl(destination, origin) {
  const params = new URLSearchParams({
    api: '1',
    destination: `${destination.lat},${destination.lng}`,
    dir_action: 'navigate',
    travelmode: 'driving'
  });

  if (origin?.lat && origin?.lng) {
    params.set('origin', `${origin.lat},${origin.lng}`);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

async function fetchSegmentRoute(origin, destination, transport) {
  const directDistance = haversine(origin.lat, origin.lng, destination.lat, destination.lng);
  const fallbackDuration = (directDistance / transport.speedKmh) * 60;
  const fallback = {
    coordinates: [
      [origin.lat, origin.lng],
      [destination.lat, destination.lng]
    ],
    destinationId: destination.id,
    distanceKm: directDistance,
    durationMin: fallbackDuration,
    from: origin.name || 'Origin',
    source: 'direct',
    to: destination.name
  };

  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
    );

    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();
    const route = data?.routes?.[0];

    if (!route?.geometry?.coordinates?.length) {
      return fallback;
    }

    return {
      ...fallback,
      coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      distanceKm: Number(route.distance || 0) / 1000,
      durationMin: (Number(route.duration || 0) / 60) * transport.timeFactor,
      source: 'osrm'
    };
  } catch {
    return fallback;
  }
}

export async function fetchRoutePlan(origin, destinations, transport) {
  const stops = (destinations || []).map(resolveDestinationPlace);
  const points = [{ ...DEFAULT_ORIGIN, ...origin }, ...stops];
  const selectedTransport = TRANSPORT_OPTIONS.find((item) => item.id === transport) || TRANSPORT_OPTIONS[0];
  const segments = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    // Serial requests preserve segment order for route progress.
    // eslint-disable-next-line no-await-in-loop
    segments.push(await fetchSegmentRoute(points[index], points[index + 1], selectedTransport));
  }

  const routeCoordinates = segments.flatMap((segment, index) => (index === 0 ? segment.coordinates : segment.coordinates.slice(1)));
  const totalDistanceKm = segments.reduce((sum, segment) => sum + Number(segment.distanceKm || 0), 0);
  const totalDurationMin = segments.reduce((sum, segment) => sum + Number(segment.durationMin || 0), 0);

  return {
    routeCoordinates,
    segments,
    source: segments.some((segment) => segment.source === 'osrm') ? 'osrm' : 'direct',
    stops,
    totalDistanceKm,
    totalDurationMin
  };
}

export function estimateTripCosts({ days = 1, destinations = [], routePlan, transport = 'car', travelers = 1 }) {
  const selectedTransport = TRANSPORT_OPTIONS.find((item) => item.id === transport) || TRANSPORT_OPTIONS[0];
  const distance = Number(routePlan?.totalDistanceKm || 0);
  const safeTravelers = Math.max(Number(travelers || 1), 1);
  const safeDays = Math.max(Number(days || 1), 1);
  const fuelCost = distance * selectedTransport.fuelPerKm;
  const travelCost = distance * selectedTransport.ratePerKm;
  const entryFees = destinations.length * safeTravelers * 80;
  const foodCost = safeTravelers * safeDays * 350;
  const stayCost = Math.max(0, safeDays - 1) * safeTravelers * 900;
  const miscellaneous = Math.max(500, destinations.length * safeTravelers * 150);
  const total = fuelCost + travelCost + entryFees + foodCost + stayCost + miscellaneous;

  return {
    entryFees,
    foodCost,
    fuelCost,
    miscellaneous,
    perPerson: total / safeTravelers,
    stayCost,
    total,
    travelCost
  };
}

export function estimateWeather(destination, date = new Date()) {
  const seed = String(destination?.name || destination || 'Trip')
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const month = new Date(date).getMonth();
  const monsoonBoost = month >= 5 && month <= 8 ? 24 : 0;
  const rainChance = Math.min(88, 12 + (seed % 38) + monsoonBoost);
  const temperature = 20 + (seed % 12);

  return {
    rainChance,
    temperature,
    trekking: rainChance > 65 ? 'Slippery trail risk' : temperature > 30 ? 'Start early' : 'Good conditions'
  };
}

export function getNearestStop(location, stops = []) {
  if (!location || !stops.length) {
    return { distanceKm: 0, index: 0, stop: stops[0] || null };
  }

  return stops.reduce(
    (nearest, stop, index) => {
      const distanceKm = haversine(location.lat, location.lng, stop.lat, stop.lng);
      return distanceKm < nearest.distanceKm ? { distanceKm, index, stop } : nearest;
    },
    { distanceKm: Infinity, index: 0, stop: stops[0] }
  );
}

export function getRemainingRouteCoordinates(routeCoordinates = [], location) {
  if (!location || !routeCoordinates.length) {
    return routeCoordinates;
  }

  const nearestIndex = routeCoordinates.reduce(
    (nearest, coordinate, index) => {
      const distanceKm = haversine(location.lat, location.lng, coordinate[0], coordinate[1]);
      return distanceKm < nearest.distanceKm ? { distanceKm, index } : nearest;
    },
    { distanceKm: Infinity, index: 0 }
  ).index;

  return [[location.lat, location.lng], ...routeCoordinates.slice(nearestIndex + 1)];
}

export function getRouteDistanceKm(coordinates = []) {
  return coordinates.slice(1).reduce((sum, coordinate, index) => {
    const previous = coordinates[index];
    return sum + haversine(previous[0], previous[1], coordinate[0], coordinate[1]);
  }, 0);
}
