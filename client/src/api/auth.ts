import { useMutation } from "@tanstack/react-query";
import { httpClient } from "../services/httpClient";

type LoginRequest = { email: string; password: string };

type LoginResponse = { message: string };

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: (data) =>
      httpClient("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: () =>
      httpClient("/auth/logout", {
        method: "POST",
      }),
  });
};

export const getUserInfo = async () => {
  return await httpClient("/auth/me");
};
