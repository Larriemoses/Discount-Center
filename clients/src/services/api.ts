// src/services/api.ts
import axios from "axios";

// IMPORTANT: Ensure this environment variable is correctly set in client/.env
// It should be: VITE_BACKEND_URL=http://localhost:5000/api
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

if (!API_BASE_URL) {
  console.error("Environment variable VITE_BACKEND_URL is not defined!");
  // In a production app, you might want a more robust error handling or default
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Interceptor to attach auth token. This will be used later for protected routes.
api.interceptors.request.use(
  (config) => {
    // Assuming you store your user/token in localStorage after login
    const user = localStorage.getItem("user");
    let token = null;
    if (user) {
      try {
        token = JSON.parse(user).token;
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
