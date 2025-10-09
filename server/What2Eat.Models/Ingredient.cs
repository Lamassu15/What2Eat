namespace What2Eat.Models
{
    public class Ingredient
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Quantity { get; set; } // e.g., "2 cups", "1 tablespoon"
        public string? Unit { get; set; } // e.g., "grams", "liters", "pieces"

        public int RecipeId { get; set; }
        public Recipe? Recipe { get; set; } // Navigation property to the related recipe
    }
}