import { httpClient } from "../services/httpClient";

// Hämta alla recept
export const getRecipes = async () => {
  const res = await httpClient.get("/recipes");
  return res.data;
};

// Ta bort ett recept
export const deleteRecipeApi = async (id: number | string): Promise<void> => {
  await httpClient.delete(`/recipes/${id}`);
};

// Typ för generering av recept
type GenerateRecipeRequest = {
  ingredients: string;
};

// Skapa/generera nytt recept
export const generateRecipeApi = async (data: GenerateRecipeRequest) => {
  const res = await httpClient.post("/recipes/generate", data);
  return res.data;
};

// Hämta recept baserat på ID
export const getRecipeById = async (id: number | string) => {
  const res = await httpClient.get(`/recipes/${id}`);
  return res.data;
};
