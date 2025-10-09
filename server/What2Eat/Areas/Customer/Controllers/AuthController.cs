using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using What2Eat.Models;

namespace What2Eat.Areas.Customer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager; // Ändrad till ApplicationUser
        private readonly SignInManager<ApplicationUser> _signInManager; // Ändrad till ApplicationUser
        private readonly IConfiguration _configuration;

        public AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, IConfiguration configuration) // Ändrad till ApplicationUser
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Register model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Skapa en instans av ApplicationUser och tilldela fält
            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,   // Tilldela det nya fältet
                LastName = model.LastName,     // Tilldela det nya fältet
                ImgProfile = model.ImgProfile
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                // Tilldela "User" rollen till nya användare som standard
                await _userManager.AddToRoleAsync(user, "User");
                return Ok(new { Message = "Användare registrerad framgångsrikt!" });
            }

            return BadRequest(result.Errors);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return Unauthorized(new { Message = "Ogiltiga inloggningsuppgifter." });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);

            if (result.Succeeded)
            {
                var userRoles = await _userManager.GetRolesAsync(user);
                var authClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };

                // Lägg till ImgProfile som en claim om det finns
                if (!string.IsNullOrEmpty(user.ImgProfile))
                {
                    authClaims.Add(new Claim("ImgProfile", user.ImgProfile));
                }

                foreach (var userRole in userRoles)
                {
                    authClaims.Add(new Claim(ClaimTypes.Role, userRole));
                }

                var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

                var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    audience: _configuration["Jwt:Audience"],
                    expires: DateTime.Now.AddHours(3), // Token giltigt i 3 timmar
                    claims: authClaims,
                    signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
                );

                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    expiration = token.ValidTo,
                    message = "Inloggning lyckades!"
                });
            }

            return Unauthorized(new { Message = "Ogiltiga inloggningsuppgifter." });
        }

        [HttpPost("logout")]
        [Authorize] // Kräver att användaren är autentiserad för att logga ut
        public async Task<IActionResult> Logout()
        {
            // För JWT-baserade API:er är "utloggning" primärt en klient-sidig operation där klienten tar bort token.
            // Servern kan dock ogiltigförklara token om du implementerar en blocklist/revocation-mekanism,
            // men det är utanför ramen för denna grundläggande guide.
            // För enkelhetens skull returnerar vi bara en framgångsmeddelande.
            await _signInManager.SignOutAsync();
            return Ok(new { Message = "Utloggning lyckades (token bör tas bort på klientsidan)." });
        }

        // Exempel på en endpoint som kräver autentisering
        [HttpGet("protected")]
        [Authorize]
        public IActionResult Protected()
        {
            // Du kan nu hämta det anpassade fältet från claims om det lades till vid inloggning
            var imgProfileClaim = User.Claims.FirstOrDefault(c => c.Type == "ImgProfile")?.Value;
            var responseMessage = $"Hej, {User.Identity.Name}! Du har tillgång till skyddad data.";
            if (!string.IsNullOrEmpty(imgProfileClaim))
            {
                responseMessage += $" Din profilbild är: {imgProfileClaim}";
            }
            var roles = User.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToList();
            
            return Ok(new { message = responseMessage, roles = roles });
        }

        // Exempel på en endpoint som kräver "Admin" roll
        [HttpGet("admin-only")]
        [Authorize(Roles = "Admin")]
        public IActionResult AdminOnly()
        {
            return Ok("Hej, Admin! Du har tillgång till admin-specifik data.");
        }

        // Exempel på en endpoint som kräver "User" roll
        [HttpGet("user-only")]
        [Authorize(Roles = "User")]
        public IActionResult UserOnly()
        {
            return Ok("Hej, User! Du har tillgång till användar-specifik data.");
        }

        // Endpoint för att tilldela en roll till en användare (endast för Admin)
        [HttpPost("assign-role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignRole([FromQuery] string email, [FromQuery] string roleName)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return NotFound(new { Message = "Användaren hittades inte." });
            }

            if (!await _userManager.IsInRoleAsync(user, roleName))
            {
                var result = await _userManager.AddToRoleAsync(user, roleName);
                if (result.Succeeded)
                {
                    return Ok(new { Message = $"Rollen '{roleName}' tilldelades användaren '{email}'." });
                }
                return BadRequest(result.Errors);
            }
            return Ok(new { Message = $"Användaren '{email}' har redan rollen '{roleName}'." });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "Ingen användare i token." });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { Message = "Användaren hittades inte." });
            }

                // This is the key line to get the user's roles.
    var userRoles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                id = user.Id,
                firstName = user.FirstName,
                lastName = user.LastName,
                email = user.Email,
                userName = user.UserName,
                imgProfile = user.ImgProfile,
                // get what role user has
                roles = userRoles
            });
        }
    }
}
