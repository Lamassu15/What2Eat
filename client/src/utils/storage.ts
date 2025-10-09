export const getToken = () => localStorage.getItem("jwt");
export const saveToken = (token: string) => localStorage.setItem("jwt", token);
export const clearToken = () => localStorage.removeItem("jwt");
