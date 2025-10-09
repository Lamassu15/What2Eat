using Mapster;
using System;
using What2Eat.Models;

namespace What2Eat.Models
{
    public static class MapsterConfig
    {
        public static void RegisterMappings()
        {
            // Mappning från Recipe till RecipeDto
            TypeAdapterConfig<Recipe, RecipeDto>.NewConfig()
                .Map(dest => dest.PreparationTime, src => src.PreparationTime)
                .Map(dest => dest.CookingTime, src => src.CookingTime)
                .Map(dest => dest.AuthorUserName, src => src.ApplicationUser.UserName)
                .Map(dest => dest.AuthorId, src => src.ApplicationUserId)
                .Map(dest => dest.Ingredients, src => src.Ingredients)
                .Map(dest => dest.Instructions, src => src.Instructions);

            // Mappning från CreateRecipeDto till Recipe
            TypeAdapterConfig<CreateRecipeDto, Recipe>.NewConfig()
                .Map(dest => dest.PreparationTime, src => src.PreparationTime)
                .Map(dest => dest.CookingTime, src => src.CookingTime)
                .Map(dest => dest.CreatedAt, src => DateTime.UtcNow)
                .Map(dest => dest.UpdatedAt, src => DateTime.UtcNow)
                .Map(dest => dest.Ingredients, src => src.Ingredients)
                .Map(dest => dest.Instructions, src => src.Instructions)
                .Ignore(dest => dest.ApplicationUser)
                .Ignore(dest => dest.ApplicationUserId);

            // Mappning från UpdateRecipeDto till Recipe
            TypeAdapterConfig<UpdateRecipeDto, Recipe>.NewConfig()
                .Map(dest => dest.PreparationTime, src => src.PreparationTime)
                .Map(dest => dest.CookingTime, src => src.CookingTime)
                .Map(dest => dest.UpdatedAt, src => DateTime.UtcNow)
                .Ignore(dest => dest.Ingredients)
                .Ignore(dest => dest.Instructions)
                .Ignore(dest => dest.ApplicationUser)
                .Ignore(dest => dest.ApplicationUserId)
                .PreserveReference(true);

            // Ingredient
            TypeAdapterConfig<Ingredient, IngredientDto>.NewConfig().TwoWays();
            TypeAdapterConfig<CreateIngredientDto, Ingredient>.NewConfig();
            TypeAdapterConfig<UpdateIngredientDto, Ingredient>.NewConfig();

            // Instruction
            TypeAdapterConfig<Instruction, InstructionDto>.NewConfig().TwoWays();
            TypeAdapterConfig<CreateInstructionDto, Instruction>.NewConfig();
            TypeAdapterConfig<UpdateInstructionDto, Instruction>.NewConfig();
        }
    }
}
