import axiosInstance from './axiosInstance';

// Chat endpoint used by the floating widget and automated in-place guidance.
export const sendChatMessage = (payload) => axiosInstance.post('/chat/message', payload);
export const sendMessage = sendChatMessage;

export const getChatHistory = (placeId) => axiosInstance.get(`/chat/history/${placeId}`);
