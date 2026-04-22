import axiosInstance from './axiosInstance';

// Authentication endpoints for JWT-based session handling.
export const loginUser = (payload) => axiosInstance.post('/auth/login', payload);
export const login = loginUser;

export const signupUser = (payload) => axiosInstance.post('/auth/signup', payload);
export const signup = signupUser;

export const getMe = () => axiosInstance.get('/auth/me');

export const logoutUser = () => axiosInstance.post('/auth/logout');
export const logout = logoutUser;
