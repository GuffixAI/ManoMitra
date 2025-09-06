// web/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginRequest, RegisterRequest } from '@/types/auth';
import { authAPI, studentAPI, volunteerAPI } from '@/lib/api';
import { ROLES } from '@/lib/constants';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  activityInterval: NodeJS.Timeout | null;

  login: (user: User) => void;
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
        get().stopActivityTracking(); // Clear any existing intervals

        const updateActivity = () => {
          const { user } = get();
          if (!user) {
            get().stopActivityTracking(); // Stop if user is no longer present
            return;
          }

          if (user.role === ROLES.STUDENT) {
            studentAPI.updateLastActive().catch(err => console.error("Silent activity update failed for student.", err?.response?.data?.message));
          } else if (user.role === ROLES.VOLUNTEER) {
            volunteerAPI.updateLastActive().catch(err => console.error("Silent activity update failed for volunteer.", err?.response?.data?.message));
          }
        };

        updateActivity(); // Call immediately
        const intervalId = setInterval(updateActivity, 5 * 60 * 1000);
        set({ activityInterval: intervalId });
      },

      logout: async () => {
        get().stopActivityTracking();
        try {
          await authAPI.logout();
        } catch (error) {
          console.error("Backend logout failed, proceeding with client-side logout.", error);
        } finally {
          if (typeof document !== 'undefined') {
            document.cookie = `token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          }
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null,
            isLoading: false 
          });
        }
      },
      
      login: (user: User) => {
        set({ user, isAuthenticated: true, error: null, isLoading: false });
        get().startActivityTracking();
      },

      loginUser: async (credentials: LoginRequest): Promise<boolean> => {
        try {
          set({ isLoading: true, error: null });
          const response = await authAPI.login(credentials);
          if (response.success && response?.user) {
            if (response.token && typeof document !== 'undefined') {
              const sevenDays = 7 * 24 * 60 * 60;
              document.cookie = `token=${encodeURIComponent(response.token)}; path=/; max-age=${sevenDays}; SameSite=Lax; Secure`;
            }
            get().login(response.user);
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
            get().login(response.user);
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
        isAuthenticated: state.isAuthenticated 
      }),
      // REMOVED the incorrect 'onRehydrate' property from here.
    }
  )
);

// This is the new, correct way to handle logic after rehydration.
useAuthStore.persist.onFinishHydration((state) => {
  if (state.isAuthenticated && state.user) {
    console.log("Rehydrated session, starting activity tracking.");
    state.startActivityTracking();
  }
});