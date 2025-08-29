// lib/axios.ts
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// Attach Authorization header from cookie token
api.interceptors.request.use((config) => {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
    const token = match ? decodeURIComponent(match[1]) : undefined;
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post("/auth/refresh");
        // The backend should set a new httpOnly cookie upon refresh
        // No need to set token here, the browser will handle the cookie
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout the user
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);