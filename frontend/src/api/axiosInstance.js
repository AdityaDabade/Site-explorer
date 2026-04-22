import axios from 'axios';
import { apiBaseUrl } from '../config/runtime';

// Single axios client so every request flows through shared auth and error handling.
const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tourvision_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tourvision_token');
      localStorage.removeItem('tourvision_user');

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
