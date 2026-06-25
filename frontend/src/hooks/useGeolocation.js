import { useEffect, useMemo, useState } from 'react';

/**
 * Watches the user's position and normalizes success and error states for the app.
 */
export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [isLocating, setIsLocating] = useState(true);

  const applyPosition = (position) => {
    setLocation({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      city: '',
      state: '',
      accuracy: position.coords.accuracy
    });
    setError('');
    setIsLocating(false);
  };

  const applyError = (geoError) => {
    setError(geoError.message || 'Unable to access your location.');
    setIsLocating(false);
  };

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by this browser.');
      setIsLocating(false);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      applyPosition,
      applyError,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000
      }
    );
  };

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by this browser.');
      setIsLocating(false);
      return undefined;
    }

    const watcherId = navigator.geolocation.watchPosition(
      applyPosition,
      applyError,
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000
      }
    );

    return () => navigator.geolocation.clearWatch(watcherId);
  }, []);

  const reverseGeocodeKey = useMemo(() => {
    if (!location?.lat || !location?.lng) {
      return '';
    }

    return `${location.lat.toFixed(4)},${location.lng.toFixed(4)}`;
  }, [location?.lat, location?.lng]);

  useEffect(() => {
    if (!reverseGeocodeKey || location?.city || location?.state) {
      return undefined;
    }

    const controller = new AbortController();

    const loadAddress = async () => {
      try {
        const params = new URLSearchParams({
          format: 'jsonv2',
          lat: String(location.lat),
          lon: String(location.lng)
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const address = data?.address || {};
        const city = address.city || address.town || address.village || address.county || '';
        const state = address.state || '';

        setLocation((current) => {
          if (!current || `${current.lat.toFixed(4)},${current.lng.toFixed(4)}` !== reverseGeocodeKey) {
            return current;
          }

          return {
            ...current,
            city,
            state
          };
        });
      } catch (reverseError) {
        if (reverseError.name !== 'AbortError') {
          console.warn('Location address lookup failed:', reverseError);
        }
      }
    };

    loadAddress();
    return () => controller.abort();
  }, [location?.city, location?.lat, location?.lng, location?.state, reverseGeocodeKey]);

  return {
    location,
    error,
    loading: isLocating,
    isLocating,
    requestLocation,
    supported: 'geolocation' in navigator
  };
}
