namespace What2Eat.Models
{
    public class Instruction
    {
        public int Id { get; set; }
        public int StepNumber { get; set; } // Ordningen på steget
        public required string Description { get; set; }

        public int RecipeId { get; set; }
        public  Recipe? Recipe { get; set; } // Navigation property to the related recipe
    }
}