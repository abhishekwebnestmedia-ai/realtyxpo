import axios from "axios";
import config from "../utils/config";

// Enable sending cookies (for HttpOnly cookie support). The server should
// set an HttpOnly cookie on login and clear it on logout. We keep the
// client-side cookie helpers as a fallback, but prefer server-managed cookies.

const api = axios.create({
  baseURL: config.getApiUrl('/api'),
  timeout: config.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  // Allow browser to include cookies on requests to the API origin
  withCredentials: true,

});

// Attach Authorization header automatically when token is available
api.interceptors.request.use((config) => {
  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (err) {
    // ignore
    console.log(err);
  }
  return config;
}, (error) => Promise.reject(error));

export default api;

