import React, { useState, useEffect } from "react";
import { AuthContext, type User } from "../context/AuhtContext";
import { getUserInfo, useLogin, useLogout } from "../api/auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ React Query mutations
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  // ✅ När appen laddas: kolla om användaren är inloggad (via cookies/session)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserInfo();
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ✅ Login med mutation
  const login = async (credentials: { email: string; password: string }) => {
    try {
      setLoading(true);
      await loginMutation.mutateAsync(credentials); // anropar backend
      const data = await getUserInfo(); // hämta användarinfo
      setUser(data);
    } catch (error) {
      console.error("❌ Login failed:", error);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout med mutation
  const logout = async () => {
    try {
      setLoading(true);
      await logoutMutation.mutateAsync(); // backend logout
      setUser(null);
    } catch (error) {
      console.error("❌ Logout failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        isLoggingIn: loginMutation.isPending,
        loginError: loginMutation.isError ? loginMutation.error : null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
