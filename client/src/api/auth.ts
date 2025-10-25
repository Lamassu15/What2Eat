import { useMutation } from "@tanstack/react-query";
import { httpClient } from "../services/httpClient";

type LoginRequest = { email: string; password: string };
type LoginResponse = { message: string };

// 🔐 LOGIN
export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (data) => {
      const res = await httpClient.post<LoginResponse>("/auth/login", data);
      return res.data;
    },
  });
};

// 🚪 LOGOUT
export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await httpClient.post("/auth/logout");
      return res.data;
    },
  });
};

// 👤 GET USER INFO
export const getUserInfo = async () => {
  const res = await httpClient.get("/auth/me");
  return res.data;
};

// ♻️ REFRESH TOKEN
export const refreshToken = async () => {
  const res = await httpClient.post("/auth/refresh-token");
  return res.data;
};
