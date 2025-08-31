// lib/axios.ts
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // This is important for cookies if frontend and backend are on different subdomains
});

// Attach Authorization header from Zustand store's token (or cookie as fallback)
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

// Interceptor to handle expired tokens and other auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check for 401 Unauthorized error and ensure it's not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh the token. The backend should handle this by checking the refresh token cookie
        // and issuing a new access token via the Authorization header or a new 'token' cookie.
        // For this project, let's assume a refresh endpoint is not yet implemented and just log out.
        
        console.error("Authentication error (401). Logging out.");
        useAuthStore.getState().logout();
        // Use window.location to force a full page reload to the login page, clearing all state.
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        
        return Promise.reject(error);

      } catch (logoutError) {
        return Promise.reject(logoutError);
      }
    }
    return Promise.reject(error);
  }
);