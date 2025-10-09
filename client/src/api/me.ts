import { httpClient } from "../services/httpClient";

export const getUserInfo = async () => {
  return httpClient("/auth/me", { method: "GET" });
};
