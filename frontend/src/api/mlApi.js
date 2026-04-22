import axios from 'axios';
import { mlUrl } from '../config/runtime';

const mlClient = axios.create({
  baseURL: mlUrl,
  timeout: 20000
});

export const recognizeImage = (formData) =>
  mlClient.post('/recognize', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

export const estimateCost = (payload) => mlClient.post('/cost/estimate', payload);

export const recommendHotels = (payload) => mlClient.post('/recommend/hotels', payload);

export const classifyFood = (payload) => mlClient.post('/classify/food', payload);

export const semanticSearch = (payload) => mlClient.post('/search/semantic', payload);

export const translateText = (payload) => mlClient.post('/translate', payload);
