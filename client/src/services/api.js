import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL 
    ? `${process.env.REACT_APP_API_URL}/api` 
    : 'http://localhost:5000/api',
  timeout: 30000, // Increased to 30s for Render cold starts
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically add the JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Retry logic for cold starts (network errors or 503s)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Only retry on network errors or 503 (service unavailable = cold start)
    const isRetryable =
      !error.response || error.response.status === 503 || error.code === 'ECONNABORTED';

    if (isRetryable && config && !config.__retryCount) {
      config.__retryCount = 0;
    }

    if (isRetryable && config && config.__retryCount < 3) {
      config.__retryCount += 1;
      // Exponential backoff: 2s, 4s, 8s
      const delay = 2000 * config.__retryCount;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;