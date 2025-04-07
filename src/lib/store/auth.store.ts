import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  first_name: string;
  last_name?: string;
  age?: number;
  email: string;
  courses: string[]; 
  subscribed: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  setSubscribed: (subscribed: boolean) => void;
  refreshUser: (user: User) => void;
  refreshAttempted: boolean;
  setRefreshAttempted: (attempted: boolean) => void;
}

// Create the Zustand store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      refreshAttempted: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false, refreshAttempted: false }),
      // Helper to update subscription status after API call
      setSubscribed: (subscribed) => set((state) => ({
          user: state.user ? { ...state.user, subscribed } : null
      })),
      // New function to update user data from backend
      refreshUser: (user) => set({ user, refreshAttempted: true }),
      // Function to track if refresh has been attempted
      setRefreshAttempted: (attempted) => set({ refreshAttempted: attempted }),
    }),
    {
      name: 'auth-storage', // Unique name for local storage key
      storage: createJSONStorage(() => localStorage), // Use local storage
    }
  )
); 