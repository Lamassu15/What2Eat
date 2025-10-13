using System;
using System.ComponentModel.DataAnnotations;

namespace What2Eat.Models;

public class RefreshToken
{
    public int id { get; set; }
    [Required]
    public required string Token { get; set; }
    [Required]
    public required string JwtId { get; set; }
    [Required]
    public DateTimeOffset CreationDate { get; set; }
    [Required]
    public DateTimeOffset ExpiryDate { get; set; }
    [Required]
    public bool IsRevoked { get; set; }
    [Required]
    public required string ApplicationUserId { get; set; }
    [Required]
    public ApplicationUser? ApplicationUser { get; set; }
}
