using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using What2Eat.service;
using Microsoft.AspNetCore.Identity;
using What2Eat.Data.Data;
using What2Eat.Models;

public class JwtService : IJwtService
{
    private readonly ApplicationDbContext _context; // Ersätt med din DbContext
    private readonly IConfiguration _configuration;
    private readonly SymmetricSecurityKey _signingKey;
    private readonly UserManager<ApplicationUser> _userManager;

    // Antar att ApplicationUser och RefreshToken är definierade i YourProject.Models

    public JwtService(ApplicationDbContext context, IConfiguration configuration, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _configuration = configuration;
        _userManager = userManager;
        // Hämta säkerhetsnyckeln från konfigurationen
        var key = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key saknas i konfigurationen.");
        _signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
    }

    // --- 1. GENERERA ACCESS TOKEN ---
    public string GenerateAccessToken(ApplicationUser user, List<string> roles)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.UserName ?? user.Id),
            // Denna är KRITISK för att koppla Refresh Token till Access Token
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        // Lägg till roller som claims
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            // Konfigurera giltighetstiden (t.ex. 15 minuter)
            Expires = DateTimeOffset.UtcNow.AddMinutes(double.Parse(_configuration["Jwt:AccessTokenLifetimeMinutes"] ?? "15")).UtcDateTime,
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    // --- 2. GENERERA OCH SPARA REFRESH TOKEN ---
    public async Task<RefreshToken> GenerateRefreshTokenAsync(ApplicationUser user, string jwtId)
    {
        var refreshToken = new RefreshToken
        {
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)), // Genererar en kryptografiskt säker sträng
            JwtId = jwtId,
            CreationDate = DateTimeOffset.UtcNow,
            // Konfigurera Refresh Token giltighetstid (t.ex. 7 dagar)
            ExpiryDate = DateTimeOffset.UtcNow.AddDays(double.Parse(_configuration["Jwt:RefreshTokenLifetimeDays"] ?? "7")),
            IsRevoked = false,
            ApplicationUserId = user.Id
        };

        // Lägg till och spara i databasen
        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return refreshToken;
    }

    // --- 3. VALIDERING OCH ROTATION (Hjärtat i logiken) ---
    public async Task<(string newAccessToken, RefreshToken newRefreshToken)> ValidateAndRotateTokensAsync(string expiredAccessToken, string oldRefreshToken)
    {
        // 1. Försök hitta Refresh Token i databasen
        var storedToken = await _context.RefreshTokens
            .Include(rt => rt.ApplicationUser)
            .SingleOrDefaultAsync(rt => rt.Token == oldRefreshToken);

        // --- VALIDERINGSSTEG ---
        if (storedToken == null)
        {
            throw new SecurityTokenException("Ogiltig Refresh Token.");
        }
        if (storedToken.IsRevoked)
        {
            // Revokera alla Refresh Tokens för användaren om en redan ogiltig token används (möjlig attack)
            await RevokeAllUserRefreshTokensAsync(storedToken.ApplicationUserId);
            throw new SecurityTokenException("Refresh Token har återkallats.");
        }
        if (storedToken.ExpiryDate < DateTimeOffset.UtcNow)
        {
            // Token har löpt ut
            throw new SecurityTokenException("Refresh Token har löpt ut.");
        }

        // 2. EXTRAHERA CLAIMS FRÅN GAMMAL ACCESS TOKEN FÖR ATT KONTROLLERA KOPPLING (Rotation)
        // Om klienten inte skickade en (utgången) access token, hoppa över JTI-matchningen.
        // Detta hanterar scenariot där accessToken-cookien saknas (t.ex. efter utgång) men
        // refreshToken fortfarande är giltig.
        if (!string.IsNullOrEmpty(expiredAccessToken))
        {
            var jtiFromAccess = GetJwtIdFromToken(expiredAccessToken);

            // Kontrollera att Refresh Token matchar den Access Token den skapades för
            if (storedToken.JwtId != jtiFromAccess)
            {
                // Möjlig Reuse Attack. Revokera allt!
                await RevokeAllUserRefreshTokensAsync(storedToken.ApplicationUserId);
                throw new SecurityTokenException("Token mismatch: Token Reuse Detected.");
            }
        }

        // --- ROTATIONSSTEG ---

        // 3. ÅTERKALLA (Revoke) den gamla Refresh Token i databasen
        storedToken.IsRevoked = true;

        // 4. GENERERA NY Access Token och hämta de aktuella rollerna
        var user = storedToken.ApplicationUser;
        if (user == null)
        {
            // Om användaren som är kopplad till refresh token saknas, avvisa
            throw new SecurityTokenException("Användare kopplad till refresh token hittades inte.");
        }

        // Hämta roller via UserManager
        var userRoles = await _userManager.GetRolesAsync(user);

        var newAccessToken = GenerateAccessToken(user, userRoles.ToList());
        var newJwtId = GetJwtIdFromToken(newAccessToken);

        // 5. GENERERA och SPARA NY Refresh Token
        var newRefreshTokenEntity = await GenerateRefreshTokenAsync(user, newJwtId);

        // Spara ändringarna (revokering av gammal token)
        await _context.SaveChangesAsync();

        return (newAccessToken, newRefreshTokenEntity);
    }

    // --- 4. REVOKE REFRESH TOKEN (Vid Utloggning) ---
    public async Task RevokeRefreshTokenAsync(string refreshToken)
    {
        var storedToken = await _context.RefreshTokens
            .SingleOrDefaultAsync(rt => rt.Token == refreshToken);

        if (storedToken != null && !storedToken.IsRevoked)
        {
            storedToken.IsRevoked = true;
            await _context.SaveChangesAsync();
        }
    }

    // --- 5. HJÄLPMETODER ---

    // Extraherar JTI Claim (JwtId) från en Access Token
    public string GetJwtIdFromToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = _signingKey,
            ValidateIssuer = true,
            ValidIssuer = _configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = _configuration["Jwt:Audience"],
            ValidateLifetime = false // MÅSTE VARA FALSE, eftersom vi skickar en utgången token!
        }, out SecurityToken securityToken);

        var jwtSecurityToken = securityToken as JwtSecurityToken;
        if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
        {
            throw new SecurityTokenException("Ogiltig token format eller algoritm.");
        }

        var jti = principal.FindFirstValue(JwtRegisteredClaimNames.Jti);
        if (string.IsNullOrEmpty(jti))
        {
            throw new SecurityTokenException("JTI saknas i token.");
        }
        return jti;
    }

    // Hjälpmetod för att återkalla alla tokens för en användare
    private async Task RevokeAllUserRefreshTokensAsync(string ApplicationUserId)
    {
        var tokens = await _context.RefreshTokens
            .Where(rt => rt.ApplicationUserId == ApplicationUserId && !rt.IsRevoked)
            .ToListAsync();

        foreach (var token in tokens)
        {
            token.IsRevoked = true;
        }
        await _context.SaveChangesAsync();
    }
}