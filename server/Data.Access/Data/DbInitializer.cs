using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using What2Eat.Models;

namespace What2Eat.Data.Data
{
    public static class DbInitializer
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            // Hämta nödvändiga tjänster från serviceProvider
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var context = serviceProvider.GetRequiredService<ApplicationDbContext>(); // Här hämtas context

            // Säkerställ att databasen är migrerad
            await context.Database.MigrateAsync();

            // 1. Skapa roller om de inte redan finns
            string[] roleNames = { "Admin", "User" };
            foreach (var roleName in roleNames)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }

            // 2. Skapa en standard admin-användare om den inte redan finns
            var adminEmail = "admin@gmail.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FirstName = "Admin",
                    LastName = "User",
                    EmailConfirmed = true // Sätt till true för att undvika bekräftelseflöde
                };

                var result = await userManager.CreateAsync(adminUser, "Admin!321A"); // Ändra till ett säkert lösenord i produktion!
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                    Console.WriteLine($"Admin-användare '{adminEmail}' skapad och tilldelad rollen 'Admin'.");
                }
                else
                {
                    Console.WriteLine($"Kunde inte skapa admin-användare: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }
            else
            {
                // Säkerställ att admin har rollen Admin
                if (!await userManager.IsInRoleAsync(adminUser, "Admin"))
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
                Console.WriteLine($"Admin-användare '{adminEmail}' existerar redan.");
            }

            // 3. Skapa lite exempelrecept om databasen är tom
            if (!context.Recipes.Any())
            {
                var recipe = new Recipe
                {
                    Title = "Chokladbollar",
                    Description = "Klassiska chokladbollar, enkla att göra och goda att äta.",
                    PreparationTime = "15 minuter",
                    CookingTime = "20 minuter",
                    Servings = 12,
                    Category = "Fika",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    ApplicationUserId = adminUser.Id,
                    ApplicationUser = adminUser
                };
                recipe.Ingredients.Add(new Ingredient { Name = "Havregryn", Quantity = "5", Unit = "dl" });
                recipe.Ingredients.Add(new Ingredient { Name = "Socker", Quantity = "1.5", Unit = "dl" });
                recipe.Ingredients.Add(new Ingredient { Name = "Kakao", Quantity = "3", Unit = "msk" });
                recipe.Ingredients.Add(new Ingredient { Name = "Smör", Quantity = "100", Unit = "g" });
                recipe.Ingredients.Add(new Ingredient { Name = "Kaffe", Quantity = "2", Unit = "msk" });
                recipe.Instructions.Add(new Instruction { StepNumber = 1, Description = "Blanda alla torra ingredienser." });
                recipe.Instructions.Add(new Instruction { StepNumber = 2, Description = "Tillsätt smör och kaffe, rulla till bollar." });
                recipe.Instructions.Add(new Instruction { StepNumber = 3, Description = "Rulla bollarna i kokos eller pärlsocker." });

                context.Recipes.Add(recipe);
                await context.SaveChangesAsync();
                Console.WriteLine("Exempelrecept tillagt.");

                var recipe2 = new Recipe
                {
                    Title = "Pasta Carbonara",
                    Description = "En klassisk, italiensk pasta carbonara.",
                    PreparationTime = "15 minuter",
                    CookingTime = "20 minuter",
                    Servings = 4,
                    Category = "Huvudrätt",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    ApplicationUserId = adminUser.Id,
                    ApplicationUser = adminUser
                };
                recipe2.Ingredients.Add(new Ingredient { Name = "Pasta", Quantity = "400", Unit = "g" });
                recipe2.Ingredients.Add(new Ingredient { Name = "Bacon", Quantity = "150", Unit = "g" });
                recipe2.Ingredients.Add(new Ingredient { Name = "Ägg", Quantity = "3", Unit = "st" });
                recipe2.Ingredients.Add(new Ingredient { Name = "Parmesanost", Quantity = "100", Unit = "g" });
                recipe2.Instructions.Add(new Instruction { StepNumber = 1, Description = "Koka pastan enligt anvisningarna." });
                recipe2.Instructions.Add(new Instruction { StepNumber = 2, Description = "Stek bacon tills det är krispigt." });
                recipe2.Instructions.Add(new Instruction { StepNumber = 3, Description = "Vispa ihop ägg och riven parmesan." });
                recipe2.Instructions.Add(new Instruction { StepNumber = 4, Description = "Blanda pastan med bacon och äggblandningen." });

                context.Recipes.Add(recipe2);
                await context.SaveChangesAsync();
                Console.WriteLine("Ytterligare exempelrecept tillagt.");
            }
            else
            {
                Console.WriteLine("Databasen innehåller redan recept. Ingen seeding av recept utfördes.");
            }
        }
    }
}
