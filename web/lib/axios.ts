// web/lib/axios.ts
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// ** THIS IS THE KEY FIX **
// Attach Authorization header by getting the most recent state from Zustand.
api.interceptors.request.use((config) => {
  // Use useAuthStore.getState() to access the store outside of a React component.
  const token = useAuthStore.getState().token;
  
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
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
        console.error("Authentication error (401). Forcing logout.");
        
        // ** IMPORTANT **
        // Directly call the logout logic from the store.
        // This will clear the user state and token, preventing further failed requests.
        useAuthStore.getState().logout();
        
        // Use window.location to force a full page reload to the login page.
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        
        return Promise.reject(new Error("Session expired. Please log in again."));

      } catch (logoutError) {
        return Promise.reject(logoutError);
      }
    }
    return Promise.reject(error);
  }
);