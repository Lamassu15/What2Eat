import { createContext } from "react";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  imgProfile?: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  loginError: Error | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async (): Promise<void> => Promise.resolve(),
  logout: async (): Promise<void> => Promise.resolve(),
  isAuthenticated: false,
  isLoggingIn: false,
  loginError: null,
});
