import axios from 'axios';

/* =========================
   SWITCH ENVIRONMENT HERE
========================= */

// LOCAL
const BASE_URL = 'http://localhost:5000';

// HOSTED (Render)
// const BASE_URL = 'https://greentrail-w8h3.onrender.com';



/* =========================
   AXIOS INSTANCE
========================= */

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});


/* =========================
   ADD JWT TOKEN
========================= */

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


/* =========================
   RETRY LOGIC FOR RENDER
========================= */

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const config = error.config;

    const isRetryable =
      !error.response ||
      error.response.status === 503 ||
      error.code === 'ECONNABORTED';

    if (isRetryable && config && !config.__retryCount) {
      config.__retryCount = 0;
    }

    if (isRetryable && config && config.__retryCount < 3) {
      config.__retryCount += 1;

      const delay = 2000 * config.__retryCount;

      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );

      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;