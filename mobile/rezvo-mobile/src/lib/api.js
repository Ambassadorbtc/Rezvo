import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Production URL - same as web app
const API_URL = 'https://booking-upgrade-9.preview.emergentagent.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('rezvo_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('rezvo_token');
      await AsyncStorage.removeItem('rezvo_user');
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper to format pence to GBP
export const formatPrice = (pence) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pence / 100);
};

// Helper to format date
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

// Helper to format time
export const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
