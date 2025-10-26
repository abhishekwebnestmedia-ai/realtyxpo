import axios from "axios";

// Enable sending cookies (for HttpOnly cookie support). The server should
// set an HttpOnly cookie on login and clear it on logout. We keep the
// client-side cookie helpers as a fallback, but prefer server-managed cookies.
const api = axios.create({
  baseURL: "https://backend.realtyxpo.in/api",
  headers: {
    "Content-Type": "application/json",
  },
  // Allow browser to include cookies on requests to the API origin

});

export default api;
