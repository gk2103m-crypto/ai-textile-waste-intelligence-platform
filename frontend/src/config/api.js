// Automatically detects whether app is running locally or deployed on cloud
const isLocal = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '[::1]'
);

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  isLocal 
    ? 'http://localhost:8000' 
    : 'https://ai-textile-backend.onrender.com'
);