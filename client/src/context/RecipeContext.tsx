import { useAuth } from "../hooks/useAuth";
import {
  getRecipes,
  deleteRecipeApi,
  generateRecipeApi,
  getRecipeById,
} from "../api/recipe";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export interface Ingredient {
  id: number;
  name: string;
  quantity: string;
  unit?: string | null;
}

export interface Instruction {
  id: number;
  stepNumber: number;
  description: string;
}

export interface Recipe {
  id: number;
  title: string;
  description?: string;
  preparationTime?: string | null;
  cookingTime?: string | null;
  servings?: number;
  category?: string | null;
  createdAt?: string;
  updatedAt?: string;
  ingredients?: Ingredient[];
  instructions?: Instruction[];
}

export const useRecipes = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Query: fetch recipes for current user
  const queryKey = ["recipes"] as const;

  const {
    data: recipes = [],
    isLoading,
    isError,
    error,
  } = useQuery<Recipe[], Error>({
    queryKey,
    queryFn: async () => {
      const data = await getRecipes();
      return data as Recipe[];
    },
    enabled: isAuthenticated(),
    staleTime: 1000 * 60,
  });

  // Mutation: generate a recipe via AI and save to server
  const generateMutation = useMutation<Recipe, Error, { ingredients: string }>({
    mutationFn: (payload: { ingredients: string }) =>
      generateRecipeApi(payload) as Promise<Recipe>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Mutation: delete recipe
  const deleteMutation = useMutation<void, Error, number | string>({
    mutationFn: (id: number | string) => deleteRecipeApi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    recipes: recipes as Recipe[],
    isLoading,
    isError,
    error: error ?? null,
    generate: generateMutation,
    remove: deleteMutation,
  };
};

// Get recipe by ID
export const useRecipeById = (id: number | string) => {
  return useQuery<Recipe, Error>({
    queryKey: ["recipe", id],
    queryFn: () => getRecipeById(id!),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
};
