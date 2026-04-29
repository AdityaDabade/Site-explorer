import axiosInstance from './axiosInstance';

// Trip planning endpoints for route generation and travel story uploads.
export const planTrip = (payload) => axiosInstance.post('/trip/plan', payload);

export const getTrips = () => axiosInstance.get('/trip');

export const getTripById = (id) => axiosInstance.get(`/trip/${id}`);

export const addExpense = (tripId, payload) => axiosInstance.post(`/trip/${tripId}/expenses`, payload);

export const getExpenses = (tripId) => axiosInstance.get(`/trip/${tripId}/expenses`);

export const splitExpenses = (tripId) => axiosInstance.get(`/trip/${tripId}/expenses/split`);

export const uploadMedia = (formData) =>
  axiosInstance.post('/trip/stories', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
