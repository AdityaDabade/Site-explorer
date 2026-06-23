import axiosInstance from './axiosInstance';

export const getActiveAlerts = () => axiosInstance.get('/alerts');
