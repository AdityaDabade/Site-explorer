import axiosInstance from './axiosInstance';

export const getUsers = () => axiosInstance.get('/admin/users');

export const getAdminStats = () => axiosInstance.get('/admin/stats');

export const approveContent = (id, note = '') =>
  axiosInstance.put(`/admin/content/${id}`, { status: 'approved', note });

export const rejectContent = (id, note = '') =>
  axiosInstance.put(`/admin/content/${id}`, { status: 'rejected', note });
