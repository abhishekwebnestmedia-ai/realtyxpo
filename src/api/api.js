import axios from "axios";

// Enable sending cookies (for HttpOnly cookie support). The server should
// set an HttpOnly cookie on login and clear it on logout. We keep the
// client-side cookie helpers as a fallback, but prefer server-managed cookies.

// Use localhost for development, production URL for production
// const baseURL = import.meta.env.DEV 
//   ? "http://localhost:5000/api" 
//   : "https://backend.realtyxpo.in/api";
// const baseURL = "https://nesthubackend.webnestmedia.online/api";

const baseURL = "https://maroon-hippopotamus-660766.hostingersite.com/api";
console.log('API BASE URL:', baseURL);

const api = axios.create({
  baseURL: baseURL,
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


