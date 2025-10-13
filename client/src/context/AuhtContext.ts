import { createContext } from "react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  imgProfile?: string;
  roles: string[];
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  isAuthenticated: () => false,
});