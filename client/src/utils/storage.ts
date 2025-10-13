// src/utils/token.ts
let inMemoryToken: string | null = null;

export const getToken = () => inMemoryToken;

export const saveToken = (token: string) => {
  inMemoryToken = token;
};

export const clearToken = () => {
  inMemoryToken = null;
};
