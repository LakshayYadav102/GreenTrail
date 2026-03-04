import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 15000, // Increased slightly for YOLO processing
  headers: {
    'Content-Type': 'application/json'
  }
});

export default instance;