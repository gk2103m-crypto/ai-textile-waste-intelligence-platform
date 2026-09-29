import axios from 'axios';

// Task 4: Environment Variables Validation
export const env = {
  get API_BASE_URL() {
    const url = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
    if (!url) {
      console.warn('API URL env var is missing. Falling back to auto-detection.');
      const isLocal = Boolean(
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '[::1]'
      );
      return isLocal ? 'http://localhost:8000' : 'https://ai-textile-waste-intelligence-platform-mccj.onrender.com';
    }
    return url;
  }
};

export const API_BASE_URL = env.API_BASE_URL;

// Task 3: Complete API & Network Resilience
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds timeout
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('API timeout: Request took longer than 15 seconds');
    } else if (error.response?.status >= 500) {
      console.error(`API Server Error (${error.response.status}): Mock data fallback triggered if handled by component.`);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);