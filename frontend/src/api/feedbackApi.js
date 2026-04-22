import axiosInstance from './axiosInstance';

export const submitFeedback = (payload) => axiosInstance.post('/feedback', payload);

export const getFeedback = (params) => axiosInstance.get('/feedback', { params });
