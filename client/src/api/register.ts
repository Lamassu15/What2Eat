import { httpClient } from "../services/httpClient";

type RegisterRequest = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  imgProfile?: File;
};

export const registerUser = async (data: RegisterRequest) => {
  const formData = new FormData();

  formData.append("Email", data.email);
  formData.append("Password", data.password);
  formData.append("ConfirmPassword", data.confirmPassword);
  formData.append("FirstName", data.firstName);
  formData.append("LastName", data.lastName);

  if (data.imgProfile) {
    formData.append("ImgProfile", data.imgProfile);
  }

  const res = await httpClient.post("/auth/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};
