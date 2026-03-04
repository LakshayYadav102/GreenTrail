import axios from 'axios';

const api = axios.create({
  // Use the environment variable and append /api to match your backend routes
  baseURL: process.env.REACT_APP_API_URL 
    ? `${process.env.REACT_APP_API_URL}/api` 
    : 'http://localhost:5000/api',
  timeout: 15000, 
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

export default api;