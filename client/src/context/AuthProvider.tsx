import React, { useState, useEffect } from "react";
import { getToken, saveToken, clearToken } from "../utils/storage";
import { getUserInfo } from "../api/auth";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuhtContext";


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Initialize token from storage & fetch user data
  useEffect(() => {
    const storedToken = getToken();
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // ✅ Fetch user info if token changes
  const fetchUser = async (token: string) => {
    try {
      const userData = await getUserInfo(token);
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      // Only logout if token is invalid (401)
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Login: Save token & fetch user
  const login = (jwt: string) => {
    saveToken(jwt);
    setToken(jwt);
    fetchUser(jwt);
  };

  // ✅ Logout: Clear everything
  const logout = () => {
    clearToken();
    setToken(null);
    setUser(null);
  };

  // ✅ Check if token exists AND is not expired (if JWT)
  const isAuthenticated = () => {
    if (!token) return false;
    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      // If decoding fails, assume it's not a JWT and just check presence
      return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
