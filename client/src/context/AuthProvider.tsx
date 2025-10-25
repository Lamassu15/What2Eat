import React, { useState, useEffect } from "react";
import { AuthContext, type User } from "../context/AuhtContext";
import { getUserInfo, useLogin, useLogout } from "../api/auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { mutateAsync: loginRequest } = useLogin();
  const { mutateAsync: logoutRequest } = useLogout();

  // ✅ När appen laddas: kolla om användaren är inloggad via cookies
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const data = await getUserInfo();
        setUser(data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Could not retrieve user:", error.message);
        } else {
          console.error("An unknown error occurred:", error);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ✅ Login
  const login = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    try {
      await loginRequest(credentials);
      const data = await getUserInfo();
      setUser(data);
    } catch (error) {
      console.error("Login failed:", error);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout
  const logout = async () => {
    setLoading(true);
    try {
      await logoutRequest();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
