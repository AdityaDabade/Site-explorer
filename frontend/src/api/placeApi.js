import axiosInstance from './axiosInstance';

// Place endpoints used by home, nearby, and immersive place pages.
export const getPlaces = (params) => axiosInstance.get('/places', { params });

export const getPlaceById = (id) => axiosInstance.get(`/places/${id}`);

export const getAiContent = (id) => axiosInstance.get(`/places/${id}/ai-content`);

export const getNearbyPlaces = (params) => axiosInstance.get('/places/nearby', { params });

export const scanQr = (payload) => axiosInstance.post('/qr/scan', payload);

export const checkGeofence = (id, payload) =>
  axiosInstance.post(`/places/${id}/geofence`, payload);
