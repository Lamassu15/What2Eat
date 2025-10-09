import { httpClient } from "../services/httpClient";

export const getRecipes = async () => {
  return httpClient("/recipes", { method: "GET" });
};

export const deleteRecipeApi = async (id: number | string): Promise<void> => {
  return httpClient(`/recipes/${id}`, { method: "DELETE" });
};

type GenerateRecipeRequest = {
  ingredients: string;
};

export const generateRecipeApi = async (data: GenerateRecipeRequest) => {
  return httpClient("/recipes/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getRecipeById = async (id: number | string) => {
  return httpClient(`/recipes/${id}`, { method: "GET" });
};

// export const updateRecipe = async (id: string, data: any, token: string) => {
//   return httpClient(`/recipes/${id}`, {
//     method: "PUT",
//     body: JSON.stringify(data),
//   }, token);
// };
