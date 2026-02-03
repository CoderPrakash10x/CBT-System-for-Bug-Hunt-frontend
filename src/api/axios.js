import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Admin key interceptor
API.interceptors.request.use((config) => {
  const key = localStorage.getItem("adminKey");
  if (key) config.headers["x-admin-key"] = key;
  return config;
});

export default API;
