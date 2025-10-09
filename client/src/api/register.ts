import { httpClient } from "../services/httpClient";

type RegisterRequest = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  imgProfile?: string;
};

export const registerUser = (data: RegisterRequest) => {
  return httpClient("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
