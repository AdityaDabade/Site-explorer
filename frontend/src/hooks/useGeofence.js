import { useMemo } from 'react';
import { isPointInPolygon } from '../utils/geoUtils';

/**
 * Computes geofence membership locally so the UI can react instantly.
 */
export function useGeofence(polygon, coords) {
  return useMemo(() => {
    if (
      !polygon?.length ||
      coords?.lat === undefined ||
      coords?.lat === null ||
      coords?.lng === undefined ||
      coords?.lng === null
    ) {
      return false;
    }

    return isPointInPolygon(
      [coords.lat, coords.lng],
      polygon.map((point) => [point.lat, point.lng])
    );
  }, [coords?.lat, coords?.lng, polygon]);
}
