using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using What2Eat.Models;

namespace What2Eat.Data.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Recipe> Recipes { get; set; }
        public DbSet<Ingredient> Ingredients { get; set; }
        public DbSet<Instruction> Instructions { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Konfigurera relationen mellan ApplicationUser och Recipe
            builder.Entity<Recipe>()
                .HasOne(r => r.ApplicationUser)
                .WithMany(u => u.Recipes)
                .HasForeignKey(r => r.ApplicationUserId)
                .OnDelete(DeleteBehavior.Cascade); // Kaskadradering om användaren raderas

            // Konfigurera relationen mellan Recipe och Ingredients
            builder.Entity<Ingredient>()
                .HasOne(i => i.Recipe)
                .WithMany(r => r.Ingredients)
                .HasForeignKey(i => i.RecipeId)
                .OnDelete(DeleteBehavior.Cascade); // Kaskadradering om receptet raderas

            // Konfigurera relationen mellan Recipe och Instructions
            builder.Entity<Instruction>()
                .HasOne(ins => ins.Recipe)
                .WithMany(r => r.Instructions)
                .HasForeignKey(ins => ins.RecipeId)
                .OnDelete(DeleteBehavior.Cascade); // Kaskadradering om receptet raderas
        }

    }
}