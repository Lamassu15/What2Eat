using System;
using What2Eat.Models;

namespace What2Eat.service;

public interface IJwtService
{
    string GenerateAccessToken(ApplicationUser user, List<string> roles);
    Task<RefreshToken> GenerateRefreshTokenAsync(ApplicationUser user, string jwtId);
    // Validerar och roterar tokens
    Task<(string newAccessToken, RefreshToken newRefreshToken)> ValidateAndRotateTokensAsync(string accessToken, string refreshToken);
    Task RevokeRefreshTokenAsync(string refreshToken);
    string GetJwtIdFromToken(string token);

}
