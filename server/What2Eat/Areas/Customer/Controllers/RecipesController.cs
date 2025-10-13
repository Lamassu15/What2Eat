using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Mapster;
using What2Eat.Models;
using What2Eat.Data.Data;
using System.Text.Json;
using What2Eat.Services;
using What2Eat.Dtos;
using Microsoft.AspNetCore.RateLimiting;
using What2Eat.service.IService;


namespace  What2Eat.Areas.Customer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "User,Admin")]  
    public class RecipesController : BaseController
    {
        private readonly ApplicationDbContext _context;
        private readonly IAiService _aiService;
        private readonly UserManager<ApplicationUser> _userManager;
        // Mapster använder extension methods, så IMapper behövs inte injiceras direkt om du använder Adapt<T>
        // private readonly IMapper _mapper; // Inte längre nödvändigt med Mapster.Adapt<T>

        public RecipesController(IAiService aiService, ApplicationDbContext context, UserManager<ApplicationUser> userManager) // IMapper borttagen
        {
            _context = context;
            _userManager = userManager;
            _aiService = aiService;
            // _mapper = mapper; // Inte längre nödvändigt
        }

        // GET: api/Recipes
        // Hämta alla recept
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RecipeDto>>> GetRecipes()
        {
            var recipes = await _context.Recipes
                .Where(r => r.ApplicationUserId == CurrentUserId) // Endast offentliga recept
                .Include(r => r.ApplicationUser) // Inkludera användarinfo
                .Include(r => r.Ingredients)     // Inkludera ingredienser
                .Include(r => r.Instructions)    // Inkludera instruktioner
                .OrderByDescending(r => r.CreatedAt) // 👈 sortera här
                .ToListAsync();

            // Använd Mapster för att mappa till DTO
            var recipeDtos = recipes.Adapt<List<RecipeDto>>();

            return Ok(recipeDtos);
        }

        // GET: api/Recipes/5
        // Hämta ett specifikt recept med ID
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<RecipeDto>> GetRecipe(int id)
        {
            var recipe = await _context.Recipes
                .Include(r => r.ApplicationUser) // Inkludera användarinfo
                .Include(r => r.Ingredients)     // Inkludera ingredienser
                .Include(r => r.Instructions)    // Inkludera instruktioner
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recipe == null)
            {
                return NotFound("Receptet hittades inte.");
            }
            // Använd Mapster för att mappa till DTO
            var recipeDto = recipe.Adapt<RecipeDto>();

            return Ok(recipeDto);
        }

        // // POST: api/Recipes
        // // Skapa ett nytt recept
        // [HttpPost]
        // public async Task<ActionResult<RecipeDto>> CreateRecipe([FromBody] CreateRecipeDto createRecipeDto)
        // {
        //     if (!ModelState.IsValid)
        //     {
        //         return BadRequest(ModelState);
        //     }

        //     var recipe= createRecipeDto.Adapt<Recipe>();
        //     recipe.ApplicationUserId = CurrentUserId;
        //     recipe.CreatedAt = DateTime.UtcNow;
        //     recipe.UpdatedAt = DateTime.UtcNow;


        //     _context.Recipes.Add(recipe);
        //     await _context.SaveChangesAsync();

        //     var createdRecipe = await _context.Recipes
        //         .Include(r => r.ApplicationUser)
        //         .Include(r => r.Ingredients)
        //         .Include(r => r.Instructions)
        //         .FirstOrDefaultAsync(r => r.Id == recipe.Id);
                
        //     // Mappa tillbaka till RecipeDto för svaret
        //     var recipeDto = createdRecipe.Adapt<RecipeDto>();

        //     return CreatedAtAction(nameof(GetRecipe), new { id = recipe.Id }, recipeDto);
        // }

        // PUT: api/Recipes/5
        // Uppdatera ett befintligt recept
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRecipe(int id, [FromBody] UpdateRecipeDto updateRecipeDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var recipe = await _context.Recipes
                .Include(r => r.Ingredients)
                .Include(r => r.Instructions)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recipe == null)
            {
                return NotFound("Receptet hittades inte.");
            }

            // Kontrollera om användaren är ägare till receptet eller en admin
            if (!HasAccessToResource(recipe.ApplicationUserId))
            {
                return Forbid("Du har inte behörighet att uppdatera detta recept.");
            }

            // Använd Mapster för att uppdatera receptets huvudfält
            // Mapster uppdaterar bara de fält som finns i DTO:n och inte är null
            updateRecipeDto.Adapt(recipe);
            recipe.UpdatedAt = DateTime.UtcNow;

            // Hantera uppdatering av ingredienser och instruktioner manuellt
            // Mapster hanterar inte komplexa samlingar som denna på ett "magiskt" sätt för PUT.
            // Detta kräver fortfarande manuell logik för att lägga till/ta bort/uppdatera.
            if (updateRecipeDto.Ingredients != null)
            {
                // Ta bort befintliga ingredienser som inte finns i uppdateringen
                var existingIngredientIds = recipe.Ingredients.Select(i => i.Id).ToList();
                var updatedIngredientIds = updateRecipeDto.Ingredients.Where(i => i.Id != 0).Select(i => i.Id).ToList();
                var ingredientsToRemove = recipe.Ingredients.Where(i => !updatedIngredientIds.Contains(i.Id)).ToList();
                _context.Ingredients.RemoveRange(ingredientsToRemove);

                foreach (var ingredientDto in updateRecipeDto.Ingredients)
                {
                    if (ingredientDto.Id == 0) // Ny ingrediens
                    {
                        recipe.Ingredients.Add(ingredientDto.Adapt<Ingredient>());
                    }
                    else // Uppdatera befintlig ingrediens
                    {
                        var existingIngredient = recipe.Ingredients.FirstOrDefault(i => i.Id == ingredientDto.Id);
                        if (existingIngredient != null)
                        {
                            ingredientDto.Adapt(existingIngredient);
                        }
                    }
                }
            }

            if (updateRecipeDto.Instructions != null)
            {
                // Ta bort befintliga instruktioner som inte finns i uppdateringen
                var existingInstructionIds = recipe.Instructions.Select(ins => ins.Id).ToList();
                var updatedInstructionIds = updateRecipeDto.Instructions.Where(ins => ins.Id != 0).Select(ins => ins.Id).ToList();
                var instructionsToRemove = recipe.Instructions.Where(ins => !updatedInstructionIds.Contains(ins.Id)).ToList();
                _context.Instructions.RemoveRange(instructionsToRemove);

                foreach (var instructionDto in updateRecipeDto.Instructions)
                {
                    if (instructionDto.Id == 0) // Ny instruktion
                    {
                        recipe.Instructions.Add(instructionDto.Adapt<Instruction>());
                    }
                    else // Uppdatera befintlig instruktion
                    {
                        var existingInstruction = recipe.Instructions.FirstOrDefault(ins => ins.Id == instructionDto.Id);
                        if (existingInstruction != null)
                        {
                            instructionDto.Adapt(existingInstruction);
                        }
                    }
                }
            }


            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Recipes.Any(e => e.Id == id))
                {
                    return NotFound("Receptet hittades inte.");
                }
                else
                {
                    throw;
                }
            }

            return NoContent(); // 204 No Content för lyckad uppdatering
        }

        // DELETE: api/Recipes/5
        // Ta bort ett recept
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecipe(int id)
        {
            var recipe = await _context.Recipes.FindAsync(id);
            if (recipe == null)
            {
                return NotFound("Receptet hittades inte.");
            }

            // Kontrollera om användaren är ägare till receptet eller en admin
            if (!HasAccessToResource(recipe.ApplicationUserId))
            {
                return Forbid("Du har inte behörighet att ta bort detta recept.");
            }

            _context.Recipes.Remove(recipe);
            await _context.SaveChangesAsync();

            return NoContent(); // 204 No Content för lyckad borttagning
        }

        // POST: api/Recipes/generate
        // Generera ett recept baserat på ingredienser med hjälp av AI
        [HttpPost("generate")]
        [EnableRateLimiting("RecipePolicy")]
        public async Task<IActionResult> GenerateRecipe([FromBody] GenerateRecipeRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = CurrentUserId;

            if (userId == null)
            {
                return Unauthorized("Användaren är inte autentiserad. Logga in för att generera recept.");
            }

            if (string.IsNullOrWhiteSpace(request.Ingredients))
                return BadRequest("Ingredients are required.");

            try
            {

                var aiDto = await _aiService.GenerateRecipeAsync(request.Ingredients);

                if (aiDto == null)
                {
                    return StatusCode(500, "AI service returned no data.");
                }

                var recipe = aiDto.ToEntity();
                recipe.ApplicationUserId = userId;
                recipe.CreatedAt = DateTime.UtcNow;
                recipe.UpdatedAt = DateTime.UtcNow;


                _context.Recipes.Add(recipe);
                await _context.SaveChangesAsync();

                var recipeDto = recipe.Adapt<RecipeDto>();
                return Ok(recipeDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to generate recipe: {ex.Message}");
            }
        }
    }
}
