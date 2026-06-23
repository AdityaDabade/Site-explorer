import axiosInstance from './axiosInstance';

export const getAdminOverview = () => axiosInstance.get('/admin/overview');
export const getAdminStats = getAdminOverview;
export const getAdminAnalytics = () => axiosInstance.get('/admin/analytics');

export const getUsers = (params) => axiosInstance.get('/admin/users', { params });
export const updateUser = (id, payload) => axiosInstance.put(`/admin/users/${id}`, payload);
export const deleteUser = (id) => axiosInstance.delete(`/admin/users/${id}`);
export const getUserTrips = (id) => axiosInstance.get(`/admin/users/${id}/trips`);

export const getAdminPlaces = (params) => axiosInstance.get('/admin/places', { params });
export const createPlace = (payload) => axiosInstance.post('/admin/places', payload);
export const updatePlace = (id, payload) => axiosInstance.put(`/admin/places/${id}`, payload);
export const deletePlace = (id) => axiosInstance.delete(`/admin/places/${id}`);
export const updateAiGuide = (id, payload) => axiosInstance.put(`/admin/places/${id}/ai-guide`, payload);
export const generateQr = (id, payload = {}) => axiosInstance.post(`/admin/places/${id}/qr`, payload);

export const getAdminTrips = (params) => axiosInstance.get('/admin/trips', { params });
export const deleteTrip = (id) => axiosInstance.delete(`/admin/trips/${id}`);

export const getPendingContent = () => axiosInstance.get('/admin/content/pending');
export const approveContent = (id, note = '') =>
  axiosInstance.put(`/admin/content/${id}`, { status: 'approved', note });
export const rejectContent = (id, note = '') =>
  axiosInstance.put(`/admin/content/${id}`, { status: 'rejected', note });

export const getAdminFeedback = () => axiosInstance.get('/admin/feedback');
export const deleteFeedback = (id) => axiosInstance.delete(`/admin/feedback/${id}`);

export const getMedia = () => axiosInstance.get('/admin/media');
export const uploadAdminMedia = (formData) =>
  axiosInstance.post('/admin/media', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteMedia = (mediaUrl) => axiosInstance.delete('/admin/media', { data: { media_url: mediaUrl } });

export const getAlerts = () => axiosInstance.get('/admin/alerts');
export const createAlert = (payload) => axiosInstance.post('/admin/alerts', payload);
export const updateAlert = (id, payload) => axiosInstance.put(`/admin/alerts/${id}`, payload);
export const deleteAlert = (id) => axiosInstance.delete(`/admin/alerts/${id}`);

export const getSettings = () => axiosInstance.get('/admin/settings');
export const updateSettings = (settings) => axiosInstance.put('/admin/settings', { settings });
