using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace What2Eat.Models
{
    public class ApplicationUser : IdentityUser
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public string? ImgProfile { get; set; }

        // Navigation properties for related entities can be added here
        public virtual ICollection<Recipe>? Recipes { get; set; }
        public ICollection<RefreshToken>? RefreshTokens { get; set; }
    }
}
