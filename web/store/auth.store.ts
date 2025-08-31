// Enhanced authentication store with proper user management
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginRequest, RegisterRequest } from '@/types/auth';
import { authAPI } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Async actions
  loginUser: (credentials: LoginRequest) => Promise<boolean>;
  registerUser: (data: RegisterRequest, role: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true, // Start with loading true to check for existing session
      error: null,

      // Synchronous actions
      login: (user: User) => set({ 
        user, 
        isAuthenticated: true, 
        error: null,
        isLoading: false 
      }),

      logout: () => {
        if (typeof document !== 'undefined') {
          // Clear the token cookie by setting its expiration date to the past
          document.cookie = `token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null,
          isLoading: false 
        });
      },

      setUser: (user: User | null) => set({ 
        user, 
        isAuthenticated: !!user,
        error: null 
      }),

      setLoading: (isLoading: boolean) => set({ isLoading }),

      setError: (error: string | null) => set({ error, isLoading: false }),

      // Async actions
      loginUser: async (credentials: LoginRequest): Promise<boolean> => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authAPI.login(credentials);
          
          if (response.success && response?.user) {
            if (response.token && typeof document !== 'undefined') {
              const sevenDays = 7 * 24 * 60 * 60;
              document.cookie = `token=${encodeURIComponent(response.token)}; path=/; max-age=${sevenDays}; SameSite=Lax`;
            }
            set({ 
              user: response.user, 
              isAuthenticated: true, 
              error: null,
              isLoading: false 
            });
            return true;
          } else {
            set({ 
              error: (response as any).message || 'Login failed', 
              isLoading: false 
            });
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
            case 'student':
              response = await authAPI.registerStudent(data);
              break;
            case 'counsellor':
              response = await authAPI.registerCounsellor(data);
              break;
            case 'volunteer':
              response = await authAPI.registerVolunteer(data);
              break;
            default:
              throw new Error('Invalid role');
          }
          
          if (response.success) {
            set({ isLoading: false, error: null });
            return true;
          } else {
            set({ 
              error: (response as any).message || 'Registration failed', 
              isLoading: false 
            });
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
          // Only refresh if there's no user but a token might exist
          if (!user && (typeof document !== 'undefined' && document.cookie.includes('token='))) {
            set({ isLoading: true, error: null });
            const response = await authAPI.getMe();
            set({ user: response.user, isAuthenticated: true, isLoading: false });
          } else {
             set({ isLoading: false });
          }
        } catch (error: any) {
          get().logout(); // Logout if refresh fails
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'manomitra-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);