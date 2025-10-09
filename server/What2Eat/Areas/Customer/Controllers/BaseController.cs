using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
public abstract class BaseController : ControllerBase
{
    protected string CurrentUserId => GetCurrentUserId();
    protected bool IsAdmin => User.IsInRole("Admin");
    
    private string GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException("User not authenticated");
        }
        return userId;
    }
    
    protected bool HasAccessToResource(string resourceOwnerId)
    {
        return resourceOwnerId == CurrentUserId || IsAdmin;
    }
}