using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using What2Eat.Models;
using Microsoft.AspNetCore.Hosting;
using What2Eat.service;

namespace What2Eat.Areas.Customer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager; // Ändrad till ApplicationUser
        private readonly SignInManager<ApplicationUser> _signInManager; // Ändrad till ApplicationUser
        private readonly IJwtService _jwtService;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _env;

        public AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, IConfiguration configuration, IWebHostEnvironment env, IJwtService jwtService) // Ändrad till ApplicationUser
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _jwtService = jwtService;
            _env = env;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] Register model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string? imagePath = null;

            if (model.ImgProfile != null)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "profile_images");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(model.ImgProfile.FileName);
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await model.ImgProfile.CopyToAsync(fileStream);
                }

                // Spara relativ sökväg (t.ex. /profile_images/123.jpg)
                imagePath = $"/profile_images/{uniqueFileName}";
            }

            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                ImgProfile = imagePath
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, "User");

                // Bygg full URL till profilbilden (bra för frontend)
                string? baseUrl = $"{Request.Scheme}://{Request.Host}";
                string? fullImageUrl = imagePath != null ? $"{baseUrl}{imagePath}" : null;

                // Returnera användardata till frontend
                return Ok(new
                {
                    Message = "Användare registrerad framgångsrikt!",
                    User = new
                    {
                        user.Id,
                        user.FirstName,
                        user.LastName,
                        user.Email,
                        user.UserName,
                        ImgProfile = fullImageUrl
                    }
                });
            }

            return BadRequest(result.Errors);
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return Unauthorized(new { Message = "Ogiltiga inloggningsuppgifter." });

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!result.Succeeded)
                return Unauthorized(new { Message = "Ogiltiga inloggningsuppgifter." });

            var userRoles = await _userManager.GetRolesAsync(user);
            // 1b. Generera Access Token via tjänsten (inkluderar JTI claim)
            var accessToken = _jwtService.GenerateAccessToken(user, userRoles.ToList());

            // 1c. Hämta JTI för att koppla Refresh Token
            var jwtId = _jwtService.GetJwtIdFromToken(accessToken);

            // --- STEG 2: GENERERA OCH SPARA REFRESH TOKEN ---
            // 2. Generera och spara Refresh Token i databasen via tjänsten
            var refreshTokenEntity = await _jwtService.GenerateRefreshTokenAsync(user, jwtId);

            // --- STEG 3: HANTERA COOKIES (Access Token) ---
            var accessTokenCookieOptions = new CookieOptions
            {
                HttpOnly = true, // KRITISK: Skydd mot XSS
                Secure = true,
                SameSite = SameSiteMode.None,
                // Livslängden för Access Token (kort) hämtas från JWT-datan (via tjänsten), inte hårdkodas här
                Expires = refreshTokenEntity.CreationDate.AddMinutes(double.Parse(_configuration["Jwt:AccessTokenLifetimeMinutes"] ?? "15"))
            };

            // Lägg till Access Token-cookien
            Response.Cookies.Append("accessToken", accessToken, accessTokenCookieOptions); // Notera bytet till "accessToken"

            // --- STEG 4: HANTERA COOKIES (Refresh Token) ---
            var refreshTokenCookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                // Livslängden för Refresh Token (lång)
                Expires = refreshTokenEntity.ExpiryDate
            };

            // Lägg till Refresh Token-cookien
            Response.Cookies.Append("refreshToken", refreshTokenEntity.Token, refreshTokenCookieOptions);

            return Ok(new { message = "Inloggning lyckades!" });
        }

        [HttpPost("logout")]
        [Authorize] // Kräver att användaren är autentiserad för att logga ut
        public async Task<IActionResult> Logout()
        {
            // 1. Hämta Refresh Token-värdet från cookien
            if (!HttpContext.Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
            {
                // Om refresh token saknas, fortsätt ändå för att rensa det lilla som finns
                return Ok(new { message = "Utloggning genomförd." });
            }

          
             // 2. SERVER-SIDA: Kritiskt steg! Ogiltigförklara Refresh Token i databasen.
             // Detta förhindrar återanvändning av den långlivade token.
             await _jwtService.RevokeRefreshTokenAsync(refreshToken);
     
             // Logga felet men fortsätt rensa cookies, då klienten ändå ska loggas ut.
             // Exempelvis: _logger.LogError(ex, "Kunde inte ogiltigförklara Refresh Token.");
     

            // 3. KLIENT-SIDA: Ta bort Access Token-cookien (din korta JWT)
            // OBS: Använd det korrekta namnet "accessToken" (inte "jwt" eller "refreshToken")
            Response.Cookies.Delete("accessToken");

            // 4. KLIENT-SIDA: Ta bort Refresh Token-cookien (din långlivade token)
            Response.Cookies.Delete("refreshToken");

            // 5. (Valfritt men ofarligt) SignOutAsync för Identity
            // Eftersom du använder JWT/cookies och inte Identitys session-cookies, är denna rad ofarlig 
            // men tillför inget värde och kan tas bort. 
            await _signInManager.SignOutAsync();

            return Ok(new { message = "Utloggning lyckades. Alla sessionscookies raderade." });
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            // 1. Hämta refreshToken från Cookies (accessToken kan vara utgången/ saknas)
            HttpContext.Request.Cookies.TryGetValue("accessToken", out var expiredAccessToken);
            if (!HttpContext.Request.Cookies.TryGetValue("refreshToken", out var oldRefreshToken))
            {
                // Om refresh token saknas, rensa och tvinga inloggning
                Response.Cookies.Delete("accessToken");
                Response.Cookies.Delete("refreshToken");
                return Unauthorized(new { Message = "Refresh token saknas." });
            }

            try
            {
                // 2. SERVER-SIDA: Validera den gamla token och rotera till nya tokens.
                // All tung logik (DB-sökning, validering, revokering, generering) sker inuti tjänsten.
                var (newAccessToken, newRefreshTokenEntity) =
                    await _jwtService.ValidateAndRotateTokensAsync(expiredAccessToken ?? string.Empty, oldRefreshToken);

                // --- 3. SKICKA TILLBAKA NYA COOKIES ---

                // a) Ny Access Token Cookie (Kort livslängd)
                var accessTokenCookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = !_env.IsDevelopment(),
                    SameSite = _env.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddMinutes(
                        double.Parse(_configuration["Jwt:AccessTokenLifetimeMinutes"] ?? "15")
                    )
                };
                Response.Cookies.Append("accessToken", newAccessToken, accessTokenCookieOptions);

                var refreshTokenCookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = !_env.IsDevelopment(),
                    SameSite = _env.IsDevelopment() ? SameSiteMode.Lax : SameSiteMode.Strict,
                    Expires = newRefreshTokenEntity.ExpiryDate
                };
                Response.Cookies.Append("refreshToken", newRefreshTokenEntity.Token, refreshTokenCookieOptions);

                // 4. Returnera framgång
                return Ok(new { message = "Tokens framgångsrikt förnyade." });
            }
            catch (SecurityTokenException ex)
            {
                // 5. Hantera Säkerhetsfel (t.ex. Token Reuse, ogiltig token, utgången refresh token)
                // Vid säkerhetsfel ska alla tokens rensas och klienten tvingas logga in på nytt.
                Response.Cookies.Delete("accessToken");
                Response.Cookies.Delete("refreshToken");
                // Logga felet (ex)
                return Unauthorized(new { Message = "Sessionsförnyelse misslyckades: " + ex.Message });
            }
        }

        // Exempel på en endpoint som kräver autentisering
        [HttpGet("protected")]
        [Authorize]
        public IActionResult Protected()
        {
            // Du kan nu hämta det anpassade fältet från claims om det lades till vid inloggning
            var imgProfileClaim = User.Claims.FirstOrDefault(c => c.Type == "ImgProfile")?.Value;
            var identityName = User.Identity?.Name ?? "användare";
            var responseMessage = $"Hej, {identityName}! Du har tillgång till skyddad data.";
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

            var userRoles = await _userManager.GetRolesAsync(user);

            // ✅ Bygg en full URL till bilden, om den finns
            string? fullImageUrl = null;
            if (!string.IsNullOrEmpty(user.ImgProfile))
            {
                fullImageUrl = $"{Request.Scheme}://{Request.Host}{user.ImgProfile}";
            }

            return Ok(new
            {
                id = user.Id,
                firstName = user.FirstName,
                lastName = user.LastName,
                email = user.Email,
                userName = user.UserName,
                imgProfile = fullImageUrl, // <--- här returneras full URL
                roles = userRoles
            });
        }

    }
}
