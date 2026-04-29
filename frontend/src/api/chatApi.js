import axiosInstance from './axiosInstance';

// Chat endpoint used by the floating widget and automated in-place guidance.
export const sendMessage = (payload) => axiosInstance.post('/chat/message', payload);

export const getChatHistory = (placeId) => axiosInstance.get(`/chat/history/${placeId}`);
