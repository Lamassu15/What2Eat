using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace What2Eat.Models
{
    // DTO för Ingrediens (för API input/output)
    public class IngredientDto
    {
        public int Id { get; set; } // Inkludera Id för uppdateringar/läsning
        [Required(ErrorMessage = "Namn för ingrediens är obligatoriskt.")]
        public required string Name { get; set; }
        public required string Quantity { get; set; }
        public string? Unit { get; set; } // Ny egenskap: enhet
    }

    // DTO för Instruktion (för API input/output)
    public class InstructionDto
    {
        public int Id { get; set; } // Inkludera Id för uppdateringar/läsning
        [Required(ErrorMessage = "Stegnummer är obligatoriskt.")]
        public int StepNumber { get; set; }
        [Required(ErrorMessage = "Beskrivning för instruktion är obligatorisk.")]
        public required string Description { get; set; }
    }

    // DTO för att läsa ett enskilt recept eller lista recept
    public class RecipeDto
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string Description { get; set; }
        public required string PreparationTime { get; set; } 
        public required string CookingTime { get; set; } 
        public required int Servings { get; set; }
        public required string Category { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public required string AuthorUserName { get; set; } // För att visa författarens användarnamn
        public required string AuthorId { get; set; } // För att visa författarens ID

        public List<IngredientDto> Ingredients { get; set; } = new List<IngredientDto>();
        public List<InstructionDto> Instructions { get; set; } = new List<InstructionDto>();
    }

    // DTO för att skapa ett nytt recept
    public class CreateRecipeDto
    {
        [Required(ErrorMessage = "Titel är obligatorisk.")]
        [StringLength(200, ErrorMessage = "Titel får inte vara längre än 200 tecken.")]
        public required string Title { get; set; }

        [StringLength(1000, ErrorMessage = "Beskrivning får inte vara längre än 1000 tecken.")]
        public required string Description { get; set; }

        [Required(ErrorMessage = "Förberedelsetid är obligatorisk.")]
        [RegularExpression(@"^([0-9]{2}):([0-5][0-9]):([0-5][0-9])$", ErrorMessage = "Förberedelsetid måste vara i formatet HH:mm:ss.")]
        public required string PreparationTime { get; set; } // Input som string "HH:mm:ss"

        [Required(ErrorMessage = "Tillagningstid är obligatorisk.")]
        [RegularExpression(@"^([0-9]{2}):([0-5][0-9]):([0-5][0-9])$", ErrorMessage = "Tillagningstid måste vara i formatet HH:mm:ss.")]
        public required string CookingTime { get; set; }   // Input som string "HH:mm:ss"

        [Range(1, 100, ErrorMessage = "Antal portioner måste vara mellan 1 och 100.")]
        public int Servings { get; set; }

        [Required(ErrorMessage = "Kategori är obligatorisk.")]
        public required string Category { get; set; }

        public List<CreateIngredientDto> Ingredients { get; set; } = new List<CreateIngredientDto>();
        public List<CreateInstructionDto> Instructions { get; set; } = new List<CreateInstructionDto>();
    }

    // DTOs för att skapa kapslade ingredienser/instruktioner
    public class CreateIngredientDto
    {
        [Required]
        public required string Name { get; set; }
        public required string Quantity { get; set; }
        public string? Unit { get; set; } // Ny egenskap: enhet
    }

    public class CreateInstructionDto
    {
        [Required]
        public int StepNumber { get; set; }
        [Required]
        public required string Description { get; set; }
    }


    // DTO för att uppdatera ett befintligt recept
    public class UpdateRecipeDto
    {
        [StringLength(200, ErrorMessage = "Titel får inte vara längre än 200 tecken.")]
        public string? Title { get; set; }

        [StringLength(1000, ErrorMessage = "Beskrivning får inte vara längre än 1000 tecken.")]
        public string? Description { get; set; }

        [RegularExpression(@"^([0-9]{2}):([0-5][0-9]):([0-5][0-9])$", ErrorMessage = "Förberedelsetid måste vara i formatet HH:mm:ss.")]
        public string? PreparationTime { get; set; }

        [RegularExpression(@"^([0-9]{2}):([0-5][0-9]):([0-5][0-9])$", ErrorMessage = "Tillagningstid måste vara i formatet HH:mm:ss.")]
        public string? CookingTime { get; set; }

        [Range(1, 100, ErrorMessage = "Antal portioner måste vara mellan 1 och 100.")]
        public int? Servings { get; set; } // Nullbar för valfri uppdatering

        public string? Category { get; set; }

        // För uppdateringar kan vi behöva hantera befintliga ingredienser/instruktioner
        // eller ersätta dem helt. För enkelhetens skull, anta att de skickas som fullständiga listor.
        public List<UpdateIngredientDto>? Ingredients { get; set; }
        public List<UpdateInstructionDto>? Instructions { get; set; }
    }

    // DTOs för att uppdatera kapslade ingredienser/instruktioner
    public class UpdateIngredientDto
    {
        public int Id { get; set; } // Id är avgörande för att uppdatera befintliga
        [Required]
        public required string Name { get; set; }
        public required string Quantity { get; set; }
        public string? Unit { get; set; } // Ny egenskap: enhet
    }

    public class UpdateInstructionDto
    {
        public int Id { get; set; } // Id är avgörande för att uppdatera befintliga
        [Required]
        public int StepNumber { get; set; }
        [Required]
        public required string Description { get; set; }
    }
}
