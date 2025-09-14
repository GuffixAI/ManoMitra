// web/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginRequest, RegisterRequest } from '@/types/auth';
import { authAPI, studentAPI, volunteerAPI } from '@/lib/api';
import { ROLES } from '@/lib/constants';

interface AuthState {
  user: User | null;
  token: string | null; // <-- ADD THIS
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  activityInterval: NodeJS.Timeout | null;

  login: (user: User, token: string) => void; // <-- MODIFY THIS
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loginUser: (credentials: LoginRequest) => Promise<boolean>;
  registerUser: (data: RegisterRequest, role: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  startActivityTracking: () => void;
  stopActivityTracking: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null, // <-- ADD THIS
      isAuthenticated: false,
      isLoading: true,
      error: null,
      activityInterval: null,

      stopActivityTracking: () => {
        const { activityInterval } = get();
        if (activityInterval) {
          clearInterval(activityInterval);
          set({ activityInterval: null });
        }
      },

      startActivityTracking: () => {
        get().stopActivityTracking();

        const updateActivity = () => {
          const { user } = get();
          if (!user) {
            get().stopActivityTracking();
            return;
          }

          if (user.role === ROLES.STUDENT) {
            studentAPI.updateLastActive().catch(err => console.error("Silent activity update failed for student.", err?.response?.data?.message));
          } else if (user.role === ROLES.VOLUNTEER) {
            volunteerAPI.updateLastActive().catch(err => console.error("Silent activity update failed for volunteer.", err?.response?.data?.message));
          }
        };

        updateActivity();
        const intervalId = setInterval(updateActivity, 5 * 60 * 1000);
        set({ activityInterval: intervalId });
      },

      // ** UPDATED LOGOUT FUNCTION **
      logout: async () => {
        // 1. Immediately stop background tasks and clear client state
        get().stopActivityTracking();
        set({ 
          user: null, 
          isAuthenticated: false, 
          token: null, // <-- Clear token
          error: null,
          isLoading: false 
        });

        // 2. Clear the token cookie
        if (typeof document !== 'undefined') {
          document.cookie = `token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
        
        // 3. Inform the backend (this can fail silently if the server is down)
        try {
          await authAPI.logout();
        } catch (error) {
          console.error("Backend logout call failed, but client is logged out.", error);
        }
      },
      
      // ** UPDATED LOGIN FUNCTION **
      login: (user: User, token: string) => { // <-- MODIFY THIS
        set({ user, token, isAuthenticated: true, error: null, isLoading: false }); // <-- MODIFY THIS
        get().startActivityTracking();
      },

      loginUser: async (credentials: LoginRequest): Promise<boolean> => {
        try {
          set({ isLoading: true, error: null });
          const response = await authAPI.login(credentials);
          if (response.success && response.user && response.token) {
            if (typeof document !== 'undefined') {
              const sevenDays = 7 * 24 * 60 * 60;
              document.cookie = `token=${encodeURIComponent(response.token)}; path=/; max-age=${sevenDays}; SameSite=Lax; Secure`;
            }
            get().login(response.user, response.token); // <-- MODIFY THIS
            return true;
          } else {
            set({ error: (response as any).message || 'Login failed', isLoading: false });
            return false;
          }
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Login failed';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },
      
      registerUser: async (data: RegisterRequest, role: string): Promise<boolean> => {
        try {
          set({ isLoading: true, error: null });
          let response;
          switch (role) {
            case 'student': response = await authAPI.registerStudent(data); break;
            case 'counsellor': response = await authAPI.registerCounsellor(data); break;
            case 'volunteer': response = await authAPI.registerVolunteer(data); break;
            default: throw new Error('Invalid role');
          }
          if (response.success) {
            set({ isLoading: false, error: null });
            return true;
          } else {
            set({ error: (response as any).message || 'Registration failed', isLoading: false });
            return false;
          }
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || 'Registration failed';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      refreshUser: async () => {
        try {
          const { user } = get();
          if (!user && (typeof document !== 'undefined' && document.cookie.includes('token='))) {
            set({ isLoading: true, error: null });
            const response = await authAPI.getMe();
            // Assuming getMe now also returns the token if you want to refresh it
            const token = useAuthStore.getState().token; // Or get from response
            if (response.user && token) {
              get().login(response.user, token);
            }
          } else {
             set({ isLoading: false });
          }
        } catch (error: any) {
          await get().logout();
        }
      },

      setUser: (user: User | null) => set({ user, isAuthenticated: !!user, error: null }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error, isLoading: false }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'manomitra-auth',
      partialize: (state) => ({ 
        user: state.user,
        token: state.token, // <-- ADD THIS
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);