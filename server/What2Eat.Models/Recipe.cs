using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace What2Eat.Models
{
    public class Recipe
    {
        public int Id { get; set; }
        [Required]
        public required string Title { get; set; }
        [Required]
        public required string Description { get; set; }
        [Required]
        public required string PreparationTime { get; set; }
        [Required]
        public required string CookingTime { get; set; }
        [Required]
        public required int Servings { get; set; }
        [Required]
        public required string Category { get; set; } // e.g., "Vegetarian", "Dessert", etc.
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Främmande nyckel för att koppla receptet till en användare
        public required string ApplicationUserId { get; set; }
        public required ApplicationUser ApplicationUser { get; set; } // Navigeringsegenskap

        // Navigeringsegenskaper för relaterade listor
        public virtual ICollection<Ingredient> Ingredients { get; set; } = new List<Ingredient>();
        public virtual ICollection<Instruction> Instructions { get; set; } = new List<Instruction>();

        
    }
}
