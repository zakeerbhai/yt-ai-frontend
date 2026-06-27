import axios from "axios";
import { auth } from "./firebase";

const API_BASE = "https://grateful-insight-production-2e15.up.railway.app";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;
    const message = typeof detail === "string" ? detail : error.message;
    return Promise.reject(new Error(message));
  }
);

export default api;
