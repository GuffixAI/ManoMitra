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
      isLoading: false,
      error: null,

      // Synchronous actions
      login: (user: User) => set({ 
        user, 
        isAuthenticated: true, 
        error: null,
        isLoading: false 
      }),

      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        error: null,
        isLoading: false 
      }),

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

          console.log(response)
          
          if (response.success && response?.user) {
            set({ 
              user: response.user, 
              isAuthenticated: true, 
              error: null,
              isLoading: false 
            });
            return true;
          } else {
            set({ 
              error: response.message || 'Login failed', 
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
          
          if (response.success && response.data.user) {
            set({ 
              user: response.data.user, 
              isAuthenticated: true, 
              error: null,
              isLoading: false 
            });
            return true;
          } else {
            set({ 
              error: response.message || 'Registration failed', 
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
          set({ isLoading: true, error: null });
          
          const response = await authAPI.getMe();
          
          if (response.user) {
            set({ 
              user: response.user, 
              isAuthenticated: true, 
              error: null,
              isLoading: false 
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              error: null,
              isLoading: false 
            });
          }
        } catch (error: any) {
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null,
            isLoading: false 
          });
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

// Selectors for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

// Role-based selectors
export const useUserRole = () => useAuthStore((state) => state.user?.role);
export const useIsStudent = () => useAuthStore((state) => state.user?.role === 'student');
export const useIsCounsellor = () => useAuthStore((state) => state.user?.role === 'counsellor');
export const useIsVolunteer = () => useAuthStore((state) => state.user?.role === 'volunteer');
export const useIsAdmin = () => useAuthStore((state) => state.user?.role === 'admin');

// Permission-based selectors
export const useHasPermission = (permission: string) => {
  const user = useAuthStore((state) => state.user);
  if (user?.role === 'admin') {
    return (user as any).permissions?.includes(permission) || false;
  }
  return false;
};

// User info selectors
export const useUserName = () => useAuthStore((state) => state.user?.name);
export const useUserEmail = () => useAuthStore((state) => state.user?.email);
export const useUserId = () => useAuthStore((state) => state.user?._id);