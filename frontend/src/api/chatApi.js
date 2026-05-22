import axiosInstance from './axiosInstance';
import axios from 'axios';

// Chat endpoint used by the floating widget and automated in-place guidance.
export const sendMessage = (payload) => axios.post('http://localhost:5000/api/chat/message', payload);

export const getChatHistory = (placeId) => axiosInstance.get(`/chat/history/${placeId}`);
