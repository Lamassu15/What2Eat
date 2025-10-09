import { useMutation } from "@tanstack/react-query";
import { httpClient } from "../services/httpClient";
import { saveToken } from "../utils/storage";

type LoginRequest = { email: string; password: string };
type LoginResponse = { token: string };

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: (data) =>
      httpClient("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      saveToken(data.token);
    },
  });
};
