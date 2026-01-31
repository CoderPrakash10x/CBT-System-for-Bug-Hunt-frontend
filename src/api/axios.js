import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 🔐 ADMIN KEY AUTO ATTACH
// Ab aapko har file mein headers likhne ki zaroorat nahi padegi
api.interceptors.request.use(
  (config) => {
    const adminKey = localStorage.getItem("adminKey");
    if (adminKey) {
      config.headers["x-admin-key"] = adminKey;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;