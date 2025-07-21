// client/src/utils/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
  // Use the environment variable for the backend URL
  baseURL: import.meta.env.VITE_BACKEND_URL, // For Vite
  // If you were using Create React App, it would be:
  // baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true, // Important for sending cookies/tokens like your adminToken
});

export default axiosInstance;
