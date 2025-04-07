import type { User, SignupInput, SigninInput } from '@/lib/schemas';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: SigninInput) => Promise<void>;
  signup: (details: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  subscribe: () => Promise<void>;
} 