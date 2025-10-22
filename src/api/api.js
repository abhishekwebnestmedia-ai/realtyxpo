import axios from "axios";
import { getCookie } from "../utils/cookies";

const api = axios.create({
  baseURL: "https://backend.realtyxpo.in/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getCookie('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
