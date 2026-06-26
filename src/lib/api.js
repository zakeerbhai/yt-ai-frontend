import axios from "axios";
import { auth } from "./firebase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
});

// Attach the current Firebase ID token to every outgoing request.
// getIdToken() automatically refreshes if the cached token is stale.
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize backend error shape (FastAPI returns {"detail": "..."})
// into a single readable message so components don't each re-parse it.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;
    const message = typeof detail === "string" ? detail : error.message;
    return Promise.reject(new Error(message));
  }
);

export default api;
