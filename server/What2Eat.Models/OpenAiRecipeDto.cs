using What2Eat.Models;

namespace What2Eat.Dtos;

public class GenerateRecipeRequest
{
    public string Ingredients { get; set; } = "";
}

public class OpenAiRecipeDto
{
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string PreparationTime { get; set; } = "";
    public string CookingTime { get; set; } = "";
    public int Servings { get; set; } = 0;
    public string Category { get; set; } = "";
    
    public List<IngredientDto> Ingredients { get; set; } = new();
    public List<InstructionDto> Instructions { get; set; } = new();

    public Recipe ToEntity()
    {
        return new Recipe
        {
            Title = Title,
            Description = Description,
            PreparationTime = PreparationTime,
            CookingTime = CookingTime,
            Servings = Servings,
            Category = Category,
            Ingredients = Ingredients.Select(i => new Ingredient
            {
                Name = i.Name,
                Quantity = i.Quantity,
                Unit = i.Unit
            }).ToList(),
            Instructions = Instructions.Select(i => new Instruction
            {
                StepNumber = i.StepNumber,
                Description = i.Description
            }).ToList(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            // ApplicationUserId måste sättas separat efter skapandet
            ApplicationUserId = "", // Placeholder, måste sättas av anroparen
            ApplicationUser = null! // Placeholder, måste sättas av anroparen
        };
    }
}

public class IngredientDto
{
    public string Name { get; set; } = "";
    public string Quantity { get; set; } = "";
    public string Unit { get; set; } = "";
}

public class InstructionDto
{
    public int StepNumber { get; set; }
    public string Description { get; set; } = "";
}
